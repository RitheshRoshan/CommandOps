# ADR-005: Advisory AI Triage Provider Abstraction

## Status
Accepted

## Context
Integrating AI LLMs for incident triage can introduce unpredictable latency, rate limits, or potential hallucinated authorization bypasses.

## Decision
1. **Isolated Provider Interface**: AI logic is encapsulated under an `AIProvider` interface (`GeminiAIProvider` and `FallbackAIProvider`).
2. **Advisory Role**: AI predictions are strictly advisory metadata and never alter authorization decisions or security policies.
3. **Graceful Degraded Mode**: If AI is offline, command execution succeeds with explicit UI messaging: `"AI enrichment unavailable — command processed without AI."`
