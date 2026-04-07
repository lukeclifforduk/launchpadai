# PXP LaunchPad Presentation — Development Plan

> This document is your roadmap for building the `index.html` presentation from scratch.
> If you're a future Claude instance picking up this project, read CONTEXT.md first, then follow this plan sequentially.

---

## Assets Inventory

All design reference files are located in the `/assets/` folder:

- **`/assets/PXP_Logo_Black.png`** (16.4 KB) — Black logo variant, reference for light backgrounds
- **`/assets/PXP_Logo_White.png`** (16.0 KB) — White logo variant, reference for dark backgrounds

**How to use:** These PNGs show the exact logo structure and proportions. Study them to recreate the logo as **inline SVG** in `index.html` using `currentColor` for automatic theme switching.

---

## Quick Summary

Build a **single, self-contained `index.html`** file that presents a 7-screen, full-screen demo of PXP LaunchPad. The file must:
- Use **Tailwind CSS** (CDN) + **GSAP** (CDN) for animations
- Include **inline SVG icons** (Lucide-style) and logo
- Have **GSAP-owned navigation** (not CSS scroll-snap)
- Support **light/dark theme toggle** with localStorage
- Implement **premium visual effects** (particles, glass, glow, parallax) — all subtle
- Play **animations once only** — revisited screens show completed state
- Include all 7 screens with precise narration, colors, and animations

**GitHub Pages:** Must be live at `https://lukeclifforduk.github.io/launchpadai/` after push to `main`

---

## Build Phases (Sequential)

### Phase 1: Skeleton + Navigation + Theme (Steps 1–8)

**Goal:** Foundation — all 7 screens exist, navigation works, theme toggle works.

1. **HTML Scaffold**
   - All 7 `<section id="screen-X">` elements with `position: fixed; inset: 0`
   - Persistent UI layer: logo, dots nav, prev/next buttons, theme toggle, CTA link
   - Continuity SVG layer (hidden initially, shown for Screens 2-4)
   - Mobile landscape prompt overlay

2. **Tailwind + CSS Custom Properties**
   - CDN link with JIT mode
   - Inline `<style>` block with brand colours:
     - White: `#FBFBFB`
     - Grey: `#EDEEEF`
     - Cyan: `#44DAFD`
     - Lime: `#CAFF0A`
     - Plum: `#540B90`
     - Violet: `#A047FF`
   - CSS variables for light/dark theme
   - Full-screen reset, fixed positioning

3. **PXP Logo (inline SVG)**
   - Circular open ring + "x" mark + "pxp" text
   - Uses `currentColor` for theme swapping
   - Two sizes: small (top-left persistent UI), large (Screen 7)

4. **Navigation Controller (vanilla JS)**
   - State: `currentScreen` (0-6), `isAnimating` lock
   - Inputs: wheel (800ms debounce), keyboard (← →, Esc), dot clicks, prev/next buttons
   - Output: `goToScreen(newIndex)` function
   - Prevent mid-flight navigation with `isAnimating` lock

5. **Crossfade Transitions**
   - GSAP timeline: fade out active screen, fade in new screen (~0.5s)
   - Call `goToScreen()` and let GSAP handle the visual transition

6. **Dark/Light Theme Toggle**
   - Button: bottom-right, sun/moon icon
   - Toggle: switches `[data-theme]` attribute on `<html>`
   - localStorage: save preference as `launchpad-theme`
   - Initial: detect system preference or load from localStorage

7. **Dot Progress Indicator**
   - Vertical dots (right edge), one per screen
   - Current dot highlighted
   - Counter text: "X/7" below dots
   - Click to jump to screen

8. **Mobile Landscape Prompt**
   - Detect portrait orientation (not desktop-width)
   - Show overlay: "Please rotate to landscape for best experience"
   - Z-index: 50 (topmost)

**Verification:**
- Open HTML, all 7 sections visible (stacked, opaque backgrounds)
- Click dots, prev/next, arrows — navigation works
- Toggle theme — colours swap
- Mobile portrait — prompt appears

---

### Phase 2: Bookend Screens 1 + 7 (Steps 9–11)

**Goal:** First and last screens complete with animations.

