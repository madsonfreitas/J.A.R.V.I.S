# J.A.R.V.I.S. â€” Planning and Decision Model

**Stage:** 23
**Natureza:** especificaÃ§Ã£o. Nenhum planner, workflow, Step ou Plan foi implementado.
**Base:** `src/cycle`, `src/documentary/runner.ts`, Stages 18Câ€“22, `ARCHITECTURE-06`, `JARVIS_GENERALIZATION_TEST.md`.

O cÃ³digo nÃ£o tem um planner. Tem um roteiro documental linear em `ExperimentRunner.run`. Cada efeito consequencial desse roteiro entra em `CoreRun.attempt` com a prÃ³pria `ActionProposal`.

Esta stage descreve o que esse roteiro jÃ¡ faz e o que um plano futuro poderia ser, sem promover o roteiro a motor.

---

## 1. Definition

| Termo | Conceito real? | Significado |
|---|---|---|
| Planning | Sim, como atividade | Decidir a ordem e a necessidade de trabalho antes de cada Attempt, ou de um conjunto delas |
| Plan | Sim, se a sequÃªncia nÃ£o estiver compilada | DescriÃ§Ã£o da sequÃªncia pretendida. NÃ£o existe no cÃ³digo |
| Step | Sim, se houver Plan | Uma unidade de trabalho pretendido. Ainda nÃ£o Ã© Attempt |
| ActionProposal | Sim, no core | Pedido concreto de uma Attempt |
| Strategy | VocabulÃ¡rio | O tipo de abordagem. O experimento documental tem uma: o prÃ³prio runner |
| Decision | VocabulÃ¡rio sobrecarregado | NÃ£o criar tipo. JÃ¡ existem `PolicyDecision`, confirmaÃ§Ã£o de objetivo e `confirm` de aprovaÃ§Ã£o |
| Goal | Sim, no vocabulÃ¡rio do ciclo | Objetivo compreendido: `summary`, `purpose`, `constraints`, `questions`. NÃ£o entra em `CoreRun.attempt` |
| Constraint | Sim, como campo do Goal | RestriÃ§Ã£o dita pelo usuÃ¡rio ou extraÃ­da. NÃ£o Ã© polÃ­tica |
| Dependency | VocabulÃ¡rio | â€œB sÃ³ faz sentido depois de Aâ€. No cÃ³digo: `if (outcome !== "executed") return` |
| Precondition | VocabulÃ¡rio | CondiÃ§Ã£o de mundo ou de estado para o step fazer sentido. NÃ£o Ã© Permit |
| Postcondition | VocabulÃ¡rio | O que deveria ser verdade depois. NÃ£o Ã© Result |
| Expected Effect | Parcial | `ActionProposal.effect` Ã© texto para o humano. NÃ£o Ã© o efeito observado |

NÃ£o criar classes para Plan, Step, Strategy, Dependency ou Precondition.

HÃ¡ duas noÃ§Ãµes de planejamento que esta stage nÃ£o mistura:

1. **Plano como produto** â€” o resultado pedido Ã© um plano (caso 2 do teste de generalizaÃ§Ã£o). Fora do runtime atual.
2. **Planejamento como roteiro de Attempts** â€” o sistema decide o que tentar, em que ordem. Ã‰ o objeto desta stage. Hoje isso estÃ¡ compilado no runner.

---

## 2. Goal

`Goal` estÃ¡ definido em `src/cycle/contracts.ts` e Ã© o retorno de `CycleIntelligencePort.understandIntent`. Ã‰ interpretaÃ§Ã£o da intenÃ§Ã£o, nÃ£o plano.

NÃ£o participa da autoridade. `CoreRun.attempt` nÃ£o importa `Goal`. `ActionProposal` nÃ£o referencia `Goal`. SÃ£o tipos vizinhos no mesmo arquivo, sem dependÃªncia.

O runtime documental usa `DocumentaryGoal` (`extends` o `Goal` do ciclo, com `audience` e `requiredSections`). `DocumentaryIntelligencePort.understandIntent` devolve esse tipo, nÃ£o o `Goal` nu. `CycleIntelligencePort` nÃ£o tem implementador.

O usuÃ¡rio confirma o objetivo (`confirm("Confirmar objetivo", â€¦)`). Essa confirmaÃ§Ã£o **nÃ£o** autoriza `read_source`, envio ao modelo nem `create_artifact`.

