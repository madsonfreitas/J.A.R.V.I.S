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

vi.mock("openai", () => ({
  default: vi.fn(function OpenAIMock() {
    return { chat: { completions: { create: vi.fn() } } };
  }),
}));

import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import { createIntelligence } from "../src/intelligence/create-intelligence.js";
import { GROQ_BASE_URL, GROQ_REQUEST_TIMEOUT_MS } from "../src/intelligence/groq-intelligence.js";

const base: AppConfig = {
  provider: "anthropic",
  anthropicApiKey: "anthropic-test-key",
  geminiApiKey: "",
  groqApiKey: "",
  model: "claude-sonnet-5",
  dataDirectory: ".jarvis",
  maxSourceBytes: 1000,
  maxTotalCharacters: 1000,
};

describe("createIntelligence", () => {
  beforeEach(() => {
    vi.mocked(Anthropic).mockClear();
    vi.mocked(GoogleGenAI).mockClear();
    vi.mocked(OpenAI).mockClear();
  });

  it("não inicializa o Gemini no caminho Anthropic", () => {
    createIntelligence(base);

    expect(Anthropic).toHaveBeenCalledTimes(1);
    expect(Anthropic).toHaveBeenCalledWith({ apiKey: "anthropic-test-key" });
    expect(GoogleGenAI).not.toHaveBeenCalled();
    expect(OpenAI).not.toHaveBeenCalled();
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
    expect(OpenAI).not.toHaveBeenCalled();
  });

  it("inicializa somente o cliente Groq quando esse provedor é escolhido", () => {
    createIntelligence({
      ...base,
      provider: "groq",
      anthropicApiKey: "",
      groqApiKey: "groq-test-key",
      model: "openai/gpt-oss-20b",
    });

    expect(OpenAI).toHaveBeenCalledTimes(1);
    expect(OpenAI).toHaveBeenCalledWith({
      apiKey: "groq-test-key",
      baseURL: GROQ_BASE_URL,
      timeout: GROQ_REQUEST_TIMEOUT_MS,
      maxRetries: 0,
    });
    expect(Anthropic).not.toHaveBeenCalled();
    expect(GoogleGenAI).not.toHaveBeenCalled();
  });

  it("desliga o retry automático ao construir o cliente Groq", () => {
    createIntelligence({
      ...base,
      provider: "groq",
      anthropicApiKey: "",
      groqApiKey: "groq-test-key",
      model: "openai/gpt-oss-20b",
    });

    expect(OpenAI).toHaveBeenCalledWith(
      expect.objectContaining({ maxRetries: 0 }),
    );
  });
});
