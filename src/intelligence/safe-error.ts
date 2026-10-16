const SAFE_NAME = /^[A-Za-z][A-Za-z0-9]{0,40}$/;

export function uncertainProviderMessage(
  error: unknown,
  secrets: readonly string[],
): string {
  const status = readStatus(error);
  const name = readName(error);
  const parts = [
    "A chamada externa foi iniciada, mas não há evidência suficiente do efeito.",
  ];
  if (name === "AbortError" || name === "TimeoutError" || isOpenAITimeout(error)) {
    parts.push("Tempo esgotado.");
  } else if (status !== undefined) {
    parts.push(`Status ${status}.`);
  }
  return redactSensitive(parts.join(" "), secrets);
}

export function localResponseFailureMessage(): string {
  return "A chamada externa ao modelo ocorreu, mas o processamento local da resposta falhou.";
}

export function displayError(error: unknown, secrets: readonly string[] = []): string {
  const raw = error instanceof Error ? error.message : "Falha inesperada na CLI.";
  return redactSensitive(raw, secrets);
}

export function redactSensitive(text: string, secrets: readonly string[]): string {
  let result = text;
  for (const secret of secrets) {
    if (secret.length > 0) {
      result = result.split(secret).join("[redacted]");
    }
  }
  result = result.replace(
    /((?:api[_-]?key|key)\s*[:=]\s*["']?)[^\s"'&,}]+/gi,
    "$1[redacted]",
  );
  result = result.replace(/(bearer\s+)\S+/gi, "$1[redacted]");
  result = result.replace(/(x-api-key\s*[:=]\s*)\S+/gi, "$1[redacted]");
  result = result.replace(/(authorization\s*[:=]\s*)[^\n]+/gi, "$1[redacted]");
  result = result.replace(/\bsk-ant-[A-Za-z0-9_-]+/g, "[redacted]");
  result = result.replace(/\bAIza[A-Za-z0-9_-]{10,}/g, "[redacted]");
  return result;
}

function readStatus(error: unknown): number | undefined {
  if (!error || typeof error !== "object") {
    return undefined;
  }
  const status = (error as { status?: unknown }).status;
  if (
    typeof status === "number" &&
    Number.isInteger(status) &&
    status >= 100 &&
    status <= 599
  ) {
    return status;
  }
  return undefined;
}

function isOpenAITimeout(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }
  // openai 7.33.0: APIConnectionTimeoutError.name fica "Error"; o nome da classe está no construtor.
  const constructorName = (error as { constructor?: { name?: unknown } }).constructor?.name;
  return constructorName === "APIConnectionTimeoutError";
}

function readName(error: unknown): string | undefined {
  if (!error || typeof error !== "object") {
    return undefined;
  }
  const name = (error as { name?: unknown }).name;
  if (typeof name === "string" && SAFE_NAME.test(name)) {
    return name;
  }
  return undefined;
}
