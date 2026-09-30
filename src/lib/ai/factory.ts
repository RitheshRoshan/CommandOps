import { AIProvider } from "./interface";
import { GeminiAIProvider } from "./gemini-provider";
import { FallbackAIProvider } from "./fallback-provider";

export function getAIProvider(): AIProvider {
  const gemini = new GeminiAIProvider();
  if (gemini.isAvailable()) {
    return gemini;
  }
  return new FallbackAIProvider();
}
