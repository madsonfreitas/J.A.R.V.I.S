# J.A.R.V.I.S. â€” Capability and Tool Model

**Stage:** 21
**Natureza:** especificaÃ§Ã£o. Nenhum cÃ³digo, teste ou contrato foi alterado.
**Base:** `src/cycle`, `src/documentary`, `src/intelligence`, Stages 18C, 19 e 20.

O cÃ³digo atual nÃ£o tem um sistema de tools. Tem quatro nomes de aÃ§Ã£o no experimento documental, duas implementaÃ§Ãµes concretas (`FileCapabilities` e `AnthropicIntelligence`) e um campo `ActionProposal.capability` que Ã© uma string.

Esta stage descreve o que esses nomes jÃ¡ significam e o que nÃ£o devem virar.

---

## 1. Definition

O que o cÃ³digo jÃ¡ usa, e o que Ã© sÃ³ vocabulÃ¡rio.

| Conceito | JÃ¡ existe no cÃ³digo? | NecessÃ¡rio no modelo |
|---|---|---|
| Capability | SÃ³ como string em `ActionProposal.capability` | Sim, como vocabulÃ¡rio: o tipo de coisa que o sistema pode tentar |
| Tool | NÃ£o. HÃ¡ classes concretas | Sim, como vocabulÃ¡rio: o mecanismo que realiza a aÃ§Ã£o |
| Action | NÃ£o como tipo. HÃ¡ a Attempt | Sim: a tentativa concreta sobre um recurso |
| ActionProposal | Sim, no core | Sim |
| Execution | Sim: `execute(permit)` | Sim |
| Effect | Parcial: retorno opaco ou `CapabilityEffect` documental | Sim, no sentido da Stage 19 |
| Observation | NÃ£o como tipo | VocabulÃ¡rio da Stage 19. NÃ£o precisa de tipo agora |
| Result | `AttemptOutcome` e `ExperimentResult` | Sim, mas sÃ£o dois resultados diferentes |

NÃ£o criar classes para Capability, Tool ou Observation. A Attempt jÃ¡ liga proposta, decisÃ£o, Permit e execuÃ§Ã£o.

---

## 2. Capability

Capability Ã© o tipo de trabalho, nÃ£o a ferramenta e nÃ£o a permissÃ£o.

No Experimento 01 as capabilities nomeadas sÃ£o:

- `read_source`
- `send_intention_to_model`
- `send_sources_to_model`
- `create_artifact`

`inspect` usa filesystem e nÃ£o tem esse nome. NÃ£o passa por Permit. Isso Ã© uma operaÃ§Ã£o de preparaÃ§Ã£o do experimento, nÃ£o uma capability do core.

Capability nÃ£o Ã© um registro. NÃ£o Ã© um plugin. NÃ£o Ã© um enum do core. O core sÃ³ vÃª a string da proposta e a compara, no Permit, com a string reivindicada na execuÃ§Ã£o.

Uma capability pode existir sem ferramenta externa: montar o `TaskContext` a partir de leituras jÃ¡ feitas nÃ£o chama API. Pode existir com uma ferramenta: `readFile`. Pode, no futuro, ter mais de uma ferramenta para o mesmo tipo de trabalho. O core nÃ£o escolhe a ferramenta.

---

## 3. Tool

Tool Ã© o mecanismo concreto. No cÃ³digo:

- filesystem Node (`open`, `readFile`, `writeFile`, `stat`) atrÃ¡s de `FileCapabilities`;
- cliente Anthropic (`messages.create`) atrÃ¡s de `AnthropicIntelligence`.

A Tool nÃ£o Ã© a capability. A capability `create_artifact` Ã© realizada pelo filesystem. A capability `send_sources_to_model` Ã© realizada pelo SDK.

A Tool tem entrada, saÃ­da, efeitos, erros e, Ã s vezes, autenticaÃ§Ã£o. O core nÃ£o conhece nenhum desses detalhes. A Tool nÃ£o avalia polÃ­tica. Ela sÃ³ recusa executar sem um Permit que bata com a Attempt.

