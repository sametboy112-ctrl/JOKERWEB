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
    <main>
      <div className="border-b border-white/10 bg-[#0a0c12] px-4 py-3 text-white md:pl-[108px]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <FaUsers className="text-red-400" />
            <span className="text-sm font-semibold">Admin dashboard</span>
            <span className="hidden items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] font-bold text-emerald-300 sm:flex"><FaCheckCircle /> Verified admin</span>
          </div>
          <span className="text-xs text-gray-500">{user.email}</span>
        </div>
      </div>
      <AnalyticsPage />
    </main>
  );
}

export { ADMIN_EMAIL };

// Admin authorization is intentionally email-scoped here; never expose a Supabase service-role key in the browser.
void supabase;
      
