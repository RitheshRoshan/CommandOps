# AI_NOTES.md — Engineering & AI Co-Pilot Reflections

## AI Tools Used
- **Gemini 3.6 Flash (High)** co-pilot agent for architecture scaffolding, code generation, and test suite implementation.

## What AI Generated
- Initial database schema definition in `prisma/schema.prisma`.
- Tailwind styling classes and component templates for the operations dashboard.
- Test runner cases in `tests/`.

## What I Designed Myself
- **Secure Interaction Gateway & Ed25519 Verification**: Designed the raw body preservation and cryptographic signature verification pipeline using `tweetnacl`.
- **Decoupled Rule Engine Architecture**: Designed the priority-based condition evaluator (`RuleEngine.evaluate`) ensuring rule matching doesn't pollute Discord interaction handlers.
- **Advisory AI Provider Abstraction**: Designed the `AIProvider` interface (`GeminiAIProvider` / `FallbackAIProvider`) to prevent AI latency or quota errors from failing the core command flow.
- **Idempotency & Replay Protection**: Engineered unique constraints on `interaction_id` at the PostgreSQL storage layer.

## Key Architectural Decisions

### Decision 1: HTTP Interaction Gateway over Discord.js WebSocket
- **Why**: Allows the application to be deployed statelessly on serverless infrastructure (Vercel, Render, Cloudflare) with zero long-running WebSocket daemon overhead.

### Decision 2: Advisory AI Triage vs Authoritative Authorization
- **Why**: LLM predictions can hallucinate or suffer from API rate limits. Keeping AI advisory guarantees deterministic rule authorization and 100% command reliability.

### Decision 3: Server-Sent Events (SSE) for Dashboard Live Updates
- **Why**: Unidirectional streaming over standard HTTP/2 provides real-time event updates to the dashboard without WebSocket connection complexity.

## Hardest Bug / Edge Case Discovered & Resolved
- **Edge Case**: Discord Modal submissions submit fields as nested component action rows (`payload.data.components[i].components[j]`).
- **Fix**: Implemented recursive parameter extraction in `DiscordDispatcher.handleReportModalSubmit` to safely extract custom input values (`report_title`, `report_desc`, `report_severity`, `report_category`) regardless of component indexing.

## What I Would Improve With More Time
1. Implement Redis / Upstash rate limiting on public interaction endpoints.
2. Add Webhook signature validation for Slack mirror destinations.
3. Build visual workflow node canvas for the Rule Builder.
