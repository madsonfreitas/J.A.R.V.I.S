import type { Clarification, Goal } from "./contracts.js";

export interface UnderstandIntentRequest {
  readonly intention: string;
  readonly clarifications: readonly Clarification[];
  readonly sourceReference?: string;
}

export interface CycleIntelligencePort {
  understandIntent(request: UnderstandIntentRequest): Promise<Goal>;
}
