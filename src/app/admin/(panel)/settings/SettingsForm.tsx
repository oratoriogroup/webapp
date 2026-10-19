'use client';

import { useActionState, useState } from 'react';
import { Loader2, Save, Radio, PlayCircle, Image as ImageIcon, ToggleRight } from 'lucide-react';
import { updateSettings, type ActionState } from '../../actions';
import type { Settings } from '@/lib/settings';
import { youtubeId, thumbUrl, isChannelUrl } from '@/lib/youtube';
import { cardCls } from '../AdminHeader';

const field =
  'h-11 w-full rounded-xl border border-line bg-surface-2 px-4 font-mono text-xs text-text transition placeholder:text-muted/70 focus:border-brand focus:bg-surface focus:ring-2 focus:ring-(--ring) focus:outline-none';

function Section({ icon: Icon, title, desc, children }: { icon: typeof Radio; title: string; desc: string; children: React.ReactNode }) {
  return (
    <section className={`${cardCls} p-5 sm:p-6`}>
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand"><Icon className="size-5" /></span>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold">{title}</h2>
          <p className="mt-0.5 text-xs text-muted">{desc}</p>
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </section>
  );
}

export default function SettingsForm({ initial }: { initial: Settings }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateSettings, {});
  const [live, setLive] = useState(initial.livestream_url);
  const [open, setOpen] = useState(initial.registration_open === 'true');
  const id = youtubeId(live);
  const channel = !id && isChannelUrl(live);

  return (
    <form action={action} className="space-y-4">
      <Section icon={Radio} title="YouTube stream configuration" desc="The channel link plays whatever the channel is streaming, from an hour before the start. For one specific stream, paste its video link instead.">
        <label htmlFor="livestream_url" className="sr-only">Livestream link</label>
        <input id="livestream_url" name="livestream_url" value={live} onChange={(e) => setLive(e.target.value)} placeholder="https://www.youtube.com/@channel or /live/..." className={field} inputMode="url" />
        {live && !id && !channel && <p className="mt-2 text-xs font-semibold text-brand-red">This does not look like a YouTube channel or video link.</p>}
        {channel && <p className="mt-2 text-xs font-semibold text-brand-green">Channel mode: the live page plays the channel&apos;s current live stream during the event.</p>}
        {id && (
          <div className="mt-3 flex items-center gap-3 rounded-xl bg-surface-2 p-3">
            <img src={thumbUrl(id)} alt="" className="h-14 w-24 rounded-md object-cover" />
            <p className="text-xs">Video <span className="font-mono font-semibold">{id}</span> will play on <a href="/livestream" target="_blank" className="font-semibold text-brand hover:underline">/livestream</a>.</p>
          </div>
        )}
      </Section>

      <Section icon={PlayCircle} title="Homepage hero video" desc="Fallback YouTube video for the home page. The landscape video file on the server is used first.">
        <input id="featured_video_url" name="featured_video_url" defaultValue={initial.featured_video_url} placeholder="https://www.youtube.com/watch?v=..." className={field} inputMode="url" aria-label="Featured video link" />
      </Section>

      <Section icon={ImageIcon} title="GetDP campaign link" desc="Optional. If you create a free DP campaign on getdp.co, its link shows on the confirmation page next to the built-in DP maker.">
        <input id="getdp_url" name="getdp_url" defaultValue={initial.getdp_url} placeholder="https://getdp.co/..." className={field} inputMode="url" aria-label="GetDP link" />
      </Section>

      <Section icon={ToggleRight} title="Registration" desc="Turn off to close the registration form and saved drafts.">
        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-surface-2 p-3">
          <span className="text-sm font-semibold">{open ? 'Registration is open' : 'Registration is closed'}</span>
          <span className="relative inline-flex items-center">
            <input type="checkbox" name="registration_open" checked={open} onChange={(e) => setOpen(e.target.checked)} className="peer sr-only" />
            <span className="h-7 w-12 rounded-full bg-slate-300 transition-colors peer-checked:bg-brand dark:bg-slate-600" />
            <span className="absolute left-1 size-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
          </span>
        </label>
      </Section>

      {/* Sticky save bar */}
      <div className="sticky bottom-24 z-20 lg:bottom-4">
        <div className={`${cardCls} flex flex-wrap items-center justify-between gap-3 p-3 shadow-lg`}>
          <p role="status" className={`text-sm ${state.error ? 'font-semibold text-brand-red' : state.ok ? 'font-semibold text-brand-green' : 'text-muted'}`}>
            {state.error || state.ok || 'Review your changes, then save.'}
          </p>
          <button type="submit" disabled={pending} className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-6 text-sm font-semibold text-white shadow-lg shadow-brand/25 hover:bg-brand-deep disabled:opacity-60">
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save changes
          </button>
        </div>
      </div>
    </form>
  );
}
