import 'server-only';
import postgres from 'postgres';

// One pool per process. The Supabase session pooler caps connections per
// project, so keep this small; the app is a single long-running Node process.
const globalForDb = globalThis as unknown as { __oratorioSql?: postgres.Sql };

export const sql =
  globalForDb.__oratorioSql ??
  postgres({
    host: process.env.SUPABASE_DB_HOST,
    port: Number(process.env.SUPABASE_DB_PORT || 5432),
    user: process.env.SUPABASE_DB_USER,
    password: process.env.SUPABASE_DB_PASSWORD,
    database: 'postgres',
    ssl: 'require',
    max: 5,
    idle_timeout: 30,
    connect_timeout: 10,
  });

if (process.env.NODE_ENV !== 'production') globalForDb.__oratorioSql = sql;
