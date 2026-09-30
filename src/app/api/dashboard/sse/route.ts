import { NextRequest } from "next/server";
import { sseManager } from "@/lib/sse-manager";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      const send = (data: string) => {
        try {
          controller.enqueue(new TextEncoder().encode(data));
        } catch (e) {
          // Stream closed
        }
      };

      // Send initial connection heartbeat
      send(`event: connected\ndata: ${JSON.stringify({ connectedAt: new Date().toISOString() })}\n\n`);

      const unsubscribe = sseManager.subscribe(send);

      req.signal.addEventListener("abort", () => {
        unsubscribe();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
