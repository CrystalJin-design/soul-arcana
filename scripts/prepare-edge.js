import { mkdir, copyFile } from "node:fs/promises";
const target = new URL("../supabase/functions/_shared/", import.meta.url);
await mkdir(target, { recursive: true });
for (const file of ["api-handler.js", "quiz.js", "cards.js", "scoring.js"]) {
  await copyFile(
    new URL(`../shared/${file}`, import.meta.url),
    new URL(file, target),
  );
}
await copyFile(
  new URL("../site.config.json", import.meta.url),
  new URL("site.config.json", target),
);
console.log(
  "Supabase function bundle prepared from the shared source and site configuration.",
);
