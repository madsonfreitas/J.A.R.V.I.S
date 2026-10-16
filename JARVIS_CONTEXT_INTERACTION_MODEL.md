# J.A.R.V.I.S. â€” Context and Interaction Model

**Stage:** 20
**Natureza:** especificaÃ§Ã£o. Nenhum cÃ³digo foi alterado.
**Base:** `src/cycle`, `src/documentary`, Stages 18C e 19.

O que existe hoje nÃ£o Ã© um modelo geral de contexto. Ã‰ um pacote de textos lidos para o Experimento 01.

`TaskContext` Ã© uma lista de arquivos jÃ¡ lidos, cada um marcado `untrusted_content`, com teto de caracteres. Ele sÃ³ entra em `createDraft`. `understandIntent` recebe a intenÃ§Ã£o e os esclarecimentos, nÃ£o esse pacote.

`CycleInteraction` mostra status, pergunta e confirma. A confirmaÃ§Ã£o responde a uma `PolicyDecision`. Ela nÃ£o lÃª contexto e nÃ£o emite `Permit` sozinha. A interaÃ§Ã£o documental acrescenta prÃ©via Markdown e caminho de saÃ­da.

Contexto, nesse cÃ³digo, Ã© dado de uma Attempt de leitura. NÃ£o Ã© autorizaÃ§Ã£o.

---

## 1. Definition

| Conceito | NecessÃ¡rio agora | Papel |
|---|---|---|
| Context | Sim | O conjunto do que estÃ¡ em uso para compreender ou propor a aÃ§Ã£o atual. NÃ£o Ã© o histÃ³rico inteiro. NÃ£o Ã© permissÃ£o. |
| Interaction | Sim | Uma troca com o usuÃ¡rio ou com a interface. Pode sÃ³ mudar contexto. Pode tambÃ©m expressar uma intenÃ§Ã£o. NÃ£o executa efeito por si. |
| Context Item | Sim | Uma unidade: o que foi dito ou selecionado, de onde veio, quando, e se ainda vale. |
| Context Source | VocabulÃ¡rio | De onde o item veio: fala, arquivo, seleÃ§Ã£o, resultado anterior. NÃ£o Ã© um tipo de cÃ³digo. |
| Context Scope | Sim | O limite em que o item vale: esta tarefa, esta conversa, este momento. |
| Context Relevance | VocabulÃ¡rio | Se o item entra na decisÃ£o atual. NÃ£o Ã© um score. |
| Context State | VocabulÃ¡rio | Confirmado, inferido, ausente, incerto, invÃ¡lido ou conflitante. NÃ£o Ã© uma mÃ¡quina de estados. |
| Context Update | Sim | Incluir, trocar, tirar, invalidar ou corrigir um item sem ser uma aÃ§Ã£o autorizada. |
| Context Selection | VocabulÃ¡rio | O ato de escolher quais itens sÃ£o relevantes agora. |
| Contextual Reference | Sim | Uma expressÃ£o como "isso" ou "ontem" que sÃ³ faz sentido junto de itens jÃ¡ presentes. |

NÃ£o hÃ¡ `ContextManager`, store, engine nem registry. O contexto Ã© um conjunto nomeado de itens, preso a um escopo, montado para uma decisÃ£o.

---

## 2. Context Sources

| Fonte | DuraÃ§Ã£o | ConfianÃ§a | Como entra | Escopo hoje | Pode envelhecer | ProveniÃªncia |
|---|---|---|---|---|---|---|
| Mensagem atual | TemporÃ¡ria | ExplÃ­cita, mas o texto pode ser ambÃ­guo | O usuÃ¡rio disse | A interaÃ§Ã£o | NÃ£o; Ã© o pedido atual | Quem falou e quando |
| Conversa corrente | TemporÃ¡ria | Mista | AcÃºmulo da sessÃ£o | A conversa, nÃ£o o produto | Sim, se o assunto mudou | Cada fala |
| Resultado de aÃ§Ã£o anterior | TemporÃ¡ria, ligada ao Run | O desfecho da Attempt, nÃ£o o mundo | `executed`, `unknown`, `failed` | Aquele Run | Sim, se o mundo mudou depois | `attemptId` |
| Arquivo | O conteÃºdo lido Ã© uma cÃ³pia daquele instante | NÃ£o confiÃ¡vel como instruÃ§Ã£o. O caminho foi autorizado para leitura | Attempt `read_source` | A tarefa que leu | Sim | Id, caminho, momento da leitura |
| SeleÃ§Ã£o na interface | TemporÃ¡ria | ExplÃ­cita como seleÃ§Ã£o, nÃ£o como ordem | A interface informa | A sessÃ£o visÃ­vel | Sim, se a seleÃ§Ã£o mudar | Quem selecionou e o que |
| Estado de uma entidade | Pode ser persistente fora do J.A.R.V.I.S. | Depende da observaÃ§Ã£o | Uma leitura autorizada | A entidade e o instante | Sim | Qual leitura, qual Attempt |
| InformaÃ§Ã£o externa | TemporÃ¡ria na decisÃ£o | NÃ£o confiÃ¡vel como instruÃ§Ã£o | Uma chamada autorizada | A decisÃ£o que a pediu | Sim | Provedor e momento |
| MemÃ³ria futura | Persistente sÃ³ se for retida de propÃ³sito | NÃ£o herda confianÃ§a automÃ¡tica | Fora desta stage | Ainda sem escopo | Sim | Origem e momento da retenÃ§Ã£o |
| Estado operacional | TemporÃ¡rio do processo | ConfiÃ¡vel como estado interno | O prÃ³prio Run | O Run | Muda com o Run | `runId`, status |

