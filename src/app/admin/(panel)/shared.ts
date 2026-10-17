export const TYPE_LABEL: Record<string, string> = {
  attend: 'Attending in Lagos',
  online: 'Watching online',
  volunteer: 'Volunteer',
  partner: 'Partner or sponsor',
};

export const fmtWAT = (d: Date | string) =>
  new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Lagos', day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(d));
