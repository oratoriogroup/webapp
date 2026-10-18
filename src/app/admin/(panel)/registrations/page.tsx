import Link from 'next/link';
import { Search, Download, FileText, ChevronLeft, ChevronRight, MailCheck, MailWarning, CheckCircle2 } from 'lucide-react';
import { requireAdmin } from '@/lib/admin';
import { sql } from '@/lib/db';
import type { Answers } from '@/lib/form';
import { TYPE_LABEL, fmtWAT, heardFrom } from '../shared';
import { filterSql, TYPES } from './filter';

export const metadata = { title: 'Registrations' };

const PAGE = 25;

type Row = {
  id: string; ref_code: string; full_name: string; email: string; whatsapp: string; connect_type: string;
  location: string | null; church: string | null; answers: Answers; created_at: Date; email_sent_at: Date | null; checked_in_at: Date | null;
};

const dash = (v: string | null | undefined) => (v && v.trim() ? v : '-');

export default async function Registrations({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin();
  const sp = await searchParams;
  const q = String(sp.q || '').trim().slice(0, 100);
  const type = TYPES.includes(String(sp.type)) ? String(sp.type) : '';
  const page = Math.max(1, Math.min(10_000, Number(sp.page) || 1));

  const where = filterSql(q, type);
  const [rows, [{ n }]] = await Promise.all([
    sql<Row[]>`select id, ref_code, full_name, email, whatsapp, connect_type, location, church, answers, created_at, email_sent_at, checked_in_at
      from public.registrations ${where} order by created_at desc limit ${PAGE} offset ${(page - 1) * PAGE}`,
    sql<{ n: number }[]>`select count(*)::int n from public.registrations ${where}`,
  ]);
  const pages = Math.max(1, Math.ceil(n / PAGE));
  const qs = (p: Record<string, string | number>) => {
    const u = new URLSearchParams();
    if (q) u.set('q', q);
    if (type) u.set('type', type);
    for (const [k, v] of Object.entries(p)) u.set(k, String(v));
    return `?${u.toString()}`;
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="h-display text-4xl">Registrations</h1>
          <p className="mt-1 text-sm text-muted">{n.toLocaleString()} {n === 1 ? 'person' : 'people'}{type ? `, ${TYPE_LABEL[type]}` : ''}{q ? `, matching "${q}"` : ''}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`/admin/export/pdf${qs({})}`} className="btn-outline !py-2.5"><FileText className="size-4" /> Export PDF</a>
          <a href={`/admin/export${qs({})}`} className="btn-outline !py-2.5"><Download className="size-4" /> Export CSV</a>
        </div>
      </div>

      <form className="mt-5 flex flex-col gap-2 sm:flex-row" role="search">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" />
          <input name="q" defaultValue={q} placeholder="Search name, email, phone or reference" className="field !pl-11" aria-label="Search registrations" />
        </div>
        <select name="type" defaultValue={type} className="field sm:w-56" aria-label="Filter by type">
          <option value="">All types</option>
          {TYPES.map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
        </select>
        <button className="btn-primary min-h-12">Apply</button>
      </form>

      {rows.length === 0 ? (
        <div className="card mt-6 p-10 text-center text-muted">No registrations found.</div>
      ) : (
        <>
          {/* Phones: cards */}
          <ul className="mt-5 space-y-2 md:hidden">
            {rows.map((r) => (
              <li key={r.id}>
                <Link href={`/admin/registrations/${r.id}`} className="card block p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold">{r.full_name}</p>
                    <span className="shrink-0 text-xs text-muted">{fmtWAT(r.created_at)}</span>
                  </div>
                  <dl className="mt-2 grid grid-cols-[88px_1fr] gap-x-3 gap-y-1 text-sm">
                    <dt className="text-muted">Phone</dt><dd>{r.whatsapp}</dd>
                    <dt className="text-muted">Email</dt><dd className="truncate">{r.email}</dd>
                    <dt className="text-muted">Location</dt><dd>{dash(r.location)}</dd>
                    <dt className="text-muted">Church</dt><dd>{dash(r.church)}</dd>
                    <dt className="text-muted">Heard via</dt><dd>{heardFrom(r.answers)}</dd>
                  </dl>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-brand-soft px-2.5 py-1 font-semibold text-brand">{TYPE_LABEL[r.connect_type]}</span>
                    {r.email_sent_at ? <MailCheck className="size-4 text-brand-green" aria-label="Email sent" /> : <MailWarning className="size-4 text-brand-red" aria-label="Email not sent" />}
                    {r.checked_in_at && <CheckCircle2 className="size-4 text-brand-green" aria-label="Checked in" />}
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {/* Tablet and up: table */}
          <div className="card mt-5 hidden overflow-x-auto md:block">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="border-b border-line text-xs tracking-wider text-muted uppercase">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Phone</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">City / State / Country</th>
                  <th className="px-4 py-3 font-semibold">Church / fellowship / campus</th>
                  <th className="px-4 py-3 font-semibold">Heard about us</th>
                  <th className="px-4 py-3 font-semibold">Connecting as</th>
                  <th className="px-4 py-3 font-semibold">Email sent</th>
                  <th className="px-4 py-3 font-semibold">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((r) => (
                  <tr key={r.id} className="align-top hover:bg-surface-2">
                    <td className="px-4 py-3">
                      <Link href={`/admin/registrations/${r.id}`} className="font-semibold hover:text-brand">{r.full_name}</Link>
                      <div className="font-mono text-xs text-muted">{r.ref_code}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{r.whatsapp}</td>
                    <td className="max-w-56 truncate px-4 py-3" title={r.email}>{r.email}</td>
                    <td className="max-w-48 px-4 py-3">{dash(r.location)}</td>
                    <td className="max-w-48 px-4 py-3">{dash(r.church)}</td>
                    <td className="max-w-44 px-4 py-3">{heardFrom(r.answers)}</td>
                    <td className="px-4 py-3"><span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-brand">{TYPE_LABEL[r.connect_type]}</span></td>
                    <td className="px-4 py-3 whitespace-nowrap">{r.email_sent_at ? <span className="inline-flex items-center gap-1 text-brand-green"><MailCheck className="size-4" /> Sent</span> : <span className="inline-flex items-center gap-1 text-brand-red"><MailWarning className="size-4" /> Not sent</span>}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted">{fmtWAT(r.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex items-center justify-between text-sm">
            <span className="text-muted">Page {page} of {pages}</span>
            <div className="flex gap-2">
              {page > 1 ? <Link href={qs({ page: page - 1 })} className="btn-outline !py-2"><ChevronLeft className="size-4" /> Prev</Link> : null}
              {page < pages ? <Link href={qs({ page: page + 1 })} className="btn-outline !py-2">Next <ChevronRight className="size-4" /></Link> : null}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
