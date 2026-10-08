# J.A.R.V.I.S. — State, Continuity and Recovery Model

**Stage:** 25  
**Natureza:** especificação. Nenhum resume, recovery, event bus ou persistência operacional foi implementado.  
**Base:** `src/cycle/execution.ts`, `src/documentary/runner.ts`, `src/observability/run-recorder.ts`, testes de CoreRun e unknown, Stages 18C–24, ADR-004, ADR-007, ADR-008.

Pergunta da stage: se o processo morrer, o que o J.A.R.V.I.S. ainda sabe — e o que **não** pode virar autorização para continuar.

---

## 1. Objetivo da Stage

Modelar estado, eventos, auditoria e continuidade **como o código se comporta**, sem construir mecanismo de retomar tarefas.

Princípio:

> Conhecimento de uma execução passada ≠ autorização para executar de novo.

---

## 2. Evidências encontradas no código

| Conclusão | Arquivo | Símbolo | Comportamento |
|---|---|---|---|
| Permit só vive no processo | `src/cycle/execution.ts` | `permitStates` (`WeakMap`) | Sem serialização. Restart esvazia o mapa |
| `CoreRun` não guarda Attempts | `execution.ts` | `class CoreRun` | Só `runId`. Cada `attempt()` é efêmero |
| `runId` nasce no runner, não no core | `runner.ts` | `run()` → `randomUUID()` | Novo processo = novo id, a menos que alguém o reutilize à mão. Nada reutiliza |
| Auditoria é só escrita | `run-recorder.ts` | `start` / `record` / `setStatus` / `finish` | Nenhum `SELECT` em produção |
| Evento de Attempt só depois do retorno | `runner.ts` | `perform` → `attempt` → `recordAttempt` | Crash no meio de `execute` = sem linha `attempt` |
| `executing` no CLI ≠ status no SQLite | `runner.ts` `perform` | `interaction.showStatus("executing")` | Não chama `recorder.setStatus` |
| SQLite mistura fase documental e Run | `contracts.ts` documentais + `setStatus` | `ExperimentStatus` | Coluna `runs.status` pode ser `understanding`, não só `RunStatus` |
| Aprovação gravada não é Permit | `runner.ts` | `record(..., "approval")` e payload `approval` em `attempt` | Booleano histórico |
| Unknown não retenta | `tests/core-run.test.ts` | `não executa de novo depois de unknown` | Uma chamada; Permit da Attempt não serve para a seguinte |
| Artefato no disco é outro estado | `files.ts` | `createArtifact` `open(..., "wx")` | Sobrevive ao processo; o Run não |
| CLI fecha o recorder e sai | `index.ts` | `runExperiment` `finally recorder.close()` | Sem retomar o `runId` na próxima invocação |
| ADR-004 fala em reconstruir estado | `docs/adr/ADR-004-sqlite-filesystem.md` | decisão | O código **não** reconstrói. O ADR está à frente da implementação |
| Recorder não é memória | `docs/adr/ADR-007-no-persistent-memory.md` | decisão | Proíbe personalização / contexto automático |

---

## 3. Estado atual

Não há um estado unificado. Há bolsos independentes.

