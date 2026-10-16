# J.A.R.V.I.S. — Human Interaction Model

**Stage:** 27
**Natureza:** especificação. Nenhuma UI, chat, ConversationManager ou protocolo foi criado.
**Base:** `src/cycle/interaction.ts`, `src/documentary/interaction.ts`, `src/interface/cli.ts`, `src/documentary/runner.ts`, `src/cycle/execution.ts`, ADR-005, Stages 18C–26.

Pergunta da stage:

> Como transformar compreensão, incerteza, decisão e resultado numa interação útil, transparente e controlável — sem confundir fala com autoridade?

---

## 1. Objetivo da Stage

Modelar o contrato humano–agente a partir do CLI real, preservando:

```text
Clarificação ≠ autorização
Preferência ≠ autorização
Observação ≠ autorização
Confirmação = só o efeito desta Attempt (ou a recusa do Goal, que não é Permit)
Unknown ≠ failure
Investigar ≠ repetir
Cancelar ≠ desfazer
Proatividade ≠ autoridade
Identidade ≠ autorização
Conhecimento contínuo ≠ autoridade contínua
```

Não existe `src/documentary/intelligence.ts`. Compreensão está em `intelligence-port.ts` + `anthropic-intelligence.ts`.

---

## 2. Evidências encontradas no código

| Conclusão | Arquivo | Símbolo | Comportamento |
|---|---|---|---|
| Core pede um booleano, não uma conversa | `execution.ts` | `AttemptRequest.confirm` | Só se `require_approval`. `true` → `issuePermit`. `false` → `refused` |
| Porto de ciclo: status, pergunta, confirmação | `cycle/interaction.ts` | `CycleInteraction` | Sem ID de mensagem, sem canal, sem User |
| CLI implementa o porto documental | `cli.ts` | `CliInteraction` | readline; `confirm` aceita só `s`/`sim`; default é não |
| Intenção entra como string única | `collect-input.ts` | `intention` | `--intention` ou `ask("Qual resultado…")`. Não há tipo Comando vs Intenção |
| Esclarecimento é `ask`, depois nova Attempt de envio | `runner.ts` | loop `goal.questions` → `requestIntention` | Resposta vira `Clarification`. Enviar de novo exige `confirm` de `send_intention_to_model` |
| Confirmar objetivo **não** passa por `CoreRun` | `runner.ts` | `confirm("Confirmar objetivo", …)` | Recusa → `ExperimentCancelledError`. Sem Permit |
| Confirmar envio/criação **passa** por `CoreRun` | `runner.ts` `perform` | `confirm` da Attempt | Título + detalhes daquela proposta. Um `sim` por chamada |
| Preview não autoriza criar | `runner.ts` + `cli.ts` | `showPreview` | Texto antes do write. Path vem depois via `requestOutputPath` |
| Resultado final é status + mensagem + `runId` | `index.ts` | `main` | `Resultado: ${status}` |
| Não há comando `pare` durante `execute` | CLI / `CoreRun` | — | Cancelar = recusar `confirm` ou recusar Goal. IO em curso não é abortado |
| Testes isolam confirmações por índice | `fakes.ts` / `run-experiment.test.ts` | `confirms: [true, true, true, false]` | O quarto `false` cancela a criação; não reutiliza os `true` anteriores |

---

## 3. Interação atual

```text
humano
  → argv / readline
  → collectInput (intenção + paths)     [antes do Run]
  → ExperimentRunner.run
       showStatus
       confirm send_intention            [Attempt + Permit se sim]
       ask (perguntas do Goal)
       confirm send_intention de novo    [outra Attempt]
       confirm objetivo                  [NÃO é Permit]
       confirm send_sources              [Attempt]
       showPreview
       requestOutputPath                 [dado, não autorização]
       confirm create_artifact           [Attempt]
  → stdout Resultado / mensagem / runId
  → close readline
```

| Troca | Quem controla | Autoridade |
|---|---|---|
| Intenção / fontes | Humano; runner rejeita vazio | Não |
| Status `[fase] texto` | Runner + CLI | Não |
| `ask` | Modelo via `Goal.questions`; humano responde | Não (contexto). O envio seguinte tem o próprio `confirm` |
| `confirm` de política | CoreRun + runner (título/detalhes) | Sim, **desta** Attempt |
| `confirm` de Goal | Runner | Encerra o Run se não; não emite Permit |
| Preview / path | Runner + humano | Path preenche a proposta; Permit só no `confirm` de criar |
| Erro / unknown / cancel | `setStatus` + `ExperimentResult` | Não |
| Encerramento | `index.ts` `finally` | Não |

