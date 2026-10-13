import { resolve } from "node:path";
import { z } from "zod";

const EnvironmentSchema = z
  .object({
    JARVIS_PROVIDER: z.string().optional(),
    ANTHROPIC_API_KEY: z.string().optional(),
    GEMINI_API_KEY: z.string().optional(),
    JARVIS_MODEL: z.string().optional(),
    JARVIS_DATA_DIR: z.string().min(1).default(".jarvis"),
    JARVIS_MAX_SOURCE_BYTES: z.coerce
      .number()
      .int()
      .positive()
      .default(1_000_000),
    JARVIS_MAX_TOTAL_CHARS: z.coerce.number().int().positive().default(100_000),
  })
  .superRefine((value, context) => {
    const provider = (value.JARVIS_PROVIDER ?? "anthropic").trim();
    if (provider !== "anthropic" && provider !== "gemini") {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "JARVIS_PROVIDER deve ser anthropic ou gemini.",
      });
      return;
    }
    if (provider === "anthropic" && !value.ANTHROPIC_API_KEY?.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "ANTHROPIC_API_KEY é obrigatória.",
      });
    }
    if (provider === "gemini" && !value.GEMINI_API_KEY?.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "GEMINI_API_KEY é obrigatória.",
      });
    }
  });

export type ProviderName = "anthropic" | "gemini";

export interface AppConfig {
  readonly provider: ProviderName;
  readonly anthropicApiKey: string;
  readonly geminiApiKey: string;
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

  const provider = (parsed.data.JARVIS_PROVIDER ?? "anthropic").trim() as ProviderName;
  const requestedModel = parsed.data.JARVIS_MODEL?.trim() ?? "";
  const model =
    requestedModel.length > 0
      ? requestedModel
      : provider === "gemini"
        ? "gemini-3.8-flash"
        : "claude-sonnet-5";

  return {
    provider,
    anthropicApiKey: parsed.data.ANTHROPIC_API_KEY?.trim() ?? "",
    geminiApiKey: parsed.data.GEMINI_API_KEY?.trim() ?? "",
    model,
    dataDirectory: resolve(parsed.data.JARVIS_DATA_DIR),
    maxSourceBytes: parsed.data.JARVIS_MAX_SOURCE_BYTES,
    maxTotalCharacters: parsed.data.JARVIS_MAX_TOTAL_CHARS,
  };
}
