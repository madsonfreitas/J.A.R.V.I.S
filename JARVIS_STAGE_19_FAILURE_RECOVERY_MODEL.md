# J.A.R.V.I.S. â€” Stage 19: Failure, Cancellation and Recovery

**RevisÃ£o:** 19A. EspecificaÃ§Ã£o apenas. Nenhum cÃ³digo, contrato ou teste foi alterado.
**Base:** `src/cycle`, `src/documentary`, `src/intelligence`, `src/observability` e os testes atuais.

O menor modelo correto continua sendo um vocabulÃ¡rio honesto. NÃ£o Ã© um motor de retry.

---

## 1. Estado atual observado

O core conhece quatro desfechos de Attempt: `denied`, `refused`, `failed`, `executed`.

`CoreRun.attempt`:

- `deny` retorna sem Permit e sem `execute`;
- `require_approval` com confirmaÃ§Ã£o falsa retorna `refused`, tambÃ©m sem Permit;
- sÃ³ entÃ£o emite um Permit e chama `execute`;
- se `execute` retorna e o Permit foi consumido, o desfecho Ã© `executed` e o valor devolvido Ã© opaco;
- qualquer exceÃ§Ã£o vira `failed`, com `message` e `cause`.

NÃ£o hÃ¡ `unknown`. NÃ£o hÃ¡ timeout, abort, retry nem observaÃ§Ã£o separada do retorno da funÃ§Ã£o.

`ActionProposal.reversible` existe e nÃ£o Ã© lido. `CapabilityEffect.observed` sÃ³ Ã© preenchido quando `createArtifact` retorna, sempre `true`, sem reler o arquivo.

---

## 2. Seis conceitos que nÃ£o sÃ£o sinÃ´nimos

| Conceito | O que Ã© | Exemplo no cÃ³digo atual |
|---|---|---|
| Attempt | Uma autorizaÃ§Ã£o e uma execuÃ§Ã£o ligadas a um Permit. | `send_sources_to_model` Ã© uma Attempt. `send_intention_to_model` Ã© outra. |
| Execution | A funÃ§Ã£o autorizada foi iniciada e, se voltou sem exceÃ§Ã£o, terminou. | `execute(permit)` chamou `messages.create` ou `writeFile`. |
| Effect | Uma mudanÃ§a que pode ter ocorrido fora da funÃ§Ã£o. | O provedor pode ter recebido o prompt. O arquivo pode ter ficado no disco. |
| Observation | EvidÃªncia que o J.A.R.V.I.S. recebeu sobre esse efeito. | O SDK devolveu um body. `open`/`writeFile` nÃ£o lanÃ§ou. O `unlink` lanÃ§ou e foi ignorado. |
| Validation | A evidÃªncia foi comparada com o efeito esperado e bastou. | O rascunho tem seÃ§Ãµes e proveniÃªncia. Isso nÃ£o confere o arquivo. |
| Result | O que o Run apresenta ao usuÃ¡rio. | `completed`, `completed_with_reservations`, `failed`, `rejected`, `cancelled`. |

Exemplo concreto do envio das fontes:

```text
Attempt:     send_sources_to_model
Execution:   messages.create foi chamado e a funÃ§Ã£o voltou
Effect:      o provedor pode ter processado o prompt
Observation: o body da resposta, se chegou
Validation:  o draft passou no ResultValidator â€” outro passo
Result:      o Run ainda pode falhar depois, se o rascunho for invÃ¡lido
```

`executed` nomeia o fim da Execution com retorno normal. NÃ£o nomeia Effect confirmado, Observation suficiente, Validation nem Result.

---

## 3. Fluxo atual de falhas

