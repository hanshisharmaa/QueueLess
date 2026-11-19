/**
 * Local demo backend.
 *
 * A tiny in-browser stand-in for the parts of the Supabase client this app uses
 * (auth, table selects/updates, the generate_token RPC and realtime channels).
 * Data lives in localStorage, so the app runs with no server and no API keys.
 * A simulator advances active queues every few seconds so tracking looks live.
 */
import { DEMO_CENTRES, DEMO_SERVICES } from './demoData';

type Row = Record<string, unknown>;
type Tables = Record<string, Row[]>;

interface DemoUser {
  id: string;
  email: string;
  password: string;
  full_name: string;
  role: 'customer' | 'admin';
  created_at: string;
}

const DB_KEY = 'queueless-demo-db-v3'; // bump to reseed after changing demoData
const USERS_KEY = 'queueless-demo-users-v1';
const SESSION_KEY = 'queueless-demo-session-v1';
const TICK_MS = 8000;

const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — keep running in memory */
  }
}

function seed(): Tables {
  const now = new Date().toISOString();
  return {
    service_centres: DEMO_CENTRES.map((c) => ({ ...c, created_at: now })),
    services: DEMO_SERVICES.map((s) => ({ id: uid(), created_at: now, ...s })),
    queue_tokens: [],
    queue_updates: [],
    profiles: [],
  };
}

let db: Tables = readJson<Tables | null>(DB_KEY, null) ?? seed();
const save = () => writeJson(DB_KEY, db);
save();

// ---------------------------------------------------------------- realtime
type Listener = () => void;
const channels = new Set<{ listeners: Listener[] }>();
function notify() {
  save();
  // defer so callers finish their own state updates first
  setTimeout(() => channels.forEach((ch) => ch.listeners.forEach((l) => l())), 0);
}

// ---------------------------------------------------------------- auth
type Session = { user: { id: string; email: string }; access_token: string };
type AuthEvent = 'SIGNED_IN' | 'SIGNED_OUT';
const authListeners = new Set<(event: AuthEvent, session: Session | null) => void>();
let session: Session | null = readJson<Session | null>(SESSION_KEY, null);

function setSession(next: Session | null, event: AuthEvent) {
  session = next;
  if (next) writeJson(SESSION_KEY, next);
  else localStorage.removeItem(SESSION_KEY);
  authListeners.forEach((l) => l(event, next));
}

const users = () => readJson<DemoUser[]>(USERS_KEY, []);

function syncProfiles() {
  db.profiles = users().map((u) => ({
    id: u.id, email: u.email, full_name: u.full_name, role: u.role, created_at: u.created_at,
  }));
}
syncProfiles();

const auth = {
  async getSession() {
    return { data: { session }, error: null };
  },
  onAuthStateChange(cb: (event: AuthEvent, session: Session | null) => void) {
    authListeners.add(cb);
    return { data: { subscription: { unsubscribe: () => authListeners.delete(cb) } } };
  },
  async signUp({ email, password, options }: { email: string; password: string; options?: { data?: { full_name?: string; role?: string } } }) {
    const list = users();
    const normalized = email.trim().toLowerCase();
    if (list.some((u) => u.email === normalized)) {
      return { data: null, error: new Error('User already registered') };
    }
    const user: DemoUser = {
      id: uid(),
      email: normalized,
      password,
      full_name: options?.data?.full_name ?? '',
      role: options?.data?.role === 'admin' ? 'admin' : 'customer',
      created_at: new Date().toISOString(),
    };
    writeJson(USERS_KEY, [...list, user]);
    syncProfiles();
    const s = { user: { id: user.id, email: user.email }, access_token: uid() };
    setSession(s, 'SIGNED_IN');
    return { data: { user: s.user, session: s }, error: null };
  },
  async signInWithPassword({ email, password }: { email: string; password: string }) {
    const user = users().find((u) => u.email === email.trim().toLowerCase() && u.password === password);
    if (!user) return { data: null, error: new Error('Invalid login credentials') };
    const s = { user: { id: user.id, email: user.email }, access_token: uid() };
    setSession(s, 'SIGNED_IN');
    return { data: { user: s.user, session: s }, error: null };
  },
  async signOut() {
    setSession(null, 'SIGNED_OUT');
    return { error: null };
  },
};

// ---------------------------------------------------------------- query builder
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- mirrors supabase-js's loosely typed results
type Result = { data: any; error: Error | null; count?: number | null };

class Query implements PromiseLike<Result> {
  private filters: ((r: Row) => boolean)[] = [];
  private sort: { col: string; asc: boolean } | null = null;
  private max: number | null = null;
  private single = false;
  private headCount = false;
  private patch: Row | null = null;

  constructor(private table: string) {}

  select(...args: [string?, { count?: string; head?: boolean }?]) {
    const opts = args[1];
    if (opts?.head) this.headCount = true;
    return this;
  }
  update(values: Row) {
    this.patch = values;
    return this;
  }
  eq(col: string, value: unknown) {
    this.filters.push((r) => r[col] === value);
    return this;
  }
  in(col: string, values: unknown[]) {
    this.filters.push((r) => values.includes(r[col]));
    return this;
  }
  order(col: string, opts?: { ascending?: boolean }) {
    this.sort = { col, asc: opts?.ascending ?? true };
    return this;
  }
  limit(n: number) {
    this.max = n;
    return this;
  }
  maybeSingle() {
    this.single = true;
    return this;
  }

