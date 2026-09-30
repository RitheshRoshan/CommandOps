# CommandOps — Security Model & Controls

## Security Principles

CommandOps implements defense-in-depth across the interaction gateway, admin console, database tier, and external integrations.

### 1. Discord Ed25519 Request Verification
- Every request to `/api/discord/interactions` is cryptographically validated using Ed25519 signature checking (`tweetnacl`).
- Unsigned or invalid signature headers (`X-Signature-Ed25519`, `X-Signature-Timestamp`) are immediately rejected with HTTP 401.

### 2. Admin Authentication & Session Security
- Admin console uses HTTP-only, SameSite cookies storing signed JWT tokens (24h expiry).
- Passwords are hashed with bcrypt (salt rounds = 10).
- Throwaway credentials (`admin@commandops.io` / `admin_password_123!`) are provided for candidate evaluation.

### 3. Server-Side Authorization & Tenant Isolation
- All data queries enforce server-side scope (`WHERE serverId = :serverId`).
- Client requests cannot alter or read data belonging to another Discord server tenant.

### 4. Secret Protection & Log Sanitization
- Bot tokens, JWT secrets, database connection strings, and webhook URLs are sanitized in structured JSON logs (`src/lib/logger.ts`).
- `.env.example` contains zero real credentials.

### 5. Idempotency & Replay Protection
- Interaction IDs are enforced unique at the database storage layer. Replayed requests cannot re-trigger downstream webhooks.