| Origem | Execution | Effect | O que o cÃ³digo grava |
|---|---|---|---|
| PolÃ­tica `deny` | nÃ£o | nenhum | Attempt `denied`, Run `rejected` |
| `execute` lanÃ§a | iniciada | nÃ£o classificado | Attempt `failed`, Run `failed` |
| `inspect` lanÃ§a | fora de Attempt | nenhum desta Attempt | Run `failed` |
| Rascunho `invalid` | a do modelo jÃ¡ terminou | o prompt jÃ¡ pode ter sido processado | Attempt do modelo permanece `executed`; Run `failed` |
| `messages.create` lanÃ§a | iniciada | desconhecido | `failed` |
| `messages.create` retorna e o parse falha | a chamada voltou | a chamada ocorreu; o artefato local nÃ£o | mensagem admite isso; o tipo continua `failed` |
| arquivo aberto e `unlink` falha | nÃ£o terminou limpa | o arquivo pode continuar | `failed` |

---

## 4. Fluxo atual de cancelamento

Dois caminhos viram `RunStatus.cancelled`:

1. UsuÃ¡rio recusa uma aprovaÃ§Ã£o. Attempt `refused`. `finishAttempt` traduz para Run `cancelled`.
2. UsuÃ¡rio nÃ£o confirma o objetivo. `ExperimentCancelledError`. O `catch` grava Run `cancelled`.

NÃ£o hÃ¡ cancelamento no meio de `execute`. A recusa do objetivo ocorre depois de `understandIntent`. Essa Attempt jÃ¡ pode ter `executed`. O Run cancelado nÃ£o a desfaz.

---

## 5. Fluxo atual de aprovaÃ§Ã£o

`confirm` sÃ³ corre quando a polÃ­tica pede aprovaÃ§Ã£o, e sÃ³ antes do Permit.

Cada uma destas aÃ§Ãµes pede a prÃ³pria confirmaÃ§Ã£o: `send_intention_to_model`, `send_sources_to_model`, `create_artifact`.

A confirmaÃ§Ã£o do objetivo nÃ£o Ã© Attempt e nÃ£o emite Permit. Uma aprovaÃ§Ã£o nÃ£o vira Permit de outra aÃ§Ã£o. A recusa nÃ£o gera evento `approval`. O evento de polÃ­tica nÃ£o guarda `attemptId`.

---

## 6. Fluxo atual de execuÃ§Ã£o

```text
issuePermit
â†’ execute(permit)
â†’ claimPermit
â†’ readFile, writeFile ou messages.create
â†’ retorno
â†’ executed, se nÃ£o houve exceÃ§Ã£o e o Permit foi consumido
```

A validaÃ§Ã£o do rascunho acontece depois do `executed` do envio das fontes e antes da escrita. O Run `completed` usa essa validaÃ§Ã£o e o retorno de `createArtifact`. NÃ£o relÃª o arquivo.

---

## 7. Lacunas

- NÃ£o hÃ¡ desfecho para efeito indeterminado.
- `failed` mistura efeito ausente, efeito ocorrido com erro local, e efeito que talvez tenha ocorrido.
- `executed` Ã© tratado como se a Observation da prÃ³pria funÃ§Ã£o bastasse para o Result.
- `reversible` nÃ£o decide nada.
- NÃ£o hÃ¡ timeout, abort nem retry.
- O recorder nÃ£o reconstrÃ³i a Attempt.
- Run `cancelled` junta recusa de uma aÃ§Ã£o e desistÃªncia do objetivo.
- Run `failed` junta falha de execuÃ§Ã£o e rascunho invÃ¡lido.

---

## 8. Unknown

`unknown` nÃ£o significa que a execuÃ§Ã£o falhou. Significa: a Execution passou do ponto em que o Effect pode ter sido produzido, e a Observation nÃ£o basta para dizer se ele existe.

Uma Attempt termina `unknown` somente quando as trÃªs condiÃ§Ãµes valem:

1. o Permit foi consumido;
2. a operaÃ§Ã£o externa foi iniciada;
3. a resposta nÃ£o prova que o efeito esperado existe nem que nÃ£o existe.

