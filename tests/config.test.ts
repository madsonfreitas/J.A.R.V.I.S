import { describe, expect, it } from "vitest";
import { loadConfig } from "../src/config.js";

describe("loadConfig", () => {
  it("mantém Anthropic como provedor padrão", () => {
    const config = loadConfig({ ANTHROPIC_API_KEY: "anthropic-test-key" });

    expect(config.provider).toBe("anthropic");
    expect(config.model).toBe("claude-sonnet-5");
    expect(config.anthropicApiKey).toBe("anthropic-test-key");
    expect(config.geminiApiKey).toBe("");
  });

  it("aceita Gemini sem chave Anthropic", () => {
    const config = loadConfig({
      JARVIS_PROVIDER: "gemini",
      GEMINI_API_KEY: "gemini-test-key",
    });

    expect(config.provider).toBe("gemini");
    expect(config.model).toBe("gemini-3.8-flash");
    expect(config.geminiApiKey).toBe("gemini-test-key");
    expect(config.anthropicApiKey).toBe("");
  });

  it("falha antes de qualquer chamada quando o provedor ou a chave Gemini é inválida", () => {
    expect(() => loadConfig({ JARVIS_PROVIDER: "openai" })).toThrow(/anthropic ou gemini/);
    expect(() => loadConfig({ JARVIS_PROVIDER: "gemini" })).toThrow(/GEMINI_API_KEY/);
    expect(() => loadConfig({})).toThrow(/ANTHROPIC_API_KEY/);
  });
});
