import { CheckCircle2, CircleAlert, Mail } from 'lucide-react';
import { requireAdmin } from '@/lib/admin';
import { getSettings } from '@/lib/settings';
import SettingsForm from './SettingsForm';
import PendingEmails from './PendingEmails';
import { sql } from '@/lib/db';
import AdminHeader, { cardCls } from '../AdminHeader';

export const metadata = { title: 'Livestream & settings' };

// What the confirmation email needs, checked from the server's environment.
const emailChecks = () => {
  const from = process.env.MAIL_FROM || '';
  const resend = !!process.env.RESEND_API_KEY;
  const smtp = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
  return [
    { ok: true, label: 'Sending domain oratoriogroup.org verified in Resend' },
    { ok: !!from, label: from ? `Sender: ${from.replace(/"/g, '')}` : 'Sender name and address not set' },
    { ok: !!process.env.MAIL_REPLY_TO, label: process.env.MAIL_REPLY_TO ? `Replies go to ${process.env.MAIL_REPLY_TO}` : 'Reply-to address not set' },
    { ok: resend || smtp, label: resend ? 'Resend API key installed' : smtp ? 'SMTP account installed' : 'Resend API key not installed on the server yet' },
  ];
};

export default async function SettingsPage() {
  await requireAdmin();
  const [s, [{ pending }]] = await Promise.all([
    getSettings(),
    sql<{ pending: number }[]>`select count(*)::int pending from public.registrations where email_sent_at is null`,
  ]);
  const checks = emailChecks();
  const ready = checks.every((c) => c.ok);
  return (
    <div>
      <AdminHeader title="Livestream & settings" subtitle="Changes show on the website within a few seconds." />
      <div className="mt-4 grid grid-cols-1 gap-4 sm:mt-6 sm:gap-6 xl:grid-cols-[1fr_380px]">
        <SettingsForm initial={s} />
        <aside className="min-w-0 space-y-4 xl:sticky xl:top-6 xl:self-start">
          <section className={`${cardCls} p-4 sm:p-5`}>
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand"><Mail className="size-5" /></span>
              <div>
                <h2 className="font-semibold">Email automation</h2>
                <p className="text-xs text-muted">Confirmation email with the QR pass after every registration.</p>
              </div>
            </div>
            <div className={`mt-4 rounded-xl border p-3 text-sm ${ready ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>
              {ready ? 'Emails are sending. Every new registration gets the confirmation and QR pass.' : 'Emails are not sending yet. Registrations are saved and can be emailed from each registration once the item below is done.'}
            </div>
            <ul className="mt-4 space-y-2.5 text-sm">
              {checks.map((c) => (
                <li key={c.label} className="flex items-start gap-2.5">
                  {c.ok ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-green" /> : <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />}
                  <span className={`min-w-0 break-words ${c.ok ? '' : 'font-semibold'}`}>{c.label}</span>
                </li>
              ))}
            </ul>
            <PendingEmails pending={pending} />
            {!ready && (
              <p className="mt-4 rounded-xl bg-surface-2 p-3 text-xs leading-relaxed text-muted">
                To finish: in Resend open <strong>API Keys</strong>, create a key with <strong>Sending access</strong> for oratoriogroup.org, and send it to your developer to install on the server.
              </p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
