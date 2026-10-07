# J.A.R.V.I.S. — Identity, Session and Lifecycle Model

**Stage:** 24
**Natureza:** especificação. Nenhum manager, login, store ou tipo novo foi implementado.
**Base:** `src/cycle`, `src/documentary`, `src/observability`, `src/interface`, Stages 18C–23, `JARVIS_CONTEXT.md` §17.

O processo atual é um CLI que cria um `runId`, um `CoreRun` e termina. Não há usuário, sessão, ator nem principal como tipos. Há dois nomes no código que **não** são identidade de pessoa: a variável `session` no runner (é um `CoreRun`) e `PermitState.identity` (é o `PermitClaim` da Attempt).

Introduzir Identity/Session/Lifecycle no Core agora seria abstração prematura. O mapa conceitual abaixo existe para não confundir o futuro residente com autorização contínua.

---

## 1. Objetivo

Descobrir o que Identity, User, Actor, Principal, Session, Run, Interaction, History, Context, Memory e Lifecycle significam no J.A.R.V.I.S., o que o código já faz, e o que **não** precisa virar tipo.

Pergunta da stage: a introdução desses conceitos **melhora** a arquitetura agora, ou só antecipa o futuro?

Resposta: melhoram o mapa. Não justificam implementação.

---

## 2. Estado atual encontrado no código

| Conceito | No código? | Onde |
|---|---|---|
| Run | Sim | `CoreRun`, `runId` (UUID no `ExperimentRunner.run`) |
| Attempt | Sim | `CoreRun.attempt`, `attemptId` (UUID) |
| Permit | Sim | `issuePermit` / `claimPermit`; estado em `WeakMap` |
| Interaction | Porto, sem ID | `CycleInteraction` / CLI readline |
| Goal | Vocabulário do ciclo | `contracts.ts`; `CoreRun` não lê |
| User / Identity / Actor / Principal / Session | Não | — |
| History | Auditoria | `RunRecorder` SQLite (`runs`, `events`) |
| Context | Documental | `TaskContext` deste Run |
| Memory | Não | ADR-007 |

Fatos que a documentação anterior às vezes deixa opacos:

- `const session = createCoreRun(runId)` **não** é Session. É o Run.
- `PermitState.identity` **não** é pessoa. É `{ runId, attemptId, capability, resource, destination }`.
- `messages: [{ role: "user" }]` no adapter Anthropic é papel da API, não User do J.A.R.V.I.S.
- `JARVIS_CORE_RUN_MODEL.md` ainda fala `TaskStatus`; o código usa `RunStatus`. Fases documentais saíram do core.
- Permits morrem com o processo (`WeakMap`). O SQLite não retoma Run nem Permit.
- Um processo CLI = um experimento = um Run = exit. Não há retomada.

Quem autoriza, hoje: quem responde `confirm()` neste stdin. Não há identificador para essa pessoa.

---

## 3. Identity

Identity não é, no código, uma conta nem um login.

Conceitualmente, identidade é **quem o sistema trata como origem estável de preferências, isolamento e (futuro) histórico pessoal**. Não é autoridade.

Não escolher uma só equivalência:

| Candidato | Serve sozinho? |
|---|---|
| Pessoa física | A visão fala em usuários. O CLI não identifica pessoa |
| Conta | Não existe. Não é necessária para o experimento |
| Entidade lógica | Útil no futuro (pessoa, org, agente). Não agora |
| Configuração / preferências | Podem *pertencer* a uma identidade. Não são a identidade |
| Autoridade | Não. Identity ≠ Permit |
| Identificador | No futuro, um id. Hoje o isolamento é o processo |
| Origem da interação | O stdin da CLI. Frágil e implícito |

Agora: identidade é implícita e de processo. Não materializar.

---

## 4. User

User é o humano (ou titular) **para quem** o J.A.R.V.I.S. trabalha neste experimento.

- Não é necessariamente quem autoriza cada ação: `confirm()` é o ator naquele instante. No CLI, coincidem.
- É quem inicia o Run, hoje, porque `collectInput` e `run()` estão no mesmo processo.
- Pode existir sem Session: o one-shot atual não tem Session.
- No futuro pode ter várias Sessions. Isso não está no código.
- Sistema externo agindo em nome do User é o problema de Principal. Não ocorre.
- Outro Actor iniciar Run para um User: não ocorre. Quando ocorrer, o Permit continua sendo da Attempt, não “do User”.

