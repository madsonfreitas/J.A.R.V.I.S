# J.A.R.V.I.S. â€” Memory and Context Runtime Model

**Stage:** 22
**Natureza:** especificaÃ§Ã£o. Nenhum armazenamento, manager ou runtime de memÃ³ria foi implementado.
**Base:** cÃ³digo em `src/cycle`, `src/documentary`, `src/observability`; Stages 18Câ€“21; `ADR-007`; `JARVIS_MEMORY_MODEL.md`; `JARVIS_CONTEXT_INTERACTION_MODEL.md`.

O cÃ³digo nÃ£o tem memÃ³ria. Tem contexto de tarefa (`TaskContext`), esclarecimentos do Run, e um registro SQLite de auditoria (`RunRecorder`). Esses trÃªs nÃ£o sÃ£o memÃ³ria.

Esta stage define o que memÃ³ria seria no runtime, sem criar o runtime.

---

## 1. Definition

| Termo | Conceito real? | Significado |
|---|---|---|
| Memory | Sim | InformaÃ§Ã£o retida de propÃ³sito para possÃ­vel uso futuro, fora da decisÃ£o atual |
| Memory Candidate | Sim | InformaÃ§Ã£o observada que alguÃ©m pode reter. Ainda nÃ£o Ã© memÃ³ria |
| Retained Memory | Sim | Candidata aceita para retenÃ§Ã£o. Ã‰ memÃ³ria |
| Memory Source | VocabulÃ¡rio | De onde veio: usuÃ¡rio, resultado, inferÃªncia, outra memÃ³ria |
| Memory Scope | Sim | Limite em que a retenÃ§Ã£o vale: este projeto, este usuÃ¡rio, esta entidade |
| Memory Provenance | Sim | Origem, momento e se foi dito, inferido ou confirmado |
| Memory Validity | Sim | Se ainda pode ser usada como informaÃ§Ã£o atual |
| Memory Relevance | VocabulÃ¡rio | Se entra no contexto desta decisÃ£o. NÃ£o Ã© um score |
| Memory Lifecycle | VocabulÃ¡rio | Observed â†’ Candidate â†’ Retained â†’ Used / Updated / Invalidated / Deleted |
| Memory Update | Sim | SubstituiÃ§Ã£o ou ajuste da retenÃ§Ã£o, sem ser Permit |
| Memory Correction | Sim | O usuÃ¡rio ou uma evidÃªncia nova desmente o que estava retido |
| Memory Deletion | Sim | Impede uso futuro. NÃ£o Ã© o mesmo que invalidar nem que expirar |

NÃ£o criar classes para esses termos. O menor objeto futuro, se um dia existir, Ã© um item retido com texto, escopo, proveniÃªncia e validade. NÃ£o Ã© um engine.

---

## 2. Memory vs Context

O cÃ³digo jÃ¡ mostra a diferenÃ§a, mesmo sem memÃ³ria.

`TaskContext` Ã© o pacote de arquivos lidos **neste** Run, montado depois das Attempts `read_source`, usado sÃ³ em `createDraft`. Some com o Run.

`Clarification` Ã© pergunta e resposta **neste** Run. NÃ£o atravessa para o prÃ³ximo.

`RunRecorder` grava intenÃ§Ã£o, status e eventos. ADR-007 proÃ­be usÃ¡-lo como contexto automÃ¡tico de novas tarefas.

```text
Context = o que esta decisÃ£o/interaÃ§Ã£o estÃ¡ usando agora
Memory  = o que foi retido de propÃ³sito para um uso futuro
```

RelaÃ§Ã£o suficiente, sem terceira camada:

```text
Memory
  â†’ seleÃ§Ã£o relevante (nÃ£o automÃ¡tica, nÃ£o total)
  â†’ Context
  â†’ compreensÃ£o / ActionProposal
  â†’ PolicyDecision / Approval / Permit
```

```text
Memory â†› Authority
Memory â†› Permit
Context â†› Authority
```

O Run, o Permit e o `AttemptOutcome` jÃ¡ sÃ£o estado operacional. NÃ£o sÃ£o memÃ³ria e nÃ£o precisam de um `ContextManager` no meio.

