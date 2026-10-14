import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { APIConnectionTimeoutError } from "openai";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ActionProposal, PolicyDecision, PolicyOutcome } from "../src/cycle/contracts.js";
import { createCoreRun, type Permit } from "../src/cycle/execution.js";
import type { SourceDescriptor } from "../src/documentary/contracts.js";
import { FileCapabilities } from "../src/documentary/files.js";
import type { CreateDraftRequest, UnderstandIntentRequest } from "../src/documentary/intelligence-port.js";
import { ExperimentPolicy } from "../src/documentary/policy.js";
import { ExperimentRunner } from "../src/documentary/runner.js";
import {
  GROQ_REQUEST_TIMEOUT_MS,
  GroqIntelligence,
  type GroqCompletionClient,
} from "../src/intelligence/groq-intelligence.js";
import { createRunRecorder } from "../src/observability/run-recorder.js";
import { FakeIntelligence, ScriptedInteraction } from "./helpers/fakes.js";

const model = "openai/gpt-oss-20b";
const secret = "groq-test-key";
const privateMarker = "conteudo-privado-que-nao-pode-sair";
const unknownMarker = "conteudo-unknown-que-nao-pode-sair";

const goalJson = {
  summary: "Resumo operacional",
  purpose: "Organizar as fontes",
  audience: null,
  requiredSections: ["Resumo"],
  constraints: [],
  questions: [],
};

const draftJson = {
  title: "Resultado",
  sections: [
    {
      heading: "Resumo",
      entries: [{ text: "Prazo citado na fonte.", kind: "fact", sourceIds: ["alpha"] }],
    },
  ],
  gaps: [],
  conflicts: [],
  assumptions: [],
};

const directories: string[] = [];

afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

function clientFor(payload: unknown) {
  const calls: Array<{
    body: {
      model: string;
      messages: Array<{ role: "user"; content: string }>;
      max_tokens: number;
    };
    options: { timeout: number };
  }> = [];
  const create: GroqCompletionClient["chat"]["completions"]["create"] = async (body, options) => {
    calls.push({ body, options });
    return { choices: [{ message: { content: JSON.stringify(payload) } }] };
  };
  const client: GroqCompletionClient = { chat: { completions: { create } } };
  return {
    calls,
    intelligence: new GroqIntelligence(client, model, secret),
  };
}

