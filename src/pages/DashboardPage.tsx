import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Clock4, MapPin, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCentres, useMyTokens } from '../hooks/useCentres';
import { CATEGORY_LABELS, formatDateTime, tokenStatusColor } from '../lib/types';
import type { Category, ServiceCentre } from '../lib/types';
import { supabase } from '../lib/supabaseClient';
import { CentreCard } from '../components/CentreCard';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Spinner';
import { cn } from '../lib/cn';

export function DashboardPage() {
  const { session, profile } = useAuth();
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [search, setSearch] = useState('');
  const { centres, all: allCentres, loading: centresLoading, error } = useCentres({ category, search });
  const { tokens, loading: tokensLoading } = useMyTokens(session?.user?.id);
  const [centreMap, setCentreMap] = useState<Record<string, ServiceCentre>>({});

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('service_centres').select('*');
      const map: Record<string, ServiceCentre> = {};
      for (const c of (data ?? []) as ServiceCentre[]) map[c.id] = c;
      setCentreMap(map);
    };
    load();
  }, [tokens]);

  const activeToken = useMemo(
    () =>
      tokens.find(
        (t) =>
          (t.status === 'waiting' || t.status === 'called') &&
          t.generated_at.slice(0, 10) === new Date().toISOString().slice(0, 10)
      ),
    [tokens]
  );

  const history = useMemo(() => tokens.filter((t) => t.id !== activeToken?.id).slice(0, 5), [tokens, activeToken]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  if (!session?.user) return null;

  const openCount = allCentres.filter((c) => c.is_open).length;
  const waitingCount = allCentres.reduce((sum, c) => sum + (c.is_open ? c.people_waiting : 0), 0);
  const activeCentre = activeToken ? centreMap[activeToken.centre_id] : undefined;
  const initial = activeToken?.initial_ahead ?? activeToken?.people_ahead ?? 0;
  const progress = activeToken
    ? activeToken.status === 'called'
      ? 100
      : Math.round(((initial - activeToken.people_ahead) / (initial + 1)) * 100)
    : 0;

  return (
    <div className="container-app space-y-16 py-10 lg:py-14">
      {/* Header + active token */}
      <section className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-end">
        <div>
          <p className="eyebrow">Your dashboard</p>
          <h1 className="mt-4 text-4xl font-medium text-navy-950 sm:text-5xl">
            {greeting}, {profile?.full_name?.split(' ')[0] || 'there'}.
          </h1>
          <p className="mt-3 max-w-md text-lg text-navy-500">
            {activeToken
              ? 'Your token is live. We will show it here until you are served.'
              : 'No active token right now. Pick a centre to join its queue.'}
          </p>
          <dl className="mt-8 grid max-w-md grid-cols-3 gap-6 border-t border-navy-100 pt-6">
            {[
              { value: openCount, label: 'centres open' },
              { value: waitingCount, label: 'people waiting' },
              { value: tokens.length, label: 'your tokens' },
            ].map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-display text-3xl font-medium text-navy-950">{s.value}</dd>
                <dd className="mt-1 text-sm text-navy-500">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Ticket */}
        {tokensLoading ? (
          <Skeleton className="h-64 w-full rounded-2xl" />
        ) : activeToken ? (
          <Link
            to={`/track/${activeToken.id}`}
            className="group block rounded-2xl bg-navy-950 p-7 text-white transition duration-200 hover:-translate-y-0.5 hover:shadow-glow"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-navy-400">Active token</p>
                <p className="mt-2 text-sm text-navy-300">{activeCentre?.name ?? 'Loading centre…'}</p>
              </div>
              <span
                className={cn(
                  'badge',
                  activeToken.status === 'called' ? 'bg-amber-400/15 text-amber-300' : 'bg-white/10 text-electric-200'
                )}
              >
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full animate-pulse-soft',
                    activeToken.status === 'called' ? 'bg-amber-300' : 'bg-electric-300'
                  )}
                />
                {activeToken.status === 'called' ? 'Your turn' : 'Waiting'}
              </span>
            </div>
            <p className="mt-5 font-mono text-6xl font-medium tracking-tight">
              {activeCentre?.name?.[0] ?? 'Q'}-{activeToken.token_number}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-5 text-sm">
              <div>
                <p className="text-navy-400">People ahead</p>
                <p className="mt-0.5 font-mono text-lg text-white">{activeToken.people_ahead}</p>
              </div>
              <div>
                <p className="text-navy-400">Estimated wait</p>
                <p className="mt-0.5 font-mono text-lg text-white">~{activeToken.est_wait_minutes} min</p>
              </div>
            </div>
            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className={cn('h-full rounded-full transition-all duration-700', activeToken.status === 'called' ? 'bg-amber-300' : 'bg-electric-300')}
                style={{ width: `${Math.max(progress, 4)}%` }}
              />
            </div>
            <p className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-electric-200">
              Track live
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </p>
          </Link>
        ) : (
          <div className="rounded-2xl border border-dashed border-navy-200 bg-white p-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-navy-400">Active token</p>
            <p className="mt-4 font-display text-2xl font-medium text-navy-950">None yet</p>
            <p className="mt-2 text-navy-500">Take a token at any open centre and it will appear here.</p>
            <Link to="/explore" className="btn-primary mt-6">
              Find a centre
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </section>

      {/* Centres */}
      <section>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-2xl font-medium text-navy-950 sm:text-3xl">Centres and their queues</h2>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search centres…"
              className="input pl-10"
              aria-label="Search service centres"
            />
          </div>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
          {(['all', ...Object.keys(CATEGORY_LABELS)] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat as Category | 'all')}
              className={cn(
                'shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition',
                category === cat
                  ? 'border-navy-950 bg-navy-950 text-white'
                  : 'border-navy-200 bg-white text-navy-700 hover:border-navy-400'
              )}
            >
              {cat === 'all' ? 'All' : CATEGORY_LABELS[cat as Category]}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
            Something went wrong loading centres: {error}
          </div>
        )}

        {centresLoading ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        ) : centres.length === 0 ? (
          <div className="mt-6">
            <EmptyState icon={MapPin} title="No centres match your filters" description="Try a different category or clear your search." />
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {centres.slice(0, 6).map((c) => (
              <CentreCard key={c.id} centre={c} peopleWaiting={c.people_waiting} />
            ))}
          </div>
        )}
        {centres.length > 6 && (
          <Link to="/explore" className="group mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-electric-700">
            See all {centres.length} centres
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        )}
      </section>

      {/* Recent tokens */}
      <section>
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-medium text-navy-950 sm:text-3xl">Recent tokens</h2>
          {tokens.length > 0 && (
            <Link to="/history" className="text-sm font-medium text-electric-700 hover:text-electric-800">
              Full history
            </Link>
          )}
        </div>
        {history.length === 0 ? (
          <div className="mt-6">
            <EmptyState icon={Clock4} title="No past tokens yet" description="Tokens you have finished or cancelled will be listed here." />
          </div>
        ) : (
          <ul className="mt-6 divide-y divide-navy-100 overflow-hidden rounded-2xl border border-navy-100 bg-white">
            {history.map((t) => {
              const centre = centreMap[t.centre_id];
              return (
                <li key={t.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <span className="w-14 font-mono text-lg text-navy-950">#{t.token_number}</span>
                    <div>
                      <p className="font-medium text-navy-950">{centre?.name ?? 'Centre'}</p>
                      <p className="text-sm text-navy-500">
                        {centre ? `${CATEGORY_LABELS[centre.category]} · ` : ''}
                        {formatDateTime(t.generated_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:justify-end">
                    <span className={`badge capitalize ${tokenStatusColor(t.status)}`}>{t.status}</span>
                    {centre && (
                      <Link to={`/centre/${centre.id}`} className="btn-secondary !px-3 !py-1.5 text-xs">
                        Visit again
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
