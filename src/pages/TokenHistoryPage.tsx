import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, QrCode } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { formatDateTime, tokenStatusColor } from '../lib/types';
import type { QueueToken, ServiceCentre } from '../lib/types';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Spinner';

export function TokenHistoryPage() {
  const { session } = useAuth();
  const [tokens, setTokens] = useState<QueueToken[]>([]);
  const [centres, setCentres] = useState<Record<string, ServiceCentre>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    if (!session?.user) return;
    let cancelled = false;

    const load = async () => {
      const [{ data: toks }, { data: cs }] = await Promise.all([
        supabase
          .from('queue_tokens')
          .select('*')
          .eq('user_id', session.user.id)
          .order('generated_at', { ascending: false })
          .limit(100),
        supabase.from('service_centres').select('*'),
      ]);
      if (cancelled) return;
      setTokens((toks ?? []) as QueueToken[]);
      const map: Record<string, ServiceCentre> = {};
      for (const c of (cs ?? []) as ServiceCentre[]) map[c.id] = c;
      setCentres(map);
      setLoading(false);
    };

    load();

    const channel = supabase
      .channel(`history-${session.user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'queue_tokens', filter: `user_id=eq.${session.user.id}` }, () => load())
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [session?.user]);

  const filtered = useMemo(() => {
    if (filter === 'all') return tokens;
    if (filter === 'active') return tokens.filter((t) => t.status === 'waiting' || t.status === 'called');
    return tokens.filter((t) => t.status === filter);
  }, [tokens, filter]);

  if (!session?.user) return null;

  return (
    <div className="container-app max-w-4xl space-y-8 py-10">
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-500 transition hover:text-navy-950">
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">History</p>
          <h1 className="mt-3 text-4xl font-medium text-navy-950">Your tokens</h1>
          <p className="mt-2 text-navy-500">Every token you have taken, newest first.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(['all', 'active', 'completed', 'cancelled'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium capitalize transition ${
                filter === f ? 'border-navy-950 bg-navy-950 text-white' : 'border-navy-200 bg-white text-navy-700 hover:border-navy-400'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={QrCode}
          title="No tokens here yet"
          description="Generate a digital token from any service centre to start your history."
          action={<Link to="/explore" className="btn-primary">Explore Centres</Link>}
        />
      ) : (
        <div className="divide-y divide-navy-100 overflow-hidden rounded-2xl border border-navy-100 bg-white">
          {filtered.map((t) => {
            const c = centres[t.centre_id];
            return (
              <div key={t.id} className="flex flex-col gap-3 px-5 py-4 transition hover:bg-navy-50/60 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <span className="w-16 shrink-0 font-mono text-lg text-navy-950">
                    {c?.name?.[0] ?? 'Q'}-{t.token_number}
                  </span>
                  <div>
                    <p className="font-medium text-navy-950">{c?.name ?? 'Service centre'}</p>
                    <p className="text-sm text-navy-500">
                      {formatDateTime(t.generated_at)}
                      {t.completed_at ? ` · completed ${formatDateTime(t.completed_at)}` : ''}
                    </p>
                    <p className="text-xs text-navy-400">
                      {t.initial_ahead ?? t.people_ahead} ahead at issue
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:justify-end">
                  <span className={`badge capitalize ${tokenStatusColor(t.status)}`}>{t.status}</span>
                  {t.status === 'waiting' || t.status === 'called' ? (
                    <Link to={`/track/${t.id}`} className="btn-primary !px-3 !py-1.5 text-xs">
                      Track live
                    </Link>
                  ) : c ? (
                    <Link to={`/centre/${c.id}`} className="btn-secondary !px-3 !py-1.5 text-xs">
                      Visit again
                    </Link>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
