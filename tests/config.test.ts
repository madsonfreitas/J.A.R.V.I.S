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

  it("aceita Groq somente com chave e modelo explícitos", () => {
    const config = loadConfig({
      JARVIS_PROVIDER: "groq",
      GROQ_API_KEY: "groq-test-key",
      JARVIS_MODEL: "openai/gpt-oss-20b",
    });

    expect(config.provider).toBe("groq");
    expect(config.model).toBe("openai/gpt-oss-20b");
    expect(config.groqApiKey).toBe("groq-test-key");
    expect(config.anthropicApiKey).toBe("");
    expect(config.geminiApiKey).toBe("");
  });

  it("falha antes de qualquer chamada quando o provedor ou a chave é inválida", () => {
    expect(() => loadConfig({ JARVIS_PROVIDER: "openai" })).toThrow(/anthropic, gemini ou groq/);
    expect(() => loadConfig({ JARVIS_PROVIDER: "gemini" })).toThrow(/GEMINI_API_KEY/);
    expect(() => loadConfig({ JARVIS_PROVIDER: "groq" })).toThrow(/GROQ_API_KEY/);
    expect(() =>
      loadConfig({ JARVIS_PROVIDER: "groq", GROQ_API_KEY: "groq-test-key" }),
    ).toThrow(/JARVIS_MODEL é obrigatório/);
    expect(() => loadConfig({})).toThrow(/ANTHROPIC_API_KEY/);
  });
});