AusÃªncia Ã© um estado vÃ¡lido: nÃ£o hÃ¡ item para "produto". Incerteza tambÃ©m: hÃ¡ um candidato, mas nÃ£o estÃ¡ confirmado.

---

## 3. Context Scope

Um item nÃ£o vale fora do escopo em que foi colocado.

Invariantes, sem multi-usuÃ¡rio implementado:

- itens de uma tarefa nÃ£o entram em outra;
- itens de uma conversa nÃ£o entram em outra;
- seleÃ§Ã£o de uma sessÃ£o nÃ£o entra em outra;
- domÃ­nio documental nÃ£o vira contexto universal do core;
- "agora" nÃ£o herda sozinho o que era verdade ontem;
- dois itens do mesmo nome em escopos diferentes nÃ£o se fundem.

O Run atual Ã© o Ãºnico escopo implementado. Arquivos lidos pertencem Ã quele Run. Esclarecimentos tambÃ©m. NÃ£o hÃ¡ sessÃ£o, usuÃ¡rio nem conversa como objetos.

---

## 4. Interaction Model

Uma interaÃ§Ã£o faz uma de duas coisas, ou as duas:

1. Atualiza contexto. Selecionar um produto, corrigir um nome, responder uma pergunta.
2. Expressa uma intenÃ§Ã£o. "Exclua isso." "Mostre as vendas."

A interaÃ§Ã£o nÃ£o chama `claimPermit`. NÃ£o avalia polÃ­tica. NÃ£o grava arquivo.

A confirmaÃ§Ã£o atual Ã© um caso estreito: o core pergunta porque a polÃ­tica exigiu aprovaÃ§Ã£o daquela proposta. O sim nÃ£o edita contexto. O nÃ£o produz `refused`.

Perguntar e responder hoje vira `Clarification`. Isso Ã© contexto da compreensÃ£o, nÃ£o autoridade.

---

## 5. Context vs Intent

```text
interaÃ§Ã£o
â†’ atualizaÃ§Ã£o ou leitura do contexto do escopo
â†’ intenÃ§Ã£o expressa
â†’ compreensÃ£o usa sÃ³ os itens relevantes
â†’ proposta de aÃ§Ã£o, se houver efeito
â†’ polÃ­tica e aprovaÃ§Ã£o
â†’ Permit
â†’ execuÃ§Ã£o
```

"Mostre as vendas do produto X" fixa um item: produto X, dito pelo usuÃ¡rio agora. "E quanto vendeu ontem?" nÃ£o repete o produto. A referÃªncia se resolve com o item anterior. Isso Ã© compreensÃ£o. NÃ£o Ã© uma autorizaÃ§Ã£o para ler vendas. Ler ou consultar continua sendo uma aÃ§Ã£o com polÃ­tica prÃ³pria.

"Exclua isso" com Produto X selecionado resolve "isso" para Produto X. A seleÃ§Ã£o nÃ£o autoriza excluir. A proposta `delete Product X` ainda passa por polÃ­tica e, se a polÃ­tica pedir, por aprovaÃ§Ã£o. Sem isso, nÃ£o hÃ¡ Permit.

---

## 6. Context Updates

Uma atualizaÃ§Ã£o nÃ£o Ã© uma Attempt.

