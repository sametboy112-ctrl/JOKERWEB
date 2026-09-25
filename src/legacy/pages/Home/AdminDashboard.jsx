import { useEffect, useState } from 'react';
import { supabase, subscribeToAuth } from '../../supabase';
import { FaCheckCircle, FaLock, FaUsers } from 'react-icons/fa';
import AnalyticsPage from './AnalyticsPage';
import SEO from './SEO';

const ADMIN_EMAIL = 'jokertzman@gmail.com';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-[#0a0c12]" aria-busy="true" />;
  }

  if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL) {
    return (
      <main className="min-h-screen bg-[#0a0c12] px-6 py-20 text-white">
        <SEO title="Admin Login — JOKER MOVIES" description="Admin dashboard access." noSuffix />
        <div className="mx-auto max-w-md rounded-[2rem] border border-white/10 bg-white/[0.05] p-8 text-center shadow-2xl">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/15 text-red-400"><FaLock /></div>
          <h1 className="text-2xl font-bold">Admin access required</h1>
          <p className="mt-2 text-sm leading-6 text-gray-400">Sign in with the authorized admin account to view visitor requests and watch activity.</p>
          <p className="mt-6 text-xs text-gray-600">Authorized account: {ADMIN_EMAIL}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f1014] text-white">
      <div className="border-b border-white/10 bg-[#17181c] px-4 py-4 md:pl-[108px]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <FaUsers className="text-red-400" />
            <span className="text-sm font-semibold">Admin dashboard</span>
            <span className="hidden items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] font-bold text-emerald-300 sm:flex"><FaCheckCircle /> Verified admin</span>
          </div>
          <span className="text-xs text-gray-500">{user.email}</span>
        </div>
      </div>
      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-5 md:pl-[108px] lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-[1.25rem] border border-white/10 bg-[#1b1c20] p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">Overview</p>
          <h1 className="mt-1 text-xl font-bold">Visitor activity</h1>
          <p className="mt-1 text-sm text-gray-400">Review requests, watched movies, premium approvals, and verified members.</p>
          <div className="mt-5"><AnalyticsPage /></div>
        </section>
        <aside className="space-y-3">
          {['Premium requests', 'Watched movies', 'User accounts', 'Verified users'].map((label, index) => (
            <div key={label} className="flex items-center justify-between rounded-[1.15rem] border border-white/10 bg-[#1b1c20] px-4 py-4">
              <div><p className="text-sm font-semibold text-gray-200">{label}</p><p className="mt-1 text-xs text-gray-500">Manage from admin tools</p></div>
              <span className={`text-xl font-black ${index === 0 ? 'text-[#e50914]' : 'text-white'}`}>{index === 0 ? '0' : '—'}</span>
            </div>
          ))}
          <div className="rounded-[1.15rem] border border-red-500/20 bg-red-500/10 p-4"><p className="text-sm font-semibold">Admin controls</p><p className="mt-1 text-xs leading-5 text-gray-400">Only the authorized admin email can access this dashboard. Never store payment PINs or passwords.</p></div>
        </aside>
      </div>
    </main>
  );
}

export { ADMIN_EMAIL };

// Admin authorization is intentionally email-scoped here; never expose a Supabase service-role key in the browser.
void supabase;
      
