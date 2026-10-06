import type { Goal as CycleGoal, TaskStatus } from "../cycle/contracts.js";

export type { TaskStatus } from "../cycle/contracts.js";

export type DocumentaryActionKind =
  | "read_source"
  | "send_sources_to_model"
  | "create_artifact";

export type ActionKind = DocumentaryActionKind;

export interface DocumentaryGoal extends CycleGoal {
  readonly audience: string | null;
  readonly requiredSections: readonly string[];
}

export type Goal = DocumentaryGoal;

export interface SourceDescriptor {
  readonly id: string;
  readonly path: string;
  readonly name: string;
  readonly sizeBytes: number;
}

export interface ContextSource extends SourceDescriptor {
  readonly content: string;
  readonly trust: "untrusted_content";
}

export interface TaskContext {
  readonly sources: readonly ContextSource[];
  readonly totalCharacters: number;
  readonly warnings: readonly string[];
}

export type EntryKind = "fact" | "inference" | "gap";

export interface DraftEntry {
  readonly text: string;
  readonly kind: EntryKind;
  readonly sourceIds: readonly string[];
}

export interface DraftSection {
  readonly heading: string;
  readonly entries: readonly DraftEntry[];
}

export interface DraftConflict {
  readonly description: string;
  readonly sourceIds: readonly string[];
}

export interface DraftArtifact {
  readonly title: string;
  readonly sections: readonly DraftSection[];
  readonly gaps: readonly string[];
  readonly conflicts: readonly DraftConflict[];
  readonly assumptions: readonly string[];
}

export interface CapabilityEffect {
  readonly action: DocumentaryActionKind;
  readonly resource: string;
  readonly observed: boolean;
  readonly details: string;
}

export type ValidationStatus =
  | "valid"
  | "valid_with_reservations"
  | "invalid";

export interface ValidationIssue {
  readonly code: string;
  readonly message: string;
  readonly severity: "warning" | "error";
}

export interface ValidationMetrics {
  readonly requiredSections: number;
  readonly presentSections: number;
  readonly materialEntries: number;
  readonly traceableEntries: number;
  readonly unknownSourceReferences: number;
}

export interface ValidationReport {
  readonly status: ValidationStatus;
  readonly issues: readonly ValidationIssue[];
  readonly metrics: ValidationMetrics;
}

export interface ExperimentInput {
  readonly intention: string;
  readonly sourcePaths: readonly string[];
}

export interface ExperimentResult {
  readonly runId: string;
  readonly status: TaskStatus;
  readonly goal: Goal | null;
  readonly outputPath: string | null;
  readonly validation: ValidationReport | null;
  readonly effects: readonly CapabilityEffect[];
  readonly message: string;
}

export type { DocumentaryInteraction as ExperimentInteraction } from "./interaction.js";
