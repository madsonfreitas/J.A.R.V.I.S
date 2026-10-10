import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import {
  ExperimentCancelledError,
  type ActionProposal,
  type Clarification,
  type PolicyDecision,
  type RunStatus,
} from "../cycle/contracts.js";
import {
  createCoreRun,
  type AttemptResult,
  type CoreRun,
  type Permit,
} from "../cycle/execution.js";
import type { ProviderName } from "../config.js";
import { disclosurePrompt, parseDisclosure, type SendDisclosures } from "./disclosure.js";
import type { DocumentaryIntelligencePort } from "./intelligence-port.js";
import { TaskContextBuilder } from "./context.js";
import type {
  CapabilityEffect,
  DocumentaryGoal,
  ExperimentInput,
  ExperimentInteraction,
  ExperimentResult,
  ExperimentStatus,
  SourceDescriptor,
  TaskContext,
  ValidationReport,
} from "./contracts.js";
import { FileCapabilities } from "./files.js";
import { ExperimentPolicy } from "./policy.js";
import { MarkdownRenderer } from "./renderer.js";
import { ResultValidator } from "./validator.js";
import { RunRecorder } from "../observability/run-recorder.js";

const MAX_CLARIFICATION_ROUNDS = 3;

export interface ExperimentDependencies {
  readonly intelligence: DocumentaryIntelligencePort;
  readonly files: FileCapabilities;
  readonly recorder: RunRecorder;
  readonly interaction: ExperimentInteraction;
  readonly maxTotalCharacters: number;
  readonly modelLabel: string;
  readonly provider?: ProviderName;
}

export class ExperimentRunner {
  private readonly contextBuilder: TaskContextBuilder;
  private readonly validator = new ResultValidator();
  private readonly renderer = new MarkdownRenderer();

  public constructor(private readonly deps: ExperimentDependencies) {
    this.contextBuilder = new TaskContextBuilder(deps.maxTotalCharacters);
  }