function proposal(capability: string): ActionProposal {
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

const intentionRequest: UnderstandIntentRequest = {
  intention: "Resuma as fontes",
  clarifications: [],
  sourceReference: "Uma fonte pública já foi selecionada. Esta chamada não inclui nomes, caminhos nem conteúdo de fontes.",
};

const draftRequest: CreateDraftRequest = {
  goal: {
    summary: "Resumo",
    purpose: "Teste",
    audience: null,
    requiredSections: ["Resumo"],
    constraints: [],
    questions: [],
  },
  context: {
    sources: [
      {
        id: "alpha",
        path: "alpha.txt",
        name: "alpha.txt",
        sizeBytes: 10,
        content: "Prazo 12",
        trust: "untrusted_content",
      },
    ],
    totalCharacters: 8,
    warnings: [],
  },
};

describe("GroqIntelligence", () => {
  it("interpreta o objetivo e cria o rascunho com uma chamada cada", async () => {
    const understood = clientFor(goalJson);
    const goal = await createCoreRun("understand").attempt({
      proposal: proposal("send_intention_to_model"),
      evaluate: decide("allow"),
      confirm: async () => true,
      execute: (permit) => understood.intelligence.understandIntent(permit, intentionRequest),
    });
    const drafted = clientFor(draftJson);
    const draft = await createCoreRun("draft").attempt({
      proposal: proposal("send_sources_to_model"),
      evaluate: decide("allow"),
      confirm: async () => true,
      execute: (permit) => drafted.intelligence.createDraft(permit, draftRequest),
    });

    expect(goal.outcome).toBe("executed");
    expect(draft.outcome).toBe("executed");
    expect(understood.calls).toHaveLength(1);
    expect(drafted.calls).toHaveLength(1);
    const intentionBody = understood.calls[0]?.body;
    const draftBody = drafted.calls[0]?.body;
    expect(intentionBody?.model).toBe(model);
    expect(intentionBody?.max_tokens).toBe(4096);
    expect(intentionBody?.messages[0]?.content).toContain("Uma fonte pública já foi selecionada.");
    expect(intentionBody?.messages[0]?.content).toContain("Resuma as fontes");
    expect(intentionBody?.messages[0]?.content).not.toContain("alpha.txt");
    expect(draftBody?.messages[0]?.content).toContain("Fontes autorizadas");
    expect(draftBody?.messages[0]?.content).toContain("Prazo 12");
    expect(understood.calls[0]?.options).toEqual({ timeout: GROQ_REQUEST_TIMEOUT_MS });
    expect(drafted.calls[0]?.options).toEqual({ timeout: GROQ_REQUEST_TIMEOUT_MS });
    expect(JSON.stringify(intentionBody)).not.toContain("tools");
    expect(JSON.stringify(draftBody)).not.toContain("tools");
    if (goal.outcome === "executed") {
      expect(goal.effect).toMatchObject({ summary: "Resumo operacional", questions: [] });
    }
    if (draft.outcome === "executed") {
      expect(draft.effect).toMatchObject({ title: "Resultado" });
    }
  });

  it("não chama o cliente quando a Attempt é negada ou recusada", async () => {
    const { calls, intelligence } = clientFor(goalJson);
    const denied = await createCoreRun("deny").attempt({
      proposal: proposal("send_intention_to_model"),
      evaluate: decide("deny"),
      confirm: async () => true,
      execute: (permit) => intelligence.understandIntent(permit, intentionRequest),
    });
    const refused = await createCoreRun("refuse").attempt({
      proposal: proposal("send_sources_to_model"),
      evaluate: decide("require_approval"),
      confirm: async () => false,
      execute: (permit) => intelligence.createDraft(permit, draftRequest),
    });

    expect(denied.outcome).toBe("denied");
    expect(refused.outcome).toBe("refused");
    expect(calls).toHaveLength(0);
  });

  it("não envia conteúdo private nem unknown quando a política nega", async () => {
    const sourcePath = resolve("tests/fixtures/alpha.txt");
    const sources: SourceDescriptor[] = [
      { id: "alpha", path: sourcePath, name: "alpha.txt", sizeBytes: 10 },
    ];
    const { calls, intelligence } = clientFor(draftJson);
    const sensitiveDraft: CreateDraftRequest = {
      ...draftRequest,
      context: {
        ...draftRequest.context,
        sources: [
          {
            ...draftRequest.context.sources[0]!,
            path: sourcePath,
            content: `${privateMarker} ${unknownMarker}`,
          },
        ],
      },
    };

    for (const classification of ["private", "unknown"] as const) {
      const policy = new ExperimentPolicy(sources, {
        intention: classification,
        sources: { [sourcePath]: classification },
        clarifications: [],
      });
      policy.noteUnderstandingPaths([sourcePath]);
      const result = await createCoreRun(classification).attempt({
        proposal: proposal("send_sources_to_model"),
        evaluate: (action) => policy.evaluate(action),
        confirm: async () => true,
        execute: (permit) => intelligence.createDraft(permit, sensitiveDraft),
      });
      expect(result.outcome).toBe("denied");
    }

    expect(calls).toHaveLength(0);
    expect(JSON.stringify(calls)).not.toContain(privateMarker);
    expect(JSON.stringify(calls)).not.toContain(unknownMarker);
  });

  it("consome um Permit por Attempt e recusa capability ou reutilização", async () => {
    const { calls, intelligence } = clientFor(draftJson);
    let captured: Permit | undefined;
    const sent = await createCoreRun("sources").attempt({
      proposal: proposal("send_sources_to_model"),
      evaluate: decide("allow"),
      confirm: async () => true,
      execute: async (permit) => {
        captured = permit;
        await expect(
          intelligence.understandIntent(permit, intentionRequest),
        ).rejects.toThrow(/não pertence/);
        return intelligence.createDraft(permit, draftRequest);
      },
    });

    expect(sent.outcome).toBe("executed");
    expect(calls).toHaveLength(1);
    await expect(
      intelligence.createDraft(captured as Permit, draftRequest),
    ).rejects.toThrow(/consumido/);
    expect(calls).toHaveLength(1);

    const other = clientFor(goalJson);
    let foreign: Permit | undefined;
    await createCoreRun("foreign").attempt({
      proposal: proposal("send_intention_to_model"),
      evaluate: decide("allow"),
      confirm: async () => true,
      execute: async (permit) => {
        foreign = permit;
        return other.intelligence.understandIntent(permit, intentionRequest);
      },
    });
    await expect(
      intelligence.understandIntent(foreign as Permit, intentionRequest),
    ).rejects.toThrow(/não pertence|consumido/);
    expect(calls).toHaveLength(1);
  });

  it("trata erro de cliente e timeout como efeito incerto, sem nova chamada", async () => {
    let failureCalls = 0;
    const failing: GroqCompletionClient["chat"]["completions"]["create"] = async () => {
      failureCalls += 1;
      const error = new Error(`provider down ${secret} https://api.groq.com`);
      (error as Error & { status?: number }).status = 503;
      throw error;
    };
    const intelligence = new GroqIntelligence(
      { chat: { completions: { create: failing } } },
      model,
      secret,
    );
    const failed = await createCoreRun("down").attempt({
      proposal: proposal("send_intention_to_model"),
      evaluate: decide("allow"),
      confirm: async () => true,
      execute: (permit) => intelligence.understandIntent(permit, intentionRequest),
    });

    expect(failed.outcome).toBe("unknown");
    expect(failureCalls).toBe(1);
    if (failed.outcome === "unknown") {
      expect(failed.message).toContain("Status 503");
      expect(failed.message).not.toContain(secret);
      expect(failed.message).not.toContain("api.groq.com");
    }

    vi.useFakeTimers();
    try {
      const timeoutCalls: Array<{ timeout: number }> = [];
      const timingOut: GroqCompletionClient["chat"]["completions"]["create"] = (
        _body,
        options,
      ) =>
        new Promise((_resolve, reject) => {
          timeoutCalls.push(options);
          setTimeout(() => {
            reject(new APIConnectionTimeoutError());
          }, options.timeout);
        });
      const timed = new GroqIntelligence(
        { chat: { completions: { create: timingOut } } },
        model,
        secret,
      );
      const resultPromise = createCoreRun("timeout").attempt({
        proposal: proposal("send_intention_to_model"),
        evaluate: decide("allow"),
        confirm: async () => true,
        execute: (permit) => timed.understandIntent(permit, intentionRequest),
      });
      await vi.advanceTimersByTimeAsync(GROQ_REQUEST_TIMEOUT_MS);
      const result = await resultPromise;

      expect(result.outcome).toBe("unknown");
      expect(timeoutCalls).toHaveLength(1);
      expect(timeoutCalls[0]).toEqual({ timeout: GROQ_REQUEST_TIMEOUT_MS });
      if (result.outcome === "unknown") {
        expect(result.message).toContain("Tempo esgotado");
        expect(result.message).not.toContain(secret);
        expect(result.message).not.toContain("Bearer");
      }
    } finally {
      vi.useRealTimers();
    }
  });

  it("falha localmente quando o JSON ou o schema é inválido, sem retry", async () => {
    let invalidJsonCalls = 0;
    let invalidSchemaCalls = 0;
    const invalidJson: GroqCompletionClient["chat"]["completions"]["create"] = async () => {
      invalidJsonCalls += 1;
      return { choices: [{ message: { content: "não é json" } }] };
    };
    const invalidSchema: GroqCompletionClient["chat"]["completions"]["create"] = async () => {
      invalidSchemaCalls += 1;
      return { choices: [{ message: { content: JSON.stringify({ summary: "só isso" }) } }] };
    };
    const badJson = new GroqIntelligence(
      { chat: { completions: { create: invalidJson } } },
      model,
      secret,
    );
    const badSchema = new GroqIntelligence(
      { chat: { completions: { create: invalidSchema } } },
      model,
      secret,
    );

    const jsonResult = await createCoreRun("bad-json").attempt({
      proposal: proposal("send_intention_to_model"),
      evaluate: decide("allow"),
      confirm: async () => true,
      execute: (permit) => badJson.understandIntent(permit, intentionRequest),
    });
    const schemaResult = await createCoreRun("bad-schema").attempt({
      proposal: proposal("send_intention_to_model"),
      evaluate: decide("allow"),
      confirm: async () => true,
      execute: (permit) => badSchema.understandIntent(permit, intentionRequest),
    });

    expect(jsonResult.outcome).toBe("failed");
    expect(schemaResult.outcome).toBe("failed");
    expect(invalidJsonCalls).toBe(1);
    expect(invalidSchemaCalls).toBe(1);
    if (jsonResult.outcome === "failed" && schemaResult.outcome === "failed") {
      expect(jsonResult.message).toContain("processamento local da resposta falhou");
      expect(schemaResult.message).toContain("processamento local da resposta falhou");
    }
  });
});

describe("aviso de confirmação Groq", () => {
  it("identifica o provedor e o modelo antes do envio", async () => {
    const directory = await mkdtemp(join(tmpdir(), "jarvis-groq-notice-"));
    directories.push(directory);
    const recorder = await createRunRecorder(join(directory, "run.sqlite"));
    const interaction = new ScriptedInteraction(
      [true, true, true, true],
      ["public_or_non_sensitive", "public_or_non_sensitive"],
      join(directory, "out.md"),
    );
    const runner = new ExperimentRunner({
      intelligence: new FakeIntelligence(),
      files: new FileCapabilities(1_000_000),
      recorder,
      interaction,
      maxTotalCharacters: 100_000,
      modelLabel: model,
      provider: "groq",
    });

    const result = await runner.run({
      intention: "Sintetize a fonte.",
      sourcePaths: [resolve("tests/fixtures/alpha.txt")],
    });
    recorder.close();

    expect(result.status).toBe("completed_with_reservations");
    const intentionNotice = interaction.seenDetails.find((lines) =>
      lines.includes("Efeito autorizado somente se você aceitar: enviar a intenção ao modelo."),
    );
    const sourcesNotice = interaction.seenDetails.find((lines) =>
      lines.includes(
        "Efeito autorizado somente se você aceitar: enviar o conteúdo destas fontes ao modelo.",
      ),
    );
    const providerLines = [
      "Provedor: groq.",
      `Modelo: ${model}.`,
      "Groq: este programa envia o conteúdo autorizado à Groq e não controla a retenção na conta do provedor.",
    ];
    expect(intentionNotice).toEqual(expect.arrayContaining(providerLines));
    expect(sourcesNotice).toEqual(expect.arrayContaining(providerLines));
    expect(intentionNotice).not.toBe(sourcesNotice);
    expect([intentionNotice, sourcesNotice].flat().join("\n")).not.toMatch(
      /não treina|nao treina|não retém|nao retém|30 dias/i,
    );
  });
});

describe("fronteira do core", () => {
  it("não importa o SDK usado pelo adaptador Groq", async () => {
    const files = await readdir("src/cycle");
    for (const file of files) {
      const text = await readFile(`src/cycle/${file}`, "utf8");
      expect(text).not.toMatch(/openai|groq|@google\/genai|@anthropic-ai\/sdk/);
    }
  });
});
