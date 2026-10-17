'use client';

import { useActionState, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { updateSettings, type ActionState } from '../../actions';
import type { Settings } from '@/lib/settings';
import { youtubeId, thumbUrl } from '@/lib/youtube';

export default function SettingsForm({ initial }: { initial: Settings }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateSettings, {});
  const [live, setLive] = useState(initial.livestream_url);
  const id = youtubeId(live);

  return (
    <form action={action} className="mt-6 space-y-5">
      <section className="card p-5 sm:p-6">
        <label htmlFor="livestream_url" className="font-semibold">Livestream link (YouTube)</label>
        <p className="mt-1 text-sm text-muted">Paste the YouTube live link when the stream is scheduled. The live page switches to the player on its own.</p>
        <input id="livestream_url" name="livestream_url" value={live} onChange={(e) => setLive(e.target.value)} placeholder="https://www.youtube.com/live/..." className="field mt-3" inputMode="url" />
        {live && !id && <p className="mt-2 text-sm text-brand-red">This does not look like a YouTube link.</p>}
        {id && (
          <div className="mt-4 flex items-center gap-3 rounded-xl bg-surface-2 p-3">
            <img src={thumbUrl(id)} alt="" className="h-14 w-24 rounded-md object-cover" />
            <p className="text-sm">Video ID <span className="font-mono font-semibold">{id}</span> will play on <a href="/live" target="_blank" className="font-semibold text-gold underline-offset-4 hover:underline">/live</a>.</p>
          </div>
        )}
      </section>

      <section className="card p-5 sm:p-6">
        <label htmlFor="featured_video_url" className="font-semibold">Featured video on the home page (YouTube)</label>
        <p className="mt-1 text-sm text-muted">A highlight or promo video. Leave empty to show &quot;Video coming soon&quot;.</p>
        <input id="featured_video_url" name="featured_video_url" defaultValue={initial.featured_video_url} placeholder="https://www.youtube.com/watch?v=..." className="field mt-3" inputMode="url" />
      </section>

      <section className="card p-5 sm:p-6">
        <label htmlFor="getdp_url" className="font-semibold">GetDP campaign link (optional)</label>
        <p className="mt-1 text-sm text-muted">If you create a free DP campaign on getdp.co, paste its link and it will show on the confirmation page next to our built-in DP maker.</p>
        <input id="getdp_url" name="getdp_url" defaultValue={initial.getdp_url} placeholder="https://getdp.co/..." className="field mt-3" inputMode="url" />
      </section>

      <section className="card flex items-center justify-between gap-4 p-5 sm:p-6">
        <div>
          <p className="font-semibold">Registration open</p>
          <p className="mt-1 text-sm text-muted">Turn off to close the registration form.</p>
        </div>
        <label className="relative inline-flex cursor-pointer items-center">
          <input type="checkbox" name="registration_open" defaultChecked={initial.registration_open === 'true'} className="peer sr-only" />
          <span className="h-7 w-12 rounded-full bg-surface-2 ring-1 ring-line transition-colors peer-checked:bg-gold" />
          <span className="absolute left-1 size-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
          <span className="sr-only">Registration open</span>
        </label>
      </section>

      {(state.error || state.ok) && (
        <p role="status" className={`rounded-xl px-4 py-3 text-sm ${state.error ? 'bg-brand-red/10 text-brand-red' : 'bg-brand-green/10 text-brand-green'}`}>{state.error || state.ok}</p>
      )}
      <button type="submit" disabled={pending} className="btn-primary w-full sm:w-auto">
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save changes
      </button>
    </form>
  );
}
