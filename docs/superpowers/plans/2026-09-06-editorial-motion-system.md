# Editorial Motion System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task. Keep the visual system, copy, information architecture, assets, card dimensions, and section order unchanged.

**Goal:** Add a restrained editorial motion system inspired by the pacing of House of Yellow: scroll/arrow cover entry, progressive section reveals, refined project-card interaction, and coherent transitions into and between project detail pages.

**Architecture:** Keep GSAP registration centralized in `src/lib/gsap.ts`. Add pure motion geometry helpers in `src/lib/motion.ts`, then use one app-shell transition layer to coordinate route changes. Component-local `useGSAP()` scopes own cover, section, card, and detail motion; every scope cleans up on unmount and provides a reduced-motion path.

**Tech Stack:** React, TypeScript, Vite, GSAP, `@gsap/react`, ScrollTrigger, Node 24 built-in test runner.

**Design spec:** `docs/superpowers/specs/2026-09-06-editorial-motion-system-design.md`

---

## Global constraints

- Do not change text, colors, typography, assets, card dimensions, section order, or information architecture.
- Animate transforms, opacity, clip-path, and filter only; avoid layout-driven animation.
- Desktop project hover: card lift at most 8px, image scale exactly 1.04, image translation at most ±5px.
- Mobile timing multiplier is 0.75; disable pointer parallax on coarse pointers.
- `prefers-reduced-motion` uses immediate navigation and opacity-only reveals.
- No smooth-scroll library, pinned horizontal sections, audio, autoplay background video, or body-copy character splitting.

## Task 1: Motion tokens and transition geometry

**Files:**

- Create: `src/lib/motion.ts`
- Create: `src/lib/motion.test.ts`
- Modify: `src/lib/gsap.ts`
- Modify: `package.json`

### Step 1: Write failing geometry tests

Create `src/lib/motion.test.ts` with tests for:

```ts
import test from "node:test";
import assert from "node:assert/strict";
import {
  getCoverRadius,
  getMotionMultiplier,
  getTransitionOrigin,
} from "./motion.ts";

test("uses the clicked card center as transition origin", () => {
  assert.deepEqual(
    getTransitionOrigin(
      { left: 100, top: 80, width: 200, height: 120 },
      { width: 1000, height: 800 },
    ),
    { x: 200, y: 140 },
  );
});

test("uses viewport center without a source rectangle", () => {
  assert.deepEqual(getTransitionOrigin(null, { width: 1000, height: 800 }), {
    x: 500,
    y: 400,
  });
});

test("radius covers the furthest viewport corner", () => {
  assert.equal(Math.ceil(getCoverRadius({ x: 0, y: 0 }, { width: 3, height: 4 })), 5);
});

test("mobile timing uses the approved multiplier", () => {
  assert.equal(getMotionMultiplier(640), 0.75);
  assert.equal(getMotionMultiplier(641), 1);
});
```

Run: `node --test src/lib/motion.test.ts`

Expected: FAIL because `src/lib/motion.ts` does not exist.

### Step 2: Implement pure helpers

Create `src/lib/motion.ts`:

```ts
export type MotionOrigin = { x: number; y: number };
export type RectLike = { left: number; top: number; width: number; height: number };
export type ViewportLike = { width: number; height: number };

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export function getTransitionOrigin(
  rect: RectLike | null,
  viewport: ViewportLike,
): MotionOrigin {
  if (!rect) return { x: viewport.width / 2, y: viewport.height / 2 };
  return {
    x: clamp(rect.left + rect.width / 2, 0, viewport.width),
    y: clamp(rect.top + rect.height / 2, 0, viewport.height),
  };
}

export function getCoverRadius(origin: MotionOrigin, viewport: ViewportLike) {
  return Math.max(
    Math.hypot(origin.x, origin.y),
    Math.hypot(viewport.width - origin.x, origin.y),
    Math.hypot(origin.x, viewport.height - origin.y),
    Math.hypot(viewport.width - origin.x, viewport.height - origin.y),
  );
}

export function getMotionMultiplier(viewportWidth: number) {
  return viewportWidth <= 640 ? 0.75 : 1;
}
```

### Step 3: Extend centralized motion tokens

In `src/lib/gsap.ts`, add named tokens for:

- route cover: `0.68`
- route reveal: `0.32`
- heading clip reveal
- media entrance scale: `1.055`
- project hover scale: `1.04`
- project pointer translation: `5`
- scroll parallax: `4`
- mobile multiplier: `0.75`

Do not register GSAP or ScrollTrigger anywhere else.

### Step 4: Add the test script and verify

Add to `package.json`:

```json
"test": "node --test src/lib/motion.test.ts"
```

Run:

```bash
pnpm test
pnpm run build
```

Expected: tests pass and production build succeeds.

### Step 5: Commit

```bash
git add src/lib/motion.ts src/lib/motion.test.ts src/lib/gsap.ts package.json
git commit -m "test: define motion geometry and tokens"
```

## Task 2: App-shell page transition layer

**Files:**

- Create: `src/components/PageTransitionLayer.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

### Step 1: Establish the failing behavior check

Run the site and confirm the baseline: clicking either project card swaps directly to detail content without an opaque bridging transition. Record this in `design-qa.md` under a new “Editorial motion baseline” heading.

### Step 2: Build the transition component

Define:

```ts
export type TransitionRequest = {
  id: number;
  origin: MotionOrigin;
};

type PageTransitionLayerProps = {
  request: TransitionRequest | null;
  onCovered: () => void;
  onComplete: () => void;
};
```

`PageTransitionLayer` must:

1. Start as `visibility: hidden` and `pointer-events: none`.
2. On a new request, compute the radius with `getCoverRadius()`.
3. Expand a dark purple-black circular `clip-path` from the supplied origin for 0.68s.
4. Call `onCovered()` exactly once while fully opaque.
5. Reveal the new page in 0.32s, then hide and reset itself.
6. If reduced motion is active, call both callbacks synchronously without playing the mask.

### Step 3: Orchestrate transitions in `App`

Add a pending-navigation ref so state changes happen only while the mask is opaque. Reject duplicate clicks while a transition is active.

- Project-card open: use the clicked card’s `getBoundingClientRect()` center.
- Detail “next project” and “back to works”: use viewport center.
- After the covered callback, update `activeProject`, page state, and scroll position.
- Keep nav active-state behavior intact.

### Step 4: Add non-visual-changing layer CSS

Add `.page-transition-layer` as fixed, full viewport, `z-index: 90`, with the existing dark purple/black palette. It must not introduce permanent borders, spacing, or layout changes.

### Step 5: Verify and commit

Run:

```bash
pnpm test
pnpm run build
```

Browser checks:

- Both project cards enter the correct detail page.
- Next-project control swaps to the other project.
- Repeated rapid clicking does not double-navigate.
- Fixed navigation remains above normal page content and below the transition mask.
- Browser console has no errors.

Commit:

```bash
git add src/components/PageTransitionLayer.tsx src/App.tsx src/styles.css design-qa.md
git commit -m "feat: add cinematic project page transitions"
```

## Task 3: Cover entry shared by wheel, touch, and arrow

**Files:**

- Modify: `src/App.tsx`
- Modify: `src/styles.css`

### Step 1: Confirm baseline gaps

Verify arrow entry still works. Then verify that a single downward wheel or upward touch gesture does not yet invoke exactly the same transition path. Record the result in `design-qa.md`.

### Step 2: Unify the entry handler

Use one guarded `enterSite()` function for:

- arrow click
- first meaningful downward wheel delta
- upward touch swipe
- keyboard `ArrowDown`, `PageDown`, or `Space`

Prevent duplicate listeners and repeated entry while the timeline is active. Remove listeners after content is revealed.

### Step 3: Refine the existing cover timeline

Use labeled timeline phases:

1. scroll cue fades
2. kicker, title, and subtitle recede subtly
3. existing doors open
4. existing white light bridges the cut
5. content and fixed navigation settle

Keep the current train image, typography, palette, and door/light visual treatment unchanged.

### Step 4: Reduced motion and verification

Reduced motion must reveal content immediately, without doors, mask, or parallax.

Run:

```bash
pnpm run build
```

Browser-check mouse wheel, arrow click, keyboard, and mobile touch emulation. Confirm that only one entry runs for combined wheel/click input.

Commit:

```bash
git add src/App.tsx src/styles.css design-qa.md
git commit -m "feat: unify cover scroll and click entry"
```

## Task 4: Progressive home-section reveals and project interaction

**Files:**

- Modify: `src/App.tsx`
- Modify: `src/styles.css`

### Step 1: Replace broad reveal logic with ordered section timelines

Within the existing HomePage `useGSAP()` scope, build one timeline per major section. Each timeline must reveal in this order:

1. eyebrow
2. large heading through an overflow-hidden clip
3. primary visual from scale `1.055` to `1`
4. copy and metadata with a small stagger

Use existing DOM when possible. Add only semantic wrapper classes or `data-motion` hooks; do not alter visible layout.

### Step 2: Add restrained scroll depth

Create separate top-level ScrollTrigger tweens for eligible section media:

```ts
gsap.fromTo(
  media,
  { yPercent: -4 },
  {
    yPercent: 4,
    ease: "none",
    scrollTrigger: { trigger: section, scrub: 0.8 },
  },
);
```

Do not nest ScrollTriggers inside timelines. Do not apply parallax to body copy.

### Step 3: Refine project-card hover

For fine-pointer desktop only:

- lift card by 7px
- scale media to exactly 1.04
- use `gsap.quickTo()` for image `x`/`y`, clamped to ±5px from pointer position
- shift CTA arrow 4px
- return all properties smoothly on pointer leave

On touch/coarse pointers, retain tap behavior and omit pointer parallax.

### Step 4: Verify and commit

Run `pnpm run build`.

Browser checks:

- Reveal order is progressive at about, experience, works, and contact.
- No section jumps during reveal.
- Card text never overlays the project image.
- Project-card sizes and two-column desktop layout remain unchanged.
- Mobile preserves the current image dimensions and has no horizontal overflow.

Commit:

```bash
git add src/App.tsx src/styles.css
git commit -m "feat: add progressive section and card motion"
```

## Task 5: Detail-page reading sequence

**Files:**

- Modify: `src/App.tsx`
- Modify: `src/styles.css`

### Step 1: Scope the initial detail timeline

In DetailPage, replace the broad simultaneous entrance with this sequence:

1. detail toolbar and heading action
2. project title
3. cover media
4. fact cells
5. first long-form content block

Use the motion multiplier from `src/lib/motion.ts` so mobile durations/staggers are 0.75 of desktop.

### Step 2: Add one-time long-image reveals

Each long-form image enters once with:

- `y: 26`
- `scale: 1.018`
- duration `0.72 * multiplier`
- restrained existing ease

After entrance, preserve the existing child-image parallax, limited to `yPercent: -1.8` through `1.8` with scrub. Do not animate the same transform on both parent and child simultaneously.

### Step 3: Preserve detail-page navigation safety

Ensure fixed nav, project toolbar, and “查看下一个作品” never overlap at desktop or mobile widths. The active nav tab remains “作品” throughout detail pages.

### Step 4: Verify and commit

Run `pnpm run build` and browser-check both project detail pages from top to bottom at desktop and mobile sizes. Confirm images load, reveals run once, next-project navigation works, and console remains clean.

Commit:

```bash
git add src/App.tsx src/styles.css
git commit -m "feat: choreograph project detail reveals"
```

## Task 6: Reduced motion, responsive QA, and final evidence

**Files:**

- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Modify: `design-qa.md`

### Step 1: Add the reduced-motion contract

Under `@media (prefers-reduced-motion: reduce)`:

- remove scrub parallax and pointer-driven transforms
- replace clip/scale entrances with short opacity changes or immediate visibility
- switch project navigation immediately without the route mask
- keep all content accessible and interactive

Also ensure GSAP code checks `prefersReducedMotion()` before creating motion-heavy timelines.

### Step 2: Run automated verification

Run:

```bash
pnpm test
pnpm run build
```

Expected: all tests pass and Vite production build succeeds with no TypeScript errors.

### Step 3: Run browser QA matrix

Verify at minimum:

- desktop viewport around 1440×900
- narrow/mobile viewport around 390×844
- reduced-motion emulation

For each, check:

- cover arrow and downward gesture entry
- fixed nav and scroll-synced tab state
- progressive home reveals
- both project-card hovers/taps
- card-to-detail transition
- back and next-project transition
- detail progressive reveal
- contact section and footer
- no horizontal overflow or console errors

Capture final screenshots for home works section and both project detail headers. Add exact paths and results to `design-qa.md`.

### Step 4: Final diff review

Run:

```bash
git diff --check
git status --short
```

Review the diff specifically for accidental copy, asset, color, typography, spacing, or card-size changes. Revert any unrelated change.

### Step 5: Commit

```bash
git add src/App.tsx src/styles.css design-qa.md
git commit -m "test: verify editorial motion system"
```

## Completion criteria

- Scrolling, tapping the cover arrow, touch swipe, and keyboard entry share one guarded cover sequence.
- Home sections reveal progressively without changing layout or copy.
- Project hover feels responsive but restrained and is disabled appropriately on touch/reduced-motion devices.
- Every project navigation uses a coherent transition, with page state swapped only while covered.
- Both detail pages reveal in a clear reading order.
- Navigation remains fixed, unobstructed, and synchronized with scroll position.
- `pnpm test`, `pnpm run build`, browser QA, console checks, and `git diff --check` all pass.
