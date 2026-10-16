import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import type { AppConfig } from "../config.js";
import type { DocumentaryIntelligencePort } from "../documentary/intelligence-port.js";
import { AnthropicIntelligence } from "./anthropic-intelligence.js";
import { GeminiIntelligence } from "./gemini-intelligence.js";
import {
  GROQ_BASE_URL,
  GROQ_REQUEST_TIMEOUT_MS,
  GroqIntelligence,
} from "./groq-intelligence.js";

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

  if (config.provider === "groq") {
    return new GroqIntelligence(
      new OpenAI({
        apiKey: config.groqApiKey,
        baseURL: GROQ_BASE_URL,
        timeout: GROQ_REQUEST_TIMEOUT_MS,
        maxRetries: 0,
      }),
      config.model,
      config.groqApiKey,
    );
  }

  return new AnthropicIntelligence(
    new Anthropic({ apiKey: config.anthropicApiKey }),
    config.model,
    config.anthropicApiKey,
  );
}
