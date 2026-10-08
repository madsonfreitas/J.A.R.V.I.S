# J.A.R.V.I.S. — Stage 30 Readiness Gate

**Natureza:** gate. Sem MVP novo, sem abstração nova, sem commit.
**Pergunta:** o alinhamento código ↔ decisões é suficiente para o Stage 31 (produzir o primeiro produto)?

**Veredito:** sim, com ressalvas. **B — pronto com ressalvas.** Nenhum R3/R4. Código não contradiz as invariantes de autoridade. O Stage 31 é uso e fechamento do ciclo já existente, não redesenho.

Nenhum arquivo de produção foi alterado neste Stage: não há invariante quebrada que exija correção mínima agora.

---

## 1. Inventário dos Stages B

| Stage | Risco original | Antes | Evidência nova | Agora | Ação |
|---|---|---|---|---|---|
| 19 falha/unknown | unknown mapeado para failed | R2 | `UnknownEffectError`, `RunStatus.unknown`, testes | **Resolvido** no runtime | Manter |
| 20 contexto | TaskContext ≠ contexto geral | R2 | Continua pacote de arquivos; Stage 28 não pede mais | R2 | C — depois |
| 21 capability/tool | `inspect` sem Permit; registry tentador | R2 / R1 | `inspect` só `stat`; política não lê conteúdo | R2 / R1 | C; não generalizar |
| 21 | `DocumentaryActionKind` incompleto | R1 | Corrigido (`send_intention_to_model`) | **Resolvido** | — |
| 22 memória | recorder como memória | R2 | ADR-007; nenhum loader de contexto | R2 | C; não implementar memória |
| 23 planning | Goal-confirm = Permit; planner | R2 / R1 | Runner ainda separa; mesmo `confirm()` na CLI | R2 | B no 31: UX, não Core |
| 24 identity | nomes `session`/`identity` | R2 | Código igual; sem User/Session | R2 | C — não promover |
| 25 continuidade | SQLite como resume; janela IO | R2 | Sem loader; `recordAttempt` depois do execute | R2 | C; ausência de resume **não** bloqueia MVP |
| 25 | ADR-004 promete reconstrução | R2 | Continua auditoria write-only | R2 | C — não “cumprir” o ADR com resume |
| 26 evidência | `observed: true` sem reler | R2 | Igual; Stage 28/29 aceitam E1 no MVP | R2 | C; E2 = Future |
| 26 | validation antes do write | R2 | Intencional no produto | R2 | Aceitável no MVP (§9) |
| 27 interação | `confirm` genérico; sem `pare` no IO | R2 / R1 | CLI `Confirmar? [s/N]`; readline bloqueia | R2 / R1 | B wording; C abort |
| 28 produto | captura “docs”; utilidade não medida | R2 | Critérios Stage 29 separam Nível 2/3 | R2 | B: uso real no 31 |
| 29 aceite | A11 sem teste; CLI unknown | R2 | Política ignora conteúdo; CLI imprime `status` | R2 | B: teste A11 no 31 |
| 18C closeout | leak Permit em send | R4 então | `claimPermit` imediato antes de `messages.create` | **Resolvido** | — |

Nenhum R1/R2 virou R3/R4. Nenhum risco passou a ser necessário para o MVP como infraestrutura nova.

---

## 2. Agravamento

Critérios do enunciado: afetar MVP, invariante, segurança, validação, evidência, caminho principal, deixar de ser hipotético.

| Item | Agravou? | Por quê |
|---|---|---|
| A11 prompt na fonte | **Não para autoridade** | `ExperimentPolicy.evaluate` só vê capability/path. Conteúdo não altera Permit. O modelo ainda pode poluir o *draft* — isso é qualidade (AC-05/18), não bypass de auth |
| `observed: true` | Não | Aceito como E1 no MVP (29 AC-17) |
| Janela efeito sem evento | Não | Fora do caminho feliz; resume continua OUT |
| Utilidade | Tornou-se **necessária para Nível 3**, não para entrar no 31 | Stage 29: 31 pode começar; Nível 3 é o uso |

---

## 3. Auditoria decisão → código

