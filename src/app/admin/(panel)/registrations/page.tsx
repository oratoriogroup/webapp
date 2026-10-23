import Link from 'next/link';
import { FileText, FileSpreadsheet, ChevronLeft, ChevronRight, MailCheck, Clock3, CheckCircle2, Phone, MessageCircle, Mail, MapPin } from 'lucide-react';
import { requireAdmin } from '@/lib/admin';
import { sql } from '@/lib/db';
import type { Answers } from '@/lib/form';
import { TYPE_LABEL, TYPE_BADGE, fmtWAT, heardFrom } from '../shared';
import AdminHeader, { pdfBtn, excelBtn, cardCls } from '../AdminHeader';
import FilterBar from './FilterBar';
import { cached } from '@/lib/ttl-cache';
import { filterSql, TYPES } from './filter';

export const metadata = { title: 'Registrations' };

const PER_PAGE = [25, 50, 100];

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
  const PAGE = PER_PAGE.includes(Number(sp.per)) ? Number(sp.per) : 25;

  // Parameterised by postgres.js (values are bound, never spliced into SQL);
  // identical admin queries within 4 seconds share one database round trip.
  const where = filterSql(q, type);
  const [rows, [{ n }]] = await cached(`regs:${q}|${type}|${page}|${PAGE}`, 4000, () =>
    Promise.all([
      sql<Row[]>`select id, ref_code, full_name, email, whatsapp, connect_type, location, church, answers, created_at, email_sent_at, checked_in_at, checkin_code
        from public.registrations ${where} order by created_at desc limit ${PAGE} offset ${(page - 1) * PAGE}`,
      sql<{ n: number }[]>`select count(*)::int n from public.registrations ${where}`,
    ]),
  );
  const pages = Math.max(1, Math.ceil(n / PAGE));
  const qs = (p: Record<string, string | number>) => {
    const u = new URLSearchParams();
    if (q) u.set('q', q);
    if (type) u.set('type', type);
    if (PAGE !== 25) u.set('per', String(PAGE));
    for (const [k, v] of Object.entries(p)) u.set(k, String(v));
    return `?${u.toString()}`;
  };

  return (
    <div>
      <AdminHeader title="Registrations" subtitle={`${n.toLocaleString()} ${n === 1 ? 'person' : 'people'}${type ? `, ${TYPE_LABEL[type]}` : ''}${q ? `, matching "${q}"` : ''}`}>
        <a href={`/admin/export/pdf${qs({})}`} className={pdfBtn}><FileText className="size-4" /> PDF</a>
        <a href={`/admin/export/xlsx${qs({})}`} className={excelBtn}><FileSpreadsheet className="size-4" /> Excel</a>
      </AdminHeader>

      <FilterBar q={q} type={type} per={PAGE} types={TYPES.map((t) => ({ value: t, label: TYPE_LABEL[t] }))} />

      {rows.length === 0 ? (
        <div className={`${cardCls} mt-6 p-10 text-center text-muted`}>No registrations found.</div>
      ) : (
        <>
          {/* Phones: compact cards (MOBILE_CARDS_22OCT2026). Name, ref and status
              up top, then one-tap call / WhatsApp / email, then where they are
              from. Tapping the card body opens the full record. */}
          <ul className="mt-4 space-y-3 md:grid md:grid-cols-2 md:gap-3 md:space-y-0 xl:hidden">
            {rows.map((r) => {
              const wa = r.whatsapp.replace(/[^\d]/g, '').replace(/^0/, '234');
              const initials = r.full_name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() || '').join('');
              const where = [r.location, r.church].filter((v) => v && v.trim()).join(' · ');
              return (
                <li key={r.id} className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                  <Link href={`/admin/registrations/${r.id}`} className="flex gap-3 p-4 pb-3 active:bg-slate-50">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand">{initials}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[15px] leading-snug font-semibold text-slate-900">{r.full_name}</p>
                        <ChevronRight className="mt-0.5 size-4 shrink-0 text-slate-400" />
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-500"><span className="font-mono">{r.ref_code}</span> · {fmtWAT(r.created_at)}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
                        <span className={`rounded-full px-2.5 py-0.5 ${TYPE_BADGE[r.connect_type] || 'bg-slate-100 text-slate-700'}`}>{TYPE_LABEL[r.connect_type] || r.connect_type}</span>
                        {r.email_sent_at ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-emerald-700"><MailCheck className="size-3" /> Email sent</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-amber-800"><Clock3 className="size-3" /> Email pending</span>
                        )}
                        {r.checked_in_at && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-emerald-700"><CheckCircle2 className="size-3" /> Checked in</span>}
                      </div>
                      {(where || heardFrom(r.answers) !== '-') && (
                        <p className="mt-2 truncate text-xs text-slate-500">
                          {where && <span className="inline-flex items-center gap-1"><MapPin className="size-3 shrink-0" />{where}</span>}
                          {where && heardFrom(r.answers) !== '-' ? ' · ' : ''}
                          {heardFrom(r.answers) !== '-' && <span>via {heardFrom(r.answers)}</span>}
                        </p>
                      )}
                    </div>
                  </Link>
                  <div className="grid grid-cols-3 border-t border-slate-100 text-xs font-semibold text-slate-700">
                    <a href={`tel:+${wa}`} className="flex min-h-11 items-center justify-center gap-1.5 active:bg-slate-50"><Phone className="size-3.5" /> Call</a>
                    <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center justify-center gap-1.5 border-x border-slate-100 text-emerald-700 active:bg-slate-50"><MessageCircle className="size-3.5" /> WhatsApp</a>
                    <a href={`mailto:${r.email}`} className="flex min-h-11 items-center justify-center gap-1.5 active:bg-slate-50"><Mail className="size-3.5" /> Email</a>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* 1280px and up: table (tablets use the two-column cards above).
              1280-1535px merges phone + email into Contact and hides Heard from
              so it fits; it can only scroll inside its own card, never the page. */}
          <div className={`${cardCls} mt-5 hidden w-full max-w-none overflow-x-auto xl:block`}>
            <table className="w-full table-auto text-left text-xs [&_td]:px-2.5 [&_th]:px-2.5 2xl:[&_td]:px-3 2xl:[&_th]:px-3">
              <thead className="bg-surface-2 text-[11px] font-semibold tracking-wider text-muted uppercase">
                <tr>
                  <th className="min-w-[140px] px-3 py-3.5">Name & ref</th>
                  <th className="w-12 px-3 py-3.5">QR</th>
                  <th className="hidden px-3 py-3.5 whitespace-nowrap 2xl:table-cell">Phone</th>
                  <th className="min-w-[180px] px-3 py-3.5"><span className="2xl:hidden">Contact</span><span className="hidden 2xl:inline">Email</span></th>
                  <th className="min-w-[100px] px-3 py-3.5">Location</th>
                  <th className="min-w-[120px] px-3 py-3.5">Church / fellowship</th>
                  <th className="hidden min-w-[100px] px-3 py-3.5 2xl:table-cell">Heard from</th>
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
                    <td className="hidden px-3 py-3 whitespace-nowrap 2xl:table-cell">{r.whatsapp}</td>
                    <td className="max-w-[220px] px-3 py-3"><span className="block whitespace-nowrap 2xl:hidden">{r.whatsapp}</span><span className="block truncate text-muted 2xl:text-text" title={r.email}>{r.email}</span></td>
                    <td className="px-3 py-3 [overflow-wrap:anywhere]">{dash(r.location)}</td>
                    <td className="px-3 py-3 [overflow-wrap:anywhere]">{dash(r.church)}</td>
                    <td className="hidden px-3 py-3 2xl:table-cell">{heardFrom(r.answers)}</td>
                    <td className="px-3 py-3"><span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${TYPE_BADGE[r.connect_type]}`}>{TYPE_LABEL[r.connect_type]}</span></td>
                    <td className="px-3 py-3 whitespace-nowrap">{r.email_sent_at ? <span className="inline-flex items-center gap-1 font-semibold text-brand-green"><MailCheck className="size-3.5" /> Sent</span> : <span className="inline-flex items-center gap-1 font-semibold text-amber-600"><Clock3 className="size-3.5" /> Pending</span>}</td>
                    <td className="px-3 py-3 text-[11px] whitespace-nowrap text-muted">{fmtWAT(r.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3 text-sm">
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
