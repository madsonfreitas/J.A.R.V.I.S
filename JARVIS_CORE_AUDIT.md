# J.A.R.V.I.S. â€” Core Architectural Audit

**Etapa:** 17 â€” Auditoria arquitetural do nÃºcleo
**Base de cÃ³digo:** commit `7145ea3f249156c02388c72bb88233bcb064f0a3`
**Mensagem:** `refactor(core): separate JARVIS cycle from documentary experiment`
**Natureza:** auditoria somente leitura. Nenhum cÃ³digo foi alterado por este documento.

---

## 1. Objetivo

Determinar se `src/cycle/` Ã©, no cÃ³digo atual, um nÃºcleo independente e generalizÃ¡vel do J.A.R.V.I.S., ou se ainda carrega conceitos, responsabilidades, contratos ou decisÃµes do Experimento 01 (documentos â†’ artefato).

A pergunta nÃ£o Ã© se a pasta estÃ¡ organizada. A pergunta Ã© se o que ela contÃ©m governa o ciclo, sem se tornar o domÃ­nio documental e sem fingir uma plataforma que ainda nÃ£o tem segundo consumidor.

---

## 2. Estado atual

O repositÃ³rio, nesse commit, separa pastas:

| Caminho | O que contÃ©m de fato |
|---|---|
| `src/cycle/` | TrÃªs mÃ³dulos de tipos: contratos, porto de compreensÃ£o, contrato de interaÃ§Ã£o. NÃ£o hÃ¡ orquestrador, validador, polÃ­tica nem executor. |
| `src/documentary/` | O fluxo executÃ¡vel do Experimento 01: runner, polÃ­tica de arquivos, leitura, contexto textual, rascunho, validaÃ§Ã£o de proveniÃªncia, renderer Markdown, coleta `--source`. |
| `src/intelligence/` | Um adaptador Anthropic que implementa o porto **documental**, nÃ£o o porto do ciclo. |
| `src/observability/` | SQLite local de runs e eventos. Depende sÃ³ de `TaskStatus`. |
| `src/interface/` | Readline. Implementa a interaÃ§Ã£o documental (prÃ©via Markdown e path). Reexporta `collectInput` do pacote documental. |
| `src/index.ts` | Composition root exclusivo do Experimento 01. |
| `src/config.ts` | ConfiguraÃ§Ã£o de processo. Inclui limites de bytes e caracteres de fonte, que pertencem ao experimento documental. |

`src/cycle/` nÃ£o importa `src/documentary/`, filesystem, SQLite, Anthropic nem readline. Nesse sentido a pasta Ã© uma folha.

O comportamento do ciclo â€” intenÃ§Ã£o, esclarecimento, aprovaÃ§Ã£o, leitura, formulaÃ§Ã£o, validaÃ§Ã£o, criaÃ§Ã£o â€” estÃ¡ em `src/documentary/runner.ts`. A Etapa 16 extraiu vocabulÃ¡rio. NÃ£o extraiu um nÃºcleo comportamental, e o plano daquela etapa proibia um motor genÃ©rico.

ConsequÃªncia: chamar `src/cycle/` de â€œo nÃºcleo do J.A.R.V.I.S.â€ descreve uma fronteira de tipos. NÃ£o descreve o sistema que roda.

---

## 3. Fronteira do Core

### 3.1 Arquivos que realmente pertencem ao core, hoje

Somente:

- `src/cycle/contracts.ts`
- `src/cycle/intelligence-port.ts`
- `src/cycle/interaction.ts`

Eles representam vocabulÃ¡rio compartilhado: estado, objetivo mÃ­nimo, proposta de aÃ§Ã£o, decisÃ£o de polÃ­tica, cancelamento, compreensÃ£o de intenÃ§Ã£o, pergunta e confirmaÃ§Ã£o.

NÃ£o pertencem ao core, apesar de participarem do ciclo em execuÃ§Ã£o:

- `src/documentary/runner.ts` â€” Ã© o ciclo comportamental do Experimento 01
- `src/documentary/policy.ts` â€” regras de arquivo
- `src/documentary/context.ts`, `files.ts`, `validator.ts`, `renderer.ts`
- `src/intelligence/anthropic-intelligence.ts`
- `src/observability/run-recorder.ts`
- `src/interface/cli.ts`
- `src/index.ts`
- `src/config.ts`

### 3.2 DependÃªncias do core

Diretas: TypeScript e a classe `Error`. Nenhuma biblioteca de IO, modelo ou persistÃªncia.

Indiretas: nenhuma. Nenhum mÃ³dulo de `src/cycle/` importa outro pacote do projeto.

Quem depende do core:

- o pacote documental, para status, objetivo base, proposta, decisÃ£o e cancelamento
- `RunRecorder`, apenas para `TaskStatus`
- `CliInteraction`, apenas para `TaskStatus` e, via `CycleInteraction`, para perguntar e confirmar

A direÃ§Ã£o da dependÃªncia estÃ¡ correta: domÃ­nio, interface e observabilidade apontam para o vocabulÃ¡rio. O vocabulÃ¡rio nÃ£o aponta de volta.

### 3.3 DependÃªncia de conceitos documentais

NÃ£o hÃ¡ import de tipos documentais dentro de `src/cycle/`.

NÃ£o aparecem, nessa pasta: `DraftArtifact`, `requiredSections`, `sourcePaths`, `.md`, `FileCapabilities`, seÃ§Ãµes, proveniÃªncia, audiÃªncia.

