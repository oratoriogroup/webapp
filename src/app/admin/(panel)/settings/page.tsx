import { requireAdmin } from '@/lib/admin';
import { getSettings } from '@/lib/settings';
import { mailConfigured } from '@/lib/mailer';
import SettingsForm from './SettingsForm';

export const metadata = { title: 'Livestream & settings' };

export default async function SettingsPage() {
  await requireAdmin();
  const s = await getSettings();
  return (
    <div className="max-w-2xl">
      <h1 className="h-display text-4xl">Livestream & settings</h1>
      <p className="mt-1 text-sm text-muted">Changes show on the website within a few seconds.</p>
      <SettingsForm initial={s} />
      <div className="card mt-6 p-5 text-sm">
        <p className="font-semibold">Confirmation emails</p>
        <p className={`mt-1 ${mailConfigured() ? 'text-brand-green' : 'text-brand-red'}`}>
          {mailConfigured() ? 'Email sending is configured.' : 'Email sending is not configured yet. Registrations are saved, and emails can be resent from each registration once it is set up.'}
        </p>
      </div>
    </div>
  );
}