  public async run(input: ExperimentInput): Promise<ExperimentResult> {
    const runId = randomUUID();
    const effects: CapabilityEffect[] = [];
    const clarifications: Clarification[] = [];
    let goal: DocumentaryGoal | null = null;
    let outputPath: string | null = null;
    let validation: ValidationReport | null = null;
    let message = "Execução iniciada.";

    this.deps.recorder.start(runId, input.intention);

    const session = createCoreRun(runId);
    const setStatus = async (status: ExperimentStatus, nextMessage: string) => {
      message = nextMessage;
      this.deps.recorder.setStatus(runId, status, nextMessage);
      await this.deps.interaction.showStatus(status, nextMessage);
    };

    try {
      await setStatus("received", "Intenção recebida.");

      if (input.intention.trim().length === 0) {
        await setStatus("rejected", "A intenção não pode estar vazia.");
        return this.finish(runId, "rejected", goal, outputPath, validation, effects, message);
      }

      if (input.sourcePaths.length === 0) {
        await setStatus("rejected", "Pelo menos uma fonte autorizada é necessária.");
        return this.finish(runId, "rejected", goal, outputPath, validation, effects, message);
      }

      const sources = await this.inspectSources(input.sourcePaths);
      this.deps.recorder.record(runId, "sources_inspected", {
        sources: sources.map((source) => ({
          id: source.id,
          path: source.path,
          sizeBytes: source.sizeBytes,
        })),
      });

      const policy = new ExperimentPolicy(
        sources,
        await this.declarePayloads(sources),
      );

      await setStatus("building_context", "Avaliando leitura das fontes autorizadas.");
      for (const source of sources) {
        const preview = policy.evaluate(readAction(source));
        if (preview.outcome === "deny") {
          const outcome = await this.perform(session, readAction(source), policy, async () => {
            throw new Error("Leitura negada não pode executar.");
          });
          return this.finishAttempt(
            runId,
            outcome,
            goal,
            outputPath,
            validation,
            effects,
            setStatus,
          );
        }
      }

      const understood = await this.requestIntention(
        session,
        policy,
        input.intention,
        clarifications,
        setStatus,
      );
      if (!isGoal(understood)) {
        return understood;
      }
      goal = understood;

      for (let round = 0; round < MAX_CLARIFICATION_ROUNDS; round += 1) {
        if (goal.questions.length === 0) {
          break;
        }

        await setStatus(
          "awaiting_clarification",
          `Esclarecendo o objetivo (rodada ${round + 1}).`,
        );

        for (const question of goal.questions) {
          const answer = await this.deps.interaction.ask(question);
          clarifications.push({ question, answer });
          policy.addClarificationDisclosure(
            parseDisclosure(
              await this.deps.interaction.ask(
                disclosurePrompt(
                  "o esclarecimento recém-informado, antes de enviá-lo ao modelo",
                ),
              ),
            ),
          );
        }

        const nextGoal = await this.requestIntention(
          session,
          policy,
          input.intention,
          clarifications,
          setStatus,
        );
        if (!isGoal(nextGoal)) {
          return nextGoal;
        }
        goal = nextGoal;
      }

      const goalConfirmed = await this.deps.interaction.confirm(
        "Confirmar objetivo",
        [
          "Aceitar a interpretação não cria Permit e não autoriza envio nem arquivo.",
          `Resumo: ${goal.summary}`,
          `Finalidade: ${goal.purpose}`,
          `Público: ${goal.audience ?? "não informado"}`,
          `Seções: ${goal.requiredSections.join(", ")}`,
          ...goal.constraints.map((constraint) => `Restrição: ${constraint}`),
        ],
      );
      if (!goalConfirmed) {
        throw new ExperimentCancelledError("O objetivo não foi confirmado.");
      }
      await setStatus("objective_confirmed", "Objetivo confirmado pelo usuário.");

      if (goal === null) {
        throw new Error("O objetivo confirmado não está disponível.");
      }
      const confirmedGoal = goal;

      await setStatus("building_context", "Lendo fontes autorizadas.");
      const reads: { source: SourceDescriptor; content: string }[] = [];
      for (const source of sources) {
        const outcome = await this.perform(
          session,
          readAction(source),
          policy,
          (permit) => this.deps.files.readSource(permit, source),
        );
        if (outcome.outcome !== "executed") {
          return this.finishAttempt(
            runId,
            outcome,
            goal,
            outputPath,
            validation,
            effects,
            setStatus,
          );
        }
        reads.push({ source, content: outcome.effect });
        effects.push({
          action: "read_source",
          resource: source.path,
          observed: true,
          details: "Fonte lida como conteúdo não confiável (untrusted_content).",
        });
      }
      const context: TaskContext = this.contextBuilder.assemble(reads);
      this.deps.recorder.record(runId, "context_built", {
        warnings: context.warnings,
        totalCharacters: context.totalCharacters,
      });

      const draftOutcome = await this.perform(
        session,
        sendToModelAction(this.deps.modelLabel),
        policy,
        (permit) =>
          this.deps.intelligence.createDraft(permit, {
            goal: confirmedGoal,
            context,
          }),
        async (decision) => {
          await setStatus("awaiting_approval", decision.reason);
          return this.deps.interaction.confirm("Enviar fontes ao provedor de IA", [
            "Efeito autorizado somente se você aceitar: enviar o conteúdo destas fontes ao modelo.",
            ...this.providerNotice(),
            "O conteúdo das fontes autorizadas será enviado agora.",
            "Não envie documentos com segredos.",
            "Esta confirmação não classifica o conteúdo e não autoriza outra chamada.",
            "Isto não autoriza criar o arquivo.",
            ...sources.map((source) => `Fonte: ${source.path}`),
          ]);
        },
      );
      if (draftOutcome.outcome !== "executed") {
        return this.finishAttempt(
          runId,
          draftOutcome,
          goal,
          outputPath,
          validation,
          effects,
          setStatus,
        );
      }
      const draft = draftOutcome.effect;
      this.deps.recorder.record(runId, "approval", {
        action: "send_sources_to_model",
        approved: true,
      });

      await setStatus("validating", "Validando o rascunho contra fontes e critérios.");
      validation = this.validator.validate(goal, draft, context);
      this.deps.recorder.record(runId, "validation", {
        status: validation.status,
        issues: validation.issues,
        metrics: validation.metrics,
      });

      if (validation.status === "invalid") {
        await setStatus(
          "failed",
          "O rascunho não atendeu aos critérios de rastreabilidade ou estrutura.",
        );
        return this.finish(runId, "failed", goal, outputPath, validation, effects, message);
      }

      const markdown = this.renderer.render(goal, draft, validation);
      await this.deps.interaction.showPreview(markdown);

      outputPath = resolve(await this.deps.interaction.requestOutputPath());
      const createOutcome = await this.perform(
        session,
        createAction(outputPath),
        policy,
        (permit) => this.deps.files.createArtifact(permit, outputPath as string, markdown),
        async (decision) => {
          await setStatus("awaiting_approval", decision.reason);
          return this.deps.interaction.confirm("Criar artefato final", [
            "Efeito autorizado somente se você aceitar: criar um arquivo novo neste destino.",
            `Destino: ${outputPath}`,
            "O arquivo será criado somente se ainda não existir.",
            "Nenhuma fonte original será alterada.",
            `Validação: ${validation?.status ?? "indisponível"}`,
          ]);
        },
      );
      if (createOutcome.outcome !== "executed") {
        return this.finishAttempt(
          runId,
          createOutcome,
          goal,
          outputPath,
          validation,
          effects,
          setStatus,
        );
      }
      effects.push(createOutcome.effect);
      this.deps.recorder.record(runId, "approval", {
        action: "create_artifact",
        approved: true,
        destination: outputPath,
      });
      this.deps.recorder.record(runId, "effect", { ...createOutcome.effect });

      const finalStatus =
        validation.status === "valid"
          ? "completed"
          : "completed_with_reservations";
      await setStatus(finalStatus, `Artefato criado em ${outputPath}.`);
      return this.finish(
        runId,
        finalStatus,
        goal,
        outputPath,
        validation,
        effects,
        message,
      );
    } catch (error) {
      if (error instanceof ExperimentCancelledError) {
        await setStatus("cancelled", error.message);
        return this.finish(
          runId,
          "cancelled",
          goal,
          outputPath,
          validation,
          effects,
          error.message,
        );
      }

      const failure =
        error instanceof Error ? error.message : "Falha inesperada na execução.";
      await setStatus("failed", failure);
      return this.finish(
        runId,
        "failed",
        goal,
        outputPath,
        validation,
        effects,
        failure,
      );
    }
  }