O humano não escolhe capability, tool nem vê o objeto Permit. Vê prosa da proposta (`ActionProposal.effect` / detalhes).

---

## 4. Intenção vs comando

Ambos chegam no **mesmo** campo `intention`. O código não distingue “organizar meu dia” de “crie agenda.md”.

Quem transforma em objetivo: `understandIntent` (Attempt `send_intention_to_model`). Quem escolhe ações: o **roteiro** documental, não o usuário e não o Core.

O usuário **não** precisa conhecer capabilities, tools ou Permits. Precisa confirmar efeitos descritos em linguagem natural + destino.

Não determinado: se uma intenção que já é comando operacional deveria pular esclarecimento. O runner sempre segue o mesmo script.

---

## 5. Clarification

```text
intenção → Goal.questions → ask → Clarification[] → nova Attempt de compreensão
```

- A resposta **atualiza contexto** da compreensão (lista `clarifications`).
- A resposta **não** é Attempt. O **reenvio** ao modelo é Attempt (com `confirm` próprio).
- Responder **não** autoriza `read_source` nem `create_artifact`.
- Pode esclarecer ambiguidade se o modelo limpar `questions`.
- Pode mudar o objetivo: o próximo `Goal` substitui o anterior. Ainda falta o `confirm` de objetivo.
- Se a resposta trouxer intenção nova, o código **não** ramifica; junta no mesmo array e reenvia a intenção original + esclarecimentos.

Máximo 3 rodadas (`MAX_CLARIFICATION_ROUNDS`).

> Responder a esclarecimento ≠ autorizar ação consequencial.

---

## 6. Proposta vs ação

Diferença existe na **autoridade**, não num tipo `Proposal` de UI.

- Proposta: `ActionProposal` + texto do `confirm` / Goal.
- Ação: `execute(permit)` depois do Permit.
- Resultado: `AttemptOutcome` + `ExperimentResult`.

O usuário vê a pretensão **antes** de efeitos `require_approval` (envio ao modelo, criar arquivo). Leituras `read_source` são `allow` se na allowlist — **sem** `confirm` humano (política documental). Preview mostra o markdown **antes** de criar.

---

## 7. Confirmação

`confirm()` da política autoriza **somente** emitir o Permit **desta** Attempt, para a `ActionProposal` que a `PolicyDecision` carrega.

Não é reutilizável (`WeakMap`, `attemptId` novo). Não autoriza a Attempt seguinte. Não é persistido como mandato (evento `approval` é auditoria).

CLI: o humano responde à pergunta genérica `Confirmar? [s/N]`. A ligação semântica está no **título e detalhes impressos imediatamente antes**, e no fato de a Promise pertencer àquela Attempt — não no parser da palavra “sim”.

`ScriptedInteraction.confirm()` ignora título: o teste prova ordem, não compreensão humana.

Confirmar Goal é outro ato: aceitar a interpretação, não um efeito.

---

## 8. Contexto da confirmação

```text
"Posso enviar este documento para João?" → sim
"Posso apagar o original?" → exige outro confirm / outra Attempt / outro Permit
```

No código: cada `perform` tem o seu `confirm`. Recusar o de criar não desfaz envios já `executed`. Os `true` anteriores no harness não preenchem o quarto.

Um “sim” ambíguo no CLI ainda é booleano da Attempt **em curso**. O risco é de **UX** (o humano não ler os detalhes), não de reuso de Permit.

---

## 9. Incerteza

| Situação | Comunicação atual |
|---|---|
| `unknown` | `setStatus("unknown", message)` + resultado `unknown`. Não diz “falhou” nem “completed” (`unknown-effect.test.ts`) |
| `failed` | mensagem da Attempt / validação inválida |
| Conflito no draft | vira reserva no validator; preview; `completed_with_reservations` se gravar |
| Evidência insuficiente do mundo | Stage 26: não é explicada como verification; `unknown` leva a mensagem da capability |

