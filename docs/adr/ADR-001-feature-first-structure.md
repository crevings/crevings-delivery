# Architecture Decision Records

## ADR-001: Feature-First Directory Structure

**Status:** Accepted
**Date:** 2026-08-08

**Context:**
The original `crevings-delivery` frontend used a flat `src/components/` directory with 66+ view components, leading to poor discoverability and tight coupling.

**Decision:**
Adopt a feature-first (domain-driven) folder structure under `features/`, where each domain (orders, menu, profile, etc.) owns its components, hooks, services, types, and utils.

**Consequences:**
- Positive: Improved modularity, easier onboarding, clear ownership
- Negative: More directories, initial migration effort

## ADR-002: Zustand for Global State

**Status:** Accepted
**Date:** 2026-08-08

**Context:**
`App.tsx` had 20+ `useState` declarations with prop drilling across 30+ components. No global state management existed.

**Decision:**
Use Zustand for client-side global UI state (auth, partner status, orders, UI flags). Keep server state in SWR.

**Consequences:**
- Positive: Eliminates prop drilling, simple API, no boilerplate
- Negative: No built-in devtools (Zustand DevTools available)

## ADR-003: React Router v7 with Lazy Loading

**Status:** Accepted
**Date:** 2026-08-08

**Context:**
Navigation was a state-driven `switch` on `currentTab`, preventing deep linking and producing a 1.8MB initial bundle.

**Decision:**
Use `react-router-dom` v7 with `<Routes>` and `<Route>`. All view components lazy-loaded via `React.lazy()` + `Suspense`.

**Consequences:**
- Positive: Deep linking, browser history, smaller initial bundle
- Negative: Requires route-level data fetching pattern

## ADR-004: Vite + Tailwind CSS v4

**Status:** Accepted
**Date:** 2026-08-08

**Context:**
Tailwind was loaded via CDN `<script>` tag, preventing JIT compilation and producing a 15KB CSS bundle with all utilities.

**Decision:**
Use `@tailwindcss/vite` plugin for build-time JIT compilation. Custom theme defined in `index.css` using `@theme`.

**Consequences:**
- Positive: Smaller CSS bundle, JIT purging, type-safe theme tokens
- Negative: Requires Vite plugin configuration

## ADR-005: Security-First Client Architecture

**Status:** Accepted
**Date:** 2026-08-08

**Context:**
No input validation, no CSRF protection, no audit logging, and demo OTP hardcoded in production code.

**Decision:**
Implement `utils/security/` with sanitize, validateInput, csrf, auditLog, secureStorage, and rateLimiter. Enforce Zod validation on all user inputs.

**Consequences:**
- Positive: Defense-in-depth, audit trail, compliance-ready
- Negative: Slightly higher bundle size, more boilerplate

## ADR-006: TypeScript Strict Mode

**Status:** Accepted
**Date:** 2026-08-08

**Context:**
89+ instances of `any` type, missing `strict` flag, and duplicate interface definitions.

**Decision:**
Enable `strict: true`, `noUnusedLocals`, `noUnusedParameters`, `forceConsistentCasingInFileNames` in `tsconfig.json`.

**Consequences:**
- Positive: Catches bugs at compile time, better IDE support
- Negative: Requires fixing all existing `any` types

## ADR-007: CI/CD with Quality Gates

**Status:** Accepted
**Date:** 2026-08-08

**Context:**
No CI/CD pipeline, no linting config, no test framework.

**Decision:**
GitHub Actions running `tsc --noEmit` → `eslint` → `vitest` → `npm run build` on every push and PR.

**Consequences:**
- Positive: Automated quality enforcement, fast feedback
- Negative: Requires maintaining CI config
