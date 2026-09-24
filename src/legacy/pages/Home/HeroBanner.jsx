import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toDetailPath } from './urlUtils';
import { FaPlay, FaInfoCircle, FaStar, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { BiCalendar } from 'react-icons/bi';

const API_KEY  = (import.meta.env.VITE_TMDB_API || "f66eb21a452b1501f2ac555e2cff7ffc");
const BASE_URL = (import.meta.env.VITE_BASE_URL || "https://api.themoviedb.org/3");
const BACKDROP = 'https://image.tmdb.org/t/p/w1280'; // Optimized down from 'original'
const INTERVAL = 8000;
const TRAILER_DELAY = 1200; // brief pause on the poster before the trailer takes over

/* TMDB genre ID → label */
const GENRE_MAP = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance',
  878: 'Sci-Fi', 53: 'Thriller', 10752: 'War', 37: 'Western',
  10759: 'Action & Adventure', 10762: 'Kids', 10765: 'Sci-Fi & Fantasy',
  10768: 'War & Politics',
};

const useTrending = () => {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const url = new URL(`${BASE_URL}/trending/all/week`);
        url.searchParams.append('api_key', API_KEY);
        url.searchParams.append('language', 'en-US');
        const res  = await fetch(url);
        const data = await res.json();
        if (!cancelled) {
          setItems(
            (data.results ?? [])
              .filter(i => i.backdrop_path && (i.title || i.name) && i.overview)
              .slice(0, 6)
          );
        }
      } catch { /* silently ignore */ }
      finally  { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  return { items, loading };
};

/** Fetches and caches a YouTube trailer key per media item. */
const useTrailerKey = (item) => {
  const cacheRef = useRef(new Map());
  const [trailerKey, setTrailerKey] = useState(null);

  useEffect(() => {
    if (!item) return;
    const cached = cacheRef.current.get(item.id);
    if (cached !== undefined) {
      setTrailerKey(cached);
      return;
    }
    let cancelled = false;
    const mediaType = item.media_type === 'tv' ? 'tv' : 'movie';
    fetch(`${BASE_URL}/${mediaType}/${item.id}/videos?api_key=${API_KEY}`)
      .then(res => res.json())
      .then(data => {
        if (cancelled) return;
        const video = (data.results ?? []).find(v => v.site === 'YouTube' && v.type === 'Trailer')
          ?? (data.results ?? []).find(v => v.site === 'YouTube' && v.type === 'Teaser');
        const key = video?.key ?? null;
        cacheRef.current.set(item.id, key);
        setTrailerKey(key);
      })
      .catch(() => {
        cacheRef.current.set(item.id, null);
        if (!cancelled) setTrailerKey(null);
      });
    return () => { cancelled = true; };
  }, [item?.id]);

  return trailerKey;
};

