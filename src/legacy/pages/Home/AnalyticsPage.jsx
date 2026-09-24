import { useEffect, useMemo, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { motion } from 'framer-motion';
import {
  BiBarChartAlt2, BiGroup, BiTrendingUp, BiMoviePlay,
} from 'react-icons/bi';
import { FaEye, FaPlay } from 'react-icons/fa';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { db } from '../../firebase';
import SEO from './SEO';

const HISTORY_LIMIT = 500;

const useAnalyticsCollection = (name) => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    let settled = false;
    const q = query(collection(db, name), orderBy('clientTs', 'desc'), limit(HISTORY_LIMIT));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        settled = true;
        setDocs(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      () => {
        // Missing/denied Firestore rules for this collection — fail quietly.
        settled = true;
        setErrored(true);
        setLoading(false);
      }
    );
    // Some misconfigurations (e.g. no Firestore database provisioned) neither
    // resolve nor reject the listener — stop the spinner after a timeout instead
    // of hanging forever.
    const timeout = setTimeout(() => {
      if (!settled) {
        setErrored(true);
        setLoading(false);
      }
    }, 6000);
    return () => { unsub(); clearTimeout(timeout); };
  }, [name]);

  return { docs, loading, errored };
};

const dayKey = (ts) => {
  const d = new Date(ts);
  return d.toISOString().slice(0, 10);
};

const dayLabel = (key) => {
  const d = new Date(`${key}T00:00:00`);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const last7DayKeys = () => {
  const keys = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    keys.push(d.toISOString().slice(0, 10));
  }
  return keys;
};

const timeAgo = (ts) => {
  if (!ts) return '—';
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
};

const StatCard = ({ icon: Icon, label, value, tint }) => (
  <div className="flex items-center gap-4 bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-5">
    <div className={`flex items-center justify-center w-12 h-12 rounded-2xl shrink-0 ${tint}`}>
      <Icon className="text-xl" />
    </div>
    <div className="flex flex-col min-w-0">
      <span className="text-2xl font-bold text-white tracking-tight leading-none">{value}</span>
      <span className="text-gray-500 text-xs font-medium mt-1 truncate">{label}</span>
    </div>
  </div>
);