Vazamento residual de vocabulÃ¡rio, nÃ£o de domÃ­nio documental:

- `ExperimentCancelledError` nomeia â€œexperimentoâ€, nÃ£o â€œtarefaâ€ nem â€œcicloâ€. Ã‰ resÃ­duo do banco de ensaio, nÃ£o de documentos.
- `ActionProposal.destination` Ã© um slot opaco. No Experimento 01 carrega path ou rÃ³tulo de modelo. O tipo em si nÃ£o Ã© um path.

### 3.4 DependÃªncia de infraestrutura

O core de tipos nÃ£o depende de infraestrutura.

A infraestrutura depende de um tipo do core (`TaskStatus`). Isso Ã© aceitÃ¡vel.

`src/config.ts` mistura infra (chave, modelo, diretÃ³rio de dados) com limites do Experimento 01 (`JARVIS_MAX_SOURCE_BYTES`, `JARVIS_MAX_TOTAL_CHARS`). Isso nÃ£o contamina `src/cycle/`. Contamina a configuraÃ§Ã£o da aplicaÃ§Ã£o, que hoje Ã© sÃ³ o Experimento 01.

### 3.5 DependÃªncia de interface

O core define `CycleInteraction` e nÃ£o conhece readline, Markdown nem path de saÃ­da.

A interface concreta conhece o pacote documental: `CliInteraction` implementa `DocumentaryInteraction` e reexporta `collectInput`. A CLI nÃ£o Ã© um nÃºcleo de interaÃ§Ã£o reutilizÃ¡vel. Ã‰ a CLI do Experimento 01 com trÃªs mÃ©todos herdados do ciclo.

### 3.6 Vazamentos de domÃ­nio para dentro do core

NÃ£o hÃ¡ vazamento documental estrutural em `src/cycle/`.

HÃ¡ um vazamento de **responsabilidade** fora da pasta: o ciclo que o usuÃ¡rio atravessa continua sendo documental. Quem ler sÃ³ `src/cycle/` nÃ£o encontra contexto, validaÃ§Ã£o, efeito confirmado nem resultado. Quem executar o programa encontra tudo isso preso a fontes e a um arquivo `.md`.

Isso nÃ£o Ã© contaminaÃ§Ã£o do arquivo de contratos. Ã‰ uma fronteira incompleta: o nome â€œcycleâ€ promete o ciclo; o cÃ³digo entrega um vocabulÃ¡rio.

---

## 4. Responsabilidades

### `TaskStatus`

**ClassificaÃ§Ã£o:** Core J.A.R.V.I.S.

Motivo: a sequÃªncia recebida â†’ compreensÃ£o â†’ esclarecimento â†’ objetivo confirmado â†’ contexto â†’ aprovaÃ§Ã£o â†’ execuÃ§Ã£o â†’ validaÃ§Ã£o â†’ conclusÃ£o, reserva, rejeiÃ§Ã£o, cancelamento ou falha atravessa documentos e planejamento. Nenhum estado nomeia arquivo, seÃ§Ã£o ou agenda.

Risco: `building_context` e `executing` aparecem mais de uma vez no runner documental. O tipo nÃ£o impede reentrada. Isso Ã© aceitÃ¡vel neste momento.

### `Clarification`

**ClassificaÃ§Ã£o:** Core J.A.R.V.I.S.

Motivo: pergunta e resposta sÃ£o o mecanismo de incerteza material, independente do domÃ­nio.

### `Goal` (summary, purpose, constraints, questions)

**ClassificaÃ§Ã£o:** Core J.A.R.V.I.S., ainda incompleto.

Motivo: os dois domÃ­nios de contraste precisam de um objetivo confirmÃ¡vel, com restriÃ§Ãµes e perguntas. AudiÃªncia e seÃ§Ãµes ficaram corretamente em `DocumentaryGoal`.

Incompleto: nÃ£o hÃ¡ critÃ©rio de conclusÃ£o explÃ­cito. No experimento documental ele vazou para `requiredSections`. No planejamento ele seria â€œplano sem sobreposiÃ§Ã£o, com a prioridade reservadaâ€. Hoje isso teria de caber em `constraints` ou num campo do pacote. Ainda nÃ£o hÃ¡ evidÃªncia para um campo novo no core.

### `ActionProposal`

**ClassificaÃ§Ã£o:** Core J.A.R.V.I.S. como forma; **ainda incerto** como semÃ¢ntica de `capability`.

Motivo: capacidade nomeada, recurso, destino opcional, efeito descrito e reversibilidade servem a â€œler arquivoâ€ e a â€œpropor um planoâ€ sem citar documento.

`capability: string` nÃ£o Ã© um catÃ¡logo. TambÃ©m nÃ£o Ã© um contrato que o core saiba interpretar. Ã‰ um rÃ³tulo que sÃ³ o pacote documental entende. Promover isso a sistema de capacidades seria abstraÃ§Ã£o prematura. DeixÃ¡-lo como string opaca Ã© o menor contrato honesto.

### `PolicyOutcome` e `PolicyDecision`

**ClassificaÃ§Ã£o:** Core J.A.R.V.I.S. como vocabulÃ¡rio de decisÃ£o. NÃ£o Ã© o guardiÃ£o.

Motivo: `allow`, `require_approval` e `deny`, com motivo e a proposta original, sÃ£o transversais.

