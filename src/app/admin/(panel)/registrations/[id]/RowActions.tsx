'use client';

import { useState, useTransition } from 'react';
import { Loader2, Send, CheckCircle2, Undo2, Lock } from 'lucide-react';
import { CHECKIN_OPENS_LABEL } from '@/lib/checkin';
import { resendEmail, toggleCheckIn } from '../../../actions';

export default function RowActions({ id, checkedIn, open }: { id: string; checkedIn: boolean; open: boolean }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok?: string; error?: string }>({});
  const run = (fn: () => Promise<{ ok?: string; error?: string }>) => start(async () => setMsg(await fn()));
  return (
    <div className="flex w-full flex-col items-start gap-2 sm:w-auto sm:items-end">
      <div className="flex flex-wrap gap-2">
        {checkedIn || open ? (
          <button type="button" disabled={pending} onClick={() => run(() => toggleCheckIn(id))} className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 py-2 text-xs font-semibold text-slate-800 shadow-sm transition hover:shadow-md disabled:opacity-60">
            {checkedIn ? <Undo2 className="size-4" /> : <CheckCircle2 className="size-4" />} {checkedIn ? 'Undo check-in' : 'Check in'}
          </button>
        ) : (
          <span title={`Check-in opens ${CHECKIN_OPENS_LABEL}`} className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800">
            <Lock className="size-4" /> <span className="sm:hidden">Check-in 12 Nov, 2 PM</span><span className="hidden sm:inline">Check-in opens 12 Nov, 2 PM</span>
          </span>
        )}
        <button type="button" disabled={pending} onClick={() => run(() => resendEmail(id))} className="inline-flex items-center gap-2 rounded-xl bg-[#DC2626] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#B91C1C] disabled:opacity-60">
          {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />} Resend email
        </button>
      </div>
      {(msg.ok || msg.error) && <p role="status" className={`text-sm ${msg.error ? 'text-brand-red' : 'text-brand-green'}`}>{msg.error || msg.ok}</p>}
    </div>
  );
}
