import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <p className="eyebrow">404</p>
      <h1 className="h-display mt-3 text-5xl">Page not found</h1>
      <p className="mt-3 text-muted">The page you are looking for does not exist.</p>
      <Link href="/" className="btn-primary mt-8">Back to home</Link>
    </div>
  );
}
