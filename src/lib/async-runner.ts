import { waitUntil } from "@vercel/functions";
import { after } from "next/server";
import { logger } from "./logger";

/**
 * Executes background tasks safely in Vercel serverless functions.
 * Uses `@vercel/functions` waitUntil() and Next.js after() to guarantee
 * the serverless lambda function remains active until background processing completes.
 */
export function runBackgroundWork(task: () => Promise<void>): void {
  const promise = task().catch((e) => {
    logger.error({
      event: "background_task.uncaught_error",
      error: e.message || String(e),
    });
  });

  try {
    waitUntil(promise);
  } catch {
    try {
      after(() => promise);
    } catch {
      // Promise is executing directly
    }
  }
}
