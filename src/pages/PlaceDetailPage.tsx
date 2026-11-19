import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Globe, Clock, ExternalLink, Building2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchOsmPlaceById } from '../lib/osm';
import type { OsmPlace } from '../lib/types';
import { CATEGORY_LABELS } from '../lib/types';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Spinner';

type CategoryIconProps = { className?: string };

const HealthcareIcon = ({ className }: CategoryIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 10 19 12 17 14" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const BeautyIcon = ({ className }: CategoryIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M17 20c1.86 0 3.392-1.376 3.63-3.187a1.01 1.01 0 0 0-.36-1.29l-.492-.493a3 3 0 0 0-4.242 0L10 15.29l-.492.493a1.01 1.01 0 0 0-.36 1.29c.238 1.81 1.77 3.187 3.63 3.187z" />
    <path d="M8 7h8m-8 0V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const GovernmentIcon = ({ className }: CategoryIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 6h18" />
    <path d="M3 10h18" />
    <rect width="18" height="12" x="3" y="4" rx="2" ry="2" />
  </svg>
);

const RepairIcon = ({ className }: CategoryIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="22" y1="12" x2="14.3" y2="4.3" />
    <path d="M21 10v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2z" />
    <polyline points="12 22 12 12" />
  </svg>
);

const BankingIcon = ({ className }: CategoryIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <path d="M3 9h18" />
    <path d="M3 13h18" />
    <path d="M15 3v18" />
  </svg>
);

const DiningIcon = ({ className }: CategoryIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M5 20h14" />
    <path d="M7 10a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2v4a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-4v-2z" />
    <path d="M7 18a2 2 0 0 1 2 2h6a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-2a2 2 0 0 1-2-2z" />
  </svg>
);

const placeIcons: Record<string, React.ComponentType<CategoryIconProps>> = {
  healthcare: HealthcareIcon,
  beauty: BeautyIcon,
  government: GovernmentIcon,
  repair: RepairIcon,
  banking: BankingIcon,
  dining: DiningIcon,
};