| OperaÃ§Ã£o | Exemplo | Efeito externo |
|---|---|---|
| Adicionar | O usuÃ¡rio diz "produto X" | Nenhum |
| Substituir | A seleÃ§Ã£o passa de X para Y | Nenhum |
| Remover | O usuÃ¡rio diz "esquece o produto" | Nenhum |
| Invalidar | A leitura do arquivo Ã© antiga demais para esta decisÃ£o | Nenhum |
| Corrigir | "NÃ£o era X, era Y" | Nenhum |
| Criar referÃªncia | "isso" aponta para o item selecionado | Nenhum |

Substituir X por Y nÃ£o exclui X e nÃ£o autoriza nada sobre Y.

CorreÃ§Ã£o Ã© explÃ­cita. InferÃªncia nÃ£o apaga um item confirmado pelo usuÃ¡rio.

---

## 7. Relevance

O problema nÃ£o Ã© buscar num Ã­ndice. Ã‰ decidir o que entra na compreensÃ£o desta frase e o que fica de fora.

Entra o que a frase nÃ£o consegue resolver sozinha e o que o usuÃ¡rio acabou de fixar. Fica de fora o resto da conversa, outros arquivos, outras tarefas e memÃ³ria que ninguÃ©m trouxe para este escopo.

Hoje isso Ã© trivial e rÃ­gido: `understandIntent` nÃ£o vÃª os arquivos; `createDraft` vÃª todos os que foram lidos, atÃ© o teto de caracteres. NÃ£o hÃ¡ escolha de relevÃ¢ncia. O teto Ã© limite, nÃ£o relevÃ¢ncia.

NÃ£o hÃ¡ embedding, RAG nem banco vetorial nesta stage. Quando houver escolha, ela continua sendo seleÃ§Ã£o de itens jÃ¡ obtidos. Obter um item novo, se isso lÃª arquivo ou chama um serviÃ§o, Ã© uma aÃ§Ã£o autorizada. A seleÃ§Ã£o em si nÃ£o Ã©.

---

## 8. Confidence / Uncertainty

Sem score numÃ©rico.

| Estado do item | Significado |
|---|---|
| Confirmado | O usuÃ¡rio disse ou selecionou, nesta interaÃ§Ã£o |
| Inferido | O sistema resolveu "isso" ou "ontem" a partir de outro item |
| Ausente | NÃ£o hÃ¡ item |
| Incerto | HÃ¡ candidato, mas a frase admite outro |
| Conflitante | Dois itens do mesmo papel discordam |
| InvÃ¡lido | Foi corrigido, expirou ou a observaÃ§Ã£o nÃ£o vale mais |

Item inferido nÃ£o vira confirmado sozinho. Conflito nÃ£o se resolve calando um dos lados. O caminho Ã© perguntar, como o esclarecimento jÃ¡ faz para o objetivo.

Arquivo lido Ã© conteÃºdo nÃ£o confiÃ¡vel como instruÃ§Ã£o, mesmo quando a leitura foi autorizada. Isso jÃ¡ estÃ¡ em `trust: "untrusted_content"`.

---

## 9. Context Isolation

Misturar em silÃªncio Ã© o defeito a evitar.

- UsuÃ¡rio A nÃ£o vÃª o contexto do usuÃ¡rio B. Ainda nÃ£o hÃ¡ usuÃ¡rios. O invariante fica registrado.
- SessÃµes nÃ£o compartilham seleÃ§Ã£o.
- Conversas nÃ£o herdam o assunto uma da outra sem uma atualizaÃ§Ã£o explÃ­cita.
- Tarefas nÃ£o herdam arquivos umas das outras.
- O contexto documental nÃ£o Ã© o contexto do core.
- Tempo: uma leitura vale para a decisÃ£o que a usou, nÃ£o como fato eterno.

O cÃ³digo atual isola por processo e por Run. NÃ£o hÃ¡ trava contra uma funÃ§Ã£o futura colocar dois Runs no mesmo saco. A trava Ã© de modelo: item sem escopo nÃ£o entra na decisÃ£o.

---

## 10. Context vs Authority

```text
Context   â†’ ajuda a compreender e a montar a proposta
Authority â†’ decide se aquela proposta executa
```

```text
Context â†’ nÃ£o concede Authority
```

