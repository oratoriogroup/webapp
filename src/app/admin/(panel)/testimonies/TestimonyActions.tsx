'use client';

import { useTransition } from 'react';
import { Check, EyeOff, Trash2, Loader2, X, RotateCcw } from 'lucide-react';
import { moderateTestimony } from '../../actions';

type Act = 'approve' | 'hide' | 'reject' | 'restore' | 'delete';
const btn = 'inline-flex h-10 items-center gap-1.5 rounded-xl px-3.5 text-sm font-semibold transition disabled:opacity-60';

export default function TestimonyActions({ id, state }: { id: string; state: 'pending' | 'approved' | 'archived' }) {
  const [pending, start] = useTransition();
  const run = (a: Act) => {
    if (a === 'delete' && !confirm('Delete this testimony permanently?')) return;
    start(async () => {
      await moderateTestimony(id, a);
    });
  };
  return (
    <div className="flex flex-wrap items-center gap-2">
      {pending && <Loader2 className="size-5 animate-spin text-muted" />}
      {state === 'pending' && (
        <>
          <button type="button" disabled={pending} onClick={() => run('approve')} className={`${btn} bg-brand text-white shadow-md shadow-brand/25 hover:bg-brand-deep`}><Check className="size-4" /> Approve & publish</button>
          <button type="button" disabled={pending} onClick={() => run('reject')} className={`${btn} border border-line bg-surface hover:text-brand-red`}><X className="size-4" /> Reject</button>
        </>
      )}
      {state === 'approved' && <button type="button" disabled={pending} onClick={() => run('hide')} className={`${btn} border border-line bg-surface`}><EyeOff className="size-4" /> Unpublish</button>}
      {state === 'archived' && <button type="button" disabled={pending} onClick={() => run('restore')} className={`${btn} border border-line bg-surface`}><RotateCcw className="size-4" /> Back to review</button>}
      <button type="button" disabled={pending} onClick={() => run('delete')} aria-label="Delete permanently" className={`${btn} ml-auto text-muted hover:text-brand-red`}><Trash2 className="size-4" /></button>
    </div>
  );
}
