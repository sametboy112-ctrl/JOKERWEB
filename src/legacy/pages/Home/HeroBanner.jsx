import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toDetailPath } from './urlUtils';
import { FaPlay, FaInfoCircle, FaStar } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { BiCalendar } from 'react-icons/bi';

const API_KEY  = (import.meta.env.VITE_TMDB_API || "f66eb21a452b1501f2ac555e2cff7ffc");
const BASE_URL = (import.meta.env.VITE_BASE_URL || "https://api.themoviedb.org/3");
const POSTER = 'https://image.tmdb.org/t/p/w400'; // Square poster covers
const INTERVAL = 8000;

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

export default function HeroBanner() {
  const { items, loading } = useTrending();
  const [active, setActive] = useState(0);
  const [fade, setFade] = useState(true);
  const navigate = useNavigate();

  const item = items[active];

  const goTo = useCallback((next) => {
    setFade(false);
    setTimeout(() => {
      setActive(typeof next === 'function' ? next : () => next);
      setFade(true);
    }, 300);
  }, []);

  useEffect(() => {
    if (items.length < 2) return;
    const id = setInterval(() => goTo(prev => (prev + 1) % items.length), INTERVAL);
    return () => clearInterval(id);
  }, [items.length, goTo]);

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

  return (
    <div className="w-full px-4 sm:px-6 md:px-10 pt-[calc(env(safe-area-inset-top)+1rem)] md:pt-8 pb-2 select-none">
      <div className="max-w-6xl mx-auto">

        {/* Square movie cover carousel — no trailers, only full poster artwork */}
        <div className="relative max-w-sm mx-auto sm:max-w-md">
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className={`relative aspect-square rounded-[28px] overflow-hidden bg-white/[0.04] shadow-[0_20px_60px_rgba(0,0,0,0.5)] ring-1 ring-white/[0.1] transition-opacity duration-300 ${fade ? 'opacity-100' : 'opacity-0'}`}
          >
            <img
              src={`${POSTER}${item.poster_path || item.backdrop_path}`}
              alt={`${title} cover`}
              loading={active === 0 ? 'eager' : 'lazy'}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent" />
            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center bg-black/35 backdrop-blur-xl border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                {isTV ? 'TV Series' : 'Movie'}
              </span>
            </div>
            <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-3">
              <h2 className="text-lg sm:text-xl font-bold text-white leading-tight">{title}</h2>
              {rating && <span className="shrink-0 flex items-center gap-1 text-white text-sm font-semibold"><FaStar className="text-yellow-400 text-xs" />{rating}</span>}
            </div>
          </motion.div>
          {items.length > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              {items.map((_, i) => (
                <button key={i} onClick={() => { if (i !== active) goTo(i); }} aria-label={`Show cover ${i + 1}`} className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? 'w-6 bg-white' : 'w-1.5 bg-white/30'}`} />
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