O core nÃ£o avalia nada. Quem avalia Ã© `ExperimentPolicy`, classificada como **Capability/Domain**.

### `ExperimentCancelledError`

**ClassificaÃ§Ã£o:** Core J.A.R.V.I.S. na funÃ§Ã£o; resÃ­duo de nomenclatura do experimento.

Motivo: cancelamento pelo usuÃ¡rio Ã© transversal. O nome â€œExperimentâ€ nÃ£o deveria definir o conceito permanente. NÃ£o justifica renomear agora.

### `CycleIntelligencePort.understandIntent`

**ClassificaÃ§Ã£o:** Core J.A.R.V.I.S. como fronteira de proposta.

Motivo: receber intenÃ§Ã£o e esclarecimentos e devolver um `Goal` Ã© compreensÃ£o, nÃ£o execuÃ§Ã£o.

Limite: o processo em execuÃ§Ã£o nÃ£o usa esse porto. Usa `DocumentaryIntelligencePort`, que devolve `DocumentaryGoal` e tambÃ©m formula rascunho. A fronteira de core existe como tipo e nÃ£o como caminho de produÃ§Ã£o.

### `CycleInteraction`

**ClassificaÃ§Ã£o:** Core J.A.R.V.I.S. para status, pergunta e confirmaÃ§Ã£o.

Motivo: os dois domÃ­nios precisam disso. PrÃ©via Markdown e pedido de path ficaram em `DocumentaryInteraction`. Correto.

### O que nÃ£o estÃ¡ no core e nÃ£o deve ser puxado para lÃ¡ agora

| Responsabilidade | Onde estÃ¡ | ClassificaÃ§Ã£o |
|---|---|---|
| Orquestrar o fluxo | `documentary/runner.ts` | Capability/Domain, com comportamento de ciclo embutido |
| Ler e criar arquivo | `documentary/files.ts` | Capability/Domain |
| Contexto textual | `documentary/context.ts` | Capability/Domain |
| Validar seÃ§Ãµes e proveniÃªncia | `documentary/validator.ts` | Capability/Domain |
| Renderizar Markdown | `documentary/renderer.ts` | Capability/Domain |
| Chamar o modelo | `intelligence/anthropic-intelligence.ts` | Infrastructure, com prompt de domÃ­nio documental |
| Gravar run | `observability/run-recorder.ts` | Observability |
| Terminal | `interface/cli.ts` | Interface, acoplada ao Experimento 01 |
| Ligar as peÃ§as | `index.ts` | Composition root do Experimento 01, nÃ£o core |

---

## 5. Contratos

### `TaskStatus`

- **Problema:** nomear a posiÃ§Ã£o da tarefa.
- **GenÃ©rico:** sim, no conjunto atual.
- **DomÃ­nio especÃ­fico:** nÃ£o.
- **Mistura:** nÃ£o mistura autorizaÃ§Ã£o com resultado. ConclusÃ£o com reservas Ã© um estado de resultado, o que Ã© adequado.
- **Cedo demais / concreto demais:** concreto o suficiente. NÃ£o lista estados especulativos de mandato fÃ­sico ou memÃ³ria.
- **Permanecer:** sim.
- **RevisÃ£o futura:** sÃ³ se um segundo fluxo precisar de um estado que nÃ£o caiba aqui. NÃ£o antecipar.

### `Clarification`

- **Problema:** registrar incerteza resolvida com o usuÃ¡rio.
- **GenÃ©rico:** sim.
- **Permanecer:** sim.
- **RevisÃ£o futura:** nenhuma evidÃªncia para mais campos.

### `Goal`

- **Problema:** tornar a intenÃ§Ã£o avaliÃ¡vel.
- **GenÃ©rico:** sim, na forma atual.
- **DomÃ­nio especÃ­fico:** nÃ£o. A especializaÃ§Ã£o documental estÃ¡ em `DocumentaryGoal`.
- **Mistura:** `questions` mistura compreensÃ£o com o prÃ³ximo passo de interaÃ§Ã£o. Isso Ã© Ãºtil e ainda pequeno.
- **Cedo demais:** nÃ£o. **Concreto demais:** um pouco, se `summary` e `purpose` forem tratados como texto de artefato. Como condiÃ§Ã£o de trabalho, cabem.
- **Permanecer:** sim.
- **RevisÃ£o futura:** critÃ©rio de conclusÃ£o explÃ­cito. Sem segundo domÃ­nio implementado, acrescentar o campo agora seria previsÃ£o.

### `ActionProposal`

- **Problema:** descrever uma aÃ§Ã£o material antes da autoridade decidir.
- **GenÃ©rico:** na forma.
- **DomÃ­nio especÃ­fico:** nÃ£o no tipo. Os trÃªs nomes reais (`read_source`, `send_sources_to_model`, `create_artifact`) vivem no pacote documental.
- **Mistura:** junta capacidade, recurso, destino, efeito e reversibilidade. SÃ£o facetas da mesma proposta, nÃ£o execuÃ§Ã£o.
- **Cedo demais:** `capability: string` pode parecer um barramento. NÃ£o Ã©, enquanto ninguÃ©m despachar por reflexÃ£o.
- **Concreto demais:** `destination: string | null` assume um destino textual. Um plano pode nÃ£o ter destino. O campo opcional aguenta isso.
- **Permanecer:** sim, como proposta opaca.
- **RevisÃ£o futura:** nÃ£o criar enum universal de capacidades.

### `PolicyDecision`

