'use client';

import { useEffect, useState } from 'react';
import { CONTACTS, whatsappLink } from '@/lib/event';

// Last-resort boundary (errors in the root layout). Same one-time reload for
// a stale script file after a site update.
// GLOBAL_ERROR_22OCT2026: this replaces the root layout, so the site's CSS may
// not be loaded. Everything it needs is in the <style> below (light and dark,
// phone first), and it uses only plain HTML.
const CSS = `
:root{--bg:#fffbf7;--card:#fff;--text:#1a1114;--muted:#64585c;--line:#eee3d8;--brand:#dc2626;--brand-deep:#b91c1c;color-scheme:light}
html[data-theme=dark]{--bg:#0e080d;--card:#181016;--text:#f6eff4;--muted:#b3a3b0;--line:#33242f;--brand:#f05252;color-scheme:dark}
html[data-theme=dark] .logo-light{display:none!important}html[data-theme=dark] .logo-dark{display:block!important}
html[data-theme=dark] .btn-primary{background:#dc2626;box-shadow:0 8px 20px rgba(0,0,0,.35)}
html[data-theme=dark] .card{box-shadow:0 12px 40px rgba(0,0,0,.45)}
html[data-theme=dark] body{background-image:radial-gradient(60% 40% at 50% 0%,rgba(240,82,82,.14),transparent 70%),radial-gradient(50% 35% at 100% 100%,rgba(240,189,79,.10),transparent 70%)}
*{box-sizing:border-box}
html,body{margin:0;min-height:100%;background:var(--bg);color:var(--text);font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;-webkit-text-size-adjust:100%}
body{min-height:100dvh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px 16px max(24px,env(safe-area-inset-bottom));
  background-image:radial-gradient(60% 40% at 50% 0%,rgba(220,38,38,.10),transparent 70%),radial-gradient(50% 35% at 100% 100%,rgba(201,138,18,.12),transparent 70%)}
.wrap{width:100%;max-width:420px;text-align:center}
.logo{display:block;height:44px;width:auto;margin:0 auto 22px}.logo-dark{display:none}
.card{background:var(--card);border:1px solid var(--line);border-radius:24px;padding:28px 20px 22px;box-shadow:0 12px 40px rgba(26,17,20,.08)}
.icon{width:56px;height:56px;margin:0 auto;border-radius:999px;display:flex;align-items:center;justify-content:center;background:rgba(220,38,38,.10);color:var(--brand)}
.eyebrow{margin:16px 0 0;font-size:12px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--brand)}
h1{margin:8px 0 0;font-family:Georgia,'Times New Roman',serif;font-weight:600;font-size:26px;line-height:1.2;text-wrap:balance}
p.lead{margin:10px 0 0;font-size:15px;line-height:1.55;color:var(--muted);text-wrap:balance}
.btns{display:grid;gap:10px;margin-top:22px}
.btn{display:flex;align-items:center;justify-content:center;gap:8px;min-height:48px;padding:12px 20px;border-radius:999px;font-family:inherit;font-size:15px;font-weight:600;line-height:1;text-decoration:none;cursor:pointer;-webkit-tap-highlight-color:transparent}
.btn-primary{border:0;background:var(--brand);color:#fff;box-shadow:0 8px 20px rgba(220,38,38,.25)}
.btn-primary:active{background:var(--brand-deep)}
.btn-outline{border:1px solid var(--line);background:transparent;color:var(--text)}
.help{margin:18px 0 0;font-size:14px;color:var(--muted)}
.help a{color:#128c4b;font-weight:600;text-decoration:none;white-space:nowrap}
html[data-theme=dark] .help a{color:#4ade80}
.foot{margin-top:22px;font-size:12px;color:var(--muted)}
@media (min-width:640px){.card{padding:36px 32px 28px}h1{font-size:30px}.btns{grid-template-columns:1fr 1fr}}
/* Short phone screens (e.g. 320 x 568): tighter spacing so it fits without scrolling. */
@media (max-height:640px){body{padding:14px 16px max(14px,env(safe-area-inset-bottom))}.logo{height:38px;margin-bottom:14px}.card{padding:20px 18px 18px}.icon{width:44px;height:44px}.eyebrow{margin-top:12px}h1{font-size:23px}.btns{margin-top:16px}.help{margin-top:12px}.foot{margin-top:14px}}
`;

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
  // Match the theme the visitor chose on the site (the admin keeps its own
  // setting); with no choice saved the site is light, so this page is too.
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  useEffect(() => {
    try {
      const key = window.location.pathname.startsWith('/admin') ? 'admin-theme' : 'theme';
      if (localStorage.getItem(key) === 'dark') setTheme('dark');
    } catch {}
  }, []);
  const help = CONTACTS[0];
  return (
    <html lang="en" data-theme={theme}>
      <head>
        <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
        <title>Please refresh | Oratorio 2026</title>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
      </head>
      <body>
        <main className="wrap">
          <a href="/" aria-label="Oratorio home">
            <img className="logo logo-light" src="/images/logo-color.png" alt="Oratorio Music Foundation" />
            <img className="logo logo-dark" src="/images/logo-white.png" alt="Oratorio Music Foundation" />
          </a>
          <div className="card">
            <div className="icon" aria-hidden>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36" /><path d="M21 3v6h-6" /></svg>
            </div>
            <p className="eyebrow">One moment</p>
            <h1>This page needs a quick refresh</h1>
            <p className="lead">We have just updated the site. Your registration and answers are safe.</p>
            <div className="btns">
              <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>Refresh page</button>
              <a className="btn btn-outline" href="/">Back to home</a>
            </div>
            {help && (
              <p className="help">
                Still stuck? <a href={whatsappLink(help.intl)} target="_blank" rel="noopener noreferrer">WhatsApp {help.label}</a>
              </p>
            )}
          </div>
          <p className="foot">Copyright &copy; Oratorio 2026</p>
        </main>
      </body>
    </html>
  );
}
