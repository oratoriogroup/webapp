import { requireAdmin } from '@/lib/admin';
import { sql } from '@/lib/db';
import { fmtWAT } from '../shared';
import TestimonyActions from './TestimonyActions';

export const metadata = { title: 'Testimonies' };

export default async function TestimoniesPage() {
  await requireAdmin();
  const rows = await sql<{ id: string; name: string; location: string | null; message: string; approved: boolean; created_at: Date }[]>`
    select id, name, location, message, approved, created_at from public.testimonies order by approved asc, created_at desc limit 200`;
  const pending = rows.filter((r) => !r.approved).length;
  return (
    <div className="max-w-4xl">
      <h1 className="h-display text-4xl">Testimonies</h1>
      <p className="mt-1 text-sm text-muted">{pending} waiting for review. Approved testimonies appear on the livestream page.</p>
      {rows.length === 0 ? (
        <div className="card mt-6 p-10 text-center text-muted">No testimonies yet.</div>
      ) : (
        <ul className="mt-6 space-y-3">
          {rows.map((t) => (
            <li key={t.id} className={`card p-5 ${t.approved ? '' : 'border-brand/40'}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{t.name}{t.location ? <span className="font-normal text-muted">, {t.location}</span> : null}</p>
                  <p className="text-xs text-muted">{fmtWAT(t.created_at)} · {t.approved ? 'Approved' : 'Waiting for review'}</p>
                </div>
                <TestimonyActions id={t.id} approved={t.approved} />
              </div>
              <p className="mt-3 text-[15px] leading-relaxed whitespace-pre-line">{t.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
