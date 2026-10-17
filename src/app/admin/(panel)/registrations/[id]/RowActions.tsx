'use client';

import { useState, useTransition } from 'react';
import { Loader2, Send, CheckCircle2, Undo2 } from 'lucide-react';
import { resendEmail, toggleCheckIn } from '../../../actions';

export default function RowActions({ id, checkedIn }: { id: string; checkedIn: boolean }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok?: string; error?: string }>({});
  const run = (fn: () => Promise<{ ok?: string; error?: string }>) => start(async () => setMsg(await fn()));
  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={pending} onClick={() => run(() => toggleCheckIn(id))} className="btn-outline !py-2.5">
          {checkedIn ? <Undo2 className="size-4" /> : <CheckCircle2 className="size-4" />} {checkedIn ? 'Undo check-in' : 'Check in'}
        </button>
        <button type="button" disabled={pending} onClick={() => run(() => resendEmail(id))} className="btn-primary !py-2.5">
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Resend email
        </button>
      </div>
      {(msg.ok || msg.error) && <p role="status" className={`text-sm ${msg.error ? 'text-brand-red' : 'text-brand-green'}`}>{msg.error || msg.ok}</p>}
    </div>
  );
}
