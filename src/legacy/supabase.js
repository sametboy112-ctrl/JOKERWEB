import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase authentication is not configured.');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const getSupabaseUser = (user) => user ? ({
  uid: user.id,
  id: user.id,
  email: user.email,
  displayName: user.user_metadata?.displayName || user.user_metadata?.display_name || user.user_metadata?.name || null,
  photoURL: user.user_metadata?.avatar_url || null,
  emailVerified: Boolean(user.email_confirmed_at),
}) : null;

export const subscribeToAuth = (callback) => {
  let active = true;
  supabase.auth.getUser().then(({ data }) => { if (active) callback(getSupabaseUser(data.user)); });
  const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => callback(getSupabaseUser(session?.user)));
  return () => { active = false; listener.subscription.unsubscribe(); };
};
