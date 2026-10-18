import type { Metadata, Viewport } from 'next';
import { Anton, Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import { EVENT, SITE_URL } from '@/lib/event';
import './globals.css';

const display = Playfair_Display({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display-face',
  display: 'swap',
});
const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans-face',
  display: 'swap',
});

// Heavy condensed face used only by the DP card (not preloaded on every page).
const impact = Anton({ subsets: ['latin'], weight: '400', variable: '--font-impact-face', display: 'swap', preload: false });

const description = `${EVENT.tagline}. ${EVENT.dateLabel}, ${EVENT.timeLabel}, live in Lagos and streaming worldwide.`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${EVENT.name}: ${EVENT.theme}`, template: `%s | ${EVENT.name}` },
  description,
  applicationName: 'Oratorio',
  openGraph: {
    type: 'website',
    siteName: 'Oratorio Music Foundation',
    title: `${EVENT.name}: ${EVENT.theme}`,
    description,
    url: SITE_URL,
    images: [{ url: '/images/og.jpg', width: 1200, height: 630, alt: EVENT.name }],
  },
  twitter: { card: 'summary_large_image', title: `${EVENT.name}: ${EVENT.theme}`, description, images: ['/images/og.jpg'] },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fffbf7' },
    { media: '(prefers-color-scheme: dark)', color: '#0d0a08' },
  ],
};

// Runs before paint so the saved theme applies with no flash. Light is the
// default; dark mode is used only when the visitor turns it on.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');document.documentElement.dataset.theme=t==='dark'?'dark':'light'}catch(e){document.documentElement.dataset.theme='light'}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${impact.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