  private run(): Result {
    let rows = (db[this.table] ?? []).filter((r) => this.filters.every((f) => f(r)));

    if (this.patch) {
      const patch = { ...this.patch };
      if (this.table === 'queue_tokens' && (patch.status === 'cancelled' || patch.status === 'completed')) {
        patch.completed_at = new Date().toISOString();
      }
      rows.forEach((r) => Object.assign(r, patch));
      notify();
      return { data: rows, error: null };
    }

    if (this.sort) {
      const { col, asc } = this.sort;
      rows = [...rows].sort((a, b) => {
        const x = a[col] as string | number;
        const y = b[col] as string | number;
        return (x < y ? -1 : x > y ? 1 : 0) * (asc ? 1 : -1);
      });
    }
    if (this.max != null) rows = rows.slice(0, this.max);
    if (this.headCount) return { data: null, error: null, count: rows.length };
    const copy = rows.map((r) => ({ ...r }));
    return { data: this.single ? copy[0] ?? null : copy, error: null };
  }

  then<A = Result, B = never>(
    onfulfilled?: ((value: Result) => A | PromiseLike<A>) | null,
    onrejected?: ((reason: unknown) => B | PromiseLike<B>) | null
  ): PromiseLike<A | B> {
    return Promise.resolve().then(() => this.run()).then(onfulfilled, onrejected);
  }
}

// ---------------------------------------------------------------- queue logic
const today = () => new Date().toISOString().slice(0, 10);
const isActive = (t: Row) =>
  (t.status === 'waiting' || t.status === 'called') && String(t.generated_at).slice(0, 10) === today();

function queueStatusFor(waiting: number) {
  return waiting >= 8 ? 'busy' : waiting >= 4 ? 'moderate' : 'low';
}

function generateToken(centreId: string): Result {
  if (!session) return { data: null, error: new Error('Please sign in to generate a token.') };
  const centre = db.service_centres.find((c) => c.id === centreId);
  if (!centre) return { data: null, error: new Error('Centre not found') };
  if (!centre.is_open) return { data: null, error: new Error('This centre is currently closed') };

  const active = db.queue_tokens.filter((t) => t.centre_id === centreId && isActive(t));
  if (active.some((t) => t.user_id === session!.user.id)) {
    return { data: null, error: new Error('You already have an active token for this centre') };
  }

  const ahead = Number(centre.base_waiting ?? 0) + active.length;
  const lastNumber = Math.max(
    Number(centre.currently_serving) + Number(centre.base_waiting ?? 0),
    ...active.map((t) => Number(t.token_number))
  );
  const token: Row = {
    id: uid(),
    centre_id: centreId,
    user_id: session.user.id,
    token_number: lastNumber + 1,
    people_ahead: ahead,
    initial_ahead: ahead,
    est_wait_minutes: ahead * Number(centre.avg_service_time),
    status: ahead === 0 ? 'called' : 'waiting',
    generated_at: new Date().toISOString(),
    completed_at: null,
  };
  db.queue_tokens.push(token);
  db.queue_updates.push({
    id: uid(), centre_id: centreId, token_id: token.id,
    message: `Token ${token.token_number} generated`, created_at: token.generated_at,
  });
  centre.queue_status = queueStatusFor(ahead + 1);
  notify();
  return { data: { ...token }, error: null };
}

/** Simulates the counter serving people: each tick, every active queue moves one step. */
function tick() {
  let changed = false;
  for (const centre of db.service_centres) {
    if (!centre.is_open) continue;
    const active = db.queue_tokens
      .filter((t) => t.centre_id === centre.id && isActive(t))
      .sort((a, b) => Number(a.token_number) - Number(b.token_number));
    if (active.length === 0) continue;

    // a 'called' token gets served after one tick
    const called = active.find((t) => t.status === 'called');
    if (called) {
      called.status = 'completed';
      called.completed_at = new Date().toISOString();
    }
    centre.currently_serving = Number(centre.currently_serving) + 1;
    if (Number(centre.base_waiting) > 0) centre.base_waiting = Number(centre.base_waiting) - 1;

    for (const t of active) {
      if (t.status !== 'waiting') continue;
      const ahead = Math.max(0, Number(t.people_ahead) - 1);
      t.people_ahead = ahead;
      t.est_wait_minutes = ahead * Number(centre.avg_service_time);
      if (ahead === 0) t.status = 'called';
    }
    const remaining = db.queue_tokens.filter((t) => t.centre_id === centre.id && isActive(t)).length;
    centre.queue_status = queueStatusFor(Number(centre.base_waiting) + remaining);
    changed = true;
  }
  if (changed) notify();
}
setInterval(tick, TICK_MS);

// ---------------------------------------------------------------- client
export const localClient = {
  auth,
  from(table: string) {
    return new Query(table);
  },
  async rpc(fn: string, args: { p_centre_id: string }): Promise<Result> {
    if (fn === 'generate_token') return generateToken(args.p_centre_id);
    return { data: null, error: new Error(`Unknown function ${fn}`) };
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- name kept for API compatibility
  channel(_name?: string) {
    const ch = {
      listeners: [] as Listener[],
      on(...args: [string, unknown, Listener]) {
        ch.listeners.push(args[2]);
        return ch;
      },
      subscribe() {
        channels.add(ch);
        return ch;
      },
    };
    return ch;
  },
  removeChannel(ch: { listeners: Listener[] }) {
    channels.delete(ch);
  },
};

/** Wipes demo data (used by the "Reset demo" button). */
export function resetDemoData() {
  db = seed();
  syncProfiles();
  notify();
}
