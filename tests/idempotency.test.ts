import { describe, it, expect } from "vitest";
import { DiscordDispatcher } from "../src/lib/discord/dispatcher";

describe("Idempotency & Replay Protection", () => {
  it("Blocks duplicate interaction processing when same interaction ID is delivered twice", async () => {
    const duplicateId = `dup_int_${Date.now()}`;

    const payload = {
      id: duplicateId,
      type: 2,
      data: { name: "status" },
      user: { id: "user_dup", username: "duplicate_tester" },
    };

    // First attempt should return Deferred ACK (Type 5)
    const res1 = await DiscordDispatcher.handleInteraction(payload);
    expect(res1.type).toBe(5);

    // Second attempt with same interaction ID must be blocked as duplicate (Type 4)
    const res2 = await DiscordDispatcher.handleInteraction(payload);
    expect(res2.type).toBe(4);
    expect(res2.data.content).toContain("Duplicate interaction");
  });
});
