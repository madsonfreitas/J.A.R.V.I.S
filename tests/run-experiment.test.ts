import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { ExperimentRunner } from "../src/documentary/runner.js";
import { FileCapabilities } from "../src/documentary/files.js";
import { createRunRecorder } from "../src/observability/run-recorder.js";
import { FakeIntelligence, ScriptedInteraction } from "./helpers/fakes.js";

const sourceAlpha = resolve("tests/fixtures/alpha.txt");
const sourceBeta = resolve("tests/fixtures/beta.md");
const directories: string[] = [];

afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

async function createHarness(options: {
  confirms: readonly boolean[];
  answers?: readonly string[];
  outputPath?: string;
  questions?: readonly string[];
  invalidDraft?: boolean;
}) {
  const directory = await mkdtemp(join(tmpdir(), "jarvis-slice-"));
  directories.push(directory);
  const outputPath = options.outputPath ?? join(directory, "result.md");
  const recorder = await createRunRecorder(join(directory, "run.sqlite"));
  const interaction = new ScriptedInteraction(
    options.confirms,
    options.answers ?? [],
    outputPath,
  );
  const runner = new ExperimentRunner({
    intelligence: new FakeIntelligence(
      options.questions ?? [],
      options.invalidDraft
        ? {
            title: "Inválido",
            sections: [
              {
                heading: "Resumo",
                entries: [{ text: "sem fonte", kind: "fact", sourceIds: [] }],
              },
            ],
            gaps: [],
            conflicts: [],
            assumptions: [],
          }
        : null,
    ),
    files: new FileCapabilities(1_000_000),
    recorder,
    interaction,
    maxTotalCharacters: 100_000,
    modelLabel: "fake-model",
  });

  return { runner, interaction, outputPath, recorder, directory };
}

describe("ExperimentRunner", () => {
  it("atravessa o ciclo e cria um artefato sem alterar originais", async () => {
    const originalAlpha = await readFile(sourceAlpha, "utf8");
    const originalBeta = await readFile(sourceBeta, "utf8");
    const { runner, interaction, outputPath, recorder } = await createHarness({
      confirms: [true, true, true],
    });

    try {
      const result = await runner.run({
        intention: "Produza um resumo operacional das fontes autorizadas.",
        sourcePaths: [sourceAlpha, sourceBeta],
      });

      expect(result.status).toBe("completed_with_reservations");
      expect(result.outputPath).toBe(outputPath);
      expect(result.effects.some((effect) => effect.action === "create_artifact")).toBe(
        true,
      );
      await expect(stat(outputPath)).resolves.toMatchObject({ size: expect.any(Number) });
      expect(await readFile(sourceAlpha, "utf8")).toBe(originalAlpha);
      expect(await readFile(sourceBeta, "utf8")).toBe(originalBeta);
      expect(interaction.preview).toContain("# Resultado experimental");
      expect(interaction.statuses).toContain("understanding");
      expect(interaction.statuses).toContain("validating");
    } finally {
      recorder.close();
    }
  });

  it("cancela antes de criar o artefato", async () => {
    const { runner, outputPath, recorder } = await createHarness({
      confirms: [true, true, false],
    });

    try {
      const result = await runner.run({
        intention: "Produza um resumo operacional das fontes autorizadas.",
        sourcePaths: [sourceAlpha],
      });

      expect(result.status).toBe("cancelled");
      await expect(stat(outputPath)).rejects.toMatchObject({ code: "ENOENT" });
    } finally {
      recorder.close();
    }
  });

  it("recusa destino que sobrescreveria uma fonte original", async () => {
    const { runner, recorder } = await createHarness({
      confirms: [true, true],
      outputPath: sourceAlpha,
    });

    try {
      const result = await runner.run({
        intention: "Produza um resumo operacional das fontes autorizadas.",
        sourcePaths: [sourceAlpha],
      });

      expect(result.status).toBe("rejected");
      expect(result.message).toContain("nunca pode ser sobrescrita");
    } finally {
      recorder.close();
    }
  });

  it("falha quando o rascunho não é rastreável", async () => {
    const { runner, recorder, outputPath } = await createHarness({
      confirms: [true, true],
      invalidDraft: true,
    });

    try {
      const result = await runner.run({
        intention: "Produza um resumo operacional das fontes autorizadas.",
        sourcePaths: [sourceAlpha],
      });

      expect(result.status).toBe("failed");
      await expect(stat(outputPath)).rejects.toMatchObject({ code: "ENOENT" });
    } finally {
      recorder.close();
    }
  });
});
