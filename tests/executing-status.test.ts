import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { GoogleGenAI } from "@google/genai";
import { claimPermit, UnknownEffectError, type Permit } from "../src/cycle/execution.js";
import { ExperimentRunner } from "../src/documentary/runner.js";
import { FileCapabilities } from "../src/documentary/files.js";
import type {
  CreateDraftRequest,
  DocumentaryIntelligencePort,
  UnderstandIntentRequest,
} from "../src/documentary/intelligence-port.js";
import {
  GEMINI_REQUEST_TIMEOUT_MS,
  GeminiIntelligence,
} from "../src/intelligence/gemini-intelligence.js";
import { RunRecorder } from "../src/observability/run-recorder.js";
import { ScriptedInteraction } from "./helpers/fakes.js";
import type { ExperimentStatus } from "../src/documentary/contracts.js";

class ObservingRecorder extends RunRecorder {
  public readonly statuses: string[] = [];

  public override setStatus(runId: string, status: string, message: string): void {
    super.setStatus(runId, status, message);
    this.statuses.push(status);
  }
}

class ProbeIntelligence implements DocumentaryIntelligencePort {
  public calls = 0;
  public statusAtCall: string | undefined;

  public constructor(private readonly recorder: ObservingRecorder) {}

  public async understandIntent(
    permit: Permit,
    _request: UnderstandIntentRequest,
  ): Promise<never> {
    this.calls += 1;
    this.statusAtCall = this.recorder.statuses.at(-1);
    claimPermit(permit, {
      runId: permit.runId,
      attemptId: permit.attemptId,
      capability: "send_intention_to_model",
      resource: permit.resource,
      destination: permit.destination,
    });
    throw new UnknownEffectError("A resposta do provedor não chegou.");
  }

  public async createDraft(
    _permit: Permit,
    _request: CreateDraftRequest,
  ): Promise<never> {
    this.calls += 1;
    throw new Error("createDraft não deveria executar.");
  }
}

const directories: string[] = [];

afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

async function runCase(confirms: readonly boolean[], answers: readonly string[]) {
  const directory = await mkdtemp(join(tmpdir(), "jarvis-executing-"));
  directories.push(directory);
  const databasePath = join(directory, "run.sqlite");
  const recorder = new ObservingRecorder(databasePath);
  const intelligence = new ProbeIntelligence(recorder);
  const runner = new ExperimentRunner({
    intelligence,
    files: new FileCapabilities(1_000_000),
    recorder,
    interaction: new ScriptedInteraction(confirms, answers, join(directory, "out.md")),
    maxTotalCharacters: 100_000,
    modelLabel: "gemini-3.8-flash",
    provider: "gemini",
  });
  const result = await runner.run({
    intention: "Produza uma síntese curta sobre organização de estudos.",
    sourcePaths: [resolve("tests/fixtures/alpha.txt")],
  });
  recorder.close();
  const database = new DatabaseSync(databasePath, { readOnly: true });
  const statuses = database
    .prepare(
      "SELECT json_extract(payload, '$.status') AS status FROM events WHERE type = 'status' ORDER BY id",
    )
    .all() as Array<{ status: string }>;
  database.close();
  return { result, intelligence, statuses: statuses.map((row) => row.status) };
}

