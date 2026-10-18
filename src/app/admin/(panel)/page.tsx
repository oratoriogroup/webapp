import Link from 'next/link';
import { Users, UserCheck, MonitorPlay, HandHeart, Handshake, MailCheck, MailWarning, CalendarClock, ArrowRight } from 'lucide-react';
import { requireAdmin } from '@/lib/admin';
import { sql } from '@/lib/db';
import { getSettings } from '@/lib/settings';
import { youtubeId } from '@/lib/youtube';
import { TYPE_LABEL, fmtWAT } from './shared';

export const metadata = { title: 'Overview' };

export default async function Overview() {
  await requireAdmin();
  const [[stats], daily, latest, settings] = await Promise.all([
    sql<{ total: number; today: number; attend: number; online: number; volunteer: number; partner: number; sent: number; failed: number; checked: number }[]>`
      select count(*)::int total,
        count(*) filter (where (created_at at time zone 'Africa/Lagos')::date = (now() at time zone 'Africa/Lagos')::date)::int today,
        count(*) filter (where connect_type = 'attend')::int attend,
        count(*) filter (where connect_type = 'online')::int online,
        count(*) filter (where connect_type = 'volunteer')::int volunteer,
        count(*) filter (where connect_type = 'partner')::int partner,
        count(*) filter (where email_sent_at is not null)::int sent,
        count(*) filter (where email_sent_at is null)::int failed,
        count(*) filter (where checked_in_at is not null)::int checked
      from public.registrations`,
    sql<{ day: string; n: number }[]>`
      select to_char(d, 'DD Mon') as day, coalesce(c.n, 0)::int n
      from generate_series((now() at time zone 'Africa/Lagos')::date - 13, (now() at time zone 'Africa/Lagos')::date, interval '1 day') d
      left join (
        select (created_at at time zone 'Africa/Lagos')::date as day, count(*) n from public.registrations
        where created_at > now() - interval '15 days' group by 1
      ) c on c.day = d::date
      order by d`,
    sql<{ id: string; full_name: string; connect_type: string; created_at: Date }[]>`
      select id, full_name, connect_type, created_at from public.registrations order by created_at desc limit 8`,
    getSettings(),
  ]);

  const tiles = [
    { label: 'Total registrations', value: stats!.total, icon: Users },
    { label: 'Registered today', value: stats!.today, icon: CalendarClock },
    { label: 'Attending in Lagos', value: stats!.attend, icon: UserCheck, href: '?type=attend' },
    { label: 'Watching online', value: stats!.online, icon: MonitorPlay, href: '?type=online' },
    { label: 'Volunteers', value: stats!.volunteer, icon: HandHeart, href: '?type=volunteer' },
    { label: 'Partners & sponsors', value: stats!.partner, icon: Handshake, href: '?type=partner' },
    { label: 'Emails sent', value: stats!.sent, icon: MailCheck },
    { label: 'Emails not sent', value: stats!.failed, icon: MailWarning },
  ];
  const max = Math.max(1, ...daily.map((d) => d.n));
  const live = youtubeId(settings.livestream_url);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="h-display text-4xl">Overview</h1>
          <p className="mt-1 text-sm text-muted">Oratorio 2026 at a glance.</p>
        </div>
        <Link href="/admin/settings" className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${live ? 'bg-brand-red text-white' : 'bg-surface-2 text-muted'}`}>
          <span className={`size-2 rounded-full ${live ? 'animate-pulse bg-white' : 'bg-muted'}`} />
          {live ? 'Livestream link is set' : 'No livestream link yet'}
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t) => {
          const body = (
            <>
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand"><t.icon className="size-5" /></span>
              <p className="mt-4 font-display text-4xl font-semibold tabular-nums">{t.value.toLocaleString()}</p>
              <p className="mt-1 text-sm text-muted">{t.label}</p>
            </>
          );
          return t.href ? (
            <Link key={t.label} href={`/admin/registrations${t.href}`} className="card p-5 transition-colors hover:border-brand/40">{body}</Link>
          ) : (
            <div key={t.label} className="card p-5">{body}</div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="card p-5">
          <h2 className="font-semibold">Registrations, last 14 days</h2>
          <div className="mt-6 flex h-44 items-end gap-1.5" role="img" aria-label="Registrations per day for the last 14 days">
            {daily.map((d) => (
              <div key={d.day} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
                <span className="text-[10px] font-semibold text-muted opacity-0 group-hover:opacity-100">{d.n}</span>
                <div className="w-full rounded-t-md bg-brand/80 transition-colors group-hover:bg-brand" style={{ height: `${Math.max(2, (d.n / max) * 100)}%` }} title={`${d.day}: ${d.n}`} />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-muted"><span>{daily[0]?.day}</span><span>{daily.at(-1)?.day}</span></div>
        </section>

        <section className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Latest registrations</h2>
            <Link href="/admin/registrations" className="inline-flex items-center gap-1 text-sm font-semibold text-brand">All <ArrowRight className="size-3.5" /></Link>
          </div>
          {latest.length === 0 ? (
            <p className="mt-6 text-sm text-muted">No registrations yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {latest.map((r) => (
                <li key={r.id}>
                  <Link href={`/admin/registrations/${r.id}`} className="flex items-center justify-between gap-3 py-3 hover:text-brand">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{r.full_name}</span>
                      <span className="text-xs text-muted">{TYPE_LABEL[r.connect_type]}</span>
                    </span>
                    <span className="shrink-0 text-xs text-muted">{fmtWAT(r.created_at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
