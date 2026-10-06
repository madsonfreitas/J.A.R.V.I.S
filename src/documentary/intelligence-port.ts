export type { UnderstandIntentRequest } from "../cycle/intelligence-port.js";
import type { UnderstandIntentRequest } from "../cycle/intelligence-port.js";
import type {
  DocumentaryGoal,
  DraftArtifact,
  TaskContext,
} from "./contracts.js";

export interface CreateDraftRequest {
  readonly goal: DocumentaryGoal;
  readonly context: TaskContext;
}

export interface DocumentaryIntelligencePort {
  understandIntent(
    request: UnderstandIntentRequest,
  ): Promise<DocumentaryGoal>;
  createDraft(request: CreateDraftRequest): Promise<DraftArtifact>;
}