export default function HeroBanner() {
  const { items, loading } = useTrending();
  const [active, setActive] = useState(0);
  const [fade,   setFade]   = useState(true);
  const [barKey, setBarKey] = useState(0);
  const [playTrailer, setPlayTrailer] = useState(false);
  const [muted, setMuted] = useState(true);
  const navigate = useNavigate();

  const item = items[active];
  const trailerKey = useTrailerKey(item);

  const goTo = useCallback((next) => {
    setFade(false);
    setPlayTrailer(false);
    setTimeout(() => {
      setActive(typeof next === 'function' ? next : () => next);
      setFade(true);
      setBarKey(k => k + 1);
    }, 300);
  }, []);

  // Give the poster a brief moment on screen, then fade into the trailer.
  useEffect(() => {
    setPlayTrailer(false);
    if (!trailerKey) return;
    const t = setTimeout(() => setPlayTrailer(true), TRAILER_DELAY);
    return () => clearTimeout(t);
  }, [trailerKey, active]);

  useEffect(() => {
    if (items.length < 2) return;
    const id = setInterval(() => goTo(prev => (prev + 1) % items.length), INTERVAL);
    return () => clearInterval(id);
  }, [items.length, goTo, barKey]);

  if (loading) {
    return (
      <div className="w-full px-4 sm:px-6 md:px-10 pt-[calc(env(safe-area-inset-top)+1rem)] md:pt-8">
        <div className="max-w-6xl mx-auto">
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] rounded-[28px] overflow-hidden bg-white/[0.04] animate-pulse" />
          <div className="mt-5 space-y-3 max-w-lg">
            <div className="h-3 w-24 rounded-full bg-white/[0.06] animate-pulse" />
            <div className="h-7 w-3/4 rounded-lg bg-white/[0.08] animate-pulse" />
            <div className="h-4 w-1/2 rounded bg-white/[0.06] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }
  if (!item) return null;

  const isTV    = item.media_type === 'tv';
  const title   = item.title  || item.name;
  const year    = (item.release_date || item.first_air_date || '').slice(0, 4);
  const rating  = item.vote_average > 0 ? item.vote_average.toFixed(1) : null;
  const genres  = (item.genre_ids ?? []).slice(0, 3).map(id => GENRE_MAP[id]).filter(Boolean);
  const overview = (item.overview ?? '').slice(0, 200) + ((item.overview ?? '').length > 200 ? '…' : '');

  const handlePlay = () => navigate(toDetailPath(isTV ? 'tv' : 'movie', item.id, title));
  const showingTrailer = playTrailer && !!trailerKey;

  return (
    <div className="w-full px-4 sm:px-6 md:px-10 pt-[calc(env(safe-area-inset-top)+1rem)] md:pt-8 pb-2 select-none">
      <div className="max-w-6xl mx-auto">

        {/* ── Media stage: shows the FULL picture, never cropped ── */}
        <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] rounded-[28px] overflow-hidden bg-black shadow-[0_20px_60px_rgba(0,0,0,0.5)] ring-1 ring-white/[0.08]">

          {/* Ambient blurred fill so letterboxed edges never show plain black */}
          <div className={`absolute inset-0 transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}>
            <img
              src={`${BACKDROP}${item.backdrop_path}`}
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="w-full h-full object-cover scale-125 blur-3xl opacity-70"
            />
          </div>

          {/* Full, uncropped poster image */}
          <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${fade && !showingTrailer ? 'opacity-100' : 'opacity-0'}`}>
            <img
              src={`${BACKDROP}${item.backdrop_path}`}
              alt={title}
              loading="lazy"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Trailer, once loaded — fills the frame naturally at 16:9 */}
          {trailerKey && (
            <div className={`absolute inset-0 transition-opacity duration-700 ${showingTrailer ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <iframe
                key={trailerKey}
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=${muted ? 1 : 0}&controls=0&modestbranding=1&loop=1&playlist=${trailerKey}&playsinline=1&rel=0`}
                title={`${title} — Trailer`}
                allow="autoplay; encrypted-media"
                className="w-full h-full scale-[1.32] pointer-events-none"
              />
            </div>
          )}

          {/* Subtle bottom fade for legibility of the badge/mute row */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent pointer-events-none" />

          {/* Top row: type badge + trailer indicator */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-xl border border-white/20 text-white text-[11px] font-semibold px-3 py-1.5 rounded-full">
              {isTV ? 'TV Series' : 'Movie'}
            </span>
            {showingTrailer && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-xl border border-white/20 text-white text-[11px] font-semibold px-3 py-1.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  Trailer
                </span>
                <button
                  onClick={() => setMuted(m => !m)}
                  aria-label={muted ? 'Unmute trailer' : 'Mute trailer'}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-white/15 backdrop-blur-xl border border-white/20 text-white active:scale-90 transition-transform"
                >
                  {muted ? <FaVolumeMute className="text-xs" /> : <FaVolumeUp className="text-xs" />}
                </button>
              </div>
            )}
          </div>

          {/* Progress pills, bottom-center of the stage */}
          {items.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { if (i !== active) goTo(i); }}
                  aria-label={`Slide ${i + 1}`}
                  className="relative overflow-hidden rounded-full transition-all duration-300"
                  style={{ width: i === active ? 24 : 6, height: 6 }}
                >
                  <span className="absolute inset-0 rounded-full bg-white/25" />
                  {i === active && (
                    <span
                      key={barKey}
                      className="absolute inset-y-0 left-0 rounded-full bg-white"
                      style={{ animation: `fillBar ${INTERVAL}ms linear forwards` }}
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Info, below the stage — normal reading size, iOS-clean ── */}
        <div className={`mt-5 md:mt-6 max-w-xl transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight text-balance mb-2">
            {title}
          </h2>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-3">
            {rating && (
              <span className="flex items-center gap-1 text-gray-300 text-[13px] font-medium">
                <FaStar className="text-yellow-400 text-[11px]" />
                {rating}
              </span>
            )}
            {year && (
              <span className="flex items-center gap-1 text-gray-400 text-[13px]">
                <BiCalendar className="text-gray-500 text-[11px]" />
                {year}
              </span>
            )}
            {genres.length > 0 && (
              <span className="text-gray-400 text-[13px]">{genres.join(' · ')}</span>
            )}
          </div>

          {overview && (
            <p className="text-gray-400 text-sm leading-relaxed mb-5 hidden sm:block">
              {overview}
            </p>
          )}

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePlay}
              className="flex items-center gap-2 bg-white hover:bg-white/90 text-black font-semibold px-5 py-2.5 rounded-full transition-all duration-200 active:scale-95 text-sm"
            >
              <FaPlay className="text-[11px]" />
              Play
            </button>
            <button
              onClick={handlePlay}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/[0.16] backdrop-blur-xl border border-white/15 text-white font-medium px-5 py-2.5 rounded-full transition-all duration-200 active:scale-95 text-sm"
            >
              <FaInfoCircle className="text-xs" />
              Details
            </button>
          </div>
        </div>
      </div>

      <style>{`@keyframes fillBar { from { width:0% } to { width:100% } }`}</style>
    </div>
  );
}
