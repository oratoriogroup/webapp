'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, UserCheck, Undo2, ScanLine } from 'lucide-react';
import { checkInByCode } from '../../../actions';

export default function CheckinButton({ code, checkedIn }: { code: string; checkedIn: boolean }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <div className="flex flex-wrap gap-2">
      {checkedIn ? (
        <button type="button" disabled={pending} onClick={() => confirm('Undo this check-in?') && start(async () => { await checkInByCode(code, true); router.refresh(); })} className="btn-outline min-h-12">
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Undo2 className="size-4" />} Undo check-in
        </button>
      ) : (
        <button type="button" disabled={pending} onClick={() => start(async () => { await checkInByCode(code); router.refresh(); })} className="btn min-h-14 bg-brand-green px-8 text-base text-white shadow-lg hover:-translate-y-0.5">
          {pending ? <Loader2 className="size-5 animate-spin" /> : <UserCheck className="size-5" />} Check in
        </button>
      )}
      <button type="button" onClick={() => router.push('/admin/checkin')} className="btn-outline min-h-12"><ScanLine className="size-4" /> Scan next</button>
    </div>
  );
}
