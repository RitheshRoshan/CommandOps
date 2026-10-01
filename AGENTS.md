# AGENTS.md — AI Agent Guidelines & Context

This file documents the system context, guidelines, and behavioral rules used by AI coding agents when building and maintaining CommandOps.

---

## 🎯 System Context & Core Purpose

CommandOps is a Discord Command Operations Center and control plane that bridges Discord slash commands directly into an audited, rule-evaluated, AI-triaged operational dashboard.

### Core Stack
- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Vanilla CSS / Tailwind CSS (Dark Mode, Glassmorphism, Modern UI)
- **Database**: PostgreSQL (Prisma ORM with Neon / Supabase compatibility)
- **Security**: Ed25519 signature verification (`tweetnacl`), JWT auth (`jose`), `bcryptjs`
- **AI Triage**: Google Gemini API (`@google/generative-ai`) + Fallback Heuristic Provider
- **Testing**: Vitest test runner

---

## 🔒 Security & Reliability Rules

1. **Ed25519 Request Verification**: Every request to `/api/discord/interactions` MUST verify `X-Signature-Ed25519` and `X-Signature-Timestamp` headers against `DISCORD_PUBLIC_KEY` before processing. Unsigned/forged requests return HTTP 401.
2. **Sub-20ms Instant ACK**: Applications commands (`/status`, `/report`) return Discord's deferred response (`{ type: 5 }`) immediately (<20ms). Heavy work (Rule Engine, Gemini AI, Webhook mirror, DB writes) executes asynchronously using `@vercel/functions` `waitUntil()` and Next.js `after()`.
3. **Idempotency & Deduplication**: Interaction IDs (`payload.id`) are checked against an in-memory set and persisted in PostgreSQL with unique constraints to prevent duplicate command executions.
4. **Advisory AI Isolation**: AI failure or quota errors MUST never block command completion. AI predictions are advisory annotations.
5. **No Secret Exposure**: Never log or expose secrets (`DISCORD_BOT_TOKEN`, `DISCORD_PUBLIC_KEY`, `JWT_SECRET`, database passwords) in logs, client code, or git repository.
6. **No Fake Telemetry**: Latency tracking measures real server-side ACK response time (`ackProcessingMs`), command processing time (`commandProcessingMs`), and follow-up time (`followupMs`).

---

## 🧪 Verification & Quality Bar

- All changes must pass `npm test` (Vitest suite) and `npm run build` cleanly before committing.
- Database operations must fall back gracefully to in-memory store in offline/test environments.
