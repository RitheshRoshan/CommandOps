import { describe, it, expect, vi } from "vitest";
import nacl from "tweetnacl";
import { verifyDiscordSignature } from "../src/lib/discord/verifier";
import { DiscordDispatcher } from "../src/lib/discord/dispatcher";
import { sendDiscordFollowup } from "../src/lib/discord/followup";

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

  it("5. Slash command /status returns immediate Deferred ACK (Type 5)", async () => {
    const result = await DiscordDispatcher.handleInteraction({
      id: `status_${Date.now()}_${Math.random()}`,
      type: 2,
      data: { name: "status" },
      user: { id: "u1", username: "tester" },
    });
    expect(result.type).toBe(5);
  });

  it("6. /status background processing executes successfully and builds status embed", async () => {
    const result = await DiscordDispatcher.handleInteraction(
      {
        id: `status_bg_${Date.now()}_${Math.random()}`,
        type: 2,
        data: { name: "status" },
        user: { id: "u1", username: "tester" },
      },
      { awaitBackground: true }
    );
    expect(result.type).toBe(5);
    expect(result.data.embeds[0].title).toContain("CommandOps Status");
  });

  it("7. /report slash command returns Modal trigger (Type 9)", async () => {
    const result = await DiscordDispatcher.handleInteraction({
      id: `report_trig_${Date.now()}_${Math.random()}`,
      type: 2,
      data: { name: "report" },
    });
    expect(result.type).toBe(9);
    expect(result.data.custom_id).toBe("report_modal");
  });

  it("8. /report modal submission returns immediate Deferred ACK (Type 5)", async () => {
    const result = await DiscordDispatcher.handleInteraction({
      id: `report_sub_${Date.now()}_${Math.random()}`,
      type: 5,
      data: {
        custom_id: "report_modal",
        components: [
          {
            type: 1,
            components: [
              { type: 4, custom_id: "report_title", value: "Database replication lag" },
            ],
          },
          {
            type: 1,
            components: [
              { type: 4, custom_id: "report_desc", value: "Read replicas lagging behind primary postgres node." },
            ],
          },
        ],
      },
      user: { id: "u2", username: "dev_ops" },
    });
    expect(result.type).toBe(5);
  });

  it("9. Unknown slash command is handled safely", async () => {
    const result = await DiscordDispatcher.handleInteraction({
      id: `unknown_${Date.now()}_${Math.random()}`,
      type: 2,
      data: { name: "unknown_command" },
    });
    expect(result.type).toBe(4);
    expect(result.data.content).toContain("Unknown command");
  });

  it("10. Discord follow-up handler gracefully completes for simulated tokens", async () => {
    const followupRes = await sendDiscordFollowup("123456", "sim_token_xyz", {
      content: "Test follow-up payload",
    });
    expect(followupRes.success).toBe(true);
  });
});
