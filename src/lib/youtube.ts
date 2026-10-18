// Accepts any common YouTube link (watch, youtu.be, live, embed, shorts) or a
// bare 11 character id. Returns null for anything else, so an admin typo can
// never inject an arbitrary URL into the player iframe.
export const youtubeId = (input: string | null | undefined): string | null => {
  const s = String(input || '').trim();
  if (!s) return null;
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  let u: URL;
  try {
    u = new URL(s.startsWith('http') ? s : `https://${s}`);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\.|^m\./, '');
  let id: string | null = null;
  if (host === 'youtu.be') id = u.pathname.slice(1).split('/')[0] || null;
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    if (u.pathname === '/watch') id = u.searchParams.get('v');
    else {
      const m = u.pathname.match(/^\/(live|embed|shorts|v)\/([^/?#]+)/);
      if (m) id = m[2] ?? null;
    }
  }
  return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
};

export const embedUrl = (id: string, autoplay = true) =>
  `https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1&modestbranding=1${autoplay ? '&autoplay=1' : ''}`;

export const thumbUrl = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

// True for a link to a YouTube channel page rather than a single video.
export const isChannelUrl = (input: string | null | undefined) => {
  try {
    const u = new URL(String(input || '').trim());
    return /(^|\.)youtube\.com$/.test(u.hostname) && /^\/(@[\w.-]+|channel\/UC[\w-]{22}|c\/[\w.-]+)(\/(live|streams|videos|featured))?\/?$/.test(u.pathname);
  } catch {
    return false;
  }
};

// Plays whatever the channel is streaming live right now.
export const channelLiveEmbedUrl = (channelId: string) =>
  `https://www.youtube.com/embed/live_stream?channel=${channelId}&autoplay=1&rel=0&playsinline=1`;
