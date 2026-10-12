import express from "express";
import { readFile } from "node:fs/promises";
import { openLocalDatabase } from "./db.js";
import { createApiHandler } from "../shared/api-handler.js";

const port = Number(process.env.PORT || 8788);
const database = await openLocalDatabase(
  process.env.DATA_DIR || "data/local-postgres",
);
const config = JSON.parse(
  await readFile(new URL("../site.config.json", import.meta.url), "utf8"),
);
const app = express();
app.disable("x-powered-by");
app.use("/api", express.text({ type: "*/*", limit: "16kb" }));
const handler = createApiHandler({
  rpc: database.rpc,
  config,
  allowedOrigins: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
    `http://localhost:${port}`,
    `http://127.0.0.1:${port}`,
  ],
});
app.use("/api", async (req, res) => {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers))
    if (typeof value === "string") headers.set(key, value);
  headers.set("x-real-ip", req.socket.remoteAddress || "local");
  const request = new Request(`http://localhost:${port}${req.originalUrl}`, {
    method: req.method,
    headers,
    ...(!["GET", "HEAD", "OPTIONS"].includes(req.method)
      ? { body: req.body || "{}" }
      : {}),
  });
  const response = await handler(request);
  response.headers.forEach((value, name) => res.setHeader(name, value));
  res.status(response.status).send(Buffer.from(await response.arrayBuffer()));
});
app.use((error, req, res, next) => {
  res
    .status(error.status || 500)
    .json({
      error: error.status === 413 ? "请求内容过大。" : "本地服务暂时没有回应。",
    });
});
const server = app.listen(port, "0.0.0.0", () =>
  console.log(`Local Supabase-compatible API: http://localhost:${port}/api`),
);
async function shutdown() {
  server.close();
  await database.close();
  process.exit(0);
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
