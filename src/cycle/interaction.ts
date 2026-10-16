import type { RunStatus } from "./contracts.js";

export interface CycleInteraction {
  showStatus(status: RunStatus, message: string): Promise<void>;
  ask(question: string): Promise<string>;
  confirm(title: string, details: readonly string[]): Promise<boolean>;
}
