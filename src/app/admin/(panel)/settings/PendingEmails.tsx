'use client';

import { useState, useTransition } from 'react';
import { Loader2, Send } from 'lucide-react';
import { sendPendingEmails } from '../../actions';

export default function PendingEmails({ pending }: { pending: number }) {
  const [busy, start] = useTransition();
  const [msg, setMsg] = useState<{ ok?: string; error?: string }>({});
  return (
    <div className="mt-4 rounded-xl border border-line p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 text-sm"><span className="font-semibold tabular-nums">{pending.toLocaleString()}</span> <span className="text-muted">{pending === 1 ? 'email' : 'emails'} not yet sent</span></p>
        <button
          type="button"
          disabled={busy || pending === 0}
          onClick={() => start(async () => setMsg(await sendPendingEmails()))}
          className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg bg-brand px-3.5 text-xs font-semibold whitespace-nowrap text-white hover:bg-brand-deep disabled:opacity-50"
        >
          {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />} Send pending
        </button>
      </div>
      {(msg.ok || msg.error) && <p role="status" className={`mt-2 text-xs font-semibold ${msg.error ? 'text-brand-red' : 'text-brand-green'}`}>{msg.error || msg.ok}</p>}
    </div>
  );
}
