import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/admin';
import { sql } from '@/lib/db';
import { describe, type Answers } from '@/lib/form';
import { filterSql, TYPES } from '../(panel)/registrations/filter';

export const dynamic = 'force-dynamic';

// Quote every cell, and neutralise values a spreadsheet would run as a formula.
const cell = (v: unknown) => {
  let s = v == null ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

export async function GET(req: Request) {
  if (!(await getAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const u = new URL(req.url);
  const q = String(u.searchParams.get('q') || '').trim().slice(0, 100);
  const t = String(u.searchParams.get('type') || '');
  const type = TYPES.includes(t) ? t : '';

  const rows = await sql<{ ref_code: string; created_at: Date; full_name: string; email: string; whatsapp: string; connect_type: string; answers: Answers; email_sent_at: Date | null; checked_in_at: Date | null }[]>`
    select ref_code, created_at, full_name, email, whatsapp, connect_type, answers, email_sent_at, checked_in_at
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

  const head = ['Reference', 'Registered (WAT)', 'Type', 'Email sent', 'Checked in', ...questionOrder];
  const fmt = (d: Date | null) => (d ? new Date(d).toLocaleString('en-GB', { timeZone: 'Africa/Lagos' }) : '');
  const lines = [head.map(cell).join(',')];
  for (const { r, m } of parsed) {
    lines.push([r.ref_code, fmt(r.created_at), r.connect_type, r.email_sent_at ? 'yes' : 'no', r.checked_in_at ? fmt(r.checked_in_at) : '', ...questionOrder.map((k) => m[k] ?? '')].map(cell).join(','));
  }
  const stamp = new Date().toISOString().slice(0, 10);
  return new Response('﻿' + lines.join('\r\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="oratorio-registrations-${stamp}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