- **Problema:** registrar permitir, exigir aprovaÃ§Ã£o ou negar, com motivo.
- **GenÃ©rico:** sim.
- **Mistura:** carrega a `ActionProposal` inteira. NÃ£o Ã© execuÃ§Ã£o. TambÃ©m nÃ£o Ã© consentimento: `require_approval` nÃ£o concede a aprovaÃ§Ã£o.
- **Permanecer:** sim.
- **RevisÃ£o futura:** o core nÃ£o impÃµe que `deny` impeÃ§a a execuÃ§Ã£o nem que `require_approval` exija `confirm`. Isso Ã© lacuna de uso, nÃ£o de tipo. Ver seÃ§Ã£o 7.

### `ExperimentCancelledError`

- **Problema:** interromper sem tratar cancelamento como falha tÃ©cnica.
- **GenÃ©rico:** na funÃ§Ã£o.
- **Permanecer:** sim, atÃ© haver motivo real para renomear.
- **RevisÃ£o futura:** o nome.

### `UnderstandIntentRequest` e `CycleIntelligencePort`

- **Problema:** pedir uma proposta de objetivo sem dar ao modelo efeito colateral.
- **GenÃ©rico:** sim.
- **Mistura:** nÃ£o inclui contexto de fontes. A compreensÃ£o atual ocorre antes da leitura, sÃ³ com a intenÃ§Ã£o. Isso Ã© uma decisÃ£o do runner documental, nÃ£o do porto.
- **Cedo demais:** o porto nÃ£o Ã© o caminho de produÃ§Ã£o. Existe para marcar a fronteira. Um Ãºnico consumidor real do mÃ©todo, no processo, Ã© o porto documental que o estende.
- **Permanecer:** sim, como fronteira mÃ­nima.
- **RevisÃ£o futura:** nÃ£o acrescentar `createDraft` aqui.

### `CycleInteraction`

- **Problema:** mediar status, pergunta e confirmaÃ§Ã£o.
- **GenÃ©rico:** sim.
- **NÃ£o contÃ©m:** prÃ©via de artefato nem path. Correto.
- **Permanecer:** sim.

### Contratos que parecem de core e nÃ£o sÃ£o

EstÃ£o em `src/documentary/contracts.ts` e devem continuar fora:

- `DocumentaryGoal.requiredSections` e `audience`
- `SourceDescriptor`, `TaskContext`
- `DraftArtifact` e tipos de fato, inferÃªncia, lacuna
- `ValidationMetrics` de seÃ§Ãµes e citaÃ§Ãµes
- `ExperimentInput.sourcePaths`
- `ExperimentResult.outputPath`
- `DocumentaryInteraction.showPreview` e `requestOutputPath`

`ValidationReport.status` (`valid`, `valid_with_reservations`, `invalid`) Ã© conceitualmente transversal, mas o relatÃ³rio carrega mÃ©tricas documentais. NÃ£o deve subir ao core enquanto o Ãºnico relatÃ³rio for esse.

NÃ£o existe `UniversalResult`. Correto.

---

## 6. Ciclo comportamental

ComparaÃ§Ã£o com:

```text
INTENÃ‡ÃƒO
â†’ COMPREENSÃƒO
â†’ CONTEXTO
â†’ PLANEJAMENTO
â†’ CAPACIDADES
â†’ POLÃTICAS/PERMISSÃ•ES
â†’ EXECUÃ‡ÃƒO
â†’ VALIDAÃ‡ÃƒO
â†’ RESULTADO
â†’ MEMÃ“RIA/FEEDBACK
```

| Etapa | Onde estÃ¡ | Grau |
|---|---|---|
| IntenÃ§Ã£o | `ExperimentInput.intention`, `recorder.start`, status `received` | Representada no pacote documental, nÃ£o no core |
| CompreensÃ£o | `understandIntent`, esclarecimento, confirmaÃ§Ã£o de objetivo | Representada no runner. O core sÃ³ tem o porto e o `Goal` |
| Contexto | `TaskContextBuilder` lÃª fontes como `untrusted_content` | Parcial e documental. NÃ£o hÃ¡ tipo de contexto no core |
| Planejamento | NÃ£o hÃ¡ etapa. O runner segue uma sequÃªncia fixa do experimento | Ausente. NÃ£o deve entrar no core agora. Planejar Ã© capacidade, nÃ£o fase obrigatÃ³ria |
| Capacidades | TrÃªs aÃ§Ãµes de arquivo, chamadas direto no runner | Parcial, de domÃ­nio. O core sÃ³ nomeia `capability` |
| PolÃ­ticas/permissÃµes | `ExperimentPolicy` mais `confirm` | Parcial, de domÃ­nio. O core sÃ³ tem a forma da decisÃ£o |
| ExecuÃ§Ã£o | `createArtifact` e a leitura | De domÃ­nio. O core nÃ£o executa |
| ValidaÃ§Ã£o | `ResultValidator` de seÃ§Ãµes e proveniÃªncia | De domÃ­nio. O core nÃ£o tem relatÃ³rio |
| Resultado | `ExperimentResult` com `outputPath` e status | De domÃ­nio, orientado a arquivo quando hÃ¡ sucesso |
| MemÃ³ria/feedback | SQLite de run e eventos | Observabilidade da execuÃ§Ã£o. NÃ£o Ã© memÃ³ria do produto. Feedback de correÃ§Ã£o do usuÃ¡rio nÃ£o volta ao objetivo depois da entrega |