User não entra no Core. Não há tabela.

---

## 5. Actor

Actor é **quem está fazendo esta troca ou esta execução agora**.

Hoje, sem tipo:

| Ato | Actor de fato |
|---|---|
| Digitar intenção, `ask`, `confirm` | Humano no terminal |
| Montar proposta, chamar `attempt` | Runner (processo J.A.R.V.I.S.) |
| `messages.create` | Provedor, depois de Permit |
| `readFile` / `writeFile` | Filesystem, depois de Permit |

Actor ≠ User. O runner executa. O humano confirma. O SDK não é o User.

O Core não precisa de Actor para emitir Permit. Precisa de `PolicyDecision` + `confirm` desta Attempt.

---

## 6. Principal

Principal seria **em nome de quem** o efeito ocorre.

Não existe no código. Não entra no Core agora.

Faria diferença só quando Actor ≠ User: integração, agente, “mande aquilo de novo”. Até lá, Principal é vocabulário, não tipo.

Autorização não “pertence” ao Actor nem ao Principal como objeto. Pertence à Attempt: política + (se exigido) confirmação + Permit de uso único. Um Actor diferente não reutiliza esse Permit — o `WeakMap` e o `attemptId` já impedem reuso técnico; o invariante humano é: outro confirmador não herda o sim anterior.

Não introduzir Principal porque IAM tradicional usa o termo.

---

## 7. Identity × Authority

```text
Identity  →  no máximo contexto para a política
Policy    →  decide
Permit    →  autoriza esta Attempt
Attempt   →  executa
```

```text
Identity ↛ Permit
Session  ↛ Permit
```

- Identificar alguém não autoriza.
- Conhecer o User não emite Permit.
- “Sessão autenticada” (quando existir) não autoriza qualquer ação.
- Identidade mudar no meio de um Run: o Run atual não tem esse dado. Se um dia tiver, mudança não recicla Permits emitidos.
- Uma identidade pode, no futuro, ter várias políticas de domínio. A política consulta fatos; a identidade não chama `issuePermit`.
- Só o `CoreRun` emite Permit.

---

## 8. Session

Session, se existir, é a **camada de interação contínua**: quem está conversando, por quanto tempo, com que canal.

Não é:

- sequência obrigatória de Interactions com ID;
- Memory;
- Context;
- Run;
- autoridade.

Perguntas contra o código:

| Pergunta | Hoje |
|---|---|
| Só uma sequência de Interactions? | O readline vive enquanto o processo. Sem objeto Session |
| Pode conter vários Runs? | Um processo, um `runner.run`. Não |
| Run sem Session? | Sim. É o caso atual |
| Runs de objetivos diferentes? | Não há Session para agrupá-los |
| Mantém contexto? | Não. `TaskContext` é do Run |
| Mantém memória? | Não há memória |
| Mantém identidade? | Implícita no processo |
| Tem autoridade? | Não |
| Sobrevive a restart? | Não. Processo acaba |
| Retomável / persistente? | Não. SQLite não é Session |

Session é **opcional e externa**. Necessária na visão níveis 1–2 de residência (`JARVIS_CONTEXT.md`). Desnecessária no Experimento 01.

---

## 9. Run

Run já existe. É a **unidade de execução acompanhada**: uma intenção, zero ou mais Attempts, um encerramento.

| Pergunta | Resposta no código |
|---|---|
| Diferença para Session | Run executa Attempts. Session (inexistente) seria conversa/canal |
| Começo/fim | `recorder.start` → `finish`; `RunStatus` terminal |
| Pausar / retomar | Não |
| Sobrevive ao processo | O *registro* no SQLite sim. O *objeto* e os Permits não |
| Vários Attempts | Sim |
| Vários Goals | Um `DocumentaryGoal` mutável por esclarecimento, depois confirmado. Não é lista de Goals |
| Pertence a Session? | Não há Session |
| Pertence a User? | Não há campo. Pertence ao processo |
| Precisa conhecer Identity? | Não. `CoreRun` só guarda `runId` |

