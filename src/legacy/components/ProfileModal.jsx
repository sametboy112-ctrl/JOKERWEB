import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaCrown, FaTimes, FaCheck, FaCopy, FaUserCircle } from 'react-icons/fa';

const plans = [
  { id: 'monthly', label: 'Monthly', price: '5,000 TZS', period: '30 days' },
  { id: 'yearly', label: 'Yearly', price: '50,000 TZS', period: '12 months', featured: true },
];

const paymentAccounts = [
  { name: 'Tigo Pesa', number: '0717560971', code: '*150*01#' },
  { name: 'M-Pesa', number: '0749565209', code: '*150*00#' },
];

function ProfileModal({ isOpen, onClose, user, watchedCount = 0 }) {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [copied, setCopied] = useState('');
  const plan = useMemo(() => plans.find((item) => item.id === selectedPlan) || plans[0], [selectedPlan]);

  const copyNumber = async (number) => {
    try {
      await navigator.clipboard.writeText(number);
      setCopied(number);
      window.setTimeout(() => setCopied(''), 1600);
    } catch {
      setCopied('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
            <motion.section role="dialog" aria-modal="true" aria-labelledby="profile-title" className="pointer-events-auto w-full max-w-md max-h-[90vh] overflow-y-auto rounded-[2rem] border border-white/15 bg-[#17181c]/95 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl" initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: 0.98 }}>
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-orange-500 shadow-lg shadow-red-500/20"><FaUserCircle className="text-2xl text-white" /></div><div><h2 id="profile-title" className="text-lg font-bold text-white">My Profile</h2><p className="text-xs text-gray-500">Account and premium membership</p></div></div>
                <button type="button" onClick={onClose} aria-label="Close profile" className="rounded-full bg-white/10 p-2.5 text-gray-300 transition hover:bg-white/20 hover:text-white"><FaTimes /></button>
              </div>
              <div className="space-y-4 p-5">
                <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.07] p-4 shadow-inner shadow-white/[0.03]"><p className="text-base font-semibold text-white">{user?.user_metadata?.displayName || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Member'}</p><p className="mt-1 break-all text-sm text-gray-400">{user?.email}</p><div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-black/20 p-3.5"><p className="text-2xl font-black text-white">{watchedCount}</p><p className="text-xs text-gray-500">Movies watched</p></div><div className="rounded-2xl bg-black/20 p-3.5"><p className="text-2xl font-black text-amber-400">Free</p><p className="text-xs text-gray-500">Current plan</p></div></div></div>
                <div><div className="mb-3 flex items-center gap-2"><FaCrown className="text-amber-400" /><h3 className="font-bold text-white">Premium membership</h3></div><div className="grid grid-cols-2 gap-3">{plans.map((item) => <button key={item.id} type="button" onClick={() => setSelectedPlan(item.id)} className={`rounded-2xl border p-4 text-left transition ${selectedPlan === item.id ? 'border-red-500 bg-red-500/10' : 'border-white/10 bg-white/[0.03] hover:border-white/25'}`}><p className="text-sm font-semibold text-white">{item.label}</p><p className="mt-1 text-lg font-black text-red-400">{item.price}</p><p className="text-xs text-gray-500">{item.period}</p>{item.featured && <span className="mt-2 inline-block text-[10px] font-bold uppercase tracking-wider text-amber-400">Best value</span>}</button>)}</div></div>
                <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4"><p className="text-sm font-semibold text-white">Pay {plan.price} by USSD</p><p className="mt-1 text-xs leading-relaxed text-gray-400">Use your phone&apos;s mobile-money menu, choose Send Money, enter one of the numbers below, confirm the amount, and enter your PIN in the official mobile-money prompt. Never share your PIN here.</p>{paymentAccounts.map((account) => <div key={account.name} className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-black/20 p-3.5"><div><p className="text-xs font-semibold text-white">{account.name}</p><p className="text-sm text-gray-300">{account.number}</p><p className="text-[11px] text-gray-500">Dial {account.code}</p></div><button type="button" onClick={() => copyNumber(account.number)} className="flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-2 text-xs text-gray-300 hover:bg-white/20"><FaCopy />{copied === account.number ? 'Copied' : 'Copy'}</button></div>)}<div className="mt-3 flex items-start gap-2 text-xs text-gray-500"><FaCheck className="mt-0.5 shrink-0 text-green-400" />After payment, contact admin with your transaction reference to activate premium.</div></div>
              </div>
            </motion.section>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ProfileModal;

// The displayed accounts are payment instructions only; PIN entry remains inside the mobile-money provider flow.
// eslint-disable-next-line react-refresh/only-export-components
export { paymentAccounts, plans };
    