9. **Screen 1: Welcome / Business Benefits**
   - Background: light gradient (White → Cyan → Lime, top-left to bottom-right)
   - Content: logo (via persistent UI), headline, subline, body, benefits grid
   - Grid: 2×3, each card is glassmorphism (backdrop-filter: blur, semi-transparent, rounded)
   - Icons: 6 Lucide-style SVG icons (Zap, Bot, Bag, Shield, File, Link)
   - Animation: GSAP stagger (headline fade → subline fade → body fade → grid cards slide up + fade)
   - Duration: ~1.2-1.5s total, smooth easing

10. **Screen 7: Outro / Demo Transition**
    - Background: dark gradient (Black → Cyan → Plum) — forced dark
    - Logo: white variant (forced)
    - Content: headline text, CTA button (promoted to center, large Lime pill)
    - Button: dark text "Open LaunchPad →", hover: scale 1.05, glow halo
    - Link: `https://www.partner.pxpfinancial.com` (new tab)
    - Animation: fade in + slide up, staggered (~0.8s between headline and button)
    - Duration: ~1.5s total

11. **Persistent Subtle CTA Link**
    - Visible on Screens 1-6 (bottom area, unobtrusive)
    - Text: "Open LaunchPad" or similar, styled as link
    - Hidden on Screen 7 (promoted button takes over)
    - Open same URL in new tab

**Verification:**
- Screen 1: gradient, icons render, cards visible, stagger animation plays once (no replay on revisit)
- Screen 7: dark gradient, white logo, button centered, hover effects work
- Theme toggle: both screens respect light/dark

---

### Phase 3: Continuity Screens 2–4 (Steps 12–16)

**Goal:** Merchant → PXP line evolves across 3 screens.

12. **Shared Continuity SVG Layer**
    - Fixed position at viewport center
    - Elements: merchant person icon (left), horizontal arrow (center), PXP icon (right)
    - Initially hidden (opacity 0), shown only for Screens 2-4
    - Z-index: 30 (below persistent UI at z-40)
    - SVG: inline `<svg>` with `<circle>`, `<path>`, `<text>` elements

