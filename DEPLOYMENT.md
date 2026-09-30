# CommandOps — Production Deployment Guide

This guide outlines the step-by-step instructions for deploying the **CommandOps — Discord Command Operations Center** platform into a production environment (e.g., Render, Railway, AWS, Fly.io, or Vercel + Managed PostgreSQL).

---

## 📋 System Prerequisites

1. **Node.js**: v20.x LTS or higher
2. **PostgreSQL**: PostgreSQL 16+ instance (managed via Supabase, AWS RDS, Neon, or Railway)
3. **Discord Application**: Created on the [Discord Developer Portal](https://discord.com/developers/applications)
4. **HTTPS Endpoint**: A publicly reachable HTTPS domain name (e.g., `https://commandops.yourdomain.com`)

---

## 🛠️ Environment Configuration

Set the following environment variables in your production hosting platform:

```env
# Server & Environment
NODE_ENV=production
PORT=3000
APP_URL=https://commandops.yourdomain.com
API_URL=https://commandops.yourdomain.com/api

# Database Connection (PostgreSQL)
DATABASE_URL=postgresql://user:password@postgres-host:5432/commandops_db?sslmode=require

# Application Auth Secret
AUTH_SECRET=your_super_secret_64_byte_hex_string

# Discord Bot & Application Details
DISCORD_APPLICATION_ID=123456789012345678
DISCORD_PUBLIC_KEY=a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890
DISCORD_BOT_TOKEN=MTEyMzQ1Njc4OTAxMjM0NTY3OA.G...
DISCORD_CLIENT_ID=123456789012345678
DISCORD_GUILD_ID=987654321098765432

# Optional Advisory AI Provider (Gemini)
AI_PROVIDER=gemini
AI_API_KEY=AIzaSyYourGeminiApiKeyHere

# Default Mirror Webhook URL (For Outbound Webhook Mirroring)
DEFAULT_MIRROR_WEBHOOK_URL=https://discord.com/api/webhooks/...
LOG_LEVEL=info
```

---

## 📦 Deployment Options

### Option A: Docker / Container Deployment (Recommended)

1. **Build Container Image**:
   ```bash
   docker build -t commandops:latest .
   ```

2. **Run Migrations on Database**:
   ```bash
   npx prisma migrate deploy
   ```

3. **Run Seed Script (Initial Seed)**:
   ```bash
   npx prisma db seed
   ```

4. **Launch Container**:
   ```bash
   docker run -d \
     -p 3000:3000 \
     --env-file .env \
     --name commandops \
     commandops:latest
   ```

---

### Option B: Docker Compose (Local/Self-Hosted Production)

1. Provision `.env` with real PostgreSQL credentials and Discord public keys.
2. Start services:
   ```bash
   docker compose up -d --build
   ```
3. Run migrations and seed data inside container:
   ```bash
   docker compose exec app npx prisma migrate deploy
   docker compose exec app npx prisma db seed
   ```

---

### Option C: Bare Metal / Serverless (Render / Railway / Vercel)

1. **Build Step**:
   ```bash
   npm ci
   npx prisma generate
   npm run build
   ```

2. **Migration Step (Release Command)**:
   ```bash
   npx prisma migrate deploy
   ```

3. **Start Command**:
   ```bash
   npm run start
   ```

---

## 🤖 Discord Application Configuration

To receive Discord slash commands in real time:

1. Open [Discord Developer Portal](https://discord.com/developers/applications).
2. Select your Application.
3. Under **General Information**:
   - Locate **Interactions Endpoint URL**.
   - Input your deployed HTTPS URL:
     `https://commandops.yourdomain.com/api/discord/interactions`
4. Click **Save Changes**.
   - Discord will immediately issue a `PING` HTTP POST request containing `X-Signature-Ed25519` and `X-Signature-Timestamp` headers.
   - CommandOps will verify the signature using `DISCORD_PUBLIC_KEY` and respond with `{"type": 1}` (`PONG`), verifying the endpoint.
5. Register Slash Commands:
   ```bash
   npm run discord:register
   ```

---

## 🔍 Verification & Health Probes

Verify deployment health using HTTP probes:

- **Liveness Probe**: `GET https://commandops.yourdomain.com/api/health/live` (HTTP 200)
- **Readiness Probe**: `GET https://commandops.yourdomain.com/api/health/ready` (HTTP 200 if DB is healthy)
- **Comprehensive Status**: `GET https://commandops.yourdomain.com/api/health`

---

## 🔒 Security Checklist

- [x] HTTPS enforced for all Discord interaction webhooks.
- [x] Ed25519 signature verification on `X-Signature-Ed25519` and `X-Signature-Timestamp`.
- [x] Idempotency enforced via PostgreSQL `interaction_records.interaction_id` UNIQUE constraint.
- [x] Non-root execution in Docker container (`nextjs` UID 1001).
- [x] Environment secrets stored in vault or platform env vars, never committed to repository.
- [x] Cookie security (`HttpOnly`, `SameSite=Lax`, `Secure` in production).
