import { redirect } from 'next/navigation';
import { getAdmin } from '@/lib/admin';
import LoginForm from './LoginForm';
import ThemeToggle from '@/components/ThemeToggle';
import Backdrop from '@/components/Backdrop';
import StageLights from '@/components/StageLights';
import { Logo } from '@/components/SiteHeader';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Sign in' };

const ERRORS: Record<string, string> = {
  not_allowed: 'That account is not on the Oratorio admin list.',
  signin: 'Sign-in did not complete. Please try again.',
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  if (await getAdmin()) redirect('/admin');
  const err = ERRORS[String((await searchParams).error || '')];
  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-bg">
      <Backdrop />
      <StageLights />
      <div className="relative flex justify-end p-4">
        <ThemeToggle />
      </div>
      <div className="relative flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-sm">
          <div className="flex justify-center">
            <Logo className="h-11" />
          </div>
          <div className="glass-card mt-8 p-6 sm:p-8">
            <h1 className="h-display text-3xl">Admin sign in</h1>
            <p className="mt-1 text-sm text-muted">Oratorio 2026 control centre</p>
            <LoginForm initialError={err} />
          </div>
          <p className="mt-6 text-center text-xs text-muted">Copyright &copy; Oratorio 2026</p>
        </div>
      </div>
    </div>
  );
}
