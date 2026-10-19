'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, UserCheck, Undo2, ScanLine, Lock } from 'lucide-react';
import { CHECKIN_OPENS_LABEL } from '@/lib/checkin';
import { checkInByCode } from '../../../actions';

export default function CheckinButton({ code, checkedIn, open }: { code: string; checkedIn: boolean; open: boolean }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <div className="flex flex-wrap gap-2">
      {checkedIn ? (
        <button type="button" disabled={pending} onClick={() => confirm('Undo this check-in?') && start(async () => { await checkInByCode(code, true); router.refresh(); })} className="btn-outline min-h-12">
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Undo2 className="size-4" />} Undo check-in
        </button>
      ) : !open ? (
        <div className="flex min-h-14 items-center gap-2.5 rounded-full border border-line bg-surface-2 px-6 text-sm font-semibold text-muted">
          <Lock className="size-4" /> Pass is valid. Check-in opens {CHECKIN_OPENS_LABEL}.
        </div>
      ) : (
        <button type="button" disabled={pending} onClick={() => start(async () => { await checkInByCode(code); router.refresh(); })} className="btn min-h-14 bg-brand-green px-8 text-base text-white shadow-lg hover:-translate-y-0.5">
          {pending ? <Loader2 className="size-5 animate-spin" /> : <UserCheck className="size-5" />} Check in
        </button>
      )}
      <button type="button" onClick={() => router.push('/admin/checkin')} className="btn-outline min-h-12"><ScanLine className="size-4" /> Scan next</button>
    </div>
  );
}
