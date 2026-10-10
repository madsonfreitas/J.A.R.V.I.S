import { readdir, readFile } from "node:fs/promises";
import type { GoogleGenAI } from "@google/genai";
import { describe, expect, it, vi } from "vitest";
import type { ActionProposal, PolicyDecision, PolicyOutcome } from "../src/cycle/contracts.js";
import { createCoreRun, type Permit } from "../src/cycle/execution.js";
import type { CreateDraftRequest, UnderstandIntentRequest } from "../src/documentary/intelligence-port.js";
import { GeminiIntelligence } from "../src/intelligence/gemini-intelligence.js";

const model = "gemini-3.8-flash";
const secret = "gemini-test-key";

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

function clientFor(payload: unknown) {
  const generateContent = vi.fn(
    async (_request: {
      config?: {
        httpOptions?: unknown;
        tools?: unknown;
        responseMimeType?: string;
      };
    }) => ({ text: JSON.stringify(payload) }),
  );
  const client = { models: { generateContent } } as unknown as GoogleGenAI;
  return {
    generateContent,
    intelligence: new GeminiIntelligence(client, model, secret),
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

describe("GeminiIntelligence", () => {
  it("não chama o SDK quando a Attempt é negada ou recusada", async () => {
    const { generateContent, intelligence } = clientFor(goalJson);
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
    expect(generateContent).not.toHaveBeenCalled();
  });

  it("reivindica o Permit da capability antes da única chamada", async () => {
    const { generateContent, intelligence } = clientFor(goalJson);
    const result = await createCoreRun("once").attempt({
      proposal: proposal("send_intention_to_model"),
      evaluate: decide("require_approval"),
      confirm: async () => true,
      execute: (permit) => intelligence.understandIntent(permit, intentionRequest),
    });

    expect(result.outcome).toBe("executed");
    expect(generateContent).toHaveBeenCalledTimes(1);
    const request = generateContent.mock.calls[0]?.[0];
    expect(request?.config?.responseMimeType).toBe("application/json");
    expect(request?.config?.httpOptions).toBeUndefined();
    expect(request?.config?.tools).toBeUndefined();
  });

  it("não aceita Permit de outra capability ou o mesmo Permit outra vez", async () => {
    const { generateContent, intelligence } = clientFor(draftJson);
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
    expect(generateContent).toHaveBeenCalledTimes(1);
    await expect(
      intelligence.createDraft(captured as Permit, draftRequest),
    ).rejects.toThrow(/consumido/);
    expect(generateContent).toHaveBeenCalledTimes(1);
  });

  it("trata exceção do cliente como efeito incerto, sem nova chamada", async () => {
    const generateContent = vi.fn(async () => {
      throw new Error(`provider down ${secret}`);
    });
    const intelligence = new GeminiIntelligence(
      { models: { generateContent } } as unknown as GoogleGenAI,
      model,
      secret,
    );
    const result = await createCoreRun("down").attempt({
      proposal: proposal("send_intention_to_model"),
      evaluate: decide("allow"),
      confirm: async () => true,
      execute: (permit) => intelligence.understandIntent(permit, intentionRequest),
    });

    expect(result.outcome).toBe("unknown");
    expect(generateContent).toHaveBeenCalledTimes(1);
    if (result.outcome === "unknown") {
      expect(result.message).not.toContain(secret);
    }
  });

  it("rejeita JSON inválido depois da resposta, sem retry", async () => {
    const generateContent = vi.fn(async () => ({ text: "não é json" }));
    const intelligence = new GeminiIntelligence(
      { models: { generateContent } } as unknown as GoogleGenAI,
      model,
      secret,
    );
    const result = await createCoreRun("bad-json").attempt({
      proposal: proposal("send_intention_to_model"),
      evaluate: decide("allow"),
      confirm: async () => true,
      execute: (permit) => intelligence.understandIntent(permit, intentionRequest),
    });

    expect(result.outcome).toBe("failed");
    expect(generateContent).toHaveBeenCalledTimes(1);
  });
});

describe("fronteira do core", () => {
  it("não importa SDKs de provedores", async () => {
    const files = await readdir("src/cycle");
    for (const file of files) {
      const text = await readFile(`src/cycle/${file}`, "utf8");
      expect(text).not.toMatch(/@google\/genai|@anthropic-ai\/sdk/);
    }
  });
});