Objetivo confirmado â‰  plano aprovado â‰  Permit.

---

## 3. Planning

Planning Ã© a atividade de escolher o prÃ³ximo trabalho, ou uma sequÃªncia, a partir de intenÃ§Ã£o, objetivo e contexto.

No cÃ³digo, nÃ£o hÃ¡ fase `planning`. A sequÃªncia estÃ¡ no TypeScript:

```text
inspect fontes          (sem Permit)
send_intention_to_model (Attempt)
esclarecimentos         (pergunta; cada rodada Ã© nova Attempt de envio)
confirmar Goal          (nÃ£o Ã© Permit)
read_source Ã— N         (Attempt cada uma)
montar TaskContext      (sem Permit)
send_sources_to_model   (Attempt)
validar draft           (sem Permit)
pedir destino
create_artifact         (Attempt)
```

A sequÃªncia sugerida na abertura desta stage:

```text
IntenÃ§Ã£o â†’ CompreensÃ£o â†’ Contexto â†’ Planejamento â†’ Propostas â†’ Policy â†’ Permit
```

**nÃ£o descreve o runtime.** CompreensÃ£o jÃ¡ Ã© Attempt (`send_intention_to_model`). Contexto de arquivos sÃ³ existe depois das leituras. Cada proposta nasce na hora do step, nÃ£o num planner prÃ©vio.

Planning explÃ­cito Ã© opcional (`ARCHITECTURE-06`). Tarefa de uma Attempt nÃ£o precisa de Plan.

---

## 4. Plan

Plan Ã© a descriÃ§Ã£o da sequÃªncia pretendida, quando essa sequÃªncia nÃ£o estiver compilada num roteiro de domÃ­nio.

NÃ£o Ã©:

- lista de Permits;
- `PolicyDecision`;
- Result;
- o Goal.

Um Plan futuro, se existir, vive **acima** do core. O core nÃ£o o interpreta.

O runner atual Ã© um plan implÃ­cito e imutÃ¡vel. NÃ£o precisa ser promovido a objeto.

---

## 5. Step

Step Ã© â€œo que se pretende fazer neste pontoâ€: ler esta fonte, enviar estas fontes, criar este artefato.

Step â‰  Attempt. Attempt sÃ³ existe quando `CoreRun.attempt` corre.
Step â‰  ActionProposal. A proposta sÃ³ Ã© montada quando o step vai ser tentado. O destino de `create_artifact` sÃ³ existe depois de `requestOutputPath()`.

Por isso um Plan **nÃ£o** deve nascer como Ã¡rvore de `ActionProposal` prontas. Propostas precisam de dados do mundo e do usuÃ¡rio no momento da Attempt.

---

## 6. Strategy

VocabulÃ¡rio. â€œUsar o roteiro documentalâ€ Ã© a Ãºnica estratÃ©gia implementada. NÃ£o hÃ¡ escolha entre estratÃ©gias. NÃ£o hÃ¡ tipo.

---

## 7. ActionProposal

JÃ¡ existe. Ã‰ o Ãºnico objeto de trabalho que o core aceita.

Campos atuais: `capability`, `resource`, `destination`, `effect`, `reversible`.

O runner constrÃ³i uma proposta por step, na hora. `effect` Ã© o efeito esperado em prosa, para confirmaÃ§Ã£o humana. NÃ£o Ã© observaÃ§Ã£o.

RelaÃ§Ã£o que preserva o cÃ³digo:

```text
Plan (opcional, fora do core)
  â””â”€â”€ Step (pretensÃ£o)
        â””â”€â”€ quando for a vez: ActionProposal
              â””â”€â”€ PolicyDecision
                    â””â”€â”€ Approval, se exigido
                          â””â”€â”€ Permit
                                â””â”€â”€ Execution
```

NÃ£o:

```text
Plan â”€â”€ autoriza â”€â”€â–¶ todas as ActionProposals
```

---

## 8. Planning vs Authority

```text
Plan â‰  Permit
Plan â‰  PolicyDecision
Step no plano â‰  Attempt autorizada
```

A autoridade entra **somente** em cada Attempt, como nas Stages 18C/19.

Confirmar o Goal nÃ£o autoriza os steps. Recusar um `require_approval` no meio (`refused`) cancela o Run e **nÃ£o** invalida leituras jÃ¡ feitas. Recusar tambÃ©m nÃ£o autoriza as tentativas seguintes: o runner encerra.

