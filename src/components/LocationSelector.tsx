import { useCallback, useEffect, useRef, useState } from 'react';
import { LocateFixed, MapPin, Search } from 'lucide-react';
import type { CentreLocationFilter } from '../hooks/useCentres';
import { geocodeCity, INDIAN_CITIES } from '../lib/osm';

const STORAGE_KEY = 'queueless-selected-location';

// Quick filters: the Meerut localities our partner centres are in.
const MEERUT_AREAS = ['Abu Lane', 'Begum Bridge', 'Civil Lines', 'Garh Road', 'Shastri Nagar', 'Subharti Puram', 'Meerut Cantt'];

type SavedLocation = CentreLocationFilter & { mode: 'manual' | 'gps' };

interface LocationSelectorProps {
  onChange: (location: SavedLocation | null) => void;
}

function readSavedLocation(): SavedLocation | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedLocation) : null;
  } catch {
    return null;
  }
}

export function LocationSelector({ onChange }: LocationSelectorProps) {
  const [city, setCity] = useState('');
  const [locality, setLocality] = useState('');
  const [radius, setRadius] = useState(10);
  const [mode, setMode] = useState<'manual' | 'gps'>('manual');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const geocodeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const publish = useCallback(
    (next: SavedLocation) => {
      setMode(next.mode);
      if (typeof next.latitude === 'number' && typeof next.longitude === 'number') {
        setCoords({ latitude: next.latitude, longitude: next.longitude });
      } else {
        setCoords(null);
      }
      setCity(next.city ?? '');
      setLocality(next.locality ?? '');
      setRadius(next.radius_km ?? 10);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      onChange(next);
    },
    [onChange]
  );

  useEffect(() => {
    const saved = readSavedLocation();
    if (saved) {
      publish(saved);
    } else {
      // No default city: prompt the user to select one or use GPS.
      const initial: SavedLocation = { mode: 'manual', city: '', locality: '' };
      onChange(initial);
    }
  // This runs once to restore the user's saved preference.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const geocodeAndPublish = useCallback(
    async (nextCity: string, nextLocality: string) => {
      setMode('manual');
      setCoords(null);
      setMessage('');
      const next: SavedLocation = {
        mode: 'manual',
        city: nextCity,
        locality: nextLocality,
        radius_km: radius,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      publish(next);

      if (!nextCity.trim()) return;
      setMessage('Looking up location…');
      const geo = await geocodeCity(`${nextCity}${nextLocality ? `, ${nextLocality}` : ''}`);
      if (geo) {
        const withCoords: SavedLocation = {
          mode: 'manual',
          city: nextCity,
          locality: nextLocality,
          latitude: geo.latitude,
          longitude: geo.longitude,
          radius_km: radius,
        };
        setCoords({ latitude: geo.latitude, longitude: geo.longitude });
        setCity(nextCity);
        setLocality(nextLocality);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(withCoords));
        publish(withCoords);
        setMessage(`Location set to ${geo.displayName}.`);
      } else {
        setMessage(
          `Saved "${nextCity}" as your area. Enter coordinates or use "Use my location" for distance-based nearby search.`
        );
      }
    },
    [radius, publish]
  );

  const publishManual = (nextCity: string, nextLocality: string) => {
    if (geocodeRef.current) clearTimeout(geocodeRef.current);
    geocodeRef.current = setTimeout(() => {
      geocodeRef.current = null;
      void geocodeAndPublish(nextCity, nextLocality);
    }, 400);
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setMessage('Location is not supported by this browser. Enter your area manually.');
      return;
    }
    setGpsLoading(true);
    setMessage('Requesting location permission…');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next: SavedLocation = {
          mode: 'gps',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          radius_km: radius,
        };
        setCoords({ latitude: next.latitude!, longitude: next.longitude! });
        setMode('gps');
        setCity('');
        setLocality('');
        setMessage('Location detected. Showing places within your selected radius.');
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        publish(next);
        setGpsLoading(false);
      },
      (error) => {
        const text =
          error.code === error.PERMISSION_DENIED
            ? 'Location permission denied. You can select your area manually.'
            : error.code === error.POSITION_UNAVAILABLE
              ? 'Your location could not be detected. Try manual selection.'
              : 'Location request timed out. Please try again.';
        setMessage(text);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  };

  const updateRadius = (nextRadius: number) => {
    setRadius(nextRadius);
    let next: SavedLocation;
    if (mode === 'gps' && coords) {
      next = { mode: 'gps', ...coords, radius_km: nextRadius };
    } else {
      next = {
        mode: 'manual',
        city,
        locality,
        ...(coords ? { latitude: coords.latitude, longitude: coords.longitude } : {}),
        radius_km: nextRadius,
      };
    }
    publish(next);
  };

  const clearLocation = () => {
    if (geocodeRef.current) clearTimeout(geocodeRef.current);
    setCity('');
    setLocality('');
    setCoords(null);
    setMode('manual');
    setMessage('Location filter cleared. Showing all centres.');
    localStorage.removeItem(STORAGE_KEY);
    onChange(null);
  };

  const selectCityChip = (label: string, latitude: number, longitude: number) => {
    const next: SavedLocation = {
      mode: 'manual',
      city: label,
      locality: '',
      latitude,
      longitude,
      radius_km: radius,
    };
    setCoords({ latitude, longitude });
    setCity(label);
    setLocality('');
    setMode('manual');
    setMessage(`Location set to ${label}.`);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    publish(next);
  };

  return (
    <div className="card mb-7 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-navy-900">
            <MapPin className="h-5 w-5 text-electric-600" /> Find places near you
          </h2>
          <p className="mt-1 text-sm text-navy-500">
            Choose a city or use your device location. Nearby businesses come from OpenStreetMap.
          </p>
        </div>
        <button type="button" onClick={detectLocation} disabled={gpsLoading} className="btn-secondary shrink-0">
          <LocateFixed className={`h-4 w-4 ${gpsLoading ? 'animate-pulse' : ''}`} />
          {gpsLoading ? 'Detecting…' : 'Use my location'}
        </button>
      </div>

      {/* Meerut areas */}
      <div className="mt-4">
        <span className="label">Areas in Meerut</span>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              const m = INDIAN_CITIES.find((c) => c.label === 'Meerut')!;
              selectCityChip('Meerut', m.latitude, m.longitude);
            }}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
              city === 'Meerut' && !locality
                ? 'border-navy-950 bg-navy-950 text-white'
                : 'border-navy-200 bg-white text-navy-700 hover:border-navy-400'
            }`}
          >
            All of Meerut
          </button>
          {MEERUT_AREAS.map((a) => (
            <button
              type="button"
              key={a}
              onClick={() => publishManual('Meerut', a)}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                locality === a
                  ? 'border-navy-950 bg-navy-950 text-white'
                  : 'border-navy-200 bg-white text-navy-700 hover:border-navy-400'
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <label className="block">
          <span className="label">City</span>
          <input
            value={city}
            onChange={(e) => publishManual(e.target.value, locality)}
            placeholder="e.g. Meerut"
            className="input"
          />
        </label>
        <label className="block">
          <span className="label">Area / locality</span>
          <input
            value={locality}
            onChange={(e) => publishManual(city, e.target.value)}
            placeholder="e.g. Kanker Khera"
            className="input"
          />
        </label>
        <label className="block sm:min-w-32">
          <span className="label">Radius</span>
          <select
            value={radius}
            onChange={(e) => updateRadius(Number(e.target.value))}
            className="input"
            disabled={mode !== 'gps' && !coords}
          >
            <option value={5}>5 km</option>
            <option value={10}>10 km</option>
            <option value={20}>20 km</option>
            <option value={50}>50 km</option>
          </select>
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs text-navy-500">
          <Search className="h-3.5 w-3.5" />
          {coords ? 'Distance-based search is active.' : 'Manual area search matches partner centre city and locality.'}
        </p>
        <button type="button" onClick={clearLocation} className="text-xs font-semibold text-electric-700 hover:underline">
          Clear location
        </button>
      </div>
      {message && <p className="mt-2 text-xs text-navy-500" role="status">{message}</p>}
    </div>
  );
}
