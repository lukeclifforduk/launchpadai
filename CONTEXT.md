# PXP LaunchPad — Project Context Reference

> This file is the single source of truth for what we are building.
> Read this at the start of every session.

---

## What We Are Building

A **7-screen, single-page presentation website** for demoing PXP LaunchPad — a merchant onboarding platform at PXP Financial (a fintech acquiring bank). It is presented full-screen during Teams calls or in-person demos, controlled by scroll/keyboard/buttons.

**It is NOT an app.** It is a visual narrative — like a premium slide deck rendered in a browser.

---

## Who Uses It

The product manager (Luke) presents this to **partners and internal stakeholders** to introduce them to the LaunchPad merchant onboarding portal before doing a live demo of the actual product.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Format | Single self-contained `index.html` |
| CSS | Tailwind CSS via CDN (JIT, inline config) |
| JS | Vanilla JavaScript |
| Animation | GSAP 3.12+ (core + ScrollTrigger + ScrollToPlugin) via CDN |
| Icons | Inline SVGs (Lucide-style line icons) |
| Logo | Inline SVG using `currentColor` (no PNG files) |
| Build | None — open HTML directly |
| Hosting | GitHub Pages at `https://lukeclifforduk.github.io/launchpadai/` |

---

## Brand System

### Colours
| Name | HEX | Role |
|---|---|---|
| White | `#FBFBFB` | Backgrounds, light mode base |
| Grey | `#EDEEEF` | Surface, cards, light mode |
| Cyan | `#44DAFD` | Primary accent, highlights |
| Lime | `#CAFF0A` | CTA accent, animation endpoints |
| Plum | `#540B90` | Deep accent, dark gradients |
| Violet | `#A047FF` | Secondary accent, glows, highlights |

### Gradients (never on text)
1. **Dark intensity:** Black → Cyan → Plum
2. **Full palette:** Black → Cyan → Plum → Lime
3. **Light airy:** White → Cyan → Lime (preferred for light mode)

### Typography
- **Font stack:** `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif`
- **Weights:** 300 (body), 600 (subheadings), 700-800 (headlines)
- **Rule:** Never apply gradients to text

### Visual Style
- Apple HIG-inspired: squircle corners (`border-radius: 28px+`)
- Glassmorphism panels (`backdrop-filter: blur`)
- Clean, premium SaaS — zero clutter
- Soft shadows, subtle borders, rounded corners on all cards/panels

---

## Navigation & UI

| Element | Behaviour |
|---|---|
| Scroll | Full-screen snap, GSAP-owned (not CSS scroll-snap) |
| Arrows | Prev/Next buttons, visible but unobtrusive, bottom area |
| Keyboard | ← → navigate, Esc returns to Screen 1 |
| Dots | Vertical dot indicator, right edge, with subtle X/7 counter |
| Theme toggle | Bottom-right corner, persistent, light/dark mode |
| Mobile | Shows landscape rotation prompt (not a responsive layout) |

### Theme Modes
- **Light:** `#EDEEEF` base, dark text, black logo
- **Dark:** Deep navy/black base, `#FBFBFB` text, white logo
- Logo swaps automatically via `currentColor`
- Screen 7 always forces dark regardless of toggle

---

## The 7 Screens

### Screen 1 — Welcome / Business Benefits

**Background:** Light gradient (White → Cyan → Lime, subtle, top-left to bottom-right) + ambient particle motion

**Logo:** Top-left, black variant (via persistent UI)

**Headline:** "PXP LaunchPad" (large, bold, dark text)

**Subline:** "Merchant Onboarding Made Simple" (secondary weight)

**Body paragraph:** Brief, punchy introduction to the platform (condensed, ~2-3 sentences)