| Bolso | O que é | Dono | Vida | Mutável | Persistido | Reconstruível | Perdível | Papel |
|---|---|---|---|---|---|---|---|---|
| Processo | CLI + stdin + objetos JS | `index.ts` | Até o exit | Sim | Não | Não | Sim, no crash | Operacional |
| `CoreRun` | `runId` | core | Até o GC do objeto | `runId` imutável | Não | Só o id, se alguém o souber | Sim | Operacional mínimo |
| Permit | claim + `consumed` | `WeakMap` | Processo | `consumed` | Não | Não | Sempre no restart | Autorização |
| Attempt | resultado de `attempt()` | stack / runner | Até `recordAttempt` e o `ExperimentResult` | Não depois de retornar | Parcialmente, se `recordAttempt` rodou | Só o que foi ao JSON | Sim, se crash antes do record | Operacional, depois observacional |
| Interação | readline aberto, respostas | `CliInteraction` | Processo | Sim | Não (`ask` não vira evento próprio) | Não | Sim | Operacional |
| Runner locals | `goal`, `clarifications`, `effects`, `outputPath`, `validation` | `ExperimentRunner.run` | Stack | Sim | Validation/effects só se o runner gravar eventos; Goal **não** é persistido como objeto | Não | Sim | Operacional |
| Auditoria | `runs` + `events` | `RunRecorder` | Arquivo SQLite | Status sobrescrito; eventos append | Sim | Como evidência, não como objeto vivo | Disco | Observacional |
| Artefato | arquivo `.md` | filesystem | Disco | Sim | Sim | É o próprio arquivo | Independente do Run | Efeito |
| Validação | `ValidationReport` | runner | Stack; evento `validation` se chegou lá | Não | Se o evento foi gravado | Parcial (payload) | Sim se crash antes | Derivado |

`PermitState.identity` continua sendo o claim da Attempt, não pessoa (Stage 24).

---

## 4. Transições reais

Não existe a máquina:

```text
received → clarification → approval → execution → validation → completed
```

Há **dois eixos** e um roteiro.

### Run (`RunStatus` em `cycle/contracts.ts`)

`received`, `awaiting_approval`, `executing`, `completed`, `completed_with_reservations`, `rejected`, `cancelled`, `failed`, `unknown`.

Terminais, no runner: `rejected`, `cancelled`, `failed`, `unknown`, `completed`, `completed_with_reservations`.

### Fases documentais (`DocumentaryPhase`)

`understanding`, `awaiting_clarification`, `objective_confirmed`, `building_context`, `validating`.

O runner escreve essas strings na **mesma** coluna `runs.status`. Não são AttemptOutcome.

### Attempt (`AttemptOutcome`)

`denied` | `refused` | `failed` | `executed` | `unknown`.

Não há estado “em curso” persistido para Attempt. Enquanto `execute` corre, a Attempt só existe na call stack.

### Sobreposição

| Nome | O que é |
|---|---|
| `AttemptOutcome` | Desfecho da Attempt |
| `RunStatus` | Encerramento / espera do Run |
| `DocumentaryPhase` | Passo do roteiro, misturado no SQLite |
| Validation | Juízo de domínio sobre o draft |
| `ExperimentResult` | Pacote de saída do experimento |
| Effect | Relato opaco / `CapabilityEffect` |
| Observation | Não é tipo. Está dentro do effect ou da mensagem de unknown |

`failed` existe em Attempt e em Run. `unknown` também. Não são o mesmo objeto: o runner **mapeia** Attempt → Run em `finishAttempt`.

`awaiting_approval` no SQLite significa: o `confirm` desta Attempt foi pedido. Não significa Permit emitido.

---

## 5. Eventos existentes

Não há event bus. Há `INSERT` em `events`.

Tipos observados em `runner.ts`:

| `type` | Quando | Snapshot ou evento | `runId` | `attemptId` | Persistido | Suficiente para reconstruir o operacional? |
|---|---|---|---|---|---|---|
| `status` | `setStatus` | Snapshot da última fase/mensagem | Sim | Não | Sim | Só a última etiqueta |
| `sources_inspected` | Depois de `inspect` | Fato | Sim | Não | Sim | Paths, não conteúdo |
| `policy` | Depois da Attempt | Fato da decisão | Sim | Sim | Sim | Sem Permit |
| `attempt` | Depois da Attempt | Fato do desfecho | Sim | Sim | Sim | Booleans `permitIssued` / `permitConsumed`; sem o objeto Permit |
| `approval` | Depois de Attempt **executada** de envio/criação | Fato | Sim | Não neste payload | Sim | Não autoriza de novo |
| `context_built` | Depois das leituras | Fato (warnings, tamanho) | Sim | Não | Sim | Sem o texto das fontes |
| `validation` | Depois de validar | Fato | Sim | Não | Sim | Relatório, se gravado |
| `effect` | Depois de `create_artifact` executed | Fato | Sim | Não | Sim | Path/detalhes do artefato |

