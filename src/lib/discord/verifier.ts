import nacl from "tweetnacl";

export interface VerifySignatureOptions {
  body: string;
  signature: string | null;
  timestamp: string | null;
  publicKey?: string;
}

/**
 * Validates Discord interaction Ed25519 request signature.
 * Returns true if valid, false otherwise.
 */
export function verifyDiscordSignature({
  body,
  signature,
  timestamp,
  publicKey = process.env.DISCORD_PUBLIC_KEY,
}: VerifySignatureOptions): boolean {
  if (!signature || !timestamp) {
    return false;
  }

  // If public key is not configured or set to placeholder in test environment, allow mock signatures for local manual test tools if explicitly configured
  const activeKey = publicKey || process.env.DISCORD_PUBLIC_KEY;
  if (!activeKey) {
    return false;
  }

  try {
    const signatureBuffer = Buffer.from(signature, "hex");
    const publicKeyBuffer = Buffer.from(activeKey, "hex");
    const messageBuffer = Buffer.from(timestamp + body, "utf8");

    if (signatureBuffer.length !== nacl.sign.signatureLength) {
      return false;
    }
    if (publicKeyBuffer.length !== nacl.sign.publicKeyLength) {
      return false;
    }

    return nacl.sign.detached.verify(messageBuffer, signatureBuffer, publicKeyBuffer);
  } catch (error) {
    return false;
  }
}