`JARVIS_MEMORY_MODEL.md` jÃ¡ dizia que contexto Ã© composiÃ§Ã£o temporÃ¡ria, nÃ£o um depÃ³sito. Esta stage confirma isso no runtime real: nÃ£o hÃ¡ store de contexto; hÃ¡ um valor montado para uma chamada.

---

## 3. Memory Candidate

Aparecer nÃ£o Ã© reter.

A intenÃ§Ã£o do usuÃ¡rio entra no recorder. Os arquivos lidos viram `TaskContext`. O draft vira artefato se houver Permit. Nenhum desses passos cria memÃ³ria.

Candidata Ã© um julgamento posterior: esta informaÃ§Ã£o tem chance de servir depois **e** alguÃ©m aceita retÃª-la. Sem isso, descarta.

CritÃ©rios que pertencem ao modelo:

- intenÃ§Ã£o explÃ­cita de lembrar;
- estabilidade (nÃ£o Ã© â€œhojeâ€);
- escopo nomeÃ¡vel;
- utilidade futura razoÃ¡vel;
- sensibilidade (pode vetar);
- validade previsÃ­vel.

CritÃ©rios que nÃ£o viram mecanismo agora: score, custo de retenÃ§Ã£o, ranking semÃ¢ntico.

---

## 4. Retention Criteria

O que merece ser memorizado, no sentido deste runtime:

| Exemplo | MemÃ³ria? | Contexto? | Outra forma | Proibido? | Escopo | Validade |
|---|---|---|---|---|---|---|
| â€œPrefiro respostas diretas.â€ | Candidata, se explÃ­cito | Pode entrar depois | â€” | NÃ£o | UsuÃ¡rio | AtÃ© correÃ§Ã£o |
| â€œNeste projeto usamos X.â€ | Candidata, se explÃ­cito ou decisÃ£o confirmada | Sim, quando o projeto for o atual | â€” | NÃ£o | Projeto | AtÃ© substituiÃ§Ã£o |
| â€œO projeto usa determinado serviÃ§o.â€ | Candidata de fato, sujeita a ficar stale | Sim, se selecionada | â€” | NÃ£o | Projeto / entidade | Revalidar quando material |
| â€œPrecisamos revisar Y.â€ | NÃ£o como memÃ³ria genÃ©rica | Pode ser item da tarefa | Estado de tarefa, se um dia existir | NÃ£o | Tarefa | Curta |
| â€œEste arquivo pertence ao projeto.â€ | RelaÃ§Ã£o, sÃ³ com escopo | Sim, no projeto certo | â€” | NÃ£o | Projeto | AtÃ© correÃ§Ã£o |
| â€œHÃ¡ duas semanas fizemos X.â€ | NÃ£o | Pode citar o Run | Auditoria (`RunRecorder`) | NÃ£o reusar como fato atual sem olhar o Run | Run / evidÃªncia | O evento nÃ£o expira; a conclusÃ£o sim |
| â€œHoje estou trabalhando nisto.â€ | NÃ£o | Sim, da sessÃ£o | â€” | NÃ£o reter como permanente | SessÃ£o | Termina com a sessÃ£o |
| Senha, token, chave | NÃ£o | NÃ£o no prompt por padrÃ£o | Mecanismo especializado futuro, se algum dia existir | Sim, como memÃ³ria comum | â€” | â€” |

HistÃ³rico de execuÃ§Ã£o jÃ¡ existe como auditoria. Auditoria â‰  memÃ³ria. ADR-007 jÃ¡ separa os dois.

---

## 5. Explicit vs Inferred Memory

| Estado | Significado | Uso |
|---|---|---|
| ExplÃ­cita | O usuÃ¡rio pediu para lembrar ou afirmou como preferÃªncia/decisÃ£o | Pode ser retida |
| Inferida | O sistema observou um padrÃ£o | NÃ£o Ã© fato. No mÃ¡ximo candidata nÃ£o confirmada |
| Confirmada | ExplÃ­cita, ou inferÃªncia que o usuÃ¡rio aceitou | Pode alimentar contexto |
| NÃ£o confirmada | Inferida ou observada | NÃ£o dirige proposta como se fosse preferÃªncia |

