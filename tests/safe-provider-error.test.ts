import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { afterEach, describe, expect, it, vi } from "vitest";
import type Anthropic from "@anthropic-ai/sdk";
import type { GoogleGenAI } from "@google/genai";
import type { ActionProposal, PolicyDecision, PolicyOutcome } from "../src/cycle/contracts.js";
import { createCoreRun } from "../src/cycle/execution.js";
import { ExperimentRunner } from "../src/documentary/runner.js";
import { FileCapabilities } from "../src/documentary/files.js";
import type { UnderstandIntentRequest } from "../src/documentary/intelligence-port.js";
import { AnthropicIntelligence } from "../src/intelligence/anthropic-intelligence.js";
import { GeminiIntelligence } from "../src/intelligence/gemini-intelligence.js";
import { displayError } from "../src/intelligence/safe-error.js";
import { createRunRecorder } from "../src/observability/run-recorder.js";
import { ScriptedInteraction } from "./helpers/fakes.js";

const secret = "fake-provider-key-9f3c2a";
const directories: string[] = [];

afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

const intentionRequest: UnderstandIntentRequest = {
  intention: "Resuma o material público.",
  clarifications: [],
};

function proposal(
  capability: string,
  model = "gemini-3.8-flash",
): ActionProposal {
  return {
    capability,
    resource: model,
    destination: model,
    effect: capability,
    reversible: false,
  };
}

function decide(outcome: PolicyOutcome) {
  return (action: ActionProposal): PolicyDecision => ({
    outcome,
    reason: outcome,
    action,
  });
}

function providerFailure(key: string): Error {
  const cause = new Error(
    `nested ${key} authorization: Bearer ${key} x-api-key: ${key}`,
  );
  const error = new Error(
    `provider down ${key} https://example.test/v1?key=${key}`,
  ) as Error & {
    status: number;
    headers: Record<string, string>;
    request: { url: string; headers: Record<string, string> };
    cause: Error;
  };
  error.name = "APIConnectionError";
  error.status = 503;
  error.headers = { Authorization: `Bearer ${key}`, "x-api-key": key };
  error.request = {
    url: `https://example.test/v1?api_key=${key}`,
    headers: { "x-goog-api-key": key },
  };
  error.cause = cause;
  return error;
}

function exposedText(value: unknown, seen = new Set<unknown>()): string {
  if (typeof value === "string") {
    return value;
  }
  if (!value || typeof value !== "object") {
    return "";
  }
  if (seen.has(value)) {
    return "";
  }
  seen.add(value);
  const record = value as Record<string, unknown> & { message?: unknown; cause?: unknown };
  const parts = [
    typeof record.message === "string" ? record.message : "",
    ...Object.entries(record).map(([key, entry]) => `${key}:${exposedText(entry, seen)}`),
  ];
  if ("cause" in record) {
    parts.push(exposedText(record.cause, seen));
  }
  return parts.join("\n");
}

