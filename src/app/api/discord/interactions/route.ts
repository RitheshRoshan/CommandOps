import { NextRequest, NextResponse } from "next/server";
import { verifyDiscordSignature } from "@/lib/discord/verifier";
import { DiscordDispatcher } from "@/lib/discord/dispatcher";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const requestReceivedAt = Date.now();
  const signature = req.headers.get("x-signature-ed25519");
  const timestamp = req.headers.get("x-signature-timestamp");

  const rawBody = await req.text();

  // Validate Ed25519 signature (Requirement 2 & 11)
  const isValid = verifyDiscordSignature({
    body: rawBody,
    signature,
    timestamp,
  });

  const signatureVerifiedAt = Date.now();

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

  // Handle interaction via gateway pipeline with exact server request timestamps
  const result = await DiscordDispatcher.handleInteraction(payload, {
    requestReceivedAt,
    signatureVerifiedAt,
  });

  return NextResponse.json(result);
}