NÃ£o hÃ¡ score.

â€œNas Ãºltimas 10 vezes escolheu PDFâ€ nÃ£o vira â€œusuÃ¡rio prefere PDFâ€. O cÃ³digo atual nem conta escolhas. Se um dia contar, isso Ã© evidÃªncia, nÃ£o memÃ³ria confirmada.

---

## 6. Provenance

Toda retenÃ§Ã£o futura deve poder dizer:

- quem ou o quÃª originou;
- quando;
- em qual Run / conversa / projeto;
- se o usuÃ¡rio informou, se foi inferido, se foi confirmado;
- se deriva de outro item.

Sem proveniÃªncia, o item nÃ£o entra em contexto de decisÃ£o consequencial.

O `RunRecorder` jÃ¡ guarda `runId`, tipo de evento e payload. Isso Ã© evidÃªncia de execuÃ§Ã£o, nÃ£o proveniÃªncia de memÃ³ria. NÃ£o reutilizar a tabela `events` como store de memÃ³ria.

---

## 7. Temporal Validity

MemÃ³ria pode ser verdadeira hoje e falsa amanhÃ£.

| Conceito | Significado |
|---|---|
| Validade | CondiÃ§Ã£o em que o item ainda pode ser usado como atual |
| ExpiraÃ§Ã£o | A condiÃ§Ã£o acabou (â€œhojeâ€, â€œneste sprintâ€) |
| Stale | Ainda retido, mas possivelmente desatualizado |
| SubstituiÃ§Ã£o | Um item novo passa a ser o atual no mesmo escopo e assunto |
| Conflito | Dois itens atuais discordam; nenhum some sozinho |

NÃ£o hÃ¡ TTL automÃ¡tico. â€œHoje estou em Zâ€ Ã© contexto de sessÃ£o, nÃ£o memÃ³ria com relÃ³gio.

Fato de projeto e preferÃªncia de usuÃ¡rio envelhecem de jeitos diferentes. O modelo registra isso. NÃ£o escolhe um prazo Ãºnico.

---

## 8. Conflict

```text
A: "Prefiro PDF."
B: "Agora prefiro Markdown."
```

B, se explÃ­cito e mais novo no mesmo escopo, Ã© correÃ§Ã£o/substituiÃ§Ã£o. A deixa de ser atual. A pode permanecer como histÃ³rico do item, nÃ£o como preferÃªncia ativa.

```text
A: "Projeto usa API X."
B: "Projeto migrou para API Y."
```

Mesmo padrÃ£o, no escopo do projeto. Se A e B tiverem a mesma atualidade e fontes diferentes, o estado Ã© conflito: perguntar. NÃ£o resolver em silÃªncio.

O runtime nÃ£o implementa resoluÃ§Ã£o. InferÃªncia nÃ£o apaga item explÃ­cito.

---

## 9. Scope and Isolation

Escopos que o modelo precisa reconhecer, mesmo sem objetos no cÃ³digo:

| Escopo | Existe hoje? | Risco se misturar |
|---|---|---|
| Run / tarefa | Sim (`runId`, `TaskContext`) | Arquivos de um Run no outro |
| SessÃ£o / conversa | NÃ£o | Assunto antigo como se fosse o atual |
| Projeto | NÃ£o | Banco X do projeto A no projeto B |
| UsuÃ¡rio | NÃ£o | PreferÃªncia de um usuÃ¡rio em outro |
| Entidade | NÃ£o | Produto X tratado como Y |
| DomÃ­nio | Documental vs core jÃ¡ separados | `TaskContext` virar contexto universal |
| Global | NÃ£o deve existir como saco Ãºnico | ContaminaÃ§Ã£o total |

NÃ£o criar todos como tabelas. O invariante Ã©: item sem escopo nÃ£o entra. Item do projeto A nÃ£o entra no projeto B.

