import 'server-only';
import { sql } from '@/lib/db';

export const TYPES = ['attend', 'online', 'volunteer', 'partner'];

// Shared by the list and the CSV export so both always agree.
export const filterSql = (q: string, type: string) => {
  const like = `%${q.replace(/[\\%_]/g, (c) => '\\' + c)}%`;
  return sql`
    where (${type} = '' or connect_type = ${type})
      and (${q} = '' or full_name ilike ${like} or email ilike ${like} or whatsapp ilike ${like} or ref_code ilike ${like})`;
};
