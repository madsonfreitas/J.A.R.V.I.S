import type { Clarification, Goal } from "./contracts.js";

export interface UnderstandIntentRequest {
  readonly intention: string;
  readonly clarifications: readonly Clarification[];
}

export interface CycleIntelligencePort {
  understandIntent(request: UnderstandIntentRequest): Promise<Goal>;
}
