import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIProvider, AIReportInput, AIReportAnalysis } from "./interface";

export class GeminiAIProvider implements AIProvider {
  name = "gemini";
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.trim().length > 0) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  isAvailable(): boolean {
    return !!this.genAI;
  }

  async analyzeReport(input: AIReportInput): Promise<AIReportAnalysis> {
    const startTime = Date.now();
    if (!this.genAI) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }

    const candidateModels = [
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-flash-latest",
      "gemini-1.5-flash",
      "gemini-2.0-flash-exp",
    ];

    const prompt = `
You are an expert DevOps / Security incident triage assistant for CommandOps.
Analyze the following user operational report submission and return a structured JSON response.

Input:
Title: ${input.title}
Description: ${input.description}
User Provided Severity: ${input.userProvidedSeverity || "NOT_SPECIFIED"}
User Provided Category: ${input.userProvidedCategory || "NOT_SPECIFIED"}

Respond STRICTLY with a valid JSON object matching this schema:
{
  "summary": "Concise 1-sentence operational summary of the issue",
  "suggestedCategory": "BUG" | "INCIDENT" | "REQUEST" | "PAYMENT" | "INFRASTRUCTURE" | "OTHER",
  "suggestedSeverity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "extractedTags": ["tag1", "tag2", "tag3"]
}
`;

    let text: string | null = null;
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        const model = this.genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        text = result.response.text();
        if (text) break;
      } catch (err) {
        lastError = err;
      }
    }

    if (!text) {
      throw lastError || new Error("Failed to generate response from Gemini API.");
    }

    const duration = Date.now() - startTime;

    // Parse JSON safely
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse JSON response from Gemini model.");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      summary: parsed.summary || input.title,
      suggestedCategory: parsed.suggestedCategory || "OTHER",
      suggestedSeverity: parsed.suggestedSeverity || "MEDIUM",
      extractedTags: Array.isArray(parsed.extractedTags) ? parsed.extractedTags : ["incident"],
      providerName: this.name,
      latencyMs: duration,
      rawResponse: parsed,
    };
  }
}
