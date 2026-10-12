import { createClient } from "npm:@supabase/supabase-js@2";
import { createApiHandler } from "../_shared/api-handler.js";
import config from "../_shared/site.config.json" with { type: "json" };

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  {
    auth: { persistSession: false, autoRefreshToken: false },
  },
);
const origins = (Deno.env.get("ALLOWED_ORIGINS") || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const handler = createApiHandler({
  config,
  allowedOrigins: origins,
  rpc: async (name: string, params: Record<string, unknown>) => {
    const { data, error } = await supabase.rpc(name, params);
    if (error) throw error;
    return data;
  },
});
Deno.serve(handler);
