import { supabase } from '../supabase';

const SESSION_KEY = 'wf_analytics_session';

/** Stable per-browser session id, persisted for the tab's lifetime. */
export const getSessionId = () => {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return 'unknown';
  }
};

const getCurrentUserId = async () => {
  try {
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
};

let lastTrackedPath = null;

/** Logs a page visit. Silently no-ops if Firestore is unreachable/blocked. */
export const trackVisit = async (path) => {
  if (typeof window === 'undefined') return;
  if (lastTrackedPath === path) return; // avoid duplicate logs from React double-effects
  lastTrackedPath = path;

  try {
    const uid = await getCurrentUserId();
    await supabase.from('analytics_visits').insert({
      path,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
      session_id: getSessionId(),
      uid,
      client_ts: Date.now(),
    });
  } catch {
    /* analytics must never break the app */
  }
};

/** Logs a "watch request" — a visitor opening a specific movie/show to watch. */
export const trackWatchRequest = async ({ mediaType, mediaId, title }) => {
  if (typeof window === 'undefined' || !mediaId || !title) return;

  try {
    const uid = await getCurrentUserId();
    await supabase.from('analytics_requests').insert({
      media_type: mediaType || null,
      media_id: String(mediaId),
      title,
      session_id: getSessionId(),
      uid,
      client_ts: Date.now(),
    });
  } catch {
    /* analytics must never break the app */
  }
};