describe("estado executing", () => {
  it("persiste executing antes da chamada externa autorizada", async () => {
    const { result, intelligence, statuses } = await runCase(
      [true],
      ["public_or_non_sensitive", "public_or_non_sensitive"],
    );

    expect(intelligence.calls).toBe(1);
    expect(intelligence.statusAtCall).toBe("executing");
    expect(statuses).toContain("executing");
    expect(statuses.indexOf("awaiting_approval")).toBeLessThan(statuses.indexOf("executing"));
    expect(result.status).toBe("unknown");
  });

  it("não persiste executing quando a política nega o envio", async () => {
    const { result, intelligence, statuses } = await runCase(
      [],
      ["private", "public_or_non_sensitive"],
    );

    expect(intelligence.calls).toBe(0);
    expect(statuses).not.toContain("executing");
    expect(result.status).toBe("rejected");
  });

  it("não persiste executing quando a confirmação é recusada", async () => {
    const { result, intelligence, statuses } = await runCase(
      [false],
      ["public_or_non_sensitive", "public_or_non_sensitive"],
    );

    expect(intelligence.calls).toBe(0);
    expect(statuses).toContain("awaiting_approval");
    expect(statuses).not.toContain("executing");
    expect(result.status).toBe("cancelled");
  });

  it("não grava executing quando a exibição do status falha antes da chamada", async () => {
    const directory = await mkdtemp(join(tmpdir(), "jarvis-executing-"));
    directories.push(directory);
    const databasePath = join(directory, "run.sqlite");
    const recorder = new ObservingRecorder(databasePath);
    const intelligence = new ProbeIntelligence(recorder);
    const runner = new ExperimentRunner({
      intelligence,
      files: new FileCapabilities(1_000_000),
      recorder,
      interaction: new StatusFailureInteraction(
        [true],
        ["public_or_non_sensitive", "public_or_non_sensitive"],
        join(directory, "out.md"),
      ),
      maxTotalCharacters: 100_000,
      modelLabel: "gemini-3.8-flash",
      provider: "gemini",
    });
    const result = await runner.run({
      intention: "Produza uma síntese curta sobre organização de estudos.",
      sourcePaths: [resolve("tests/fixtures/alpha.txt")],
    });
    recorder.close();

    const database = new DatabaseSync(databasePath, { readOnly: true });
    const statuses = database
      .prepare(
        "SELECT json_extract(payload, '$.status') AS status FROM events WHERE type = 'status' ORDER BY id",
      )
      .all() as Array<{ status: string }>;
    database.close();

    expect(intelligence.calls).toBe(0);
    expect(statuses.map((row) => row.status)).not.toContain("executing");
    expect(result.status).toBe("failed");
  });

  it("persiste unknown no SQLite quando o timeout do Gemini estoura", async () => {
    const secret = "fake-provider-key-9f3c2a";
    const directory = await mkdtemp(join(tmpdir(), "jarvis-executing-"));
    directories.push(directory);
    const databasePath = join(directory, "run.sqlite");
    const recorder = new ObservingRecorder(databasePath);
    const generateContent = vi.fn(
      async (request: {
        config?: { httpOptions?: { timeout?: number; retryOptions?: unknown } };
      }) => {
        if (request.config?.httpOptions?.timeout !== GEMINI_REQUEST_TIMEOUT_MS) {
          throw new Error("O timeout configurado não chegou ao cliente.");
        }
        if (request.config.httpOptions.retryOptions !== undefined) {
          throw new Error("A chamada não deveria configurar retry.");
        }
        const error = new Error(
          `timeout ${secret} https://example.test?key=${secret}`,
        );
        error.name = "AbortError";
        error.cause = new Error(`cause ${secret} authorization: Bearer ${secret}`);
        throw error;
      },
    );
    const runner = new ExperimentRunner({
      intelligence: new GeminiIntelligence(
        { models: { generateContent } } as unknown as GoogleGenAI,
        "gemini-3.8-flash",
        secret,
      ),
      files: new FileCapabilities(1_000_000),
      recorder,
      interaction: new ScriptedInteraction(
        [true],
        ["public_or_non_sensitive", "public_or_non_sensitive"],
        join(directory, "out.md"),
      ),
      maxTotalCharacters: 100_000,
      modelLabel: "gemini-3.8-flash",
      provider: "gemini",
    });
    const result = await runner.run({
      intention: "Produza uma síntese curta sobre organização de estudos.",
      sourcePaths: [resolve("tests/fixtures/alpha.txt")],
    });
    recorder.close();

    const database = new DatabaseSync(databasePath, { readOnly: true });
    const run = database
      .prepare("SELECT status, message, finished_at FROM runs")
      .get() as { status: string; message: string; finished_at: string | null };
    const attempt = database
      .prepare(
        "SELECT payload FROM events WHERE type = 'attempt' ORDER BY id DESC LIMIT 1",
      )
      .get() as { payload: string };
    const statuses = database
      .prepare(
        "SELECT json_extract(payload, '$.status') AS status FROM events WHERE type = 'status' ORDER BY id",
      )
      .all() as Array<{ status: string }>;
    database.close();
    const storedAttempt = JSON.parse(attempt.payload) as {
      outcome: string;
      error: string | null;
    };
    const stored = `${run.message}\n${storedAttempt.error ?? ""}\n${JSON.stringify(statuses)}`;

    expect(generateContent).toHaveBeenCalledTimes(1);
    expect(generateContent.mock.calls[0]?.[0]?.config?.httpOptions?.timeout).toBe(
      GEMINI_REQUEST_TIMEOUT_MS,
    );
    expect(generateContent.mock.calls[0]?.[0]?.config?.httpOptions?.retryOptions).toBeUndefined();
    expect(result.status).toBe("unknown");
    expect(run.status).toBe("unknown");
    expect(run.finished_at).toBeTruthy();
    expect(storedAttempt.outcome).toBe("unknown");
    expect(statuses.map((row) => row.status)).toContain("executing");
    expect(statuses.map((row) => row.status).at(-1)).toBe("unknown");
    expect(stored).not.toContain(secret);
    expect(stored).not.toContain("example.test");
    expect(stored).not.toContain("Bearer");
    expect(run.message).toContain("Tempo esgotado");
  });
});

class StatusFailureInteraction extends ScriptedInteraction {
  public override async showStatus(
    status: ExperimentStatus,
    _message?: string,
  ): Promise<void> {
    if (status === "executing") {
      throw new Error("falha ao exibir o status");
    }
    await super.showStatus(status);
  }
}