O planner, se um dia existir, nÃ£o chama `claimPermit` e nÃ£o devolve `allow`.

---

## 9. Plan vs Action

â€œVou criar um relatÃ³rioâ€ Ã© intenÃ§Ã£o/Goal.

â€œLer, analisar, gerarâ€ Ã© planejamento.

CritÃ©rio mÃ­nimo, sem motor:

| SituaÃ§Ã£o | Forma |
|---|---|
| Um efeito consequencial resolve o Goal | Uma `ActionProposal`. Sem Plan |
| VÃ¡rios efeitos, ou um efeito precisa da observaÃ§Ã£o de outro | SequÃªncia. Pode ser roteiro de domÃ­nio (como hoje) ou um Plan explÃ­cito no futuro |
| SequÃªncia conhecida e estÃ¡vel do domÃ­nio | Roteiro compilado. NÃ£o criar Plan |
| SequÃªncia depende da intenÃ§Ã£o e nÃ£o Ã© conhecida a priori | AÃ­ um Plan como dado comeÃ§aria a fazer sentido. Ainda nÃ£o hÃ¡ esse caso no cÃ³digo |

O Experimento 01 Ã© o segundo caso e usa a terceira forma: roteiro, nÃ£o objeto Plan.

---

## 10. Dependencies

No runner, a dependÃªncia Ã© linear e rÃ­gida: se a Attempt nÃ£o estÃ¡ `executed`, o Run termina. NÃ£o hÃ¡ grafo.

| Desfecho de A | B executa? |
|---|---|
| `denied` / `refused` / `failed` | NÃ£o |
| `unknown` | NÃ£o |
| `executed`, mas validaÃ§Ã£o posterior invÃ¡lida | `create_artifact` nÃ£o corre |
| `executed` e vÃ¡lido o suficiente | o prÃ³ximo step do roteiro corre â€” cada um com polÃ­tica prÃ³pria |

B nÃ£o herda o Permit de A. DependÃªncia de dados â‰  autorizaÃ§Ã£o.

NÃ£o hÃ¡ workflow engine. O `if` do runner basta para o caso atual.

---

## 11. Preconditions

PrecondiÃ§Ã£o: o mundo ou o estado interno precisa estar de um jeito para o step fazer sentido.

AutorizaÃ§Ã£o: a polÃ­tica desta proposta, agora.

| Exemplo no cÃ³digo | Qual Ã© |
|---|---|
| IntenÃ§Ã£o vazia / nenhuma fonte | PrecondiÃ§Ã£o do experimento; Run `rejected` antes de Attempt |
| Arquivo existe e cabe no limite (`inspect`) | PrecondiÃ§Ã£o de leitura |
| Path na allowlist | AutorizaÃ§Ã£o (`evaluateRead`) |
| Destino `.md` e fora das fontes | AutorizaÃ§Ã£o de criaÃ§Ã£o |
| Arquivo ainda nÃ£o existe (`wx`) | PrecondiÃ§Ã£o no momento da execuÃ§Ã£o |
| `TaskContext` montado antes de `createDraft` | PrecondiÃ§Ã£o de dados |
| Permit da Attempt | AutorizaÃ§Ã£o |

â€œArquivo precisa existirâ€ nÃ£o Ã© â€œtenho permissÃ£o para lÃª-loâ€. Os dois podem falhar no mesmo path, por razÃµes diferentes.

---

## 12. Expected vs Actual Effect

| Conceito | Onde mora | Papel |
|---|---|---|
| Expected Effect | `ActionProposal.effect` | O que se pretende explicar ao humano |
| Execution | `execute(permit)` | A funÃ§Ã£o rodou ou lanÃ§ou |
| Actual Effect | mundo / retorno | Arquivo, chamada, bytes |
| Observation | o que o cÃ³digo viu | Body, ausÃªncia de throw, `unlink` incerto |
| Validation | `ResultValidator` | Draft atende Goal e fontes? |
| Result | `AttemptOutcome` e `ExperimentResult` | Dois nÃ­veis, Stage 19 |

O plano prevÃª. A Attempt observa. ValidaÃ§Ã£o julga. Nenhum deles Ã© o outro.

`unknown`: o esperado nÃ£o pode ser tratado como ocorrido.

---

## 13. Failure

Hoje: Attempt `failed` â†’ Run `failed`. Steps seguintes nÃ£o correm. Sem retry. Sem replanejamento.