Hierarquia **não** implementada:

```text
Session
  └── Run
        └── Attempt
```

Hierarquia **real**:

```text
processo CLI
  └── CoreRun (runId)
        └── attempt() × N
              └── Permit (WeakMap, uso único)
```

---

## 10. Interaction

Interaction é uma **troca** no porto: status, pergunta, confirmação, prévia, path.

Não tem `interactionId`. Não inicia o Run sozinha: `collectInput` + `runner.run` iniciam. Uma pergunta de esclarecimento **continua** o Run. `confirm` responde à política desta Attempt; não é o Permit.

Pode existir fora de Run? Em tese, um CLI poderia conversar antes. Hoje quase tudo depois de `run()`. `collectInput` é anterior ao Run — intenção e paths, ainda sem `runId`.

Interaction não tem autoridade material por existir. Só `confirm === true` **desta** Attempt, depois de `require_approval`, permite emitir Permit. `ask` e `showPreview` não emitem.

---

## 11. History

History = o que foi **registrado** (`RunRecorder`: intenção, status, policy, attempt, effects).

Não é Memory. Não é Context. Não autoriza.

Pode informar um Context futuro se alguém **selecionar** um evento. ADR-007 proíbe usar o recorder como contexto automático da próxima tarefa.

Pode ser apagado como arquivo SQLite; isso não desfaz efeitos no disco. Memory (quando existir) não deve ser o dump da History.

---

## 12. Context

Stage 20: informação **em uso agora**. `TaskContext` = arquivos deste Run, `untrusted_content`.

Existe sem persistência. Some com o Run. Não é Session. Não é Memory. Não emite Permit.

---

## 13. Memory

Stage 22: informação **retida de propósito**. Não implementada.

Não pertence automaticamente ao User, à Identity, à Session, ao J.A.R.V.I.S. nem ao Context. Quando existir, o escopo tem de ser nomeado (usuário, projeto, …). Preferência armazenada **não** é autorização.

---

## 14. Lifecycle

Estados com significado operacional **hoje**. Não inventar pause/expire sem mecanismo.

### Run

| Fase | Existe? |
|---|---|
| Criação | `randomUUID` + `createCoreRun` + `recorder.start` |
| Atividade | Attempts e passos do roteiro |
| Pausa | Não |
| Cancelamento | `cancelled` (`refused` ou `ExperimentCancelledError`) |
| Conclusão | `completed` / `completed_with_reservations` |
| Falha | `failed` / `rejected` |
| Unknown | `unknown` (Run inteiro para) |
| Encerramento | `recorder.finish`; processo pode sair |
| Retomada | Não |
| Expiração | Não |
| Persistência | Auditoria SQLite, não objeto vivo |

### Attempt

Criada em `attempt()`, termina em `denied` / `refused` / `failed` / `executed` / `unknown`. Sem pausa, sem retomada, sem migrar de Run. Permit consumido ou nunca emitido.

### Interaction

Começa e acaba na chamada do porto. Sem ciclo próprio.

### Session

Não há ciclo. O processo não é Session.

### Distinções

| Termo | Significado |
|---|---|
| cancel | Humano recusou ou abortou o roteiro. Efeitos já feitos ficam |
| fail | Falha conhecida antes ou sem efeito incerto |
| complete | Roteiro encerrou com artefato (com ou sem reservas) |
| unknown | Efeito possível; não tratar como complete nem fail |
| expire | Não usado. Não fingir TTL de Session |
| close | Fechar readline/SQLite no `finally`. Não é status de Run |

---

## 15. Session × Run

| Modelo | Cabe? |
|---|---|
| A — Session contém Run | Visão futura de conversa. **Não** é o código |
| B — Run contém Session | Inverte as camadas. Rejeitado |
| C — Session ↔ Run bidirecional no core | O core não deve conhecer Session |
| **D — Run independente; Session é interação externa** | **Corresponde ao código e à fronteira do core** |

Quando houver CLI persistente, chat ou residência nível 1+, Session pode **agrupar** Runs do lado de fora. O core continua recebendo um `runId` e Attempts. Session não emite Permit.

---

## 16. Identity × Memory

