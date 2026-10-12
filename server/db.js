// Development/test adapter only. Production runs the same SQL on Supabase Postgres.
import { PGlite } from "@electric-sql/pglite";
import { readFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

export async function openLocalDatabase(directory) {
  if (directory) await mkdir(directory, { recursive: true });
  const db = new PGlite(directory ? resolve(directory) : undefined);
  await db.waitReady;
  await db.exec(`do $$ begin
    if not exists(select 1 from pg_roles where rolname='anon') then create role anon; end if;
    if not exists(select 1 from pg_roles where rolname='authenticated') then create role authenticated; end if;
    if not exists(select 1 from pg_roles where rolname='service_role') then create role service_role bypassrls; end if;
  end $$;`);
  const exists = await db.query(
    "select to_regclass('public.arcana_codes') as name",
  );
  if (!exists.rows[0].name)
    await db.exec(
      await readFile(
        new URL(
          "../supabase/migrations/202610120001_tarot.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );
  const rpc = async (name, params) => {
    if (!/^arcana_[a-z_]+$/.test(name)) throw new Error("Invalid RPC name");
    const entries = Object.entries(params);
    if (entries.some(([key]) => !/^p_[a-z_]+$/.test(key)))
      throw new Error("Invalid parameter");
    const sql = `select public.${name}(${entries.map(([key], i) => `${key} => $${i + 1}`).join(",")}) as data`;
    const values = entries.map(([, value]) =>
      value && typeof value === "object" ? JSON.stringify(value) : value,
    );
    const result = await db.query(sql, values);
    return result.rows[0].data;
  };
  return { db, rpc, close: () => db.close() };
}
