import { questions, publicQuestions, QUIZ_VERSION } from "./quiz.js";
import { scoreAnswers, validateAnswers } from "./scoring.js";

export const normalizeCode = (code) =>
  typeof code === "string"
    ? code.trim().toUpperCase().replace(/[\s-]/g, "")
    : "";
export async function hash(value) {
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(bytes), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}
const randomToken = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(24)), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const errors = {
  INVALID_CODE: [401, "测评密码不正确或已停用，请检查后重试。"],
  SESSION_EXPIRED: [
    401,
    "验证已过期，请重新输入测评密码；已保存的进度仍会保留。",
  ],
  QUOTA_EXHAUSTED: [409, "这个密码的3次测评已用完。你仍可查看和保存已有结果。"],
  ATTEMPT_NOT_FOUND: [404, "未找到这次测评，请返回首页重新载入。"],
  ATTEMPT_COMPLETED: [409, "这次测评已经完成，请返回首页查看结果。"],
  REVISION_CONFLICT: [409, "答题进度已在其他页面更新，请重新载入最新进度。"],
  INVALID_ANSWERS: [400, "答题数据不完整，请检查全部题目。"],
  RESULT_NOT_FOUND: [404, "这个结果链接不存在，请检查是否复制完整。"],
};

/** @param {{rpc: (name: string, params: Record<string, unknown>) => Promise<any>, config: Record<string, unknown>, allowedOrigins?: string[]}} options */
export function createApiHandler({ rpc, config, allowedOrigins = [] }) {
  return async function handle(request) {
    const origin = request.headers.get("origin");
    const headers = {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
    };
    if (origin && allowedOrigins.includes(origin)) {
      headers["Access-Control-Allow-Origin"] = origin;
      headers["Vary"] = "Origin";
      headers["Access-Control-Allow-Headers"] =
        "authorization, apikey, content-type, x-client-info";
      headers["Access-Control-Allow-Methods"] =
        "GET, POST, PUT, DELETE, OPTIONS";
    }
    const respond = (data, status = 200) =>
      new Response(JSON.stringify(data), { status, headers });
    if (origin && !allowedOrigins.includes(origin))
      return respond({ error: "此来源尚未授权访问测评服务。" }, 403);
    if (request.method === "OPTIONS")
      return new Response(null, { status: 204, headers });
    const url = new URL(request.url);
    const path = url.pathname.replace(/^.*\/(?:tarot|api)(?=\/|$)/, "") || "/";
    const token =
      request.headers.get("authorization")?.replace(/^Bearer /i, "") || "";
    const tokenHash = /^[a-f0-9]{48}$/i.test(token) ? await hash(token) : "";
    const authenticated = () => {
      if (!tokenHash) throw new Error("SESSION_EXPIRED");
      return tokenHash;
    };
    let body = {};
    try {
      if (["POST", "PUT"].includes(request.method)) {
        if (Number(request.headers.get("content-length") || 0) > 16384)
          return respond({ error: "请求内容过大。" }, 413);
        const raw = await request.text();
        if (raw.length > 16384)
          return respond({ error: "请求内容过大。" }, 413);
        try {
          body = JSON.parse(raw);
        } catch {
          return respond({ error: "请求格式不正确。" }, 400);
        }
        if (!body || Array.isArray(body) || typeof body !== "object")
          return respond({ error: "请求格式不正确。" }, 400);
      }
      if (path === "/config" && request.method === "GET")
        return respond(config);
      if (path === "/questions" && request.method === "GET")
        return respond({ questions: publicQuestions(), version: QUIZ_VERSION });
      if (path === "/session" && request.method === "POST") {
        const code = normalizeCode(body.code);
        const ip =
          request.headers.get("x-real-ip") ||
          request.headers.get("cf-connecting-ip") ||
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          "unknown";
        const permitted = await rpc("arcana_take_rate_limit", {
          p_key_hash: await hash(`login:${ip}`),
          p_limit: 30,
          p_seconds: 300,
        });
        if (!permitted)
          return respond(
            { error: "尝试次数较多，请5分钟后再试，或联系店铺客服。" },
            429,
          );
        if (!/^[A-Z0-9]{6,64}$/.test(code)) throw new Error("INVALID_CODE");
        const sessionToken = randomToken();
        const session = await rpc("arcana_login", {
          p_code_hash: await hash(code),
          p_token_hash: await hash(sessionToken),
        });
        return respond({ token: sessionToken, ...session });
      }
      if (path === "/session" && request.method === "GET")
        return respond(
          await rpc("arcana_session", { p_session_hash: authenticated() }),
        );
      if (path === "/session" && request.method === "DELETE") {
        if (tokenHash)
          await rpc("arcana_logout", { p_session_hash: tokenHash });
        return respond({ ok: true });
      }
      if (path === "/attempts/start" && request.method === "POST") {
        if (!uuid.test(body.requestId || ""))
          return respond({ error: "请刷新页面后重新开始。" }, 400);
        return respond(
          await rpc("arcana_start", {
            p_session_hash: authenticated(),
            p_request_id: body.requestId,
          }),
        );
      }
      const attempt = path.match(
        /^\/attempts\/([a-f0-9-]+)\/(answers|submit)$/i,
      );
      if (attempt && uuid.test(attempt[1])) {
        authenticated();
        if (attempt[2] === "answers" && request.method === "PUT") {
          if (
            !validateAnswers(body.answers) ||
            !Number.isInteger(body.currentQuestion) ||
            body.currentQuestion < 0 ||
            body.currentQuestion >= questions.length ||
            !Number.isInteger(body.revision) ||
            body.revision < 0
          )
            throw new Error("INVALID_ANSWERS");
          return respond(
            await rpc("arcana_save", {
              p_session_hash: tokenHash,
              p_attempt_id: attempt[1],
              p_answers: body.answers,
              p_current_question: body.currentQuestion,
              p_revision: body.revision,
            }),
          );
        }
        if (attempt[2] === "submit" && request.method === "POST") {
          if (!validateAnswers(body.answers, true))
            throw new Error("INVALID_ANSWERS");
          const report = scoreAnswers(body.answers);
          return respond(
            await rpc("arcana_complete", {
              p_session_hash: tokenHash,
              p_attempt_id: attempt[1],
              p_answers: body.answers,
              p_report: report,
              p_result_id: randomToken(),
            }),
          );
        }
      }
      const result = path.match(/^\/results\/([a-f0-9]{48})$/i);
      if (result && request.method === "GET")
        return respond(
          await rpc("arcana_result", {
            p_result_id: result[1],
            p_session_hash: tokenHash,
          }),
        );
      return respond({ error: "没有找到这个页面。" }, 404);
    } catch (error) {
      const match = Object.keys(errors).find((key) =>
        String(error.message).includes(key),
      );
      if (match) {
        const [status, message] = errors[match];
        return respond({ error: message, code: match }, status);
      }
      console.error(
        "Arcana API failure:",
        error.code || error.name || "unknown",
      );
      return respond(
        { error: "服务暂时没有回应，请稍后再试；已保存的进度不会丢失。" },
        500,
      );
    }
  };
}
