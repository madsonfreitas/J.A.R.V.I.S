import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";
import type { AppConfig } from "../config.js";
import type { DocumentaryIntelligencePort } from "../documentary/intelligence-port.js";
import { AnthropicIntelligence } from "./anthropic-intelligence.js";
import { GeminiIntelligence } from "./gemini-intelligence.js";

export function createIntelligence(
  config: AppConfig,
): DocumentaryIntelligencePort {
  if (config.provider === "gemini") {
    return new GeminiIntelligence(
      new GoogleGenAI({ apiKey: config.geminiApiKey }),
      config.model,
      config.geminiApiKey,
    );
  }

  return new AnthropicIntelligence(
    new Anthropic({ apiKey: config.anthropicApiKey }),
    config.model,
  );
}
