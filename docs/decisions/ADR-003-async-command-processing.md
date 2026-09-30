# ADR-003: Asynchronous Command Execution Pipeline

## Status
Accepted

## Context
Discord enforces a strict ~3-second response window for interaction webhooks. Downstream actions like AI triage LLM inference or mirror webhook HTTP calls can exceed 3 seconds under network stress.

## Decision
We separate interaction acknowledgement from downstream action execution:
1. Fast Path (<50ms): Validate signature, verify idempotency, return initial Discord response (or Modal trigger).
2. Asynchronous Execution Pipeline: Execute Rule Engine, AI Triage, Mirror Delivery, and DB Persistence in background promises without blocking Discord.

## Rationale
Prevents Discord interaction timeouts (HTTP 504) while guaranteeing 100% downstream action completion.
