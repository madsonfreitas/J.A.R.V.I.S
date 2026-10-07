import { createHash } from "node:crypto";
import { open, readFile, stat, unlink } from "node:fs/promises";
import { basename, extname, resolve } from "node:path";
import { claimPermit, UnknownEffectError, type Permit } from "../cycle/execution.js";
import type { CapabilityEffect, SourceDescriptor } from "./contracts.js";

const ALLOWED_EXTENSIONS = new Set([".txt", ".md"]);

export class FileCapabilities {
  public constructor(private readonly maxSourceBytes: number) {}

  public async inspect(path: string): Promise<SourceDescriptor> {
    const resolved = resolve(path);
    const extension = extname(resolved).toLowerCase();

    if (!ALLOWED_EXTENSIONS.has(extension)) {
      throw new Error(
        `Somente arquivos .txt e .md são aceitos neste experimento: ${resolved}`,
      );
    }

    const info = await stat(resolved);

    if (!info.isFile()) {
      throw new Error(`O caminho não é um arquivo: ${resolved}`);
    }

    if (info.size > this.maxSourceBytes) {
      throw new Error(
        `A fonte excede o limite de ${this.maxSourceBytes} bytes: ${resolved}`,
      );
    }

    return {
      id: toSourceId(resolved),
      path: resolved,
      name: basename(resolved),
      sizeBytes: info.size,
    };
  }

  public async readSource(
    permit: Permit,
    source: SourceDescriptor,
  ): Promise<string> {
    claimPermit(permit, {
      runId: permit.runId,
      attemptId: permit.attemptId,
      capability: "read_source",
      resource: source.path,
      destination: null,
    });
    return readFile(source.path, "utf8");
  }

  public async createArtifact(
    permit: Permit,
    destination: string,
    content: string,
  ): Promise<CapabilityEffect> {
    const resolved = resolve(destination);
    if (extname(resolved).toLowerCase() !== ".md") {
      throw new Error("O artefato final deve ser um arquivo .md.");
    }

    claimPermit(permit, {
      runId: permit.runId,
      attemptId: permit.attemptId,
      capability: "create_artifact",
      resource: resolved,
      destination: resolved,
    });

    const handle = await open(resolved, "wx");

    try {
      await handle.writeFile(content, "utf8");
    } catch (error) {
      let removed = false;
      try {
        await unlink(resolved);
        removed = true;
      } catch {
        removed = false;
      }
      if (!removed) {
        throw new UnknownEffectError(
          "A escrita falhou e não há evidência de que o arquivo foi removido.",
          { cause: error },
        );
      }
      throw error;
    } finally {
      await handle.close().catch(() => undefined);
    }

    return {
      action: "create_artifact",
      resource: resolved,
      observed: true,
      details: "Artefato criado sem sobrescrever arquivo existente.",
    };
  }
}

function toSourceId(path: string): string {
  const name = basename(path)
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  const hash = createHash("sha256").update(path).digest("hex").slice(0, 6);
  return `${name || "source"}-${hash}`;
}