describe("erros de provedor sem segredo", () => {
  it("não coloca a chave, o cause, cabeçalhos ou a requisição na mensagem do Gemini", async () => {
    const generateContent = vi.fn(async () => {
      throw providerFailure(secret);
    });
    const intelligence = new GeminiIntelligence(
      { models: { generateContent } } as unknown as GoogleGenAI,
      "gemini-3.8-flash",
      secret,
    );
    const result = await createCoreRun("gemini-secret").attempt({
      proposal: proposal("send_intention_to_model"),
      evaluate: decide("allow"),
      confirm: async () => true,
      execute: (permit) => intelligence.understandIntent(permit, intentionRequest),
    });

    expect(result.outcome).toBe("unknown");
    expect(generateContent).toHaveBeenCalledTimes(1);
    if (result.outcome !== "unknown") {
      return;
    }
    const visible = `${result.message}\n${exposedText(result.cause)}`;
    expect(visible).not.toContain(secret);
    expect(visible).not.toContain("example.test");
    expect(visible).not.toContain("Bearer");
    expect(visible).not.toContain("x-api-key");
    expect(visible).toContain("Status 503");
    expect((result.cause as { cause?: unknown }).cause).toBeUndefined();
  });

  it("aplica o mesmo limite à Anthropic", async () => {
    const create = vi.fn(async () => {
      throw providerFailure(secret);
    });
    const intelligence = new AnthropicIntelligence(
      { messages: { create } } as unknown as Anthropic,
      "claude-sonnet-5",
      secret,
    );
    const result = await createCoreRun("anthropic-secret").attempt({
      proposal: proposal("send_intention_to_model", "claude-sonnet-5"),
      evaluate: decide("allow"),
      confirm: async () => true,
      execute: (permit) => intelligence.understandIntent(permit, intentionRequest),
    });

    expect(result.outcome).toBe("unknown");
    expect(create).toHaveBeenCalledTimes(1);
    if (result.outcome !== "unknown") {
      return;
    }
    const visible = `${result.message}\n${exposedText(result.cause)}`;
    expect(visible).not.toContain(secret);
    expect(visible).not.toContain("example.test");
    expect(visible).not.toContain("Bearer");
    expect(visible).not.toContain("x-api-key");
    expect(visible).toContain("Status 503");
    expect((result.cause as { cause?: unknown }).cause).toBeUndefined();
  });

  it("mantém falha de validação sem repetir a chamada e sem a chave", async () => {
    const generateContent = vi.fn(async () => ({
      text: `{"summary":"${secret}"}`,
    }));
    const intelligence = new GeminiIntelligence(
      { models: { generateContent } } as unknown as GoogleGenAI,
      "gemini-3.8-flash",
      secret,
    );
    const result = await createCoreRun("gemini-schema").attempt({
      proposal: proposal("send_intention_to_model"),
      evaluate: decide("allow"),
      confirm: async () => true,
      execute: (permit) => intelligence.understandIntent(permit, intentionRequest),
    });

    expect(result.outcome).toBe("failed");
    expect(generateContent).toHaveBeenCalledTimes(1);
    if (result.outcome === "failed") {
      expect(result.message).not.toContain(secret);
      expect(result.message).toContain("processamento local");
    }
  });

  it("não grava a chave no status nem no SQLite quando o erro original tem cause", async () => {
    const directory = await mkdtemp(join(tmpdir(), "jarvis-safe-error-"));
    directories.push(directory);
    const databasePath = join(directory, "run.sqlite");
    const recorder = await createRunRecorder(databasePath);
    const generateContent = vi.fn(async () => {
      throw providerFailure(secret);
    });
    const interaction = new ScriptedInteraction(
      [true],
      ["public_or_non_sensitive", "public_or_non_sensitive"],
      join(directory, "out.md"),
    );
    const runner = new ExperimentRunner({
      intelligence: new GeminiIntelligence(
        { models: { generateContent } } as unknown as GoogleGenAI,
        "gemini-3.8-flash",
        secret,
      ),
      files: new FileCapabilities(1_000_000),
      recorder,
      interaction,
      maxTotalCharacters: 100_000,
      modelLabel: "gemini-3.8-flash",
      provider: "gemini",
    });

    const result = await runner.run({
      intention: "Produza um resumo operacional das fontes autorizadas.",
      sourcePaths: [resolve("tests/fixtures/alpha.txt")],
    });
    recorder.close();

    expect(result.status).toBe("unknown");
    expect(generateContent).toHaveBeenCalledTimes(1);
    expect(result.message).not.toContain(secret);

    const database = new DatabaseSync(databasePath, { readOnly: true });
    const stored = [
      ...(database.prepare("SELECT message FROM runs").all() as Array<{ message: string }>),
      ...(database.prepare("SELECT payload FROM events").all() as Array<{ payload: string }>),
    ]
      .map((row) => Object.values(row).join("\n"))
      .join("\n");
    database.close();

    expect(stored).not.toContain(secret);
    expect(stored).not.toContain("example.test");
    expect(stored).not.toContain("Bearer");
    expect(stored).toContain("unknown");
  });

  it("redige segredo na saída da CLI sem apagar erro de configuração", () => {
    expect(displayError(new Error("GEMINI_API_KEY é obrigatória."))).toBe(
      "GEMINI_API_KEY é obrigatória.",
    );
    expect(
      displayError(new Error(`falha key=${secret} authorization: Bearer ${secret}`)),
    ).not.toContain(secret);
  });
});
