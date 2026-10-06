export type TaskStatus =
  | "received"
  | "understanding"
  | "awaiting_clarification"
  | "objective_confirmed"
  | "building_context"
  | "awaiting_approval"
  | "executing"
  | "validating"
  | "completed"
  | "completed_with_reservations"
  | "rejected"
  | "cancelled"
  | "failed";

export interface Clarification {
  readonly question: string;
  readonly answer: string;
}

export interface Goal {
  readonly summary: string;
  readonly purpose: string;
  readonly constraints: readonly string[];
  readonly questions: readonly string[];
}

export interface ActionProposal {
  readonly capability: string;
  readonly resource: string;
  readonly destination: string | null;
  readonly effect: string;
  readonly reversible: boolean;
}

export type PolicyOutcome =
  | "allow"
  | "require_approval"
  | "deny";

export interface PolicyDecision {
  readonly outcome: PolicyOutcome;
  readonly reason: string;
  readonly action: ActionProposal;
}

export class ExperimentCancelledError extends Error {
  public constructor(message = "Experimento cancelado pelo usuário.") {
    super(message);
    this.name = "ExperimentCancelledError";
  }
}
