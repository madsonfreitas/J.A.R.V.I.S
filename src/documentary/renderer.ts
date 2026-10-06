import type {
  DocumentaryGoal,
  DraftArtifact,
  ValidationReport,
} from "./contracts.js";

export class MarkdownRenderer {
  public render(
    goal: DocumentaryGoal,
    draft: DraftArtifact,
    validation: ValidationReport,
  ): string {
    const lines: string[] = [
      `# ${draft.title}`,
      "",
      "## Objetivo",
      "",
      `- Resumo: ${goal.summary}`,
      `- Finalidade: ${goal.purpose}`,
      `- Público: ${goal.audience ?? "não informado"}`,
      "",
    ];

    if (goal.constraints.length > 0) {
      lines.push("## Restrições", "");
      for (const constraint of goal.constraints) {
        lines.push(`- ${constraint}`);
      }
      lines.push("");
    }

    for (const section of draft.sections) {
      lines.push(`## ${section.heading}`, "");
      for (const entry of section.entries) {
        const sources =
          entry.sourceIds.length > 0
            ? ` (fontes: ${entry.sourceIds.join(", ")})`
            : "";
        lines.push(`- [${label(entry.kind)}] ${entry.text}${sources}`);
      }
      lines.push("");
    }

    lines.push("## Lacunas", "");
    if (draft.gaps.length === 0) {
      lines.push("- Nenhuma lacuna sinalizada.");
    } else {
      for (const gap of draft.gaps) {
        lines.push(`- ${gap}`);
      }
    }
    lines.push("");

    lines.push("## Conflitos", "");
    if (draft.conflicts.length === 0) {
      lines.push("- Nenhum conflito sinalizado.");
    } else {
      for (const conflict of draft.conflicts) {
        lines.push(
          `- ${conflict.description} (fontes: ${conflict.sourceIds.join(", ")})`,
        );
      }
    }
    lines.push("");

    lines.push("## Validação", "");
    lines.push(`- Status: ${validation.status}`);
    for (const issue of validation.issues) {
      lines.push(`- [${issue.severity}] ${issue.code}: ${issue.message}`);
    }
    if (draft.assumptions.length > 0) {
      lines.push("", "## Premissas", "");
      for (const assumption of draft.assumptions) {
        lines.push(`- ${assumption}`);
      }
    }

    lines.push("");
    return lines.join("\n");
  }
}

function label(kind: "fact" | "inference" | "gap"): string {
  switch (kind) {
    case "fact":
      return "fato";
    case "inference":
      return "inferência";
    case "gap":
      return "lacuna";
  }
}
