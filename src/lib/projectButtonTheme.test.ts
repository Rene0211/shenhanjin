import assert from "node:assert/strict";
import test from "node:test";

import { projectButtonTheme } from "./projectButtonTheme.ts";

test("uses the portfolio cyan palette for the radial project action", () => {
  assert.equal(projectButtonTheme.textColor, "var(--theme-accent)");
  assert.equal(projectButtonTheme.hoverFill, "rgba(143, 232, 255, 0.9)");
  assert.equal(projectButtonTheme.hoverTextColor, "#071016");
  assert.equal(projectButtonTheme.iconHoverColor, "#071016");
});
