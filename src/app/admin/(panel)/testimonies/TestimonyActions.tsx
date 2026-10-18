'use client';

import { useTransition } from 'react';
import { Check, EyeOff, Trash2, Loader2 } from 'lucide-react';
import { moderateTestimony } from '../../actions';

export default function TestimonyActions({ id, approved }: { id: string; approved: boolean }) {
  const [pending, start] = useTransition();
  const run = (a: 'approve' | 'hide' | 'delete') => {
    if (a === 'delete' && !confirm('Delete this testimony permanently?')) return;
    start(async () => {
      await moderateTestimony(id, a);
    });
  };
  return (
    <div className="flex gap-2">
      {pending && <Loader2 className="size-5 animate-spin self-center text-muted" />}
      {approved ? (
        <button type="button" disabled={pending} onClick={() => run('hide')} className="btn-outline !py-2"><EyeOff className="size-4" /> Hide</button>
      ) : (
        <button type="button" disabled={pending} onClick={() => run('approve')} className="btn-brand !py-2"><Check className="size-4" /> Approve</button>
      )}
      <button type="button" disabled={pending} onClick={() => run('delete')} aria-label="Delete" className="btn-outline !px-3 !py-2 text-brand-red"><Trash2 className="size-4" /></button>
    </div>
  );
}
