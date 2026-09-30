export interface RuleCondition {
  field: "commandName" | "severity" | "category" | "subcommand" | "username";
  operator: "EQUALS" | "NOT_EQUALS" | "IN" | "CONTAINS";
  value: string | string[];
}

export interface RuleDefinition {
  id: string;
  serverId: string;
  name: string;
  description?: string;
  commandName: string;
  conditions: RuleCondition[];
  actions: Array<"PERSIST" | "RESPOND_DISCORD" | "MIRROR_NOTIFICATION" | "CREATE_ALERT" | "AI_ENRICHMENT">;
  priority: number;
  isEnabled: boolean;
}

export interface EvaluateCommandInput {
  serverId: string;
  commandName: string;
  severity?: string;
  category?: string;
  subcommand?: string;
  username?: string;
}

export interface RuleMatchResult {
  matchedRule: RuleDefinition | null;
  executedActions: string[];
}

export class RuleEngine {
  /**
   * Evaluates a command against a list of active rules for a server.
   * Higher priority rules (lower numerical priority value or sorted descending by priority score) are evaluated first.
   */
  static evaluate(input: EvaluateCommandInput, rules: RuleDefinition[]): RuleMatchResult {
    // Filter enabled rules for the given server and command (or global '*' rules)
    const matchingCandidateRules = rules
      .filter(
        (r) =>
          r.isEnabled &&
          (r.serverId === input.serverId || r.serverId === "*") &&
          (r.commandName === input.commandName || r.commandName === "*")
      )
      .sort((a, b) => b.priority - a.priority); // Highest priority first

    for (const rule of matchingCandidateRules) {
      if (RuleEngine.matchesConditions(input, rule.conditions)) {
        return {
          matchedRule: rule,
          executedActions: rule.actions,
        };
      }
    }

    // Default Fallback Rule if no custom rule matches
    const defaultActions: Array<"PERSIST" | "RESPOND_DISCORD" | "MIRROR_NOTIFICATION" | "AI_ENRICHMENT"> = [
      "PERSIST",
      "RESPOND_DISCORD",
    ];

    if (input.commandName === "report") {
      defaultActions.push("AI_ENRICHMENT");
      defaultActions.push("MIRROR_NOTIFICATION");
    }

    return {
      matchedRule: {
        id: "default-rule",
        serverId: input.serverId,
        name: "Default System Rule",
        commandName: input.commandName,
        conditions: [],
        actions: defaultActions,
        priority: 0,
        isEnabled: true,
      },
      executedActions: defaultActions,
    };
  }

  private static matchesConditions(input: EvaluateCommandInput, conditions: RuleCondition[]): boolean {
    if (!conditions || conditions.length === 0) return true;

    for (const cond of conditions) {
      const actualValue = input[cond.field as keyof EvaluateCommandInput];

      if (actualValue === undefined || actualValue === null) {
        return false;
      }

      switch (cond.operator) {
        case "EQUALS":
          if (String(actualValue).toUpperCase() !== String(cond.value).toUpperCase()) return false;
          break;
        case "NOT_EQUALS":
          if (String(actualValue).toUpperCase() === String(cond.value).toUpperCase()) return false;
          break;
        case "IN":
          const allowedList = Array.isArray(cond.value)
            ? cond.value.map((v) => String(v).toUpperCase())
            : [String(cond.value).toUpperCase()];
          if (!allowedList.includes(String(actualValue).toUpperCase())) return false;
          break;
        case "CONTAINS":
          if (!String(actualValue).toLowerCase().includes(String(cond.value).toLowerCase())) return false;
          break;
        default:
          return false;
      }
    }

    return true;
  }
}