| Decisão | Impl.? | Onde | Testada? | Semântica? | Contradição? |
|---|---|---|---|---|---|
| Attempt/Permit uso único | Sim | `execution.ts` | `core-run.test.ts` | Sim | Não |
| send_* cada um com Permit | Sim | runner + anthropic `complete` | `model-calls.test.ts` | Sim (18C) | Não |
| unknown ≠ failed | Sim | `UnknownEffectError` | `unknown-effect.test.ts` | Sim | Não |
| Contexto ↛ Permit | Sim | policy não lê `TaskContext.content` | policy tests (path) | Parcial (sem A11 e2e) | Não |
| Memória fora | Sim | ADR-007; sem store | — | Sim | Não |
| Planner fora | Sim | roteiro no runner | — | Sim | Não |
| Core sem fs/Anthropic | Sim | `src/cycle` só contratos + execution + ports | — | Sim | Não |
| CLI supervisionada | Sim | `cli.ts` | harness | UX genérica | Não de auth |
| SQLite = evidência | Sim write-only | `run-recorder.ts` | unknown testa attemptId | Não é resume | ADR-004 texto > código |
| Goal no ciclo | Tipo sim | `contracts.ts` | — | `CoreRun` não lê Goal | Esperado (microauditoria 23) |
| `CycleIntelligencePort` | **Não usado** | só definição | Não | Produção usa porto documental | Folga, não contradição |

---

## 4. Core

`src/cycle` não importa documentary, intelligence, sqlite, cli, markdown.

| Peça | Mecanismo ou vocabulário? |
|---|---|
| `CoreRun.attempt` / Permit / `claimPermit` | **Mecanismo** |
| `ActionProposal`, `PolicyDecision`, outcomes, unknown | Mecanismo + tipos |
| `Goal`, `Clarification` | **Vocabulário**; CoreRun não usa |
| `CycleInteraction` | Porto; CLI fora |

O Core **não** é só vocabulário: o portão de autoridade é executável. Também **não** é o roteiro do produto: isso está em `ExperimentRunner`.

Não criar workflow engine.

---

## 5. Autoridade e Permit

Fluxo real: `evaluate` → `confirm` se `require_approval` → `issuePermit` → `execute` → `claimPermit` antes do IO.

A ↛ B: Attempts distintas; testes de isolamento de Permit.

Memória/contexto/Goal/resultado anterior ↛ Permit: Goal-confirm não chama `issuePermit`; `ask` não chama; recorder não é lido na volta.

**Reuso realista?** Só se alguém serializasse o objeto Permit e o WeakMap — não há persistência. Restart zera autoridade. Recriar um POJO Permit **não** passa em `permitStates.get`.

Falha/unknown: Permit pode estar consumido; não autoriza retry.

Nenhuma contradição → sem R3/R4.

---

## 6. Efeito e evidência

Separação: execution = retorno; validation = draft **antes** do write; `observed: true` = autorrelato; sem reread; janela Stage 25.

**Aceitável para o MVP?** Sim, explícito em Stage 28/29 (E1). Não corrigir com verification engine antes do 31.

---

## 7. Unknown, falha, recuperação

`FAILED ≠ EXECUTED ≠ UNKNOWN` no core e no runner.

CLI: `Resultado: ${result.status}` — se `unknown`, a palavra aparece. `exitCode = 1` só para `failed` e `rejected` (`index.ts`). Unknown termina 0: **não** o mascara como failed; scripts podem tratar 0 como sucesso. Risco de produto R2, correção **B** no 31 se quisermos código de saída próprio. Não é R3.

Usuário distingue unknown de completed **se ler o status**. Não há diálogo “consultar o mundo?” (Stage 27). Should, não Must para entrar no 31.

Resume: ausência **não** bloqueia o MVP (one-shot CLI).

---

## 8. Contexto e A11

Defesa de autoridade: suficiente — política e Permit não leem a fonte.

Defesa de conteúdo: prompt `UNTRUSTED_CONTENT_RULES` no adapter; `trust` é só tag, ninguém ramifica nela. O modelo pode ainda obedecer a fonte **no texto do draft**; validator pega fato sem `sourceId`, não “obedeça o jailbreak”.

A11: risco **material para qualidade**, **não** para emissão de Permit. Permanece R2. Teste e2e = B no 31, não Stage 30 código.

---

## 9. Interação

Esclarecimento / Goal-confirm / effect-confirm / recusa: separados no runner; um método CLI.

O humano autoriza o que está nos **detalhes** daquela chamada. Risco UX R2, não de reuso de Permit.

Recusa impede efeito daquela Attempt (`refused` antes de `issuePermit`).

---

## 10. Produto

O código ainda é o Experimento 01. O Stage 28 **renomeia o uso** (síntese operacional), não a pasta `documentary`.

Isso é aceitável se o 31 **não** vender “produto documental” e se o Core permanecer sem Markdown. O arquivo `.md` é efeito, não identidade.

Risco R2 de captura: vigiar linguagem e OUT. Não refatorar `documentary/` agora só por nome.

---