Pergunta da stage: a Tool Ã© uma capability concreta ou um mecanismo? No cÃ³digo, Ã© um mecanismo. `FileCapabilities` nÃ£o Ã© "a capability de arquivo". Ã‰ o adaptador que lÃª e grava quando o Permit diz `read_source` ou `create_artifact`.

---

## 4. Action

Action Ã© a Attempt sobre um recurso e um destino: ler este arquivo, enviar estas fontes, criar este Markdown.

NÃ£o Ã© necessÃ¡rio um tipo `Action` ao lado de `ActionProposal` e Attempt. A proposta descreve a aÃ§Ã£o. A Attempt Ã© a ocorrÃªncia autorizada dessa proposta. Criar `Action` agora duplicaria os dois.

---

## 5. ActionProposal

JÃ¡ existe:

```text
capability: string
resource: string
destination: string | null
effect: string
reversible: boolean
```

Ã‰ o pedido. Ainda nÃ£o Ã© decisÃ£o. Ainda nÃ£o Ã© Permit. Ainda nÃ£o Ã© execuÃ§Ã£o.

O campo `capability` nomeia o tipo de trabalho. `resource` e `destination` particularizam a aÃ§Ã£o. `effect` Ã© texto para o humano. `reversible` existe e o core nÃ£o o usa.

A polÃ­tica documental lÃª esses campos. O core sÃ³ os carrega atÃ© o Permit.

---

## 6. Execution

Execution Ã© chamar a funÃ§Ã£o autorizada com o Permit daquela Attempt. Termina quando a funÃ§Ã£o retorna ou lanÃ§a.

`executed` significa que retornou depois de `claimPermit`. NÃ£o significa efeito confirmado.

---

## 7. Effect

Effect Ã© a mudanÃ§a, ou a ausÃªncia dela, fora da funÃ§Ã£o: arquivo no disco, prompt no provedor, bytes lidos.

Execution â‰  Effect. O retorno da funÃ§Ã£o pode mentir, atrasar ou perder a confirmaÃ§Ã£o.

---

## 8. Observation

Observation Ã© a evidÃªncia que o J.A.R.V.I.S. recebeu: body da API, ausÃªncia de exceÃ§Ã£o em `writeFile`, falha de `unlink`.

NÃ£o Ã© um tipo. NÃ£o hÃ¡ observador independente no cÃ³digo. A capability relata. A Stage 19 jÃ¡ disse que isso nÃ£o Ã© validaÃ§Ã£o.

---

## 9. Result

HÃ¡ dois resultados:

- `AttemptOutcome`: denied, refused, failed, executed, unknown;
- Resultado do Run / do experimento: completed, failed, cancelled, unknown, e o `ExperimentResult` documental.

Validation Ã© um terceiro julgamento, no domÃ­nio: o draft tem seÃ§Ãµes e proveniÃªncia. NÃ£o Ã© o Result da Attempt.

```text
Execution â‰  Effect
Effect â‰  Result
Result â‰  Validation
```

Isso se sustenta no cÃ³digo: o envio das fontes pode estar `executed` e o Run ainda `failed` se o draft for invÃ¡lido.

---

## 10. Effect Classification

Ãštil para polÃ­tica e confirmaÃ§Ã£o. NÃ£o vira enum no core.

| Classe | Exemplo atual | PolÃ­tica observada |
|---|---|---|
| Leitura | `read_source` | `allow` se o path estÃ¡ na allowlist |
| GeraÃ§Ã£o interna | montar contexto, validar, renderizar | Sem Permit |
| Efeito persistente | `create_artifact` | `require_approval` |
| ComunicaÃ§Ã£o externa | `send_*_to_model` | `require_approval` |
| IrreversÃ­vel | envio ao modelo | `reversible: false`, sem uso no core |
| Alto impacto / contÃ­nuo | nÃ£o hÃ¡ | nÃ£o classificar agora |

