import { randomBytes } from "node:crypto";
import { mkdir, writeFile, appendFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { normalizeCode, hash } from "../shared/api-handler.js";
import { openLocalDatabase } from "../server/db.js";

if (existsSync(".env.admin.local")) process.loadEnvFile(".env.admin.local");
const args = process.argv.slice(2);
const command = args[0] || "create";
const value = (flag, fallback) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : fallback;
};
const production = args.includes("--production");
let local;
let client;
if (production) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY)
    throw new Error("请先配置本机 .env.admin.local，再生成线上密码。");
  client = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } },
  );
} else
  local = await openLocalDatabase(
    process.env.DATA_DIR || "data/local-postgres",
  );
const rpc = async (name, params) => {
  if (local) return local.rpc(name, params);
  const { data, error } = await client.rpc(name, params);
  if (error) throw error;
  return data;
};
try {
  if (command === "create") {
    const supplied = value("--code", "");
    const count = supplied ? 1 : Number(value("--count", "10"));
    if (!Number.isInteger(count) || count < 1 || count > 10000)
      throw new Error("数量应在1到10000之间");
    await mkdir("data", { recursive: true });
    const filename = `data/${production ? "online" : "local"}-codes-${new Date().toISOString().replace(/[:.]/g, "-")}.csv`;
    await writeFile(filename, "\ufeff密码,可测次数\n", { mode: 0o600 });
    let created = 0;
    for (let i = 0; i < count; i++) {
      const code =
        supplied ||
        `SOUL-${randomBytes(8).toString("hex").toUpperCase().match(/.{4}/g).join("-")}`;
      const normalized = normalizeCode(code);
      if (!/^[A-Z0-9]{6,64}$/.test(normalized))
        throw new Error("密码只能包含字母、数字和连字符，至少6位");
      await rpc("arcana_create_code", {
        p_code_hash: await hash(normalized),
        p_label: `…${normalized.slice(-4)}`,
      });
      await appendFile(filename, `${code},3\n`);
      created++;
    }
    console.log(
      `已生成${created}个${production ? "线上" : "本地"}密码，每个可测3次。\n保存位置：${filename}`,
    );
    if (supplied) console.log(`演示密码：${supplied}`);
  } else if (command === "list") {
    let rows;
    if (local)
      rows = (
        await local.db.query(
          "select label,used,max_uses,enabled,created_at from public.arcana_codes order by created_at desc",
        )
      ).rows;
    else {
      const { data, error } = await client
        .from("arcana_codes")
        .select("label,used,max_uses,enabled,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      rows = data;
    }
    console.table(rows);
  } else if (command === "revoke") {
    const code = normalizeCode(value("--code", ""));
    if (!code) throw new Error("请通过 --code 指定要停用的密码");
    if (local)
      await local.db.query(
        "update public.arcana_codes set enabled=false where code_hash=$1",
        [await hash(code)],
      );
    else {
      const { error } = await client
        .from("arcana_codes")
        .update({ enabled: false })
        .eq("code_hash", await hash(code));
      if (error) throw error;
    }
    console.log("已停用指定密码。已有分享结果仍可查看。");
  } else throw new Error("未知命令");
} finally {
  if (local) await local.close();
}