Emitidos **depois** da ação correspondente, salvo `status`/`awaiting_approval`, que precedem o `confirm`.

Reprodução: os testes leem SQLite no fim. Produção nunca lê de volta.

Conclusão: são **eventos de auditoria**, não de domínio reexecutáveis.

---

## 6. Auditoria vs estado

O SQLite atual é **B, com um snapshot raso**: histórico/auditoria, mais a coluna `runs.status` / `message` / `finished_at`.

Não é estado operacional (Permits, `CoreRun`, stdin, Goal, conteúdo lido).

Não é nenhum dos dois de forma completa: falta o operacional; o histórico tem janela cega durante `execute`.

**Se o processo morrer agora, o SQLite permite saber o estado operacional?**  
Parcialmente, e só o que já foi escrito.

Falta sempre:

- o objeto Permit e se estava `consumed` neste instante;
- se `execute` já chamou o SDK/`writeFile`;
- Goal e clarifications como estrutura;
- conteúdo das fontes;
- Attempt em voo (sem linha `attempt`);
- se `finished_at` é null, o Run **não** foi `finish()` — mas o status pode ser uma fase documental antiga, não `executing`.

ADR-004 promete “reconstrução de estado”. O código não cumpre. Tratar o ADR como se o resume já existisse seria erro semântico. A implementação manda: auditoria.

---

## 7. Continuidade

```text
Run A → processo termina → novo processo
```

| Pergunta | Resposta no repositório |
|---|---|
| `runId` continua existindo? | Como **chave no SQLite**, se o arquivo `.jarvis/experiment.sqlite` restar. Não como `CoreRun` |
| `CoreRun` reconstruído? | Não. `createCoreRun` só recebe um id; ninguém carrega o antigo |
| Attempts reconstruídas? | Só como JSON em `events`, se `recordAttempt` rodou |
| Permits válidos? | Não. `WeakMap` vazio. Reconstruir um objeto Permit **não** recolocaria o estado no mapa |
| Aprovação anterior reutilizada? | Não pelo core. Nada lê `approval` para pular `confirm` |
| Ação interrompida continua? | Não. O próximo `index.ts` cria **outro** `runId` |
| Sabe se o efeito externo ocorreu? | Só se o mundo (arquivo, provedor) ou um evento já gravado disser. O Run morto não observa |
| `unknown` resolvido? | Não automaticamente |
| Retomar vs investigar? | O código só **inicia** Runs. Investigar seria ler SQLite/disco à mão. Retomar não existe |

---

## 8. Resume vs recovery vs investigation vs retry

| Conceito | Significado | Autoridade |
|---|---|---|
| **Resume** | Continuar o **mesmo** Run / a mesma Attempt | Exigiria o mesmo Permit vivo **ou** uma Attempt nova. O primeiro é impossível após restart. O segundo **não** é resume |
| **Recovery** | Voltar a ter conhecimento operacional (o que estava acontecendo) | Ler evidência. Não executa efeito |
| **Investigation** | Descobrir o efeito no mundo depois de interrupção/`unknown` | Se ler arquivo, API ou perguntar, é **nova** Attempt (ou só Interaction, se não houver efeito) |
| **Retry** | Tentar de novo a **ação** | Sempre nova Attempt, nova política, novo `confirm` se a política pedir. Nunca o Permit velho |

```text
Attempt A → unknown
↛ Attempt B retry automático
```

Pode ser:

```text
Attempt B → observar o sistema externo
Interaction → perguntar ao humano
Recovery → ler auditoria (sem efeito)
```

`tests/core-run.test.ts` (`não executa de novo depois de unknown`, `não deixa o unknown de uma Attempt autorizar outra`) sustenta a separação **dentro do mesmo processo**. Entre processos, a ausência de resume é ainda mais forte.

---

## 9. Unknown após restart

```text
Attempt A → Permit consumido → efeito possivelmente ocorreu → processo morreu
```

