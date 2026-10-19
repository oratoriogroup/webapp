import Link from 'next/link';
import { MessageSquareHeart, MapPin } from 'lucide-react';
import { requireAdmin } from '@/lib/admin';
import { sql } from '@/lib/db';
import { fmtWAT } from '../shared';
import TestimonyActions from './TestimonyActions';
import AdminHeader, { cardCls } from '../AdminHeader';

export const metadata = { title: 'Testimonies' };

type Tab = 'pending' | 'approved' | 'archived';
const TABS: { key: Tab; label: string }[] = [
  { key: 'pending', label: 'Pending review' },
  { key: 'approved', label: 'Approved' },
  { key: 'archived', label: 'Archived' },
];

export default async function TestimoniesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin();
  const tab: Tab = (['pending', 'approved', 'archived'] as Tab[]).includes((await searchParams).tab as Tab) ? ((await searchParams).tab as Tab) : 'pending';
  const [[counts], rows] = await Promise.all([
    sql<{ pending: number; approved: number; archived: number }[]>`select
      count(*) filter (where not approved and not archived)::int pending,
      count(*) filter (where approved)::int approved,
      count(*) filter (where archived)::int archived from public.testimonies`,
    tab === 'pending'
      ? sql<{ id: string; name: string; location: string | null; message: string; approved: boolean; archived: boolean; created_at: Date }[]>`select id, name, location, message, approved, archived, created_at from public.testimonies where not approved and not archived order by created_at desc limit 200`
      : tab === 'approved'
        ? sql<{ id: string; name: string; location: string | null; message: string; approved: boolean; archived: boolean; created_at: Date }[]>`select id, name, location, message, approved, archived, created_at from public.testimonies where approved order by approved_at desc nulls last limit 200`
        : sql<{ id: string; name: string; location: string | null; message: string; approved: boolean; archived: boolean; created_at: Date }[]>`select id, name, location, message, approved, archived, created_at from public.testimonies where archived order by created_at desc limit 200`,
  ]);
  const c = counts!;
  return (
    <div>
      <AdminHeader title="Testimonies" subtitle="Approved testimonies appear on the livestream page." />
      <div className="mt-6 flex flex-wrap gap-2" role="tablist">
        {TABS.map((t) => (
          <Link key={t.key} href={`?tab=${t.key}`} role="tab" aria-selected={tab === t.key}
            className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition ${tab === t.key ? 'bg-brand text-white shadow-lg shadow-brand/25' : 'border border-line bg-surface text-muted hover:text-brand'}`}>
            {t.label} <span className={`rounded-full px-2 text-xs ${tab === t.key ? 'bg-white/20' : 'bg-surface-2'}`}>{c[t.key]}</span>
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className={`${cardCls} mt-6 flex flex-col items-center px-6 py-16 text-center`}>
          <span className="flex size-16 items-center justify-center rounded-2xl bg-brand-soft text-brand"><MessageSquareHeart className="size-8" /></span>
          <p className="h-display mt-5 text-2xl">{tab === 'pending' ? 'Nothing waiting for review' : tab === 'approved' ? 'No approved testimonies yet' : 'Nothing archived'}</p>
          <p className="mt-2 max-w-md text-sm text-muted">
            Testimonies sent from the livestream page land here for review. Approved testimonies appear automatically on the livestream page during the event.
          </p>
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((t) => (
            <li key={t.id} className={`${cardCls} flex flex-col p-5`}>
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand">{t.name.slice(0, 1).toUpperCase()}</span>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{t.name}</p>
                  <p className="flex items-center gap-1 text-xs text-muted">{t.location && <><MapPin className="size-3" /> {t.location} ·</>} {fmtWAT(t.created_at)}</p>
                </div>
              </div>
              <p className="mt-4 flex-1 text-[15px] leading-relaxed whitespace-pre-line">&ldquo;{t.message}&rdquo;</p>
              <div className="mt-5 border-t border-line pt-4">
                <TestimonyActions id={t.id} state={t.approved ? 'approved' : t.archived ? 'archived' : 'pending'} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
