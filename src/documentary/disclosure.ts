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

export interface SourceReference {
  readonly text: string;
  readonly labels: readonly string[];
  readonly paths: readonly string[];
}

export function absentSourceReference(): string {
  return "Nenhuma referência de fonte é enviada nesta chamada. Esta chamada não inclui nomes, caminhos nem conteúdo de fontes.";
}

export function sourceReferenceForModel(value: string | undefined): string {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : absentSourceReference();
}

export function buildSourceReference(
  sources: readonly { readonly path: string }[],
  classification: (path: string) => DisclosureClass | undefined,
): SourceReference {
  const included = sources.filter(
    (source) => classification(resolve(source.path)) === "public_or_non_sensitive",
  );
  const labels =
    included.length > 1
      ? included.map((_, index) => `fonte-${index + 1}`)
      : [];
  const suffix = " Esta chamada não inclui nomes, caminhos nem conteúdo de fontes.";
  const text =
    included.length === 0
      ? absentSourceReference()
      : included.length === 1
        ? `Uma fonte pública já foi selecionada.${suffix}`
        : `Fontes públicas selecionadas: ${labels.join(", ")}.${suffix}`;
  return {
    text,
    labels,
    paths: included.map((source) => resolve(source.path)),
  };
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
