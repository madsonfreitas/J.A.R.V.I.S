import type { Permit } from "../cycle/execution.js";
import type { UnderstandIntentRequest } from "../cycle/intelligence-port.js";
import type {
  DocumentaryGoal,
  DraftArtifact,
  TaskContext,
} from "./contracts.js";

export type { UnderstandIntentRequest } from "../cycle/intelligence-port.js";

export interface CreateDraftRequest {
  readonly goal: DocumentaryGoal;
  readonly context: TaskContext;
}

export interface DocumentaryIntelligencePort {
  understandIntent(
    permit: Permit,
    request: UnderstandIntentRequest,
  ): Promise<DocumentaryGoal>;
  createDraft(
    permit: Permit,
    request: CreateDraftRequest,
  ): Promise<DraftArtifact>;
}
