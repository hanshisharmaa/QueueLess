import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Building2, Search, SlidersHorizontal } from 'lucide-react';
import { CentreCard } from '../components/CentreCard';
import { PlaceCard } from '../components/PlaceCard';
import { LocationSelector } from '../components/LocationSelector';
import type { CentreLocationFilter } from '../hooks/useCentres';
import { useCentres } from '../hooks/useCentres';
import { useNearbyPlaces } from '../hooks/useNearbyPlaces';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Spinner';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '../lib/types';
import type { Category } from '../lib/types';
import { cn } from '../lib/cn';

type ExploreTab = 'partner' | 'nearby';

const TAB_LABELS: Record<ExploreTab, string> = {
  partner: 'QueueLess Partner Centres',
  nearby: 'Nearby Places',
};

export function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = (searchParams.get('category') as Category | null) ?? 'all';
  const [category, setCategory] = useState<Category | 'all'>(initialCategory);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<ExploreTab>('partner');
  const [location, setLocation] = useState<CentreLocationFilter | null>(null);

  const { centres, loading: centresLoading, error: centresError } = useCentres({
    category,
    search,
    location,
  });

  const hasCoords =
    location &&
    (location.mode === 'gps' ||
      (typeof location.latitude === 'number' && typeof location.longitude === 'number'));

  const nearbyLocation = hasCoords
    ? {
        latitude: location.latitude!,
        longitude: location.longitude!,
        radiusKm: location.radius_km ?? 10,
      }
    : null;

  const { places, loading: placesLoading, error: placesError } = useNearbyPlaces({
    category: category === 'all' ? 'all' : category,
    location: nearbyLocation,
    enabled: tab === 'nearby' && !!nearbyLocation,
  });

  const selectCategory = (cat: Category | 'all') => {
    setCategory(cat);
    const next = new URLSearchParams(searchParams);
    if (cat === 'all') next.delete('category');
    else next.set('category', cat);
    setSearchParams(next, { replace: true });
  };

  const selectTab = (next: ExploreTab) => {
    setTab(next);
    if (next === 'nearby' && !nearbyLocation) {
      // Nothing to do; the page renders a location-prompt state.
    }
  };

  const filteredPlaces = useMemo(() => {
    if (!search) return places;
    const s = search.toLowerCase();
    return places.filter(
      (p) =>
        (p.name ?? '').toLowerCase().includes(s) ||
        (p.address ?? '').toLowerCase().includes(s) ||
        (p.city ?? '').toLowerCase().includes(s) ||
        (p.locality ?? '').toLowerCase().includes(s)
    );
  }, [places, search]);

  const isLoading = tab === 'partner' ? centresLoading : placesLoading;
  const error = tab === 'partner' ? centresError : placesError;
  const itemCount = tab === 'partner' ? centres.length : filteredPlaces.length;

  return (
    <div>
      <section className="border-b border-navy-100 py-14 lg:py-16">
        <div className="container-app">
          <p className="eyebrow">Live queues · Meerut</p>
          <h1 className="mt-4 text-4xl font-medium text-navy-950 sm:text-5xl">Find a centre</h1>
          <p className="mt-3 max-w-2xl text-lg text-navy-500">
            See how busy each place is right now, then take a token before you head out.
          </p>
          <div className="relative mt-8 max-w-xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-navy-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, area or service…"
              className="w-full rounded-xl border border-navy-200 bg-white py-3.5 pl-12 pr-4 text-navy-950 shadow-soft placeholder:text-navy-400 focus:border-electric-600 focus:outline-none focus:ring-2 focus:ring-electric-600/15"
              aria-label="Search service centres and nearby places"
            />
          </div>
        </div>
      </section>

      <section className="container-app py-10">
        <LocationSelector onChange={setLocation} />

        {/* Tabs */}
        <div className="mt-8 flex rounded-xl border border-navy-200 bg-navy-50">
          {(['partner', 'nearby'] as const).map((t) => (
            <button
              key={t}
              onClick={() => selectTab(t)}
              className={cn(
                'shrink-0 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all',
                tab === t
                  ? 'bg-white shadow-sm text-navy-900 ring-1 ring-electric-500/30'
                  : 'text-navy-500 hover:text-navy-900 hover:bg-white/50'
              )}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        {/* Category filters */}
        <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-navy-400" />
          {(['all', ...CATEGORY_ORDER] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => selectCategory(cat)}
              className={cn(
                'shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all',
                category === cat
                  ? 'bg-electric-600 text-white shadow-soft'
                  : 'bg-white text-navy-600 ring-1 ring-navy-100 hover:ring-electric-300 hover:text-electric-700'
              )}
            >
              {cat === 'all' ? 'All' : CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Tab-specific errors */}
        {error && (
          <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        {/* Nearby tab location prompt */}
        {tab === 'nearby' && !nearbyLocation && !error && (
          <div className="mt-6 rounded-xl border border-navy-100 bg-navy-50 p-6 text-center">
            <p className="text-sm text-navy-600">
              Select a city or use your device location to see nearby places from OpenStreetMap.
            </p>
          </div>
        )}

        {/* Loading */}
        {isLoading && !error && (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        )}

        {/* Empty / results */}
        {!isLoading && itemCount === 0 && !error && (
          <EmptyState
            icon={Building2}
            title={
              tab === 'partner'
                ? 'No partner centres found'
                : 'No nearby places found'
            }
            description={
              search
                ? `Nothing matches "${search}". Try a different name, city or clear the search.`
                : tab === 'partner'
                  ? 'No partner centres in this category yet. Check back soon.'
                  : 'No OpenStreetMap places found in this category around your selected location.'
            }
            action={
              tab === 'nearby' ? (
                <button
                  onClick={() => selectTab('partner')}
                  className="btn-secondary"
                >
                  Browse partner centres
                </button>
              ) : (
                <Link to="/explore" className="btn-primary">
                  Back to Explore
                </Link>
              )
            }
          />
        )}

        {!isLoading && itemCount > 0 && (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tab === 'partner'
              ? centres.map((c, i) => (
                  <div key={c.id} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                    <CentreCard centre={c} peopleWaiting={c.people_waiting} distanceKm={c.distance_km} />
                  </div>
                ))
              : filteredPlaces.map((p, i) => (
                  <div key={p.id} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                    <PlaceCard place={p} />
                  </div>
                ))}
          </div>
        )}
      </section>
    </div>
  );
}
