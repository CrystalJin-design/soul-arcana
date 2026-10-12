import test from "node:test";
import assert from "node:assert/strict";
import { cards } from "../shared/cards.js";
import { questions, publicQuestions } from "../shared/quiz.js";
import { scoreAnswers, validateAnswers } from "../shared/scoring.js";

test("all 22 archetypes can be reached by relevant answers and have complete reports", () => {
  assert.equal(questions.length, 24);
  assert.equal(cards.length, 22);
  for (const card of cards) {
    const answers = questions.map((q) => {
      const weights = q.options.map((o) =>
        o.cards.includes(card.id) ? 3 - o.cards.indexOf(card.id) : 0,
      );
      return weights.indexOf(Math.max(...weights));
    });
    const report = scoreAnswers(answers);
    assert.equal(report.card.id, card.id, `${card.name} must be reachable`);
    assert.deepEqual(
      scoreAnswers(answers),
      report,
      "same answers give same report",
    );
    for (const key of [
      "summary",
      "light",
      "shadow",
      "relationship",
      "quote",
      "whisper",
    ])
      assert.ok(card[key].length > 8);
    assert.equal(card.advice.length, 3);
    assert.ok(report.reflections.length > 0 && report.reflections.length <= 3);
    assert.equal(
      new Set(report.reflections.map((r) => r.chapter)).size,
      report.reflections.length,
    );
    assert.equal(report.tendencies.length, 8);
    assert.ok(
      report.tendencies.every(
        (t) => Number.isFinite(t.value) && t.value >= 0 && t.value <= 100,
      ),
    );
    assert.notEqual(report.companion.id, card.id);
  }
});
test("invalid or incomplete answers cannot generate a report; public questions omit scoring", () => {
  for (const answers of [
    null,
    [],
    new Array(24).fill(-1),
    new Array(24).fill(4),
    new Array(24).fill("1"),
  ]) {
    assert.equal(validateAnswers(answers, true), false);
    assert.throws(() => scoreAnswers(answers));
  }
  assert.equal(validateAnswers(new Array(24).fill(-1)), true);
  const visible = JSON.stringify(publicQuestions());
  assert.ok(
    !visible.includes("traits") &&
      !visible.includes("signature") &&
      !visible.includes("cards"),
  );
});
