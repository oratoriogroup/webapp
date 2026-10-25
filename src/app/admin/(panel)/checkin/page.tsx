import Link from 'next/link';
import { Search, UserCheck, Lock } from 'lucide-react';
import { checkinOpen, CHECKIN_OPENS_LABEL } from '@/lib/checkin';
import { requireAdmin } from '@/lib/admin';
import { sql } from '@/lib/db';
import { TYPE_LABEL, fmtWAT } from '../shared';
import Scanner from './Scanner';
import AdminHeader, { cardCls } from '../AdminHeader';

export const metadata = { title: 'Check-in' };

type Row = { checkin_code: string; full_name: string; whatsapp: string; email: string; ref_code: string; connect_type: string; checked_in_at: Date | null };

export default async function CheckinPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin();
  const q = String((await searchParams).q || '').trim().slice(0, 100);
  const like = `%${q.replace(/[\\%_]/g, (c) => '\\' + c)}%`;
  const [stats] = await sql<{ total: number; inside: number; attend: number }[]>`
    select count(*)::int total, count(*) filter (where checked_in_at is not null)::int inside, count(*) filter (where connect_type = 'attend')::int attend from public.registrations`;
  const rows = q
    ? await sql<Row[]>`select checkin_code, full_name, whatsapp, email, ref_code, connect_type, checked_in_at from public.registrations
        where full_name ilike ${like} or email ilike ${like} or whatsapp ilike ${like} or ref_code ilike ${like} order by full_name limit 30`
    : [];
  return (
    <div>
      <AdminHeader title="Check-in" subtitle="Scan an attendee's pass, or search by name, phone, email or reference." />
      {!checkinOpen() && (
        <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900 sm:mt-5 sm:gap-3 sm:p-4 sm:text-sm">
          <Lock className="mt-0.5 size-4 shrink-0" />
          <p><strong>Check-in opens {CHECKIN_OPENS_LABEL}.</strong> You can scan a pass now to confirm it is genuine, but nobody can be checked in until then.</p>
        </div>
      )}
      {/* MOBILE_CHECKIN_22OCT2026: single minmax(0,1fr) column on phones and
          tablets (side by side only from 1280px) so nothing is squeezed;
          scanner first, since that is what door staff use. */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:mt-6 sm:gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      {/* Desktop: scanner and counts stay in view while scrolling long results. */}
      <div className="min-w-0 xl:sticky xl:top-6 xl:self-start">
      <Scanner />
      <div className="mt-3 grid grid-cols-3 gap-2 sm:mt-4 sm:gap-3">
        <div className={`${cardCls} min-w-0 p-3 sm:p-4`}><p className="text-2xl font-bold tabular-nums text-brand-green sm:text-3xl">{stats!.inside}</p><p className="truncate text-[11px] text-muted sm:text-xs">Checked in</p></div>
        <div className={`${cardCls} min-w-0 p-3 sm:p-4`}><p className="text-2xl font-bold tabular-nums sm:text-3xl">{stats!.attend}</p><p className="truncate text-[11px] text-muted sm:text-xs"><span className="sm:hidden">To attend</span><span className="hidden sm:inline">Registered to attend</span></p></div>
        <div className={`${cardCls} min-w-0 p-3 sm:p-4`}><p className="text-2xl font-bold tabular-nums sm:text-3xl">{stats!.total}</p><p className="truncate text-[11px] text-muted sm:text-xs"><span className="sm:hidden">All</span><span className="hidden sm:inline">All registrations</span></p></div>
      </div>
      </div>
      <div className="min-w-0">
      <form className="flex min-w-0 gap-2" role="search">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" />
          <input name="q" defaultValue={q} placeholder="Name, phone, email, ref" className="field !pl-11 max-[359px]:placeholder:text-[15px]" aria-label="Search attendees" />
        </div>
        <button className="btn-primary min-h-12 shrink-0 !px-4 sm:!px-5" aria-label="Search"><Search className="size-4 sm:hidden" /><span className="hidden sm:inline">Search</span></button>
      </form>
      {!q && (
        <p className="mt-3 hidden rounded-2xl border border-dashed border-line p-4 text-sm text-muted xl:block">
          No pass with them? Search by name, phone, email or reference, then tap the person to open their check-in screen.
        </p>
      )}
      {q && (
        <ul className="mt-3 space-y-2 sm:mt-4 md:grid md:grid-cols-2 md:gap-2 md:space-y-0 xl:block xl:space-y-2">
          {rows.length === 0 && <li className="card p-6 text-center text-muted">No match for &quot;{q}&quot;.</li>}
          {rows.map((r) => (
            <li key={r.checkin_code}>
              <Link href={`/admin/checkin/${r.checkin_code}`} className="card flex min-w-0 items-center justify-between gap-3 p-3.5 hover:border-brand/40 sm:p-4">
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{r.full_name}</span>
                  <span className="block truncate text-xs text-muted">{r.whatsapp} · {TYPE_LABEL[r.connect_type]}</span>
                  <span className="block truncate font-mono text-[11px] text-muted">{r.ref_code}</span>
                </span>
                {r.checked_in_at ? (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-green/15 px-3 py-1 text-xs font-semibold text-brand-green"><UserCheck className="size-3.5" /> In<span className="hidden sm:inline"> {fmtWAT(r.checked_in_at)}</span></span>
                ) : (
                  <span className="shrink-0 rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap text-muted sm:px-3 sm:text-xs">Not in</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
      </div>
      </div>
    </div>
  );
}
