# Crevings Delivery Partner App

A production-ready React 19 + Vite 6 partner dashboard for the Crevings delivery platform.

## Tech Stack

- **Framework:** React 19 + TypeScript 5.8
- **Build:** Vite 6 + Tailwind CSS v4
- **Routing:** React Router v7 with lazy loading
- **State:** Zustand (client) + SWR (server)
- **Validation:** Zod
- **Testing:** Vitest + Testing Library
- **Linting:** ESLint + Prettier

## Project Structure

```
crevings-delivery/
├── app/
│   ├── layout/          # AppShell, navigation, layout components
│   ├── providers/       # Auth, Query, Theme providers
│   ├── routes/          # Route definitions, lazy loading, guards
│   └── store/           # Zustand global state slices
├── features/            # Domain-driven feature modules
│   ├── auth/
│   ├── dashboard/
│   ├── orders/
│   ├── menu/
│   └── ... (19 domains)
├── shared/              # Cross-cutting components, hooks, utils
├── config/              # Constants, env schema, route config
├── utils/               # Utilities + security module
├── services/            # External integrations (Gemini AI)
├── api/                 # Legacy API layer (migrating to features/)
├── tests/               # Unit, integration, e2e tests
├── docs/                # Architecture decision records
├── scripts/             # Build and migration scripts
└── tools/               # Developer tooling
```

## Getting Started

```bash
npm install
npm run dev
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Run Prettier |
| `npm run test` | Run test suite |
| `npm run typecheck` | Run TypeScript compiler check |

## Security

See [SECURITY.md](./SECURITY.md) for:
- File system ACLs and permissions
- Secret management policies
- Encryption standards
- Access control matrices
- Incident response procedures

## License

Proprietary — Crevings Platform
