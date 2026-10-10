import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import type Anthropic from "@anthropic-ai/sdk";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ActionProposal, PolicyDecision, PolicyOutcome } from "../src/cycle/contracts.js";
import { createCoreRun, type Permit } from "../src/cycle/execution.js";
import { ExperimentRunner } from "../src/documentary/runner.js";
import { FileCapabilities } from "../src/documentary/files.js";
import type { CreateDraftRequest, UnderstandIntentRequest } from "../src/documentary/intelligence-port.js";
import { AnthropicIntelligence } from "../src/intelligence/anthropic-intelligence.js";
import { createRunRecorder } from "../src/observability/run-recorder.js";
import { ScriptedInteraction } from "./helpers/fakes.js";

const model = "fake-model";
const sourceAlpha = resolve("tests/fixtures/alpha.txt");

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

function modelClient() {
  const create = vi.fn(async (body: { messages: Array<{ content: string }> }) => {
    const prompt = body.messages[0]?.content ?? "";
    const payload = prompt.includes("Fontes autorizadas") ? draftJson : goalJson;
    return { content: [{ type: "text", text: JSON.stringify(payload) }] };
  });
  const client = { messages: { create } } as unknown as Anthropic;
  return { create, intelligence: new AnthropicIntelligence(client, model) };
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
        path: sourceAlpha,
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

describe("chamadas externas ao modelo", () => {
  it("não chama o modelo quando o envio das fontes é negado", async () => {
    const { create, intelligence } = modelClient();
    const result = await createCoreRun("deny-sources").attempt({
      proposal: proposal("send_sources_to_model"),
      evaluate: decide("deny"),
      confirm: async () => true,
      execute: (permit) => intelligence.createDraft(permit, draftRequest),
    });

    expect(result.outcome).toBe("denied");
    expect(create).not.toHaveBeenCalled();
  });

  it("não chama o modelo quando o envio das fontes é recusado", async () => {
    const { create, intelligence } = modelClient();
    const result = await createCoreRun("refuse-sources").attempt({
      proposal: proposal("send_sources_to_model"),
      evaluate: decide("require_approval"),
      confirm: async () => false,
      execute: (permit) => intelligence.createDraft(permit, draftRequest),
    });

    expect(result.outcome).toBe("refused");
    expect(create).not.toHaveBeenCalled();
  });

  it("chama o modelo dentro da execução aprovada do envio das fontes", async () => {
    const { create, intelligence } = modelClient();
    let insideExecute = false;
    const result = await createCoreRun("allow-sources").attempt({
      proposal: proposal("send_sources_to_model"),
      evaluate: decide("require_approval"),
      confirm: async () => true,
      execute: async (permit) => {
        insideExecute = true;
        const draft = await intelligence.createDraft(permit, draftRequest);
        insideExecute = false;
        return draft;
      },
    });

    expect(result.outcome).toBe("executed");
    expect(create).toHaveBeenCalledTimes(1);
    expect(insideExecute).toBe(false);
  });

  it("não deixa o Permit das fontes autorizar o envio da intenção", async () => {
    const { create, intelligence } = modelClient();
    const result = await createCoreRun("isolate").attempt({
      proposal: proposal("send_sources_to_model"),
      evaluate: decide("allow"),
      confirm: async () => true,
      execute: async (permit) => {
        await expect(
          intelligence.understandIntent(permit, intentionRequest),
        ).rejects.toThrow(/não pertence/);
        return intelligence.createDraft(permit, draftRequest);
      },
    });

    expect(result.outcome).toBe("executed");
    expect(create).toHaveBeenCalledTimes(1);
  });

  it("executa understandIntent dentro da própria Attempt", async () => {
    const { create, intelligence } = modelClient();
    let sawPermit = false;
    const result = await createCoreRun("intention").attempt({
      proposal: proposal("send_intention_to_model"),
      evaluate: decide("require_approval"),
      confirm: async () => true,
      execute: async (permit) => {
        sawPermit = permit.capability === "send_intention_to_model";
        return intelligence.understandIntent(permit, intentionRequest);
      },
    });

    expect(sawPermit).toBe(true);
    expect(result.outcome).toBe("executed");
    expect(create).toHaveBeenCalledTimes(1);
  });

  it("não trata o sucesso do envio das fontes como autorização de outra chamada", async () => {
    const { create, intelligence } = modelClient();
    let sourcesPermit: Permit | undefined;
    const sent = await createCoreRun("no-implicit").attempt({
      proposal: proposal("send_sources_to_model"),
      evaluate: decide("allow"),
      confirm: async () => true,
      execute: async (permit) => {
        sourcesPermit = permit;
        return intelligence.createDraft(permit, draftRequest);
      },
    });

    expect(sent.outcome).toBe("executed");
    expect(create).toHaveBeenCalledTimes(1);
    await expect(
      intelligence.understandIntent(sourcesPermit as Permit, intentionRequest),
    ).rejects.toThrow(/não pertence|consumido/);
    expect(create).toHaveBeenCalledTimes(1);
  });

  it("marca unknown quando a chamada externa não confirma o efeito", async () => {
    const create = vi.fn(async () => {
      throw new Error("provider down");
    });
    const intelligence = new AnthropicIntelligence(
      { messages: { create } } as unknown as Anthropic,
      model,
    );
    const result = await createCoreRun("fail-call").attempt({
      proposal: proposal("send_intention_to_model"),
      evaluate: decide("allow"),
      confirm: async () => true,
      execute: (permit) => intelligence.understandIntent(permit, intentionRequest),
    });

    expect(create).toHaveBeenCalledTimes(1);
    expect(result.outcome).toBe("unknown");
  });

  it("não chama o modelo quando a Attempt da intenção é negada ou recusada", async () => {
    const { create, intelligence } = modelClient();
    const denied = await createCoreRun("deny-intention").attempt({
      proposal: proposal("send_intention_to_model"),
      evaluate: decide("deny"),
      confirm: async () => true,
      execute: (permit) => intelligence.understandIntent(permit, intentionRequest),
    });
    const refused = await createCoreRun("refuse-intention").attempt({
      proposal: proposal("send_intention_to_model"),
      evaluate: decide("require_approval"),
      confirm: async () => false,
      execute: (permit) => intelligence.understandIntent(permit, intentionRequest),
    });

    expect(denied.outcome).toBe("denied");
    expect(refused.outcome).toBe("refused");
    expect(create).not.toHaveBeenCalled();
  });
});

const directories: string[] = [];

afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

describe("runner e chamadas ao modelo", () => {
  it("não envia as fontes só porque a intenção já foi enviada", async () => {
    const { create, intelligence } = modelClient();
    const directory = await mkdtemp(join(tmpdir(), "jarvis-model-"));
    directories.push(directory);
    const recorder = await createRunRecorder(join(directory, "run.sqlite"));
    const runner = new ExperimentRunner({
      intelligence,
      files: new FileCapabilities(1_000_000),
      recorder,
      interaction: new ScriptedInteraction(
        [true, true, false],
        ["public_or_non_sensitive", "public_or_non_sensitive"],
        join(directory, "out.md"),
      ),
      maxTotalCharacters: 100_000,
      modelLabel: model,
    });

    try {
      const result = await runner.run({
        intention: "Produza um resumo operacional das fontes autorizadas.",
        sourcePaths: [sourceAlpha],
      });
      expect(result.status).toBe("cancelled");
      expect(create).toHaveBeenCalledTimes(1);
    } finally {
      recorder.close();
    }
  });
});