**Benefits Grid:** 2×3 glassmorphism cards with SVG line icons (Lucide-style):
1. ⚡ **Zap icon** → "Accelerated Time to Revenue"
2. 🤖 **Bot/CPU icon** → "Intelligent Automation"
3. 🛍️ **Shopping Bag icon** → "Flexible Payments Ecosystem"
4. 🔒 **Shield icon** → "Integrated Risk & Compliance"
5. 📄 **File Text icon** → "Automated Contracting"
6. 🔗 **Link icon** → "Single Unified Onboarding"

**Cards:** Glassmorphism style — semi-transparent backdrop blur, soft border, rounded corners (border-radius 20px+)

**Animation:** Staggered fade-in sequence:
1. Headline fades in
2. Subline fades in
3. Body paragraph fades in
4. Grid cards slide up + fade in (staggered ~100-150ms apart)
- Total animation duration: ~1.2-1.5s, smooth easing

### Screen 2 — The Warm Lead

**Layout:** Merchant person icon (left) → horizontal arrow → PXP corporate icon (right), centered vertically on screen

**Background:** Clean light grey (#EDEEEF) + subtle ambient particle motion

**Condensed narration (on-screen):** "You warm the lead. We make the rest easy."

**Animation:**
1. Continuity layer fades in (SVG line with icons)
2. Merchant icon renders in Cyan (#44DAFD)
3. Merchant icon colour-shifts: Cyan → Lime (#CAFF0A) over ~2s smooth ease
4. Arrow draws left-to-right via SVG stroke-dashoffset (~0.8s)
5. PXP icon appears at right (opacity fade-in)

**Parallax:** Both icons shift slightly on mouse move for subtle depth perception

**Intent:** Simple, minimal, sets expectation of ease

### Screen 3 — The Problem

**Layout:** Same merchant→PXP continuity line persists (visual continuity from Screen 2)

**Background:** Slightly warmer grey (more saturated than Screen 2) — subtly more tense

**Condensed narration (on-screen):** "But there are always 'things' in the way. PDFs. Emails. Manual entry."

**Added elements:** 3 problem icons drop vertically onto the line:
1. Document/PDF icon + red strike-through line
2. Envelope/Email icon + red strike-through line
3. Keyboard/Manual Entry icon + red strike-through line

**Animation:**
1. Continuity line persists from Screen 2
2. Icons drop from above sequentially (~0.5-0.6s apart), landing on line with bounce effect
3. Each icon gets a red strike-through that draws left-to-right (~0.4s per line)
4. Total animation: ~2.5s

**Intent:** Visual friction — deliberate chaos and frustration before the resolution on Screen 4

### Screen 4 — The Solution

**Layout:** Same merchant→PXP continuity line continues. Problem icons fade out. 4 branch lines extend outward.

**Background:** Returns to clean light (#EDEEEF) — relief after tension of Screen 3

**Condensed narration (on-screen):** "So we built LaunchPad. Less keystrokes. Less time. Less stress."

**Added elements:** 4 branch lines draw from main line with icons at endpoints:
- **Above-left:** Clock icon → "Save Time with Data In"
- **Above-right:** Questionnaire/Checklist icon (one item crossed out) → "Tailored Questions"
- **Below-left:** Shopping Basket icon → "Simple Product Selection"
- **Below-right:** Documents with checkmarks icon → "Automatic Contracting"

**Animation:**
1. Problem icons fade out (~0.3s)
2. Branch lines draw outward from main line sequentially (~0.5s per line, ~0.3s stagger)
3. Icon appears at endpoint (opacity fade-in)
4. Label text fades in below icon
5. Total animation: ~3s staggered

**Intent:** Visual resolution — chaos transformed into elegant, organized structure

### Screen 5 — Full System Diagram

**Background:** Light grey with subtle depth

**Condensed narration:** "LaunchPad is a big system. Partners, products, processes, merchants — one location."

**Content:** Full faithful HTML/SVG process diagram with 4 sections. All nodes shown, all connectors visible.

#### Diagram Structure (Left to Right):

**External Inputs** → **1. Sales (Direct/Partners)** → **2. Risk & Underwriting** → **3. Onboarding** → **4. Fulfilment**

**Section 1: Sales (Direct/Partners)**
- Application Start (Lead & Screen):
  - Lead Information*
  - Screening*
  - Related Entities*
- Product Selection:
  - Product & Pricing*
  - [Tailored Products & Smart Pricing Engine]
- Tailored Questions:
  - Questions*
  - Documents*
  - [Dynamic Questions]
- Application End (Contract):
  - Generate Contract*
  - AdobeSign Send
  - Merchant Signs

**Section 2: Risk & Underwriting**
- Screening Checks Performed
- Underwriting Team Review & Make Decision
  - Business & Bank Screening
  - Scheme Screening
  - Identity & PEPs Screening
  - (Other regulatory checks)
- Approve/Decline (diamond decision)

**Section 3: Onboarding**
- Payment Service
- Unity Product Config:
  - Generate MIDs
  - Merchant & Sites Config
  - Products Config
- Additional Merchant Set Up:
  - Zendesk
  - NetSuite
  - (Other platforms)

**Section 4: Fulfilment**
- Product Fulfilment
- CRM(s):
  - Place Order → Dynamics
  - Track Order → HubSpot
- External (Ac Pa)

**Highlighted Partner-Responsible Nodes** (Violet #A047FF at 20% fill + Violet border + subtle glow pulse):
- Related Entities*
- Product & Pricing*
- Questions*
- Documents*
- Generate Contract*
- AdobeSign Send

**Animation:** Assembles section-by-section left-to-right (~1.5s total). Each section fades in with connectors drawing.

### Screen 6 — Zoomed Partner Focus

**Transition from Screen 5:** GSAP zoom transformation (not a separate screen — shares Screen 5's DOM)

**Background:** Same light grey as Screen 5

**Condensed narration (on-screen):** "These are your steps. Let's explore them in the demo."

**Zoom Animation (~1.2s):**
1. Non-highlighted nodes: blur(4px) + opacity 0.15 fade
2. Container scales + translates so highlighted region centers at ~80% of viewport
3. Non-highlighted nodes fully fade to opacity 0
4. Label "Your steps in the journey" fades in below
5. Highlighted nodes get enhanced Violet glow (#A047FF)

**Highlighted nodes visible post-zoom:**
- Application Start section:
  - Lead Information*
  - Screening*
  - Related Entities*
- Product Selection:
  - Product & Pricing*
- Tailored Questions:
  - Questions*
  - Documents*
- Application End:
  - Generate Contract*
  - AdobeSign Send

**Reverse Navigation (Screen 6 → 5):**
- Calls `timeline.reverse()` — perfectly restores original diagram state
- All animations run backward smoothly
- No re-render, no state loss

**Technical Implementation:**
- Shares Screen 5's DOM — zoom is a CSS transform, not a separate component
- Store zoom timeline separately, never rebuild
- Calculate bounding box of highlighted nodes on first visit

### Screen 7 — Outro / Demo Transition

**Background:** Dark gradient (Black → Cyan (#44DAFD) → Plum (#540B90)) — always dark regardless of theme toggle

**Logo:** White variant (forced, ignores light/dark toggle)

**Content:**
- Headline: "Any questions so far, or jump straight into the demo?" (large, light weight, white text)
- **CTA button:** Promoted to center of screen, large Lime (#CAFF0A) pill button with dark text, bold: "Open LaunchPad →"
  - Opens `https://www.partner.pxpfinancial.com` in new tab on click
  - Hover state: subtle scale (1.05), brightness lift, Violet glow halo

**Persistent subtle CTA link:**
- Hidden on Screen 7 (the promoted button takes over)
- Visible on Screens 1-6 (bottom area, unobtrusive)

**Animation:**
1. Entire screen fades in from dark opacity
2. Headline fades in + slide up
3. CTA button fades in + slides up (staggered ~0.8s after headline)
4. Total animation: ~1.5s

**Intent:** Clear call-to-action, transition to live product demo

---

## Critical Visual Continuity Rule

**Screens 2, 3, and 4 share a persistent SVG layer** containing the merchant→PXP horizontal line. This layer lives outside the individual screen sections, positioned fixed at viewport centre. It is visible only during Screens 2-4 and evolves with each screen's animations.

---

## Global Rules (Do Not Break)

1. Screens 2-4: merchant→PXP line persists and evolves
2. All diagrams: HTML/SVG only — no image embeds
3. Minimal text — visuals carry the narrative
4. Never apply gradients to text
5. Consistent line-style icons throughout (Lucide or similar)
6. Theme toggle swaps: backgrounds, surfaces, text, logo, borders
7. GSAP owns all transitions: scroll snapping, zoom, sequential animations
8. Dot progress indicator: right edge, vertical, updates on navigation
9. Prev/Next buttons: always visible, minimal
10. Keyboard: ← → navigate, Esc → Screen 1
11. `index.html` must always exist at repo root (GitHub Pages requirement)

---

## PXP Logo Details

The PXP logo consists of:
- A **thick circular open ring** (like a rotated "C" with a gap at bottom-left)
- An **"x" mark** (cross/plus shape) positioned in/near the gap of the ring
- The text **"pxp"** in **bold sans-serif** (approximately 60-70% of the ring height) positioned to the right of the icon
- The ring and "x" are solid, the text is bold and uppercase weight

### Reference PNG Files

Located in `/assets/` folder (also stored at repo root for backup):
- **`/assets/PXP_Logo_Black.png`** — black variant for light backgrounds (16.4 KB)
- **`/assets/PXP_Logo_White.png`** — white variant for dark backgrounds (16.0 KB)

These files serve as design reference for recreating the logo as inline SVG.

### SVG Implementation (for index.html)

For the HTML presentation, the logo will be **inline SVG using `currentColor`** — one reusable component that swaps between black/white via CSS theme variables:

```html
<!-- Example structure (to be refined in index.html) -->
<svg class="logo" viewBox="0 0 100 100">
  <!-- Ring -->
  <circle cx="35" cy="50" r="30" fill="none" stroke="currentColor" stroke-width="8" style="stroke-dasharray: 180 360; transform-origin: center; transform: rotate(-45deg)"/>
  <!-- X mark -->
  <line x1="25" y1="40" x2="45" y2="60" stroke="currentColor" stroke-width="8" stroke-linecap="round"/>
  <line x1="45" y1="40" x2="25" y2="60" stroke="currentColor" stroke-width="8" stroke-linecap="round"/>
  <!-- Text "pxp" -->
  <text x="55" y="60" font-family="system-ui, sans-serif" font-size="28" font-weight="700" fill="currentColor">pxp</text>
</svg>
```

**Why inline SVG over PNG:**
- Scales perfectly on any display (projectors, retina, responsive)
- No external file dependencies — single HTML file
- Responds instantly to theme toggles (black ↔ white)
- Lightweight and performant
- Can be animated with GSAP if needed

---

## Design Decisions (from Q&A)

| Decision | Answer |
|---|---|
| Presentation control | Manual — presenter clicks/scrolls through screens live |
| Audience | Both external partners and internal stakeholders |
| On-screen text | Condensed narration visible on each screen (not full script) |
| Narration tone | Punchy and confident — e.g. "You warm the lead. We handle the rest." |
| Diagram detail | Full faithful recreation of all nodes in Screen 5 |
| Animation replay | Play once only — revisited screens show completed state |
| Animation speed | Relative to context — prioritise consistent smoothness over fixed durations |
| Benefits grid icons | SVG line icons (Lucide-style), not emoji — matches premium aesthetic |
| CTA placement | Subtle persistent "Open LaunchPad" link on all screens, promoted to central CTA on Screen 7 |
| Visual effects | ALL of: ambient background motion, glassmorphism panels, glow/halo effects, parallax on mouse move — but all must be subtle and tasteful, not flashy |
