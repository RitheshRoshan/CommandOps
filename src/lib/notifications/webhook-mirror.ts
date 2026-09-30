import { logger } from "../logger";

export interface DeliverMirrorOptions {
  webhookUrl: string;
  commandExecutionId: string;
  correlationId: string;
  commandName: string;
  title?: string;
  description?: string;
  severity?: string;
  category?: string;
  aiSummary?: string;
  username: string;
  maxAttempts?: number;
}

export interface DeliveryResult {
  success: boolean;
  attempts: number;
  lastError?: string;
  sentAt?: Date;
}

export class NotificationMirrorService {
  /**
   * Delivers a mirrored event notification to a Discord/Slack Webhook with bounded exponential backoff retries.
   */
  static async deliverWithRetry(options: DeliverMirrorOptions): Promise<DeliveryResult> {
    const maxAttempts = options.maxAttempts || 3;
    let attempts = 0;
    let lastError = "";

    const payload = NotificationMirrorService.buildDiscordEmbedPayload(options);

    while (attempts < maxAttempts) {
      attempts++;
      try {
        const response = await fetch(options.webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(4000), // 4 second timeout per HTTP attempt
        });

        if (response.ok || response.status === 204) {
          logger.info({
            event: "mirror_notification.delivered",
            correlationId: options.correlationId,
            commandExecutionId: options.commandExecutionId,
            attempts,
          });
          return { success: true, attempts, sentAt: new Date() };
        }

        const errText = await response.text();
        lastError = `HTTP ${response.status}: ${errText.slice(0, 100)}`;
      } catch (err: any) {
        lastError = err.message || "Network request failed";
      }

      logger.warn({
        event: "mirror_notification.attempt_failed",
        correlationId: options.correlationId,
        attempt: attempts,
        error: lastError,
      });

      // Exponential backoff if more attempts remain
      if (attempts < maxAttempts) {
        const backoffMs = Math.pow(2, attempts) * 100; // 200ms, 400ms...
        await new Promise((r) => setTimeout(r, backoffMs));
      }
    }

    logger.error({
      event: "mirror_notification.exhausted",
      correlationId: options.correlationId,
      attempts,
      error: lastError,
    });

    return {
      success: false,
      attempts,
      lastError: `Exhausted ${maxAttempts} retry attempts. Last error: ${lastError}`,
    };
  }

  private static buildDiscordEmbedPayload(opts: DeliverMirrorOptions) {
    const severityColors: Record<string, number> = {
      LOW: 0x3b82f6, // Blue
      MEDIUM: 0xf59e0b, // Amber
      HIGH: 0xef4444, // Red
      CRITICAL: 0x991b1b, // Dark Red
    };

    const color = severityColors[opts.severity || "MEDIUM"] || 0x3b82f6;

    return {
      username: "CommandOps Mirror",
      avatar_url: "https://commandops.io/icon.png",
      embeds: [
        {
          title: `📢 Mirror Notification: /${opts.commandName}`,
          description: opts.description || opts.title || "Operational event logged.",
          color: color,
          fields: [
            { name: "Correlation ID", value: `\`${opts.correlationId}\``, inline: true },
            { name: "Severity", value: opts.severity || "MEDIUM", inline: true },
            { name: "Category", value: opts.category || "OTHER", inline: true },
            { name: "Submitted By", value: `@${opts.username}`, inline: true },
            { name: "AI Summary", value: opts.aiSummary || "_No AI summary available_", inline: false },
          ],
          footer: {
            text: "CommandOps Operational Control Plane",
          },
          timestamp: new Date().toISOString(),
        },
      ],
    };
  }
}