C, se depende de B, nÃ£o executa.

O Run pode estar parcialmente efetuado: leituras `executed` e criaÃ§Ã£o jamais tentada. Isso jÃ¡ Ã© resultado parcial de efeitos, nÃ£o â€œplano parcialmente concluÃ­doâ€ como objeto.

Replanejar seria um **novo** julgamento, gerando novas `ActionProposal`, cada uma com polÃ­tica nova. NÃ£o Ã© continuaÃ§Ã£o automÃ¡tica.

---

## 14. Unknown

Attempt `unknown` â†’ Run `unknown`. O roteiro para.

NÃ£o continua. NÃ£o trata como `executed`. NÃ£o trata como `failed` para simplificar.

InformaÃ§Ãµes necessÃ¡rias antes de qualquer passo seguinte, no futuro:

- o que se sabe do efeito;
- se o prÃ³ximo step Ã© idempotente ou agravaria um efeito possÃ­vel;
- se o humano quer investigar, encerrar ou propor outra aÃ§Ã£o.

Nenhuma dessas opÃ§Ãµes Ã© retry automÃ¡tico. Investigar, se ler estado externo, Ã© **outra** Attempt.

---

## 15. Cancellation

`ExperimentCancelledError` e `refused` viram Run `cancelled`.

| O quÃª | Efeito do â€œPareâ€ |
|---|---|
| Steps futuros | NÃ£o tentados. Sem Permit |
| Attempt em curso | O core atual nÃ£o aborta IO no meio. O cancelamento observado Ã© recusa de confirmaÃ§Ã£o ou throw no roteiro |
| Steps jÃ¡ `executed` | Permanecem. Leituras e envios jÃ¡ feitos nÃ£o desfazem |
| Efeitos jÃ¡ produzidos | NÃ£o hÃ¡ rollback |

```text
cancelar plano â‰  desfazer efeitos
```

Igual Ã  Stage 19.

---

## 16. Replanning

NÃ£o existe no cÃ³digo. Um Run que para, para.

Quando faria sentido **conceitualmente** recalcular a sequÃªncia:

- Goal mudou;
- contexto material mudou;
- precondiÃ§Ã£o sumiu;
- step `failed` ou `unknown` e o humano pede outro caminho;
- memÃ³ria/contexto relevantes mudaram **e** ainda nÃ£o houve efeito que torne o plano antigo mentiroso.

Isso nÃ£o Ã© a mesma Attempt. NÃ£o Ã© o mesmo Permit.

MÃ­nimo:

| SituaÃ§Ã£o | Forma |
|---|---|
| Continuar o roteiro | PrÃ³ximo step, nova Attempt |
| Interromper | Run `cancelled` / `failed` / `unknown` |
| Outra estratÃ©gia | Novo Plan (se existir) ou novo Run. Efeitos antigos ficam |
| Mesma Attempt de novo | Proibido como reuso de Permit |

Trocar o Goal no meio Ã© interrupÃ§Ã£o + nova compreensÃ£o, nÃ£o um patch silencioso no roteiro.

---

## 17. Human Input

JÃ¡ existem papÃ©is distintos. NÃ£o fundi-los.

| Entrada | O que Ã© | O que nÃ£o Ã© |
|---|---|---|
| `ask` (esclarecimento) | InformaÃ§Ã£o para o Goal | Permit |
| Confirmar objetivo | Aceita a interpretaÃ§Ã£o | AutorizaÃ§Ã£o dos steps |
| `confirm` da polÃ­tica | AprovaÃ§Ã£o **desta** Attempt | AprovaÃ§Ã£o do resto do roteiro |
| `requestOutputPath` | Dado para montar a proposta | Permit |
| Recusar | `refused` / cancelamento | Undo |

Aprovar um Plan futuro, se um dia o usuÃ¡rio vir a sequÃªncia, **nÃ£o** autoriza cada efeito. Cada efeito consequencial continua com `PolicyDecision` na Attempt. AutorizaÃ§Ã£o ampla de plano inteiro nÃ£o estÃ¡ demonstrada e nÃ£o deve ser assumida.

Alternativas (PDF vs Markdown) podem aparecer como escolha de parÃ¢metro da proposta, nÃ£o como Permit.

---

## 18. Memory Relationship

```text
Memory â†’ seleÃ§Ã£o â†’ Context â†’ (Planning / Proposal)
Memory â†› Permit
```

