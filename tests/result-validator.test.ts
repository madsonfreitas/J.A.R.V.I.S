import { describe, expect, it } from "vitest";
import type {
  DraftArtifact,
  Goal,
  TaskContext,
} from "../src/documentary/contracts.js";
import { ResultValidator } from "../src/documentary/validator.js";

const goal: Goal = {
  summary: "Resumir as fontes",
  purpose: "Validar rastreabilidade",
  audience: null,
  requiredSections: ["Resumo", "Evidências"],
  constraints: [],
  questions: [],
};

const context: TaskContext = {
  sources: [
    {
      id: "alpha-1",
      path: "/tmp/alpha.txt",
      name: "alpha.txt",
      sizeBytes: 12,
      content: "Prazo 12",
      trust: "untrusted_content",
    },
  ],
  totalCharacters: 8,
  warnings: [],
};

describe("ResultValidator", () => {
  it("reprova fato sem proveniência", () => {
    const draft: DraftArtifact = {
      title: "Rascunho",
      sections: [
        {
          heading: "Resumo",
          entries: [{ text: "Afirmação sem fonte", kind: "fact", sourceIds: [] }],
        },
        {
          heading: "Evidências",
          entries: [{ text: "Outra afirmação", kind: "fact", sourceIds: ["ghost"] }],
        },
      ],
      gaps: [],
      conflicts: [],
      assumptions: [],
    };

    const report = new ResultValidator().validate(goal, draft, context);
    expect(report.status).toBe("invalid");
    expect(report.issues.some((issue) => issue.code === "untraceable_fact")).toBe(
      true,
    );
    expect(report.issues.some((issue) => issue.code === "unknown_source")).toBe(
      true,
    );
  });

  it("aceita rascunho rastreável com lacunas como reserva", () => {
    const draft: DraftArtifact = {
      title: "Rascunho",
      sections: [
        {
          heading: "Resumo",
          entries: [
            { text: "Prazo citado", kind: "fact", sourceIds: ["alpha-1"] },
          ],
        },
        {
          heading: "Evidências",
          entries: [
            { text: "Conteúdo da fonte", kind: "fact", sourceIds: ["alpha-1"] },
          ],
        },
      ],
      gaps: ["Orçamento ausente"],
      conflicts: [],
      assumptions: [],
    };

    const report = new ResultValidator().validate(goal, draft, context);
    expect(report.status).toBe("valid_with_reservations");
    expect(report.metrics.traceableEntries).toBe(2);
  });
});
