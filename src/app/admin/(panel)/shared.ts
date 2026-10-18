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
