import { describe, it, expect } from "vitest";
import { RuleEngine, RuleDefinition } from "../src/lib/rules/engine";

describe("Rule Engine Evaluation Tests", () => {
  const customRule: RuleDefinition = {
    id: "rule-high-incidents",
    serverId: "server-alpha",
    name: "High Severity Incident Pipeline",
    commandName: "report",
    priority: 200,
    isEnabled: true,
    conditions: [
      { field: "severity", operator: "IN", value: ["HIGH", "CRITICAL"] },
    ],
    actions: ["PERSIST", "RESPOND_DISCORD", "MIRROR_NOTIFICATION", "AI_ENRICHMENT"],
  };

  it("Matches custom rule when conditions match severity HIGH", () => {
    const result = RuleEngine.evaluate(
      {
        serverId: "server-alpha",
        commandName: "report",
        severity: "HIGH",
      },
      [customRule]
    );

    expect(result.matchedRule?.id).toBe("rule-high-incidents");
    expect(result.executedActions).toContain("MIRROR_NOTIFICATION");
    expect(result.executedActions).toContain("AI_ENRICHMENT");
  });

  it("Falls back to default rule when severity does not match custom rule condition", () => {
    const result = RuleEngine.evaluate(
      {
        serverId: "server-alpha",
        commandName: "report",
        severity: "LOW",
      },
      [customRule]
    );

    expect(result.matchedRule?.id).toBe("default-rule");
  });
});
