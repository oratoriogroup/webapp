import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Mail, Phone, MessageCircle, MailCheck, MailX, UserCheck, Clock3 } from 'lucide-react';
import { checkinOpen } from '@/lib/checkin';
import { requireAdmin } from '@/lib/admin';
import { sql } from '@/lib/db';
import { describe, type Answers } from '@/lib/form';
import { TYPE_LABEL, TYPE_BADGE, fmtWAT } from '../../shared';
import RowActions from './RowActions';

export const metadata = { title: 'Registration' };

type Row = {
  id: string; ref_code: string; full_name: string; email: string; whatsapp: string; connect_type: string; answers: Answers;
  created_at: Date; email_sent_at: Date | null; email_error: string | null; checked_in_at: Date | null;
};

const contactCard =
  'flex min-w-0 items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white p-3 text-xs font-medium text-slate-800 shadow-sm transition hover:-translate-y-px hover:shadow-md';
const iconWrap = 'flex size-8 shrink-0 items-center justify-center rounded-lg';

// ADMIN_UPGRADE_22OCT2026: light, card-based registrant view. Contact details are
// tap targets (mail, call, WhatsApp with a pre-filled message), status is shown
// as badges, and every answer sits in one structured card.
export default async function RegistrationDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [r] = await sql<Row[]>`select id, ref_code, full_name, email, whatsapp, connect_type, answers, created_at, email_sent_at, email_error, checked_in_at
    from public.registrations where id = ${id} limit 1`;
  if (!r) notFound();
  const qa = describe(r.answers);
  const wa = r.whatsapp.replace(/[^\d]/g, '').replace(/^0/, '234');
  const first = r.full_name.trim().split(/\s+/)[0] || 'there';
  const waText = encodeURIComponent(
    `Hello ${first}, this is the Oratorio Music Foundation team. We are reaching out about your Oratorio 2026 registration (${r.ref_code}).`,
  );

  // Group answers by form section.
  const sections: { title: string; items: typeof qa }[] = [];
  for (const x of qa) {
    const last = sections.at(-1);
    if (!last || last.title !== x.section) sections.push({ title: x.section, items: [x] });
    else last.items.push(x);
  }

  return (
    <div className="w-full">
      <Link href="/admin/registrations" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-slate-900">
        <ArrowLeft className="size-4" /> Registrations
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
        <div className="min-w-0">
          <h1 className="h-display text-3xl font-bold break-words text-slate-900 sm:text-4xl">{r.full_name}</h1>
          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
            <span className={`rounded-full px-3 py-1 font-semibold ${TYPE_BADGE[r.connect_type] || 'bg-slate-100 text-slate-700'}`}>{TYPE_LABEL[r.connect_type] || r.connect_type}</span>
            <span className="rounded-full border border-slate-200/80 bg-white px-3 py-1 font-mono font-semibold tracking-wide text-slate-700">{r.ref_code}</span>
            <span className="text-slate-500">Registered {fmtWAT(r.created_at)}</span>
          </div>
        </div>
        <RowActions id={r.id} checkedIn={!!r.checked_in_at} open={checkinOpen()} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <a href={`mailto:${r.email}`} className={contactCard} title={r.email}>
          <span className={`${iconWrap} bg-blue-50 text-blue-600`}><Mail className="size-4" /></span>
          <span className="truncate">{r.email}</span>
        </a>
        <a href={`tel:+${wa}`} className={contactCard}>
          <span className={`${iconWrap} bg-slate-100 text-slate-700`}><Phone className="size-4" /></span>
          <span className="truncate">{r.whatsapp}</span>
        </a>
        <a href={`https://wa.me/${wa}?text=${waText}`} target="_blank" rel="noopener noreferrer" className={contactCard}>
          <span className={`${iconWrap} bg-emerald-50 text-emerald-600`}><MessageCircle className="size-4" /></span>
          <span className="truncate">Message on WhatsApp</span>
        </a>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <span className={`${iconWrap} ${r.email_sent_at ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {r.email_sent_at ? <MailCheck className="size-4" /> : <MailX className="size-4" />}
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">Confirmation email</p>
            <p className={`mt-0.5 text-sm font-semibold ${r.email_sent_at ? 'text-emerald-700' : 'text-rose-600'}`}>
              {r.email_sent_at ? `Sent ${fmtWAT(r.email_sent_at)}` : 'Not sent'}
            </p>
            {r.email_error && !r.email_sent_at && <p className="mt-0.5 truncate text-xs text-slate-500" title={r.email_error}>{r.email_error}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <span className={`${iconWrap} ${r.checked_in_at ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
            {r.checked_in_at ? <UserCheck className="size-4" /> : <Clock3 className="size-4" />}
          </span>
          <div>
            <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">Check-in</p>
            <p className={`mt-0.5 text-sm font-semibold ${r.checked_in_at ? 'text-emerald-700' : 'text-slate-800'}`}>
              {r.checked_in_at ? `Checked in ${fmtWAT(r.checked_in_at)}` : 'Not checked in yet'}
            </p>
          </div>
        </div>
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Answers</h2>
        {sections.map((sec) => (
          <div key={sec.title} className="mt-5 first:mt-4">
            <p className="text-[11px] font-bold tracking-wider text-[#DC2626] uppercase">{sec.title}</p>
            <dl className="mt-2 grid gap-x-8 sm:grid-cols-2">
              {sec.items.map((x, i) => (
                <div key={i} className="border-b border-slate-100 py-3">
                  <dt className="text-xs text-slate-500">{x.question}</dt>
                  <dd className="mt-1 text-sm font-medium break-words whitespace-pre-wrap text-slate-900">{x.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </section>
    </div>
  );
}