Interface futura deve **preservar o vocábulo** unknown / recusado / negado / falhou / executado, e não traduzir unknown para ícone de erro ou de sucesso.

---

## 10. Resultado vs explicação vs evidência

| | Hoje |
|---|---|
| Resultado | `ExperimentResult.status` + `message` + `outputPath` |
| Explicação | Status line e `decision.reason` / `proposal.effect` |
| Evidência | `CapabilityEffect.details` (auto-relato), eventos SQLite, preview. Não “reli o arquivo” |

Mistura: a mensagem final “Artefato criado em …” afirma efeito com evidência E1 (Stage 26).

---

## 11. Transparência

Necessário para controle, sem dump:

- o que entendeu (Goal, confirmado);
- o que pretende (detalhes do `confirm` da Attempt);
- o que está esperando (status);
- o que fez / falhou / não sabe (`AttemptOutcome` / Run);
- fontes (paths no confirm de envio);
- o que precisa de sim.

Não necessário na conversa: Permit JSON, WeakMap, schema Zod, prompt completo (o confirm de envio já avisa que conteúdo sai).

Excesso: repetir todo o draft em cada status. Preview uma vez basta.

---

## 12. Progresso

| Nome | O que é | UI? |
|---|---|---|
| `received`, `awaiting_approval`, `executing`, terminais | `RunStatus` real (executing no CLI via `showStatus`, pouco no SQLite — Stage 25) | Útil resumido |
| `understanding`, `awaiting_clarification`, `objective_confirmed`, `building_context`, `validating` | Fases documentais | Útil no experimento; não são Core |
| planning | Não existe | Não inventar na UI |
| Eventos `policy` / `attempt` | Observabilidade | Não precisam ser chat |

Status line `[fase] mensagem` já é o progresso. Não é state machine de UI.

---

## 13. Cancelamento

Cancelável hoje: recusar Goal; recusar `require_approval`; throw `ExperimentCancelledError`.

Não cancelável no código: Attempt no meio do HTTP/`writeFile` (sem abort). Mensagem posterior “pare” **não** é lida — readline está bloqueado em `execute` ou o processo já avançou.

Efeito já ocorrido: permanece. Cancelar ≠ rollback (Stage 19). Cancelar não usa Permit. Não impede um **novo** Run no próximo processo (Stage 25).

Comunicar: Run `cancelled` + o que já foi feito se houver `effects` (hoje o resultado lista effects parciais só se o runner os tiver acumulado antes da recusa).

---

## 14. Unknown + humano

Não há pergunta pós-unknown. O Run **termina** com `unknown`.

Conceito futuro:

> “Pode ter ocorrido. Quer que eu consulte o sistema?”

- A pergunta atualiza contexto se o humano responde.
- “Sim, consulte” autoriza a **investigação** (Attempt B), não a ação original A.
- Investigar ≠ repetir. Permit de B ≠ Permit de A.

---

## 15. Proatividade futura

| Ato | Semântica | Autoridade |
|---|---|---|
| Informação | “Detectei X.” | Nenhuma |
| Sugestão | “Recomendo Y.” | Nenhuma |
| Pergunta | “Quer que eu faça Y?” | Ainda não; o sim seguinte é Attempt de Y |
| Ação | “Fiz Y.” | Só depois de Permit de Y |

Proatividade não cria autoridade.

---

## 16. Memória vs conversa

Fala anterior neste Run: `Clarification` ou intenção inicial — contexto da compreensão, não mandato.

“Eu gosto que você faça X”:

- preferência, se retida um dia (Stage 22);
- não autorização;
- não instrução atual salvo o humano estar respondendo **esta** pergunta/confirm.

Preferência ≠ autorização.

---

## 17. Identity / Session

Quem interage: quem tem o stdin. Sem User id.

Um Run recebe **várias** interações (`ask`/`confirm`/preview). Uma invocação CLI = um Run. Conversa com vários Runs = visão futura, Session **fora** do Core (Stage 24, Modelo D).

Identidade da pessoa ≠ identidade da autorização (Permit = Run+Attempt+ação).

---

## 18. Observação + interação

“O arquivo já existe” (se um dia for dito) é contexto. Não autoriza sobrescrever.