Permitido: memÃ³ria de formato influencia o step â€œgerar relatÃ³rio PDFâ€.

Proibido: memÃ³ria de hÃ¡bito de aprovar preenche `confirm` ou emite Permit para â€œenviarâ€.

Igual Ã s Stages 21 e 22. Planning nÃ£o muda isso.

---

## 19. Context Relationship

Contexto ajuda a compreender e a preencher `resource` / parÃ¢metros do step.

`TaskContext` sÃ³ existe depois das leituras. NÃ£o autoriza `create_artifact`.

MudanÃ§a de contexto no meio do roteiro: os steps jÃ¡ executados nÃ£o desfazem; os futuros, se o roteiro continuar, devem ver o contexto atual, nÃ£o o do inÃ­cio, **e** cada um ainda passa por polÃ­tica.

Contexto â†› Permit.

---

## 20. Capability Relationship

O roteiro atual escolhe a capability **ao montar** a `ActionProposal` (`read_source`, `send_*`, `create_artifact`).

Um Plan pode nomear o tipo de trabalho pretendido no Step. Isso nÃ£o torna a capability autorizada.

Capability inexistente: a polÃ­tica documental dÃ¡ `deny` no default. O core nÃ£o consulta catÃ¡logo. O planner nÃ£o deve â€œinventarâ€ uma capability para furar polÃ­tica.

Escolher capability â‰  autoridade.

---

## 21. Tool Relationship

O Plan nÃ£o precisa escolher a tool.

Hoje a tool estÃ¡ ligada no composition root: `FileCapabilities` e `AnthropicIntelligence`. O step nomeia a capability; a funÃ§Ã£o do domÃ­nio chama a tool **depois** do Permit.

Se no futuro houver duas tools para o mesmo tipo de trabalho, a escolha pode ocorrer na execuÃ§Ã£o do domÃ­nio, nÃ£o como autorizaÃ§Ã£o. Sem ToolRegistry. Sem ToolSelector.

Tool escolhida pelo plano e depois indisponÃ­vel: Attempt `failed` (ou nem chega a `claimPermit`). NÃ£o vira Permit de outra tool.

---

## 22. Plan Validation

O que o modelo precisa, no mÃ­nimo:

| Checagem | Pertence agora? |
|---|---|
| Step vira `ActionProposal` com campos preenchidos | Sim, jÃ¡: o runner monta a proposta |
| DependÃªncia: nÃ£o tentar B se A nÃ£o `executed` | Sim, no roteiro |
| Step nÃ£o nasce com Permit | Sim: invariante |
| Goal e Result batem | ValidaÃ§Ã£o de domÃ­nio, depois de efeitos, nÃ£o â€œvalidaÃ§Ã£o do planoâ€ |
| Grafo semÃ¢ntico â€œleva ao objetivo?â€ | NÃ£o. Sem planner |
| Capability existe num registry | NÃ£o. Sem registry |
| Policy prÃ©via de todos os steps | NÃ£o. PolÃ­tica Ã© na Attempt. Um preview `evaluate` existe sÃ³ para recusar leituras cedo; isso nÃ£o emite Permit |

NÃ£o criar validador de planos.

---

## 23. Plan vs Result

```text
Goal    = o que se quer
Plan    = como se pretende tentar (opcional)
Execution = Attempts
Result  = o que o Run declara, com validaÃ§Ã£o
```

Leituras `executed` + draft invÃ¡lido â†’ Run `failed`, sem artefato. O â€œplanoâ€ (roteiro) nÃ£o foi o resultado.

`completed` / `completed_with_reservations` / `failed` / `cancelled` / `unknown` / `rejected` julgam o Run, nÃ£o a beleza da sequÃªncia.

---

## 24. Observability

NÃ£o criar logging de planos.

EvidÃªncia futura, se um Plan existir:

- `runId` e Goal que originaram a sequÃªncia;
- se memÃ³ria/contexto influenciaram parÃ¢metros (nÃ£o autoridade);
- steps pretendidos;
- para cada um: se virou Attempt, `attemptId`, `PolicyDecision`, `AttemptOutcome`;
- recusas, falhas, `unknown`;
- se a sequÃªncia foi substituÃ­da, qual estava ativa;
- quem confirmou o Goal (distinto de quem aprovou cada efeito).

