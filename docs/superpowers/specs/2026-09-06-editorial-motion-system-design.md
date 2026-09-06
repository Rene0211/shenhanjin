# Editorial Motion System Design

## Goal

Upgrade the existing portfolio with an editorial motion system inspired by House of Yellow while preserving the current information architecture, typography, color palette, assets, card layout, and fixed navigation.

The motion should feel restrained, technical, and cinematic. It must support scrolling from the cover into the site, progressive content reveals, project-card interaction, and an intentional transition from a selected project card into its detail page.

## Reference Findings

The reference uses four useful motion patterns:

1. A full-viewport hero remains visually dominant while the first downward scroll begins a staged exit.
2. Adjacent sections overlap in timing, with headings and copy revealed in layers instead of fading in as one block.
3. Project media stays active through scale or playback changes while labels and actions respond independently.
4. Detail pages establish hierarchy progressively: title first, metadata second, large media third.

The portfolio will borrow these timing and hierarchy principles only. It will not copy the reference site's yellow palette, typography, layout, logo treatment, video-heavy content, or smooth-scrolling behavior.

## Chosen Direction

Use a balanced editorial motion system rather than a minimal polish pass or a highly immersive smooth-scroll rebuild.

This direction keeps native browser scrolling and the existing GSAP architecture. It adds coordinated timelines, light scroll-linked movement, and a reusable route-transition layer without changing the site's resting visual appearance.

## Motion Architecture

### Shared motion tokens

Extend `src/lib/gsap.ts` with named durations and presets for:

- cover exit;
- section reveal;
- project hover;
- route transition;
- reduced-motion fallback.

Animations should primarily use transforms and opacity. `clip-path` is reserved for short heading and route-mask reveals. All GSAP work remains scoped through `useGSAP`, and delayed interaction callbacks must be context-safe.

### Cover-to-content transition

The existing arrow click and downward wheel/touch intent will continue to call one shared transition.

Sequence:

1. The scroll label and arrow fade and move down.
2. The cover title and subtitle subtly separate and recede.
3. The train doors open and the existing white-light bridge expands.
4. The content frame becomes visible and scrolls into its starting position.
5. The fixed navigation settles into its ready state.

Repeated wheel or touch input must not start duplicate timelines. Reduced-motion mode skips the staged sequence and enters content immediately.

### Progressive home-section reveals

Personal introduction, experience, projects, and contact keep their existing layout.

Each section receives a coordinated timeline:

- eyebrow appears first;
- large title reveals vertically through a clipping mask;
- primary visual settles from a slightly enlarged state;
- supporting copy or metadata enters in a short stagger;
- background art receives a scroll-linked vertical offset capped at 4% of its own height.

The reveal plays once. Parallax can remain scroll-linked. No section is pinned, so browsing speed and content access remain unchanged.

### Project-card interaction

The two cards keep their current side-by-side layout and separated image/copy structure.

Desktop fine-pointer behavior:

- the card lifts by no more than 8px;
- the image scales to 1.04;
- pointer position creates a very small media translation, not a large 3D tilt;
- the detail action moves in the reading direction;
- all states return smoothly on pointer leave.

Touch and coarse-pointer devices use only the entrance animation. The resting visual state is unchanged.

### Project-to-detail transition

Add one persistent `PageTransitionLayer` at the application shell level.

When a project is opened:

1. Read the selected card's center point.
2. Expand a dark purple-black circular mask from that point until it covers the viewport.
3. Swap the active page and reset scroll while the mask is opaque.
4. Reveal the detail page by fading the mask and introducing the overview hierarchy.

The mask expansion lasts 0.68 seconds and the reveal lasts 0.32 seconds. The overlay is non-interactive when idle and blocks repeated navigation only during this transition. Back and next-project actions use the same mask centered in the viewport rather than at a card location.

Reduced-motion mode performs the page swap without the expanding mask and uses a short opacity change only.

### Detail-page progressive reveal

Detail entry order:

1. toolbar and section eyebrow/action;
2. project title;
3. cover image;
4. fact cells in reading order;
5. long-form detail images as they enter the viewport.

Long images use a shallow vertical reveal and scale settle. They must not animate their layout height or introduce visible gaps during loading.

## Responsive Rules

- Desktop: full motion system, including pointer-responsive card media.
- Tablet: retain section and route transitions; remove pointer parallax when the input is coarse.
- Mobile: multiply desktop movement distances and staggers by 0.75, keep the project image dimensions unchanged, and avoid tilt or large scaling.
- Reduced motion: immediate cover entry, simple opacity reveals, direct page swaps, and no scrubbed parallax.

## State And Interaction Safety

- A transition lock prevents double clicks and repeated wheel gestures from creating overlapping timelines.
- Navigation state continues to follow the current scroll section.
- Existing click targets, keyboard focus behavior, content order, and project data remain unchanged.
- The transition overlay uses `aria-hidden="true"` and never captures focus.
- Content remains available in the DOM during section reveals; motion does not become a prerequisite for reading or navigation.

## Verification

Verify the following flows at desktop and mobile widths:

1. Downward wheel/touch and arrow click both enter the home content.
2. Each home section reveals in the correct reading order without layout shift.
3. Project hover is stable and returns cleanly on pointer leave.
4. Each project card opens the correct detail page through the transition mask.
5. Back and next-project actions work during and after transitions.
6. Detail headings, facts, and long images appear progressively.
7. Fixed navigation remains usable and does not overlap detail controls.
8. No horizontal overflow or console errors are introduced.
9. The production build succeeds.

## Non-Goals

- No change to copy, information architecture, typography, colors, imagery, card dimensions, or section ordering.
- No third-party smooth-scroll library.
- No autoplay background video, cursor replacement, audio, pinned horizontal scroll, or per-character animation across body copy.
- No recreation of House of Yellow's visual identity.
