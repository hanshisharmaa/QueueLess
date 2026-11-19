import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { fetchProfile, signOut as authSignOut } from '../lib/auth';
import type { Profile, Role } from '../lib/types';

interface AuthContextValue {
  session: { user: { id: string; email: string } } | null;
  profile: Profile | null;
  loading: boolean;
  role: Role | null;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  profile: null,
  loading: true,
  role: null,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthContextValue['session']>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async (userId: string | null) => {
      if (!userId) {
        if (!cancelled) {
          setProfile(null);
          setLoading(false);
        }
        return;
      }
      try {
        const p = await fetchProfile(userId);
        if (!cancelled) {
          setProfile(p);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setSession(data.session ?? null);
      load(data.session?.user?.id ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      // Wrapped in an async IIFE to avoid deadlocks inside the callback
      (async () => {
        if (event === 'SIGNED_OUT') {
          setProfile(null);
          setLoading(false);
        } else if (newSession?.user) {
          await load(newSession.user.id);
        }
      })();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const logout = useCallback(async () => {
    await authSignOut();
    setProfile(null);
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({ session, profile, loading, role: profile?.role ?? null, logout }),
    [session, profile, loading, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
