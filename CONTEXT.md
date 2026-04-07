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
- **Background:** Light gradient (White → Cyan → Lime, subtle)
- **Logo:** Top-left, black variant
- **Content:** "PXP LaunchPad" headline, "Merchant Onboarding Made Simple" subline, body paragraph, 2x3 benefits grid
- **Benefits grid items:**
  - ⚡ Accelerated Time to Revenue
  - 🤖 Intelligent Automation
  - 🛍️ Flexible Payments Ecosystem
  - 🔒 Integrated Risk & Compliance
  - 📄 Automated Contracting
  - 🔗 Single Unified Onboarding
- **Animation:** Staggered fade-in: headline → subline → body → grid cards slide up

### Screen 2 — The Warm Lead
- **Layout:** Merchant person icon (left) → horizontal arrow → PXP corporate icon (right)
- **Background:** Clean light grey
- **Animation:** Merchant icon renders Cyan, colour-shifts to Lime (~2s). Arrow draws left-to-right.
- **Narration text:** "You've done the hard work, warmed a lead and have a merchant ready to onboard. This next bit really should be easy."
- **Intent:** Simple, minimal, sets expectation of ease

### Screen 3 — The Problem
- **Layout:** Same merchant→PXP line (visual continuity from Screen 2)
- **Background:** Slightly warmer grey (subtly more tense)
- **Added elements:** 3 icons drop from above onto the line:
  1. PDF/Document icon + red strike-through
  2. Email/Envelope icon + red strike-through
  3. Keyboard/Manual Entry icon + red strike-through
- **Animation:** Sequential drop-in ~0.6s apart, strike-through draws left-to-right ~0.4s each
- **Intent:** Visual friction — deliberate chaos before the resolution

### Screen 4 — The Solution
- **Layout:** Same merchant→PXP line continues
- **Background:** Returns to clean light (relief)
- **Added elements:** 4 branch lines extend from main line to icons:
  - Above-left: Clock → "Save Time with Data In"
  - Above-right: Questionnaire (one crossed out) → "Streamline with Tailored Questions"
  - Below-left: Shopping basket → "Simple Product Selection"
  - Below-right: Two documents with checkmarks → "Automatic Contracting"
- **Animation:** Branch lines draw outward (~0.5s each), icon appears at end, label fades in. Total ~3s staggered.
- **Intent:** Chaos resolved into elegant structure

### Screen 5 — Full System Diagram
- **Layout:** Full-width, diagram fills ~80% of screen
- **Background:** Light grey with subtle depth
- **Content:** HTML/SVG process diagram with 4 sections:
  - **1. Sales (Direct/Partners):** Application Start → Product Selection → Tailored Questions → Application End (Contract)
  - **2. Risk & Underwriting:** Screening → Review → Approve/Decline
  - **3. Onboarding:** Payment Service → Unity Config → Additional Setup
  - **4. Fulfilment:** Product Fulfilment → CRM(s), Orders, Tracking
- **Highlighted nodes** (Violet fill 20% + Violet border + glow pulse):
  - Related Entities*, Product & Pricing*, Questions*, Documents*, Generate Contract*, AdobeSign Send
- **Animation:** Assembles section-by-section left-to-right (~1.5s)

### Screen 6 — Zoomed Partner Focus
- **Transition from Screen 5:** GSAP zoom into highlighted region
- **Non-highlighted areas:** blur(4px) + opacity 0.15, fade out
- **Zoomed region scales to ~80% viewport**
- **Shows only partner-responsible steps:**
  - Lead Information* → Screening* → Related Entities*
  - Product & Pricing*
  - Questions* → Documents*
  - Generate Contract* → AdobeSign Send
- **Post-zoom:** Highlighted nodes glow Violet, label "Your steps in the journey" appears
- **Technical:** Shares Screen 5's DOM — zoom is a transform, not a separate view. Reverse navigation calls `timeline.reverse()`.

### Screen 7 — Outro / Demo Transition
- **Background:** Dark gradient (Black → Cyan → Plum) — always dark
- **Logo:** White variant, top-left
- **Content:** "Any questions so far, or jump straight into the demo?"
- **CTA:** Pill button, Lime background, dark text: "Open LaunchPad →" → opens `https://www.partner.pxpfinancial.com` in new tab
- **Animation:** Fade in from dark, text + button staggered ~0.8s apart

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

## PXP Logo Description (for SVG recreation)

The PXP logo consists of:
- A **circular open ring** (like a letter C rotated) with a gap at the bottom-left
- An **"x" mark** sitting in/near the gap of the ring
- The text **"pxp"** in lowercase bold sans-serif to the right of the ring icon
- Two variants: all-black on light backgrounds, all-white on dark backgrounds

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
