'use client';

import { useEffect } from 'react';

// Last-resort boundary (errors in the root layout). Same one-time reload for
// a stale script file after a site update.
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    if (error?.name !== 'ChunkLoadError' && !/Loading (CSS )?chunk|dynamically imported module/i.test(String(error?.message))) return;
    try {
      const k = 'oratorio-reloaded-at';
      if (Date.now() - Number(sessionStorage.getItem(k) || 0) > 30_000) {
        sessionStorage.setItem(k, String(Date.now()));
        window.location.reload();
      }
    } catch {}
  }, [error]);
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', background: '#fffbf7', color: '#1a1114', display: 'grid', placeItems: 'center', minHeight: '100vh', margin: 0, textAlign: 'center', padding: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, margin: 0 }}>This page needs a quick refresh</h1>
          <p style={{ color: '#64585c' }}>We have just updated the site. Your registration and answers are safe.</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: 16, padding: '14px 28px', borderRadius: 999, border: 0, background: '#dc2626', color: '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Refresh page</button>
        </div>
      </body>
    </html>
  );
}
