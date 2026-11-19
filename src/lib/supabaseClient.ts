// Local demo mode: the app runs entirely in the browser with no backend.
// To switch back to a real Supabase project later, restore:
//   import { createClient } from '@supabase/supabase-js';
//   export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
import { localClient } from './localBackend';

export const supabase = localClient;
