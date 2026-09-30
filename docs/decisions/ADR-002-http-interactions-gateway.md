# ADR-002: HTTP Interaction Endpoint vs Persistent Gateway WebSockets

## Status
Accepted

## Context
Discord interaction models offer two main paradigms:
1. Persistent Gateway WebSocket connection (discord.js bot process).
2. HTTP Interactions Endpoint (webhook push model).

## Decision
We chose the HTTP Interactions Endpoint (`POST /api/discord/interactions`).

## Rationale
1. **Serverless & Edge Ready**: Allows CommandOps backend to run statelessly on serverless functions (Vercel, Cloudflare, Render) without maintaining long-lived WebSocket daemons.
2. **Security Verification**: Forces explicit Ed25519 signature verification on every HTTP request header, ensuring zero forged requests reach the backend.
3. **Sub-Second Latency**: Directly returns fast HTTP responses within Discord's 3-second acknowledgement window.
