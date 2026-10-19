import Link from 'next/link';
import { Search, UserCheck } from 'lucide-react';
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
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
      <div className="grid grid-cols-3 gap-3">
        <div className={`${cardCls} p-4`}><p className="text-3xl font-bold">{stats!.inside}</p><p className="text-xs text-muted">Checked in</p></div>
        <div className={`${cardCls} p-4`}><p className="text-3xl font-bold">{stats!.attend}</p><p className="text-xs text-muted">Registered to attend</p></div>
        <div className={`${cardCls} p-4`}><p className="text-3xl font-bold">{stats!.total}</p><p className="text-xs text-muted">All registrations</p></div>
      </div>
      <div className="mt-4"><Scanner /></div>
      </div>
      <div>
      <form className="flex gap-2" role="search">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" />
          <input name="q" defaultValue={q} placeholder="Name, phone, email or reference" className="field !pl-11" aria-label="Search attendees" />
        </div>
        <button className="btn-primary min-h-12">Search</button>
      </form>
      {q && (
        <ul className="mt-4 space-y-2">
          {rows.length === 0 && <li className="card p-6 text-center text-muted">No match for &quot;{q}&quot;.</li>}
          {rows.map((r) => (
            <li key={r.checkin_code}>
              <Link href={`/admin/checkin/${r.checkin_code}`} className="card flex items-center justify-between gap-3 p-4 hover:border-brand/40">
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{r.full_name}</span>
                  <span className="block truncate text-xs text-muted">{r.whatsapp} · {TYPE_LABEL[r.connect_type]} · {r.ref_code}</span>
                </span>
                {r.checked_in_at ? (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-green/15 px-3 py-1 text-xs font-semibold text-brand-green"><UserCheck className="size-3.5" /> In {fmtWAT(r.checked_in_at)}</span>
                ) : (
                  <span className="shrink-0 rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold text-muted">Not in yet</span>
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
