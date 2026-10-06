import type {
  DraftArtifact,
  ExperimentInteraction,
  Goal,
  TaskStatus,
} from "../../src/documentary/contracts.js";
import type {
  CreateDraftRequest,
  DocumentaryIntelligencePort,
  UnderstandIntentRequest,
} from "../../src/documentary/intelligence-port.js";

export class FakeIntelligence implements DocumentaryIntelligencePort {
  public constructor(
    private readonly questions: readonly string[] = [],
    private readonly draftOverride: DraftArtifact | null = null,
  ) {}

  public async understandIntent(
    request: UnderstandIntentRequest,
  ): Promise<Goal> {
    return {
      summary: request.intention,
      purpose: "Produzir um artefato estruturado a partir das fontes autorizadas.",
      audience: "usuário do experimento",
      requiredSections: ["Resumo", "Evidências", "Lacunas"],
      constraints: ["Não inventar fatos", "Citar proveniência"],
      questions: request.clarifications.length > 0 ? [] : [...this.questions],
    };
  }

  public async createDraft(request: CreateDraftRequest): Promise<DraftArtifact> {
    if (this.draftOverride) {
      return this.draftOverride;
    }

    const sourceIds = request.context.sources.map((source) => source.id);
    const firstSource = sourceIds[0] ?? "missing";

    return {
      title: "Resultado experimental",
      sections: [
        {
          heading: "Resumo",
          entries: [
            {
              text: `Intenção: ${request.goal.summary}`,
              kind: "inference",
              sourceIds,
            },
          ],
        },
        {
          heading: "Evidências",
          entries: request.context.sources.map((source) => ({
            text: source.content.trim().slice(0, 180) || "Fonte vazia.",
            kind: source.content.trim() ? "fact" : "gap",
            sourceIds: [source.id],
          })),
        },
        {
          heading: "Lacunas",
          entries: [
            {
              text: "O conjunto de fontes é incompleto para um resultado definitivo.",
              kind: "gap",
              sourceIds: [firstSource],
            },
          ],
        },
      ],
      gaps: ["As fontes não cobrem orçamento."],
      conflicts: request.context.sources.length > 1
        ? [
            {
              description: "As fontes divergem em pelo menos um ponto factual.",
              sourceIds,
            },
          ]
        : [],
      assumptions: ["O usuário autorizou somente as fontes informadas."],
    };
  }
}

export class ScriptedInteraction implements ExperimentInteraction {
  public readonly statuses: TaskStatus[] = [];
  public preview: string | null = null;
  private confirmIndex = 0;
  private questionIndex = 0;

  public constructor(
    private readonly confirms: readonly boolean[],
    private readonly answers: readonly string[],
    private readonly outputPath: string,
  ) {}

  public async showStatus(status: TaskStatus): Promise<void> {
    this.statuses.push(status);
  }

  public async ask(): Promise<string> {
    const answer = this.answers[this.questionIndex];
    this.questionIndex += 1;
    if (answer === undefined) {
      throw new Error("Pergunta sem resposta scriptada.");
    }
    return answer;
  }

  public async confirm(): Promise<boolean> {
    const value = this.confirms[this.confirmIndex];
    this.confirmIndex += 1;
    if (value === undefined) {
      throw new Error("Confirmação sem resposta scriptada.");
    }
    return value;
  }

  public async showPreview(markdown: string): Promise<void> {
    this.preview = markdown;
  }

  public async requestOutputPath(): Promise<string> {
    return this.outputPath;
  }
}
