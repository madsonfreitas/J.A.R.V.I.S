import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AppConfig } from "../src/config.js";

vi.mock("@anthropic-ai/sdk", () => ({
  default: vi.fn(function AnthropicMock() {
    return { messages: { create: vi.fn() } };
  }),
}));

vi.mock("@google/genai", () => ({
  GoogleGenAI: vi.fn(function GeminiMock() {
    return { models: { generateContent: vi.fn() } };
  }),
}));

import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";
import { createIntelligence } from "../src/intelligence/create-intelligence.js";

const base: AppConfig = {
  provider: "anthropic",
  anthropicApiKey: "anthropic-test-key",
  geminiApiKey: "",
  model: "claude-sonnet-5",
  dataDirectory: ".jarvis",
  maxSourceBytes: 1000,
  maxTotalCharacters: 1000,
};

describe("createIntelligence", () => {
  beforeEach(() => {
    vi.mocked(Anthropic).mockClear();
    vi.mocked(GoogleGenAI).mockClear();
  });

  it("não inicializa o Gemini no caminho Anthropic", () => {
    createIntelligence(base);

    expect(Anthropic).toHaveBeenCalledTimes(1);
    expect(Anthropic).toHaveBeenCalledWith({ apiKey: "anthropic-test-key" });
    expect(GoogleGenAI).not.toHaveBeenCalled();
  });

  it("inicializa somente o Gemini quando esse provedor é escolhido", () => {
    createIntelligence({
      ...base,
      provider: "gemini",
      anthropicApiKey: "",
      geminiApiKey: "gemini-test-key",
      model: "gemini-3.8-flash",
    });

    expect(GoogleGenAI).toHaveBeenCalledTimes(1);
    expect(GoogleGenAI).toHaveBeenCalledWith({ apiKey: "gemini-test-key" });
    expect(Anthropic).not.toHaveBeenCalled();
  });
});
