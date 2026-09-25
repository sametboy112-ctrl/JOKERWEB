import { createFileRoute } from '@tanstack/react-router';
import { clientPage } from '@/lib/client-page';

export const Route = createFileRoute('/admin')({
  head: () => ({
    meta: [
      { title: 'Admin Dashboard — JOKER MOVIES' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: clientPage(() => import('@/legacy/pages/Home/AdminDashboard')),
});
