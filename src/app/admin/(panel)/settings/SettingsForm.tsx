'use client';

import { useActionState, useState } from 'react';
import { Loader2, Save, Radio, PlayCircle, Image as ImageIcon, ToggleRight } from 'lucide-react';
import { updateSettings, type ActionState } from '../../actions';
import type { Settings } from '@/lib/settings';
import { youtubeId, thumbUrl, isChannelUrl } from '@/lib/youtube';
import { cardCls } from '../AdminHeader';

const field =
  'h-12 w-full min-w-0 rounded-xl border border-line bg-surface-2 px-3.5 font-mono text-base text-text sm:h-11 sm:px-4 sm:text-xs transition placeholder:text-muted/70 focus:border-brand focus:bg-surface focus:ring-2 focus:ring-(--ring) focus:outline-none';

function Section({ icon: Icon, title, desc, children, className = '' }: { icon: typeof Radio; title: string; desc: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`${cardCls} min-w-0 p-4 sm:p-6 ${className}`}>
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand sm:size-10"><Icon className="size-[18px] sm:size-5" /></span>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold leading-tight sm:leading-normal">{title}</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted sm:mt-0.5">{desc}</p>
          {/* Phones: pull the field back under the icon (size-9 + gap-3 = 3rem)
              so it uses the full card width; tablets (two-column cards) do the
              same with the larger icon (size-10 + gap-3 = 3.25rem). Rendered
              once, so form values and ids stay unique. */}
          <div className="mt-3 -ml-12 sm:mt-4 sm:ml-0 md:-ml-[3.25rem] xl:ml-0">{children}</div>
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
    <form action={action} className="space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 xl:block xl:space-y-4">
      <Section className="md:col-span-2" icon={Radio} title="YouTube stream configuration" desc="The channel link plays whatever the channel is streaming, from an hour before the start. For one specific stream, paste its video link instead.">
        <label htmlFor="livestream_url" className="sr-only">Livestream link</label>
        <input id="livestream_url" name="livestream_url" value={live} onChange={(e) => setLive(e.target.value)} placeholder="https://www.youtube.com/@channel or /live/..." className={field} inputMode="url" />
        {live && !id && !channel && <p className="mt-2 text-xs font-semibold text-brand-red">This does not look like a YouTube channel or video link.</p>}
        {channel && <p className="mt-2 text-xs font-semibold text-brand-green">Channel mode: the live page plays the channel&apos;s current live stream during the event.</p>}
        {id && (
          <div className="mt-3 flex min-w-0 items-center gap-3 rounded-xl bg-surface-2 p-3">
            <img src={thumbUrl(id)} alt="" className="h-12 w-20 shrink-0 rounded-md object-cover sm:h-14 sm:w-24" />
            <p className="min-w-0 text-xs break-words">Video <span className="font-mono font-semibold">{id}</span> will play on <a href="/livestream" target="_blank" className="font-semibold text-brand hover:underline">/livestream</a>.</p>
          </div>
        )}
      </Section>

      <Section icon={PlayCircle} title="Homepage hero video" desc="Fallback YouTube video for the home page. The landscape video file on the server is used first.">
        <input id="featured_video_url" name="featured_video_url" defaultValue={initial.featured_video_url} placeholder="https://www.youtube.com/watch?v=..." className={field} inputMode="url" aria-label="Featured video link" />
      </Section>

      <Section icon={ImageIcon} title="GetDP campaign link" desc="Optional. If you create a free DP campaign on getdp.co, its link shows on the confirmation page next to the built-in DP maker.">
        <input id="getdp_url" name="getdp_url" defaultValue={initial.getdp_url} placeholder="https://getdp.co/..." className={field} inputMode="url" aria-label="GetDP link" />
      </Section>

      <Section className="md:col-span-2" icon={ToggleRight} title="Registration" desc="Turn off to close the registration form and saved drafts.">
        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-surface-2 p-3">
          <span className="text-sm font-semibold">{open ? 'Registration is open' : 'Registration is closed'}</span>
          <span className="relative inline-flex items-center">
            <input type="checkbox" name="registration_open" checked={open} onChange={(e) => setOpen(e.target.checked)} className="peer sr-only" />
            <span className="h-7 w-12 rounded-full bg-slate-300 transition-colors peer-checked:bg-brand" />
            <span className="absolute left-1 size-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
          </span>
        </label>
      </Section>

      {/* Sticky save bar */}
      <div className="sticky bottom-24 z-20 md:col-span-2 lg:bottom-4">
        <div className={`${cardCls} flex items-center justify-between gap-3 p-2.5 pl-4 shadow-lg sm:flex-wrap sm:p-3`}>
          <p role="status" className={`min-w-0 text-xs leading-snug sm:text-sm ${state.error ? 'font-semibold text-brand-red' : state.ok ? 'font-semibold text-brand-green' : 'text-muted'}`}>
            {state.error || state.ok || <><span className="sm:hidden">Tap Save to apply your changes.</span><span className="hidden sm:inline">Review your changes, then save.</span></>}
          </p>
          <button type="submit" disabled={pending} className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold sm:px-6 text-white shadow-lg shadow-brand/25 hover:bg-brand-deep disabled:opacity-60">
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save<span className="hidden sm:inline"> changes</span>
          </button>
        </div>
      </div>
    </form>
  );
}
