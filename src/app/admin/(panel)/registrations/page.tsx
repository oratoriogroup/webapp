import Link from 'next/link';
import { Search, Download, FileText, ChevronLeft, ChevronRight, MailCheck, Clock3, CheckCircle2 } from 'lucide-react';
import { requireAdmin } from '@/lib/admin';
import { sql } from '@/lib/db';
import type { Answers } from '@/lib/form';
import { TYPE_LABEL, TYPE_BADGE, fmtWAT, heardFrom } from '../shared';
import AdminHeader, { actionBtn, inputCls, cardCls } from '../AdminHeader';
import { filterSql, TYPES } from './filter';

export const metadata = { title: 'Registrations' };

const PAGE = 25;

type Row = {
  id: string; ref_code: string; full_name: string; email: string; whatsapp: string; connect_type: string;
  location: string | null; church: string | null; answers: Answers; created_at: Date; email_sent_at: Date | null; checked_in_at: Date | null; checkin_code: string | null;
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
    sql<Row[]>`select id, ref_code, full_name, email, whatsapp, connect_type, location, church, answers, created_at, email_sent_at, checked_in_at, checkin_code
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
      <AdminHeader title="Registrations" subtitle={`${n.toLocaleString()} ${n === 1 ? 'person' : 'people'}${type ? `, ${TYPE_LABEL[type]}` : ''}${q ? `, matching "${q}"` : ''}`}>
        <a href={`/admin/export/pdf${qs({})}`} className={actionBtn}><FileText className="size-4" /> Export PDF</a>
        <a href={`/admin/export${qs({})}`} className={actionBtn}><Download className="size-4" /> Export CSV</a>
      </AdminHeader>

      <div className={`${cardCls} mt-6 p-3`}>
        <form className="flex flex-col gap-2 sm:flex-row" role="search">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" />
            <input name="q" defaultValue={q} placeholder="Search name, email, phone or reference" className={`${inputCls} !pl-11`} aria-label="Search registrations" />
          </div>
          <select name="type" defaultValue={type} className={`${inputCls} sm:w-52`} aria-label="Filter by type">
            <option value="">All types</option>
            {TYPES.map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
          </select>
          <button className="inline-flex h-11 items-center justify-center rounded-xl bg-brand px-6 text-sm font-semibold text-white shadow-lg shadow-brand/25 hover:bg-brand-deep">Apply</button>
        </form>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { label: 'All attendees', t: '' },
            { label: 'Lagos in-person', t: 'attend' },
            { label: 'Online streams', t: 'online' },
            { label: 'Volunteers', t: 'volunteer' },
            { label: 'Partners', t: 'partner' },
          ].map((p) => {
            const u = new URLSearchParams();
            if (q) u.set('q', q);
            if (p.t) u.set('type', p.t);
            const on = type === p.t;
            return (
              <Link key={p.label} href={`?${u.toString()}`} className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${on ? 'bg-brand text-white shadow-md shadow-brand/25' : 'bg-surface-2 text-muted hover:text-brand'}`}>
                {p.label}
              </Link>
            );
          })}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className={`${cardCls} mt-6 p-10 text-center text-muted`}>No registrations found.</div>
      ) : (
        <>
          {/* Phones: cards */}
          <ul className="mt-5 space-y-2 md:hidden">
            {rows.map((r) => (
              <li key={r.id}>
                <Link href={`/admin/registrations/${r.id}`} className={`${cardCls} block p-4`}>
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
                    <code className="rounded bg-surface-2 px-2 py-0.5 font-mono text-[11px]">{r.ref_code}</code>
                    <span className={`rounded-full px-2.5 py-1 font-semibold ${TYPE_BADGE[r.connect_type]}`}>{TYPE_LABEL[r.connect_type]}</span>
                    {r.email_sent_at ? <MailCheck className="size-4 text-brand-green" aria-label="Email sent" /> : <Clock3 className="size-4 text-amber-600" aria-label="Email pending" />}
                    {r.checked_in_at && <CheckCircle2 className="size-4 text-brand-green" aria-label="Checked in" />}
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {/* Tablet and up: table. Fits the full workspace on wide screens;
              only scrolls sideways on narrower tablets. */}
          <div className={`${cardCls} mt-5 hidden w-full max-w-none overflow-x-auto md:block xl:overflow-visible`}>
            <table className="w-full table-auto text-left text-xs">
              <thead className="bg-surface-2 text-[11px] font-semibold tracking-wider text-muted uppercase">
                <tr>
                  <th className="min-w-[140px] px-3 py-3.5">Name & ref</th>
                  <th className="w-12 px-3 py-3.5">QR</th>
                  <th className="px-3 py-3.5 whitespace-nowrap">Phone</th>
                  <th className="min-w-[180px] px-3 py-3.5">Email</th>
                  <th className="min-w-[100px] px-3 py-3.5">Location</th>
                  <th className="min-w-[120px] px-3 py-3.5">Church / fellowship</th>
                  <th className="min-w-[100px] px-3 py-3.5">Heard from</th>
                  <th className="min-w-[130px] px-3 py-3.5">Connecting as</th>
                  <th className="min-w-[90px] px-3 py-3.5">Email</th>
                  <th className="px-3 py-3.5 whitespace-nowrap">Registered</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-line align-middle transition-colors hover:bg-surface-2/60">
                    <td className="px-3 py-3">
                      <Link href={`/admin/registrations/${r.id}`} className="block text-[13px] font-semibold hover:text-brand">{r.full_name}</Link>
                      <code className="mt-1 inline-block rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] whitespace-nowrap text-muted">{r.ref_code}</code>
                      {r.checked_in_at && <span className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-brand-green"><CheckCircle2 className="size-3.5" /> Checked in</span>}
                    </td>
                    <td className="w-12 px-3 py-3">
                      {r.checkin_code ? (
                        <a href={`/pass/${r.checkin_code}`} target="_blank" rel="noopener" title="Open this attendee's pass" className="block size-10 overflow-hidden rounded-md border border-line bg-white p-0.5 transition hover:border-brand/50">
                          <img src={`/api/pass/${r.checkin_code}`} alt={`Pass QR for ${r.full_name}`} width={36} height={36} loading="lazy" className="size-full" />
                        </a>
                      ) : '-'}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">{r.whatsapp}</td>
                    <td className="max-w-[220px] px-3 py-3"><span className="block truncate" title={r.email}>{r.email}</span></td>
                    <td className="px-3 py-3">{dash(r.location)}</td>
                    <td className="px-3 py-3">{dash(r.church)}</td>
                    <td className="px-3 py-3">{heardFrom(r.answers)}</td>
                    <td className="px-3 py-3"><span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${TYPE_BADGE[r.connect_type]}`}>{TYPE_LABEL[r.connect_type]}</span></td>
                    <td className="px-3 py-3 whitespace-nowrap">{r.email_sent_at ? <span className="inline-flex items-center gap-1 font-semibold text-brand-green"><MailCheck className="size-3.5" /> Sent</span> : <span className="inline-flex items-center gap-1 font-semibold text-amber-600"><Clock3 className="size-3.5" /> Pending</span>}</td>
                    <td className="px-3 py-3 text-[11px] whitespace-nowrap text-muted">{fmtWAT(r.created_at)}</td>
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
