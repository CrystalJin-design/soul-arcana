import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openLocalDatabase } from "../server/db.js";
import {
  createApiHandler,
  hash,
  normalizeCode,
} from "../shared/api-handler.js";

let database, directory, handler;
before(async () => {
  directory = await mkdtemp(join(tmpdir(), "arcana-tests-"));
  database = await openLocalDatabase(directory);
  handler = createApiHandler({
    rpc: database.rpc,
    config: { brand: "test" },
    allowedOrigins: ["https://example.github.io"],
  });
  for (const code of ["TEST-ALPHA", "TEST-BRAVO"])
    await database.rpc("arcana_create_code", {
      p_code_hash: await hash(normalizeCode(code)),
      p_label: code.slice(-4),
    });
});
after(async () => {
  await database?.close();
  await rm(directory, { recursive: true, force: true });
});
async function request(path, method = "GET", body, token, origin) {
  const headers = { "content-type": "application/json" };
  if (token) headers.authorization = `Bearer ${token}`;
  if (origin) headers.origin = origin;
  const response = await handler(
    new Request(`http://local/api${path}`, {
      method,
      headers,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    }),
  );
  const data = response.status === 204 ? null : await response.json();
  return { status: response.status, data, headers: response.headers };
}
test("password quota, resume, isolation, revision control, submission and public sharing", async () => {
  assert.equal((await request("/session")).status, 401);
  assert.equal(
    (await request("/session", "POST", { code: "WRONG-CODE" })).status,
    401,
  );
  const login = await request("/session", "POST", { code: " test-alpha " });
  assert.equal(login.status, 200);
  assert.equal(login.data.remaining, 3);
  const token = login.data.token;
  const other = (await request("/session", "POST", { code: "TEST-BRAVO" })).data
    .token;
  const requestId = crypto.randomUUID();
  const starts = await Promise.all(
    Array.from({ length: 5 }, () =>
      request(
        "/attempts/start",
        "POST",
        { requestId: crypto.randomUUID() },
        token,
      ),
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
        other,
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
  answers[0] = 1;
  const changed = await request(
    `/attempts/${attempt.id}/answers`,
    "PUT",
    { answers, currentQuestion: 0, revision: 1 },
    token,
  );
  assert.equal(changed.data.answers[0], 1);
  assert.equal(
    (
      await request(
        `/attempts/${attempt.id}/submit`,
        "POST",
        { answers },
        token,
      )
    ).status,
    400,
  );
  // Reopening the same on-disk Postgres database preserves the attempt and quota.
  await database.close();
  database = await openLocalDatabase(directory);
  handler = createApiHandler({
    rpc: database.rpc,
    config: {},
    allowedOrigins: ["https://example.github.io"],
  });
  const resumed = (await request("/session", "GET", undefined, token)).data;
  assert.equal(resumed.remaining, 2);
  assert.equal(resumed.activeAttempt.answers[0], 1);
  assert.equal(
    (await request("/attempts/start", "POST", { requestId }, token)).data
      .attempt.id,
    attempt.id,
  );
  const complete = new Array(24).fill(0);
  const first = await request(
    `/attempts/${attempt.id}/submit`,
    "POST",
    { answers: complete, report: { card: { name: "FORGED" } } },
    token,
  );
  assert.equal(first.status, 200);
  const duplicate = await request(
    `/attempts/${attempt.id}/submit`,
    "POST",
    { answers: new Array(24).fill(1) },
    token,
  );
  assert.equal(duplicate.data.resultId, first.data.resultId);
  const publicResult = (await request(`/results/${first.data.resultId}`)).data;
  assert.equal(publicResult.isOwner, false);
  assert.notEqual(publicResult.card.name, "FORGED");
  for (const key of ["answers", "code", "token", "attemptId", "codeId"])
    assert.equal(publicResult[key], undefined);
  assert.equal(
    (await request(`/results/${first.data.resultId}`, "GET", undefined, token))
      .data.isOwner,
    true,
  );
  for (let i = 0; i < 2; i++) {
    const next = (
      await request(
        "/attempts/start",
        "POST",
        { requestId: crypto.randomUUID() },
        token,
      )
    ).data;
    assert.equal(next.remaining, 1 - i);
    assert.equal(
      (
        await request(
          `/attempts/${next.attempt.id}/submit`,
          "POST",
          { answers: complete },
          token,
        )
      ).status,
      200,
    );
  }
  assert.equal(
    (
      await request(
        "/attempts/start",
        "POST",
        { requestId: crypto.randomUUID() },
        token,
      )
    ).data.code,
    "QUOTA_EXHAUSTED",
  );
  const final = (await request("/session", "GET", undefined, token)).data;
  assert.equal(final.history.length, 3);
  assert.equal(final.remaining, 0);
  assert.equal(
    (await request("/session", "DELETE", undefined, token)).status,
    200,
  );
  assert.equal(
    (await request("/session", "GET", undefined, token)).status,
    401,
  );
  assert.equal((await request(`/results/${first.data.resultId}`)).status, 200);
});
test("database permissions, CORS, malformed payload and password guessing limit", async () => {
  const grants = (
    await database.db.query(
      "select has_table_privilege('anon','public.arcana_codes','SELECT') as table_access,has_function_privilege('anon','public.arcana_create_code(text,text)','EXECUTE') as rpc_access",
    )
  ).rows[0];
  assert.deepEqual(grants, { table_access: false, rpc_access: false });
  assert.equal(
    (
      await request(
        "/questions",
        "GET",
        undefined,
        undefined,
        "https://hostile.example",
      )
    ).status,
    403,
  );
  const allowed = await request(
    "/questions",
    "GET",
    undefined,
    undefined,
    "https://example.github.io",
  );
  assert.equal(
    allowed.headers.get("access-control-allow-origin"),
    "https://example.github.io",
  );
  assert.equal((await request("/session", "POST", null)).status, 400);
  assert.equal(
    (await request("/session", "POST", { code: "x".repeat(17000) })).status,
    413,
  );
  let last;
  for (let i = 0; i < 31; i++)
    last = await request("/session", "POST", { code: "UNKNOWN" });
  assert.equal(last.status, 429);
});
