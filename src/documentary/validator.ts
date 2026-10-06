import type {
  DocumentaryGoal,
  DraftArtifact,
  TaskContext,
  ValidationIssue,
  ValidationReport,
} from "./contracts.js";

export class ResultValidator {
  public validate(
    goal: DocumentaryGoal,
    draft: DraftArtifact,
    context: TaskContext,
  ): ValidationReport {
    const issues: ValidationIssue[] = [];
    const sourceIds = new Set(context.sources.map((source) => source.id));
    const presentHeadings = new Set(
      draft.sections.map((section) => normalize(section.heading)),
    );

    for (const required of goal.requiredSections) {
      if (!presentHeadings.has(normalize(required))) {
        issues.push({
          code: "missing_section",
          message: `Seção obrigatória ausente: ${required}`,
          severity: "error",
        });
      }
    }

    let materialEntries = 0;
    let traceableEntries = 0;
    let unknownSourceReferences = 0;

    for (const section of draft.sections) {
      for (const entry of section.entries) {
        if (entry.kind !== "fact") {
          continue;
        }

        materialEntries += 1;

        if (entry.sourceIds.length === 0) {
          issues.push({
            code: "untraceable_fact",
            message: `Fato sem proveniência: ${entry.text}`,
            severity: "error",
          });
          continue;
        }

        const unknown = entry.sourceIds.filter((id) => !sourceIds.has(id));
        if (unknown.length > 0) {
          unknownSourceReferences += unknown.length;
          issues.push({
            code: "unknown_source",
            message: `Fato cita fontes inexistentes (${unknown.join(", ")}): ${entry.text}`,
            severity: "error",
          });
          continue;
        }

        traceableEntries += 1;
      }
    }

    if (draft.gaps.length > 0) {
      issues.push({
        code: "gaps_present",
        message: `${draft.gaps.length} lacuna(s) foram sinalizadas.`,
        severity: "warning",
      });
    }

    if (draft.conflicts.length > 0) {
      issues.push({
        code: "conflicts_present",
        message: `${draft.conflicts.length} conflito(s) foram sinalizados.`,
        severity: "warning",
      });
    }

    const hasError = issues.some((issue) => issue.severity === "error");
    const hasWarning = issues.some((issue) => issue.severity === "warning");

    return {
      status: hasError
        ? "invalid"
        : hasWarning
          ? "valid_with_reservations"
          : "valid",
      issues,
      metrics: {
        requiredSections: goal.requiredSections.length,
        presentSections: presentHeadings.size,
        materialEntries,
        traceableEntries,
        unknownSourceReferences,
      },
    };
  }
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}
