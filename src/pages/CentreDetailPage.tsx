import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle, ArrowLeft, Calculator, Clock, LogIn, MapPin, Phone, QrCode,
} from 'lucide-react';
import { useCentre } from '../hooks/useCentres';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabaseClient';
import { CATEGORY_LABELS, formatDateTime } from '../lib/types';
import type { QueueToken } from '../lib/types';
import { QrVisual } from '../components/QrVisual';
import { Skeleton } from '../components/ui/Spinner';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { cn } from '../lib/cn';

function WaitingCalculator({ people, avg }: { people: number; avg: number }) {
  const [ahead, setAhead] = useState(people);
  const [service, setService] = useState(avg);
  const result = Math.max(0, ahead) * Math.max(0, service);

  return (
    <div className="card p-6">
      <h3 className="flex items-center gap-2 text-base font-bold text-navy-900">
        <Calculator className="h-5 w-5 text-electric-600" />
        Waiting Time Calculator
      </h3>
      <p className="mt-1 text-xs text-navy-400">
        Estimate = people ahead × average service time. Adjust the numbers to explore scenarios.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="calc-ahead" className="label text-xs">People ahead of you</label>
          <input
            id="calc-ahead"
            type="number"
            min={0}
            max={200}
            value={ahead}
            onChange={(e) => setAhead(Math.max(0, Math.min(200, Number(e.target.value) || 0)))}
            className="input"
          />
        </div>
        <div>
          <label htmlFor="calc-service" className="label text-xs">Avg. service time (min)</label>
          <input
            id="calc-service"
            type="number"
            min={1}
            max={120}
            value={service}
            onChange={(e) => setService(Math.max(1, Math.min(120, Number(e.target.value) || 1)))}
            className="input"
          />
        </div>
      </div>
      <div className="mt-4 rounded-2xl bg-electric-50 p-5 text-center ring-1 ring-electric-100">
        <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">Estimated waiting time</p>
        <p className="mt-1 text-4xl font-semibold tracking-tight text-navy-900">
          {result}
          <span className="ml-1 text-base font-bold text-navy-400">min</span>
        </p>
        <p className="mt-1 text-xs text-navy-400">
          ≈ {(result / 60).toFixed(1)} hours
        </p>
      </div>
      <p className="mt-3 flex items-start gap-1.5 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        This time is an estimate only. Actual waiting may change depending on real service
        duration, breaks and walk-in customers.
      </p>
    </div>
  );
}

