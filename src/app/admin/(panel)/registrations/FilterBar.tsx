'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Search, X } from 'lucide-react';

// 16px until desktop (xl): iPads zoom the page when a box under 16px is tapped.
const select =
  'h-11 w-full min-w-0 rounded-xl xl:w-auto border border-slate-200/80 bg-white px-3 text-base xl:text-sm text-slate-800 shadow-sm transition focus:border-brand focus:ring-2 focus:ring-(--ring) focus:outline-none';

// Instant search (ADMIN_UPGRADE_22OCT2026): results update 300ms after the last
// keystroke or paste, with no Apply button. Type and page size apply at once.
// The URL carries the state, so a search can be shared or bookmarked and the
// exports pick up exactly the same filter.
export default function FilterBar({ q, type, per, types }: { q: string; type: string; per: number; types: { value: string; label: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [text, setText] = useState(q);
  const [pending, start] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const push = (next: Record<string, string>) => {
    const u = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) (v ? u.set(k, v) : u.delete(k));
    u.delete('page');
    start(() => router.replace(`${pathname}${u.toString() ? `?${u}` : ''}`, { scroll: false }));
  };

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const onText = (v: string) => {
    setText(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => push({ q: v.trim().slice(0, 100) }), 300);
  };

  return (
    <div className="mt-4 grid grid-cols-2 gap-2.5 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm sm:mt-6 sm:gap-3 sm:p-4 xl:flex xl:flex-row xl:items-center">
      <div className="relative col-span-2 w-full xl:max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={text}
          onChange={(e) => onText(e.target.value)}
          placeholder="Name, email, phone, ref"
          aria-label="Search registrations"
          maxLength={100}
          autoComplete="off"
          className="h-11 w-full rounded-xl border border-slate-200/80 bg-white pr-10 pl-10 text-base text-slate-800 xl:text-sm shadow-sm transition placeholder:text-slate-400 max-[359px]:placeholder:text-[15px] focus:border-brand focus:ring-2 focus:ring-(--ring) focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {pending ? (
          <Loader2 className="absolute top-1/2 right-3.5 size-4 -translate-y-1/2 animate-spin text-slate-400" />
        ) : text ? (
          <button type="button" onClick={() => onText('')} aria-label="Clear search" className="absolute top-1/2 right-2.5 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X className="size-4" />
          </button>
        ) : null}
      </div>
      <label className="flex min-w-0 flex-col gap-1 text-[11px] font-medium text-slate-500 sm:text-xs xl:flex-row xl:items-center xl:gap-2">
        <span className="sm:hidden">Type</span><span className="hidden sm:inline">Attendance type</span>
        <select value={type} onChange={(e) => push({ type: e.target.value })} className={select} aria-label="Filter by attendance type">
          <option value="">All</option>
          {types.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </label>
      <label className="flex min-w-0 flex-col gap-1 text-[11px] font-medium text-slate-500 sm:text-xs xl:flex-row xl:items-center xl:gap-2">
        Per page
        <select value={String(per)} onChange={(e) => push({ per: e.target.value === '25' ? '' : e.target.value })} className={select} aria-label="Rows per page">
          {[25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>
    </div>
  );
}
