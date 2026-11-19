import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Category, QueueToken, ServiceCentre } from '../lib/types';

export interface CentreWithCounts extends ServiceCentre {
  people_waiting: number;
  active_tokens: number;
  distance_km?: number;
}

export interface CentreLocationFilter {
  mode?: 'manual' | 'gps';
  city?: string;
  locality?: string;
  latitude?: number;
  longitude?: number;
  radius_km?: number;
}

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function useCentres(options?: { category?: Category | 'all'; search?: string; location?: CentreLocationFilter | null }) {
  const [centres, setCentres] = useState<CentreWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const { data, error: err } = await supabase
          .from('service_centres')
          .select('*')
          .order('name');
        if (err) throw err;

        const rows = (data ?? []) as ServiceCentre[];

        const { data: tokens, error: tokErr } = await supabase
          .from('queue_tokens')
          .select('centre_id, status')
          .in('status', ['waiting', 'called']);
        if (tokErr) throw tokErr;

        const counts = new Map<string, number>();
        for (const t of (tokens ?? []) as Pick<QueueToken, 'centre_id'>[]) {
          counts.set(t.centre_id, (counts.get(t.centre_id) ?? 0) + 1);
        }

        const enriched: CentreWithCounts[] = rows.map((c) => ({
          ...c,
          people_waiting: (c.base_waiting ?? 0) + (counts.get(c.id) ?? 0),
          active_tokens: counts.get(c.id) ?? 0,
        }));

        if (!cancelled) {
          setCentres(enriched);
          setError(null);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load service centres');
          setLoading(false);
        }
      }
    };

    load();

    const channel = supabase
      .channel('centres-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_centres' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'queue_tokens' }, () => load())
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  const filtered = useMemo(() => {
    let list = centres;
    const cat = options?.category;
    const search = options?.search?.trim().toLowerCase();
    if (cat && cat !== 'all') list = list.filter((c) => c.category === cat);
    if (search) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          c.city.toLowerCase().includes(search) ||
          (c.locality ?? '').toLowerCase().includes(search) ||
          c.address.toLowerCase().includes(search) ||
          c.description.toLowerCase().includes(search)
      );
    }
    const loc = options?.location;
    if (loc?.mode === 'gps' && typeof loc.latitude === 'number' && typeof loc.longitude === 'number') {
      list = list
        .filter((c) => typeof c.latitude === 'number' && typeof c.longitude === 'number')
        .map((c) => ({ ...c, distance_km: distanceKm(loc.latitude!, loc.longitude!, c.latitude!, c.longitude!) }))
        .filter((c) => c.distance_km! <= (loc.radius_km ?? 10))
        .sort((a, b) => a.distance_km! - b.distance_km!);
    } else if (loc?.mode === 'manual') {
      const locality = loc.locality?.trim().toLowerCase();
      const city = loc.city?.trim().toLowerCase();
      if (city) list = list.filter((c) => c.city.toLowerCase().includes(city));
      if (locality) {
        list = list.filter((c) =>
          (c.locality ?? '').toLowerCase().includes(locality) ||
          c.address.toLowerCase().includes(locality)
        );
      }
    }
    return list;
  }, [centres, options?.category, options?.search, options?.location]);

  return { centres: filtered, all: centres, loading, error };
}

export function useCentre(id: string | undefined) {
  const [centre, setCentre] = useState<CentreWithCounts | null>(null);
  const [services, setServices] = useState<{ id: string; name: string; duration_minutes: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const load = async () => {
      try {
        const { data, error: err } = await supabase
          .from('service_centres')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (err) throw err;

        const { data: svc, error: svcErr } = await supabase
          .from('services')
          .select('id, name, duration_minutes')
          .eq('centre_id', id)
          .order('name');
        if (svcErr) throw svcErr;

        const { count, error: cntErr } = await supabase
          .from('queue_tokens')
          .select('id', { count: 'exact', head: true })
          .eq('centre_id', id)
          .in('status', ['waiting', 'called']);
        if (cntErr) throw cntErr;

        if (!cancelled) {
          if (data) {
            setCentre({
              ...(data as ServiceCentre),
              people_waiting: ((data as ServiceCentre).base_waiting ?? 0) + (count ?? 0),
              active_tokens: count ?? 0,
            });
          } else {
            setCentre(null);
          }
          setServices(svc ?? []);
          setError(null);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load centre');
          setLoading(false);
        }
      }
    };

    load();

    const channel = supabase
      .channel(`centre-${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'service_centres', filter: `id=eq.${id}` },
        () => load()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'queue_tokens', filter: `centre_id=eq.${id}` },
        () => load()
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [id]);

  return { centre, services, loading, error };
}

export function useMyTokens(userId: string | undefined) {
  const [tokens, setTokens] = useState<QueueToken[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    const load = async () => {
      const { data, error } = await supabase
        .from('queue_tokens')
        .select('*')
        .eq('user_id', userId)
        .order('generated_at', { ascending: false })
        .limit(50);
      if (!cancelled) {
        if (!error) setTokens((data ?? []) as QueueToken[]);
        setLoading(false);
      }
    };

    load();

    const channel = supabase
      .channel(`tokens-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'queue_tokens', filter: `user_id=eq.${userId}` },
        () => load()
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { tokens, loading };
}

export function activeTokensForCentre(tokens: QueueToken[], centreId: string): QueueToken[] {
  return tokens
    .filter((t) => t.centre_id === centreId && (t.status === 'waiting' || t.status === 'called'))
    .filter((t) => t.generated_at.slice(0, 10) === new Date().toISOString().slice(0, 10));
}
