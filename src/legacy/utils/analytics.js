import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

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

const getCachedUser = () => {
  try { return JSON.parse(localStorage.getItem('joker movies_user')) ?? null; } catch { return null; }
};

let lastTrackedPath = null;

/** Logs a page visit. Silently no-ops if Firestore is unreachable/blocked. */
export const trackVisit = async (path) => {
  if (typeof window === 'undefined') return;
  if (lastTrackedPath === path) return; // avoid duplicate logs from React double-effects
  lastTrackedPath = path;

  try {
    const user = getCachedUser();
    await addDoc(collection(db, 'analytics_visits'), {
      path,
      referrer: document.referrer || null,
      userAgent: navigator.userAgent,
      sessionId: getSessionId(),
      uid: user?.uid ?? null,
      ts: serverTimestamp(),
      clientTs: Date.now(),
    });
  } catch {
    /* analytics must never break the app */
  }
};

/** Logs a "watch request" — a visitor opening a specific movie/show to watch. */
export const trackWatchRequest = async ({ mediaType, mediaId, title }) => {
  if (typeof window === 'undefined' || !mediaId || !title) return;

  try {
    const user = getCachedUser();
    await addDoc(collection(db, 'analytics_requests'), {
      mediaType,
      mediaId: String(mediaId),
      title,
      sessionId: getSessionId(),
      uid: user?.uid ?? null,
      ts: serverTimestamp(),
      clientTs: Date.now(),
    });
  } catch {
    /* analytics must never break the app */
  }
};