  private providerName(): ProviderName {
    return this.deps.provider ?? "anthropic";
  }

  private providerNotice(): string[] {
    const lines = [
      `Provedor: ${this.providerName()}.`,
      `Modelo: ${this.deps.modelLabel}.`,
    ];
    if (this.providerName() === "gemini") {
      lines.push(
        "Gemini Free Tier: os termos aplicáveis podem permitir que o Google use estes dados para melhorar seus produtos.",
      );
    }
    return lines;
  }

  private async declarePayloads(
    sources: readonly SourceDescriptor[],
  ): Promise<SendDisclosures> {
    const intention = parseDisclosure(
      await this.deps.interaction.ask(
        disclosurePrompt("a intenção que será enviada ao modelo"),
      ),
    );
    const declared: Record<string, SendDisclosures["intention"]> = {};
    for (const source of sources) {
      declared[source.path] = parseDisclosure(
        await this.deps.interaction.ask(
          disclosurePrompt(`a fonte ${source.name} que poderá ser enviada ao modelo`),
        ),
      );
    }
    return { intention, sources: declared, clarifications: [] };
  }

  private async inspectSources(
    paths: readonly string[],
  ): Promise<SourceDescriptor[]> {
    const sources: SourceDescriptor[] = [];
    const seen = new Set<string>();

    for (const path of paths) {
      const source = await this.deps.files.inspect(path);
      if (seen.has(source.path)) {
        continue;
      }
      seen.add(source.path);
      sources.push(source);
    }

    return sources;
  }

  private async requestIntention(
    session: CoreRun,
    policy: ExperimentPolicy,
    intention: string,
    clarifications: readonly Clarification[],
    setStatus: (status: ExperimentStatus, message: string) => Promise<void>,
  ): Promise<DocumentaryGoal | ExperimentResult> {
    await setStatus("understanding", "Compreendendo a intenção.");
    const outcome = await this.perform(
      session,
      modelAction("send_intention_to_model", this.deps.modelLabel, "Enviar a intenção ao provedor de inteligência."),
      policy,
      (permit) =>
        this.deps.intelligence.understandIntent(permit, {
          intention,
          clarifications,
        }),
      async (decision) => {
        await setStatus("awaiting_approval", decision.reason);
        return this.deps.interaction.confirm("Enviar intenção ao provedor de IA", [
          "Efeito autorizado somente se você aceitar: enviar a intenção ao modelo.",
          ...this.providerNotice(),
          "A intenção e os esclarecimentos já classificados serão enviados agora.",
          "As fontes ainda não entram nesta chamada.",
          "Esta confirmação não classifica o conteúdo e não autoriza outra chamada.",
          "Isto não autoriza o envio das fontes nem a criação do arquivo.",
        ]);
      },
    );
    if (outcome.outcome !== "executed") {
      return this.finishAttempt(
        outcome.runId,
        outcome,
        null,
        null,
        null,
        [],
        setStatus,
      );
    }
    this.deps.recorder.record(outcome.runId, "approval", {
      action: "send_intention_to_model",
      approved: true,
    });
    return outcome.effect;
  }

