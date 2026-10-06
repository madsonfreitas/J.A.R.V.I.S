import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import type { TaskStatus } from "../cycle/contracts.js";
import { collectInput } from "../documentary/collect-input.js";
import type { DocumentaryInteraction } from "../documentary/interaction.js";

export { collectInput };

export class CliInteraction implements DocumentaryInteraction {
  public constructor(
    private readonly readline = createInterface({ input, output }),
  ) {}

  public async showStatus(status: TaskStatus, message: string): Promise<void> {
    output.write(`[${status}] ${message}\n`);
  }

  public async ask(question: string): Promise<string> {
    const answer = await this.readline.question(`\n${question}\n> `);
    return answer.trim();
  }

  public async confirm(
    title: string,
    details: readonly string[],
  ): Promise<boolean> {
    output.write(`\n${title}\n`);
    for (const detail of details) {
      output.write(`- ${detail}\n`);
    }
    const answer = await this.readline.question("Confirmar? [s/N] ");
    return /^s(im)?$/i.test(answer.trim());
  }

  public async showPreview(markdown: string): Promise<void> {
    output.write("\n--- Prévia do artefato ---\n");
    output.write(`${markdown}\n`);
    output.write("--- Fim da prévia ---\n");
  }

  public async requestOutputPath(): Promise<string> {
    const path = await this.readline.question(
      "\nCaminho do artefato final (.md, arquivo novo):\n> ",
    );
    return path.trim();
  }

  public close(): void {
    this.readline.close();
  }
}