`failed` exige o contrÃ¡rio do item 3: sabemos que o efeito desta Attempt nÃ£o ficou. Erro antes de `claimPermit` Ã© `failed`, nÃ£o `unknown`.

`unknown` Ã© terminal para aquela Attempt. Outra Attempt pode investigar. Ela nÃ£o reescreve a primeira.

`unknown` nÃ£o autoriza retry automÃ¡tico. Repetir a mesma aÃ§Ã£o nÃ£o idempotente, ou de idempotÃªncia desconhecida, fica proibido atÃ© uma Attempt de observaÃ§Ã£o dizer que o efeito nÃ£o estÃ¡ lÃ¡.

Uma observaÃ§Ã£o posterior pode estabelecer que o efeito existe ou que nÃ£o existe. Esse conhecimento fica na observaÃ§Ã£o nova. A Attempt original continua `unknown`.

---

## 9. O arquivo que fica depois do erro

```text
createArtifact
â†’ claimPermit
â†’ open
â†’ arquivo pode existir
â†’ write falha
â†’ unlink falha e o erro Ã© ignorado
â†’ Attempt failed
```

NÃ£o Ã© `failed` no sentido novo: `failed` afirma efeito ausente. Aqui ninguÃ©m provou a ausÃªncia. TambÃ©m nÃ£o Ã© `executed`: a funÃ§Ã£o nÃ£o voltou normalmente.

Ã‰ `unknown`. A Observation Ã© parcial: houve erro de limpeza e nÃ£o houve uma leitura do caminho. O core nÃ£o precisa saber que isso Ã© filesystem. A capability, que sabe o que fez, Ã© quem deve sinalizar `unknown` em vez de lanÃ§ar um erro mudo. O core sÃ³ preserva esse desfecho.

"Terminou com erro, mas deixou efeito" nÃ£o cabe num Ãºnico rÃ³tulo se quisermos dizer as duas coisas ao mesmo tempo. O mÃ­nimo agora Ã© nÃ£o mentir: `unknown` diz que nÃ£o sabemos. Uma Attempt posterior de observaÃ§Ã£o pode dizer que o arquivo existe. Isso nÃ£o transforma o core em especialista de arquivo.

---

## 10. Executed

`executed` significa apenas:

> `execute` retornou sem exceÃ§Ã£o, depois que o Permit daquela Attempt foi consumido.

NÃ£o significa efeito confirmado, resultado validado, sucesso de negÃ³cio nem entrega confirmada pelo sistema externo.

O valor opaco devolvido Ã© o relato da capability. NÃ£o Ã© Validation.

---

## 11. Validation e o rascunho invÃ¡lido

```text
Attempt send_sources_to_model  â†’ executed
draft produzido
ResultValidator                â†’ invalid
Run                            â†’ failed
```

Isso Ã© correto para o Result: o usuÃ¡rio nÃ£o recebe sucesso. Ã‰ incorreto tratar a Attempt do modelo como falha de execuÃ§Ã£o. Ela cumpriu a aÃ§Ã£o autorizada: enviar as fontes e devolver um draft.

SÃ£o trÃªs camadas:

- Attempt do modelo: `executed`;
- validaÃ§Ã£o do draft: critÃ©rio documental, nÃ£o desfecho da Attempt;
- Run: `failed`, porque o experimento nÃ£o segue para o arquivo.

NÃ£o hÃ¡ motor de fluxo nisso. O roteiro documental jÃ¡ faz essa ordem. O que falta Ã© nÃ£o apagar o `executed` da Attempt ao marcar o Run como `failed`.

---

## 12. Completed

O cÃ³digo atual pode dizer que o artefato foi criado quando `createArtifact` retorna. Essa evidÃªncia Ã© Execution bem-sucedida, nÃ£o Observation posterior.

Para afirmar o sucesso compatÃ­vel com o efeito esperado, seria preciso, depois do retorno:

- observar o caminho de novo;
- ver o arquivo;
- ver o conteÃºdo que se pretendia gravar.

Sem isso, o arquivo pode sumir ou mudar entre o retorno e a frase "artefato criado". O Run `completed` de hoje Ã© mais forte do que a evidÃªncia. Esta especificaÃ§Ã£o nÃ£o muda esse comportamento. Registra que a frase de sucesso do arquivo ainda nÃ£o tem Observation independente.

`completed_with_reservations` tambÃ©m nÃ£o relÃª o arquivo. A reserva vem das lacunas do draft, nÃ£o do disco.

---

## 13. Refused e cancelled

SÃ£o conceitos diferentes.

| Conceito | Significado |
|---|---|
| Attempt `refused` | O usuÃ¡rio nÃ£o aprovou aquela aÃ§Ã£o. Ela nÃ£o executou. |
| Attempt `denied` | A polÃ­tica nÃ£o permitiu. NÃ£o Ã© cancelamento. |
| Run `cancelled` | O restante do roteiro para. NÃ£o diz qual Attempt foi recusada. |
| Run `rejected` | A polÃ­tica impediu continuar. Hoje vem de `denied`. |

No Experimento 01, recusar a aprovaÃ§Ã£o de uma aÃ§Ã£o necessÃ¡ria encerra o Run. Esse mapeamento Ã© do roteiro, nÃ£o uma identidade entre os dois conceitos. A Attempt continua `refused`. O Run fica `cancelled` porque o experimento nÃ£o tem outro caminho.

Desistir do objetivo tambÃ©m encerra o Run, sem ser `refused` de uma Attempt. O sistema nÃ£o tem um terceiro cancelamento prÃ³prio alÃ©m desses dois.

NÃ£o unificar os nomes. NÃ£o mudar o cÃ³digo nesta revisÃ£o.

---

## 14. Processar a intenÃ§Ã£o e agir fora

NÃ£o Ã© um bug a recusa do objetivo acontecer depois de `understandIntent`.

Processar a intenÃ§Ã£o, neste cÃ³digo, jÃ¡ Ã© uma chamada externa: `send_intention_to_model` envia a intenÃ§Ã£o ao provedor. A autorizaÃ§Ã£o Ã© a aprovaÃ§Ã£o dessa Attempt. O Permit Ã© o dela.

Enviar as fontes Ã© outra chamada: `send_sources_to_model`. Outra aprovaÃ§Ã£o. Outro Permit.

Aprovar a intenÃ§Ã£o nÃ£o aprova as fontes. Recusar as fontes depois que a intenÃ§Ã£o jÃ¡ foi processada Ã© lÃ­cito. A primeira Attempt permanece `executed`. A segunda fica `refused` e nÃ£o chama `messages.create`.

Recusar o objetivo nÃ£o desfaz o envio da intenÃ§Ã£o e nÃ£o autoriza o envio das fontes. SÃ£o efeitos e autorizaÃ§Ãµes distintos. O vazamento seria usar o `executed` da intenÃ§Ã£o como Permit das fontes. O cÃ³digo atual nÃ£o faz isso.

---

## 15. Observabilidade

Conceitualmente, uma falha sÃ³ Ã© reconstruÃ­vel com:

- `runId`, `attemptId`, aÃ§Ã£o;
- decisÃ£o de polÃ­tica;
- aprovaÃ§Ã£o, inclusive o nÃ£o;
- Permit emitido e se foi consumido;
- execuÃ§Ã£o iniciada e terminada;
- estado do efeito: ausente, presente ou desconhecido;
- observaÃ§Ã£o;
- validaÃ§Ã£o, quando houver;
- erro;
- cancelamento;
- desfecho da Attempt e Result do Run.

Implementar agora: nada. Esta revisÃ£o nÃ£o grava campo novo.

