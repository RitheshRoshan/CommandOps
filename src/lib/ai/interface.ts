export interface AIReportInput {
  title: string;
  description: string;
  userProvidedSeverity?: string;
  userProvidedCategory?: string;
}

export interface AIReportAnalysis {
  summary: string;
  suggestedCategory: "BUG" | "INCIDENT" | "REQUEST" | "PAYMENT" | "INFRASTRUCTURE" | "OTHER";
  suggestedSeverity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  extractedTags: string[];
  providerName: string;
  latencyMs: number;
  rawResponse?: any;
}

export interface AIProvider {
  name: string;
  isAvailable(): boolean;
  analyzeReport(input: AIReportInput): Promise<AIReportAnalysis>;
}
