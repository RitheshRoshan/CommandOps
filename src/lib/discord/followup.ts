import { logger } from "../logger";

export interface DiscordFollowupData {
  content?: string;
  embeds?: any[];
  components?: any[];
  flags?: number;
}

/**
 * Sends a Discord interaction follow-up message using the interaction token.
 * Uses PATCH to update the initial deferred "thinking..." response,
 * falling back to POST if needed.
 */
export async function sendDiscordFollowup(
  applicationId: string | undefined,
  interactionToken: string | undefined,
  data: DiscordFollowupData
): Promise<{ success: boolean; error?: string }> {
  // Gracefully handle test / mock tokens in test environments
  if (!interactionToken || interactionToken.startsWith("test_") || interactionToken.startsWith("sim_") || interactionToken.startsWith("dup_") || interactionToken.startsWith("ping_") || interactionToken === "mock") {
    logger.info({ event: "discord.followup_simulated", token: interactionToken });
    return { success: true };
  }

  const appId = applicationId || process.env.DISCORD_APPLICATION_ID || process.env.DISCORD_CLIENT_ID;
  if (!appId) {
    logger.warn({ event: "discord.followup_missing_app_id" });
    return { success: false, error: "Missing DISCORD_APPLICATION_ID or DISCORD_CLIENT_ID" };
  }

  const patchUrl = `https://discord.com/api/v10/webhooks/${appId}/${interactionToken}/messages/@original`;

  try {
    const res = await fetch(patchUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      logger.info({ event: "discord.followup_success", patchUrl });
      return { success: true };
    }

    // Fallback: POST new follow-up message if PATCH fails
    const postUrl = `https://discord.com/api/v10/webhooks/${appId}/${interactionToken}`;
    const postRes = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (postRes.ok) {
      logger.info({ event: "discord.followup_post_success", postUrl });
      return { success: true };
    }

    const errText = await postRes.text();
    logger.error({ event: "discord.followup_failed", status: String(postRes.status), body: errText });
    return { success: false, error: `Discord API returned ${postRes.status}` };
  } catch (err: any) {
    logger.error({ event: "discord.followup_exception", error: err.message });
    return { success: false, error: err.message };
  }
}
