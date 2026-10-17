import type { Metadata } from 'next';

export const metadata: Metadata = { title: { default: 'Admin', template: '%s | Oratorio Admin' }, robots: { index: false, follow: false } };

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return children;
}
