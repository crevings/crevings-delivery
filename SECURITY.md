# Security Configuration

## File System Permissions

### Windows NTFS ACLs

| Path | Access | Principal | Inheritance |
|------|--------|-----------|-------------|
| `C:\xces\crevings-delivery\` | Modify | `BUILTIN\Administrators` | This folder, subfolders, files |
| `C:\xces\crevings-delivery\` | Read & Execute | `BUILTIN\Users` | This folder, subfolders, files |
| `C:\xces\crevings-delivery\.env` | Read | `BUILTIN\Administrators` | This folder only |
| `C:\xces\crevings-delivery\.env` | Full Control | `BUILTIN\Administrators` | This folder only |

### Linux/macOS Permissions

```bash
# Project root
chmod 755 /xces/crevings-delivery

# Sensitive files
chmod 600 /xces/crevings-delivery/.env
chmod 600 /xces/crevings-delivery/.env.*
chmod 600 /xces/crevings-delivery/src/utils/security/secureStorage.ts

# Executables
chmod +x /xces/crevings-delivery/scripts/*

# Remove world-readable from configs
chmod 640 /xces/crevings-delivery/vite.config.ts
chmod 640 /xces/crevings-delivery/tsconfig.json
```

## Secret Management

### Environment Variables

- **Never commit `.env`** — it is listed in `.gitignore`
- **Use `.env.example`** as a template with placeholder values
- **Prefix all client-exposed variables with `VITE_`**
- **Inject server-only secrets via backend proxy** — never expose API keys in the client bundle

### Allowed Vite Environment Variables

| Variable | Purpose | Exposed to Client |
|----------|---------|-------------------|
| `VITE_PUBLIC_BASE_API_URL` | Backend API origin (read by `src/api/fetcher.ts`) | Yes |
| `VITE_API_BASE_URL` | Backend API origin (used by `src/config/env.ts` schema) | Yes |
| `VITE_GOOGLE_MAPS_PLATFORM_KEY` | Google Maps | Yes |
| `VITE_GEMINI_API_KEY` | Optional AI features | Yes |
| `VITE_APP_ENV` | Environment selector | Yes |
| `VITE_ENABLE_MOCK_DATA` | Feature flag | Yes |
| `VITE_SSE_ENABLED` | Feature flag | Yes |
| `VITE_LOCATION_TRACKING_INTERVAL` | Location ping interval (ms) | Yes |
| `VITE_ORDER_POLL_INTERVAL` | Order poll interval (ms) | Yes |

### Prohibited Patterns

- ❌ `process.env.API_KEY` in browser code
- ❌ Hardcoded API keys in source
- ❌ Secrets in `localStorage`
- ❌ `dangerouslySetInnerHTML` with user input
- ❌ Inline event handlers from untrusted sources

## Encryption Settings

### At Rest

| Asset | Method | Key Management |
|-------|--------|----------------|
| `.env` | OS-level encryption (BitLocker/FileVault) | Machine-bound TPM |
| Build artifacts | No encryption (public assets) | — |
| Source code | Git encryption (git-crypt) | Team key distribution |

### In Transit

- **HTTPS-only** in production (enforced by the deploy target / backend)
- **SSE connections** use `withCredentials` over the same origin as the API

## Frontend-Specific Protections

| Protection | Implementation |
|------------|----------------|
| XSS | React JSX escaping (no `dangerouslySetInnerHTML` with user input) |
| CSRF | Backend-side defense (SameSite cookies + Origin checks) — client sends `credentials: "include"` on every request |
| Input Validation | Zod schemas in `src/config/env.ts`; typed API payloads |
| Audit Logging | `src/utils/security/auditLog.ts` with security event tracking |
| Secure Storage | `sessionStorage` wrapper in `src/utils/security/secureStorage.ts` (session-scoped; not encrypted — do not store long-lived secrets) |
| Session Expiry | Global 401 hook: any authenticated request returning 401 clears the session and redirects to `/login` (`src/api/fetcher.ts`, `src/app/providers/AuthProvider.tsx`) |

## Access Control Lists

### Application Layer

| Resource | Authenticated | Partner | Admin |
|----------|:---:|:---:|:---:|
| Dashboard | ✓ | ✓ | ✓ |
| Orders | ✓ | ✓ | ✓ |
| Earnings | ✓ | ✓ | ✓ |
| Menu Management | ✓ | ✓ | ✓ |
| Inventory | ✓ | ✓ | ✓ |
| Staff Management | ✓ | Owner | ✓ |
| Settings | ✓ | Owner | ✓ |
| Legal Pages | ✓ | ✓ | ✓ |
| API Admin | ✗ | ✗ | ✓ |

### Code Access

- **Public repositories**: No secrets, no internal API endpoints
- **Private repositories**: Invite-only, signed commits required
- **Branch protection**: `main` requires PR review + CI pass
- **Dependency audit**: `npm audit` in CI, Dependabot enabled

## CI/CD Security Gates

1. **Lint** — ESLint with security rules
2. **Typecheck** — TypeScript strict mode
3. **Test** — Unit + integration tests
4. **Build** — Production build with sourcemaps hidden
5. **Audit** — `npm audit --audit-level=high`
6. **Secret scan** — TruffleHog / gitleaks in pre-commit (recommended; not yet configured in this repo)

## Incident Response

- **Security events** logged to `auditLog.ts`
- **Critical events** sent to backend logging service
- **Token compromise** → immediate logout + session invalidation (global 401 hook)
- **XSS attempt** → sanitize + block + alert