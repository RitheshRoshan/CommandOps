import { NextRequest, NextResponse } from "next/server";
import { verifyDiscordSignature } from "@/lib/discord/verifier";
import { DiscordDispatcher } from "@/lib/discord/dispatcher";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-signature-ed25519");
  const timestamp = req.headers.get("x-signature-timestamp");

  const rawBody = await req.text();

  // Validate Ed25519 signature (Requirement 6)
  const isValid = verifyDiscordSignature({
    body: rawBody,
    signature,
    timestamp,
  });

  if (!isValid) {
    logger.warn({
      event: "discord.invalid_signature",
      signature: signature ? "provided" : "missing",
      timestamp: timestamp ? "provided" : "missing",
    });
    return NextResponse.json({ error: "Invalid request signature" }, { status: 401 });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  // Handle interaction via gateway pipeline
  const result = await DiscordDispatcher.handleInteraction(payload);

  return NextResponse.json(result);
}