Isso Ã© o mesmo isolamento da Stage 20, estendido no tempo. Contexto jÃ¡ nÃ£o atravessa Runs. MemÃ³ria, se existir, atravessa sÃ³ dentro do escopo em que foi retida, e sÃ³ depois de seleÃ§Ã£o.

---

## 10. Memory Lifecycle

Menor ciclo suficiente:

```text
Observed          (nÃ£o Ã© memÃ³ria)
    â†“
Candidate         (ainda nÃ£o Ã© memÃ³ria)
    â†“
Retained          (explÃ­cita ou confirmada)
    â†“
Selected into Context  (uso)
    â†“
Updated | Invalidated | Deleted
```

Estados rejeitados como mÃ¡quina agora: accepted separado de retained; used como estado persistido; scoring; esquecimento automÃ¡tico.

Observed cobre a conversa, o arquivo lido, o evento do recorder. Candidate Ã© o julgamento de retenÃ§Ã£o. Retained Ã© o Ãºnico estado que pode ser selecionado para um contexto futuro.

---

## 11. Correction

```text
Retained
  â†’ o usuÃ¡rio diz "isso mudou"
  â†’ o item deixa de ser atual
  â†’ um item novo, com proveniÃªncia da correÃ§Ã£o, passa a ser o atual
```

CorreÃ§Ã£o â‰  conflito (conflito ainda nÃ£o escolheu).
CorreÃ§Ã£o â‰  remoÃ§Ã£o (o histÃ³rico da correÃ§Ã£o pode permanecer).
CorreÃ§Ã£o â‰  expiraÃ§Ã£o (expirou por tempo/condiÃ§Ã£o, nÃ£o por desmentido).

Corrigir memÃ³ria nÃ£o altera Attempts passadas, Permits passados nem artefatos jÃ¡ gravados. O Run antigo continua sendo o que foi.

---

## 12. Removal / Forgetting

| OperaÃ§Ã£o | Efeito |
|---|---|
| Invalidar | NÃ£o usar como atual. Pode permanecer visÃ­vel como invÃ¡lida |
| Expirar | A validade acabou. Revalidar se for material |
| Corrigir | Substitui o atual |
| Remover / esquecer | Impede uso futuro no escopo pedido |

NÃ£o sÃ£o a mesma coisa.

Remover uma memÃ³ria derivada nÃ£o apaga a fonte. Remover a fonte nÃ£o apaga em silÃªncio todas as derivadas: as derivadas ficam invÃ¡lidas ou em conflito atÃ© alguÃ©m decidir. NÃ£o hÃ¡ cascade engine.

Pedido de esquecer Ã© sobre memÃ³ria. NÃ£o apaga auditoria do `RunRecorder` salvo regra explÃ­cita de evidÃªncia, que esta stage nÃ£o cria.

---

## 13. Secrets

Tudo que Ã© Ãºtil nÃ£o Ã© memorizÃ¡vel.

Senhas, tokens, API keys, chaves privadas: **proibidos** como memÃ³ria comum e como `TaskContext` enviado a terceiro, salvo uma Attempt explÃ­cita cujo efeito Ã© exatamente esse envio.

Dados pessoais e financeiros: fora da memÃ³ria comum atÃ© existir tratamento especial. NÃ£o criar vault agora.

A chave Anthropic hoje vive no ambiente do processo, nÃ£o em memÃ³ria do J.A.R.V.I.S. e nÃ£o em contexto. Esse padrÃ£o deve continuar: credencial de tool â‰  memÃ³ria.

---

## 14. Memory vs Authority

```text
Memory â†’ pode influenciar compreensÃ£o
Memory â†’ pode influenciar ActionProposal (formato, recurso, parÃ¢metros)
Memory â†’ pode alimentar Context, se selecionada
Memory â†’ nÃ£o cria PolicyDecision
Memory â†’ nÃ£o cria Approval
Memory â†’ nÃ£o cria Permit
Memory â†’ nÃ£o executa
```

