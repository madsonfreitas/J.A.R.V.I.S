import { resolve } from "node:path";
import { z } from "zod";

const EnvironmentSchema = z.object({
  ANTHROPIC_API_KEY: z
    .string({ required_error: "ANTHROPIC_API_KEY é obrigatória." })
    .min(1, "ANTHROPIC_API_KEY é obrigatória."),
  JARVIS_MODEL: z.string().min(1).default("claude-sonnet-5"),
  JARVIS_DATA_DIR: z.string().min(1).default(".jarvis"),
  JARVIS_MAX_SOURCE_BYTES: z.coerce.number().int().positive().default(1_000_000),
  JARVIS_MAX_TOTAL_CHARS: z.coerce.number().int().positive().default(100_000),
});

export interface AppConfig {
  readonly anthropicApiKey: string;
  readonly model: string;
  readonly dataDirectory: string;
  readonly maxSourceBytes: number;
  readonly maxTotalCharacters: number;
}

export function loadConfig(
  environment: NodeJS.ProcessEnv = process.env,
): AppConfig {
  const parsed = EnvironmentSchema.safeParse(environment);

  if (!parsed.success) {
    const messages = parsed.error.issues.map((issue) => issue.message).join(" ");
    throw new Error(`Configuração inválida. ${messages}`);
  }

  return {
    anthropicApiKey: parsed.data.ANTHROPIC_API_KEY,
    model: parsed.data.JARVIS_MODEL,
    dataDirectory: resolve(parsed.data.JARVIS_DATA_DIR),
    maxSourceBytes: parsed.data.JARVIS_MAX_SOURCE_BYTES,
    maxTotalCharacters: parsed.data.JARVIS_MAX_TOTAL_CHARS,
  };
}