## 11. Critérios de aceitação

Testáveis: sim, na maior parte com testes já existentes.

Exige capacidade inexistente: AC-21/22 (uso humano) — proposital; Nível 3.

Sem critério: abort IO — Future. E2 disco — Future.

Contradição: nenhuma (E1 vs verification alinhado a 26/28).

Lacuna de teste: A11 e2e; AC-15 exit code.

---

## 12. MVP IN/OUT

IN intacto. Nenhuma item OUT tornou-se necessária (sem memória, MCP, git, resume, planner).

Se C1 não tiver utilidade, questionar o **caso**, não adicionar RAG.

---

## 13. Abstrações e complexidade

| Coisa | Problema que resolve | 2º uso? | Core? | Poderia sumir? |
|---|---|---|---|---|
| CoreRun/Permit | Autoridade | Sim (várias capabilities) | Sim | Não |
| ExperimentRunner | Roteiro do produto | Um domínio | Não | Não neste MVP |
| CycleIntelligencePort | Compreensão genérica | **Zero implementadores** | Folha | Sim, depois (D agora) |
| RunRecorder | Auditoria | Um SQLite | Não | Não (ADR-008) |
| Zod schemas | Parse do modelo | Goal+Draft | Não | Não |

Complexidade extra: SDK Anthropic, SQLite, dotenv caseiro — compram o MVP. Não há event bus, registry, planner.

---

## 14. Testes

Detectam violação de Permit, deny, `wx`, unknown, proveniência, cancel de create, allowlist.

Não detectam: A11 e2e; CLI unknown vs exit 0; utilidade; “sim” humano ambíguo.

Suficiente para Nível 2 **entrar** no 31; não para Nível 3.

---

## 15. Documentação

Coerente no arco 18C–29. Folhas: `JARVIS_CORE_RUN_MODEL.md` ainda fala `TaskStatus`; alguns arquivos com encoding `â€”`. **Não** reescritos neste Stage (higiene: não limpar o passado).

Docs 25–29 ainda **untracked** — o 31 deve versioná-los, não redefini-los.

---

## 16. Matriz de readiness

| Área | Estado | Evidência | Risco | Bloqueia 31? |
|---|---|---|---|---|
| Produto | OK COM RISCO | Stage 28; pasta ainda `documentary` | R2 identidade | Não |
| Core | OK | cycle sem adapters | — | Não |
| Autoridade | OK | 18C + testes | — | Não |
| Permit | OK | WeakMap, claim | — | Não |
| Contexto | OK COM RISCO | untrusted; A11 só estrutural | R2 | Não |
| Interação | OK COM RISCO | porto + CLI genérica | R2 | Não |
| Execução | OK | attempt/execute | — | Não |
| Efeito | OK COM RISCO | E1; sem reread | R2 | Não (MVP) |
| Evidência | OK COM RISCO | Stage 26/29 | R2 | Não |
| Validação | OK | validator + runner | — | Não |
| Unknown | OK COM RISCO | tipos+testes; exit 0 | R2 | Não |
| Falhas | OK | failed vs unknown | — | Não |
| Recuperação | OK COM RISCO | sem resume, proposital | R2 | Não |
| Testes | OK COM RISCO | invariantes sim; A11 não | R2 | Não |
| Documentação | OK COM RISCO | drift TaskStatus | R0/R1 | Não |
| Complexidade | OK | porto morto irrelevante | R1 | Não |

Nenhum BLOQUEADOR. Nenhum GAP de invariante.

---

## 17. Decisões de correção

| Item | Decisão |
|---|---|
| Invariante/Permit/unknown no core | — já correto |
| Teste A11 (fonte “ignore regras”) | **B** Stage 31 |
| Exit code / copy de unknown | **B** se o 31 tocar CLI |
| Uso real fundador (Nível 3) | **B** (é o trabalho do 31) |
| Separar wording Goal vs efeito | **B** UX, não arquitetura |
| Reread artefato, resume, Session, memória, planner, MCP | **C** ou **D** |
| Apagar CycleIntelligencePort | **D** agora |
| Reescrever ADRs/docs antigos | **D** agora |
| Renomear `documentary/` | **C** (nome ≠ identidade) |

**A — corrigir agora:** nada.

---

## 18. Classificação

**B — pronto com ressalvas.**

Pode iniciar Stage 31. Ressalvas: Nível 3 ainda não existe; A11 sem teste de comportamento; risco de linguagem “produto documental”; exit 0 em unknown.

Não é A: utilidade e A11 pendentes. Não é C: nenhum gap impede construir. Não é D: C1 continua a forma certa.
