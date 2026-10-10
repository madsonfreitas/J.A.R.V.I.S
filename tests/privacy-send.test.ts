import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { ExperimentRunner } from "../src/documentary/runner.js";
import { FileCapabilities } from "../src/documentary/files.js";
import { ExperimentPolicy } from "../src/documentary/policy.js";
import { declaredPublic } from "../src/documentary/disclosure.js";
import type { SourceDescriptor } from "../src/documentary/contracts.js";
import { createRunRecorder } from "../src/observability/run-recorder.js";
import { FakeIntelligence, ScriptedInteraction } from "./helpers/fakes.js";

const alpha = resolve("tests/fixtures/alpha.txt");
const beta = resolve("tests/fixtures/beta.md");
const directories: string[] = [];

afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

class CountingIntelligence extends FakeIntelligence {
  public intentionCalls = 0;
  public draftCalls = 0;

  public override async understandIntent(
    permit: Parameters<FakeIntelligence["understandIntent"]>[0],
    request: Parameters<FakeIntelligence["understandIntent"]>[1],
  ) {
    this.intentionCalls += 1;
    return super.understandIntent(permit, request);
  }

  public override async createDraft(
    permit: Parameters<FakeIntelligence["createDraft"]>[0],
    request: Parameters<FakeIntelligence["createDraft"]>[1],
  ) {
    this.draftCalls += 1;
    return super.createDraft(permit, request);
  }
}

async function runWith(answers: readonly string[], questions: readonly string[] = [], sourcePaths = [alpha]) {
  const directory = await mkdtemp(join(tmpdir(), "jarvis-privacy-"));
  directories.push(directory);
  const intelligence = new CountingIntelligence(questions);
  const recorder = await createRunRecorder(join(directory, "run.sqlite"));
  const runner = new ExperimentRunner({
    intelligence,
    files: new FileCapabilities(1_000_000),
    recorder,
    interaction: new ScriptedInteraction([true, true, true, true], answers, join(directory, "out.md")),
    maxTotalCharacters: 100_000,
    modelLabel: "fake-model",
    provider: "gemini",
  });
  const result = await runner.run({
    intention: "Produza um resumo operacional das fontes autorizadas.",
    sourcePaths,
  });
  recorder.close();
  return { result, intelligence };
}

const source: SourceDescriptor = {
  id: "alpha",
  path: alpha,
  name: "alpha.txt",
  sizeBytes: 10,
};

describe("privacidade do envio", () => {
  it("bloqueia private, unknown, ausência e conflito sem chamar o modelo", async () => {
    for (const answers of [
      ["private", "public_or_non_sensitive"],
      ["unknown", "public_or_non_sensitive"],
      ["", "public_or_non_sensitive"],
      ["public_or_non_sensitive private", "public_or_non_sensitive"],
      ["public_or_non_sensitive", "private"],
    ]) {
      const { result, intelligence } = await runWith(answers);
      expect(result.status).toBe("rejected");
      expect(intelligence.intentionCalls).toBe(0);
      expect(intelligence.draftCalls).toBe(0);
    }
  });

  it("não deixa uma fonte pública liberar outra fonte não classificada", async () => {
    const { result, intelligence } = await runWith(
      ["public_or_non_sensitive", "public_or_non_sensitive", "unknown"],
      [],
      [alpha, beta],
    );

    expect(result.status).toBe("rejected");
    expect(intelligence.intentionCalls).toBe(0);
    expect(intelligence.draftCalls).toBe(0);
  });

  it("não deixa a classificação da intenção liberar um esclarecimento novo", async () => {
    const { result, intelligence } = await runWith(
      [
        "public_or_non_sensitive",
        "public_or_non_sensitive",
        "uso interno",
        "private",
      ],
      ["Qual é o público?"],
    );

    expect(intelligence.intentionCalls).toBe(1);
    expect(intelligence.draftCalls).toBe(0);
    expect(result.status).toBe("rejected");
  });

  it("nega o conjunto inteiro na política quando falta declaração de uma fonte", () => {
    const policy = new ExperimentPolicy([source], {
      ...declaredPublic([source.path]),
      sources: {},
    });
    const proposal = {
      capability: "send_sources_to_model",
      resource: "gemini-3.8-flash",
      destination: "gemini-3.8-flash",
      effect: "enviar",
      reversible: false,
    };

    expect(policy.evaluate(proposal).outcome).toBe("deny");
    expect(
      policy.evaluate({ ...proposal, capability: "send_intention_to_model" }).outcome,
    ).toBe("deny");
  });
});