export default function AnalyticsPage() {
  const { docs: visits, loading: visitsLoading, errored: visitsErrored } = useAnalyticsCollection('analytics_visits');
  const { docs: requests, loading: requestsLoading, errored: requestsErrored } = useAnalyticsCollection('analytics_requests');

  const stats = useMemo(() => {
    const uniqueSessions = new Set(visits.map((v) => v.sessionId).filter(Boolean));
    const uniquePaths = new Map();
    visits.forEach((v) => uniquePaths.set(v.path, (uniquePaths.get(v.path) || 0) + 1));
    const topPages = [...uniquePaths.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);

    const titleCounts = new Map();
    requests.forEach((r) => {
      const key = r.title || 'Unknown';
      titleCounts.set(key, (titleCounts.get(key) || 0) + 1);
    });
    const topTitles = [...titleCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

    const dayBuckets = new Map(last7DayKeys().map((k) => [k, 0]));
    visits.forEach((v) => {
      const key = dayKey(v.clientTs || Date.now());
      if (dayBuckets.has(key)) dayBuckets.set(key, dayBuckets.get(key) + 1);
    });
    const chartData = [...dayBuckets.entries()].map(([key, count]) => ({
      day: dayLabel(key),
      visits: count,
    }));

    return {
      totalVisits: visits.length,
      uniqueVisitors: uniqueSessions.size,
      totalRequests: requests.length,
      topPages,
      topTitles,
      chartData,
    };
  }, [visits, requests]);

  const loading = visitsLoading || requestsLoading;
  const denied = visitsErrored || requestsErrored;

  return (
    <div className="min-h-screen bg-[#0a0c12] text-white px-4 sm:px-6 md:px-12 pt-[calc(env(safe-area-inset-top)+1.5rem)] md:pt-10 pb-20">
      <SEO title="Visitor Analytics — JOKER MOVIES" description="Visitor and content-request analytics." noSuffix />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center gap-3.5 mb-8">
          <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-white/[0.06] border border-white/[0.1]">
            <BiBarChartAlt2 className="text-red-400 text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight leading-none">Visitor Analytics</h1>
            <p className="text-gray-500 text-sm mt-1">Live visits and content requests from your audience</p>
          </div>
        </div>

        {denied && (
          <div className="mb-8 bg-yellow-500/10 border border-yellow-500/25 text-yellow-300 text-sm rounded-2xl p-4">
            Couldn&apos;t load analytics from Firestore. This usually means either the project&apos;s Firestore
            database hasn&apos;t been created yet, or its security rules block reads on{' '}
            <code className="text-yellow-200">analytics_visits</code> / <code className="text-yellow-200">analytics_requests</code>.
            Check the Firebase console for this project to fix it.
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-24 rounded-3xl bg-white/[0.04] animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <StatCard icon={FaEye} label={`Page visits (last ${HISTORY_LIMIT})`} value={stats.totalVisits} tint="bg-blue-500/15 text-blue-400" />
              <StatCard icon={BiGroup} label="Unique visitor sessions" value={stats.uniqueVisitors} tint="bg-emerald-500/15 text-emerald-400" />
              <StatCard icon={FaPlay} label={`Watch requests (last ${HISTORY_LIMIT})`} value={stats.totalRequests} tint="bg-red-500/15 text-red-400" />
            </div>

            {/* Visits over time */}
            <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-5 md:p-6 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <BiTrendingUp className="text-red-400" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Visits — last 7 days</h2>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="visitsFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="day" stroke="rgba(255,255,255,0.35)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.35)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} width={30} />
                    <Tooltip
                      contentStyle={{ background: '#12141c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="visits" stroke="#ef4444" strokeWidth={2} fill="url(#visitsFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Top pages */}
              <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-5 md:p-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Most visited pages</h2>
                {stats.topPages.length === 0 ? (
                  <p className="text-gray-600 text-sm">No visits recorded yet.</p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {stats.topPages.map(([path, count]) => (
                      <li key={path} className="flex items-center justify-between gap-3">
                        <span className="text-sm text-gray-300 truncate font-mono">{path}</span>
                        <span className="text-xs font-bold text-white bg-white/10 rounded-full px-2.5 py-1 shrink-0">{count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Top requested titles */}
              <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-5 md:p-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Most requested titles</h2>
                {stats.topTitles.length === 0 ? (
                  <p className="text-gray-600 text-sm">No watch requests recorded yet.</p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {stats.topTitles.map(([title, count]) => (
                      <li key={title} className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2 text-sm text-gray-300 truncate min-w-0">
                          <BiMoviePlay className="text-red-400 shrink-0" />
                          <span className="truncate">{title}</span>
                        </span>
                        <span className="text-xs font-bold text-white bg-red-500/20 text-red-300 rounded-full px-2.5 py-1 shrink-0">{count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Recent activity */}
            <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-5 md:p-6">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Recent activity</h2>
              <div className="flex flex-col divide-y divide-white/[0.06] max-h-96 overflow-y-auto">
                {[...requests.slice(0, 15).map((r) => ({ ...r, kind: 'request' })),
                  ...visits.slice(0, 15).map((v) => ({ ...v, kind: 'visit' }))]
                  .sort((a, b) => (b.clientTs || 0) - (a.clientTs || 0))
                  .slice(0, 20)
                  .map((entry) => (
                    <div key={`${entry.kind}-${entry.id}`} className="flex items-center gap-3 py-2.5">
                      <span className={`flex items-center justify-center w-8 h-8 rounded-xl shrink-0 ${entry.kind === 'request' ? 'bg-red-500/15 text-red-400' : 'bg-blue-500/15 text-blue-400'}`}>
                        {entry.kind === 'request' ? <FaPlay className="text-xs" /> : <FaEye className="text-xs" />}
                      </span>
                      <span className="text-sm text-gray-300 truncate flex-1 min-w-0">
                        {entry.kind === 'request' ? `Requested "${entry.title}"` : `Visited ${entry.path}`}
                      </span>
                      <span className="text-xs text-gray-600 shrink-0">{timeAgo(entry.clientTs)}</span>
                    </div>
                  ))}
                {requests.length === 0 && visits.length === 0 && (
                  <p className="text-gray-600 text-sm py-2">No activity recorded yet.</p>
                )}
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
