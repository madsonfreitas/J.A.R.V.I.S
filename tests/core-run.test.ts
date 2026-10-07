import { describe, expect, it } from "vitest";
import type { ActionProposal, PolicyDecision, PolicyOutcome } from "../src/cycle/contracts.js";
import {
  claimPermit,
  createCoreRun,
  UnknownEffectError,
  type Permit,
  type PermitClaim,
} from "../src/cycle/execution.js";

const proposal: ActionProposal = {
  capability: "create_artifact",
  resource: "result.md",
  destination: "result.md",
  effect: "criar",
  reversible: false,
};

function decision(outcome: PolicyOutcome): (action: ActionProposal) => PolicyDecision {
  return (action) => ({ outcome, reason: outcome, action });
}

function claimOf(permit: Permit): PermitClaim {
  return {
    runId: permit.runId,
    attemptId: permit.attemptId,
    capability: permit.capability,
    resource: permit.resource,
    destination: permit.destination,
  };
}

describe("CoreRun", () => {
  it("emite Permit e executa quando a decisão é allow", async () => {
    let calls = 0;
    const result = await createCoreRun("run-allow").attempt({
      proposal,
      evaluate: decision("allow"),
      confirm: async () => {
        throw new Error("allow não pede confirmação");
      },
      execute: async (permit) => {
        calls += 1;
        claimPermit(permit, claimOf(permit));
        return "ok";
      },
    });

    expect(calls).toBe(1);
    expect(result.outcome).toBe("executed");
  });

  it("não executa quando a decisão é deny", async () => {
    let calls = 0;
    let confirms = 0;
    const result = await createCoreRun("run-deny").attempt({
      proposal,
      evaluate: decision("deny"),
      confirm: async () => {
        confirms += 1;
        return true;
      },
      execute: async () => {
        calls += 1;
        return "não";
      },
    });

    expect(result.outcome).toBe("denied");
    expect(calls).toBe(0);
    expect(confirms).toBe(0);
  });

  it("executa require_approval somente depois da confirmação", async () => {
    let calls = 0;
    const result = await createCoreRun("run-yes").attempt({
      proposal,
      evaluate: decision("require_approval"),
      confirm: async () => true,
      execute: async (permit) => {
        calls += 1;
        claimPermit(permit, claimOf(permit));
        return "ok";
      },
    });

    expect(calls).toBe(1);
    expect(result.outcome).toBe("executed");
  });

  it("recusa require_approval sem executar", async () => {
    let calls = 0;
    const result = await createCoreRun("run-no").attempt({
      proposal,
      evaluate: decision("require_approval"),
      confirm: async () => false,
      execute: async () => {
        calls += 1;
        return "não";
      },
    });

    expect(result.outcome).toBe("refused");
    expect(calls).toBe(0);
  });

  it("marca failed quando a capability é invocada e falha", async () => {
    let calls = 0;
    const result = await createCoreRun("run-fail").attempt({
      proposal,
      evaluate: decision("allow"),
      confirm: async () => true,
      execute: async (permit) => {
        calls += 1;
        claimPermit(permit, claimOf(permit));
        throw new Error("quebra");
      },
    });

    expect(calls).toBe(1);
    expect(result.outcome).toBe("failed");
    if (result.outcome === "failed") {
      expect(result.message).toBe("quebra");
    }
  });

  it("devolve o efeito sem interpretá-lo", async () => {
    const effect = { path: "secreto.md", sections: ["não ler"] };
    const result = await createCoreRun("run-effect").attempt({
      proposal,
      evaluate: decision("allow"),
      confirm: async () => true,
      execute: async (permit) => {
        claimPermit(permit, claimOf(permit));
        return effect;
      },
    });

    expect(result.outcome).toBe("executed");
    if (result.outcome === "executed") {
      expect(result.effect).toBe(effect);
    }
  });

  it("não deixa o Permit de uma Attempt autorizar outra", async () => {
    const captured: { permit?: Permit } = {};
    const result = await createCoreRun("run-iso").attempt({
      proposal,
      evaluate: decision("allow"),
      confirm: async () => true,
      execute: async (issued) => {
        expect(() =>
          claimPermit(issued, { ...claimOf(issued), attemptId: "outra-attempt" }),
        ).toThrow(/não pertence/);
        claimPermit(issued, claimOf(issued));
        captured.permit = issued;
        return "ok";
      },
    });

    expect(result.outcome).toBe("executed");
    expect(captured.permit?.attemptId).not.toBe("outra-attempt");
  });

  it("recusa usar o mesmo Permit duas vezes", async () => {
    const captured: { permit?: Permit } = {};
    const result = await createCoreRun("run-once").attempt({
      proposal,
      evaluate: decision("allow"),
      confirm: async () => true,
      execute: async (issued) => {
        claimPermit(issued, claimOf(issued));
        captured.permit = issued;
        return "ok";
      },
    });

    expect(result.outcome).toBe("executed");
    const permit = captured.permit;
    expect(permit).toBeDefined();
    if (!permit) {
      return;
    }
    expect(() => claimPermit(permit, claimOf(permit))).toThrow(/consumido/);
  });

  it("marca failed quando o efeito não chegou a acontecer", async () => {
    let calls = 0;
    const result = await createCoreRun("known-fail").attempt({
      proposal,
      evaluate: decision("allow"),
      confirm: async () => true,
      execute: async () => {
        calls += 1;
        throw new Error("efeito ausente");
      },
    });

    expect(calls).toBe(1);
    expect(result.outcome).toBe("failed");
  });

  it("preserva unknown quando o efeito não pode ser determinado", async () => {
    let calls = 0;
    const result = await createCoreRun("unknown-effect").attempt({
      proposal,
      evaluate: decision("allow"),
      confirm: async () => true,
      execute: async (permit) => {
        calls += 1;
        claimPermit(permit, claimOf(permit));
        throw new UnknownEffectError("resposta perdida");
      },
    });

    expect(calls).toBe(1);
    expect(result.outcome).toBe("unknown");
    expect(result.outcome).not.toBe("failed");
    expect(result.outcome).not.toBe("executed");
  });

  it("não executa de novo depois de unknown", async () => {
    let calls = 0;
    const run = createCoreRun("no-retry");
    const result = await run.attempt({
      proposal,
      evaluate: decision("allow"),
      confirm: async () => true,
      execute: async (permit) => {
        calls += 1;
        claimPermit(permit, claimOf(permit));
        throw new UnknownEffectError("timeout");
      },
    });

    expect(result.outcome).toBe("unknown");
    expect(calls).toBe(1);
  });

  it("não deixa o unknown de uma Attempt autorizar outra", async () => {
    const captured: { permit?: Permit } = {};
    const run = createCoreRun("unknown-isolation");
    const first = await run.attempt({
      proposal,
      evaluate: decision("allow"),
      confirm: async () => true,
      execute: async (permit) => {
        claimPermit(permit, claimOf(permit));
        captured.permit = permit;
        throw new UnknownEffectError("sem confirmação do efeito");
      },
    });
    const second = await run.attempt({
      proposal: { ...proposal, capability: "read_source", destination: null },
      evaluate: decision("allow"),
      confirm: async () => true,
      execute: async (permit) => {
        claimPermit(permit, claimOf(permit));
        return "lido";
      },
    });

    expect(first.outcome).toBe("unknown");
    expect(second.outcome).toBe("executed");
    expect(first.attemptId).not.toBe(second.attemptId);
    const permit = captured.permit;
    expect(permit).toBeDefined();
    if (!permit || second.outcome !== "executed") {
      return;
    }
    expect(() =>
      claimPermit(permit, { ...claimOf(permit), attemptId: second.attemptId }),
    ).toThrow(/não pertence|consumido/);
  });
});
