---
name: site-building-kit
description: Starting point for building a website, landing page or online store (Shopify, static HTML, Astro, Next.js). Picks the stack from a curated list of the most-starred GitHub web projects, routes design work to the design-taste-frontend and scroll-craft skills, and gives the verification and delivery workflow used on the TEYEL Shopify build (local Liquid preview, Theme Check, Playwright scene shots, Lighthouse, Higgsfield hosting). Use when the user asks to make a site, a store, a landing page, "site yap", "mağaza kur", "yeni site", or asks which tools or GitHub projects to use for a site.
---

# Site building kit

## Overview

One entry point for every new site. It does not replace the design skills; it decides which to load,
which open-source projects to build on, and how to prove the result works before handing it over.

## When to Use

- A new site, landing page, portfolio, brand page or online store.
- The user asks "which tools / GitHub projects should we use?"
- A finished site needs checking (speed, accessibility, mobile, reduced motion) or publishing.

Not for: editing one component in an existing app (use `frontend-ui-engineering`).

## Process

1. **Brief.** Ask or infer: what is sold, who buys, platform (Shopify / static / app), language,
   real photos available or not. If the user delegates ("kafana göre"), write the brief yourself
   and say so in the final report.
2. **Pick the design skill.**
   - Scroll-driven, cinematic, layered hero, "Awwwards", "özgün olsun": load `scroll-craft`.
   - Company / product / shop site that must not look AI-made: load `design-taste-frontend`.
   - Both may apply: `design-taste-frontend` for system, copy and sections; `scroll-craft` for the
     one or two scroll acts. Do not stack more than two motion ideas per page.
   - Bold one-off interface, no strong system yet: `frontend-design`. Palette/type theme for an
     artifact or deck: `theme-factory`. Posters and generative visuals: `canvas-design`,
     `algorithmic-art`. Multi-file React/Tailwind/shadcn artifact: `web-artifacts-builder`.
   - Once a page exists, use `impeccable` sub-commands to finish it (`critique`, `audit`,
     `polish`, `bolder` / `quieter`, `typeset`, `layout`, `animate`, `harden`).
2b. **Selling pages** (stores, landing pages): write the copy with `copywriting`, tighten with
   `copy-editing`, structure with `site-architecture`, then `cro`, `offers`, `popups`, `signup`,
   `marketing-psychology`. Search: `seo-audit`, `ai-seo`, `schema`. Measurement:
   `conversion-tracking`, `ab-testing`. Retention: `emails`. Positioning context for all of
   them: `product-marketing` (writes `.agents/product-marketing.md`; do this first).
3. **Pick the stack** from `references/github-projects.md` (star counts measured 2026-11-15).
   Defaults:
   - Shopify store: Online Store 2.0 theme (Liquid + JSON templates), `Shopify/dawn` as reference,
     `@shopify/theme-check-node` for linting.
   - Marketing / content site: Astro + Tailwind, GSAP (ScrollTrigger) + Lenis for motion.
   - App-like site: Next.js or Vite + React, shadcn/ui, Motion.
   - Plain single page: static HTML/CSS + the scroll-craft engine; no framework.
4. **Assets.** Real photos first. Otherwise generate consistent images (Higgsfield or ElevenLabs
   image tools), cut out with rembg, and keep full-resolution originals for delivery.
5. **Build** in small steps (`incremental-implementation`). Every motion must have a
   `prefers-reduced-motion` fallback that keeps all content reachable.
6. **Verify** (do not skip, do not claim untested results). `webapp-testing` has a helper that
   starts a dev server and drives Playwright against it; the steps below are the minimum:
   - Theme Check / linter: 0 errors.
   - Playwright screenshots at 1440x900, 390x844 and with `reducedMotion: 'reduce'`; for scroll
     acts shoot several progress points and read the screenshots yourself.
   - No horizontal overflow (`document.documentElement.scrollWidth === innerWidth`), no console
     errors, no 4xx requests.
   - Lighthouse mobile + desktop. Local servers without gzip/CDN under-report performance; say so.
7. **Deliver**: theme/site zip, data (CSV), images, logos, a short guide in the user's language,
   and a working web link. See `references/workflow.md` for the exact commands.

## Tools in this kit

`tools/shopify-preview/` (copied from the TEYEL build; paths at the top of each file are
project-specific, change `THEME` / `OUT` and the preview data before reuse):

| File | What it does |
|---|---|
| `render.mjs` | Renders a Shopify theme to static HTML with liquidjs, using fake products/collections |
| `check.mjs` | Runs Shopify Theme Check and prints a summary |
| `shots.js` | Full-page screenshots of the preview pages |
| `scenes-shots.js` | Screenshots each `data-sc-act` at chosen progress points and reports pin/pan state |

Install with `npm install` inside that folder.

## Common Rationalizations

| Thought | Reality |
|---|---|
| "The screenshots look fine on desktop, mobile will be similar." | Mobile broke every time on TEYEL (cut words, overflowing rails). Always shoot 390 px. |
| "Lighthouse 80 locally means the site is slow." | The local server has no compression or image CDN. Check the cause before rewriting code. |
| "Reduced motion users get the same page." | Pinned acts with motion zeroed can hide content. Test it. |
| "More effects = more premium." | One signature move, one peak. The rest stays quiet. |

## Red Flags

- Positioning set on a scroll-craft stage (`position: relative`) with normal specificity: it kills
  the engine's sticky. Use `:where()` (specificity 0) if you need a pre-JS position.
- Layout shift on load (CLS > 0.1) from elements whose containing block changes when JS runs.
- Third-party skill or script added without reading it first.

## Verification

- [ ] Design skill(s) loaded and their own gates passed
- [ ] Linter / Theme Check 0 errors
- [ ] Desktop, 390 px and reduced-motion screenshots reviewed
- [ ] No overflow, console errors or failed requests
- [ ] Lighthouse numbers reported with their caveats
- [ ] Deliverables and live link handed over; anything not tested is stated
