import { resolve } from "node:path";

export type DisclosureClass =
  | "public_or_non_sensitive"
  | "private"
  | "unknown";

export interface SendDisclosures {
  readonly intention: DisclosureClass;
  readonly sources: Readonly<Record<string, DisclosureClass>>;
  readonly clarifications: readonly DisclosureClass[];
}

export function parseDisclosure(answer: string | undefined): DisclosureClass {
  const value = answer?.trim() ?? "";
  if (
    value === "public_or_non_sensitive" ||
    value === "private" ||
    value === "unknown"
  ) {
    return value;
  }
  return "unknown";
}

export function disclosurePrompt(subject: string): string {
  return [
    `Classifique ${subject}.`,
    "Responda somente public_or_non_sensitive, private ou unknown.",
    "Qualquer outro texto conta como unknown.",
    "Esta resposta fica na política local e não é enviada ao modelo.",
  ].join(" ");
}

export function declaredPublic(paths: readonly string[]): SendDisclosures {
  return {
    intention: "public_or_non_sensitive",
    sources: Object.fromEntries(
      paths.map((path) => [resolve(path), "public_or_non_sensitive" as const]),
    ),
    clarifications: [],
  };
}
