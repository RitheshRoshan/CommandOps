# CommandOps — Architecture Specification

## Overview

CommandOps is an enterprise-shaped operations control plane where Discord acts as the command interface and the web application acts as the operational control plane.

```
Discord User
    ↓
Slash Command (/status, /report)
    ↓
Discord Interaction Webhook
    ↓
Secure Interaction Gateway (Ed25519 Verification)
    ↓
Idempotency & Replay Protection (interaction_id constraint)
    ↓
Command Dispatcher & Fast Response (<50ms)
    ↓
┌───────────────────────┬──────────────────────┬──────────────────────┐
│                       │                      │                      │
Command Audit Log       Rule Engine            AI Triage Pipeline     Mirror Notification
(PostgreSQL)            (Configurable Engine)  (Gemini Provider)      (Discord/Slack Webhook)
└───────────────────────┴──────────────────────┴──────────────────────┘
                ↓
  CommandOps Operations Console (SSE Stream)
```

## System Components

### 1. Interaction Gateway (`src/lib/discord/verifier.ts` & `src/app/api/discord/interactions/route.ts`)
- Preserves raw request body.
- Verifies Ed25519 signatures using `tweetnacl`.
- Returns HTTP 401 for unauthorized forged signatures.
- Handles Discord PING (`Type 1`) returning PONG (`{ type: 1 }`).

### 2. Idempotency Guard (`src/lib/discord/dispatcher.ts`)
- Stores `interaction_id` in PostgreSQL (`interaction_records` table) with `UNIQUE` constraint.
- Rejects replayed duplicate interactions gracefully.

### 3. Rule Engine (`src/lib/rules/engine.ts`)
- Evaluates matching rules sorted by priority score.
- Evaluates conditions on `commandName`, `severity`, `category`, and `username`.
- Returns action pipeline (`PERSIST`, `RESPOND_DISCORD`, `MIRROR_NOTIFICATION`, `AI_ENRICHMENT`).

### 4. AI Triage Abstraction (`src/lib/ai/`)
- `AIProvider` interface allows swapping AI models (`GeminiAIProvider` and `FallbackAIProvider`).
- Advisory triage results are attached without blocking command execution.

### 5. Notification Delivery (`src/lib/notifications/webhook-mirror.ts`)
- Delivers mirror embeds to secondary webhooks with bounded exponential backoff retries.

### 6. Operations Control Console (`src/app/dashboard/`)
- Dark-mode, high-density operations dashboard with real-time SSE event streaming, execution timelines, rule builder, failure center, and audit trail.
