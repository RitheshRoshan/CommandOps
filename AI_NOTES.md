# AI_NOTES.md — Engineering & AI Co-Pilot Reflections

## AI Tools Used
- **Gemini 3.6 Flash (High)** co-pilot agent for architecture scaffolding, code generation, and test suite implementation.
- Context and behavioral guidelines maintained in [`AGENTS.md`](AGENTS.md).

## What AI Generated
- Initial database schema definition in `prisma/schema.prisma`.
- Tailwind styling classes and component templates for the operations dashboard.
- Test runner cases in `tests/` (`gateway.test.ts`, `slow-processing-ack.test.ts`, `idempotency.test.ts`).

## What I Designed Myself
- **Secure Interaction Gateway & Ed25519 Verification**: Designed the raw body preservation and cryptographic signature verification pipeline using `tweetnacl`.
- **Sub-20ms Instant ACK & Vercel Background Runner**: Designed zero-DB blocking ACK path returning `{ type: 5 }` immediately while executing heavy pipeline steps via `@vercel/functions` `waitUntil()` and Next.js `after()`.
- **Decoupled Rule Engine Architecture**: Designed the priority-based condition evaluator (`RuleEngine.evaluate`) ensuring rule matching doesn't pollute Discord interaction handlers.
- **Advisory AI Provider Abstraction**: Designed the `AIProvider` interface (`GeminiAIProvider` / `FallbackAIProvider`) to prevent AI latency or quota errors from failing the core command flow.
- **Idempotency & Replay Protection**: Engineered in-memory fast set + unique constraints on `interaction_id` at the PostgreSQL storage layer.

## Key Architectural Decisions

### Decision 1: HTTP Interaction Gateway over Discord.js WebSocket
- **Why**: Allows the application to be deployed statelessly on serverless infrastructure (Vercel, Render, Cloudflare) with zero long-running WebSocket daemon overhead.

### Decision 2: Sub-20ms Deferred ACK ({ type: 5 }) + Interaction Follow-up
- **Why**: Discord enforces a strict ~3-second HTTP response deadline. Returning `{ type: 5 }` instantly (<20ms) and patching the original message via Discord interaction webhook prevents `"The application did not respond"` timeouts during cold starts or AI processing.

### Decision 3: Advisory AI Triage vs Authoritative Authorization
- **Why**: LLM predictions can hallucinate or suffer from API rate limits. Keeping AI advisory guarantees deterministic rule authorization and 100% command reliability.

### Decision 4: Server-Sent Events (SSE) for Dashboard Live Updates
- **Why**: Unidirectional streaming over standard HTTP/2 provides real-time event updates to the dashboard without WebSocket connection complexity.

## Hardest Bug / Edge Case Discovered & Resolved
- **Edge Case**: Discord interaction timeouts in serverless environments. Initial implementation was running 4 synchronous database queries (`isDbConnected()`, `findUnique()`, `create()`, `upsert()`) before returning `{ type: 5 }`. When database connections were cold or sleeping, these 4 synchronous DB queries took ~3,200ms, exceeding Discord's 3-second limit.
- **Fix**: Stripped all database connections and network calls from the initial ACK response path. Implemented a sub-millisecond in-memory Set (`checkAndRecordFastIdempotency`) for fast idempotency, moving DB writes into the asynchronous `@vercel/functions` `waitUntil()` background task. ACK response time dropped from ~3,200ms to **~14ms**.

## What I Would Improve With More Time
1. Implement Redis / Upstash rate limiting on public interaction endpoints.
2. Add Webhook signature validation for Slack mirror destinations.
3. Build visual workflow node canvas for the Rule Builder.