### O que nÃ£o deveria existir no core neste momento

- Planejador obrigatÃ³rio
- MemÃ³ria persistente de preferÃªncias ou aprendizados
- Contexto universal
- Validador universal
- CatÃ¡logo de capacidades
- Resultado universal

A ausÃªncia deles em `src/cycle/` Ã© uma decisÃ£o correta da Etapa 16, nÃ£o uma falha.

### Responsabilidades misturadas

A mistura que permanece nÃ£o estÃ¡ dentro de `src/cycle/`. EstÃ¡ em `ExperimentRunner`, que ao mesmo tempo:

- avanÃ§a estados do ciclo
- exige fontes
- aplica polÃ­tica de arquivo
- pede consentimento
- chama o modelo documental
- valida proveniÃªncia
- grava Markdown
- decide o status final

Isso Ã© o Experimento 01 inteiro. Ã‰ legÃ­timo como pacote. Ã‰ ilegÃ­timo se for reapresentado como nÃºcleo.

---

## 7. InteligÃªncia e autoridade

### 7.1 InteligÃªncia propÃµe; nÃ£o autoriza

No tipo do core, o modelo sÃ³ pode devolver `Goal`. NÃ£o devolve `PolicyDecision`, nÃ£o recebe um executor e nÃ£o vÃª o filesystem.

No caminho que realmente roda:

- `AnthropicIntelligence` implementa `DocumentaryIntelligencePort`
- o prompt pede `audience`, `requiredSections`, fatos, lacunas e `sourceIds`
- a resposta passa por Zod
- o rascunho nÃ£o Ã© escrito pelo SDK como ferramenta
- a escrita ocorre depois, em `FileCapabilities.createArtifact`, com path pedido ao usuÃ¡rio

NÃ£o hÃ¡ tool use, shell nem caminho em que o texto do modelo escolha o arquivo de saÃ­da.

O modelo influencia o conteÃºdo do artefato. NÃ£o escolhe o destino, nÃ£o marca validaÃ§Ã£o e nÃ£o altera a allowlist. Isso preserva a fronteira no Experimento 01.

### 7.2 Caminhos em que a autoridade poderia vazar

1. **Consentimento nÃ£o consulta `deny` no envio.** Em `runner.ts`, a criaÃ§Ã£o verifica `createDecision.outcome === "deny"` antes de pedir confirmaÃ§Ã£o. O envio ao modelo registra a decisÃ£o e pede confirmaÃ§Ã£o sem recusar se o outcome for `deny`. Hoje a polÃ­tica sempre devolve `require_approval` para esse caso, entÃ£o o buraco nÃ£o dispara. A separaÃ§Ã£o â€œpolÃ­tica manda, consentimento nÃ£o anula denyâ€ nÃ£o estÃ¡ garantida pelo fluxo. Isso estÃ¡ no pacote documental, nÃ£o em `src/cycle/`. Ã‰ o achado de autoridade mais concreto do cÃ³digo atual.

2. **`require_approval` nÃ£o Ã© um tipo que obrigue `confirm`.** Qualquer runner futuro pode ignorar o outcome. O core nÃ£o tem guardiÃ£o executÃ¡vel. A disciplina Ã© convenÃ§Ã£o do Experimento 01, e nem lÃ¡ Ã© simÃ©trica.

3. **Objetivo confirmado mesmo com perguntas restantes.** Depois de trÃªs rodadas, o runner segue para a confirmaÃ§Ã£o mesmo que `questions` ainda tenha itens. O modelo nÃ£o ganha execuÃ§Ã£o com isso. Ganha a possibilidade de um objetivo ainda ambÃ­guo ser aceito pelo usuÃ¡rio. Ã‰ limite do experimento, nÃ£o autoridade implÃ­cita de arquivo.

4. **ConteÃºdo da fonte nÃ£o Ã© instruÃ§Ã£o.** O prompt documental diz isso. O core nÃ£o tem onde dizÃª-lo, porque nÃ£o vÃª conteÃºdo. A regra vive no adaptador do experimento. Um segundo domÃ­nio precisarÃ¡ repetir a regra se tambÃ©m enviar conteÃºdo externo. NÃ£o estÃ¡ no nÃºcleo.

5. **NÃ£o hÃ¡ caminho de ferramenta.** NÃ£o foi encontrado uso de tools que executem capacidades a partir do modelo.

### 7.3 Capability, access, authority, consent, policy, execution

| Conceito | Separado no cÃ³digo? |
|---|---|
| Capability | RÃ³tulo string na proposta. As capacidades reais sÃ£o mÃ©todos de `FileCapabilities` e a chamada ao modelo. NÃ£o hÃ¡ tipo â€œcapacidadeâ€. |
| Access | O conjunto de paths autorizados dentro de `ExperimentPolicy`. NÃ£o Ã© um conceito do core. |
| Authority | NÃ£o existe como tipo. EstÃ¡ implÃ­cita na decisÃ£o mais no consentimento. |
| Consent | `CycleInteraction.confirm`. Separado da decisÃ£o. |
| Policy | `PolicyDecision` no core; regras no pacote. |
| Execution | Chamadas diretas no runner depois dos portÃµes. NÃ£o hÃ¡ tipo `Tentativa`. |

A separaÃ§Ã£o conceitual estÃ¡ **parcialmente refletida** na ordem do runner: avaliar, Ã s vezes recusar, pedir confirmaÃ§Ã£o, entÃ£o efetuar.

