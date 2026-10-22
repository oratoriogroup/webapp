import 'server-only';
import { sql } from '@/lib/db';
import { describe, type Answers } from '@/lib/form';
import { filterSql, TYPES } from '../(panel)/registrations/filter';
import { TYPE_LABEL } from '../(panel)/shared';

// One source for every registrations export (CSV and Excel) so the files
// always have the same rows and columns as each other and as the table.
export const exportParams = (u: URL) => {
  const q = String(u.searchParams.get('q') || '').trim().slice(0, 100);
  const t = String(u.searchParams.get('type') || '');
  return { q, type: TYPES.includes(t) ? t : '' };
};

const fmt = (d: Date | null) => (d ? new Date(d).toLocaleString('en-GB', { timeZone: 'Africa/Lagos' }) : '');

export async function exportRows(q: string, type: string) {
  const rows = await sql<{ ref_code: string; created_at: Date; connect_type: string; answers: Answers; email_sent_at: Date | null; checked_in_at: Date | null }[]>`
    select ref_code, created_at, connect_type, answers, email_sent_at, checked_in_at
    from public.registrations ${filterSql(q, type)} order by created_at desc limit 20000`;
  const questionOrder: string[] = [];
  const parsed = rows.map((r) => {
    const m: Record<string, string> = {};
    for (const x of describe(r.answers)) {
      if (!questionOrder.includes(x.question)) questionOrder.push(x.question);
      m[x.question] = x.answer;
    }
    return { r, m };
  });
  const head = ['Reference', 'Registered (WAT)', 'Connecting as', 'Email sent', 'Checked in', ...questionOrder];
  const body = parsed.map(({ r, m }) => [
    r.ref_code, fmt(r.created_at), TYPE_LABEL[r.connect_type] || r.connect_type, r.email_sent_at ? 'Yes' : 'No',
    r.checked_in_at ? fmt(r.checked_in_at) : '', ...questionOrder.map((k) => m[k] ?? ''),
  ]);
  return { head, body };
}
