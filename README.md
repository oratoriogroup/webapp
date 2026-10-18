# Oratorio 2026 website

Website and admin for Oratorio 2026: The Sound of Thanks (oratoriogroup.org).

- Next.js 15 (App Router), Tailwind CSS 4, TypeScript
- Supabase Postgres for data, Supabase Auth for admin sign-in
- Light and dark mode, responsive, phone bottom navigation

## Pages

| Path | What it is |
| --- | --- |
| `/` | Home: event details, countdown, featured video, lineup, venue map |
| `/register` | Registration, saved to Supabase (with save and continue later) |
| `/register/success` | Confirmation: Google Calendar, .ics download, DP maker, share links |
| `/live` | Livestream (YouTube link set from the admin) |
| `/admin` | Admin: overview, registrations (search, CSV export, resend email, check-in), livestream and settings |

## Setup

```bash
cp .env.example .env   # fill in values, never commit .env
npm install
npm run db:migrate     # creates tables in Supabase
npm run dev
```

### Admin access

1. Supabase dashboard > Authentication > Users > Add user (email and password).
2. Allow the email: add it to `ADMIN_EMAILS` in `.env`, or insert it into `public.admins`.
3. Turn off public sign-ups in Supabase Auth settings.

### Confirmation emails

Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` and `MAIL_FROM`. Until then, registrations are saved and emails can be resent from the admin.

## Deploy (Contabo)

The app runs as pm2 process `oratorio-web` on `127.0.0.1:3100` behind nginx and Cloudflare.

```bash
npm run build
# copy .next/standalone, .next/static -> .next/static, public -> public
pm2 restart oratorio-web
```

Copyright (c) Oratorio 2026
