import { NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { getAdmin } from '@/lib/admin';
import { sql } from '@/lib/db';
import type { Answers } from '@/lib/form';
import { TYPE_LABEL, fmtWAT, heardFrom } from '../../(panel)/shared';
import { filterSql, TYPES } from '../../(panel)/registrations/filter';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Row = {
  ref_code: string; full_name: string; whatsapp: string; email: string; location: string | null; church: string | null;
  connect_type: string; answers: Answers; created_at: Date; checked_in_at: Date | null;
};

// Registrations as a landscape A4 PDF, same filters as the list.
export async function GET(req: Request) {
  if (!(await getAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const u = new URL(req.url);
  const q = String(u.searchParams.get('q') || '').trim().slice(0, 100);
  const t = String(u.searchParams.get('type') || '');
  const type = TYPES.includes(t) ? t : '';
  const rows = await sql<Row[]>`select ref_code, full_name, whatsapp, email, location, church, connect_type, answers, created_at, checked_in_at
    from public.registrations ${filterSql(q, type)} order by created_at asc limit 20000`;

  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  doc.setFillColor(220, 38, 38);
  doc.rect(0, 0, W, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(26, 17, 20);
  doc.text('Oratorio 2026: The Sound of Thanks', 36, 40);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 88, 92);
  const filter = [type ? TYPE_LABEL[type] : 'All registrations', q ? `matching "${q}"` : ''].filter(Boolean).join(', ');
  doc.text(`Registrations: ${rows.length}  |  ${filter}  |  Generated ${fmtWAT(new Date())} WAT`, 36, 58);

  autoTable(doc, {
    startY: 72,
    head: [['#', 'Name', 'Phone', 'Email', 'City / State / Country', 'Church / fellowship / campus', 'Heard about us', 'Connecting as', 'Registered', 'Checked in']],
    body: rows.map((r, i) => [
      String(i + 1),
      `${r.full_name}\n${r.ref_code}`,
      r.whatsapp,
      r.email,
      r.location || '-',
      r.church || '-',
      heardFrom(r.answers),
      TYPE_LABEL[r.connect_type] || r.connect_type,
      fmtWAT(r.created_at),
      r.checked_in_at ? fmtWAT(r.checked_in_at) : '-',
    ]),
    styles: { font: 'helvetica', fontSize: 8, cellPadding: 5, textColor: [26, 17, 20], lineColor: [238, 227, 216], lineWidth: 0.5, overflow: 'linebreak' },
    headStyles: { fillColor: [153, 27, 27], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [250, 245, 239] },
    columnStyles: { 0: { cellWidth: 22 }, 1: { cellWidth: 92 }, 2: { cellWidth: 78 }, 3: { cellWidth: 110 } },
    margin: { left: 36, right: 36 },
    didDrawPage: () => {
      const H = doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
      doc.setTextColor(140, 130, 134);
      doc.text(`Oratorio Music Foundation  |  oratoriogroup.org  |  Page ${doc.getNumberOfPages()}`, 36, H - 18);
    },
  });

  const pdf = Buffer.from(doc.output('arraybuffer'));
  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(new Uint8Array(pdf), {
    headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="oratorio-registrations-${stamp}.pdf"`, 'Cache-Control': 'no-store' },
  });
}
