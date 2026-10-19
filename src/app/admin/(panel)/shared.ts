export const TYPE_LABEL: Record<string, string> = {
  attend: 'Attending in Lagos',
  online: 'Watching online',
  volunteer: 'Volunteer',
  partner: 'Partner or sponsor',
};

export const fmtWAT = (d: Date | string) =>
  new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Lagos', day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(d));

// "How did you hear about Oratorio 2026?" as plain text.
export const heardFrom = (answers: Record<string, string | string[]> | null | undefined) => {
  const v = answers?.['1707098136'];
  const list = Array.isArray(v) ? v : v ? [v] : [];
  const other = answers?.['1707098136.other'];
  const out = list.map((x) => (x === '__other_option__' ? `Other: ${other ?? ''}` : x.replace(/\s*\(Instagram, Facebook, TikTok, YouTube, WhatsApp\)/, '')));
  return out.length ? out.join(', ') : '-';
};

// Colour of each attendance type, used consistently across the admin.
export const TYPE_BADGE: Record<string, string> = {
  attend: 'bg-brand-soft text-brand',
  online: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
  volunteer: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  partner: 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
};
