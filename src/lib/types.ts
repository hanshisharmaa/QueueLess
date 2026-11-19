export type Category = 'healthcare' | 'beauty' | 'government' | 'repair' | 'banking' | 'dining';
export type QueueStatus = 'low' | 'moderate' | 'busy';
export type TokenStatus = 'waiting' | 'called' | 'completed' | 'cancelled';
export type Role = 'customer' | 'admin';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string;
  role: Role;
  created_at: string;
}

export interface ServiceCentre {
  id: string;
  name: string;
  category: Category;
  description: string;
  address: string;
  city: string;
  image_url: string;
  avg_service_time: number;
  is_open: boolean;
  opens_at: string;
  closes_at: string;
  queue_status: QueueStatus;
  currently_serving: number;
  /** walk-in customers already in line (demo simulation) */
  base_waiting?: number;
  locality?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  created_at: string;
}

export interface CentreService {
  id: string;
  centre_id: string;
  name: string;
  duration_minutes: number;
}

export interface OsmPlace {
  id: string;
  type: 'node' | 'way';
  name: string | null;
  category: Category | 'other';
  address: string | null;
  city: string | null;
  locality: string | null;
  latitude: number;
  longitude: number;
  distance_km: number;
  source: 'openstreetmap';
  tags: Record<string, string>;
  imageUrl: string | null;
  logoUrl: string | null;
}

export interface QueueToken {
  id: string;
  centre_id: string;
  user_id: string;
  token_number: number;
  people_ahead: number;
  /** people ahead when the token was issued (for progress) */
  initial_ahead?: number;
  est_wait_minutes: number;
  status: TokenStatus;
  generated_at: string;
  completed_at: string | null;
}

export interface QueueUpdate {
  id: string;
  centre_id: string;
  token_id: string | null;
  message: string;
  created_at: string;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  healthcare: 'Healthcare',
  beauty: 'Beauty & Salon',
  government: 'Government',
  repair: 'Repair & Service',
  banking: 'Banking',
  dining: 'Dining & Cafes',
};

export const CATEGORY_ORDER: Category[] = [
  'healthcare',
  'beauty',
  'government',
  'repair',
  'banking',
  'dining',
];

export function queueStatusColor(status: QueueStatus): string {
  switch (status) {
    case 'low':
      return 'bg-emerald-100 text-emerald-700';
    case 'moderate':
      return 'bg-amber-100 text-amber-700';
    case 'busy':
      return 'bg-rose-100 text-rose-700';
  }
}

export function queueStatusDot(status: QueueStatus): string {
  switch (status) {
    case 'low':
      return 'bg-emerald-500';
    case 'moderate':
      return 'bg-amber-500';
    case 'busy':
      return 'bg-rose-500';
  }
}

export function tokenStatusColor(status: TokenStatus): string {
  switch (status) {
    case 'waiting':
      return 'bg-electric-100 text-electric-700';
    case 'called':
      return 'bg-amber-100 text-amber-700';
    case 'completed':
      return 'bg-emerald-100 text-emerald-700';
    case 'cancelled':
      return 'bg-slate-200 text-slate-600';
  }
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
}
