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

    // First attempt should succeed
    const res1 = await DiscordDispatcher.handleInteraction(payload);
    expect(res1.type).toBe(4);
    expect(res1.data.embeds?.[0]?.title).toContain("Status");

    // Second attempt with same interaction ID must be blocked as duplicate
    const res2 = await DiscordDispatcher.handleInteraction(payload);
    expect(res2.type).toBe(4);
    expect(res2.data.content).toContain("Duplicate interaction");
  });
});