A classificaÃ§Ã£o ajuda a pessoa a escrever polÃ­tica. O core nÃ£o decide por classe. Decide pelo `PolicyDecision` que o domÃ­nio devolve.

---

## 11. Tool Boundary

O desenho abaixo se sustenta no cÃ³digo e nÃ£o exige registry:

```text
roteiro / compreensÃ£o
â†’ ActionProposal
â†’ PolicyDecision
â†’ Approval, se exigido
â†’ Permit
â†’ funÃ§Ã£o da capability (FileCapabilities, AnthropicIntelligence)
â†’ ferramenta (fs, SDK)
â†’ efeito
â†’ relato opaco
```

O LLM nÃ£o chama a ferramenta. O core nÃ£o importa `fs` nem Anthropic. A ferramenta nÃ£o chama `evaluate`. SÃ³ `claimPermit`.

Rejeitar: o modelo escolher tools sozinho. Rejeitar: o core conhecer cada API.

Aceitar: cada efeito consequencial entra por uma proposta explÃ­cita, como jÃ¡ entra.

---

## 12. Capability vs Authority

Capability â‰  permissÃ£o. Tool disponÃ­vel â‰  autorizada. Acesso â‰  consentimento.

`FileCapabilities` existe no processo o tempo inteiro. Sem Permit de `create_artifact` para aquele destino, nÃ£o grava. A polÃ­tica pode negar mesmo com o mÃ³dulo carregado.

| Fato | NÃ£o emite Permit |
|---|---|
| Capability nomeada no cÃ³digo | |
| Classe da tool instanciada | |
| API com chave no ambiente | |
| UsuÃ¡rio jÃ¡ aprovou envio neste Run | A prÃ³xima Attempt pede de novo |
| Attempt anterior `executed` | |
| MemÃ³ria futura de hÃ¡bito | |
| Contexto com uma entidade | |
| Clique em botÃ£o | |

`inspect` Ã© a exceÃ§Ã£o atual: usa filesystem sem Permit. Ã‰ preparaÃ§Ã£o do experimento, nÃ£o um modelo a generalizar.

---

## 13. Tool vs Context

O fluxo da Stage 20 continua vÃ¡lido:

```text
Context
â†’ interpretaÃ§Ã£o
â†’ ActionProposal
â†’ PolicyDecision
â†’ Approval
â†’ Permit
â†’ execuÃ§Ã£o da tool
```

Contexto pode preencher `resource` ("este arquivo", "produto X"). NÃ£o preenche `PolicyDecision`. NÃ£o cria Permit.

`TaskContext` sÃ³ existe depois de leituras autorizadas. O conteÃºdo lido nÃ£o autoriza `create_artifact`.

---

## 14. Tool vs Memory

MemÃ³ria nÃ£o estÃ¡ implementada.

Uma preferÃªncia ("PDF") pode influenciar a proposta. Um hÃ¡bito ("ele sempre aprova envio") nÃ£o preenche `confirm`. AprovaÃ§Ã£o Ã© desta Attempt, agora.

---

## 15. Failure / Unknown

RelaÃ§Ã£o com a Stage 19, sem RetryManager.

| Caso da tool | Desfecho da Attempt |
|---|---|
| Tool nÃ£o disponÃ­vel, antes de `claimPermit` | `failed` |
| Tool rejeita entrada local (extensÃ£o errada antes de gravar) | `failed`, se nenhum efeito comeÃ§ou |
| Falha antes do efeito | `failed` |
| Falha depois de possÃ­vel efeito, sem evidÃªncia | `unknown` |
| Resposta invÃ¡lida depois de `messages.create` ter retornado | hoje `failed`, com mensagem de que a chamada ocorreu |
| ExecuÃ§Ã£o parcial (arquivo, `unlink` incerto) | `unknown` |

