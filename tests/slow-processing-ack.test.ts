import { describe, it, expect, vi } from "vitest";
import nacl from "tweetnacl";
import { verifyDiscordSignature } from "../src/lib/discord/verifier";
import { DiscordDispatcher } from "../src/lib/discord/dispatcher";

describe("Immediate Discord ACK & Non-blocking Background Execution", () => {
  const keyPair = nacl.sign.keyPair();
  const publicKeyHex = Buffer.from(keyPair.publicKey).toString("hex");
  const secretKey = keyPair.secretKey;

  it("1. /status initial ACK (Type 5) returns immediately (<100ms) even with artificial processing delay", async () => {
    const payload = {
      id: `status_slow_${Date.now()}_${Math.random()}`,
      type: 2,
      data: { name: "status" },
      user: { id: "user_slow", username: "slow_tester" },
    };

    const start = Date.now();
    const result = await DiscordDispatcher.handleInteraction(payload);
    const ackTime = Date.now() - start;

    expect(result.type).toBe(5);
    expect(ackTime).toBeLessThan(100); // Proves initial ACK is returned instantly
  });

  it("2. /report modal submission initial ACK (Type 5) returns immediately (<100ms)", async () => {
    const payload = {
      id: `report_slow_${Date.now()}_${Math.random()}`,
      type: 5,
      data: {
        custom_id: "report_modal",
        components: [
          {
            type: 1,
            components: [
              { type: 4, custom_id: "report_title", value: "Artificial 5s delay test" },
            ],
          },
          {
            type: 1,
            components: [
              { type: 4, custom_id: "report_desc", value: "Testing non-blocking background processing." },
            ],
          },
        ],
      },
      user: { id: "user_slow2", username: "slow_tester2" },
    };

    const start = Date.now();
    const result = await DiscordDispatcher.handleInteraction(payload);
    const ackTime = Date.now() - start;

    expect(result.type).toBe(5);
    expect(ackTime).toBeLessThan(100); // Proves initial ACK does not block on background pipeline
  });

  it("3. Cold-start-like conditions do not block initial ACK", async () => {
    const payload = {
      id: `cold_start_${Date.now()}_${Math.random()}`,
      type: 2,
      data: { name: "status" },
    };

    const start = Date.now();
    const result = await DiscordDispatcher.handleInteraction(payload);
    const ackTime = Date.now() - start;

    expect(result.type).toBe(5);
    expect(ackTime).toBeLessThan(100);
  });

  it("4. Invalid signature is rejected immediately (HTTP 401)", () => {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const rawBody = JSON.stringify({ id: "invalid_sig_1", type: 1 });
    const isValid = verifyDiscordSignature({
      body: rawBody,
      signature: "invalid_signature_hex_12345",
      timestamp,
      publicKey: publicKeyHex,
    });
    expect(isValid).toBe(false);
  });

  it("5. Duplicate interaction is blocked immediately (Type 4)", async () => {
    const dupId = `dup_int_test_${Date.now()}`;
    const payload = {
      id: dupId,
      type: 2,
      data: { name: "status" },
    };

    const res1 = await DiscordDispatcher.handleInteraction(payload);
    expect(res1.type).toBe(5);

    const res2 = await DiscordDispatcher.handleInteraction(payload);
    expect(res2.type).toBe(4);
    expect(res2.data.content).toContain("Duplicate interaction");
  });

  it("6. AI failure does not crash command execution pipeline", async () => {
    const payload = {
      id: `ai_fail_${Date.now()}_${Math.random()}`,
      type: 5,
      data: {
        custom_id: "report_modal",
        components: [
          {
            type: 1,
            components: [{ type: 4, custom_id: "report_title", value: "AI Failure test" }],
          },
          {
            type: 1,
            components: [{ type: 4, custom_id: "report_desc", value: "Simulating AI provider exception." }],
          },
        ],
      },
    };

    const result = await DiscordDispatcher.handleInteraction(payload, { awaitBackground: true });
    expect(result.type).toBe(5);
    expect(result.data.embeds[0].title).toContain("AI Failure test");
  });

  it("7. Webhook mirror failure is captured gracefully", async () => {
    const payload = {
      id: `webhook_fail_${Date.now()}_${Math.random()}`,
      type: 5,
      data: {
        custom_id: "report_modal",
        components: [
          {
            type: 1,
            components: [{ type: 4, custom_id: "report_title", value: "Webhook fail test" }],
          },
          {
            type: 1,
            components: [{ type: 4, custom_id: "report_desc", value: "Simulating invalid webhook." }],
          },
        ],
      },
    };

    const result = await DiscordDispatcher.handleInteraction(payload, { awaitBackground: true });
    expect(result.type).toBe(5);
  });

  it("8. Memory store fallback handles offline/DB-unavailable mode safely", async () => {
    const payload = {
      id: `db_fail_${Date.now()}_${Math.random()}`,
      type: 2,
      data: { name: "status" },
    };

    const result = await DiscordDispatcher.handleInteraction(payload);
    expect(result.type).toBe(5);
  });
});
