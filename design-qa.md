# Design QA

Final result: passed

## 2026-09-06 Detail return target and back-to-top control

- Changed the detail toolbar label from `返回首页` to `返回`.
- Verified both project detail pages return to the representative-project section with the 作品 tab active; at 564 × 811 the section settles with a 104px top safe area.
- Added a fixed back-to-top control that remains hidden at the detail-page top, appears after meaningful downward scrolling, and returns smoothly to `scrollY: 0`.
- Verified the mobile control is 50 × 50px with 16px right and 18px bottom safe spacing.
- Verified no browser console warnings or errors were introduced.

## 2026-09-06 Editorial motion system

- Motion reference: House of Yellow interaction pacing; only motion principles were adapted and the portfolio's existing visual system was preserved.
- Verified cover entry at 394 × 782: one downward wheel gesture opens the existing doors, completes the light bridge, releases scroll lock, lands on the introduction, and activates the 介绍 tab.
- Verified project section at 1440 × 900: two equal 588px cards remain side by side, cover images stay separate from copy, and the page has zero horizontal overflow.
- Verified fine-pointer hover: card lift reaches 7px, cover scale settles at 1.04, pointer translation stays within ±5px, and the CTA responds directionally.
- Verified project transition mask is visible and fully opaque during the covered state, then clears after the new page is mounted.
- Verified both card-to-detail and next-project navigation; the active tab remains 作品 and every detail swap settles at `scrollY: 0`.
- Verified mobile detail spacing: navigation bottom is 82px and detail toolbar begins at 136px, so they do not overlap.
- Verified the final interaction pass introduces no new browser console warnings or errors.
- Final evidence:
  - `qa-screenshots/editorial-motion/01-home-works-desktop.png`
  - `qa-screenshots/editorial-motion/02-push-detail-desktop.png`
  - `qa-screenshots/editorial-motion/03-garden-detail-desktop.png`

## 2026-09-06 Scroll-aware navigation and detail spacing

- Added scroll-aware navigation states: 首页 for the cover, 介绍 across profile and experience, 作品 across featured projects, and 联系 for the contact section.
- Verified the state transitions at each section boundary after scrolling settles.
- Added a responsive top safe area to project detail pages so the toolbar, section title, and next-project action do not collide with the fixed navigation.
- At 394 × 782, the detail overview starts 132px below the navigation and no overlap occurs.
- Switched project covers to `object-fit: cover`; the 361 × 203 mobile media frame is fully filled without changing its height.
- No P0, P1, or P2 visual issues remain in this iteration.

## 2026-09-06 Navigation state and compact contact stage

- Updated the first project card title to `晒单活动（从0-1项目）` while preserving the project-detail title treatment.
- Verified that clicking 首页、介绍、作品、联系 moves the active underline and text treatment to the selected tab.
- Reduced the contact image stage to approximately 534px at 1018 × 782 and 482px at 455 × 782.
- Visually checked the compact mobile contact composition; all three contact rows remain readable without collision or clipping.
- No P0, P1, or P2 visual issues remain in this iteration.

## 2026-09-06 Contact and experience iteration

- Source reference: supplied dark cinematic contact-section screenshot with large left-aligned typography and a luminous architectural focal point.
- Compared the reference against the rendered contact section at 1018 × 782.
- The contact section now uses a full-width photographic composition, strong left-aligned type, unboxed contact rows, and a dark right-side focal area consistent with the reference hierarchy.
- Verified the email copy interaction and its “已复制” confirmation.
- Verified the mobile contact layout at 390 × 844; text remains readable and the contact navigation lands on the section.
- Verified the experience cards at 1018 × 782 in their hover state: 南京艺术学院 is first, 拼多多 is second, the image-to-copy gradient has no bright seam, and dates have stronger emphasis.
- No P0, P1, or P2 visual issues remain in this iteration.

## 2026-09-06 Editorial project cards and project navigation

- Selected direction: full-width editorial project cards using the existing project cover assets and portfolio typography.
- Verified the desktop project state at 1018 × 782, including the image push, dark readability gradient, large project title, metadata, and detail CTA.
- Verified the mobile project state at 390 × 844; the complete 16:9 cover remains visible and the editorial information layer does not collide with it.
- Verified the detail-page “查看下一个作品” action switches from 小红书晒单活动 to 多多果园 and remains present on mobile.
- Verified the contact heading is outside the photographic stage and matches the shared headings used for 个人经历 and 代表项目.
- No P0, P1, or P2 visual issues remain in this iteration.

## 2026-09-06 Two-column project card revision

- Restored the desktop project layout to two equal columns and kept the mobile layout single-column.
- Verified at 1018 × 782 that each 16:9 cover is fully separated from its project copy; no text overlays the image.
- Verified card heights, footer alignment, image clarity, and CTA placement across both projects.
- Verified at 390 × 844 that the cover remains complete and the copy stays readable below it.
- Verified the entrance animation uses staggered card reveal plus cover-image settling, while hover uses only restrained lift, image push, and CTA response.
- No P0, P1, or P2 visual issues remain in this iteration.

## Scope

- Home page structure from the supplied low-fidelity image
- Works list page structure from the supplied low-fidelity image
- Project detail page structure from the supplied low-fidelity image
- Jeton design rules from `DESIGN.md`

## Checks

- Build completed successfully with `pnpm run build`.
- Local preview opened at `http://127.0.0.1:5174/`.
- Verified the primary path: Home -> Works -> Project detail.
- Verified disabled state for placeholder project case buttons.
- Verified no horizontal overflow at a 560px-wide viewport.
- Verified detail page back action is visible after page transition.
