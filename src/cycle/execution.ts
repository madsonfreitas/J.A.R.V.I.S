import { randomUUID } from "node:crypto";
import type {
  ActionProposal,
  PolicyDecision,
} from "./contracts.js";

export interface Permit {
  readonly runId: string;
  readonly attemptId: string;
  readonly capability: string;
  readonly resource: string;
  readonly destination: string | null;
}

export interface PermitClaim {
  readonly runId: string;
  readonly attemptId: string;
  readonly capability: string;
  readonly resource: string;
  readonly destination: string | null;
}

interface PermitState {
  consumed: boolean;
  readonly identity: PermitClaim;
}

const permitStates = new WeakMap<Permit, PermitState>();

export interface AttemptRequest<TEffect> {
  readonly proposal: ActionProposal;
  readonly evaluate: (proposal: ActionProposal) => PolicyDecision;
  readonly confirm: (decision: PolicyDecision) => Promise<boolean>;
  readonly execute: (permit: Permit) => Promise<TEffect>;
}

export interface AttemptBase {
  readonly runId: string;
  readonly attemptId: string;
  readonly decision: PolicyDecision;
}

export interface DeniedAttempt extends AttemptBase {
  readonly outcome: "denied";
}

export interface RefusedAttempt extends AttemptBase {
  readonly outcome: "refused";
}

export interface FailedAttempt extends AttemptBase {
  readonly outcome: "failed";
  readonly message: string;
  readonly cause: unknown;
}

export interface UnknownAttempt extends AttemptBase {
  readonly outcome: "unknown";
  readonly message: string;
  readonly cause: unknown;
}

export interface ExecutedAttempt<TEffect> extends AttemptBase {
  readonly outcome: "executed";
  readonly effect: TEffect;
}

export type AttemptResult<TEffect> =
  | DeniedAttempt
  | RefusedAttempt
  | FailedAttempt
  | UnknownAttempt
  | ExecutedAttempt<TEffect>;

export class UnknownEffectError extends Error {
  public constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "UnknownEffectError";
  }
}

export class CoreRun {
  public constructor(public readonly runId: string) {}

  public async attempt<TEffect>(
    request: AttemptRequest<TEffect>,
  ): Promise<AttemptResult<TEffect>> {
    const attemptId = randomUUID();
    const decision = request.evaluate(request.proposal);
    const base = { runId: this.runId, attemptId, decision };

    if (decision.outcome === "deny") {
      return { ...base, outcome: "denied" };
    }

    if (decision.outcome === "require_approval") {
      const approved = await request.confirm(decision);
      if (!approved) {
        return { ...base, outcome: "refused" };
      }
    }

    const permit = this.issuePermit(attemptId, request.proposal);

    try {
      const effect = await request.execute(permit);
      if (!isConsumed(permit)) {
        throw new Error("A capability não apresentou o Permit desta Attempt.");
      }
      return { ...base, outcome: "executed", effect };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Falha na execução da Attempt.";
      if (error instanceof UnknownEffectError) {
        return { ...base, outcome: "unknown", message, cause: error };
      }
      return { ...base, outcome: "failed", message, cause: error };
    }
  }

  private issuePermit(attemptId: string, proposal: ActionProposal): Permit {
    const permit: Permit = {
      runId: this.runId,
      attemptId,
      capability: proposal.capability,
      resource: proposal.resource,
      destination: proposal.destination,
    };
    permitStates.set(permit, {
      consumed: false,
      identity: {
        runId: permit.runId,
        attemptId: permit.attemptId,
        capability: permit.capability,
        resource: permit.resource,
        destination: permit.destination,
      },
    });
    return permit;
  }
}

export function claimPermit(permit: Permit, claim: PermitClaim): void {
  const state = permitStates.get(permit);
  if (!state) {
    throw new Error("Permit ausente ou não emitido pelo core.");
  }
  if (!sameClaim(state.identity, claim)) {
    throw new Error("Permit não pertence a esta Attempt.");
  }
  if (state.consumed) {
    throw new Error("Permit já foi consumido.");
  }
  state.consumed = true;
}

export function createCoreRun(runId: string): CoreRun {
  return new CoreRun(runId);
}

function isConsumed(permit: Permit): boolean {
  return permitStates.get(permit)?.consumed === true;
}

function sameClaim(left: PermitClaim, right: PermitClaim): boolean {
  return (
    left.runId === right.runId &&
    left.attemptId === right.attemptId &&
    left.capability === right.capability &&
    left.resource === right.resource &&
    left.destination === right.destination
  );
}

export type { AttemptOutcome } from "./contracts.js";