O próximo processo **não** “encontra Attempt A” como objeto. Pode encontrar, se `recordAttempt` e `finish(..., "unknown")` rodaram:

- linha `attempt` com `outcome: "unknown"`;
- `runs.status = unknown`, `finished_at` preenchido.

Pode afirmar:

| Afirmação | Sustentada? |
|---|---|
| executado | Não |
| falhou | Não |
| desconhecido | Sim, se o evento foi gravado |
| provavelmente executado | Não. Sem probabilidade no modelo |
| precisa observar | Conceitualmente sim; o código não observa |
| precisa perguntar | Conceitualmente sim; o próximo CLI nem abre esse Run |
| precisa consultar o externo | Conceitualmente sim; nova Attempt |

Se o crash foi **antes** de `recordAttempt`, o SQLite pode mostrar `awaiting_approval` ou `understanding` com `finished_at` null. Aí nem “unknown” está gravado — e o efeito ainda pode ter ocorrido (`claimPermit` + `messages.create` já disparados).

```text
"não sei" ↛ "não aconteceu"
"não sei" ↛ "aconteceu"
```

---

## 10. Autoridade após restart

O novo processo **não herda autoridade**.

| Fonte | Depois do restart |
|---|---|
| Permit | Inexistente |
| Aprovação persistida | Histórico. Não é `confirm()` atual |
| Intenção persistida | Texto em `runs.intention`. Não é Permit |
| Mandato / delegação / autorização contínua | Não existem no código |

Perigoso:

- copiar `permitIssued: true` e chamar a tool;
- tratar evento `approval` como `allow` eterno;
- reusar `attemptId` antigo;
- “retomar” `create_artifact` sem olhar o disco (`wx` vs arquivo já criado).

```text
histórico de autorização ≠ autorização atual
soube que foi autorizado ≠ pode executar de novo
```

---

## 11. Crash points

Ordem real em `CoreRun.attempt` + `perform`:

```text
evaluate → [confirm] → issuePermit → execute (showStatus executing → claimPermit → IO)
→ return → recordAttempt → (roteiro segue ou finishAttempt)
```

### Caso A — antes do Permit

Ex.: crash em `confirm`, ou `deny` já retornado.

- Sabemos: status possivelmente `awaiting_approval`; sem `attempt`.
- Não sabemos: se o humano já ia dizer sim.
- Repetir: nova Attempt, novo `confirm`. Sem efeito externo desta Attempt.
- Continuar automaticamente: não.

### Caso B — depois do Permit, antes da execução externa

`issuePermit` feito; `claimPermit` ainda não (`complete` no Anthropic chama `claimPermit` **antes** do HTTP; `createArtifact` também **antes** do `open`).

Janela pequena: entre `issuePermit` e `claimPermit`. Se crash aí:

- SQLite provavelmente ainda sem `attempt`.
- Efeito externo: provavelmente não (ainda).
- Permit: morto.
- Repetir: nova Attempt. Investigar se o recurso mudou.

Não determinado com precisão de scheduler: um crash exatamente nesse ponto não deixa marca distinta no SQLite.

### Caso C — durante a execução externa

HTTP ou `writeFile` em voo.

- Sabemos: o que o SQLite tinha **antes** desta Attempt (fase anterior / `awaiting_approval`).
- Não sabemos: se o provedor aplicou a chamada; se o arquivo ficou no disco.
- `recordAttempt` ainda não rodou → não há `unknown` gravado.
- Precisa investigação. Nova autorização para qualquer ação nova. Sem resume automático.

### Caso D — depois do efeito, antes de registrar resultado

IO retornou; `recordAttempt`/`finish` não.

- O mundo pode estar alterado (arquivo criado, tokens gastos).
- Auditoria: Run “aberto” (`finished_at` null).
- Afirmar executed/failed/unknown: **não** pelo SQLite desta Attempt.
- Retry cego de `create_artifact`: pode falhar no `wx` ou duplicar efeito se o path mudou.
- Investigar o destino. Nova Attempt de **observação** se a observação for consequencial; listar o path local pode ser só leitura de processo — o experimento atual nem retoma.

