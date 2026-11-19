import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, BellRing, CheckCircle2, MapPin, ScanLine, Timer, XCircle,
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatDateTime, tokenStatusColor } from '../lib/types';
import type { QueueToken, ServiceCentre } from '../lib/types';
import { QrVisual } from '../components/QrVisual';
import { Skeleton } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { cn } from '../lib/cn';

export function TrackQueuePage() {
  const { tokenId } = useParams<{ tokenId: string }>();
  const { session } = useAuth();
  const toast = useToast();
  const [token, setToken] = useState<QueueToken | null>(null);
  const [centre, setCentre] = useState<ServiceCentre | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => {
    if (!session?.user || !tokenId) return;
    let cancelled = false;

    const load = async () => {
      const { data: t, error } = await supabase
        .from('queue_tokens')
        .select('*')
        .eq('id', tokenId)
        .maybeSingle();
      if (cancelled) return;
      if (error || !t) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const tok = t as QueueToken;
      setToken(tok);
      const { data: c } = await supabase
        .from('service_centres')
        .select('*')
        .eq('id', tok.centre_id)
        .maybeSingle();
      if (!cancelled) {
        setCentre((c as ServiceCentre) ?? null);
        setLoading(false);
      }
    };

    load();

    const channel = supabase
      .channel(`track-${tokenId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'queue_tokens', filter: `id=eq.${tokenId}` }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'queue_tokens' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_centres' }, () => load())
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [session?.user, tokenId]);

  const progress = useMemo(() => {
    if (!token) return 0;
    if (token.status !== 'waiting') return 100;
    // Progress = people served since the token was issued / (initial ahead + 1)
    const initial = token.initial_ahead ?? token.people_ahead;
    return Math.min(100, Math.round(((initial - token.people_ahead) / (initial + 1)) * 100));
  }, [token]);

  if (!session?.user) {
    return (
      <div className="container-app py-16">
        <EmptyState
          icon={ScanLine}
          title="Sign in to track your token"
          description="Queue tracking is tied to your account so only you can see your spot."
          action={<Link to="/login" className="btn-primary">Sign In</Link>}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container-app max-w-3xl space-y-6 py-8">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (notFound || !token) {
    return (
      <div className="container-app py-16">
        <EmptyState
          icon={XCircle}
          title="Token not found"
          description="This token may have been removed or belongs to another account."
          action={<Link to="/dashboard" className="btn-primary">Back to Dashboard</Link>}
        />
      </div>
    );
  }

  const isActive = token.status === 'waiting' || token.status === 'called';

  const cancelToken = async () => {
    const { error } = await supabase
      .from('queue_tokens')
      .update({ status: 'cancelled' })
      .eq('id', token.id)
      .eq('user_id', session.user.id);
    if (error) {
      toast('Could not cancel the token. Please try again.', 'error');
    } else {
      toast('Token cancelled. Your queue spot has been released.', 'info');
      setConfirmCancel(false);
    }
  };

  return (
    <div className="container-app max-w-3xl space-y-6 py-10">
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-500 transition hover:text-navy-950">
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <section className="overflow-hidden rounded-2xl border border-navy-100 bg-white">
        <div className="bg-navy-950 p-7 text-white sm:p-9">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-navy-400">Now tracking</p>
              <p className="mt-2 text-navy-200">{centre?.name}</p>
              <p className="mt-4 font-mono text-7xl font-medium tracking-tight">
                {centre?.name?.[0] ?? 'Q'}-{token.token_number}
              </p>
              <p className="mt-2 text-sm text-navy-400">Issued {formatDateTime(token.generated_at)}</p>
            </div>
            <div className="w-fit rounded-xl bg-white p-2.5">
              <div className="h-24 w-24">
                <QrVisual />
              </div>
            </div>
          </div>
        </div>

        <dl className="grid grid-cols-2 border-b border-navy-100 lg:grid-cols-4">
          {[
            { label: 'Now serving', value: `#${centre?.currently_serving || '—'}` },
            { label: 'People ahead', value: token.people_ahead },
            { label: 'Estimated wait', value: `~${token.est_wait_minutes} min` },
            { label: 'Your position', value: `#${token.people_ahead + 1}` },
          ].map((s, i) => (
            <div
              key={s.label}
              className={cn('p-6', i % 2 === 1 && 'border-l border-navy-100', i >= 2 && 'border-t border-navy-100 lg:border-t-0', i === 2 && 'lg:border-l')}
            >
              <dt className="text-sm text-navy-500">{s.label}</dt>
              <dd className="mt-1 font-mono text-2xl font-medium text-navy-950">{s.value}</dd>
            </div>
          ))}
        </dl>

        <div className="p-6 sm:p-7">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-navy-700">Queue progress</span>
            <span className="font-mono text-navy-950">{progress}%</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-navy-100">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-1000',
                token.status === 'called'
                  ? 'bg-amber-400 animate-pulse-soft'
                  : 'bg-electric-600'
              )}
              style={{ width: `${Math.max(progress, 4)}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-navy-400">
            <span>Serving #{centre?.currently_serving || '—'}</span>
            <span>You: #{token.token_number}</span>
          </div>

          {token.status === 'called' && (
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 animate-fade-in">
              <BellRing className="h-5 w-5 shrink-0 animate-pulse-soft text-amber-600" />
              <div>
                <p className="font-medium text-amber-900">It&rsquo;s your turn. Please go to the counter.</p>
                <p className="text-sm text-amber-700">Token {token.token_number} is being called now.</p>
              </div>
            </div>
          )}

          {token.status === 'completed' && (
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              <p className="font-medium text-emerald-900">You have been served. This token is now closed.</p>
            </div>
          )}

          {token.status === 'cancelled' && (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-600">
              This token was cancelled on {formatDateTime(token.completed_at ?? token.generated_at)}.
            </div>
          )}

          {isActive && (
            <div className="no-print mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => window.print()}
                className="btn-secondary flex-1"
              >
                Print token
              </button>
              <button
                onClick={() => setConfirmCancel(true)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-navy-200 bg-white px-5 py-2.5 text-sm font-medium text-rose-700 transition hover:border-rose-200 hover:bg-rose-50 active:scale-[0.98]"
              >
                <XCircle className="h-4 w-4" />
                Cancel token
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-navy-100 bg-white p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-medium text-navy-950">{centre?.name ?? 'This centre'}</h2>
          <span className={`badge capitalize ${tokenStatusColor(token.status)}`}>{token.status}</span>
        </div>
        {centre && (
          <div className="mt-3 space-y-2 text-sm text-navy-500">
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-navy-400" />
              {centre.address}, {centre.city}
            </p>
            <p className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-navy-400" />
              About {centre.avg_service_time} minutes per person at the counter
            </p>
          </div>
        )}
        <p className="mt-5 border-t border-navy-100 pt-4 text-sm leading-relaxed text-navy-500">
          This page updates by itself when the counter calls the next person. The wait is an
          estimate and can change.
        </p>
      </section>

      <Modal open={confirmCancel} onClose={() => setConfirmCancel(false)} title="Cancel this token?">
        <p className="text-sm leading-relaxed text-navy-600">
          Your spot in the queue at <strong>{centre?.name}</strong> will be released and you
          will need to generate a new token if you change your mind. This cannot be undone.
        </p>
        <div className="mt-6 flex gap-3">
          <button onClick={() => setConfirmCancel(false)} className="btn-secondary flex-1">
            Keep token
          </button>
          <button
            onClick={cancelToken}
            className="flex-1 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            Yes, cancel it
          </button>
        </div>
      </Modal>
    </div>
  );
}
