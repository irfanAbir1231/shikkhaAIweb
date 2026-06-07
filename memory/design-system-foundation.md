---
name: design-system-foundation
description: ShikkhaAI UI redesign — design-system foundation built, dark-first AI-native, reusable components + page priority queue
metadata:
  type: project
---

Redesigning ShikkhaAI into premium AI-native adaptive-learning UI. Constraint: UI/UX/animation ONLY — no business logic, API, RAG, exam-gen, auth, or schema changes.

**Foundation shipped (this session):**
- `src/app/globals.css` — dark-first palette (oklch). Brand gradient Blue→Purple→Cyan via `--brand-from/via/to`. Added `--success`/`--warning` tokens. Utilities: `.text-gradient`, `.bg-brand-gradient[-animated]`, `.glass`, `.glass-strong`, `.border-gradient`, `.shadow-glow[-lg]`, `.shadow-soft`, `.hover-lift`, `.skeleton-shimmer`. Keyframes: aurora, float-slow, shimmer, gradient-pan, pulse-glow, grid-drift. Reduced-motion respected.
- ThemeProvider wired in `src/app/layout.tsx` (next-themes, `defaultTheme="dark"`, attribute class). Inter as `--font-sans` variable.
- `src/components/background/ai-background.tsx` — global CSS-only animated backdrop (aurora blobs + neural grid + noise). Mounted in root layout.
- Motion primitives `src/components/motion/reveal.tsx`: `Reveal`, `Stagger`, `StaggerItem`.
- Reusables: `ui/gradient-text.tsx`, `ui/progress-ring.tsx`, `ui/stat-card.tsx` (count-up), `ui/ai-insight-card.tsx`, `ui/ai-loader.tsx` ("Analyzing…" themed). `ui/skeleton.tsx` upgraded to shimmer.
- `ui/button.tsx`: added `gradient` + `glow` variants, `xl` size (additive). `ui/card.tsx`: added `variant` (default|glass|gradient|elevated) + `interactive` props, rounded-2xl (additive).

**Page redesign priority queue (NOT yet done):** Dashboard → Adaptive viz (knowledge graph/mastery tree, core USP) → Landing/Login → Exam + Result (WOW page). No marketing landing exists yet (`/` = dashboard, auth-gated).

Stack: Next 16.2.7 (breaking — read `node_modules/next/dist/docs/` before Next APIs), Tailwind v4, framer-motion 12, shadcn UI (@base-ui/react), recharts, zustand, react-query.