| Fato | O que pode fazer | O que nÃ£o faz |
|---|---|---|
| UsuÃ¡rio seleciona uma conta | Resolver "essa conta" | Autorizar transferÃªncia ou exclusÃ£o |
| UsuÃ¡rio abre um arquivo | O arquivo pode ser lido se jÃ¡ houver Attempt de leitura | NÃ£o autoriza sobrescrever nem enviar o conteÃºdo |
| UsuÃ¡rio menciona uma senha | No mÃ¡ximo um item sensÃ­vel, fora do prompt por padrÃ£o | NÃ£o autentica e nÃ£o aprova aÃ§Ã£o |
| UsuÃ¡rio diz "isso" | ReferÃªncia, se houver um item | NÃ£o escolhe a polÃ­tica |
| MemÃ³ria diz que ele costuma aprovar | Nada, nesta stage | NÃ£o vira `confirm` verdadeiro |
| A aÃ§Ã£o anterior foi autorizada | O desfecho dela pode ser contexto | NÃ£o emite Permit para a prÃ³xima |

`TaskContext` hoje sÃ³ existe porque cada arquivo passou por uma Attempt `read_source`. O texto dentro do arquivo nÃ£o cria a prÃ³xima decisÃ£o.

---

## 11. Future UI Boundary

A interface futura mostra e edita contexto. NÃ£o decide autoridade.

```text
clique em Produto X
â†’ atualizaÃ§Ã£o: item selecionado = Produto X
â†’ "Como estÃ£o as vendas?"
â†’ intenÃ§Ã£o + esse item
â†’ proposta de consulta
â†’ polÃ­tica e aprovaÃ§Ã£o, se exigidas
â†’ sÃ³ entÃ£o Permit
```

```text
clique em Excluir
â†’ intenÃ§Ã£o de excluir o item selecionado, se houver
â†’ nÃ£o Ã© aprovaÃ§Ã£o
â†’ proposta delete
â†’ polÃ­tica
â†’ aprovaÃ§Ã£o especÃ­fica, se a polÃ­tica pedir
â†’ Permit ou recusa
```

Clique nÃ£o Ã© `confirm`. Abrir uma tela nÃ£o Ã© `allow`. O estado visual nÃ£o Ã© estado do core. O core continua recebendo intenÃ§Ã£o, proposta e decisÃ£o. A interface Ã© uma origem de itens e um lugar de pergunta e confirmaÃ§Ã£o.

---

## 12. Context vs Memory

```text
Context = o que esta decisÃ£o estÃ¡ usando agora
Memory  = o que foi retido de propÃ³sito para um uso futuro
```

MemÃ³ria nÃ£o Ã© implementada.

No futuro, um item sÃ³ atravessa para a memÃ³ria se alguÃ©m retiver. Conversa inteira nÃ£o vira memÃ³ria. SeleÃ§Ã£o nÃ£o vira memÃ³ria. AprovaÃ§Ã£o passada nÃ£o vira memÃ³ria de consentimento.

Riscos se a fronteira furar:

- memÃ³ria antiga usada como fato atual;
- hÃ¡bito de aprovar usado como aprovaÃ§Ã£o;
- retenÃ§Ã£o de segredo dito numa frase;
- um Run lendo a memÃ³ria de outro.

Nada disso entra no core agora.

---

## 13. Integration with Core Cycle

No ciclo real de hoje, contexto de arquivo aparece tarde:

```text
intenÃ§Ã£o
â†’ Attempt send_intention_to_model   (sem os arquivos)
â†’ objetivo confirmado
â†’ Attempts read_source
â†’ TaskContext montado
â†’ Attempt send_sources_to_model     (leva o TaskContext)
â†’ validaÃ§Ã£o do draft
â†’ Attempt create_artifact
```

O lugar conceitual continua sendo: a compreensÃ£o e a proposta podem usar contexto; a execuÃ§Ã£o nÃ£o comeÃ§a por causa dele.

- contexto nÃ£o cria Permit;
- contexto nÃ£o altera `PolicyDecision` sozinho;
- contexto nÃ£o substitui Approval;
- contexto pode influenciar o texto da proposta, por exemplo o recurso "Produto X";
- a autoridade da proposta continua sendo a polÃ­tica e, se exigido, a aprovaÃ§Ã£o.

Um resultado `unknown` ou `executed` pode virar item de contexto. NÃ£o vira autorizaÃ§Ã£o da Attempt seguinte.

---

## 14. Adversarial Cases

