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
      <div className="relative flex justify-end p-3 sm:absolute sm:top-0 sm:right-0 sm:z-10 sm:p-4">
        <ThemeToggle />
      </div>
      <div className="relative flex flex-1 items-start justify-center px-4 pt-2 pb-[max(2rem,env(safe-area-inset-bottom))] sm:items-center sm:pt-0 sm:pb-16 [@media(min-width:640px)_and_(max-height:820px)]:pb-6 [@media(min-width:640px)_and_(max-height:700px)]:pb-3">
        <div className="w-full max-w-sm md:max-w-md">
          <div className="flex justify-center">
            <Logo className="h-10 sm:h-11 [@media(min-width:640px)_and_(max-height:700px)]:h-9" />
          </div>
          <div className="glass-card mt-6 p-5 sm:mt-8 sm:p-8 [@media(min-width:640px)_and_(max-height:820px)]:mt-5 [@media(min-width:640px)_and_(max-height:820px)]:py-6 [@media(min-width:640px)_and_(max-height:700px)]:mt-3">
            <h1 className="h-display text-[28px] leading-tight sm:text-3xl">Admin sign in</h1>
            <p className="mt-1 text-sm text-muted">Oratorio 2026 control centre</p>
            <LoginForm initialError={err} />
          </div>
          <p className="mt-5 text-center text-xs text-muted sm:mt-6 [@media(min-width:640px)_and_(max-height:820px)]:mt-4 [@media(min-width:640px)_and_(max-height:700px)]:mt-2">Copyright &copy; Oratorio 2026</p>
        </div>
      </div>
    </div>
  );
}
