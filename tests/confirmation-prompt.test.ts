import { describe, expect, it } from "vitest";
import { confirmationPrompt, exitCodeForStatus } from "../src/interface/cli.js";

describe("pergunta de confirmação", () => {
  it("separa interpretação, envio e criação", () => {
    expect(confirmationPrompt("Confirmar objetivo")).toMatch(/interpretação/);
    expect(confirmationPrompt("Confirmar objetivo")).toMatch(/não autoriza envio/);
    expect(confirmationPrompt("Enviar intenção ao provedor de IA")).toMatch(/envio ao modelo/);
    expect(confirmationPrompt("Enviar fontes ao provedor de IA")).toMatch(/envio ao modelo/);
    expect(confirmationPrompt("Criar artefato final")).toMatch(/criação deste arquivo/);
    expect(confirmationPrompt("Confirmar objetivo")).not.toBe(
      confirmationPrompt("Criar artefato final"),
    );
  });

  it("não trata unknown como sucesso nem como failed", () => {
    expect(exitCodeForStatus("unknown")).toBe(2);
    expect(exitCodeForStatus("failed")).toBe(1);
    expect(exitCodeForStatus("rejected")).toBe(1);
    expect(exitCodeForStatus("completed")).toBe(0);
    expect(exitCodeForStatus("completed_with_reservations")).toBe(0);
    expect(exitCodeForStatus("cancelled")).toBe(0);
    expect(exitCodeForStatus("unknown")).not.toBe(exitCodeForStatus("failed"));
    expect(exitCodeForStatus("unknown")).not.toBe(exitCodeForStatus("completed"));
  });
});
