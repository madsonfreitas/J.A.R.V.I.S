import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import type { SourceDescriptor } from "../src/documentary/contracts.js";
import { ExperimentPolicy } from "../src/documentary/policy.js";
import { declaredPublic, parseDisclosure } from "../src/documentary/disclosure.js";

const alpha: SourceDescriptor = {
  id: "alpha",
  path: resolve("tests/fixtures/alpha.txt"),
  name: "alpha.txt",
  sizeBytes: 8,
};

const beta: SourceDescriptor = {
  id: "beta",
  path: resolve("tests/fixtures/beta.md"),
  name: "beta.md",
  sizeBytes: 8,
};

function send(capability: string) {
  return {
    capability,
    resource: "gemini-3.8-flash",
    destination: "gemini-3.8-flash",
    effect: "enviar",
    reversible: false,
  };
}

describe("classificação de envio", () => {
  it("trata texto fora dos três rótulos como unknown", () => {
    expect(parseDisclosure(undefined)).toBe("unknown");
    expect(parseDisclosure("")).toBe("unknown");
    expect(parseDisclosure("public_or_non_sensitive private")).toBe("unknown");
  });

  it("exige aprovação somente quando intenção, fontes e esclarecimentos são públicos", () => {
    const policy = new ExperimentPolicy(
      [alpha, beta],
      declaredPublic([alpha.path, beta.path]),
    );

    expect(policy.evaluate(send("send_intention_to_model")).outcome).toBe(
      "require_approval",
    );
    expect(policy.evaluate(send("send_sources_to_model")).outcome).toBe(
      "require_approval",
    );

    policy.addClarificationDisclosure("private");
    expect(policy.evaluate(send("send_intention_to_model")).outcome).toBe("deny");
    expect(policy.evaluate(send("send_sources_to_model")).outcome).toBe("deny");
  });
});
