# ADR-006: Server-Sent Events (SSE) for Real-Time Live Updates

## Status
Accepted

## Context
The operations dashboard requires real-time streaming of incoming command executions.

## Decision
We chose Server-Sent Events (SSE) via `/api/dashboard/sse` over WebSockets.

## Rationale
1. **HTTP/2 Native**: SSE runs over standard HTTP, simplifying load balancer and proxy setup.
2. **Unidirectional Stream**: Live command updates move server-to-client. SSE is lighter and easier to maintain than full duplex WebSockets.
3. **Automatic Reconnection**: Browsers natively auto-reconnect SSE streams if connection drops.
