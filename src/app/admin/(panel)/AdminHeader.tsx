import { ExternalLink } from 'lucide-react';

// Standard page header for every admin page: serif title, muted subtitle,
// page actions on the right plus a shortcut to the live site.
export default function AdminHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
      <div className="min-w-0">
        <h1 className="h-display text-3xl font-bold sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-xs text-muted sm:text-sm">{subtitle}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {children}
        <a href="/" target="_blank" rel="noopener" className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-semibold text-text shadow-sm transition hover:border-brand/40 hover:text-brand">
          View live site <ExternalLink className="size-3.5" />
        </a>
      </div>
    </div>
  );
}

export const actionBtn =
  'inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-semibold text-text shadow-sm transition hover:border-brand/40 hover:text-brand';
export const inputCls =
  'h-11 w-full rounded-xl border border-line bg-surface-2 px-4 text-sm text-text transition placeholder:text-muted/70 focus:border-brand focus:bg-surface focus:ring-2 focus:ring-(--ring) focus:outline-none';
export const cardCls = 'rounded-2xl border border-line bg-surface shadow-sm';
