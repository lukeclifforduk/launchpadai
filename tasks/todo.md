# Build Tasks — PXP LaunchPad Presentation

## Phase 1: Skeleton + Navigation + Theme (Steps 1–8)

- [ ] 1. HTML Scaffold — 7 sections, persistent UI layer, continuity SVG layer
- [ ] 2. Tailwind + CSS Custom Properties — CDN link, brand colours, theme variables
- [ ] 3. PXP Logo (inline SVG) — ring + x + text, currentColor for theme swap
- [ ] 4. Navigation Controller — state machine, goToScreen(), input handlers (wheel, keyboard, dots)
- [ ] 5. Crossfade Transitions — GSAP timeline between screens
- [ ] 6. Dark/Light Theme Toggle — button, localStorage, system preference detection
- [ ] 7. Dot Progress Indicator — vertical dots, click navigation, X/7 counter
- [ ] 8. Mobile Landscape Prompt — detect portrait, show overlay

## Phase 2: Bookend Screens 1 + 7 (Steps 9–11)

- [ ] 9. Screen 1: Welcome / Business Benefits — gradient, grid cards, icon set, stagger animation
- [ ] 10. Screen 7: Outro / Demo Transition — dark gradient, white logo, CTA button, animations
- [ ] 11. Persistent Subtle CTA Link — visible Screens 1-6, hidden on 7

## Phase 3: Continuity Screens 2–4 (Steps 12–16)

- [ ] 12. Shared Continuity SVG Layer — merchant → PXP line, fixed position, hidden initially
- [ ] 13. Screen 2: The Warm Lead — grey background, colour-shift animation, arrow draw, parallax
- [ ] 14. Screen 3: The Problem — warmer grey, drop icons with strike-throughs
- [ ] 15. Screen 4: The Solution — light grey, branch lines + icons, labels
- [ ] 16. Wire Continuity Visibility — show/hide layer for Screens 2-4

## Phase 4: Diagram Screens 5 + 6 (Steps 17–21)

- [ ] 17. Screen 5: System Diagram — 4 columns, all nodes, SVG connectors
- [ ] 18. SVG Connectors Overlay — paths connecting nodes left-to-right
- [ ] 19. Highlighted Node Styling — Violet glow + pulse animation on 6 partner nodes
- [ ] 20. Assembly Animation — section-by-section fade + draw (left-to-right, play once)
- [ ] 21. Screen 6: Zoom Transform — blur non-highlighted, scale/translate, reverse on back-nav

## Phase 5: Premium Polish (Steps 22–27)

- [ ] 22. Ambient Background Motion — subtle floating particles or gradient, respects prefers-reduced-motion
- [ ] 23. Glassmorphism Refinements — blur(10px), semi-transparent, rounded corners all panels
- [ ] 24. Glow/Halo Effects — logo shadow, button hover glow, diagram node glow
- [ ] 25. Parallax on Mouse Move — icon shift on Screens 2-4, smooth transform
- [ ] 26. Persistent CTA Link Polish — unobtrusive bottom area styling
- [ ] 27. Dot Progress Indicator Polish — hover state, smooth transitions

## Phase 6: Testing + Push (Steps 28–30)

- [ ] 28. Cross-Theme Testing — light/dark mode on all screens, Screen 7 forced dark
- [ ] 29. Animation Timing Review — smooth playback, play-once enforcement, no jank
- [ ] 30. Commit + Push — git add/commit/push to branch, verify GitHub Pages live
