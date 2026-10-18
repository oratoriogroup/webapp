import 'server-only';
import { unstable_cache, revalidateTag, revalidatePath } from 'next/cache';
import { sql } from './db';

export type Settings = {
  livestream_url: string;
  featured_video_url: string;
  getdp_url: string;
  registration_open: string;
};

const DEFAULTS: Settings = { livestream_url: '', featured_video_url: '', getdp_url: '', registration_open: 'true' };
export const SETTING_KEYS = Object.keys(DEFAULTS) as (keyof Settings)[];

const load = async (): Promise<Settings> => {
  try {
    const rows = await sql<{ key: string; value: string }[]>`select key, value from public.site_settings`;
    const out = { ...DEFAULTS };
    for (const r of rows) if (r.key in out) out[r.key as keyof Settings] = r.value;
    return out;
  } catch {
    // The public site must render even if the database is briefly unreachable.
    return { ...DEFAULTS };
  }
};

export const getSettings = unstable_cache(load, ['site-settings'], { tags: ['settings'], revalidate: 30 });

export const saveSettings = async (patch: Partial<Settings>, by: string) => {
  for (const key of SETTING_KEYS) {
    const v = patch[key];
    if (v === undefined) continue;
    await sql`
      insert into public.site_settings (key, value, updated_at, updated_by)
      values (${key}, ${v}, now(), ${by})
      on conflict (key) do update set value = excluded.value, updated_at = now(), updated_by = excluded.updated_by`;
  }
  revalidateTag('settings');
  revalidatePath('/');
  revalidatePath('/livestream');
};