| Caso | Comportamento |
|---|---|
| â€œUsuÃ¡rio costuma aprovar emails.â€ | NÃ£o preenche `confirm`. NÃ£o Ã© Permit |
| â€œUsuÃ¡rio autorizou o arquivo X antes.â€ | NÃ£o autoriza leitura ou envio agora. Nova Attempt |
| â€œUsuÃ¡rio sempre permite relatÃ³rios.â€ | `create_artifact` continua `require_approval` |
| MemÃ³ria contÃ©m credencial | NÃ£o usa. NÃ£o envia. NÃ£o autentica a tool |

O hÃ¡bito de aprovar Ã© exatamente o que a Stage 21 jÃ¡ proibiu. Esta stage sÃ³ afirma a mesma fronteira com retenÃ§Ã£o no tempo.

---

## 15. Memory vs Capabilities

Stage 21: capability â‰  tool â‰  authority.

MemÃ³ria pode sugerir formato (â€œPDFâ€), ferramenta habitual ou parÃ¢metros da proposta. O roteiro ainda monta a `ActionProposal`. A polÃ­tica ainda decide. A tool ainda sÃ³ corre com Permit.

Exemplo vÃ¡lido:

```text
Memory: "RelatÃ³rios deste projeto costumam ser em PDF."
Context: "Estamos gerando o relatÃ³rio do projeto X."
ActionProposal: criar relatÃ³rio em PDF
PolicyDecision / Approval / Permit: inalterados na regra
```

Exemplo invÃ¡lido: memÃ³ria escolhe a tool e chama `claimPermit`.

---

## 16. Memory vs Results

```text
Action â†’ Execution â†’ Effect â†’ Observation â†’ Validation â†’ Result
                                                         â†“
                                              Memory Candidate?
```

Nem todo resultado vira candidata.

| Resultado | Candidata? |
|---|---|
| `denied` / `refused` | NÃ£o como â€œusuÃ¡rio nÃ£o quer isso para sempreâ€ |
| `failed` antes do efeito | NÃ£o como fato do mundo |
| `unknown` | NÃ£o. Incerteza nÃ£o vira fato |
| `executed` sem validaÃ§Ã£o | No mÃ¡ximo evidÃªncia de que a funÃ§Ã£o retornou |
| ValidaÃ§Ã£o invÃ¡lida | NÃ£o como artefato correto |
| ValidaÃ§Ã£o vÃ¡lida + efeito persistente | Pode ser candidata de fato (â€œfoi criado este arquivoâ€), com proveniÃªncia do `attemptId` |

O `ExperimentResult` e os `CapabilityEffect` atuais sÃ£o do Run. NÃ£o sÃ£o retenÃ§Ã£o.

---

## 17. Memory vs Learning

Memory: um item retido (â€œprefere Xâ€).
Learning: o sistema muda o comportamento a partir de muitos itens, sem um pedido explÃ­cito.

Aprendizado automÃ¡tico estÃ¡ fora. Feedback no recorder nÃ£o ajusta polÃ­tica. PreferÃªncia retida, se um dia existir, ainda passa pela proposta e pela autoridade atuais.

---

## 18. Proactivity

No futuro:

```text
Memory â†’ relevÃ¢ncia â†’ sugerir / lembrar / propor
```

Ã© concebÃ­vel.

```text
Memory â†’ proatividade â†’ efeito externo
```

nÃ£o Ã©. Efeito externo continua sendo Attempt com Permit.

Proatividade sem autoridade Ã© sÃ³ atualizaÃ§Ã£o de contexto ou uma proposta ainda nÃ£o autorizada.

---

## 19. Observability

NÃ£o criar logging novo.

Quando memÃ³ria existir, a evidÃªncia conceitual necessÃ¡ria Ã©:

- qual item foi selecionado para o contexto;
- proveniÃªncia;
- por que foi considerado relevante (regra simples, nÃ£o score);
- se estava vÃ¡lido;
- se estava em conflito ou invÃ¡lido;
- se influenciou a proposta (texto/recurso/formato), nÃ£o a decisÃ£o de autoridade.

O `RunRecorder` atual registra o Run, nÃ£o memÃ³ria. NÃ£o misturar as tabelas.

---

## 20. Adversarial Cases

