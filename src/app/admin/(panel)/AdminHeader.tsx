// Standard page header for every admin page: serif title, muted subtitle and
// the page's own tools on the right (exports and similar). ADMIN_UPGRADE_22OCT2026:
// no "View live site" shortcut or status badges here; the header carries only
// the title, the count and the page's data tools.
export default function AdminHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
      <div className="min-w-0">
        <h1 className="h-display text-3xl font-bold sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-xs text-muted sm:text-sm">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export const actionBtn =
  'inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-semibold text-text shadow-sm transition hover:border-brand/40 hover:text-brand';
// Export pills, matching the BJT admin toolbar.
export const pdfBtn =
  'inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-600 shadow-sm transition-all hover:bg-rose-100';
export const excelBtn =
  'inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-600 shadow-sm transition-all hover:bg-emerald-100';
export const inputCls =
  'h-11 w-full rounded-xl border border-line bg-surface-2 px-4 text-sm text-text transition placeholder:text-muted/70 focus:border-brand focus:bg-surface focus:ring-2 focus:ring-(--ring) focus:outline-none';
export const cardCls = 'rounded-2xl border border-line bg-surface shadow-sm';
