import Link from 'next/link';
import { MessageSquareHeart, MapPin } from 'lucide-react';
import { requireAdmin } from '@/lib/admin';
import { sql } from '@/lib/db';
import { fmtWAT } from '../shared';
import TestimonyActions from './TestimonyActions';
import AdminHeader, { cardCls } from '../AdminHeader';

export const metadata = { title: 'Testimonies' };

type Tab = 'pending' | 'approved' | 'archived';
const TABS: { key: Tab; label: string; short: string }[] = [
  { key: 'pending', label: 'Pending review', short: 'Pending' },
  { key: 'approved', label: 'Approved', short: 'Approved' },
  { key: 'archived', label: 'Archived', short: 'Archived' },
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
      {/* MOBILE_TESTIMONIES_22OCT2026: phones get a one-line, three-part switch. */}
      {/* Phones under 400px (most phones): label above the count, since
          "Approved" plus its badge did not fit side by side at 360-399px. */}
      <div className="mt-4 grid grid-cols-3 gap-1 rounded-2xl border border-line bg-surface p-1 shadow-sm sm:mt-6 sm:flex sm:flex-wrap sm:gap-2 sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none" role="tablist">
        {TABS.map((t) => (
          <Link key={t.key} href={`?tab=${t.key}`} role="tab" aria-selected={tab === t.key}
            className={`inline-flex h-10 min-w-0 items-center justify-center gap-1.5 rounded-xl px-2 text-[13px] font-semibold transition max-[399px]:h-12 max-[399px]:flex-col max-[399px]:gap-0.5 max-[399px]:text-[12px] max-[399px]:leading-none sm:gap-2 sm:px-4 sm:text-sm ${tab === t.key ? 'bg-brand text-white shadow-lg shadow-brand/25' : 'text-muted hover:text-brand sm:border sm:border-line sm:bg-surface'}`}>
            <span className="truncate sm:hidden">{t.short}</span><span className="hidden sm:inline">{t.label}</span> <span className={`rounded-full px-2 text-xs max-[399px]:px-1.5 max-[399px]:py-0.5 max-[399px]:text-[10px] ${tab === t.key ? 'bg-black/25' : 'bg-surface-2'}`}>{c[t.key]}</span>
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className={`${cardCls} mt-4 flex flex-col items-center px-5 py-10 text-center sm:mt-6 sm:px-6 sm:py-16`}>
          <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand sm:size-16"><MessageSquareHeart className="size-6 sm:size-8" /></span>
          <p className="h-display mt-4 text-xl sm:mt-5 sm:text-2xl">{tab === 'pending' ? 'Nothing waiting for review' : tab === 'approved' ? 'No approved testimonies yet' : 'Nothing archived'}</p>
          <p className="mt-2 max-w-md text-[13px] leading-relaxed text-muted sm:text-sm">
            Testimonies sent from the livestream page land here for review. Approved testimonies appear automatically on the livestream page during the event.
          </p>
        </div>
      ) : (
        <ul className="mt-4 grid grid-cols-1 gap-3 sm:mt-6 sm:gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {rows.map((t) => (
            <li key={t.id} className={`${cardCls} flex min-w-0 flex-col p-4 sm:p-5`}>
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand-deep dark:text-brand">{t.name.slice(0, 1).toUpperCase()}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{t.name}</p>
                  <p className="flex min-w-0 flex-wrap items-center gap-x-1 text-xs text-muted">{t.location && <><MapPin className="size-3 shrink-0" /> <span className="truncate">{t.location}</span> ·</>} <span className="whitespace-nowrap">{fmtWAT(t.created_at)}</span></p>
                </div>
              </div>
              <p className="mt-3 flex-1 text-[15px] leading-relaxed break-words whitespace-pre-line sm:mt-4">&ldquo;{t.message}&rdquo;</p>
              <div className="mt-4 border-t border-line pt-3 sm:mt-5 sm:pt-4">
                <TestimonyActions id={t.id} state={t.approved ? 'approved' : t.archived ? 'archived' : 'pending'} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