Quando a stage for implementada, o mÃ­nimo na tabela de eventos jÃ¡ existente Ã© `attemptId` e o desfecho, incluindo `unknown`. O resto pode esperar. NÃ£o gravar prompt nem conteÃºdo de fonte.

---

## 16. IdempotÃªncia

NÃ£o criar sistema de idempotÃªncia.

Quem sabe se repetir duplica Ã© a capability, aplicada a um recurso. A mesma capability pode ser idempotente num recurso e nÃ£o em outro. Se a capability nÃ£o declara, o valor Ã© desconhecido e a regra Ã© a da aÃ§Ã£o nÃ£o idempotente.

Depois de `unknown`, isso impede repetir atÃ© uma observaÃ§Ã£o mostrar que o efeito nÃ£o estÃ¡ lÃ¡. O core nÃ£o infere essa propriedade e nÃ£o ganha um campo nesta revisÃ£o. `reversible`, que jÃ¡ existe e nÃ£o Ã© usado, nÃ£o deve ser reaproveitado como se fosse idempotÃªncia.

---

## 17. O que nÃ£o criar

| Ideia | Por que ainda nÃ£o |
|---|---|
| RetryManager | NÃ£o hÃ¡ retry. A regra Ã© nÃ£o repetir `unknown`. |
| RecoveryManager | Recuperar Ã© outra Attempt, decidida pelo domÃ­nio. |
| UniversalResult | O efeito continua opaco. O desfecho da Attempt Ã© pequeno. |
| WorkflowEngine | O roteiro documental jÃ¡ Ã© cÃ³digo comum. |
| EffectRegistry | NÃ£o hÃ¡ catÃ¡logo de efeitos. |
| State machine genÃ©rica | Um desfecho a mais nÃ£o precisa de mÃ¡quina. |
| CapabilityRegistry | As aÃ§Ãµes do experimento continuam explÃ­citas. |

---

## 18. Invariantes da Stage 19

1. `unknown` nÃ£o Ã© `failed`.
2. Erro tÃ©cnico nÃ£o determina sozinho o estado do efeito.
3. `executed` nÃ£o Ã© sucesso validado.
4. Cancelamento nÃ£o implica reversÃ£o.
5. Retry nÃ£o Ã© automaticamente permitido.
6. Efeito desconhecido nÃ£o pode ser tratado como ausÃªncia de efeito.
7. Uma Attempt nÃ£o autoriza outra.
8. Uma aprovaÃ§Ã£o nÃ£o pode ser reutilizada implicitamente.
9. O core nÃ£o assume reversibilidade.
10. Filesystem tambÃ©m pode deixar efeito sÃ³ parcialmente observÃ¡vel.
11. Processar a intenÃ§Ã£o e produzir outro efeito externo permanecem aÃ§Ãµes distintas.
12. O J.A.R.V.I.S. nÃ£o afirma sucesso sem evidÃªncia compatÃ­vel com o efeito esperado.

---

## 19. Casos adversariais

| CenÃ¡rio | ExecuÃ§Ã£o | Efeito | ObservaÃ§Ã£o | Estado da Attempt | Resultado do Run, no experimento atual se nada mais mudar |
|---|---|---|---|---|---|
| Negado antes de executar | nÃ£o | nenhum | conhecida | `denied` | `rejected` |
| UsuÃ¡rio recusa a aprovaÃ§Ã£o | nÃ£o | nenhum | conhecida | `refused` | `cancelled` |
| Falha antes de `claimPermit` | iniciada | nenhum | conhecida | `failed` | `failed` |
| Efeito pode ter ocorrido e a resposta se perde | iniciada | desconhecido | insuficiente | `unknown` | nÃ£o `completed` |
| Efeito ocorre e a resposta confirma a operaÃ§Ã£o | concluÃ­da | ocorreu, segundo o relato | a resposta da prÃ³pria chamada | `executed` | ainda nÃ£o Ã© Validation |
| Arquivo criado e o `unlink` falha sem nova leitura | nÃ£o terminou limpa | desconhecido | parcial | `unknown` | nÃ£o `completed` |
| Draft produzido e a validaÃ§Ã£o falha | concluÃ­da | produzido | o draft existe e Ã© invÃ¡lido | `executed` | `failed` |
| UsuÃ¡rio recusa antes do Permit | nÃ£o | nenhum | conhecida | `refused` | `cancelled` |
| UsuÃ¡rio cancela o objetivo depois de um efeito possÃ­vel | a Attempt anterior pode ter concluÃ­do | o dela pode existir | a dela pode bastar para essa Attempt | a anterior nÃ£o muda; nÃ£o hÃ¡ Attempt nova | `cancelled` |