A mistura real Ã© operacional: polÃ­tica e consentimento sÃ£o passos adjacentes escritos Ã  mÃ£o, e o passo de envio nÃ£o trata `deny`. Acesso estÃ¡ embutido na polÃ­tica de arquivo. ExecuÃ§Ã£o nÃ£o Ã© distinguÃ­vel de â€œefeito observadoâ€ por um contrato do core; `CapabilityEffect` Ã© documental e marca `observed: true` no ato da escrita, sem uma segunda verificaÃ§Ã£o.

---

## 8. GeneralizaÃ§Ã£o

Teste mental. Nenhum dos dois domÃ­nios foi reimplementado aqui.

**A.** Documentos autorizados â†’ artefato rastreÃ¡vel, originais intactos.
**B.** Planejamento de um dia â†’ proposta de plano, calendÃ¡rio somente leitura, sem sobreposiÃ§Ã£o, prioridade reservada, tarefas adiadas explÃ­citas.

### O que poderia permanecer igual

- `TaskStatus`, inclusive reserva, rejeiÃ§Ã£o, cancelamento e falha
- `Clarification` e a ideia de poucas rodadas de pergunta
- `Goal` mÃ­nimo: resumo, finalidade, restriÃ§Ãµes, perguntas
- `ActionProposal` como descriÃ§Ã£o opaca, se o plano nÃ£o for forÃ§ado a ter destino de arquivo
- `PolicyOutcome` / `PolicyDecision`
- `CycleInteraction`: mostrar estado, perguntar, confirmar
- `CycleIntelligencePort.understandIntent` devolvendo sÃ³ o `Goal` mÃ­nimo
- `RunRecorder` como trilha de status e eventos, sem interpretar o domÃ­nio
- A regra: modelo propÃµe, pessoa confirma, polÃ­tica pode negar, efeito sÃ³ depois

### O que precisaria mudar, e por quÃª

| PeÃ§a | Por que muda | Vazamento? |
|---|---|---|
| `DocumentaryGoal.requiredSections` e `audience` | O plano nÃ£o Ã© um documento com seÃ§Ãµes obrigatÃ³rias | Sim, se isso voltasse ao `Goal` do core. Hoje estÃ¡ fora. Correto. |
| `ExperimentRunner` | A sequÃªncia â€œfontes â†’ rascunho â†’ `.md`â€ nÃ£o organiza um dia | Sim. Ã‰ o ciclo comportamental contaminado pelo domÃ­nio. NÃ£o estÃ¡ em `src/cycle/`, mas Ã© o ciclo que existe. |
| `ExperimentPolicy` | Allowlist de arquivo e sufixo `.md` nÃ£o sÃ£o a polÃ­tica â€œagenda somente leitura / nÃ£o mover compromissoâ€ | De domÃ­nio. Correto estar fora. |
| `TaskContext` de textos | Planejamento precisa de compromissos, prazos, estimativas, horÃ¡rio | De domÃ­nio. NÃ£o estÃ¡ no core. |
| `createDraft` / `DraftArtifact` | O efeito proposto Ã© um plano, nÃ£o um rascunho com fatos e `sourceIds` | De domÃ­nio. |
| `ResultValidator` | Viabilidade temporal nÃ£o Ã© proveniÃªncia de seÃ§Ã£o | De domÃ­nio. |
| `ExperimentResult.outputPath` | Sucesso do plano nÃ£o Ã© um path | De domÃ­nio. Se o core passasse a exigir path, seria vazamento. NÃ£o exige. |
| `CliInteraction.requestOutputPath` | A interaÃ§Ã£o do plano nÃ£o pede arquivo novo como definiÃ§Ã£o de sucesso | De domÃ­nio, na interface. |
| Prompt Anthropic | EstÃ¡ escrito para seÃ§Ãµes e fontes | Infraestrutura contaminada pelo experimento, fora do core. |
| `config.ts` limites de fonte | NÃ£o se aplicam a compromissos | ConfiguraÃ§Ã£o do experimento, fora do core. |

Nenhuma mudanÃ§a de domÃ­nio Ã© exigida **dentro** dos tipos atuais de `src/cycle/` para descrever o caso B no nÃ­vel do vocabulÃ¡rio.

A mudanÃ§a seria obrigatÃ³ria no runner, na polÃ­tica, no contexto, no efeito, no validador, no resultado e no prompt. Ou seja: o vocabulÃ¡rio generaliza de forma modesta; o ciclo executÃ¡vel nÃ£o.

Se o Experimento 02 fosse encaixado em `ExperimentRunner` sem um runner prÃ³prio, o core comportamental precisaria mudar por causa do domÃ­nio. Isso confirmaria vazamento. O encaixe ainda nÃ£o foi feito. A tentaÃ§Ã£o Ã© o risco.

---

## 9. AbstraÃ§Ã£o prematura

### AbstraÃ§Ãµes sem segundo consumidor

- `CycleIntelligencePort` separado de `DocumentaryIntelligencePort`. O processo usa sÃ³ o segundo. O primeiro Ã© uma fronteira declarada. Ã‰ pequena e justificada pela Etapa 16. NÃ£o deve crescer.
- `capability: string` sem interpretador no core. Ainda nÃ£o Ã© um framework. Vira prematuro no momento em que alguÃ©m despachar capacidades por nome numa tabela global.
- `ActionProposal.reversible` Ã© carregado e quase nÃ£o decide comportamento. O create-only nÃ£o consulta esse booleano; a polÃ­tica de arquivo decide. O campo antecipa uma distinÃ§Ã£o que o fluxo nÃ£o usa.

