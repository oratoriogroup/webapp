import Link from 'next/link';
import { Users, UserCheck, MonitorPlay, HandHeart, Handshake, MailCheck, Clock3, CalendarClock, ArrowRight, TrendingUp, TrendingDown, Minus, Download } from 'lucide-react';
import { requireAdmin } from '@/lib/admin';
import { sql } from '@/lib/db';
import { getSettings } from '@/lib/settings';
import { youtubeId, isChannelUrl } from '@/lib/youtube';
import { initials } from '@/lib/event';
import { TYPE_LABEL, TYPE_BADGE, fmtWAT } from './shared';
import AdminHeader, { actionBtn, cardCls } from './AdminHeader';

export const metadata = { title: 'Overview' };

type Stats = { total: number; today: number; yesterday: number; attend: number; online: number; volunteer: number; partner: number; sent: number; pending: number; checked: number };

function Trend({ today, yesterday }: { today: number; yesterday: number }) {
  if (today === yesterday) return <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted"><Minus className="size-3.5" /> Same as yesterday</span>;
  const up = today > yesterday;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${up ? 'text-brand-green' : 'text-brand-red'}`}>
      {up ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />} {up ? '+' : ''}{today - yesterday} vs yesterday
    </span>
  );
}

export default async function Overview() {
  await requireAdmin();
  const [[stats], daily, latest, settings] = await Promise.all([
    sql<Stats[]>`
      select count(*)::int total,
        count(*) filter (where (created_at at time zone 'Africa/Lagos')::date = (now() at time zone 'Africa/Lagos')::date)::int today,
        count(*) filter (where (created_at at time zone 'Africa/Lagos')::date = (now() at time zone 'Africa/Lagos')::date - 1)::int yesterday,
        count(*) filter (where connect_type = 'attend')::int attend,
        count(*) filter (where connect_type = 'online')::int online,
        count(*) filter (where connect_type = 'volunteer')::int volunteer,
        count(*) filter (where connect_type = 'partner')::int partner,
        count(*) filter (where email_sent_at is not null)::int sent,
        count(*) filter (where email_sent_at is null)::int pending,
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
    sql<{ id: string; full_name: string; connect_type: string; created_at: Date; location: string | null }[]>`
      select id, full_name, connect_type, created_at, location from public.registrations order by created_at desc limit 8`,
    getSettings(),
  ]);
  const s = stats!;
  const primary = [
    { label: 'Total registrations', value: s.total, icon: Users, href: '/admin/registrations', extra: <span className="text-xs text-muted">{s.checked} checked in</span> },
    { label: 'Registered today', value: s.today, icon: CalendarClock, extra: <Trend today={s.today} yesterday={s.yesterday} /> },
    { label: 'Attending in Lagos', value: s.attend, icon: UserCheck, href: '/admin/registrations?type=attend' },
    { label: 'Watching online', value: s.online, icon: MonitorPlay, href: '/admin/registrations?type=online' },
  ];
  const secondary = [
    { label: 'Volunteers', value: s.volunteer, icon: HandHeart, href: '/admin/registrations?type=volunteer' },
    { label: 'Partners & sponsors', value: s.partner, icon: Handshake, href: '/admin/registrations?type=partner' },
    { label: 'Emails sent', value: s.sent, icon: MailCheck },
    { label: 'Emails pending', value: s.pending, icon: Clock3 },
  ];
  const max = Math.max(1, ...daily.map((d) => d.n));
  const fortnight = daily.reduce((a, d) => a + d.n, 0);
  const streamSet = !!youtubeId(settings.livestream_url) || isChannelUrl(settings.livestream_url);

  const Tile = ({ t }: { t: (typeof primary)[number] }) => {
    const body = (
      <>
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-muted">{t.label}</p>
          <span className="flex size-9 items-center justify-center rounded-xl bg-brand-soft text-brand"><t.icon className="size-[18px]" /></span>
        </div>
        <p className="mt-3 text-3xl font-bold tabular-nums">{t.value.toLocaleString()}</p>
        <div className="mt-1 min-h-5">{t.extra}</div>
      </>
    );
    return t.href ? (
      <Link href={t.href} className={`${cardCls} block p-5 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md`}>{body}</Link>
    ) : (
      <div className={`${cardCls} p-5 transition-shadow hover:shadow-md`}>{body}</div>
    );
  };

  return (
    <div>
      <AdminHeader title="Overview" subtitle="Oratorio 2026 at a glance. Times are in WAT.">
        <span className={`inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold ${streamSet ? 'bg-brand-soft text-brand' : 'bg-surface-2 text-muted'}`}>
          <span className={`size-2 rounded-full ${streamSet ? 'animate-pulse bg-brand' : 'bg-muted'}`} /> {streamSet ? 'Livestream ready' : 'No livestream link'}
        </span>
        <a href="/admin/export" className={actionBtn}><Download className="size-4" /> Export data</a>
      </AdminHeader>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">{primary.map((t) => <Tile key={t.label} t={t} />)}</div>
      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">{secondary.map((t) => <Tile key={t.label} t={t as (typeof primary)[number]} />)}</div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[65fr_35fr]">
        <section className={`${cardCls} p-5`}>
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="font-semibold">Registrations, last 14 days</h2>
              <p className="text-xs text-muted">{fortnight.toLocaleString()} in total</p>
            </div>
          </div>
          <div className="mt-6 flex h-56 items-end gap-1.5" role="img" aria-label="Registrations per day for the last 14 days">
            {daily.map((d) => (
              <div key={d.day} className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                <span className="text-[10px] font-semibold text-muted opacity-0 transition-opacity group-hover:opacity-100">{d.n}</span>
                <div className="w-full rounded-t-lg bg-gradient-to-t from-brand-deep/80 to-brand/70 transition-all group-hover:from-brand-deep group-hover:to-brand" style={{ height: `${Math.max(3, (d.n / max) * 100)}%` }} title={`${d.day}: ${d.n}`} />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-muted"><span>{daily[0]?.day}</span><span>{daily.at(-1)?.day}</span></div>
        </section>

        <section className={`${cardCls} p-5`}>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Latest registrations</h2>
            <Link href="/admin/registrations" className="inline-flex items-center gap-1 text-sm font-semibold text-brand">View all <ArrowRight className="size-3.5" /></Link>
          </div>
          {latest.length === 0 ? (
            <p className="mt-6 text-sm text-muted">No registrations yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {latest.map((r) => (
                <li key={r.id}>
                  <Link href={`/admin/registrations/${r.id}`} className="group flex items-center gap-3 py-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand">{initials(r.full_name)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold group-hover:text-brand">{r.full_name}</span>
                      <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${TYPE_BADGE[r.connect_type]}`}>{TYPE_LABEL[r.connect_type]}</span>
                    </span>
                    <span className="shrink-0 rounded-lg bg-surface-2 px-2 py-1 text-[11px] text-muted">{fmtWAT(r.created_at)}</span>
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
