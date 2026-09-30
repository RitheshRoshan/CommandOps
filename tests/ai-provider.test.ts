import { describe, it, expect } from "vitest";
import { getAIProvider } from "../src/lib/ai/factory";
import { FallbackAIProvider } from "../src/lib/ai/fallback-provider";

describe("AI Provider Isolation & Fallback Strategy", () => {
  it("FallbackAIProvider classifies payment incidents correctly", async () => {
    const provider = new FallbackAIProvider();
    const result = await provider.analyzeReport({
      title: "Checkout UPI payment failure",
      description: "Users are unable to complete payment using UPI gateway.",
    });

    expect(result.suggestedCategory).toBe("PAYMENT");
    expect(result.suggestedSeverity).toBe("HIGH");
    expect(result.providerName).toBe("fallback-heuristic");
  });

  it("Factory returns functional AI provider", () => {
    const provider = getAIProvider();
    expect(provider.isAvailable()).toBe(true);
  });
});
