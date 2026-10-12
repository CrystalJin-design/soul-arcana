import { cards } from "./cards.js";
import { dimensions, questions, QUIZ_VERSION } from "./quiz.js";

export function validateAnswers(answers, complete = false) {
  return (
    Array.isArray(answers) &&
    answers.length === questions.length &&
    answers.every(
      (answer) =>
        Number.isInteger(answer) && answer >= (complete ? 0 : -1) && answer < 4,
    )
  );
}

export function scoreAnswers(answers) {
  if (!validateAnswers(answers, true)) throw new Error("请完成全部24道题目");
  const raw = Object.fromEntries(dimensions.map(({ key }) => [key, 0]));
  const maximum = { ...raw };
  const affinities = new Array(cards.length).fill(0);
  const possible = new Array(cards.length).fill(0);

  questions.forEach((question, index) => {
    const choice = question.options[answers[index]];
    dimensions.forEach(({ key }) => {
      raw[key] += choice.traits[key] || 0;
      maximum[key] += Math.max(
        ...question.options.map((option) => option.traits[key] || 0),
      );
    });
    cards.forEach(({ id }) => {
      const points = (option) => {
        const position = option.cards.indexOf(id);
        return position < 0 ? 0 : 3 - position;
      };
      affinities[id] += points(choice);
      possible[id] += Math.max(...question.options.map(points));
    });
  });

  const tendencies = dimensions.map(({ key, name, left, right }) => ({
    key,
    name,
    left,
    right,
    value: Math.round((raw[key] / maximum[key]) * 100),
  }));
  const ranking = cards
    .map((card) => {
      const distance = Math.sqrt(
        dimensions.reduce(
          (sum, { key }, i) =>
            sum + (raw[key] / maximum[key] - card.signature[i]) ** 2,
          0,
        ) / dimensions.length,
      );
      return {
        id: card.id,
        score:
          (affinities[card.id] / possible[card.id]) * 0.82 +
          (1 - distance) * 0.18,
      };
    })
    .sort((a, b) => b.score - a.score || a.id - b.id);

  const card = cards[ranking[0].id];
  const moments = questions
    .map((question, i) => ({
      text: question.options[answers[i]].text,
      chapter: question.chapter,
      affinity: question.options[answers[i]].cards.indexOf(card.id),
    }))
    .filter(({ affinity }) => affinity >= 0)
    .sort((a, b) => a.affinity - b.affinity);
  const seen = new Set();
  const reflections = moments
    .filter(({ chapter }) => {
      if (seen.has(chapter)) return false;
      seen.add(chapter);
      return true;
    })
    .slice(0, 3)
    .map(({ text, chapter }) => ({ text, chapter }));

  return {
    version: QUIZ_VERSION,
    card,
    companion: cards[card.companion],
    tendencies,
    reflections,
  };
}