O `RunRecorder` jÃ¡ grava `policy` e `attempt` por aÃ§Ã£o. Isso Ã© observabilidade de Attempts, nÃ£o de um objeto Plan.

---

## 25. Adversarial Cases

| Caso | Comportamento esperado |
|---|---|
| 1. Objetivo de uma aÃ§Ã£o | Uma `ActionProposal`. Sem Plan |
| 2. Objetivo de vÃ¡rias aÃ§Ãµes | Roteiro ou Plan descritivo. Cada efeito com Attempt prÃ³pria |
| 3. Plano contÃ©m aÃ§Ã£o nÃ£o autorizada | Na Attempt: `denied`. Sem execuÃ§Ã£o. Roteiro atual encerra |
| 4. MemÃ³ria como autorizaÃ§Ã£o | Recusado. `confirm` nÃ£o lÃª memÃ³ria |
| 5. Contexto como autorizaÃ§Ã£o | Recusado |
| 6. A falha, B depende de A | B nÃ£o corre |
| 7. A `unknown` | Roteiro para. Run `unknown`. B nÃ£o corre |
| 8. Cancela durante A | Sem undo de A se A jÃ¡ efetuou. Sem Permit para o resto. Core hoje nÃ£o aborta IO no meio |
| 9. Cancela depois de A | A permanece. B+ nÃ£o correm |
| 10. Contexto muda | Steps futuros, se houver, usam contexto atual + polÃ­tica nova. Efeitos velhos ficam |
| 11. MemÃ³ria muda | Idem. NÃ£o altera Permits passados |
| 12. UsuÃ¡rio altera o objetivo | Interrompe o roteiro atual. Nova compreensÃ£o. NÃ£o recicla Permits |
| 13. Tool some | Attempt `failed` ou nem executa. Sem troca silenciosa de autoridade |
| 14. Capability indisponÃ­vel | `deny` ou falha de execuÃ§Ã£o. Sem furar polÃ­tica |
| 15. PrecondiÃ§Ã£o some | NÃ£o tentar o step. NÃ£o Ã© `denied` por polÃ­tica; Ã© nÃ£o fazer sentido executar |
| 16. Efeito real â‰  esperado | Observation/Validation. NÃ£o reescrever o esperado como se fosse o real |
| 17. Resultado parcial | JÃ¡ ocorre: leituras sim, artefato nÃ£o. Declarar o Run com o status verdadeiro |
| 18. Replanejado | Nova sequÃªncia, novas Attempts. Efeitos antigos ficam |
| 19. Dois planos conflitantes | SÃ³ um roteiro ativo por Run. O atual nÃ£o tem Plan. NÃ£o executar os dois |
| 20. Plano antigo continua depois de substituÃ­do | Proibido. SequÃªncia substituÃ­da nÃ£o gera mais Attempts |

---

## 26. Architectural Risks

| Risco | Classe | Nota |
|---|---|---|
| Planning Engine / DAG / workflow agora | R1 | O runner linear cobre o Ãºnico domÃ­nio |
| Tratar confirmaÃ§Ã£o do Goal como autorizaÃ§Ã£o do roteiro | R2 se alguÃ©m fundir os `confirm`; R4 se emitir Permits em lote | O cÃ³digo atual separa |
| PrÃ©-montar ActionProposals no Plan | R2 | Destino e contexto ainda nÃ£o existem |
| Plan emitir Permit | R4 se implementado | Core nÃ£o deve ler Plan |
| `unknown` â†’ prÃ³ximo step | R4 se implementado | Runner jÃ¡ para |
| Cancelamento com rollback automÃ¡tico | R4 se implementado | Stage 19 |
| Autonomous planner escolhendo tools e executando | R4 se implementado | Furaria 18C/21 |
| Colocar Plan no core | R2 | Core sÃ³ precisa da proposta da Attempt |
| Experimento 02 (plano como produto) virar este runtime | R1 | SÃ£o problemas diferentes |

Sem R3/R4 no estado atual do cÃ³digo.

---

## 27. Proposed Invariants

Validados:

1. Plan nÃ£o Ã© Authority.
2. Plan nÃ£o cria Permit.
3. Plan nÃ£o substitui PolicyDecision.
4. ActionProposal no Plan (ou no roteiro) nÃ£o estÃ¡ autorizada por estar lÃ¡.
5. Memory pode influenciar Plan, nÃ£o Authority.
6. Context pode influenciar Plan, nÃ£o Authority.
7. Precondition nÃ£o Ã© Authorization.
8. Expected Effect nÃ£o Ã© Actual Effect.
9. `unknown` nÃ£o equivale a `executed`.
10. Cancelamento nÃ£o desfaz efeitos.
11. Failure de um Step nÃ£o implica retry.
12. Step dependente nÃ£o executa sem precondiÃ§Ã£o satisfeita **e** sem a prÃ³pria Attempt autorizada. (PrecondiÃ§Ã£o sozinha nÃ£o autoriza.)
13. Replanning nÃ£o autoriza aÃ§Ãµes.
14. Substituir o plano nÃ£o apaga efeitos jÃ¡ produzidos.
15. Resultado nÃ£o Ã© o plano.
16. Tool selection nÃ£o concede autoridade.
17. Capability selection nÃ£o concede autoridade.
18. Plano simples nÃ£o exige infraestrutura de workflow. O roteiro documental prova isso.
19. Autoridade Ã© avaliada na Attempt da aÃ§Ã£o.
20. Core permanece independente do domÃ­nio de planejamento.

Nenhum rejeitado. O item 12 junta precondiÃ§Ã£o e autoridade de propÃ³sito: as duas sÃ£o necessÃ¡rias e distintas.

---

## 28. Open Questions

- Quando a sequÃªncia deixar de ser conhecida a priori, o Plan vira dado no domÃ­nio ou ainda um roteiro gerado uma vez.
- Confirmar um plano visÃ­vel ao usuÃ¡rio: o que exatamente ele confirma, se nÃ£o os Permits.
- Abortar IO no meio de uma Attempt (hoje nÃ£o hÃ¡).
- VÃ¡rios steps independentes em paralelo: o core atual Ã© sequencial por chamada; paralelismo nÃ£o estÃ¡ no modelo e nÃ£o Ã© necessÃ¡rio agora.

Nenhuma autoriza implementaÃ§Ã£o.

---

## 29. Core Boundary

O Core **nÃ£o** precisa saber como a sequÃªncia foi construÃ­da.

Para executar uma Attempt, basta: `ActionProposal`, `PolicyDecision`, `Permit`, Attempt, `AttemptOutcome`. `CoreRun` nÃ£o vÃª `Goal`.

`Goal` pertence ao vocabulÃ¡rio do ciclo (`contracts.ts`, porto de compreensÃ£o). NÃ£o pertence ao kernel de autoridade. Ter `Goal` no mesmo pacote que `ActionProposal` nÃ£o faz o plano, o objetivo ou a compreensÃ£o emitirem Permit.

NÃ£o deve conhecer: Plan, Step, Strategy, grafo de dependÃªncias, precondiÃ§Ã£o como tipo, planner.

```text
Core.attempt(ActionProposal) â†’ Policy â†’ Approval? â†’ Permit â†’ execute
```

O roteiro documental, ou um Plan futuro, sÃ³ decide **qual** proposta apresentar **agora**.

`Goal` no vocabulÃ¡rio do ciclo nÃ£o puxa Plan para o core. SÃ£o camadas diferentes: o que se quer vs. como se tenta.

---

## 30. Implementation Boundary

Nada desta stage vira cÃ³digo.

NÃ£o criar Plan, Step, PlanningEngine, DAG, Goal Manager, Strategy Engine, nem testes de planner.

O menor mecanismo, **quando** um segundo domÃ­nio precisar de sequÃªncia nÃ£o compilada: uma lista ordenada de steps descritivos no domÃ­nio, cada um materializado em `ActionProposal` na hora, cada um passando por `CoreRun.attempt`. Sem grafo. Sem autorizaÃ§Ã£o em lote.

AtÃ© lÃ¡, `ExperimentRunner` continua sendo o Ãºnico â€œplannerâ€: um script.

---

## 31. Stage Classification

**B â€” aprovado com riscos.**

Planning separa-se de autoridade no runtime real. O core jÃ¡ recebe uma proposta por vez. NÃ£o hÃ¡ lacuna que exija workflow engine. A sequÃªncia da abertura desta stage foi rejeitada como ciclo obrigatÃ³rio.

Riscos: R1 (planner/DAG futuros, plano-como-produto) e R2 (fundir confirmaÃ§Ã£o de Goal com autorizaÃ§Ã£o; prÃ©-materializar propostas). Sem R3/R4 ativos.

NÃ£o implementar planner com base neste documento.