### Caso E — depois de registrar, antes de encerrar o Run

`recordAttempt` feito; `finish` não.

- Sabemos o `AttemptOutcome` no JSON.
- `runs.status` pode ainda ser fase antiga; `finished_at` null.
- Não continuar o roteiro automaticamente no próximo processo (não há loader).
- Autoridade da Attempt gravada: esgotada se `permitConsumed` verdadeiro.

---

## 12. Cancelamento + restart

Cancelamento hoje: `ExperimentCancelledError` ou Attempt `refused` → Run `cancelled` + `finish`.

É **fato histórico** no SQLite se `finish` rodou. É também **estado terminal daquele Run**, não uma intenção solta.

Não impede um **novo** Run no próximo CLI. Não desfaz efeitos (`cancelar ≠ undo`, Stage 19).

“Reverter cancelamento” = novo trabalho, nova intenção, novas Attempts, nova política. Ninguém “reabre” o Run cancelado.

Se o processo morrer **depois** do pedido de cancel e **antes** de `finish`, o SQLite pode não dizer `cancelled`. O fato humano ficou só no stdin morto.

---

## 13. Residência futura

Evento externo → J.A.R.V.I.S. detecta → novo trabalho.

| | Modelo A — mesmo Run | Modelo B — novo Run relacionado |
|---|---|---|
| Autoridade | Pressão para reusar Permit/aprovação | Casa com Permit por Attempt |
| Auditoria | Um `runId` interminável | Correlação explícita (campo futuro), Runs fecháveis |
| Isolamento | Unknown/cancel do passado contaminam o presente | Encerramento claro |
| Contexto / memória | Tentação de herdar tudo | Seleção consciente (Stages 20–22) |
| Recuperação | Resume do objeto vivo | Investigar o Run velho; executar o novo |

O código atual só cria Run novo por invocação. Stages 23–24: Attempt nova para efeito novo; Session fora do core; residente ≠ autorização contínua.

**Direção sustentada para efeito consequencial: Modelo B.** Relacionar Runs é questão aberta (não há `parentRunId`). Detectar evento sem efeito pode ser só Interaction, ainda sem Run — também não está no código.

---

## 14. Relação com Memory

Stage 22: Memory ≠ Context ≠ (agora) State ≠ Audit.

| Pode? | Resposta |
|---|---|
| Estado operacional virar memória | Só se alguém **reter** de propósito. Locals do runner não são memória |
| Auditoria virar memória | ADR-007: não automaticamente |
| Evento virar candidato | Sim, conceitualmente; não implementado |
| Memória reconstruir estado operacional | Não. Falta Permit, call stack, mundo |
| Memória mandar continuar a ação | Não. Memory ↛ Permit |

---

## 15. Relação com Identity / Session

Stage 24: sem User/Session; `runId` identifica a execução.

Para distinguir execuções **hoje**, `runId` basta.

`sessionId` só faria sentido com canal contínuo (aberto). Restart de **processo** não precisa de Session para a autoridade: mesmo com Session futura, Permit não revive.

Identificar o Run no SQLite ≠ autorizar continuação.

---

## 16. Modelos possíveis

| Modelo | Complexidade | Recuperação | Unknown | Autoridade | Necessidade atual |
|---|---|---|---|---|---|
| **A — volátil** | Já é o operacional | Nenhuma | Só se o processo sobrevive até `finish` | Correta: Permit morre | **É o runtime** |
| **B — snapshot periódico** | Alta | Mentira fácil no meio do IO | Perigoso | Snapshot de Permit seria R4 | Não |
| **C — event sourcing** | Alta | Reconstruir objetos ≠ reconstruir o mundo | Eventos atrasados (depois do IO) | Rehidratar Permit = R4 | Não |
| **D — audit + reconstruction sob demanda** | Média | Investigação humana/ferramenta | Compatível: evidência parcial | Lê fatos; nova Attempt para agir | **Útil no futuro; ADR-004/008 apontam para evidência, não para resume** |
| **E — híbrido** | Alta | — | — | — | Sem segundo processo concorrente |

