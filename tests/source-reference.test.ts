import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import type Anthropic from "@anthropic-ai/sdk";
import type { GoogleGenAI } from "@google/genai";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createCoreRun } from "../src/cycle/execution.js";
import type { UnderstandIntentRequest } from "../src/documentary/intelligence-port.js";
import { absentSourceReference, buildSourceReference } from "../src/documentary/disclosure.js";
import { ExperimentRunner } from "../src/documentary/runner.js";
import { FileCapabilities } from "../src/documentary/files.js";
import { AnthropicIntelligence } from "../src/intelligence/anthropic-intelligence.js";
import { GeminiIntelligence } from "../src/intelligence/gemini-intelligence.js";
import { createRunRecorder } from "../src/observability/run-recorder.js";
import { FakeIntelligence, ScriptedInteraction } from "./helpers/fakes.js";

const directories: string[] = [];

afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

class RememberingIntelligence extends FakeIntelligence {
  public reference = "";

  public override async understandIntent(
    permit: Parameters<FakeIntelligence["understandIntent"]>[0],
    request: Parameters<FakeIntelligence["understandIntent"]>[1],
  ) {
    this.reference = request.sourceReference ?? "";
    return super.understandIntent(permit, request);
  }
}

describe("referência mínima na compreensão", () => {
  it("não revela nome, caminho ou conteúdo de uma única fonte pública", () => {
    const reference = buildSourceReference(
      [{ path: "C:\\sigilo\\contrato-medico.txt" }],
      () => "public_or_non_sensitive",
    );

    expect(reference.labels).toEqual([]);
    expect(reference.text).toBe(
      "Uma fonte pública já foi selecionada. Esta chamada não inclui nomes, caminhos nem conteúdo de fontes.",
    );
    expect(reference.text).not.toContain("contrato-medico");
    expect(reference.text).not.toContain("sigilo");
    expect(reference.paths).toHaveLength(1);
  });

  it("distingue homônimos com rótulos opacos e determinísticos", () => {
    const sources = [
      { path: "C:\\pasta-a\\nota.txt" },
      { path: "C:\\pasta-b\\nota.txt" },
    ];
    const reference = buildSourceReference(sources, () => "public_or_non_sensitive");

    expect(reference.labels).toEqual(["fonte-1", "fonte-2"]);
    expect(reference.paths[0]).not.toBe(reference.paths[1]);
    expect(reference.text).toContain("fonte-1, fonte-2");
    expect(reference.text).not.toContain("nota.txt");
    expect(reference.text).not.toContain("pasta-a");
    expect(reference.text).not.toContain("pasta-b");
    expect(buildSourceReference(sources, () => "public_or_non_sensitive").labels).toEqual(
      reference.labels,
    );
  });

  it("omite fonte privada, desconhecida ou inválida", () => {
    const reference = buildSourceReference(
      [
        { path: "C:\\docs\\publica.txt" },
        { path: "C:\\docs\\privada.txt" },
        { path: "C:\\docs\\duvida.txt" },
      ],
      (path) => {
        if (path.endsWith("publica.txt")) {
          return "public_or_non_sensitive";
        }
        if (path.endsWith("privada.txt")) {
          return "private";
        }
        return "unknown";
      },
    );

    expect(reference.paths).toHaveLength(1);
    expect(reference.text).toContain("Uma fonte pública já foi selecionada.");
    expect(reference.text).not.toContain("privada");
    expect(reference.text).not.toContain("duvida");
  });

  it("repete na confirmação o mesmo texto enviado ao modelo", async () => {
    const directory = await mkdtemp(join(tmpdir(), "jarvis-ref-"));
    directories.push(directory);
    const firstDir = join(directory, "a");
    const secondDir = join(directory, "b");
    await mkdir(firstDir);
    await mkdir(secondDir);
    const first = join(firstDir, "nota.txt");
    const second = join(secondDir, "nota.txt");
    await writeFile(first, "alfa");
    await writeFile(second, "beta");
    const intelligence = new RememberingIntelligence();
    const interaction = new ScriptedInteraction(
      [true, true, true, true],
      ["public_or_non_sensitive", "public_or_non_sensitive", "public_or_non_sensitive"],
      join(directory, "out.md"),
    );
    const recorder = await createRunRecorder(join(directory, "run.sqlite"));
    const runner = new ExperimentRunner({
      intelligence,
      files: new FileCapabilities(1_000_000),
      recorder,
      interaction,
      maxTotalCharacters: 100_000,
      modelLabel: "fake-model",
    });

    const result = await runner.run({
      intention: "Sintetize as fontes.",
      sourcePaths: [first, second],
    });
    recorder.close();

    expect(result.status).toBe("completed_with_reservations");
    expect(intelligence.reference).toContain("fonte-1, fonte-2");
    expect(intelligence.reference).not.toContain("nota.txt");
    expect(interaction.seenDetails.flat().some((line) => line === intelligence.reference)).toBe(
      true,
    );

    const database = new DatabaseSync(join(directory, "run.sqlite"), { readOnly: true });
    const attempts = database
      .prepare("SELECT payload FROM events WHERE type = 'attempt'")
      .all() as Array<{ payload: string }>;
    database.close();
    const parsed = attempts.map(
      (row) => JSON.parse(row.payload) as { action: string; attemptId: string; outcome: string },
    );
    const intention = parsed.find((item) => item.action === "send_intention_to_model");
    const read = parsed.find((item) => item.action === "read_source");
    const created = parsed.find((item) => item.action === "create_artifact");
    expect(intention?.outcome).toBe("executed");
    expect(read?.outcome).toBe("executed");
    expect(created?.outcome).toBe("executed");
    expect(new Set([intention?.attemptId, read?.attemptId, created?.attemptId]).size).toBe(3);
  });

  it("não deixa um esclarecimento unknown chamar o modelo de novo", async () => {
    const directory = await mkdtemp(join(tmpdir(), "jarvis-unknown-clar-"));
    directories.push(directory);
    const source = join(directory, "nota.txt");
    await writeFile(source, "texto");
    const intelligence = new RememberingIntelligence(["Qual documento?"]);
    const recorder = await createRunRecorder(join(directory, "run.sqlite"));
    const runner = new ExperimentRunner({
      intelligence,
      files: new FileCapabilities(1_000_000),
      recorder,
      interaction: new ScriptedInteraction(
        [true, true, true, true],
        ["public_or_non_sensitive", "public_or_non_sensitive", "o primeiro", "talvez"],
        join(directory, "out.md"),
      ),
      maxTotalCharacters: 100_000,
      modelLabel: "fake-model",
    });
    const result = await runner.run({
      intention: "Sintetize.",
      sourcePaths: [source],
    });
    recorder.close();
    expect(result.status).toBe("rejected");
    expect(result.status).not.toBe("unknown");
    expect(result.message).not.toContain("nota.txt");
  });

  it("mantém a leitura dependente do próprio Permit", async () => {
    const files = new FileCapabilities(1_000_000);
    const read = await createCoreRun("ref-read").attempt({
      proposal: {
        capability: "read_source",
        resource: "C:\\docs\\nota.txt",
        destination: null,
        effect: "ler",
        reversible: true,
      },
      evaluate: (action) => ({ outcome: "allow", reason: "teste", action }),
      confirm: async () => false,
      execute: (permit) =>
        files.readSource(
          {
            runId: "outro",
            attemptId: "outro",
            capability: permit.capability,
            resource: permit.resource,
            destination: null,
          },
          {
            id: "nota",
            path: "C:\\docs\\nota.txt",
            name: "nota.txt",
            sizeBytes: 1,
          },
        ),
    });
    expect(read.outcome).toBe("failed");
    expect(read.outcome).not.toBe("unknown");
  });

  it("usa a mesma frase canônica quando a referência vem ausente ou vazia", async () => {
    const canonical = absentSourceReference();
    expect(buildSourceReference([], () => undefined).text).toBe(canonical);
    const goal = {
      summary: "Resumo",
      purpose: "Teste",
      audience: null,
      requiredSections: ["Resumo"],
      constraints: [],
      questions: [],
    };
    const prompts: string[] = [];
    const anthropicCreate = vi.fn(async (body: { messages: Array<{ content: string }> }) => {
      prompts.push(body.messages[0]?.content ?? "");
      return { content: [{ type: "text", text: JSON.stringify(goal) }] };
    });
    const geminiCreate = vi.fn(async (body: { contents: string }) => {
      prompts.push(body.contents);
      return { text: JSON.stringify(goal) };
    });
    const anthropic = new AnthropicIntelligence(
      { messages: { create: anthropicCreate } } as unknown as Anthropic,
      "fake-model",
    );
    const gemini = new GeminiIntelligence(
      { models: { generateContent: geminiCreate } } as unknown as GoogleGenAI,
      "gemini-3.8-flash",
      "gemini-test-key",
    );

    const requests: UnderstandIntentRequest[] = [
      { intention: "Sintetize.", clarifications: [] },
      { intention: "Sintetize.", clarifications: [], sourceReference: "" },
      { intention: "Sintetize.", clarifications: [], sourceReference: "   " },
    ];
    for (const request of requests) {
      await createCoreRun("ref-anthropic").attempt({
        proposal: {
          capability: "send_intention_to_model",
          resource: "fake-model",
          destination: "fake-model",
          effect: "enviar",
          reversible: false,
        },
        evaluate: (action) => ({ outcome: "allow", reason: "teste", action }),
        confirm: async () => false,
        execute: (permit) => anthropic.understandIntent(permit, request),
      });
      await createCoreRun("ref-gemini").attempt({
        proposal: {
          capability: "send_intention_to_model",
          resource: "gemini-3.8-flash",
          destination: "gemini-3.8-flash",
          effect: "enviar",
          reversible: false,
        },
        evaluate: (action) => ({ outcome: "allow", reason: "teste", action }),
        confirm: async () => false,
        execute: (permit) => gemini.understandIntent(permit, request),
      });
    }

    expect(prompts).toHaveLength(6);
    for (const prompt of prompts) {
      expect(prompt).toContain(canonical);
      expect(prompt).not.toContain("foi incluída neste pedido");
    }
  });

  it("não inclui fonte que falha na inspeção nem envia o conteúdo dela", async () => {
    const directory = await mkdtemp(join(tmpdir(), "jarvis-inspect-"));
    directories.push(directory);
    const good = join(directory, "ok.txt");
    const bad = join(directory, "anexo.png");
    const hidden = "CONTEUDO-QUE-NAO-PODE-SAIR";
    await writeFile(good, "texto publico");
    await writeFile(bad, hidden);
    const intelligence = new RememberingIntelligence();
    let drafts = 0;
    const originalDraft = intelligence.createDraft.bind(intelligence);
    intelligence.createDraft = async (permit, request) => {
      drafts += 1;
      return originalDraft(permit, request);
    };
    const recorder = await createRunRecorder(join(directory, "run.sqlite"));
    const runner = new ExperimentRunner({
      intelligence,
      files: new FileCapabilities(1_000_000),
      recorder,
      interaction: new ScriptedInteraction([true], [], join(directory, "out.md")),
      maxTotalCharacters: 100_000,
      modelLabel: "fake-model",
    });
    const result = await runner.run({
      intention: "Sintetize as fontes.",
      sourcePaths: [good, bad],
    });
    recorder.close();

    expect(result.status).toBe("failed");
    expect(intelligence.reference).toBe("");
    expect(drafts).toBe(0);
    expect(result.message).not.toContain(hidden);
    expect(result.effects).toEqual([]);
  });
});
