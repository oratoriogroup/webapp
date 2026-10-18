'use client';

import { useActionState, useState, useTransition } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { signIn, oauthSignIn, type ActionState } from '../actions';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
    <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.96 10.96 0 0 0 12 1 11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
  </svg>
);
const AppleIcon = () => (
  <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
    <path d="M16.37 12.6c-.02-2.2 1.8-3.26 1.88-3.31a4.05 4.05 0 0 0-3.19-1.73c-1.36-.14-2.65.8-3.34.8-.69 0-1.75-.78-2.88-.76a4.27 4.27 0 0 0-3.6 2.19c-1.54 2.67-.39 6.62 1.1 8.79.73 1.06 1.6 2.25 2.74 2.2 1.1-.04 1.51-.71 2.84-.71 1.33 0 1.7.71 2.86.69 1.18-.02 1.93-1.08 2.65-2.15a9.5 9.5 0 0 0 1.2-2.47 3.83 3.83 0 0 1-2.26-3.54ZM14.18 6.13c.6-.74 1.01-1.75.9-2.77-.87.04-1.93.58-2.55 1.31-.56.64-1.05 1.68-.92 2.67.97.08 1.96-.49 2.57-1.21Z" />
  </svg>
);

export default function LoginForm({ initialError }: { initialError?: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(signIn, {});
  const [show, setShow] = useState(false);
  const [oauthError, setOauthError] = useState('');
  const [oauthPending, startOauth] = useTransition();
  const oauth = (p: 'google' | 'apple') =>
    startOauth(async () => {
      setOauthError('');
      const r = await oauthSignIn(p);
      if (r?.error) setOauthError(r.error);
    });
  const error = state.error || oauthError || initialError;

  return (
    <div className="mt-6">
      <form action={action} className="space-y-4">
        <div>
          <label htmlFor="email" className="text-sm font-semibold">Email</label>
          <input id="email" name="email" type="email" autoComplete="username" required className="field mt-1.5" />
        </div>
        <div>
          <label htmlFor="password" className="text-sm font-semibold">Password</label>
          <div className="relative mt-1.5">
            <input id="password" name="password" type={show ? 'text' : 'password'} autoComplete="current-password" required className="field pr-12" />
            <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted">
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
        {error && <p role="alert" className="text-sm font-medium text-brand-red">{error}</p>}
        <button type="submit" disabled={pending} className="btn-brand min-h-12 w-full">
          {pending && <Loader2 className="size-4 animate-spin" />} Sign in
        </button>
      </form>
      <div className="my-5 flex items-center gap-3 text-[11px] font-semibold tracking-[0.18em] text-muted uppercase">
        <span className="h-px flex-1 bg-line" /> Or continue with <span className="h-px flex-1 bg-line" />
      </div>
      <div className="grid gap-2">
        <button type="button" disabled={oauthPending} onClick={() => oauth('google')} className="btn-outline min-h-12 w-full">
          <GoogleIcon /> Continue with Google
        </button>
        <button type="button" disabled={oauthPending} onClick={() => oauth('apple')} className="btn-outline min-h-12 w-full">
          <AppleIcon /> Continue with Apple
        </button>
      </div>
    </div>
  );
}
