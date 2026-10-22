'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Heart, Loader2, X, Check } from 'lucide-react';

// "Share a testimony" button and dialog. Submissions are reviewed by the
// team before anything appears on the site.
export default function TestimonyModal() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const opened = useRef(0);
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    opened.current = Date.now();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    dialog.current?.querySelector<HTMLInputElement>('input[name="name"]')?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError('');
    try {
      const r = await fetch('/api/testimonies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: f.get('name'), location: f.get('location'), message: f.get('message'), hp: f.get('website'), t: opened.current }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.ok) return setError(d.error || 'Something went wrong. Please try again.');
      setDone(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button type="button" onClick={() => { setDone(false); setOpen(true); }} className="btn-brand min-h-11">
        <Heart className="size-4" /> Share a testimony
      </button>
      {/* Rendered on <body>: the livestream section is its own stacking
          context (isolate), which let the phone bottom menu sit on top of the
          dialog and hide the Send button. */}
      {open && createPortal(
        <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="testimony-title">
          <button type="button" aria-label="Close" className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div ref={dialog} className="pop-in relative max-h-[92dvh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-3xl border border-line bg-surface p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-3xl sm:p-8">
            <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="absolute top-4 right-4 inline-flex size-10 items-center justify-center rounded-full bg-surface-2"><X className="size-5" /></button>
            {done ? (
              <div className="py-6 text-center">
                <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand text-white"><Check className="size-7" /></span>
                <p id="testimony-title" className="h-display mt-4 text-2xl">Thank you for sharing</p>
                <p className="mt-2 text-muted">Your testimony has been received. The team reviews every message before it appears here.</p>
                <button type="button" onClick={() => setOpen(false)} className="btn-primary mt-6 min-h-11">Close</button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <p id="testimony-title" className="h-display text-2xl sm:text-3xl">Share a testimony</p>
                  <p className="mt-1 text-sm text-muted">What has God done for you? Tell us in a few lines.</p>
                </div>
                <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden"><input name="website" tabIndex={-1} autoComplete="off" /></div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm font-semibold">Your name<input name="name" required maxLength={80} className="field mt-1.5" autoComplete="name" /></label>
                  <label className="block text-sm font-semibold">City or country<input name="location" maxLength={80} className="field mt-1.5" autoComplete="address-level2" /></label>
                </div>
                <label className="block text-sm font-semibold">Your testimony<textarea name="message" required minLength={10} maxLength={1000} rows={5} className="field mt-1.5 resize-y" /></label>
                {error && <p role="alert" className="text-sm font-medium text-brand-red">{error}</p>}
                <button type="submit" disabled={busy} className="btn-brand min-h-12 w-full">{busy && <Loader2 className="size-4 animate-spin" />} Send testimony</button>
              </form>
            )}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
