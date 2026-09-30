import { after } from "next/server";
import { logger } from "./logger";

/**
 * Executes background tasks safely in Vercel serverless functions.
 * Uses Next.js `after()` to ensure the lambda execution context remains active
 * until the background task completes, after returning the initial response to the client.
 */
export function runBackgroundWork(task: () => Promise<void>): void {
  try {
    after(task);
  } catch (err) {
    // Fallback for non-Next environments (e.g., Vitest test runner)
    task().catch((e) => {
      logger.error({
        event: "background_task.uncaught_error",
        error: e.message || String(e),
      });
    });
  }
}