function PlaceImage({ place }: { place: OsmPlace }) {
  const Icon = placeIcons[place.category];
  const [showFallback, setShowFallback] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  const hasListingImage = Boolean(place.imageUrl);
  const hasLogo = Boolean(place.logoUrl);
  const showImage = hasListingImage && !showFallback;
  const showLogo = hasLogo && !logoFailed && !showFallback;
  const showIcon = !showImage && !showLogo;

  return (
    <div className="relative h-full w-full">
      {showImage && (
        <img
          src={place.imageUrl!}
          alt={place.name ?? 'Business'}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setShowFallback(true)}
        />
      )}
      {showLogo && (
        <img
          src={place.logoUrl!}
          alt={place.name ?? 'Business logo'}
          className="h-full w-full object-contain p-4 bg-white"
          loading="lazy"
          onError={() => {
            setLogoFailed(true);
            setShowFallback(true);
          }}
        />
      )}
      {showIcon && (
        <div className="flex h-full items-center justify-center bg-navy-50">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-card">
            <Icon className="h-10 w-10 text-electric-600" />
          </div>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/20 to-transparent" />
    </div>
  );
}

export function PlaceDetailPage() {
  const { placeId } = useParams<{ placeId: string }>();
  const [place, setPlace] = useState<OsmPlace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!placeId) {
      setLoading(false);
      setError('Invalid place.');
      return;
    }
    const [type, id] = placeId.split('-');
    let loaded = false;

    const load = async () => {
      try {
        const p = await fetchOsmPlaceById(type as 'node' | 'way', id);
        if (loaded) return;
        if (!p) {
          setError('Place not found on OpenStreetMap.');
        } else {
          setPlace(p);
        }
      } catch (err) {
        if (loaded) return;
        setError(err instanceof Error ? err.message : 'Failed to load place.');
      } finally {
        if (!loaded) setLoading(false);
      }
    };

    load();

    return () => {
      loaded = true;
    };
  }, [placeId]);

  if (loading) {
    return (
      <div className="container-app py-16 text-center">
        <Skeleton className="h-96 w-full mx-auto" />
      </div>
    );
  }

  if (!place) {
    return (
      <div className="container-app py-16">
        <EmptyState
          icon={Building2}
          title={error ?? 'Place not found'}
          description="This OpenStreetMap listing could not be loaded."
          action={<Link to="/explore" className="btn-primary">Back to Explore</Link>}
        />
      </div>
    );
  }

  const address =
    place.address ??
    (place.locality && place.city ? `${place.locality}, ${place.city}` : place.city ?? null);
  const directionsUrl = `https://www.openstreetmap.org/directions?api=1&map=${place.latitude.toFixed(6)},${place.longitude.toFixed(6)}#${encodeURIComponent(place.name ?? '')}`;
  const osmUrl = `https://www.openstreetmap.org/#map=${place.latitude.toFixed(6)},${place.longitude.toFixed(6)}`;
  const phone = place.tags['phone'] || place.tags['contact:phone'] || null;
  const website = place.tags['website'] || null;
  const openingHours = place.tags['opening_hours'] || null;

  return (
    <div className="container-app space-y-8 py-8">
      <Link to="/explore" className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-500 transition hover:text-electric-600">
        <ArrowLeft className="h-4 w-4" />
        Back to Explore
      </Link>

      <section className="card overflow-hidden">
        <div className="relative h-64 sm:h-80 overflow-hidden">
          <PlaceImage place={place} />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <span className="badge bg-white/90 text-navy-800">
                Nearby place · OpenStreetMap
              </span>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {place.name}
              </h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-navy-200">
                <MapPin className="h-4 w-4" />
                {address ?? 'Not available'}
              </p>
            </div>
            <span className="badge bg-slate-700/90 text-white">
              {CATEGORY_LABELS[place.category as keyof typeof CATEGORY_LABELS] ?? place.category}
            </span>
          </div>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-4">
          {[
            { label: 'Category', value: CATEGORY_LABELS[place.category as keyof typeof CATEGORY_LABELS] ?? place.category },
            { label: 'Source', value: 'OpenStreetMap' },
            { label: 'Status', value: 'External listing' },
            { label: 'Distance', value: 'Not available' },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-navy-50 p-4">
              <p className="text-[10px] font-medium uppercase tracking-wide text-navy-400">{s.label}</p>
              <p className="mt-1 text-sm font-bold text-navy-900">{s.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-bold text-navy-900 mb-4">Details</h2>
        <div className="space-y-3">
          {address && (
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-electric-600" />
              <div>
                <p className="text-sm font-semibold text-navy-900">Address</p>
                <p className="text-sm text-navy-500">{address}</p>
              </div>
            </div>
          )}
          {phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 shrink-0 text-electric-600" />
              <div>
                <p className="text-sm font-semibold text-navy-900">Phone</p>
                <p className="text-sm text-navy-500">{phone}</p>
              </div>
            </div>
          )}
          {website && (
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 shrink-0 text-electric-600" />
              <div>
                <p className="text-sm font-semibold text-navy-900">Website</p>
                <p className="text-sm text-navy-500 truncate max-w-xs">
                  {website}
                </p>
              </div>
            </div>
          )}
          {openingHours && (
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-electric-600" />
              <div>
                <p className="text-sm font-semibold text-navy-900">Opening hours</p>
                <p className="text-sm text-navy-500">{openingHours}</p>
              </div>
            </div>
          )}
          {!address && !phone && !website && !openingHours && (
            <p className="text-sm text-navy-400">No additional details available from OpenStreetMap.</p>
          )}
        </div>
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-bold text-navy-900 mb-4">Map &amp; directions</h2>
        <div className="space-y-3">
          <button
            onClick={() => window.open(osmUrl, '_blank')}
            className="inline-flex items-center justify-center gap-2 w-full rounded-xl border border-navy-200 bg-white px-5 py-3 text-sm font-semibold text-navy-800 transition hover:border-electric-300 hover:text-electric-600"
          >
            <ExternalLink className="h-4 w-4" />
            View on OpenStreetMap
          </button>
          <button
            onClick={() => window.open(directionsUrl, '_blank')}
            className="inline-flex items-center justify-center gap-2 w-full rounded-xl border border-electric-200 bg-electric-50 px-5 py-3 text-sm font-semibold text-electric-700 transition hover:bg-electric-600 hover:text-white"
          >
            <MapPin className="h-4 w-4" />
            Get directions
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-amber-100 bg-amber-50 p-6">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 h-5 w-5 shrink-0 text-amber-500">
            <Building2 className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-bold text-navy-900">Not a QueueLess partner centre</h3>
            <p className="mt-1 text-sm text-navy-600">
              This is a nearby business discovered from OpenStreetMap. It is <strong>not</strong>
              registered with QueueLess, so <strong>token generation and queue tracking are not
              available here</strong>. Use the <em>QueueLess Partner Centres</em> tab to find centres
              where you can generate a digital token.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