  private async perform<TEffect>(
    session: CoreRun,
    proposal: ActionProposal,
    policy: ExperimentPolicy,
    execute: (permit: Permit) => Promise<TEffect>,
    confirm?: (decision: PolicyDecision) => Promise<boolean>,
  ): Promise<AttemptResult<TEffect>> {
    const outcome = await session.attempt({
      proposal,
      evaluate: (action) => policy.evaluate(action),
      confirm: async (current) => confirm?.(current) ?? false,
      execute: async (permit) => {
        await this.deps.interaction.showStatus("executing", proposal.effect);
        return execute(permit);
      },
    });
    this.recordAttempt(outcome.runId, outcome);
    return outcome;
  }

  private recordAttempt<TEffect>(
    runId: string,
    outcome: AttemptResult<TEffect>,
  ): void {
    const decision = outcome.decision;
    this.deps.recorder.record(runId, "policy", {
      attemptId: outcome.attemptId,
      outcome: decision.outcome,
      reason: decision.reason,
      resource: decision.action.resource,
      destination: decision.action.destination,
      action: decision.action.capability,
    });
    this.deps.recorder.record(runId, "attempt", {
      runId,
      attemptId: outcome.attemptId,
      action: decision.action.capability,
      policy: decision.outcome,
      approval:
        decision.outcome === "require_approval"
          ? outcome.outcome !== "refused"
          : null,
      permitIssued: outcome.outcome !== "denied" && outcome.outcome !== "refused",
      permitConsumed: outcome.outcome === "executed" || outcome.outcome === "unknown",
      executionStarted:
        outcome.outcome === "executed" ||
        outcome.outcome === "failed" ||
        outcome.outcome === "unknown",
      outcome: outcome.outcome,
      error:
        outcome.outcome === "failed" || outcome.outcome === "unknown"
          ? outcome.message
          : null,
    });
  }

  private async finishAttempt<TEffect>(
    runId: string,
    outcome: AttemptResult<TEffect>,
    goal: DocumentaryGoal | null,
    outputPath: string | null,
    validation: ValidationReport | null,
    effects: readonly CapabilityEffect[],
    setStatus: (status: ExperimentStatus, message: string) => Promise<void>,
  ): Promise<ExperimentResult> {
    if (outcome.outcome === "denied") {
      await setStatus("rejected", outcome.decision.reason);
      return this.finish(runId, "rejected", goal, outputPath, validation, effects, outcome.decision.reason);
    }
    if (outcome.outcome === "refused") {
      const reason = "A aprovação exigida foi recusada.";
      await setStatus("cancelled", reason);
      return this.finish(runId, "cancelled", goal, outputPath, validation, effects, reason);
    }
    if (outcome.outcome === "failed") {
      await setStatus("failed", outcome.message);
      return this.finish(runId, "failed", goal, outputPath, validation, effects, outcome.message);
    }
    if (outcome.outcome === "unknown") {
      await setStatus("unknown", outcome.message);
      return this.finish(runId, "unknown", goal, outputPath, validation, effects, outcome.message);
    }
    throw new Error("Attempt executada não encerra o Run por aqui.");
  }

  private finish(
    runId: string,
    status: RunStatus,
    goal: DocumentaryGoal | null,
    outputPath: string | null,
    validation: ValidationReport | null,
    effects: readonly CapabilityEffect[],
    message: string,
  ): ExperimentResult {
    this.deps.recorder.finish(runId, status, message);
    return {
      runId,
      status,
      goal,
      outputPath,
      validation,
      effects,
      message,
    };
  }
}

function modelAction(
  capability: string,
  modelLabel: string,
  effect: string,
): ActionProposal {
  return {
    capability,
    resource: modelLabel,
    destination: modelLabel,
    effect,
    reversible: false,
  };
}

function isGoal(
  value: DocumentaryGoal | ExperimentResult,
): value is DocumentaryGoal {
  return !("runId" in value);
}

function readAction(source: SourceDescriptor): ActionProposal {
  return {
    capability: "read_source",
    resource: source.path,
    destination: null,
    effect: "Ler conteúdo da fonte autorizada.",
    reversible: true,
  };
}

function sendToModelAction(modelLabel: string): ActionProposal {
  return modelAction(
    "send_sources_to_model",
    modelLabel,
    "Enviar o conteúdo das fontes ao provedor de inteligência.",
  );
}

function createAction(destination: string): ActionProposal {
  return {
    capability: "create_artifact",
    resource: destination,
    destination,
    effect: "Criar um novo artefato Markdown sem alterar originais.",
    reversible: false,
  };
}
