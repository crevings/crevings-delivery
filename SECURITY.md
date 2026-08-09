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
| `VITE_API_BASE_URL` | Backend API origin | Yes |
| `VITE_GOOGLE_MAPS_PLATFORM_KEY` | Google Maps | Yes |
| `VITE_APP_ENV` | Environment selector | Yes |
| `VITE_ENABLE_MOCK_DATA` | Feature flag | Yes |
| `VITE_SSE_ENABLED` | Feature flag | Yes |

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

- **TLS 1.3** enforced for all API calls
- **HTTPS-only** in production
- **Certificate pinning** for Capacitor mobile builds
- **SSE connections** use `wss://` in production

### Frontend-Specific Protections

| Protection | Implementation |
|------------|----------------|
| XSS | React JSX escaping + `sanitizeHtml()` for dynamic content |
| CSRF | `csrf.ts` token generation + cookie validation |
| Input Validation | Zod schemas in `validateInput.ts` |
| Rate Limiting | Client-side throttle in `rateLimiter.ts` |
| Audit Logging | `auditLog.ts` with security event tracking |
| Secure Storage | `sessionStorage` wrapper in `secureStorage.ts` |

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
6. **Secret scan** — TruffleHog / gitleaks in pre-commit

## Incident Response

- **Security events** logged to `auditLog.ts`
- **Critical events** sent to backend logging service
- **Token compromise** → immediate logout + session invalidation
- **XSS attempt** → sanitize + block + alert