Memória futura deve ter escopo explícito. Default razoável para preferência pessoal: User/Identity, não Session (sessão acaba) e não o processo J.A.R.V.I.S. (contaminaria todos).

Fato de projeto: escopo de projeto, Stage 22.

```text
Memory: "usuário normalmente aprova criação de arquivos"
         ↛  Permit
         ↛  confirm() = true
```

Policy pode *ler* fatos de identidade como contexto da decisão (ex.: allowlist desta pessoa). Identity ainda não chama `issuePermit`.

---

## 17. Multi-user

Não implementar. Invariantes para quando existir mais de um titular:

- Context e Memory de A não entram no Run de B.
- History de A não vira Context de B.
- `confirm()` tem de ser do Actor autorizado **nesta** Attempt, não “alguém no mesmo servidor”.
- Permit já é `runId`+`attemptId`; isso não basta sozinho se dois Users compartilharem um Run. Um Run não deve ser compartilhado entre Users.
- Isolation atual = um processo. Isso não escala; não fingir que escala.

---

## 18. Resident J.A.R.V.I.S.

`JARVIS_CONTEXT.md` §17: residente = disponibilidade, não gravação eterna nem acesso irrestrito.

| Modo | Significado | Autorização |
|---|---|---|
| reactive | Evento chega, informa | Sem Permit |
| proactive | Sugere | Proposta, não Permit |
| delegated | Mandato prévio | Ainda Attempt nova; mandato ≠ Permit reutilizável |
| continuous | Processo não sai | Processo vivo ≠ Permits vivos |

```text
Rodando continuamente
+ usuário autorizou ontem
+ evento hoje
↛ executar de novo
```

Ontem: Permit consumido, Attempt encerrada. Hoje: nova proposta, nova política, novo `confirm` se a política pedir, novo Permit. Unknown de ontem continua unknown; não retoma a Attempt.

Não criar daemon nesta stage.

---

## 19. Segurança

| Caso | Identidade / Actor / Principal | Permit | O que impede |
|---|---|---|---|
| 1. “Autenticado” sem Permit | Identidade futura irrelevante | Não há | Capability exige `claimPermit` |
| 2. Run usa Permit de outro Run | — | `sameClaim` falha | `runId` no claim |
| 3. Actor usa Attempt de outro | Sem Actor id | `attemptId` / WeakMap | Objeto Permit não viaja; se viajasse, claim falha |
| 4. History de aprovação passada | User implícito | Não revive | Recorder não é `confirm` |
| 5. Memory de hábito | — | Não | Stages 21–22 |
| 6. Session retomada depois de muito tempo | Canal antigo | Permits daquela época mortos | WeakMap + uso único + política nova |
| 7. Processo reinicia no meio do Run | — | WeakMap vazio | Não há resume. SQLite é evidência. Efeito no mundo pode ser `unknown` |
| 8. Retomar Run após `unknown` | — | Não há Permit velho | Investigar é **outra** Attempt. Não retry automático |
| 9. Duas Sessions, Context parecido | Isolar por Session/User | — | Contexto não é chave de Permit |
| 10. Sistema externo em nome do User | Actor=integração, Principal=User | Só se houver Attempt+política+confirm do modelo escolhido | Sem Principal implementado, esse caminho **não existe** — e não deve existir por atalho |

---

## 20. Observabilidade

`RunRecorder` chaveia por `runId`. Eventos de attempt já levam `attemptId`.

Agora: `runId` (+ `attemptId` no payload) **é suficiente**.

Não adicionar `sessionId` / `identityId` / `actorId` / `principalId`. Não há esses objetos. Gravar identidade sem modelo é PII prematura.

Quando Session existir fora do core, a auditoria *dessa* camada pode correlacionar. O core não precisa.

---

## 21. Core Boundary

**Core já conhece e deve continuar conhecendo:** Run (`CoreRun`, `runId`), Attempt, `ActionProposal`, `PolicyDecision`, Permit, `AttemptOutcome`, `RunStatus`.

**Vocabulário do ciclo, não kernel de autoridade:** `Goal`, `Clarification`, porto `CycleInteraction`.