Nada disso muda o Permit. `unknown` nÃ£o autoriza outra Attempt.

---

## 16. Idempotency Considerations

NÃ£o implementar.

Leitura de arquivo tende a ser repetÃ­vel. Envio ao modelo e criaÃ§Ã£o `wx` nÃ£o sÃ£o. `unknown` num envio ou numa criaÃ§Ã£o nÃ£o se repete atÃ© alguÃ©m observar. Chave de idempotÃªncia, se um dia existir, vive na tool e no recurso, nÃ£o no core.

---

## 17. Core Boundary

O core jÃ¡ conhece e deve continuar conhecendo:

- ActionProposal
- PolicyDecision
- Permit
- Execution (`attempt` / `execute`)
- AttemptOutcome
- efeito opaco, sem interpretÃ¡-lo

O core nÃ£o deve conhecer:

- Capability como catÃ¡logo
- Tool
- FileCapabilities, Anthropic, Markdown, path
- Observation estruturada
- Resultado documental
- qual ferramenta realiza qual capability

`ActionProposal.capability` Ã© um rÃ³tulo opaco. A polÃ­tica do domÃ­nio e o `claimPermit` Ã© que o interpretam.

---

## 18. Universalization Constraints

O J.A.R.V.I.S. nÃ£o Ã© um assistente de arquivos, nem um agente de APIs, nem um agente de browser. As quatro capabilities atuais sÃ£o do Experimento 01.

Adicionar uma capability futura nÃ£o deve exigir um registry. Exige: um nome na proposta, uma polÃ­tica que o julgue, uma funÃ§Ã£o que sÃ³ rode com o Permit correspondente.

NÃ£o hÃ¡ evidÃªncia no cÃ³digo para infinitas tools. HÃ¡ evidÃªncia para o invariante: efeito consequencial entra pelo mesmo portÃ£o.

---

## 19. Adversarial Cases

| Caso | Comportamento esperado, jÃ¡ prÃ³ximo do cÃ³digo |
|---|---|
| 1. Tool disponÃ­vel + deny | Sem Permit, sem execuÃ§Ã£o. Run pode ser `rejected`. |
| 2. require_approval + recusa | `refused`. Sem execuÃ§Ã£o. Run documental pode ser `cancelled`. |
| 3. Permit + falha antes do efeito | `failed`. |
| 4. Permit + efeito possÃ­vel + resposta perdida | `unknown`. Sem retry. |
| 5. Attempt A executada, B usa a autorizaÃ§Ã£o de A | Recusado. Permit de A nÃ£o serve para B. |
| 6. Contexto seleciona X, "exclua" | Proposta sobre X. Sem Permit atÃ© polÃ­tica e aprovaÃ§Ã£o. |
| 7. MemÃ³ria de hÃ¡bito de aprovar | NÃ£o preenche `confirm`. |
| 8. Tool autenticada, contexto muda de conta | Nova proposta, novo recurso, nova decisÃ£o. Credencial da tool nÃ£o Ã© o Permit. |
| 9. Duas tools para a mesma capability | O roteiro escolhe a funÃ§Ã£o. O core nÃ£o roteia. Ainda nÃ£o hÃ¡ segundo caso. |
| 10. ExecuÃ§Ã£o parcial, estado final incerto | `unknown`. |

---

## 20. Architectural Risks

