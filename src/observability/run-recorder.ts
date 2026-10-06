import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { TaskStatus } from "../cycle/contracts.js";

export class RunRecorder {
  private readonly database: DatabaseSync;

  public constructor(databasePath: string) {
    this.database = new DatabaseSync(databasePath);
    this.database.exec(`
      CREATE TABLE IF NOT EXISTS runs (
        id TEXT PRIMARY KEY,
        intention TEXT NOT NULL,
        status TEXT NOT NULL,
        started_at TEXT NOT NULL,
        finished_at TEXT,
        message TEXT
      );

      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        run_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        type TEXT NOT NULL,
        payload TEXT NOT NULL,
        FOREIGN KEY (run_id) REFERENCES runs(id)
      );
    `);
  }

  public start(runId: string, intention: string): void {
    this.database
      .prepare(
        "INSERT INTO runs (id, intention, status, started_at) VALUES (?, ?, ?, ?)",
      )
      .run(runId, intention, "received", now());
  }

  public record(runId: string, type: string, payload: unknown): void {
    this.database
      .prepare(
        "INSERT INTO events (run_id, created_at, type, payload) VALUES (?, ?, ?, ?)",
      )
      .run(runId, now(), type, JSON.stringify(payload));
  }

  public setStatus(runId: string, status: TaskStatus, message: string): void {
    this.database
      .prepare("UPDATE runs SET status = ?, message = ? WHERE id = ?")
      .run(status, message, runId);
    this.record(runId, "status", { status, message });
  }

  public finish(runId: string, status: TaskStatus, message: string): void {
    this.database
      .prepare(
        "UPDATE runs SET status = ?, message = ?, finished_at = ? WHERE id = ?",
      )
      .run(status, message, now(), runId);
  }

  public close(): void {
    this.database.close();
  }
}

export async function createRunRecorder(
  databasePath: string,
): Promise<RunRecorder> {
  await mkdir(dirname(databasePath), { recursive: true });
  return new RunRecorder(databasePath);
}

function now(): string {
  return new Date().toISOString();
}
