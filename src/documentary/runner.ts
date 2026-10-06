import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import {
  ExperimentCancelledError,
  type ActionProposal,
  type Clarification,
  type PolicyDecision,
  type TaskStatus,
} from "../cycle/contracts.js";
import type { DocumentaryIntelligencePort } from "./intelligence-port.js";
import { TaskContextBuilder } from "./context.js";
import type {
  CapabilityEffect,
  DocumentaryGoal,
  ExperimentInput,
  ExperimentInteraction,
  ExperimentResult,
  SourceDescriptor,
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
}

export class ExperimentRunner {
  private readonly contextBuilder: TaskContextBuilder;
  private readonly validator = new ResultValidator();
  private readonly renderer = new MarkdownRenderer();

  public constructor(private readonly deps: ExperimentDependencies) {
    this.contextBuilder = new TaskContextBuilder(
      deps.files,
      deps.maxTotalCharacters,
    );
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

    const setStatus = async (status: TaskStatus, nextMessage: string) => {
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

      const policy = new ExperimentPolicy(sources);

      await setStatus("building_context", "Avaliando leitura das fontes autorizadas.");
      for (const source of sources) {
        const decision = this.requireDecision(
          runId,
          policy.evaluate(readAction(source)),
        );
        if (decision.outcome === "deny") {
          await setStatus("rejected", decision.reason);
          return this.finish(runId, "rejected", goal, outputPath, validation, effects, message);
        }
      }

      const sendDecision = this.requireDecision(
        runId,
        policy.evaluate(sendToModelAction(this.deps.modelLabel)),
      );
      await setStatus("awaiting_approval", sendDecision.reason);
      const sendApproved = await this.deps.interaction.confirm(
        "Enviar conteúdo ao provedor de IA",
        [
          `Provedor/modelo: ${this.deps.modelLabel}`,
          "As fontes autorizadas serão enviadas como dados não confiáveis.",
          "Não envie documentos com segredos.",
          ...sources.map((source) => `Fonte: ${source.path}`),
        ],
      );
      if (!sendApproved) {
        throw new ExperimentCancelledError(
          "O envio de conteúdo ao provedor foi recusado.",
        );
      }
      this.deps.recorder.record(runId, "approval", {
        action: "send_sources_to_model",
        approved: true,
      });

      await setStatus("understanding", "Compreendendo a intenção.");
      goal = await this.deps.intelligence.understandIntent({
        intention: input.intention,
        clarifications,
      });

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
        }

        goal = await this.deps.intelligence.understandIntent({
          intention: input.intention,
          clarifications,
        });
      }

      const goalConfirmed = await this.deps.interaction.confirm(
        "Confirmar objetivo",
        [
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

      await setStatus("building_context", "Lendo fontes autorizadas.");
      const context = await this.contextBuilder.build(sources);
      for (const source of context.sources) {
        effects.push({
          action: "read_source",
          resource: source.path,
          observed: true,
          details: `Fonte lida como conteúdo não confiável (${source.trust}).`,
        });
      }
      this.deps.recorder.record(runId, "context_built", {
        warnings: context.warnings,
        totalCharacters: context.totalCharacters,
      });

      await setStatus("executing", "Formulando o rascunho estruturado.");
      const draft = await this.deps.intelligence.createDraft({ goal, context });

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

      await setStatus("awaiting_approval", "Aguardando destino e aprovação do artefato.");
      outputPath = resolve(await this.deps.interaction.requestOutputPath());

      const createDecision = this.requireDecision(
        runId,
        policy.evaluate(createAction(outputPath)),
      );
      if (createDecision.outcome === "deny") {
        await setStatus("rejected", createDecision.reason);
        return this.finish(runId, "rejected", goal, outputPath, validation, effects, message);
      }

      const createApproved = await this.deps.interaction.confirm(
        "Criar artefato final",
        [
          `Destino: ${outputPath}`,
          "O arquivo será criado somente se ainda não existir.",
          "Nenhuma fonte original será alterada.",
          `Validação: ${validation.status}`,
        ],
      );
      if (!createApproved) {
        throw new ExperimentCancelledError("A criação do artefato foi recusada.");
      }
      this.deps.recorder.record(runId, "approval", {
        action: "create_artifact",
        approved: true,
        destination: outputPath,
      });

      await setStatus("executing", "Criando o artefato final.");
      const effect = await this.deps.files.createArtifact(outputPath, markdown);
      effects.push(effect);
      this.deps.recorder.record(runId, "effect", { ...effect });

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

  private requireDecision(
    runId: string,
    decision: PolicyDecision,
  ): PolicyDecision {
    this.deps.recorder.record(runId, "policy", {
      outcome: decision.outcome,
      reason: decision.reason,
      resource: decision.action.resource,
      action: decision.action.capability,
    });
    return decision;
  }

  private finish(
    runId: string,
    status: TaskStatus,
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
  return {
    capability: "send_sources_to_model",
    resource: modelLabel,
    destination: modelLabel,
    effect: "Enviar conteúdo das fontes a um provedor externo.",
    reversible: false,
  };
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
