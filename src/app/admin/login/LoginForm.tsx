'use client';

import { useActionState, useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { signIn, type ActionState } from '../actions';

export default function LoginForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(signIn, {});
  const [show, setShow] = useState(false);
  return (
    <form action={action} className="mt-6 space-y-4">
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
      {state.error && <p role="alert" className="text-sm font-medium text-brand-red">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending && <Loader2 className="size-4 animate-spin" />} Sign in
      </button>
    </form>
  );
}
