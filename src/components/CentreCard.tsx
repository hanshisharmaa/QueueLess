import { Link } from 'react-router-dom';
import { ArrowUpRight, MapPin } from 'lucide-react';
import type { ServiceCentre } from '../lib/types';
import { CATEGORY_LABELS, queueStatusDot } from '../lib/types';

interface CentreCardProps {
  centre: ServiceCentre;
  peopleWaiting?: number;
  distanceKm?: number;
}

export function CentreCard({ centre, peopleWaiting, distanceKm }: CentreCardProps) {
  const waiting = peopleWaiting ?? centre.base_waiting ?? 0;
  const status = centre.queue_status.charAt(0).toUpperCase() + centre.queue_status.slice(1);

  return (
    <Link
      to={`/centre/${centre.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white transition duration-200 hover:-translate-y-0.5 hover:shadow-glow"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-navy-100">
        {centre.image_url ? (
          <img
            src={centre.image_url}
            alt={centre.name}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <MapPin className="h-8 w-8 text-navy-300" />
          </div>
        )}
        <span className="badge absolute left-3 top-3 bg-white/95 text-navy-800 backdrop-blur">
          <span className={`h-1.5 w-1.5 rounded-full ${centre.is_open ? queueStatusDot(centre.queue_status) : 'bg-navy-400'}`} />
          {centre.is_open ? `${status} queue` : 'Closed now'}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-navy-400">
          {CATEGORY_LABELS[centre.category]}
        </p>
        <div className="mt-1.5 flex items-start justify-between gap-3">
          <h3 className="text-lg font-medium leading-snug text-navy-950">{centre.name}</h3>
          <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-navy-300 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-electric-700" />
        </div>
        <p className="mt-1 text-sm text-navy-500">
          {centre.locality || centre.city}
          {typeof distanceKm === 'number' && (
            <span className="text-electric-700">
              {' · '}
              {distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m` : `${distanceKm.toFixed(1)} km`} away
            </span>
          )}
        </p>

        <dl className="mt-auto grid grid-cols-3 gap-2 border-t border-navy-100 pt-4 text-sm">
          <div>
            <dt className="text-navy-400">Waiting</dt>
            <dd className="mt-0.5 font-mono font-medium text-navy-950">{centre.is_open ? waiting : '—'}</dd>
          </div>
          <div>
            <dt className="text-navy-400">Est. wait</dt>
            <dd className="mt-0.5 font-mono font-medium text-navy-950">
              {centre.is_open ? `${waiting * centre.avg_service_time}m` : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-navy-400">Per visit</dt>
            <dd className="mt-0.5 font-mono font-medium text-navy-950">{centre.avg_service_time}m</dd>
          </div>
        </dl>
      </div>
    </Link>
  );
}
