import { AIProvider, AIReportInput, AIReportAnalysis } from "./interface";

export class FallbackAIProvider implements AIProvider {
  name = "fallback-heuristic";

  isAvailable(): boolean {
    return true;
  }

  async analyzeReport(input: AIReportInput): Promise<AIReportAnalysis> {
    const startTime = Date.now();
    const text = `${input.title} ${input.description}`.toLowerCase();

    // Heuristic Category Classification
    let category: "BUG" | "INCIDENT" | "REQUEST" | "PAYMENT" | "INFRASTRUCTURE" | "OTHER" = "OTHER";
    if (text.includes("payment") || text.includes("checkout") || text.includes("stripe") || text.includes("upi")) {
      category = "PAYMENT";
    } else if (text.includes("server") || text.includes("db") || text.includes("database") || text.includes("network") || text.includes("down") || text.includes("outage")) {
      category = "INFRASTRUCTURE";
    } else if (text.includes("bug") || text.includes("error") || text.includes("fail") || text.includes("crash") || text.includes("exception")) {
      category = "BUG";
    } else if (text.includes("feature") || text.includes("request") || text.includes("add") || text.includes("improve")) {
      category = "REQUEST";
    } else if (text.includes("incident") || text.includes("urgent")) {
      category = "INCIDENT";
    }

    // Heuristic Severity Classification
    let severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "MEDIUM";
    if (text.includes("critical") || text.includes("outage") || text.includes("down") || text.includes("p0") || text.includes("data loss")) {
      severity = "CRITICAL";
    } else if (text.includes("high") || text.includes("payment") || text.includes("blocking") || text.includes("urgent") || text.includes("p1")) {
      severity = "HIGH";
    } else if (text.includes("low") || text.includes("minor") || text.includes("typo") || text.includes("cosmetic")) {
      severity = "LOW";
    }

    // Extract basic tags
    const words = text
      .replace(/[^\w\s]/gi, "")
      .split(/\s+/)
      .filter((w) => w.length > 3);
    const tags = Array.from(new Set(words)).slice(0, 4);

    return {
      summary: `[Fallback Triage] ${input.title.trim()} — ${category} issue identified.`,
      suggestedCategory: category,
      suggestedSeverity: severity,
      extractedTags: tags.length > 0 ? tags : ["operational-report"],
      providerName: this.name,
      latencyMs: Date.now() - startTime,
    };
  }
}
