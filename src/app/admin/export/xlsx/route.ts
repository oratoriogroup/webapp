import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { getAdmin } from '@/lib/admin';
import { exportParams, exportRows } from '../rows';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// A real .xlsx workbook (not CSV): frozen bold header, filters, sensible widths.
// Text is written as values, never as formulas, so a typed "=..." cannot run.
export async function GET(req: Request) {
  if (!(await getAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { q, type } = exportParams(new URL(req.url));
  const { head, body } = await exportRows(q, type);

  const wb = new ExcelJS.Workbook();
  wb.creator = 'Oratorio Music Foundation';
  wb.created = new Date();
  const ws = wb.addWorksheet('Registrations', { views: [{ state: 'frozen', ySplit: 1 }] });
  ws.addRow(head);
  for (const r of body) ws.addRow(r.map((v) => (v == null ? '' : String(v))));
  const hr = ws.getRow(1);
  hr.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  hr.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } };
  hr.alignment = { vertical: 'middle', wrapText: true };
  hr.height = 30;
  ws.columns.forEach((c, i) => {
    const longest = Math.max(String(head[i] ?? '').length, ...body.slice(0, 300).map((r) => String(r[i] ?? '').length));
    c.width = Math.min(48, Math.max(12, longest + 2));
  });
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: head.length } };

  const buf = await wb.xlsx.writeBuffer();
  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(buf as ArrayBuffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="oratorio-registrations-${stamp}.xlsx"`,
      'Cache-Control': 'no-store',
    },
  });
}
