import { redirect } from 'next/navigation';
import { getAdmin } from '@/lib/admin';
import LoginForm from './LoginForm';
import ThemeToggle from '@/components/ThemeToggle';
import { Logo } from '@/components/SiteHeader';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Sign in' };

export default async function LoginPage() {
  if (await getAdmin()) redirect('/admin');
  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <div className="flex justify-end p-4">
        <ThemeToggle />
      </div>
      <div className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-sm">
          <div className="flex justify-center">
            <Logo className="h-11" />
          </div>
          <div className="card mt-8 p-6 sm:p-8">
            <h1 className="h-display text-3xl">Admin sign in</h1>
            <p className="mt-1 text-sm text-muted">Oratorio 2026 control centre</p>
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
