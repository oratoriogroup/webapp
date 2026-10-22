import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/admin';
import { exportParams, exportRows } from './rows';

export const dynamic = 'force-dynamic';

// Quote every cell, and neutralise values a spreadsheet would run as a formula.
const cell = (v: unknown) => {
  let s = v == null ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

export async function GET(req: Request) {
  if (!(await getAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { q, type } = exportParams(new URL(req.url));
  const { head, body } = await exportRows(q, type);
  const lines = [head.map(cell).join(','), ...body.map((r) => r.map(cell).join(','))];
  const stamp = new Date().toISOString().slice(0, 10);
  return new Response('﻿' + lines.join('\r\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="oratorio-registrations-${stamp}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
