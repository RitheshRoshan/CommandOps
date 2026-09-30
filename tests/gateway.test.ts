import { describe, it, expect, beforeEach } from "vitest";
import nacl from "tweetnacl";
import { verifyDiscordSignature } from "../src/lib/discord/verifier";
import { DiscordDispatcher } from "../src/lib/discord/dispatcher";

describe("Discord Interaction Gateway & Ed25519 Security", () => {
  const keyPair = nacl.sign.keyPair();
  const publicKeyHex = Buffer.from(keyPair.publicKey).toString("hex");
  const secretKey = keyPair.secretKey;

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const rawBody = JSON.stringify({ id: "test_int_101", type: 1 });
  const messageBuffer = Buffer.from(timestamp + rawBody, "utf8");
  const signatureHex = Buffer.from(nacl.sign.detached(messageBuffer, secretKey)).toString("hex");

  it("1. Valid Ed25519 signature is accepted", () => {
    const isValid = verifyDiscordSignature({
      body: rawBody,
      signature: signatureHex,
      timestamp,
      publicKey: publicKeyHex,
    });
    expect(isValid).toBe(true);
  });

  it("2. Invalid Ed25519 signature is rejected", () => {
    const bogusSignature = "a".repeat(128);
    const isValid = verifyDiscordSignature({
      body: rawBody,
      signature: bogusSignature,
      timestamp,
      publicKey: publicKeyHex,
    });
    expect(isValid).toBe(false);
  });

  it("3. Missing signature or timestamp is rejected", () => {
    const missingSig = verifyDiscordSignature({
      body: rawBody,
      signature: null,
      timestamp,
      publicKey: publicKeyHex,
    });
    const missingTime = verifyDiscordSignature({
      body: rawBody,
      signature: signatureHex,
      timestamp: null,
      publicKey: publicKeyHex,
    });
    expect(missingSig).toBe(false);
    expect(missingTime).toBe(false);
  });

  it("4. PING returns PONG (Type 1)", async () => {
    const result = await DiscordDispatcher.handleInteraction({
      id: `ping_${Date.now()}`,
      type: 1,
    });
    expect(result).toEqual({ type: 1 });
  });

  it("5. Slash command /status routes correctly and responds with fast path embed", async () => {
    const result = await DiscordDispatcher.handleInteraction({
      id: `status_${Date.now()}`,
      type: 2,
      data: { name: "status" },
      user: { id: "u1", username: "tester" },
    });
    expect(result.type).toBe(4);
    expect(result.data.embeds[0].title).toContain("CommandOps Status");
  });

  it("6. Unknown slash command is handled safely", async () => {
    const result = await DiscordDispatcher.handleInteraction({
      id: `unknown_${Date.now()}`,
      type: 2,
      data: { name: "unknown_command" },
    });
    expect(result.type).toBe(4);
    expect(result.data.content).toContain("Unknown command");
  });
});