Hoje o equivalente bruto é `EEXIST` → Attempt `failed`, mensagem de erro — não um “posso apagar?”.

Observation → Context → (opcional) Proposta → Policy → Permit.

---

## 19. Casos adversariais

| Caso | Modelo atual / esperado |
|---|---|
| 1. “sim” ambíguo | Vale só para a Attempt cujo `confirm` está aberto. Risco de UX, não de Permit cruzado |
| 2. Aprovou A, sistema executa B | B precisa do próprio `evaluate`/`confirm`. Core não reutiliza Permit |
| 3. Aprovou envio, tenta apagar original | Política documental **nega** overwrite de fonte; não há ação apagar. Novo efeito exigiria nova proposta |
| 4. Preferência passada = autorização | Não há memória; proibido se houver |
| 5. Memory pula confirm | `confirm` não lê memória |
| 6. Observa problema e age | Roteiro não tem esse atalho |
| 7. unknown informado como falhou | Proibido; teste e `RunStatus.unknown` |
| 8. unknown → retry auto | Proibido |
| 9. Cancela depois do efeito e afirma undo | Proibido; efeitos ficam |
| 10. Mensagem durante Attempt | Não determinado como concorrência: CLI é síncrono. Não deve autorizar nada. Cancelamento cooperativo = hipótese futura, sem abort de IO hoje |

---

## 20. Limites do Core

Hipótese: o Core garante execução e autoridade, não a apresentação da conversa.

**Validada.** O Core conhece `confirm: (PolicyDecision) => Promise<boolean>` e `CycleInteraction` como porto. Não conhece readline, markdown, “Confirmar? [s/N]”, preview, path, nem Goal-confirm.

| Camada | Papel |
|---|---|
| **Core** | Se a política pede aprovação, espera booleano desta Attempt; emite Permit |
| **Runtime** | Ordem das perguntas; Goal-confirm; quando perguntar |
| **Interaction** | Contrato ask/confirm/status |
| **Interface** | CLI hoje; outro canal amanhã |
| **Domain** | Textos dos detalhes, preview, critérios |

Não colocar DialogueManager no Core.

---

## 21. Modelos possíveis

| Modelo | Compatível? |
|---|---|
| A — Core conversa | Não. Furaria a fronteira |
| **B — Interaction fora do Core** | **Sim. É o código** (`CycleInteraction` + CLI) |
| **C — Interaction + Presentation separadas** | **Sim.** Porto vs `CliInteraction`. ADR-005: interface substituível |
| D — múltiplos canais | Futuro: cada canal implementa o porto. Sem MessageBus agora |

Hipótese futura: NotificationManager só para informação/sugestão, nunca para emitir Permit.

---

## 22. Riscos

| Risco | Classe | Nota |
|---|---|---|
| Mesmo `confirm()` para Goal e para política | R2 | Semânticas diferentes; fácil fundir na UI |
| “Confirmar? [s/N]” genérico | R2 | Ligação é contextual, não lexical |
| Chat puro (ADR-005 rejeitou) misturar sim com intenção | R4 **se** o canal único interpretar qualquer “sim” como Permit | CLI atual não faz |
| Comando `pare` no meio do IO | R1 | Não existe |
| Personalidade / voice | R1 | Fora do experimento |
| Pular confirm com hábito/memória | R4 **se implementado** | |

Sem R3/R4 ativos.

---

## 23. Questões abertas

- Deve Goal-confirm usar outro verbo na UI (“Aceitar interpretação” vs “Autorizar efeito”)?
- Como um canal assíncrono (notificação) liga o `sim` à Attempt certa sem Session no Core?
- Abort de Attempt em curso (Stage 23/25) vs só recusar o próximo confirm.
- Se `ask` devolve um comando (“esquece, cria o arquivo”), o runtime trata como esclarecimento ou nova intenção? Hoje: esclarecimento.

---

## 24. Classificação da Stage

**B — aprovado com riscos.**

O CLI já separa esclarecimento, confirmação de Goal e confirmação por Attempt. O Core só vê o booleano da Attempt. Os princípios da stage se sustentam no código.

Não é A: um único `confirm()` serve a dois atos; o prompt genérico “Confirmar?”; unknown não tem diálogo de investigação; não há cancelamento durante IO.

Não implementar chat, ConversationManager, personalidade nem frontend.
