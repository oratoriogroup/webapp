// Daily backup of the Oratorio database (Supabase) to this server.
// Every public table goes to one gzipped JSON file per day, plus a CSV of
// registrations for opening in Excel. Files are root-only; 60 days are kept.
import postgres from "postgres";
import { writeFileSync, readdirSync, unlinkSync, chmodSync } from "node:fs";
import { gzipSync } from "node:zlib";

const DIR = "/root/oratorio-backups";
const KEEP_DAYS = 60;
const sql = postgres({
  host: process.env.SUPABASE_DB_HOST, port: Number(process.env.SUPABASE_DB_PORT || 5432),
  user: process.env.SUPABASE_DB_USER, password: process.env.SUPABASE_DB_PASSWORD,
  database: "postgres", ssl: "require", max: 1, connect_timeout: 20,
});

const day = new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Lagos" });
const tables = (await sql`select tablename from pg_tables where schemaname = 'public' order by 1`).map((r) => r.tablename);
const dump = { taken_at: new Date().toISOString(), tables: {} };
for (const t of tables) dump.tables[t] = await sql`select * from public.${sql(t)}`;

const save = (name, data) => { const p = `${DIR}/${name}`; writeFileSync(p, data); chmodSync(p, 0o600); return p; };
save(`oratorio-${day}.json.gz`, gzipSync(JSON.stringify(dump)));

const regs = dump.tables.registrations || [];
const cols = regs.length ? Object.keys(regs[0]) : [];
const cell = (v) => { const s = v == null ? "" : v instanceof Date ? v.toISOString() : typeof v === "object" ? JSON.stringify(v) : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
save(`registrations-${day}.csv.gz`, gzipSync([cols.join(","), ...regs.map((r) => cols.map((c) => cell(r[c])).join(","))].join("\n")));

const cutoff = Date.now() - KEEP_DAYS * 864e5;
for (const f of readdirSync(DIR)) {
  const m = f.match(/(\d{4}-\d{2}-\d{2})/);
  if (m && new Date(m[1]).getTime() < cutoff) unlinkSync(`${DIR}/${f}`);
}
console.log(new Date().toISOString(), "backup ok", day, Object.fromEntries(Object.entries(dump.tables).map(([k, v]) => [k, v.length])));
await sql.end();