### Interfaces genÃ©ricas demais

NÃ£o hÃ¡ `ExperimentPack`, registry, `UniversalResult` nem validador genÃ©rico. A Etapa 16 evitou isso. Deve continuar evitado.

`Goal` nÃ£o estÃ¡ genÃ©rico demais: tem poucos campos e a extensÃ£o documental Ã© explÃ­cita.

### Contratos que preveem o futuro

`PolicyDecision` nÃ£o prevÃª risco, duraÃ§Ã£o nem mandato. Bom.

`TaskStatus` nÃ£o prevÃª monitoramento contÃ­nuo. Bom.

O que prevÃª, de leve, Ã© `reversible` e `destination` como se toda aÃ§Ã£o tivesse essa forma. Dois campos, nÃ£o uma plataforma. TolerÃ¡vel. NÃ£o expandir.

### O extremo oposto: acoplamento que permanece

O ciclo comportamental, a polÃ­tica documental, a formulaÃ§Ã£o e a criaÃ§Ã£o do arquivo continuam no mesmo `ExperimentRunner`. Foi uma escolha explÃ­cita para nÃ£o inventar um motor com um consumidor sÃ³.

Essa escolha estÃ¡ certa como contenÃ§Ã£o. EstÃ¡ errada se a prÃ³xima etapa tratar esse runner como o J.A.R.V.I.S.

`src/intelligence/anthropic-intelligence.ts` tambÃ©m acopla transporte do modelo e prompt do Experimento 01. Ã‰ infra com domÃ­nio dentro. NÃ£o Ã© o core. Ã‰ o prÃ³ximo lugar onde um segundo domÃ­nio seria contaminado se reutilizasse a classe inteira.

`src/interface/cli.ts` acopla primitivas de terminal ao contrato documental. A interface â€œgenÃ©ricaâ€ nÃ£o existe, e nÃ£o precisa existir ainda.

---

## 10. Arquitetura

A fronteira **de pastas** estÃ¡ saudÃ¡vel no Ãºnico ponto que a Etapa 16 prometeu:

```text
src/cycle          vocabulÃ¡rio do ciclo, sem domÃ­nio e sem IO
src/documentary    experimento de documentos, incluindo o fluxo
src/intelligence   adaptador, hoje a serviÃ§o do experimento
src/observability  trilha local
src/interface      terminal do experimento
src/index.ts       liga sÃ³ o Experimento 01
```

A fronteira **de comportamento** nÃ£o estÃ¡ no core. O menor desenho que preserva isso, sem nova arquitetura:

- manter `src/cycle` como vocabulÃ¡rio, nÃ£o como motor
- manter um runner por experimento, atÃ© um segundo runner existir de verdade
- nÃ£o extrair orquestrador compartilhado nesta etapa
- nÃ£o mover `ValidationReport` nem `ExperimentResult` para o core sÃ³ porque â€œparecemâ€ transversais: as mÃ©tricas e o `outputPath` nÃ£o sÃ£o
- nÃ£o fundir o adaptador Anthropic num porto de â€œformular qualquer coisaâ€

Isso Ã© menor do que a proposta de oito componentes executÃ¡veis. Aqueles oito continuam como mapa conceitual. No cÃ³digo, sÃ³ o vocabulÃ¡rio de alguns deles virou pasta. O resto vive dentro do experimento. ForÃ§ar os oito agora recriaria a abstraÃ§Ã£o que a Etapa 16 recusou.

ConfiguraÃ§Ã£o: `maxSourceBytes` e `maxTotalCharacters` sÃ£o do experimento. Podem permanecer em `config.ts` enquanto a aplicaÃ§Ã£o for um Ãºnico executÃ¡vel do Experimento 01. NÃ£o sÃ£o nÃºcleo.

---

## 11. Aprendizados

### Fatos observados

- O vertical slice do Experimento 01 atravessou intenÃ§Ã£o, compreensÃ£o, contexto, polÃ­tica, execuÃ§Ã£o, validaÃ§Ã£o e resultado de arquivo, com testes cobrindo polÃ­tica, create-only, cancelamento, overwrite e proveniÃªncia.
- A Etapa 15 mostrou que esse fluxo, quando estava nos contratos centrais, nÃ£o servia a outro domÃ­nio sem distorÃ§Ã£o.
- A Etapa 16 moveu tipos documentais para `src/documentary` e deixou `src/cycle` sem imports de domÃ­nio, IO ou modelo.
- O runner executÃ¡vel nÃ£o saiu do pacote documental.
- O adaptador de produÃ§Ã£o implementa o porto documental e pede seÃ§Ãµes e `sourceIds`.
- O core nÃ£o contÃ©m contexto, validaÃ§Ã£o, efeito nem resultado.
- NÃ£o hÃ¡ memÃ³ria de produto, web, MCP, plugins nem segundo experimento.
- O commit `7145ea3` Ã© a raiz do histÃ³rico local. Working tree limpo no inÃ­cio desta auditoria.

### HipÃ³teses