| SituaÃ§Ã£o | Leitura correta |
|---|---|
| "Exclua isso" com X selecionado | Proposta sobre X. Sem Permit atÃ© a polÃ­tica e a aprovaÃ§Ã£o. |
| Arquivo aberto na tela | Item de seleÃ§Ã£o. Leitura do conteÃºdo continua sendo Attempt. |
| Senha na frase | NÃ£o entra no contexto enviado a terceiro sem uma aÃ§Ã£o autorizada e explÃ­cita. |
| Run anterior autorizou envio | NÃ£o autoriza este Run. |
| UsuÃ¡rio costuma dizer sim | NÃ£o preenche `confirm`. |
| Dois produtos mencionados | Conflito. NÃ£o escolher em silÃªncio. |
| "Ontem" sem data no contexto | AusÃªncia ou incerteza. Perguntar ou nÃ£o executar a consulta. |
| Draft invÃ¡lido | A Attempt do modelo pode estar `executed`. O Run falha na validaÃ§Ã£o. O texto do modelo nÃ£o vira fato autorizado. |
| `unknown` numa chamada | Item: efeito desconhecido. NÃ£o autoriza repetir nem concluir. |

---

## 15. Architectural Risks

- Um ContextManager que leia, grave, chame modelo e aprove.
- Contexto global mutÃ¡vel entre Runs.
- Estado da tela tratado como estado do core.
- MemÃ³ria usada como aprovaÃ§Ã£o.
- Gravar contexto sozinho, sem retenÃ§Ã£o explÃ­cita.
- Mandar a conversa inteira em toda chamada.
- Item sem origem.
- Leitura antiga usada como presente.
- "Ãšltimo clicado" como `allow`.
- O modelo decidir sozinho quais arquivos abrir.
- Contexto virar banco genÃ©rico.
- RAG, registry ou engine antes de existir uma segunda fonte alÃ©m do arquivo do experimento.

---

## 16. Open Questions

- A compreensÃ£o da intenÃ§Ã£o deve passar a ver itens jÃ¡ confirmados, ou sÃ³ a frase e os esclarecimentos, como hoje.
- Qual Ã© o escopo mÃ­nimo alÃ©m do Run: a conversa, a sessÃ£o, ou os dois.
- Quando uma leitura de arquivo deixa de valer.
- Se "isso" inferido precisa de confirmaÃ§Ã£o antes de entrar numa proposta irreversÃ­vel.
- O que nunca pode ser item enviado a um provedor, alÃ©m do que a polÃ­tica jÃ¡ exige para a chamada.

Nenhuma dessas perguntas autoriza implementaÃ§Ã£o agora.

---

## 17. Proposed Invariants

1. Contexto nÃ£o Ã© autorizaÃ§Ã£o.
2. MemÃ³ria nÃ£o Ã© autorizaÃ§Ã£o.
3. Acesso nÃ£o Ã© consentimento.
4. SeleÃ§Ã£o nÃ£o Ã© autorizaÃ§Ã£o.
5. InformaÃ§Ã£o disponÃ­vel nÃ£o Ã©, por isso, relevante.
6. HistÃ³rico completo nÃ£o Ã© o contexto atual.
7. InteraÃ§Ã£o pode mudar contexto sem executar aÃ§Ã£o.
8. Contexto de tarefa Ã© temporÃ¡rio.
9. PersistÃªncia Ã© retenÃ§Ã£o explÃ­cita, e nÃ£o existe nesta stage.
10. Contexto incorreto pode ser corrigido por uma atualizaÃ§Ã£o, nÃ£o por um efeito escondido.
11. Escopos diferentes nÃ£o se misturam em silÃªncio.
12. AusÃªncia e incerteza sÃ£o representÃ¡veis.
13. Efeito consequencial continua em Attempt, polÃ­tica, aprovaÃ§Ã£o e Permit.
14. ConteÃºdo externo continua nÃ£o confiÃ¡vel como instruÃ§Ã£o.
15. O core nÃ£o ganha filesystem, Anthropic, Markdown nem UI para carregar contexto.

---

## 18. Implementation Boundary

Nada disto vira cÃ³digo nesta stage.

Quando houver uma segunda fonte de contexto alÃ©m do arquivo do experimento, a menor implementaÃ§Ã£o Ã©: itens com origem, escopo e estado, usados na compreensÃ£o ou na proposta, sem Permit. Obter o conteÃºdo continua sendo Attempt.

AtÃ© lÃ¡, `TaskContext` permanece o contexto do Experimento 01. NÃ£o Ã© o contexto do J.A.R.V.I.S.

**ClassificaÃ§Ã£o: B.**

O limite com a autoridade estÃ¡ claro e basta para nÃ£o construir a interface nem a memÃ³ria como cÃ©rebro do sistema. Ainda nÃ£o hÃ¡ regra fechada de relevÃ¢ncia nem de escopo alÃ©m do Run. Isso impede tratar este documento como ordem para implementar um subsistema de contexto.
