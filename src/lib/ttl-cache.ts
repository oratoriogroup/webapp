import 'server-only';

// Tiny per-process cache for admin list queries (ADMIN_UPGRADE_22OCT2026).
// During the event several staff search and page through registrations at
// once; identical queries within a few seconds are served from memory instead
// of hitting the database again. Short TTL so new registrations and check-ins
// show up almost straight away; actions that change a registration clear it.
type Entry = { at: number; value: unknown };
const store = new Map<string, Entry>();
const MAX = 500;

export async function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const hit = store.get(key);
  if (hit && Date.now() - hit.at < ttlMs) return hit.value as T;
  const value = await load();
  if (store.size >= MAX) store.delete(store.keys().next().value as string);
  store.set(key, { at: Date.now(), value });
  return value;
}

export const clearCache = (prefix = '') => {
  for (const k of store.keys()) if (k.startsWith(prefix)) store.delete(k);
};