Um Ãºnico `AttemptOutcome` nÃ£o basta para dizer, ao mesmo tempo, "a funÃ§Ã£o deu erro" e "o arquivo ficou". `unknown` evita a mentira. A frase "o arquivo ficou" sÃ³ pode vir de uma observaÃ§Ã£o posterior. TambÃ©m nÃ£o basta um desfecho para representar o par `executed` + validaÃ§Ã£o invÃ¡lida: a Attempt fica `executed` e o Run fica `failed`.

---

## 20. O que pertence ao Core

- nÃ£o executar em `deny` e `refused`;
- nÃ£o chamar de `failed` o que Ã© `unknown`, quando esse desfecho existir;
- nÃ£o chamar de `executed` uma funÃ§Ã£o que lanÃ§ou;
- nÃ£o reutilizar Permit;
- nÃ£o interpretar o efeito opaco;
- nÃ£o disparar retry, compensaÃ§Ã£o nem a prÃ³xima etapa.

---

## 21. O que nÃ£o pertence ao Core

- polÃ­tica de arquivo e de provedor;
- reler o arquivo para validar Markdown;
- saber se o modelo recebeu o prompt;
- declarar se uma API Ã© idempotente;
- apagar um efeito anterior;
- timeout de produto, fila, memÃ³ria, MCP, plugins.

---

## 22. Menor mudanÃ§a posterior

Quando houver autorizaÃ§Ã£o para implementar:

1. a capability que jÃ¡ consumiu o Permit e nÃ£o consegue saber o efeito sinaliza `unknown`;
2. `CoreRun.attempt` preserva esse desfecho;
3. o runner nÃ£o declara `completed` nesse caso;
4. o evento da Attempt inclui `attemptId` e o desfecho.

NÃ£o acrescentar campo de idempotÃªncia nesta implementaÃ§Ã£o. Efeito desconhecido nÃ£o se repete.

---

## 23. Fora desta stage

- retry automÃ¡tico e chave de idempotÃªncia;
- exactly-once;
- compensaÃ§Ã£o;
- abort de chamada em andamento;
- observaÃ§Ã£o genÃ©rica;
- passar a usar `reversible`;
- colocar `inspect` sob Permit;
- separar no `RunStatus` a recusa da desistÃªncia do objetivo.

---

## 24. CritÃ©rios para aceitar esta revisÃ£o

1. Execution, Effect, Observation, Validation e Result nÃ£o sÃ£o tratados como a mesma coisa.
2. `unknown` significa efeito indeterminado, nÃ£o execuÃ§Ã£o falha.
3. O arquivo deixado depois do `unlink` Ã© `unknown`, nÃ£o `failed` honesto.
4. `executed` nÃ£o Ã© sucesso confirmado.
5. Rascunho invÃ¡lido falha o Run e nÃ£o a Attempt do modelo.
6. `refused` e Run `cancelled` permanecem conceitos diferentes.
7. Processar a intenÃ§Ã£o e enviar as fontes permanecem autorizaÃ§Ãµes diferentes.
8. Nenhuma das abstraÃ§Ãµes da seÃ§Ã£o 17 entra agora.
9. Nenhum cÃ³digo foi alterado para produzir esta revisÃ£o.
