import type { TaskStatus } from "./contracts.js";

export interface CycleInteraction {
  showStatus(status: TaskStatus, message: string): Promise<void>;
  ask(question: string): Promise<string>;
  confirm(title: string, details: readonly string[]): Promise<boolean>;
}
