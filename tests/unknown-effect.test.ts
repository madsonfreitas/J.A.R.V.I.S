import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { afterEach, describe, expect, it } from "vitest";
import { claimPermit, UnknownEffectError, type Permit } from "../src/cycle/execution.js";
import { ExperimentRunner } from "../src/documentary/runner.js";
import { FileCapabilities } from "../src/documentary/files.js";
import type {
  CreateDraftRequest,
  DocumentaryIntelligencePort,
  UnderstandIntentRequest,
} from "../src/documentary/intelligence-port.js";
import { createRunRecorder } from "../src/observability/run-recorder.js";
import { ScriptedInteraction } from "./helpers/fakes.js";

class UnknownIntelligence implements DocumentaryIntelligencePort {
  public calls = 0;

  public async understandIntent(
    permit: Permit,
    _request: UnderstandIntentRequest,
  ): Promise<never> {
    this.calls += 1;
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
    throw new Error("createDraft não deveria executar depois de unknown.");
  }
}

const directories: string[] = [];

afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

describe("Run diante de efeito desconhecido", () => {
  it("não declara completed nem failed e grava o attemptId", async () => {
    const directory = await mkdtemp(join(tmpdir(), "jarvis-unknown-"));
    directories.push(directory);
    const databasePath = join(directory, "run.sqlite");
    const recorder = await createRunRecorder(databasePath);
    const intelligence = new UnknownIntelligence();
    const runner = new ExperimentRunner({
      intelligence,
      files: new FileCapabilities(1_000_000),
      recorder,
      interaction: new ScriptedInteraction([true], [], join(directory, "out.md")),
      maxTotalCharacters: 100_000,
      modelLabel: "fake-model",
    });

    const result = await runner.run({
      intention: "Produza um resumo operacional das fontes autorizadas.",
      sourcePaths: [resolve("tests/fixtures/alpha.txt")],
    });
    recorder.close();

    expect(result.status).toBe("unknown");
    expect(result.status).not.toBe("completed");
    expect(result.status).not.toBe("failed");
    expect(intelligence.calls).toBe(1);

    const database = new DatabaseSync(databasePath, { readOnly: true });
    const events = database
      .prepare("SELECT type, payload FROM events WHERE type = 'attempt'")
      .all() as Array<{ type: string; payload: string }>;
    database.close();

    const outcomes = events.map((event) => JSON.parse(event.payload) as {
      attemptId: string;
      outcome: string;
    });
    const unknownEvent = outcomes.find((event) => event.outcome === "unknown");
    expect(unknownEvent?.attemptId).toBeTruthy();
  });
});
