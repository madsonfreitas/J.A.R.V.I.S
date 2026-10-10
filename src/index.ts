import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ExperimentRunner } from "./documentary/runner.js";
import { FileCapabilities } from "./documentary/files.js";
import { loadConfig, type AppConfig } from "./config.js";
import { createIntelligence } from "./intelligence/create-intelligence.js";
import { CliInteraction, collectInput, exitCodeForStatus } from "./interface/cli.js";
import { createRunRecorder } from "./observability/run-recorder.js";

async function loadOptionalEnvFile(filePath = ".env"): Promise<void> {
  try {
    const text = await readFile(filePath, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }
      const separator = trimmed.indexOf("=");
      if (separator <= 0) {
        continue;
      }
      const key = trimmed.slice(0, separator).trim();
      let value = trimmed.slice(separator + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}

async function main(): Promise<void> {
  await loadOptionalEnvFile();
  const config = loadConfig();
  const interaction = new CliInteraction();

  try {
    const input = await collectInput(process.argv.slice(2), interaction);
    const result = await runExperiment(config, interaction, input);
    process.stdout.write(
      `\nResultado: ${result.status}\n${result.message}\nRun: ${result.runId}\n`,
    );
    if (result.status === "unknown") {
      process.stdout.write(
        "O efeito não foi confirmado. Isto não é sucesso nem falha conhecida.\n",
      );
    }
    process.exitCode = exitCodeForStatus(result.status);
  } finally {
    interaction.close();
  }
}

async function runExperiment(
  config: AppConfig,
  interaction: CliInteraction,
  input: Awaited<ReturnType<typeof collectInput>>,
) {
  const recorder = await createRunRecorder(
    join(config.dataDirectory, "experiment.sqlite"),
  );

  try {
    const runner = new ExperimentRunner({
      intelligence: createIntelligence(config),
      files: new FileCapabilities(config.maxSourceBytes),
      recorder,
      interaction,
      maxTotalCharacters: config.maxTotalCharacters,
      modelLabel: config.model,
      provider: config.provider,
    });
    return await runner.run(input);
  } finally {
    recorder.close();
  }
}

try {
  await main();
} catch (error) {
  const message =
    error instanceof Error ? error.message : "Falha inesperada na CLI.";
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
}
