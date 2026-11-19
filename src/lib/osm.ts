import type { Category, OsmPlace } from './types';

const OVERPASS_ENDPOINT = 'https://overpass-api.de/api/interpreter';
const NOMINATIM_ENDPOINT = 'https://nominatim.openstreetmap.org/search';

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  displayName: string;
}

interface OsmElement {
  type: 'node' | 'way';
  id: number | string;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

/**
 * Indian bank brands commonly mapped in OpenStreetMap.
 * Only used to recognise the bank category from the `brand`/`name` tag —
 * never inserted as fake listings; only matched against actual OSM data.
 */
const INDIAN_BANK_BRANDS = [
  'state bank of india',
  'sbi',
  'punjab national bank',
  'pnb',
  'bank of baroda',
  'bob',
  'hdfc bank',
  'hdfc',
  'icici bank',
  'icici',
  'axis bank',
  'axis',
  'kotak mahindra bank',
  'kotak',
  'canara bank',
  'union bank of india',
  'indian bank',
  'bank of india',
  'idbi bank',
  'yes bank',
  'indusind bank',
  'federal bank',
  'idfc first bank',
  'idfc',
  'rbl bank',
  'south indian bank',
  'karur vysya bank',
  'tamilnad mercantile bank',
  'city union bank',
  'dbs bank',
  'standard chartered',
  'citibank',
  'hongkong and shanghai banking corporation',
  'hsbc',
];

export async function geocodeCity(query: string): Promise<GeocodeResult | null> {
  if (!query || !query.trim()) return null;
  const url = `${NOMINATIM_ENDPOINT}?format=json&limit=1&q=${encodeURIComponent(query.trim())}, India`;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'QueueLess-demo/1.0 (location-search)',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const json = await res.json();
    if (!Array.isArray(json) || json.length === 0) return null;
    const top = json[0];
    const lat = Number(top.lat);
    const lon = Number(top.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    return { latitude: lat, longitude: lon, displayName: top.display_name || query };
  } catch {
    return null;
  }
}

const AMENITY_TAGS: Record<Category | 'other', string[]> = {
  healthcare: ['hospital', 'clinic', 'doctors', 'pharmacy'],
  beauty: ['beauty_salon', 'hairdresser', 'nail_salon', 'spa'],
  government: ['townhall', 'post_office'],
  repair: ['car_repair', 'car_shop', 'tyre', 'bicycle_repair', 'car_washing'],
  banking: ['bank', 'atm'],
  dining: ['restaurant', 'cafe', 'fast_food', 'food_court', 'dhaba', 'bar'],
  other: [],
};

const SHOP_TAGS: Record<Category | 'other', string[]> = {
  healthcare: ['chemist', 'medical_supply', 'hearing_aids'],
  beauty: ['beauty', 'hairdresser_supply'],
  government: [],
  repair: ['electronics_repair', 'mobile_phone', 'car_parts', 'car', 'bicycle'],
  banking: [],
  dining: [],
  other: [],
};

const OFFICE_TAGS: Record<Category | 'other', string[]> = {
  healthcare: [],
  beauty: [],
  government: ['government'],
  repair: [],
  banking: [],
  dining: [],
  other: [],
};

function toRad(value: number) {
  return (value * Math.PI) / 180;
}

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function isIndianBank(tags: Record<string, string>): boolean {
  const name = (tags['name'] || '').toLowerCase();
  const brand = (tags['brand'] || '').toLowerCase();
  return INDIAN_BANK_BRANDS.some((b) => name.includes(b) || brand.includes(b));
}

function buildQuery(category: Category | 'other', lat: number, lon: number, radiusM: number) {
  const clauses: string[] = [];

  // amenity-based queries
  for (const tag of AMENITY_TAGS[category]) {
    clauses.push(`node["amenity"="${tag}"](around:${radiusM},${lat},${lon});`);
    clauses.push(`way["amenity"="${tag}"](around:${radiusM},${lat},${lon});`);
  }

  // shop-based queries (repair, beauty, healthcare chemists)
  for (const tag of SHOP_TAGS[category]) {
    clauses.push(`node["shop"="${tag}"](around:${radiusM},${lat},${lon});`);
    clauses.push(`way["shop"="${tag}"](around:${radiusM},${lat},${lon});`);
  }

  // office-based queries (government offices)
  for (const tag of OFFICE_TAGS[category]) {
    clauses.push(`node["office"="${tag}"](around:${radiusM},${lat},${lon});`);
    clauses.push(`way["office"="${tag}"](around:${radiusM},${lat},${lon});`);
  }

  if (clauses.length === 0) return '';
  return `[out:json][timeout:25];
(${clauses.join('\n')});
out center tags;`;
}

function buildAddress(tags: Record<string, string>): string | null {
  const parts: string[] = [];
  if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
  if (tags['addr:street']) parts.push(tags['addr:street']);
  if (tags['addr:suburb']) parts.push(tags['addr:suburb']);
  if (tags['addr:city']) parts.push(tags['addr:city']);
  if (tags['addr:state']) parts.push(tags['addr:state']);
  if (tags['addr:postcode']) parts.push(tags['addr:postcode']);
  if (!parts.length) return null;
  return parts.join(', ');
}

function pickName(tags: Record<string, string>): string | null {
  return tags['name'] || tags['official_name'] || tags['brand'] || null;
}

function pickImageUrl(tags: Record<string, string>): string | null {
  return tags['image'] || tags['logo'] || null;
}

function pickLogoUrl(tags: Record<string, string>): string | null {
  return tags['logo'] || null;
}

function mapCategory(tags: Record<string, string>): Category | 'other' {
  const amenity = tags['amenity'];
  const shop = tags['shop'];
  const office = tags['office'];
  const lowerAmenity = amenity ? amenity.toLowerCase() : '';
  const lowerShop = shop ? shop.toLowerCase() : '';
  const lowerOffice = office ? office.toLowerCase() : '';

  // Government offices (RTO, CSC, post office, townhall)
  if (
    lowerOffice === 'government' ||
    lowerAmenity === 'townhall' ||
    lowerAmenity === 'post_office'
  ) {
    return 'government';
  }

  // Banking: amenity=bank/atm or Indian bank brand in name
  if (
    lowerAmenity === 'bank' ||
    lowerAmenity === 'atm' ||
    isIndianBank(tags)
  ) {
    return 'banking';
  }

  // Healthcare
  if (
    ['hospital', 'clinic', 'doctors', 'pharmacy'].includes(lowerAmenity) ||
    ['chemist', 'medical_supply'].includes(lowerShop)
  ) {
    return 'healthcare';
  }

  // Beauty salons and parlours
  if (
    ['beauty_salon', 'hairdresser', 'nail_salon', 'spa'].includes(lowerAmenity) ||
    lowerShop === 'beauty' ||
    lowerShop === 'hairdresser_supply'
  ) {
    return 'beauty';
  }

  // Repair: vehicle service, electronics/mobile repair
  if (
    ['car_repair', 'car_shop', 'tyre', 'bicycle_repair', 'car_washing'].includes(lowerAmenity) ||
    ['electronics_repair', 'mobile_phone', 'car_parts', 'car', 'bicycle'].includes(lowerShop)
  ) {
    return 'repair';
  }

  // Dining
  if (
    ['restaurant', 'cafe', 'fast_food', 'food_court', 'dhaba', 'bar'].includes(lowerAmenity)
  ) {
    return 'dining';
  }

  return 'other';
}

function parseElements(elements: OsmElement[], centreLat: number, centreLon: number): OsmPlace[] {
  const seen = new Set<string>();
  const places: OsmPlace[] = [];

  for (const el of elements) {
    const osmid = `${el.type}-${el.id}`;
    if (seen.has(osmid)) continue;
    const tags: Record<string, string> = el.tags || {};
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    if (typeof lat !== 'number' || typeof lon !== 'number') continue;
    const name = pickName(tags);
    if (!name) continue;
    seen.add(osmid);
    places.push({
      id: osmid,
      type: el.type === 'way' ? 'way' : 'node',
      name,
      category: mapCategory(tags),
      address: buildAddress(tags),
      city: tags['addr:city'] || null,
      locality: tags['addr:suburb'] || tags['addr:city'] || null,
      latitude: lat,
      longitude: lon,
      distance_km: Math.round(haversineKm(centreLat, centreLon, lat, lon) * 10) / 10,
      source: 'openstreetmap',
      tags,
      imageUrl: pickImageUrl(tags),
      logoUrl: pickLogoUrl(tags),
    });
  }

  places.sort((a, b) => a.distance_km - b.distance_km);
  return places;
}

export interface FetchNearbyOptions {
  category: Category | 'other' | 'all';
  latitude: number;
  longitude: number;
  radiusKm?: number;
  limit?: number;
}

export async function fetchNearbyPlaces(options: FetchNearbyOptions): Promise<OsmPlace[]> {
  const { category, latitude, longitude, radiusKm = 5, limit = 40 } = options;
  const radiusM = Math.round(radiusKm * 1000);

  const categories: (Category | 'other')[] =
    category === 'all'
      ? ['healthcare', 'beauty', 'government', 'repair', 'banking', 'dining']
      : [category];

  const allPlaces: OsmPlace[] = [];
  const errors: string[] = [];

  for (const cat of categories) {
    const query = buildQuery(cat, latitude, longitude, radiusM);
    if (!query) continue;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      const res = await fetch(OVERPASS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: query }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) {
        errors.push(`${cat}: HTTP ${res.status}`);
        continue;
      }
      const json = await res.json();
      const elements = json.elements ?? [];
      allPlaces.push(...parseElements(elements, latitude, longitude));
    } catch (err) {
      errors.push(`${cat}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const seen = new Set<string>();
  const deduped: OsmPlace[] = [];
  for (const p of allPlaces) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    deduped.push(p);
  }

  deduped.sort((a, b) => a.distance_km - b.distance_km);
  if (limit) deduped.length = Math.min(deduped.length, limit);

  if (errors.length && deduped.length === 0) {
    throw new Error(errors.join('; '));
  }

  return deduped;
}

export async function fetchOsmPlaceById(type: 'node' | 'way', id: number | string): Promise<OsmPlace | null> {
  const outClause = type === 'node' ? 'out tags;' : 'out center tags;';
  const query = `[out:json][timeout:25];
${type}(${id});
${outClause}`;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    const res = await fetch(OVERPASS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: query }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const json = await res.json();
    const elements = json.elements ?? [];
    if (elements.length === 0) return null;
    const el = elements[0] as OsmElement;
    const tags: Record<string, string> = el.tags || {};
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    if (typeof lat !== 'number' || typeof lon !== 'number') return null;
    const name = pickName(tags);
    if (!name) return null;
      return {
        id: `${el.type}-${el.id}`,
        type: el.type === 'way' ? 'way' : 'node',
        name,
        category: mapCategory(tags),
        address: buildAddress(tags),
        city: tags['addr:city'] || null,
        locality: tags['addr:suburb'] || tags['addr:city'] || null,
        latitude: lat,
        longitude: lon,
        distance_km: 0,
        source: 'openstreetmap',
        tags,
        imageUrl: pickImageUrl(tags),
        logoUrl: pickLogoUrl(tags),
      };
  } catch {
    return null;
  }
}

export function osmDirectionsUrl(lat: number, lon: number, name?: string | null) {
  const q = name ? encodeURIComponent(name) : '';
  return `https://www.openstreetmap.org/directions?api=1&map=${lat.toFixed(6)},${lon.toFixed(6)}#${q}`;
}

export function osmPlaceUrl(lat: number, lon: number) {
  return `https://www.openstreetmap.org/#map=${lat.toFixed(6)},${lon.toFixed(6)}`;
}

export const INDIAN_CITIES = [
  { label: 'Delhi', latitude: 28.6139, longitude: 77.2090 },
  { label: 'Mumbai', latitude: 19.0760, longitude: 72.8777 },
  { label: 'Bengaluru', latitude: 12.9716, longitude: 77.5946 },
  { label: 'Hyderabad', latitude: 17.3850, longitude: 78.4867 },
  { label: 'Chennai', latitude: 13.0827, longitude: 80.2707 },
  { label: 'Kolkata', latitude: 22.5726, longitude: 88.3639 },
  { label: 'Pune', latitude: 18.5204, longitude: 73.8567 },
  { label: 'Ahmedabad', latitude: 23.0225, longitude: 72.5714 },
  { label: 'Jaipur', latitude: 26.9124, longitude: 75.7873 },
  { label: 'Lucknow', latitude: 26.8467, longitude: 80.9462 },
  { label: 'Kanpur', latitude: 26.4499, longitude: 80.3319 },
  { label: 'Nagpur', latitude: 21.1458, longitude: 79.0882 },
  { label: 'Indore', latitude: 22.7196, longitude: 75.8577 },
  { label: 'Meerut', latitude: 28.9845, longitude: 77.7064 },
  { label: 'Bhopal', latitude: 23.2599, longitude: 77.4126 },
  { label: 'Visakhapatnam', latitude: 17.6868, longitude: 83.2212 },
  { label: 'Patna', latitude: 25.5941, longitude: 85.1376 },
  { label: 'Vadodara', latitude: 22.3072, longitude: 73.1812 },
  { label: 'Ghaziabad', latitude: 28.6692, longitude: 77.4538 },
  { label: 'Ludhiana', latitude: 30.9010, longitude: 75.8573 },
  { label: 'Agra', latitude: 27.1767, longitude: 78.0081 },
  { label: 'Nashik', latitude: 19.9975, longitude: 73.7898 },
  { label: 'Faridabad', latitude: 28.4089, longitude: 77.3178 },
];
