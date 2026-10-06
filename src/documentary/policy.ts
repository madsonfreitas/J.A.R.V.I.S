import { resolve } from "node:path";
import type { ActionProposal, PolicyDecision } from "../cycle/contracts.js";
import type { SourceDescriptor } from "./contracts.js";

export class ExperimentPolicy {
  private readonly authorizedSources: ReadonlySet<string>;

  public constructor(sources: readonly SourceDescriptor[]) {
    this.authorizedSources = new Set(
      sources.map((source) => resolve(source.path)),
    );
  }

  public evaluate(action: ActionProposal): PolicyDecision {
    switch (action.capability) {
      case "read_source":
        return this.evaluateRead(action);
      case "send_sources_to_model":
        return {
          action,
          outcome: "require_approval",
          reason:
            "Enviar conteúdo a um provedor externo exige consentimento explícito.",
        };
      case "create_artifact":
        return this.evaluateCreate(action);
      default:
        return {
          action,
          outcome: "deny",
          reason: "A ação não pertence ao experimento documental.",
        };
    }
  }

  private evaluateRead(action: ActionProposal): PolicyDecision {
    const resource = resolve(action.resource);

    if (!this.authorizedSources.has(resource)) {
      return {
        action,
        outcome: "deny",
        reason: "A fonte não pertence ao conjunto explicitamente autorizado.",
      };
    }

    return {
      action,
      outcome: "allow",
      reason: "A fonte foi explicitamente autorizada para leitura.",
    };
  }

  private evaluateCreate(action: ActionProposal): PolicyDecision {
    if (action.destination === null) {
      return {
        action,
        outcome: "deny",
        reason: "O destino do artefato não foi informado.",
      };
    }

    const destination = resolve(action.destination);

    if (this.authorizedSources.has(destination)) {
      return {
        action,
        outcome: "deny",
        reason: "Uma fonte original nunca pode ser sobrescrita.",
      };
    }

    if (!destination.toLowerCase().endsWith(".md")) {
      return {
        action,
        outcome: "deny",
        reason: "O vertical slice cria somente artefatos Markdown.",
      };
    }

    return {
      action,
      outcome: "require_approval",
      reason:
        "Criar um efeito persistente exige aprovação do destino final.",
    };
  }
}
