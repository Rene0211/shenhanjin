# 夜行路线动效 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为求职作品集建立从个人介绍到联系方式的克制夜行路线动效，并修复工卡入场扫光的卡顿。

**Architecture:** 在现有 `HomePage` 的 `useGSAP` 生命周期中扩展 ScrollTrigger；路线本身是可访问的静态装饰 DOM，按章节切换 CSS 类。项目和联系区的视觉反馈使用 CSS 伪元素及已有局部图层，避免新资源和全屏图层覆盖。

**Tech Stack:** React 18、TypeScript、GSAP ScrollTrigger、CSS custom properties。

**Spec:** `docs/superpowers/specs/2026-10-15-night-route-motion-design.md`

## Global Constraints

- 动效不能遮挡正文、锁定常规滚动或改变信息层级。
- 仅动画 `transform`、`opacity`、`clip-path` 和 CSS 自定义属性。
- 使用现有 `useGSAP`、`motionDuration`、`motionEase` 与 reduced-motion 分支。
- 路线仅桌面端显示，断点为 `900px`；触屏端移除鼠标靠近特效。
- 不新增图片资源，不改动项目详情页。
- 不添加或运行自动化测试，除非用户另行要求验证。

## Review Focus

- 减少动态效果：所有内容直接可见，不保留裁切、半透明或固定定位状态。
- 900px 断点：路线不可见，正文宽度与触控点击区域不受影响。
- 快速滚动：章节路线只反映当前可见章节，不产生节点闪烁。
- 工卡入场：扫光只在工卡停止弹跳后开始，且不与 CSS 摆动动画竞争。
- 电话亭开门：门缝光仅影响电话亭区域，信箱图层保持原状。

---

### Task 1: 稳定工卡扫光并建立路线标记

**Files:**
- Modify: `src/App.tsx:1154-1289`
- Modify: `src/styles.css:1265-1278`

**Interfaces:**
- Consumes: `.dossier-id-card`、`.badge-entry-glint`、`HomePage` 的 `homeRef`。
- Produces: `.night-route`、`.night-route-step[data-section]` 与 `.is-active` 状态供后续 ScrollTrigger 使用。

- [ ] **Step 1: 将工卡扫光从入场时间线中拆成独立 tween**

在工卡回弹结束后启动扫光；扫光只设置 `xPercent` 和 `autoAlpha`，并在结束时清除这两个内联属性。将 CSS 摆动保留在 `.badge-resting-motion`，不对其写入 transform。

- [ ] **Step 2: 在 `HomePage` 内加入四个纯装饰路线节点**

为 `about`、`experience`、`featured-projects`、`contact` 各建立一个带 `data-section` 的 `.night-route-step`。路线使用 `aria-hidden="true"`，不加入 Tab 顺序。

- [ ] **Step 3: 添加桌面路线与扫光样式**

路线使用弱青蓝边线、节点和填充段；`.is-active` 点亮当前与已完成段。扫光改为 GPU 合成友好的 `translate3d` 位移，并在 `prefers-reduced-motion` 下禁用动画。

- [ ] **Step 4: 人工核对工卡与路线**

在桌面浏览器中进入个人介绍：工卡停稳后扫光平滑经过一次；滚动到各章节时路线按顺序点亮。以系统“减少动态效果”再次查看，确认不显示入场或扫光过程。

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/styles.css
git commit -m "feat: add night route and smooth badge glint"
```

### Task 2: 经历节点与项目案例的阅读反馈

**Files:**
- Modify: `src/App.tsx:1154-1289`
- Modify: `src/styles.css:1561-1751, 823-850`

**Interfaces:**
- Consumes: Task 1 的 `.night-route-step[data-section]` 和 `.is-active`。
- Produces: `.dossier-timeline-item.is-active` 与 `.project-card.is-revealed`。

- [ ] **Step 1: 为经历节点加入一次性激活状态**

为每个 `.dossier-timeline-item` 建立一次性 ScrollTrigger；进入视口时添加 `.is-active`，用于点亮节点并播放一次不超过 400ms 的扫光伪元素。

- [ ] **Step 2: 为项目卡片加入一次性扫光状态**

复用当前项目卡片进入时间线；在图片遮罩揭示完成后添加 `.is-revealed`。用伪元素从左向右掠过，项目编号在悬停或键盘聚焦时短暂可见。

- [ ] **Step 3: 关联路线章节状态**

在每个对应章节的 ScrollTrigger `onEnter` 与 `onEnterBack` 中切换路线节点 `.is-active`，并使已通过节点保持点亮。

- [ ] **Step 4: 人工核对阅读节奏**

慢速与快速滚动各一次：经历节点不重复扫光；每张项目卡片只扫光一次；项目标题、摘要和按钮始终可读、可点击且没有布局跳动。

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/styles.css
git commit -m "feat: enrich timeline and project motion"
```

### Task 3: 联系区的灯光收尾

**Files:**
- Modify: `src/App.tsx:380-506, 1154-1289`
- Modify: `src/styles.css:2357-2910, 3370-3510`

**Interfaces:**
- Consumes: Task 1 的路线状态和现有 `.contact-phone-light`、`phoneBoothOpen`。
- Produces: `.contact-section.is-arrived` 与 `.contact-art.is-nearby`。

- [ ] **Step 1: 在联系区首次进入时启用背景渐亮**

通过一次性 ScrollTrigger 给 `.contact-section` 添加 `.is-arrived`。CSS 从较低亮度过渡至当前视觉亮度，只改变 opacity/filter。

- [ ] **Step 2: 为电话亭加入精细指针靠近反馈**

仅在 `pointer: fine` 环境监听 `.contact-art` 的 pointer enter/leave，切换 `.is-nearby`；提高已有电话亭局部灯光的微弱呼吸强度。触屏端不注册该效果。

- [ ] **Step 3: 增加局部门缝光扩散**

为 `.contact-phone-opening` 或独立伪元素增加仅覆盖电话亭门缝的冷色光。`data-phone-open="true"` 时播放一次，确保不修改信箱相关选择器与图层。

- [ ] **Step 4: 人工核对联系区与降级**

确认首次到达联系区有柔和渐亮；鼠标接近电话亭时只有局部灯光变化；开门后门缝光出现一次，信箱无变黑或跳动；触屏和减少动态效果下交互仍可点击且无多余动画。

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/styles.css
git commit -m "feat: add contact finale motion"
```