**Fora do Core:** User DB, auth, filesystem, Anthropic, MCP, browser, Session storage, Memory DB, UI, CLI, accounts.

**Identity e Session:** camada **superior/externa**, quando houver mais do que um humano implícito num processo. O Core **não** deve conhecê-las agora. Conhecê-las depois só como rótulos opacos de correlação, nunca como emissores de Permit.

Quem cria Permit: somente `CoreRun.issuePermit`, após política e `confirm` desta Attempt.

---

## 22. Invariantes

Validados:

1. Identity não concede autoridade.
2. Session não concede autoridade.
3. History não concede autoridade.
4. Memory não concede autoridade.
5. Context não concede autoridade.
6. Preference não concede autoridade.
7. Permit pertence a um Attempt específico.
8. Permit pertence a um Run específico.
9. Permit não atravessa Run.
10. Permit não atravessa Attempt.
11. Retomar Session não revive Permit.
12. Retomar Run não revive Permit. (Hoje nem há retomada.)
13. Actor diferente não reutiliza autorização de outro Actor.
14. Resident não implica autorização contínua.
15. History não é automaticamente Memory.
16. Memory não é automaticamente Context.
17. Context não é automaticamente Memory.
18. Session não é Run.
19. Interaction não é Attempt.
20. Identity não é User automaticamente. (Conta, processo, API `role: user` e pessoa não coincidem.)

Nenhum rejeitado. O 13 hoje é garantido pelo objeto Permit + claim, não por um `actorId`.

---

## 23. Adversarial Cases

Cobertos na §19. Acrescentar: não tratar o `session` do runner como Session; não tratar `PermitState.identity` como pessoa. Esses dois nomes, se um implementador os “promover”, furam o modelo sem escrever auth.

---

## 24. Open Questions

- Quando o CLI ficar residente, Session é o processo, o canal readline, ou um id persistido?
- `confirm()` remoto (integração): quem é o Actor e como a política exige presença do User.
- Nível 5 (delegado): mandato de longo prazo vs Permit de uso único — o mandato gera **novas** Attempts, nunca reabre Permits.
- Isolamento multi-user: processo vs campo opaco no Run vs camada externa.
- Restart no meio de `create_artifact` `unknown`: só evidência no SQLite; quem observa o disco é outra Attempt.

Nenhuma autoriza tipo agora.

---

## 25. Recomendação arquitetural

**Não materializar** Identity, User, Actor, Principal, Session nem Lifecycle engine.

O que o sistema precisa **agora**: Run, Attempt, Permit, Interaction como porto, History como auditoria. User/Identity/Session são implícitos no processo.

O que a visão precisa **depois**: Session fora do core (Modelo D); Identity como escopo de Memory/Context; Principal só se Actor ≠ User.

Melhora desta stage: o mapa. Não o código.

Correções de vocabulário para implementadores: `session` no runner = Run; `identity` no Permit = claim.

---

## 26. Classificação da Stage

**B — aprovado com riscos.**

O modelo é coerente com o runtime e com as Stages 18C–23. Identity/Session não entram no Core. Resident ≠ autorização contínua. Não há lacuna que exija UserManager para o experimento atual.

Não é A: a visão residente/multi-user ainda não tem forma de Session, e os nomes `session`/`identity` no código são armadilhas.

---

## 27. Riscos

| Risco | Classe | Nota |
|---|---|---|
| Promover `session` do runner a Session entity | R2 | Nome local. Documentado |
| Promover `PermitState.identity` a pessoa | R2 | É PermitClaim |
| Session/Identity no Core agora | R1 se só tipos; **R4** se emitirem Permit | Não implementar |
| Auth/login/user DB para o experimento | R1 | Sem segundo usuário |
| Usar SQLite como resume de Run/Permit | R2 | ADR-007 + WeakMap |
| Resident daemon com mandato = Permit eterno | **R4** se alguém fizer | Mandato ≠ Permit |
| sessionId no recorder agora | R1 | Sem Session |
| Multi-user sem isolamento de Run | R2 conceitual; R4 se dois Users um Permit | Um Run por titular |

Sem R3/R4 **ativos** no código atual. Haveria R4 se Session ou Identity passassem a emitir Permit, ou se residência reutilizasse autorização de ontem.
