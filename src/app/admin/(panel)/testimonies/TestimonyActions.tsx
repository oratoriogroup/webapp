'use client';

import { useTransition } from 'react';
import { Check, EyeOff, Trash2, Loader2, X, RotateCcw } from 'lucide-react';
import { moderateTestimony } from '../../actions';

type Act = 'approve' | 'hide' | 'reject' | 'restore' | 'delete';
// Under 360px the buttons tighten so "Approve" / "Reject" stay on one line.
const btn = 'inline-flex h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 text-sm font-semibold transition disabled:opacity-60 max-[359px]:gap-1 max-[359px]:px-2 max-[359px]:text-[13px] sm:h-10';

export default function TestimonyActions({ id, state }: { id: string; state: 'pending' | 'approved' | 'archived' }) {
  const [pending, start] = useTransition();
  const run = (a: Act) => {
    if (a === 'delete' && !confirm('Delete this testimony permanently?')) return;
    start(async () => {
      await moderateTestimony(id, a);
    });
  };
  return (
    <div className="flex items-center gap-2 sm:flex-wrap">
      {pending && <Loader2 className="size-5 animate-spin text-muted" />}
      {state === 'pending' && (
        <>
          <button type="button" disabled={pending} onClick={() => run('approve')} className={`${btn} flex-1 bg-brand text-white shadow-md shadow-brand/25 hover:bg-brand-deep sm:flex-none`}><Check className="size-4" /> <span className="sm:hidden">Approve</span><span className="hidden sm:inline">Approve & publish</span></button>
          <button type="button" disabled={pending} onClick={() => run('reject')} className={`${btn} flex-1 border border-line bg-surface hover:text-brand-red sm:flex-none`}><X className="size-4" /> Reject</button>
        </>
      )}
      {state === 'approved' && <button type="button" disabled={pending} onClick={() => run('hide')} className={`${btn} flex-1 border border-line bg-surface sm:flex-none`}><EyeOff className="size-4" /> Unpublish</button>}
      {state === 'archived' && <button type="button" disabled={pending} onClick={() => run('restore')} className={`${btn} flex-1 border border-line bg-surface sm:flex-none`}><RotateCcw className="size-4" /> Back to review</button>}
      <button type="button" disabled={pending} onClick={() => run('delete')} aria-label="Delete permanently" className={`${btn} w-11 shrink-0 border border-line px-0 text-muted hover:text-brand-red sm:ml-auto sm:w-auto sm:border-0 sm:px-3.5`}><Trash2 className="size-4" /></button>
    </div>
  );
}
