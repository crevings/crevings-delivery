# Crevings Delivery Partner — Folder Structure

Everything lives under `src/` (consumer-app style), with the `@` alias pointing at `src/`.
Domain logic is organized feature-first; the legacy flat `src/components/` layer holds the
presentational views that the feature modules wrap and wire to stores.

## Directory Hierarchy

```
C:\xces\crevings-delivery\
├── .github/workflows/ci.yml            # tsc → eslint → vitest → build on push/PR
├── docs/
│   ├── FOLDER_STRUCTURE.md             # This file
│   └── adr/                            # Architecture decision records (ADR-001..007)
├── public/                             # Static assets (fonts, icons, images)
├── tests/
│   └── setup.ts                        # Vitest setup (jsdom)
├── src/
│   ├── main.tsx                        # React entry point (BrowserRouter + providers + shell)
│   ├── index.css                       # Tailwind v4 theme
│   ├── vite-env.d.ts
│   ├── app/                            # App-level composition
│   │   ├── layout/
│   │   │   ├── AppShell.tsx            # Header + SideNav + main + BottomNav shell
│   │   │   └── index.ts
│   │   ├── providers/
│   │   │   ├── AuthProvider.tsx        # Auth context (session token)
│   │   │   ├── QueryProvider.tsx       # SWR config + auth fetcher
│   │   │   ├── ThemeProvider.tsx       # Dark/light theme
│   │   │   └── index.ts
│   │   ├── routes/
│   │   │   ├── AppRoutes.tsx           # <Routes> built from config/routes.ts, lazy views
│   │   │   ├── ProtectedRoute.tsx      # Auth guard (redirects to /login)
│   │   │   ├── routeConfig.ts          # AppRoute type (RouteObject + meta)
│   │   │   └── index.ts
│   │   └── store/
│   │       ├── useAppStore.ts          # Zustand slices: auth, partner, orders, UI
│   │       └── index.ts
│   ├── api/                            # API layer (fetcher, auth, earnings, orders, partner, profile)
│   ├── components/                     # Presentational views (legacy layer, feature-wired)
│   │   ├── Dashboard.tsx, LoginView.tsx, OrdersView.tsx, MenuView.tsx, ...
│   │   └── OrderDetailView.tsx, OrderCard.tsx, NewOrderAlert.tsx, VoiceSearchModal.tsx, ...
│   ├── config/
│   │   ├── env.ts                      # Zod-validated env schema
│   │   ├── constants.ts                # App constants (order status, permissions, ...)
│   │   ├── routes.ts                   # Route table → lazy feature components
│   │   └── index.ts
│   ├── data/                           # Mock/demo data
│   ├── features/                       # Feature modules (domain-driven)
│   │   ├── auth/                       #   components/LoginView.tsx (wired to auth store)
│   │   ├── dashboard/                  #   components/Dashboard.tsx (orders/partner stores)
│   │   ├── earnings/                   #   components/EarningsView.tsx
│   │   ├── inventory/                  #   components/InventoryView.tsx
│   │   ├── menu/                       #   components/MenuView.tsx
│   │   ├── orders/                     #   components/OrdersView.tsx, OrderHistoryView.tsx
│   │   ├── profile/                    #   components/ProfileView.tsx
│   │   └── settings/                   #   components/SettingsView.tsx
│   │       # Each feature: index.ts barrel + components/ (views wired to stores/router)
│   ├── hooks/                          # Shared hooks (useLocationManager)
│   ├── lib/                            # Business helpers (orderStatus, print)
│   ├── shared/                         # Cross-cutting shared code
│   │   ├── components/layout/          # Header, SideNav, BottomNav, LoadingSpinner, ErrorBoundary
│   │   └── index.ts
│   ├── types/                          # Domain types (Order, Booking, Tab, ...)
│   └── utils/
│       ├── audioNotifier.ts
│       ├── index.ts
│       └── security/                   # auditLog, csrf, sanitize, secureStorage, validateInput, rateLimiter
├── .env / .env.example
├── index.html
├── package.json
├── tsconfig.json                       # @/* → ./src/*
├── vite.config.ts                      # alias @ → src, port 3002
└── vitest.config.ts
```

## Conventions

- **`@/` alias** always resolves into `src/` (`@/components/X`, `@/features/X`, `@/app/X`).
- **Feature modules** own their user-facing views. Views that need data/navigation are
  *connected wrappers* in `features/<name>/components/` that read Zustand stores and
  `react-router` hooks, and delegate rendering to the presentational component in `src/components/`.
- **Routing** is declared in `src/config/routes.ts` and rendered by `src/app/routes/AppRoutes.tsx`;
  all views are lazy-loaded, and authenticated routes are wrapped in `ProtectedRoute`.
- **State**: Zustand for client UI/auth/orders state (`src/app/store`), SWR for server state.