- `Goal` mÃ­nimo basta para um segundo domÃ­nio descrever objetivo, atÃ© se medir o contrÃ¡rio.
- Um segundo runner, especÃ­fico de planejamento, revelarÃ¡ melhor o que Ã© ciclo do que uma extraÃ§Ã£o especulativa do `ExperimentRunner`.
- `valid` / `valid_with_reservations` / `invalid` provavelmente servem ao plano, mas o relatÃ³rio atual nÃ£o deve subir ao core junto com as mÃ©tricas de seÃ§Ã£o.
- TrÃªs rodadas de esclarecimento sÃ£o parÃ¢metro do experimento, nÃ£o invariante.

### DecisÃµes jÃ¡ tomadas que esta auditoria nÃ£o reabre

- MonÃ³lito modular, um modelo atrÃ¡s de adaptador, SQLite local, CLI supervisionada.
- Sem memÃ³ria persistente de produto.
- Sem execuÃ§Ã£o de cÃ³digo nÃ£o confiÃ¡vel.
- Experimento 01 nÃ£o Ã© a identidade do J.A.R.V.I.S.
- NÃ£o criar motor genÃ©rico, catÃ¡logo de capacidades nem resultado universal na extraÃ§Ã£o da Etapa 16.

### Riscos

- Tratar `src/cycle` como se jÃ¡ orquestrasse o J.A.R.V.I.S.
- Copiar `ExperimentRunner` para o planejamento e levar junto seÃ§Ãµes, path e a falha de ignorar `deny` no envio.
- â€œGeneralizarâ€ o runner Ãºnico atÃ© ele aceitar os dois domÃ­nios por campos opcionais.
- Subir `ValidationReport` ou `outputPath` ao core para parecer completo.
- Reutilizar `AnthropicIntelligence` inteira no segundo domÃ­nio e herdar o prompt documental.
- Criar registry de `capability` porque o campo jÃ¡ Ã© `string`.

### QuestÃµes ainda abertas

Registradas na seÃ§Ã£o 12.

---

## 12. QuestÃµes abertas

1. O nÃºcleo comportamental deve continuar duplicado em cada experimento atÃ© o segundo runner existir, ou hÃ¡ um conjunto mÃ­nimo de passos (status, esclarecer, confirmar, parar em `deny`) que jÃ¡ merece funÃ§Ã£o compartilhada sem virar motor?
2. `Goal` precisa de critÃ©rio de conclusÃ£o, ou restriÃ§Ãµes bastam?
3. CompreensÃ£o deve receber contexto autorizado ou sÃ³ a intenÃ§Ã£o, como hoje?
4. `require_approval` deve ser impossÃ­vel de ignorar, ou a disciplina fica em cada runner atÃ© haver dois exemplos?
5. O relatÃ³rio de validaÃ§Ã£o sem mÃ©tricas documentais Ã© contrato de core ou sÃ³ uma convenÃ§Ã£o de status?
6. O adaptador Anthropic deve se partir em transporte compartilhado e prompts por experimento antes do Experimento 02, ou sÃ³ quando o segundo prompt existir?
7. PersistÃªncia do plano em arquivo reintroduziria `outputPath` como definiÃ§Ã£o de sucesso. Isso continua fora do core?
8. `reversible` justifica permanecer se nenhum fluxo o consulta?

Nenhuma dessas perguntas fica respondida por esta auditoria. RespondÃª-las com cÃ³digo agora seria a abstraÃ§Ã£o prematura.

---

## 13. RecomendaÃ§Ã£o

**ClassificaÃ§Ã£o: B.**

O core em `src/cycle/` estÃ¡ conceitualmente na direÃ§Ã£o certa e **nÃ£o** estÃ¡ contaminado por documentos no sentido da Etapa 15. TambÃ©m **nÃ£o** estÃ¡ sÃ³lido o bastante para iniciar o Experimento 02 como se jÃ¡ existisse um nÃºcleo executÃ¡vel reutilizÃ¡vel.

NÃ£o Ã© C: uma nova refatoraÃ§Ã£o estrutural do core, agora, repetiria a extraÃ§Ã£o sem um segundo consumidor e tenderia a inventar o motor que foi explicitamente adiado.

NÃ£o Ã© A: o ciclo que roda ainda Ã© o runner documental. ReutilizÃ¡-lo como J.A.R.V.I.S. recontaminaria o desenho.

NÃ£o Ã© D no sentido de desfazer `src/cycle`. A separaÃ§Ã£o de vocabulÃ¡rio jÃ¡ se pagou. O excesso a evitar Ã© o prÃ³ximo passo, nÃ£o este commit.

Antes do Experimento 02, os ajustes sÃ£o pequenos e nÃ£o sÃ£o uma nova arquitetura:

1. Tratar `src/cycle` como vocabulÃ¡rio compartilhado, nÃ£o como orquestrador.
2. NÃ£o mover o `ExperimentRunner` para o core.
3. Corrigir, no pacote documental, o envio ao modelo para honrar `deny` como a criaÃ§Ã£o jÃ¡ honra â€” Ã© uma falha de autoridade no Ãºnico fluxo existente, pequena e local.
4. NÃ£o reutilizar a classe Anthropic inteira como se o prompt documental fosse o porto do ciclo.
5. Especificar o planejamento como outro pacote, com runner prÃ³prio, reusando sÃ³ o que a seÃ§Ã£o 8 marcou como estÃ¡vel.

O Experimento 02 nÃ£o deve comeÃ§ar dentro desta auditoria. O core nÃ£o deve ser â€œcompletadoâ€ para recebÃª-lo.
