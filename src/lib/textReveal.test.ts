import assert from "node:assert/strict";
import test from "node:test";

import { splitTextForReveal } from "./textReveal.ts";

test("splits mixed Chinese and Latin copy without changing its visible text", () => {
  const copy = "我目前拥有3年电商UX设计经验。";

  const characters = splitTextForReveal(copy);

  assert.deepEqual(characters.slice(0, 6), ["我", "目", "前", "拥", "有", "3"]);
  assert.equal(characters.join(""), copy);
});
