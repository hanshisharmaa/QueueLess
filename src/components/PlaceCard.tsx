import { Link } from 'react-router-dom';
import { MapPin, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import type { OsmPlace } from '../lib/types';
import { CATEGORY_LABELS } from '../lib/types';
import { osmDirectionsUrl } from '../lib/osm';

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

function formatIndianAddress(tags: Record<string, string>): string | null {
  const parts: string[] = [];
  if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
  if (tags['addr:street']) parts.push(tags['addr:street']);
  if (tags['addr:suburb']) parts.push(tags['addr:suburb']);
  if (tags['addr:city']) parts.push(tags['addr:city']);
  if (tags['addr:state']) parts.push(tags['addr:state']);
  if (tags['addr:postcode']) parts.push(tags['addr:postcode']);
  if (parts.length === 0) return null;
  return parts.join(', ');
}

/**
 * Renders a business image with a strict fallback chain:
 * 1. Actual listing image (OSM `image` tag)
 * 2. Actual business logo (OSM `logo` tag)
 * 3. Category-specific icon (always available, never broken)
 *
 * Never shows broken image icons or placeholder photos.
 */
function PlaceImage({ place }: { place: OsmPlace }) {
  const Icon = placeIcons[place.category];
  const tags = place.tags;
  const bankName = tags['brand'] || tags['name'];
  const isBank = place.category === 'banking';

  const [showFallback, setShowFallback] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  const hasListingImage = Boolean(place.imageUrl);
  const hasLogo = Boolean(place.logoUrl);
  const showImage = hasListingImage && !showFallback;
  const showLogo = hasLogo && !logoFailed && !showFallback;
  const showIcon = !showImage && !showLogo;

  return (
    <div className="relative h-48 overflow-hidden">
      {/* Actual listing photo from OpenStreetMap */}
      {showImage && (
        <img
          src={place.imageUrl!}
          alt={place.name ?? 'Business'}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => {
            setShowFallback(true);
          }}
        />
      )}

      {/* Actual business logo from OpenStreetMap */}
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

      {/* Category-specific icon fallback (never broken) */}
      {showIcon && (
        <div className="flex h-full items-center justify-center bg-navy-50">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
            <Icon className="h-8 w-8 text-electric-600" />
          </div>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent" />
      <span className="badge absolute left-3 top-3 bg-navy-900/90 text-white text-[10px]">
        Nearby place
      </span>
      <span
        className={`badge absolute right-3 top-3 bg-slate-700/90 text-white text-[10px]`}
      >
        {isBank && bankName ? bankName : CATEGORY_LABELS[place.category as keyof typeof CATEGORY_LABELS] ?? place.category}
      </span>
      <p className="absolute bottom-3 left-3 text-sm font-bold text-white drop-shadow">
        {place.name ?? 'Unnamed place'}
      </p>
    </div>
  );
}

export function PlaceCard({ place }: { place: OsmPlace }) {
  const tags = place.tags;
  const address = formatIndianAddress(tags) ?? place.address;
  const displayAddress =
    address ?? (place.locality && place.city ? `${place.locality}, ${place.city}` : place.city ?? null);
  const directionsUrl = osmDirectionsUrl(place.latitude, place.longitude, place.name ?? undefined);

  return (
    <Link
      to={`/place/${encodeURIComponent(place.id)}`}
      className="group card overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card"
    >
      <PlaceImage place={place} />

      <div className="space-y-3 p-4">
        <p className="flex items-center gap-1.5 text-xs text-navy-500">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-navy-300" />
          {displayAddress ? (
            <>
              {displayAddress}
              {typeof place.distance_km === 'number' && (
                <span className="ml-1 font-semibold text-electric-700">
                  · {place.distance_km < 1 ? `${Math.round(place.distance_km * 1000)} m` : `${place.distance_km.toFixed(1)} km`} away
                </span>
              )}
            </>
          ) : (
            <span className="text-navy-400">Not available</span>
          )}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={(e) => {
              e.preventDefault();
              window.open(directionsUrl, '_blank');
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-electric-200 bg-electric-50 px-4 py-2.5 text-sm font-semibold text-electric-700 transition hover:bg-electric-600 hover:text-white"
          >
            <ExternalLink className="h-4 w-4" />
            Get directions
          </button>
          <div className="rounded-xl bg-navy-50 px-3 py-2 text-center">
            <p className="text-xs font-medium text-navy-400 uppercase">OpenStreetMap</p>
            <p className="text-[10px] text-navy-500">External listing</p>
          </div>
        </div>
        <p className="text-[11px] text-navy-400">
          This is a nearby place from OpenStreetMap, not a QueueLess partner centre. Token
          generation and queue tracking are not available here.
        </p>
      </div>
    </Link>
  );
}
