import type { ContextSource, SourceDescriptor, TaskContext } from "./contracts.js";

export interface AuthorizedSourceReader {
  readSource(source: SourceDescriptor): Promise<string>;
}

export class TaskContextBuilder {
  public constructor(
    private readonly sourceReader: AuthorizedSourceReader,
    private readonly maxTotalCharacters: number,
  ) {}

  public async build(
    sources: readonly SourceDescriptor[],
  ): Promise<TaskContext> {
    const contextSources: ContextSource[] = [];
    const warnings: string[] = [];
    let totalCharacters = 0;

    for (const source of sources) {
      const content = await this.sourceReader.readSource(source);
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
