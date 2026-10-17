// Applies every supabase/*.sql file in order. Usage: npm run db:migrate
import postgres from 'postgres';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

process.loadEnvFile?.('.env');
const sql = postgres({
  host: process.env.SUPABASE_DB_HOST,
  port: 5432,
  user: process.env.SUPABASE_DB_USER,
  password: process.env.SUPABASE_DB_PASSWORD,
  database: 'postgres',
  ssl: 'require',
  max: 1,
});
const dir = 'supabase';
for (const f of readdirSync(dir).filter((x) => x.endsWith('.sql')).sort()) {
  await sql.unsafe(readFileSync(join(dir, f), 'utf8'));
  console.log('applied', f);
}
await sql.end();
