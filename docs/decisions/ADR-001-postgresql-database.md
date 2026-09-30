# ADR-001: PostgreSQL as Primary Relational Store

## Status
Accepted

## Context
CommandOps handles structured interaction records, server tenant configurations, rule definitions, command executions, AI triage enrichments, notification deliveries, and audit trails.

## Decision
We selected PostgreSQL (with Prisma ORM) as the primary relational database system.

## Rationale
1. **Strict Idempotency Constraints**: Requires `UNIQUE` database constraints on `interactionId` and `correlationId` to guarantee duplicate protection at the storage engine layer.
2. **Relational Integrity**: Enforces strict foreign keys (`server_id`, `command_execution_id`) to ensure cascade safety and multi-tenant isolation.
3. **JSON Capability**: PostgreSQL provides native JSONB support for raw payload preservation, rule condition arrays, and AI metadata.
4. **Neon / Cloud Compatibility**: Fully compatible with free serverless PostgreSQL platforms like Neon and local Docker setups.
