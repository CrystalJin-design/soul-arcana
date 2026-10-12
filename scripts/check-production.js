// Explicit production acceptance check. Creates only isolated QA access codes.
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import { hash, normalizeCode } from "../shared/api-handler.js";

process.loadEnvFile(".env.admin.local");
const projectUrl = process.env.SUPABASE_URL;
const publicKey = (
  await readFile("data/supabase-public-key.txt", "utf8")
).trim();
const apiUrl = `${projectUrl}/functions/v1/tarot`;
const origin = "https://crystaljin-design.github.io";
const admin = createClient(projectUrl, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const anon = createClient(projectUrl, publicKey, {
  auth: { persistSession: false },
});
async function makeCode(label) {
  const code = `QA-${randomBytes(12).toString("hex").toUpperCase()}`;
  const { data, error } = await admin.rpc("arcana_create_code", {
    p_code_hash: await hash(normalizeCode(code)),
    p_label: label,
  });
  if (error) throw error;
  return { code, id: data };
}
async function request(
  path,
  method = "GET",
  body,
  token,
  requestOrigin = origin,
) {
  const response = await fetch(`${apiUrl}${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      apikey: publicKey,
      Origin: requestOrigin,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(30000),
  });
  return { status: response.status, data: await response.json() };
}
const codes = [];
try {
  const main = await makeCode("QA API acceptance");
  codes.push(main);
  const other = await makeCode("QA ownership isolation");
  codes.push(other);
  const config = await request("/config");
  assert.equal(config.data.storeName, "屿岸");
  assert.equal(config.data.supportWeChat, "wxid_zr17rhwndmwy12");
  assert.equal((await request("/session")).status, 401);
  assert.equal(
    (await request("/session", "POST", { code: "INVALID-QA-CODE" })).status,
    401,
  );
  const login = await request("/session", "POST", { code: main.code });
  assert.equal(login.status, 200);
  assert.equal(login.data.remaining, 3);
  const token = login.data.token;
  const otherToken = (await request("/session", "POST", { code: other.code }))
    .data.token;
  const starts = await Promise.all(
    Array.from({ length: 5 }, () =>
      request("/attempts/start", "POST", { requestId: randomUUID() }, token),
    ),
  );
  assert.ok(starts.every((r) => r.status === 200 && r.data.remaining === 2));
  assert.equal(new Set(starts.map((r) => r.data.attempt.id)).size, 1);
  const attempt = starts[0].data.attempt;
  const answers = [...attempt.answers];
  answers[0] = 2;
  assert.equal(
    (
      await request(
        `/attempts/${attempt.id}/answers`,
        "PUT",
        { answers, currentQuestion: 1, revision: 0 },
        otherToken,
      )
    ).status,
    404,
  );
  const saved = await request(
    `/attempts/${attempt.id}/answers`,
    "PUT",
    { answers, currentQuestion: 1, revision: 0 },
    token,
  );
  assert.equal(saved.status, 200);
  assert.equal(saved.data.revision, 1);
  assert.equal(
    (
      await request(
        `/attempts/${attempt.id}/answers`,
        "PUT",
        { answers, currentQuestion: 1, revision: 0 },
        token,
      )
    ).data.code,
    "REVISION_CONFLICT",
  );
  const resumeToken = (await request("/session", "POST", { code: main.code }))
    .data.token;
  const resume = await request("/session", "GET", undefined, resumeToken);
  assert.equal(resume.data.activeAttempt.answers[0], 2);
  assert.equal(resume.data.remaining, 2);
  const completeAnswers = Array.from({ length: 24 }, (_, i) => i % 4);
  let reportId;
  for (let i = 0; i < 3; i++) {
    const active =
      i === 0
        ? attempt
        : (
            await request(
              "/attempts/start",
              "POST",
              { requestId: randomUUID() },
              token,
            )
          ).data.attempt;
    const completed = await request(
      `/attempts/${active.id}/submit`,
      "POST",
      { answers: completeAnswers },
      token,
    );
    assert.equal(completed.status, 200);
    assert.equal(
      (
        await request(
          `/attempts/${active.id}/submit`,
          "POST",
          { answers: completeAnswers },
          token,
        )
      ).data.resultId,
      completed.data.resultId,
    );
    reportId = completed.data.resultId;
  }
  assert.equal(
    (
      await request(
        "/attempts/start",
        "POST",
        { requestId: randomUUID() },
        token,
      )
    ).data.code,
    "QUOTA_EXHAUSTED",
  );
  const report = await request(`/results/${reportId}`);
  assert.equal(report.status, 200);
  assert.equal(report.data.isOwner, false);
  for (const key of ["answers", "code", "token", "codeId", "attemptId"])
    assert.equal(report.data[key], undefined);
  assert.equal(report.data.tendencies.length, 8);
  assert.equal(
    (
      await request(
        "/questions",
        "GET",
        undefined,
        undefined,
        "https://unapproved.example",
      )
    ).status,
    403,
  );
  assert.ok(
    (await anon.from("arcana_codes").select("id")).error,
    "anonymous table access denied",
  );
  assert.ok(
    (
      await anon.rpc("arcana_create_code", {
        p_code_hash: "0".repeat(64),
        p_label: "Forbidden",
      })
    ).error,
    "anonymous RPC denied",
  );
  const browserCode = await makeCode("QA browser acceptance");
  await writeFile("data/online-browser-qa.txt", browserCode.code, {
    mode: 0o600,
  });
  await writeFile(
    "data/production-acceptance.json",
    JSON.stringify(
      {
        testedAt: new Date().toISOString(),
        apiUrl,
        reportId,
        browserCodeId: browserCode.id,
        passed: true,
      },
      null,
      2,
    ),
  );
  console.log(
    "PASS: live authentication, concurrent quota, resume, isolation, revisions, idempotency, three-use limit, public report, CORS and anonymous permissions.",
  );
  console.log(
    "A separate fresh browser QA code is stored in data/online-browser-qa.txt. All delivery codes remain unused.",
  );
} finally {
  for (const item of codes) {
    const { error } = await admin
      .from("arcana_codes")
      .update({ enabled: false })
      .eq("id", item.id);
    if (error) console.error("Could not disable QA code:", error.code);
  }
}
