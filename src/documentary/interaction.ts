import type { CycleInteraction } from "../cycle/interaction.js";
import type { ExperimentStatus } from "./contracts.js";

export interface DocumentaryInteraction extends Omit<CycleInteraction, "showStatus"> {
  showStatus(status: ExperimentStatus, message: string): Promise<void>;
  showPreview(markdown: string): Promise<void>;
  requestOutputPath(): Promise<string>;
}