| Caso | Comportamento esperado |
|---|---|
| 1. UsuÃ¡rio diz algo uma vez | Observed. NÃ£o retido |
| 2. Pede para lembrar | Candidata explÃ­cita. Pode ser retained no escopo dito |
| 3. Sistema infere preferÃªncia | NÃ£o confirmada. NÃ£o dirige proposta como fato |
| 4. InferÃªncia errada | CorreÃ§Ã£o. Item inferido nÃ£o sobrevive ao desmentido |
| 5. MemÃ³ria antiga contradiz informaÃ§Ã£o nova | Conflito ou substituiÃ§Ã£o. Nova explÃ­cita ganha como atual |
| 6. MemÃ³ria do projeto A no projeto B | NÃ£o entra |
| 7. MemÃ³ria contÃ©m segredo | NÃ£o retÃ©m como memÃ³ria comum. NÃ£o envia |
| 8. â€œFoi autorizado antesâ€ | NÃ£o emite Permit |
| 9. Influencia ActionProposal | Permitido: recurso, formato, parÃ¢metros. Sem autoridade |
| 10. Tenta influenciar Permit | Recusado pelo modelo. Core nÃ£o lÃª memÃ³ria |
| 11. `unknown` gera memÃ³ria | Recusado. Incerteza permanece incerteza |
| 12. â€œHoje estou em Zâ€ permanece | Recusado. Ã‰ contexto de sessÃ£o |
| 13. UsuÃ¡rio corrige | Item antigo deixa de ser atual |
| 14. Pede para esquecer | RemoÃ§Ã£o de uso futuro da memÃ³ria. Auditoria do Run nÃ£o some sozinha |
| 15. Derivada de outra memÃ³ria | ProveniÃªncia aponta a origem. Remover uma nÃ£o apaga a outra em cascata automÃ¡tica |

---

## 21. What we do not create

| AbstraÃ§Ã£o | NecessÃ¡ria? | Por quÃª |
|---|---|---|
| MemoryManager / MemoryEngine / MemoryService | NÃ£o | NÃ£o hÃ¡ item retido |
| MemoryStore / MemoryRegistry | NÃ£o | Sem segundo caso de retenÃ§Ã£o |
| ContextManager / ContextStore | NÃ£o | `TaskContext` Ã© um valor por Run |
| Vector DB / embeddings / RAG | NÃ£o | NÃ£o hÃ¡ volume nem busca semÃ¢ntica. ADR-007 |
| Knowledge / semantic graph | NÃ£o | Sem relaÃ§Ãµes persistidas |
| Autonomous learning / forgetting / scoring engine | NÃ£o | Violaria inferÃªncia â‰  fato e unknown â‰  fato |
| Global context store | NÃ£o | Contaminaria escopos |

Se um dia houver retenÃ§Ã£o real, o menor mecanismo Ã©: item com escopo, proveniÃªncia, validade e flag explÃ­cito/inferido/confirmado, selecionÃ¡vel para contexto. Isso pode esperar.

---

## 22. Core Boundary

O Core **nÃ£o** precisa conhecer Memory.

O Core jÃ¡ conhece: `ActionProposal`, `PolicyDecision`, `Permit`, Attempt, `AttemptOutcome`.

MemÃ³ria, se existir, fica fora: uma fonte que pode contribuir itens para a compreensÃ£o. A compreensÃ£o monta a proposta. A proposta entra no core. O core nÃ£o pergunta ao store se o usuÃ¡rio â€œcostuma aprovarâ€.

`TaskContext` jÃ¡ estÃ¡ fora do core (documental). MemÃ³ria seguiria o mesmo lado da cerca, ou um lado ainda mais afastado.

`RunRecorder` Ã© observabilidade, nÃ£o memÃ³ria, nÃ£o core.

---

## 23. Proposed Invariants

Validados:

1. MemÃ³ria nÃ£o concede autoridade.
2. MemÃ³ria nÃ£o cria Permit.
3. MemÃ³ria nÃ£o substitui Approval.
4. MemÃ³ria possui origem/proveniÃªncia. Sem isso, nÃ£o entra em decisÃ£o consequencial.
5. MemÃ³ria pode estar desatualizada.
6. MemÃ³ria pode ser corrigida.
7. MemÃ³ria pode ser invalidada/removida. SÃ£o operaÃ§Ãµes distintas.
8. MemÃ³ria de um escopo nÃ£o contamina outro.
9. InformaÃ§Ã£o observada nÃ£o Ã© automaticamente memÃ³ria.
10. InferÃªncia nÃ£o Ã© automaticamente fato confirmado.
11. MemÃ³ria relevante pode alimentar Context, por seleÃ§Ã£o.
12. Context continua distinto de Memory.
13. Nem todo resultado gera memÃ³ria.
14. `unknown` nÃ£o Ã© fato confirmado.
15. MemÃ³ria nÃ£o esconde incerteza.
16. MemÃ³ria nÃ£o substitui validaÃ§Ã£o atual.
17. Segredos nÃ£o sÃ£o memÃ³ria comum.
18. MemÃ³ria nÃ£o executa aÃ§Ãµes.
19. MemÃ³ria nÃ£o altera polÃ­tica por conta prÃ³pria.
20. Adicionar memÃ³ria nÃ£o exige alterar o modelo de autoridade das Stages 18C/19.

Nenhum rejeitado. O item 4 vale para memÃ³ria **usada** em decisÃ£o; rascunho interno sem proveniÃªncia simplesmente nÃ£o deve ser usado.

---

## 24. Open Questions

- Quando o usuÃ¡rio diz â€œlembre distoâ€, qual Ã© o escopo default se ele nÃ£o nomear projeto.
- Tarefa pendente Ã© memÃ³ria, contexto, ou um tipo futuro de estado de trabalho.
- Auditoria pode ser citada em contexto sem virar memÃ³ria.
- CorreÃ§Ã£o em um projeto deve aparecer como conflito noutro se a mesma entidade existir nos dois.

Nenhuma autoriza implementaÃ§Ã£o agora.

---

## 25. Implementation Boundary

Nada desta stage vira cÃ³digo.

NÃ£o criar store, embeddings, RAG, manager nem testes de memÃ³ria.

O experimento continua sob ADR-007: contexto temporÃ¡rio da tarefa, estado do Run, registro de evidÃªncia. O registro nÃ£o personaliza o prÃ³ximo Run.

A correÃ§Ã£o de `DocumentaryActionKind` da Stage 21 Ã© independente desta spec.

---

## 26. Architectural Risks

| Risco | Classe | Nota |
|---|---|---|
| Usar `RunRecorder` como memÃ³ria | R2 | ADR-007 jÃ¡ proÃ­be. Limite claro |
| InferÃªncia virar preferÃªncia | R2 | Modelo exige confirmaÃ§Ã£o |
| Segredo na conversa retido | R2 se alguÃ©m retiver; R4 se o sistema o reutilizar como autoridade/credencial | Proibido como memÃ³ria comum |
| MemÃ³ria preencher `confirm` | R4 se implementado | O cÃ³digo atual nÃ£o lÃª memÃ³ria |
| ContaminaÃ§Ã£o de escopo | R2 conceitual; R4 se um store global for criado | NÃ£o criar store |
| Vector DB / RAG agora | R1 | Sem evidÃªncia no cÃ³digo |
| MemoryManager agora | R1 | Sem item retido |
| Tratar `unknown` como fato memorizado | R4 se implementado | Stage 19 jÃ¡ barra |

No estado atual do cÃ³digo nÃ£o hÃ¡ R3 nem R4 ativos: nÃ£o existe retenÃ§Ã£o.

---

## 27. Stage Classification

**B â€” aprovado com riscos.**

O modelo Ã© coerente com o runtime real e com as Stages 18Câ€“21. MemÃ³ria fica fora do core, entra sÃ³ como possÃ­vel fonte de contexto, e nÃ£o toca Permit.

Riscos: R1 (store/RAG futuros) e R2 (recorder, inferÃªncia, escopo, segredo como dado). Sem R3/R4 no estado atual.

NÃ£o implementar memÃ³ria com base neste documento.
