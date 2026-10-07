import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type { ActionProposal } from "../src/cycle/contracts.js";
import { createCoreRun } from "../src/cycle/execution.js";
import { FileCapabilities } from "../src/documentary/files.js";

const directories: string[] = [];

afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

describe("FileCapabilities", () => {
  it("cria somente arquivos novos", async () => {
    const directory = await mkdtemp(join(tmpdir(), "jarvis-files-"));
    directories.push(directory);
    const files = new FileCapabilities(1_000_000);
    const destination = join(directory, "out.md");
    const run = createCoreRun("files");

    const created = await run.attempt({
      proposal: artifactProposal(destination),
      evaluate: (action) => ({ outcome: "allow", reason: "teste", action }),
      confirm: async () => false,
      execute: (permit) => files.createArtifact(permit, destination, "# ok\n"),
    });
    expect(created.outcome).toBe("executed");

    const again = await run.attempt({
      proposal: artifactProposal(destination),
      evaluate: (action) => ({ outcome: "allow", reason: "teste", action }),
      confirm: async () => false,
      execute: (permit) => files.createArtifact(permit, destination, "# again\n"),
    });
    expect(again.outcome).toBe("failed");
    if (again.outcome === "failed") {
      expect(again.cause).toMatchObject({ code: "EEXIST" });
    }
  });

  it("recusa extensões fora do experimento", async () => {
    const directory = await mkdtemp(join(tmpdir(), "jarvis-files-"));
    directories.push(directory);
    const source = join(directory, "notes.pdf");
    await writeFile(source, "x");
    const files = new FileCapabilities(1_000_000);

    await expect(files.inspect(source)).rejects.toThrow(/\.txt e \.md/);
  });
});

function artifactProposal(destination: string): ActionProposal {
  return {
    capability: "create_artifact",
    resource: destination,
    destination,
    effect: "criar",
    reversible: false,
  };
}