13. **Screen 2: The Warm Lead**
    - Background: light grey (#EDEEEF) + ambient particle motion
    - Narration (on-screen): "You warm the lead. We make the rest easy."
    - Animation:
      - Continuity layer fades in
      - Merchant icon renders Cyan (#44DAFD)
      - Merchant icon colour-shifts: Cyan → Lime (#CAFF0A) over ~2s (GSAP attr animation on SVG fill)
      - Arrow draws left-to-right via stroke-dashoffset (~0.8s)
      - PXP icon fades in
    - Parallax: both icons shift slightly on mouse move (requestAnimationFrame, mouse event listener)

14. **Screen 3: The Problem**
    - Background: warmer grey (slightly more saturated than Screen 2)
    - Narration (on-screen): "But there are always 'things' in the way. PDFs. Emails. Manual entry."
    - Continuity line persists
    - Added: 3 problem icons drop from above onto line:
      - Document/PDF icon (position: absolute, above line, drops with bounce)
      - Envelope/Email icon
      - Keyboard/Manual Entry icon
    - Each icon gets red strike-through line that draws (GSAP timeline, stroke-dashoffset)
    - Animation: sequential drop (~0.5s apart), strike-through draws (~0.4s per line)
    - Duration: ~2.5s

15. **Screen 4: The Solution**
    - Background: light (#EDEEEF) — relief after Screen 3
    - Narration (on-screen): "So we built LaunchPad. Less keystrokes. Less time. Less stress."
    - Continuity line persists
    - Problem icons fade out
    - Added: 4 branch lines extend from main line:
      - Above-left: Clock icon + "Save Time with Data In"
      - Above-right: Questionnaire icon + "Tailored Questions"
      - Below-left: Basket icon + "Simple Product Selection"
      - Below-right: Documents icon + "Automatic Contracting"
    - Animation: branch lines draw outward (GSAP, stroke-dashoffset), icons fade in, labels fade in
    - Duration: ~3s staggered
    - Timing: ~0.5s per line, ~0.3s stagger, total ~2.5s + label fade ~0.5s

16. **Wire Continuity Visibility**
    - Continuity layer: show on Screens 2, 3, 4 only
    - Use GSAP to control opacity based on `currentScreen` value
    - Transition in/out smoothly (~0.3s)

**Verification:**
- Screens 2-4: continuity line persists across all three
- Screen 2: merchant icon colour-shifts, arrow draws
- Screen 3: problem icons drop with strikes
- Screen 4: branch lines draw, solution icons appear
- Parallax on mouse move (Screens 2-4)
- Navigate 4→3→2→1: animations don't replay, screens show completed state

---

### Phase 4: Diagram Screens 5 + 6 (Steps 17–21)

**Goal:** Full system diagram with zoom interaction.

17. **Screen 5: System Diagram (HTML/SVG Grid)**
    - Background: light grey (#EDEEEF)
    - Narration (on-screen): "LaunchPad is a big system. Partners, products, processes, merchants — one location."
    - Layout: 4 columns (Sales, Risk & Underwriting, Onboarding, Fulfilment)
    - All nodes as HTML divs (for text rendering clarity):
      - Sales: 4 groups (Application Start, Product Selection, Tailored Questions, Application End)
      - Risk & Underwriting: screening checks, review, approve/decline
      - Onboarding: payment service, unity config, additional setup
      - Fulfilment: product fulfilment, CRM integrations
    - See CONTEXT.md for full node list

18. **SVG Connectors Overlay**
    - `<svg>` overlay above diagram content
    - Paths connecting nodes left-to-right
    - Lines visible during assembly animation

19. **Highlighted Node Styling**
    - 6 partner-responsible nodes: Related Entities, Product & Pricing, Questions, Documents, Generate Contract, AdobeSign Send
    - Styling: Violet (#A047FF) at 20% fill + Violet border + glow pulse (CSS animation)
    - CSS animation: subtle scale pulse, opacity pulse, or shadow glow (~0.8s cycle, infinite)

20. **Assembly Animation**
    - On first visit to Screen 5: diagram assembles left-to-right
    - Section by section (Sales → Risk → Onboarding → Fulfilment)
    - Each section: nodes fade in, connectors draw
    - Duration: ~1.5s total
    - GSAP stagger: ~0.3-0.4s per section
    - On revisit: skip animation, show completed diagram

21. **Screen 6: Zoom Transform (Shares Screen 5 DOM)**
    - On navigation to Screen 6 (from Screen 5 forward):
      - Store zoom timeline
      - Calculate bounding box of 6 highlighted nodes
      - GSAP timeline:
        1. Blur non-highlighted nodes (filter: blur(4px))
        2. Fade non-highlighted: opacity → 0.15
        3. Scale + translate container so highlighted region centers at ~80% viewport
        4. Fade non-highlighted nodes to opacity 0
        5. Label "Your steps in the journey" fades in
        6. Enhanced glow on highlighted nodes
      - Duration: ~1.2s
    - Narration (on-screen): "These are your steps. Let's explore them in the demo."
    - Reverse nav (Screen 6 → 5): `timeline.reverse()` — perfectly restores original state
    - Never rebuild zoom timeline; reuse stored instance

**Verification:**
- Screen 5: full diagram visible, 6 nodes glowing with pulse animation
- Assembly animation plays once on first visit, skipped on revisit
- Screen 5→6: zoom transition works smoothly
- Screen 6→5: reverse zoom restores original state perfectly
- All nodes rendered correctly with proper text

---

### Phase 5: Premium Polish (Steps 22–27)

**Goal:** Subtle, tasteful visual effects across all screens.

22. **Ambient Background Motion**
    - Floating particle dots OR slow-moving mesh gradient
    - Very subtle (opacity 0.03–0.08 on particles, slow animation 20-30s cycle)
    - Respect `prefers-reduced-motion` media query
    - Applied to Screens 1, 2, 4 at minimum

23. **Glassmorphism Refinements**
    - All cards/panels: `backdrop-filter: blur(10px)`, semi-transparent background (rgba with 0.7-0.85 alpha)
    - Soft borders: 1px, subtle colour (rgba of theme text at 0.2 opacity)
    - Border-radius: 20px+ (consistent squircle aesthetic)
    - Applied to: Screen 1 benefits grid, persistent UI elements, any panels

24. **Glow/Halo Effects**
    - Logo: subtle shadow with Cyan/Violet tint (box-shadow with blur)
    - CTA button (Screen 7): Violet glow on hover (box-shadow)
    - Highlighted diagram nodes (Screen 5): Violet glow animation (CSS animation, shadow or filter: drop-shadow)
    - All glows: subtle, not overwhelming

25. **Parallax on Mouse Move**
    - Detect mouse position via `mousemove` event listener
    - Icons on Screens 2-4: shift ±5-10px based on cursor position
    - Subtle depth effect, smooth (no jank)
    - Use `transform: translate()` for performance

26. **Persistent CTA Link (All Screens Except 7)**
    - Visible on Screens 1-6, bottom area (z-40)
    - Text: "Open LaunchPad" (punchy, matches tone)
    - Link: `https://www.partner.pxpfinancial.com`, new tab
    - Styling: subtle, unobtrusive (light text, small size, hover underline)
    - Hidden on Screen 7 (promoted button takes over)

27. **Dot Progress Indicator Polish**
    - Vertical dots, right edge, with smooth transitions
    - Counter text: "X/7" below dots
    - Hover state on dots: slightly larger or glow
    - Smooth animation when active dot changes

**Verification:**
- Ambient motion visible but not distracting on projector
- Glassmorphism cards visible on all screens (blur + semi-transparent)
- Glow effects subtle and tasteful (not neon)
- Parallax visible on mouse move (Screens 2-4)
- CTA link visible on Screens 1-6, hidden on 7
- Dot nav responsive and smooth

---

### Phase 6: Testing + Push (Steps 28–30)

**Goal:** Verify everything works, commit, push, go live.

28. **Cross-Theme Testing**
    - Open in browser
    - Visit every screen in light mode: verify colours, text readability, logo, animations
    - Toggle to dark mode: verify all colours swap, logo becomes white, text is readable
    - Screen 7: verify it stays dark even if light theme is active
    - All cards, buttons, icons visible and properly styled in both themes

29. **Animation Timing Review**
    - Play through all animations once
    - Check for consistent smoothness (no stutters, jank)
    - Screen 1: stagger animation is smooth
    - Screens 2-4: continuity animations flow well
    - Screen 5: assembly animation is smooth and left-to-right
    - Screen 5→6: zoom transition is silky
    - All animations respect "play once" rule (no replay on revisit)

30. **Commit + Push**
    - Git add `index.html`
    - Commit: "Implement 7-screen LaunchPad presentation with animations, theme toggle, and premium effects"
    - Git push to `claude/review-design-assets-n5GqS`
    - Merge to `main` (or push main if allowed)
    - Verify GitHub Pages live at `https://lukeclifforduk.github.io/launchpadai/`

---

## Critical Dos and Don'ts

### DO:
- ✅ Use GSAP for all animations and transitions
- ✅ Use Tailwind CDN (JIT mode)
- ✅ Use inline SVGs for all icons, diagrams, and logo
- ✅ Use `currentColor` for logo to support theme swap
- ✅ Track `hasPlayed[screenIndex]` to prevent animation replay
- ✅ Store Screen 5→6 zoom timeline, reuse it (never rebuild)
- ✅ Respect `prefers-reduced-motion` for ambient effects
- ✅ Test dark/light theme on all screens
- ✅ Ensure `index.html` exists at repo root for GitHub Pages

### DON'T:
- ❌ Use CSS `scroll-snap` — GSAP owns navigation
- ❌ Use image embeds (PNG, JPG) — inline SVG only
- ❌ Apply gradients to text
- ❌ Replay animations on screen revisit
- ❌ Build zoom timeline multiple times
- ❌ Use external fonts (system stack only)
- ❌ Add extra features or configurability
- ❌ Break the persistent continuity line on Screens 2-4

---

## Key Files & Dependencies

| File | Role |
|---|---|
| `index.html` | Single self-contained file — your deliverable |
| CONTEXT.md | Reference for all design details, colours, narration |
| DEVELOPMENT_PLAN.md | This file — implementation roadmap |
| CLAUDE.md | Project guide, tech stack, conventions |

### Asset Files (Design Reference)

All image assets stored in `/assets/` folder:

| File | Location | Purpose |
|---|---|---|
| `PXP_Logo_Black.png` | `/assets/PXP_Logo_Black.png` | Reference for logo design on light backgrounds |
| `PXP_Logo_White.png` | `/assets/PXP_Logo_White.png` | Reference for logo design on dark backgrounds |

**Note:** These PNG files are design references only. You will **recreate the logo as inline SVG** in `index.html` using `currentColor` for theme switching. The PNGs help you understand the exact structure and proportions.

### CDNs:
- Tailwind CSS (JIT): `https://cdn.tailwindcss.com`
- GSAP 3.12+: `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.x/gsap.min.js`
- GSAP plugins: ScrollTrigger, ScrollToPlugin (same CDN)

---

## Estimated Code Structure

```html
<!DOCTYPE html>
<html data-theme="light">
<head>
  <!-- Meta, title -->
  <!-- Tailwind CDN -->
  <!-- GSAP CDN -->
  <style>
    /* CSS custom properties (colours, themes) */
    /* Reset, base styles */
    /* Screen layout (fixed, stacked) */
    /* Glassmorphism cards, buttons */
    /* Animation keyframes (pulse, float, etc.) */
    /* Theme overrides (light/dark) */
  </style>
</head>
<body>
  <!-- Persistent UI: logo, nav dots, buttons, toggle, CTA link -->
  
  <!-- Screen 1: Welcome -->
  <!-- Screen 2: Warm Lead -->
  <!-- Continuity SVG Layer (Screens 2-4) -->
  <!-- Screen 3: Problem -->
  <!-- Screen 4: Solution -->
  <!-- Screen 5: Diagram -->
  <!-- Screen 6: Zoom (shares Screen 5 DOM) -->
  <!-- Screen 7: Outro -->
  
  <!-- Mobile landscape prompt -->
  
  <script>
    /* GSAP initialization */
    /* Navigation controller (goToScreen, debounce, state) */
    /* Theme toggle with localStorage */
    /* Parallax mouse listener */
    /* Screen-specific animations (GSAP timelines) */
    /* Event handlers (wheel, keyboard, dot clicks, buttons) */
  </script>
</body>
</html>
```

---

## Common Pitfalls & Solutions

| Pitfall | Solution |
|---|---|
| Animations replay on back-nav | Use `hasPlayed[screenIndex]` flag; skip animation if true |
| Wheel event fires too fast | Debounce with 800ms cooldown; set `isAnimating` lock |
| Screen 5→6 zoom glitches | Store timeline separately; always use `timeline.reverse()` for backward nav |
| Diagram connectors shift on resize | Listen to `resize` event; recalculate SVG paths, redraw |
| Screen 7 theme toggle ignored | Use explicit `background: <colour>` overrides, not CSS variables |
| Glassmorphism looks washed out | Use `backdrop-filter: blur(10px)` + semi-transparent background (0.7-0.85 alpha) |
| Parallax is janky | Use `transform: translate()`, not `left`/`top`; throttle mousemove with requestAnimationFrame |

---

## Reference Links

- **CONTEXT.md** — All design details, colours, screen specs, narration
- **CLAUDE.md** — Project guide, tech stack, conventions
- **Plan file:** `/root/.claude/plans/staged-wibbling-gadget.md` (from session planning)
- **GitHub Pages:** `https://lukeclifforduk.github.io/launchpadai/`
- **Demo site:** `https://www.partner.pxpfinancial.com`

---

## Next Steps (For Future Claude Instance)

1. Read CONTEXT.md completely
2. Read this file (DEVELOPMENT_PLAN.md)
3. Follow Phase 1–6 sequentially
4. Reference CONTEXT.md for exact wording, colours, and specifications
5. Build incrementally — test after each phase
6. Commit early and often
7. Push to `claude/review-design-assets-n5GqS`, then merge to `main`
8. Verify live on GitHub Pages
