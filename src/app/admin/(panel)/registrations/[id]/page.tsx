import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Mail, Phone, MessageCircle } from 'lucide-react';
import { requireAdmin } from '@/lib/admin';
import { sql } from '@/lib/db';
import { describe, type Answers } from '@/lib/form';
import { TYPE_LABEL, fmtWAT } from '../../shared';
import RowActions from './RowActions';

export const metadata = { title: 'Registration' };

type Row = {
  id: string; ref_code: string; full_name: string; email: string; whatsapp: string; connect_type: string; answers: Answers;
  created_at: Date; email_sent_at: Date | null; email_error: string | null; gform_status: string | null; gform_error: string | null; checked_in_at: Date | null;
};

export default async function RegistrationDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [r] = await sql<Row[]>`select id, ref_code, full_name, email, whatsapp, connect_type, answers, created_at, email_sent_at, email_error, gform_status, gform_error, checked_in_at
    from public.registrations where id = ${id} limit 1`;
  if (!r) notFound();
  const qa = describe(r.answers);
  const wa = r.whatsapp.replace(/[^\d]/g, '').replace(/^0/, '234');

  let lastSection = '';
  return (
    <div className="max-w-3xl">
      <Link href="/admin/registrations" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-text"><ArrowLeft className="size-4" /> Registrations</Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="h-display text-4xl">{r.full_name}</h1>
          <p className="mt-1 text-sm text-muted"><span className="font-mono">{r.ref_code}</span> · {TYPE_LABEL[r.connect_type]} · {fmtWAT(r.created_at)}</p>
        </div>
        <RowActions id={r.id} checkedIn={!!r.checked_in_at} />
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        <a href={`mailto:${r.email}`} className="btn-outline !justify-start !rounded-xl"><Mail className="size-4" /> <span className="truncate">{r.email}</span></a>
        <a href={`tel:${r.whatsapp.replace(/\s/g, '')}`} className="btn-outline !justify-start !rounded-xl"><Phone className="size-4" /> {r.whatsapp}</a>
        <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="btn-outline !justify-start !rounded-xl"><MessageCircle className="size-4" /> WhatsApp</a>
      </div>

      <div className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
        <div className="card p-4"><p className="text-xs text-muted">Confirmation email</p><p className={`mt-1 font-semibold ${r.email_sent_at ? 'text-brand-green' : 'text-brand-red'}`}>{r.email_sent_at ? `Sent ${fmtWAT(r.email_sent_at)}` : 'Not sent'}</p>{r.email_error && <p className="mt-1 text-xs text-muted">{r.email_error}</p>}</div>
        <div className="card p-4"><p className="text-xs text-muted">Google Form copy</p><p className={`mt-1 font-semibold ${r.gform_status === 'sent' ? 'text-brand-green' : 'text-brand-red'}`}>{r.gform_status === 'sent' ? 'Saved to sheet' : 'Not saved'}</p>{r.gform_error && <p className="mt-1 text-xs text-muted">{r.gform_error}</p>}</div>
        <div className="card p-4"><p className="text-xs text-muted">Check-in</p><p className="mt-1 font-semibold">{r.checked_in_at ? `Checked in ${fmtWAT(r.checked_in_at)}` : 'Not checked in'}</p></div>
      </div>

      <section className="card mt-6 p-5 sm:p-6">
        <h2 className="font-semibold">Answers</h2>
        <dl className="mt-2">
          {qa.map((x, i) => {
            const head = x.section !== lastSection ? x.section : null;
            lastSection = x.section;
            return (
              <div key={i}>
                {head && <p className="mt-5 mb-1 text-xs font-semibold tracking-wider text-brand uppercase">{head}</p>}
                <div className="border-b border-line py-3 last:border-0">
                  <dt className="text-sm text-muted">{x.question}</dt>
                  <dd className="mt-1 text-[15px] whitespace-pre-wrap">{x.answer}</dd>
                </div>
              </div>
            );
          })}
        </dl>
      </section>
    </div>
  );
}
