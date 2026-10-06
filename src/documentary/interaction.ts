import type { CycleInteraction } from "../cycle/interaction.js";

export interface DocumentaryInteraction extends CycleInteraction {
  showPreview(markdown: string): Promise<void>;
  requestOutputPath(): Promise<string>;
}
