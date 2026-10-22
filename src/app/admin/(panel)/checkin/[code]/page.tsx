import { checkinOpen } from '@/lib/checkin';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, UserCheck, AlertTriangle, Phone, MessageCircle } from 'lucide-react';
import { requireAdmin } from '@/lib/admin';
import { sql } from '@/lib/db';
import { describe, type Answers } from '@/lib/form';
import { TYPE_LABEL, fmtWAT } from '../../shared';
import CheckinButton from './CheckinButton';

export const metadata = { title: 'Check-in' };

type Row = {
  id: string; checkin_code: string; full_name: string; whatsapp: string; email: string; ref_code: string; connect_type: string;
  location: string | null; church: string | null; answers: Answers; created_at: Date; checked_in_at: Date | null; checked_in_by: string | null;
};

export default async function CheckinDetail({ params }: { params: Promise<{ code: string }> }) {
  await requireAdmin();
  const { code } = await params;
  if (!/^[A-Za-z0-9_-]{22}$/.test(code)) notFound();
  const [r] = await sql<Row[]>`select id, checkin_code, full_name, whatsapp, email, ref_code, connect_type, location, church, answers, created_at, checked_in_at, checked_in_by
    from public.registrations where checkin_code = ${code} limit 1`;
  if (!r) {
    return (
      <div className="max-w-xl">
        <Link href="/admin/checkin" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted"><ArrowLeft className="size-4" /> Check-in</Link>
        <div className="card mt-4 border-brand-red/40 p-8 text-center">
          <AlertTriangle className="mx-auto size-10 text-brand-red" />
          <p className="h-display mt-3 text-2xl">Pass not recognised</p>
          <p className="mt-1 text-muted">This code does not match any registration. Search by name or phone instead.</p>
        </div>
      </div>
    );
  }
  const wa = r.whatsapp.replace(/[^\d]/g, '').replace(/^0/, '234');
  const details = describe(r.answers).filter((x) => !/full name|whatsapp|email address/i.test(x.question));
  return (
    <div className="max-w-5xl">
      <Link href="/admin/checkin" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-text"><ArrowLeft className="size-4" /> Scan next</Link>

      <div className={`mt-4 rounded-3xl p-6 sm:p-8 ${r.checked_in_at ? 'border-2 border-amber-400 bg-amber-50' : 'border-2 border-brand-green/50 bg-brand-green/10'}`}>
        {r.checked_in_at ? (
          <p className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold tracking-wider text-black uppercase"><AlertTriangle className="size-3.5" /> Already checked in</p>
        ) : (
          <p className="inline-flex items-center gap-2 rounded-full bg-brand-green px-3 py-1 text-xs font-bold tracking-wider text-white uppercase"><UserCheck className="size-3.5" /> Valid pass</p>
        )}
        <h1 className="h-display mt-3 text-4xl">{r.full_name}</h1>
        <p className="mt-1 text-sm text-muted">{TYPE_LABEL[r.connect_type]} · Ref <span className="font-mono">{r.ref_code}</span> · Registered {fmtWAT(r.created_at)}</p>
        {r.checked_in_at && <p className="mt-3 text-sm font-semibold">Checked in at {fmtWAT(r.checked_in_at)}{r.checked_in_by ? ` by ${r.checked_in_by}` : ''}. If this is a different person, the pass may have been shared.</p>}
        <div className="mt-5"><CheckinButton code={r.checkin_code} checkedIn={!!r.checked_in_at} open={checkinOpen()} /></div>
      </div>

      <section className="card mt-4 p-5">
        <h2 className="font-semibold">Bio data</h2>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          <div><dt className="text-xs text-muted">WhatsApp</dt><dd className="font-medium">{r.whatsapp}</dd></div>
          <div><dt className="text-xs text-muted">Email</dt><dd className="truncate font-medium">{r.email}</dd></div>
          <div><dt className="text-xs text-muted">Location</dt><dd className="font-medium">{r.location || '-'}</dd></div>
          <div className="sm:col-span-2"><dt className="text-xs text-muted">Church, fellowship or campus</dt><dd className="font-medium">{r.church || '-'}</dd></div>
        </dl>
        <div className="mt-4 flex flex-wrap gap-2">
          <a href={`tel:${r.whatsapp.replace(/\s/g, '')}`} className="btn-outline min-h-11 !py-2"><Phone className="size-4" /> Call</a>
          <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="btn-outline min-h-11 !py-2"><MessageCircle className="size-4" /> WhatsApp</a>
          <Link href={`/admin/registrations/${r.id}`} className="btn-outline min-h-11 !py-2">Full registration</Link>
        </div>
      </section>

      {details.length > 0 && (
        <section className="card mt-4 p-5">
          <h2 className="font-semibold">Other answers</h2>
          <dl className="mt-2">
            {details.map((x, i) => (
              <div key={i} className="border-b border-line py-2.5 last:border-0">
                <dt className="text-xs text-muted">{x.question}</dt>
                <dd className="mt-0.5 text-sm">{x.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  );
}
