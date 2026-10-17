import type { Metadata } from 'next';
import SuccessClient from './SuccessClient';
import { getSettings } from '@/lib/settings';
import { googleCalendarUrl } from '@/lib/calendar';

export const metadata: Metadata = { title: 'Registration confirmed', robots: { index: false } };
export const revalidate = 60;

export default async function SuccessPage() {
  const settings = await getSettings();
  return <SuccessClient getdpUrl={/^https:\/\/(www\.)?getdp\.co\//.test(settings.getdp_url) ? settings.getdp_url : ''} calendarUrl={googleCalendarUrl()} />;
}
