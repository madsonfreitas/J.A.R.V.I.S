import type { ContextSource, SourceDescriptor, TaskContext } from "./contracts.js";

export class TaskContextBuilder {
  public constructor(private readonly maxTotalCharacters: number) {}

  public assemble(
    reads: readonly { source: SourceDescriptor; content: string }[],
  ): TaskContext {
    const contextSources: ContextSource[] = [];
    const warnings: string[] = [];
    let totalCharacters = 0;

    for (const { source, content } of reads) {
      totalCharacters += content.length;

      if (totalCharacters > this.maxTotalCharacters) {
        throw new Error(
          `O contexto excede o limite de ${this.maxTotalCharacters} caracteres.`,
        );
      }

      if (content.trim().length === 0) {
        warnings.push(`A fonte ${source.name} está vazia.`);
      }

      contextSources.push({
        ...source,
        content,
        trust: "untrusted_content",
      });
    }

    return {
      sources: contextSources,
      totalCharacters,
      warnings,
    };
  }
}