O repositório é **A no operacional + D incompleto na observabilidade** (escreve, não lê, janela cega no IO).

Não implementar B/C/E. Não promover o SQLite a resume.

---

## 17. Casos adversariais

| Caso | Pelo modelo atual |
|---|---|
| 1. Aprovou ontem, acha o registro hoje | Não executa de novo. Histórico ≠ `confirm` |
| 2. `unknown` | Não repele automaticamente. Core e runner não retentam |
| 3. Run cancelado + evento depois | Não reativa o Run. Trabalho novo = Run novo (se for efeito) |
| 4. Memory “costuma aprovar” | Sem memória; mesmo se houvesse, ↛ Permit |
| 5. Audit “Action X was approved” | Não é “X is approved now” |
| 6. Attempt incompleta no SQLite | Não continua. Sem loader. Investigar |
| 7. Efeito possível, sistema não sabe | Não afirmar `failed` |
| 8. Evidência de que ocorreu | Não executar de novo o mesmo efeito. Observar / informar. Nova ação se o humano pedir outra coisa |

---

## 18. Limites do Core

**Core atual (suficiente):** `CoreRun`, `attempt`, Permit volátil, `ActionProposal`, `PolicyDecision`, `AttemptOutcome`, `RunStatus`, `UnknownEffectError`.

**Runtime:** `ExperimentRunner` — único dono da sequência e de `finishAttempt`.

**Observability:** `RunRecorder` — evidência. Não faz parte do core (`cycle` não importa o recorder).

**Ainda não deve existir:** resume, recovery manager, retry engine, event store, PersistentRun, Session/Identity.

> **Não há motivo para expandir o Core nesta Stage.**

Persistir Permit ou fazer o core ler SQLite quebraria a fronteira e a autoridade.

---

## 19. Riscos

| Risco | Classe | Por quê |
|---|---|---|
| ADR-004 lido como “já reconstruímos estado” | R2 | Texto vs código. Controlado se esta spec mandar |
| Janela: efeito sem evento `attempt` | R2 | Crash no IO. Investigação, não resume |
| `runs.status` com fase documental / sem `executing` | R2 | Snapshot enganoso |
| Tratar evento `approval` como Permit | R4 **se implementado** | Não ocorre hoje |
| Rehidratar Permit no restart | R4 **se implementado** | WeakMap existe para não persistir |
| Snapshot no meio do write | R3 **se alguém persistir operacional agora** | Unknown viraria “estado salvo” falso. **Não fazer** |
| Event sourcing para retomar | R1 | Sem evidência de necessidade |
| Resume automático do CLI | R1 | Fora do experimento one-shot |

Sem R3/R4 **ativos**. Haveria R3/R4 na **implementação** de persistência operacional ou resume com autoridade herdada.

---

## 20. Questões abertas

- Vale a pena um `SELECT` só para humanos/debug, sem resume (fechar a lacuna “ADR-004 vs código” na observabilidade).
- Como marcar Run **órfão** (`finished_at` null) sem fingir AttemptOutcome.
- Observação de arquivo após `unknown` de `create_artifact`: Attempt nova de leitura vs `inspect` sem Permit (hoje `inspect` não é Attempt).
- `parentRunId` / correlação se residência gerar Run B depois do A.
- Crash exatamente entre `issuePermit` e `claimPermit`: indistinguível no SQLite.

Nenhuma autoriza ResumeManager.

---

## 21. Classificação da Stage

**B — aprovado com riscos.**

O comportamento real está claro e testável: estado operacional é volátil; SQLite é auditoria incompleta; restart não herda Permit; unknown não vira failed nem executed; retry/resume/investigation são autoridades diferentes.

Não é A: ADR-004 promete reconstrução que o código não faz; a janela de crash durante IO deixa a auditoria atrás do mundo; `executing` quase não aparece no banco.

Não implementar continuidade nesta stage.
