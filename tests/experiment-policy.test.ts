import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { declaredPublic } from "../src/documentary/disclosure.js";
import { ExperimentPolicy } from "../src/documentary/policy.js";
import type { SourceDescriptor } from "../src/documentary/contracts.js";

const source: SourceDescriptor = {
  id: "alpha",
  path: resolve("tests/fixtures/alpha.txt"),
  name: "alpha.txt",
  sizeBytes: 10,
};

describe("ExperimentPolicy", () => {
  it("permite leitura apenas das fontes autorizadas", () => {
    const policy = new ExperimentPolicy([source]);

    expect(
      policy.evaluate({
        capability: "read_source",
        resource: source.path,
        destination: null,
        effect: "ler",
        reversible: true,
      }).outcome,
    ).toBe("allow");

    expect(
      policy.evaluate({
        capability: "read_source",
        resource: resolve("tests/fixtures/beta.md"),
        destination: null,
        effect: "ler",
        reversible: true,
      }).outcome,
    ).toBe("deny");
  });

  it("recusa sobrescrever uma fonte original", () => {
    const policy = new ExperimentPolicy([source]);

    expect(
      policy.evaluate({
        capability: "create_artifact",
        resource: source.path,
        destination: source.path,
        effect: "criar",
        reversible: false,
      }).outcome,
    ).toBe("deny");
  });

  it("exige aprovação para envio ao modelo e criação de markdown novo", () => {
    const policy = new ExperimentPolicy([source], declaredPublic([source.path]));

    expect(
      policy.evaluate({
        capability: "send_sources_to_model",
        resource: "claude-sonnet-5",
        destination: "claude-sonnet-5",
        effect: "enviar",
        reversible: false,
      }).outcome,
    ).toBe("require_approval");

    expect(
      policy.evaluate({
        capability: "send_intention_to_model",
        resource: "claude-sonnet-5",
        destination: "claude-sonnet-5",
        effect: "enviar intenção",
        reversible: false,
      }).outcome,
    ).toBe("require_approval");

    expect(
      policy.evaluate({
        capability: "create_artifact",
        resource: resolve("tmp/result.md"),
        destination: resolve("tmp/result.md"),
        effect: "criar",
        reversible: false,
      }).outcome,
    ).toBe("require_approval");
  });
});