export function CentreDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { centre, services, loading } = useCentre(id);
  const { session, profile } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [tokenModal, setTokenModal] = useState<QueueToken | null>(null);
  const [generating, setGenerating] = useState(false);

  const liveAhead = useMemo(() => centre?.people_waiting ?? 0, [centre?.people_waiting]);

  if (loading) {
    return (
      <div className="container-app space-y-6 py-8">
        <Skeleton className="h-64 w-full" />
        <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!centre) {
    return (
      <div className="container-app py-16">
        <EmptyState
          icon={MapPin}
          title="Centre not found"
          description="This service centre may have been removed."
          action={<Link to="/explore" className="btn-primary">Back to Explore</Link>}
        />
      </div>
    );
  }

  const generateToken = async () => {
    if (!session) {
      toast('Please sign in to generate a token.', 'info');
      navigate(`/login?next=/centre/${centre.id}`);
      return;
    }
    if (profile?.role === 'admin') {
      toast('Admins use the Admin Panel to manage queues.', 'info');
      return;
    }
    setGenerating(true);
    try {
      const { data, error } = await supabase.rpc('generate_token', { p_centre_id: centre.id });
      if (error) throw error;
      const token = data as unknown as QueueToken;
      setTokenModal(token);
      toast(`Token generated! You are number ${token.people_ahead + 1} in line.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not generate token';
      toast(message.replace(/^{"message":."/,'').replace(/".*/,''), 'error');
    } finally {
      setGenerating(false);
    }
  };

  const queueLabel = centre.queue_status.charAt(0).toUpperCase() + centre.queue_status.slice(1);

  return (
    <div className="container-app space-y-8 py-8">
      <Link to="/explore" className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-500 transition hover:text-electric-600">
        <ArrowLeft className="h-4 w-4" />
        Back to all centres
      </Link>

      {/* Hero */}
      <section className="card overflow-hidden">
        <div className="relative h-56 sm:h-72">
          {centre.image_url && (
            <img src={centre.image_url} alt={centre.name} className="h-full w-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-3 p-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="badge bg-white/90 text-navy-800">{CATEGORY_LABELS[centre.category]}</span>
              <span className="badge bg-emerald-500 text-white text-[10px]">
                QueueLess Partner · Token enabled
              </span>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{centre.name}</h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-navy-200">
                <MapPin className="h-4 w-4" />
                {centre.address}, {centre.city}
              </p>
            </div>
            <span
              className={cn(
                'badge w-fit px-3 py-1.5',
                centre.is_open ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-white'
              )}
            >
              <Clock className="h-3.5 w-3.5" />
              {centre.is_open ? `Open · ${centre.opens_at}–${centre.closes_at}` : `Closed · opens ${centre.opens_at}`}
            </span>
          </div>
        </div>
        <dl className="grid grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'People waiting', value: liveAhead },
            { label: 'Minutes per visit', value: `${centre.avg_service_time} min` },
            { label: 'Estimated wait', value: `~${liveAhead * centre.avg_service_time} min` },
            { label: 'Now serving', value: `#${centre.currently_serving || '—'}` },
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
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        {/* Left: services + description */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-bold text-navy-900">About this centre</h2>
            <p className="mt-2 leading-relaxed text-navy-500">{centre.description}</p>
            <p className="mt-3 text-xs text-navy-400">
              Demo listing · queue figures are simulated for this project and not provided by the organisation.
            </p>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-bold text-navy-900">Services offered</h2>
            {services.length === 0 ? (
              <p className="mt-3 text-sm text-navy-400">Service details coming soon.</p>
            ) : (
              <ul className="mt-4 divide-y divide-navy-100">
                {services.map((s) => (
                  <li key={s.id} className="flex items-center justify-between py-3">
                    <span className="text-navy-900">{s.name}</span>
                    <span className="font-mono text-sm text-navy-500">~{s.duration_minutes} min</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <WaitingCalculator people={liveAhead} avg={centre.avg_service_time} />
        </div>

        {/* Right: live queue panel */}
        <div className="space-y-6">
          <div className="card overflow-hidden">
            <div className="bg-navy-950 p-6 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Live Queue Status</h2>
                <span
                  className={cn(
                    'badge',
                    centre.queue_status === 'low'
                      ? 'bg-emerald-400/20 text-emerald-300'
                      : centre.queue_status === 'moderate'
                        ? 'bg-amber-400/20 text-amber-300'
                        : 'bg-rose-400/20 text-rose-300'
                  )}
                >
                  <span className={cn('h-1.5 w-1.5 rounded-full animate-pulse-soft',
                    centre.queue_status === 'low' ? 'bg-emerald-400' : centre.queue_status === 'moderate' ? 'bg-amber-400' : 'bg-rose-400')} />
                  {queueLabel}
                </span>
              </div>
              <div className="mt-6 text-center">
                <p className="text-xs font-medium uppercase tracking-widest text-navy-300">Now serving</p>
                <p className="mt-2 font-mono text-6xl font-semibold tracking-tight">
                  {centre.currently_serving || '—'}
                </p>
                <p className="mt-3 text-sm text-navy-200">
                  {liveAhead} {liveAhead === 1 ? 'person' : 'people'} waiting · est. ~{liveAhead * centre.avg_service_time} min total queue
                </p>
              </div>
              <div className="mt-6">
                <div className="flex justify-between text-xs text-navy-300">
                  <span>Queue load</span>
                  <span>{liveAhead} in line</span>
                </div>
                <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-700',
                      centre.queue_status === 'low'
                        ? 'w-1/4 bg-emerald-400'
                        : centre.queue_status === 'moderate'
                          ? 'w-3/5 bg-amber-400'
                          : 'w-full bg-rose-400'
                    )}
                  />
                </div>
              </div>
            </div>
            <div className="p-6">
              <button
                onClick={generateToken}
                disabled={generating || !centre.is_open}
                className="btn-primary w-full !py-4 text-base"
              >
                {generating ? (
                  'Generating…'
                ) : !centre.is_open ? (
                  <>
                    <Clock className="h-5 w-5" />
                    Centre is closed
                  </>
                ) : (
                  <>
                    <QrCode className="h-5 w-5" />
                    Generate Digital Token
                  </>
                )}
              </button>
              <p className="mt-3 text-center text-xs text-navy-400">
                Free · one active token per centre · cancels anytime
              </p>
              <div className="mt-4 flex items-center gap-3 rounded-xl bg-navy-50 p-3 text-xs text-navy-500">
                <Phone className="h-4 w-4 shrink-0 text-electric-600" />
                Prefer to walk in? Tokens keep the queue fair — the counter serves them in order.
              </div>
            </div>
          </div>

          {/* Token modal content is rendered below */}
        </div>
      </div>

      <Modal open={!!tokenModal} onClose={() => setTokenModal(null)} title="Your Digital Token">
        {tokenModal && (
          <div className="print-area rounded-2xl bg-navy-950 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-navy-300">QueueLess token</p>
                <p className="mt-1 text-xl font-bold">{centre.name}</p>
              </div>
              <div className="rounded-xl bg-white p-2">
                <div className="h-20 w-20">
                  <QrVisual />
                </div>
              </div>
            </div>
            <p className="mt-5 font-mono text-6xl font-semibold tracking-tight">
              {tokenModal.token_number}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-white/10 p-3">
                <p className="text-navy-300">People ahead</p>
                <p className="text-lg font-bold">{tokenModal.people_ahead}</p>
              </div>
              <div className="rounded-xl bg-white/10 p-3">
                <p className="text-navy-300">Estimated wait</p>
                <p className="text-lg font-bold text-electric-300">~{tokenModal.est_wait_minutes} min</p>
              </div>
              <div className="rounded-xl bg-white/10 p-3">
                <p className="text-navy-300">Queue status</p>
                <p className="text-lg font-bold capitalize">{queueLabel}</p>
              </div>
              <div className="rounded-xl bg-white/10 p-3">
                <p className="text-navy-300">Issued</p>
                <p className="text-sm font-bold">{formatDateTime(tokenModal.generated_at)}</p>
              </div>
            </div>
            <div className="no-print mt-5 flex gap-3">
              <button
                onClick={() => window.print()}
                className="btn-secondary flex-1 !border-white/20 !bg-white/10 !text-white hover:!bg-white/20"
              >
                Print token
              </button>
              <button
                onClick={() => {
                  setTokenModal(null);
                  navigate(`/track/${tokenModal.id}`);
                }}
                className="btn-primary flex-1"
              >
                <LogIn className="h-4 w-4" />
                Track queue
              </button>
            </div>
            <p className="no-print mt-4 rounded-xl bg-white/10 p-3 text-xs text-navy-200">
              Est. waiting time is an estimate and may change with actual service duration.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
