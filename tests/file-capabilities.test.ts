import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
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

    await files.createArtifact(destination, "# ok\n");
    await expect(
      files.createArtifact(destination, "# again\n"),
    ).rejects.toMatchObject({ code: "EEXIST" });
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
