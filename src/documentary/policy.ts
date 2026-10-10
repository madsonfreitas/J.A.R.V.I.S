import { resolve } from "node:path";
import type { ActionProposal, PolicyDecision } from "../cycle/contracts.js";
import type { SourceDescriptor } from "./contracts.js";
import type { DisclosureClass, SendDisclosures } from "./disclosure.js";

export class ExperimentPolicy {
  private readonly authorizedSources: ReadonlySet<string>;
  private readonly intentionClass: DisclosureClass;
  private readonly sourceClasses: ReadonlyMap<string, DisclosureClass>;
  private readonly clarificationClasses: DisclosureClass[];

  public constructor(
    sources: readonly SourceDescriptor[],
    disclosures?: SendDisclosures,
  ) {
    this.authorizedSources = new Set(
      sources.map((source) => resolve(source.path)),
    );
    this.intentionClass = disclosures?.intention ?? "unknown";
    this.sourceClasses = new Map(
      Object.entries(disclosures?.sources ?? {}).map(([path, value]) => [
        resolve(path),
        value,
      ]),
    );
    this.clarificationClasses = [...(disclosures?.clarifications ?? [])];
  }

  public addClarificationDisclosure(value: DisclosureClass): void {
    this.clarificationClasses.push(value);
  }

  public evaluate(action: ActionProposal): PolicyDecision {
    switch (action.capability) {
      case "read_source":
        return this.evaluateRead(action);
      case "send_sources_to_model":
      case "send_intention_to_model": {
        const blocked = this.blockedPayloads();
        if (blocked.length > 0) {
          return {
            action,
            outcome: "deny",
            reason: `Envio bloqueado. Estes payloads não estão declarados como public_or_non_sensitive: ${blocked.join(", ")}.`,
          };
        }
        return {
          action,
          outcome: "require_approval",
          reason:
            "Enviar conteúdo a um provedor externo exige consentimento explícito.",
        };
      }
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

  private blockedPayloads(): string[] {
    const blocked: string[] = [];
    if (this.intentionClass !== "public_or_non_sensitive") {
      blocked.push("intenção");
    }
    for (const path of this.authorizedSources) {
      if (this.sourceClasses.get(path) !== "public_or_non_sensitive") {
        blocked.push(path);
      }
    }
    this.clarificationClasses.forEach((value, index) => {
      if (value !== "public_or_non_sensitive") {
        blocked.push(`esclarecimento ${index + 1}`);
      }
    });
    return blocked;
  }
}