| Risco | Classe | Por quÃª |
|---|---|---|
| Inventar ToolRegistry / CapabilityRegistry agora | R1 | NÃ£o hÃ¡ segundo domÃ­nio de tools. O switch da polÃ­tica documental basta para o experimento. |
| LLM escolher tools | R4 se alguÃ©m fizer isso | Furaria o Permit. O cÃ³digo atual nÃ£o faz. |
| Core importar filesystem ou Anthropic | R4 se alguÃ©m fizer | Hoje nÃ£o importa. |
| Contexto ou memÃ³ria emitirem Permit | R4 se alguÃ©m fizer | Stage 20 jÃ¡ separa. |
| `inspect` sem Permit virar padrÃ£o de tools | R2 | Ã‰ do experimento. NÃ£o generalizar. |
| `DocumentaryActionKind` omitir `send_intention_to_model` | R1 | A polÃ­tica e o runner jÃ¡ usam o nome. O tipo documental estÃ¡ atrasado. NÃ£o bloqueia o modelo. |
| Tratar `executed` como efeito confirmado | R2 | Stage 19 jÃ¡ documenta. |
| PluginManager / MCP / event bus | R1 | Nenhum caso real pede. Esperar. |
| UniversalTool / UniversalResult | R3 se implementado agora | Apagaria a distinÃ§Ã£o Execution / Effect / Result. NÃ£o implementar. |

NÃ£o hÃ¡ R3 nem R4 no estado atual do cÃ³digo. Haveria se a implementaÃ§Ã£o desta stage criasse registry ou deixasse a tool decidir polÃ­tica.

---

## 21. Proposed Invariants

Validados:

1. Capability nÃ£o concede autoridade.
2. Tool disponÃ­vel nÃ£o significa tool autorizada.
3. Contexto nÃ£o concede autoridade.
4. Memory nÃ£o concede autoridade.
5. Cada efeito consequencial tem fronteira de autoridade. `inspect` Ã© a exceÃ§Ã£o local do experimento, nÃ£o um invariante quebrado do core.
6. Uma Attempt nÃ£o autoriza outra.
7. Permit nÃ£o pode ser reutilizado.
8. Execution nÃ£o significa Effect confirmado.
9. Effect nÃ£o significa Result vÃ¡lido.
10. Result nÃ£o significa Validation bem-sucedida.
11. Unknown nÃ£o deve ser tratado como Failed para simplificar o fluxo.
12. Tool nÃ£o decide polÃ­tica. SÃ³ recusa Permit invÃ¡lido.
13. Core nÃ£o conhece detalhes de tools.
14. Tool nÃ£o ultrapassa o Permit recebido.
15. Adicionar uma tool nÃ£o redefine o nÃºcleo. Basta proposta, polÃ­tica e funÃ§Ã£o com Permit.

Nenhum desses invariantes foi rejeitado. O item 5 admite a exceÃ§Ã£o `inspect` atÃ© o experimento mudar.

---

## 22. Open Questions

- `inspect` deve um dia virar Attempt, ou permanece preparaÃ§Ã£o do experimento.
- Uma capability com duas tools: quem escolhe, se um dia existirem as duas.
- `reversible` deve informar polÃ­tica ou continua morto.
- O core precisa saber que uma capability Ã© leitura ou escrita, ou a polÃ­tica continua sendo a Ãºnica classificadora.

Nenhuma autoriza implementaÃ§Ã£o agora.

---

## 23. Implementation Boundary

Nada desta stage vira cÃ³digo.

Quando houver uma segunda tool real, a menor implementaÃ§Ã£o Ã©: nova string de capability, polÃ­tica do domÃ­nio, funÃ§Ã£o que chama `claimPermit` antes do efeito. Sem registry.

AtÃ© lÃ¡, `FileCapabilities` e `AnthropicIntelligence` continuam sendo as tools do Experimento 01, nÃ£o o modelo de tools do J.A.R.V.I.S.

---

## 24. Stage Classification

**B â€” aprovado com riscos.**

O modelo Ã© coerente com o cÃ³digo e com as Stages 18C, 19 e 20. Capability, tool e autoridade jÃ¡ se separam na prÃ¡tica. NÃ£o hÃ¡ lacuna que mude a arquitetura se ninguÃ©m criar registry agora.

Riscos: R1 (registry, MCP, tipo documental incompleto) e R2 (`inspect`, `executed` vs validaÃ§Ã£o). Sem R3 ou R4 no estado atual.

NÃ£o implementar catÃ¡logo, plugin, MCP nem ferramenta nova com base neste documento.
