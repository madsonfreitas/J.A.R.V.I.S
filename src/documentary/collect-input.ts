import type { CycleInteraction } from "../cycle/interaction.js";
import type { ExperimentInput } from "./contracts.js";

export async function collectInput(
  argv: readonly string[],
  interaction: CycleInteraction,
): Promise<ExperimentInput> {
  const parsed = parseArgs(argv);
  const intention =
    parsed.intention ??
    (await interaction.ask("Qual resultado você deseja alcançar?"));
  const sourcePaths =
    parsed.sources.length > 0
      ? parsed.sources
      : splitSources(
          await interaction.ask(
            "Informe os caminhos das fontes autorizadas, separados por vírgula.",
          ),
        );

  return { intention, sourcePaths };
}

function parseArgs(argv: readonly string[]): {
  intention: string | null;
  sources: string[];
} {
  const sources: string[] = [];
  let intention: string | null = null;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--intention") {
      intention = argv[index + 1] ?? "";
      index += 1;
      continue;
    }
    if (arg === "--source") {
      const source = argv[index + 1];
      if (source) {
        sources.push(source);
      }
      index += 1;
    }
  }

  return { intention, sources };
}

function splitSources(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}
