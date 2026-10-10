# J.A.R.V.I.S. â€” Core Execution Model

**Etapa:** 18 â€” Modelo de execuÃ§Ã£o do core
**Base:** `JARVIS_CORE_AUDIT.md` e o cÃ³digo em `src/documentary/runner.ts`
**Commit de referÃªncia:** `7145ea3f249156c02388c72bb88233bcb064f0a3`
**Natureza:** desenho. Nenhum contrato foi alterado. Nenhum cÃ³digo foi refatorado.

---

## 1. Objetivo

Definir como o ciclo executÃ¡vel sai de `src/documentary/runner.ts` sem transformar o core num motor genÃ©rico e sem deixar o domÃ­nio documental dentro dele.

A Etapa 17 mostrou que `src/cycle/` Ã© vocabulÃ¡rio. O fluxo que roda Ã© o runner do Experimento 01. Este documento separa o que nesse fluxo Ã© invariante de execuÃ§Ã£o do que Ã© o roteiro documental.

O nÃºcleo executÃ¡vel proposto nÃ£o Ã© um segundo runner â€œgenÃ©ricoâ€. Ã‰ a regra que nenhuma aÃ§Ã£o material acontece sem decisÃ£o de autoridade, e que `deny` nÃ£o chama a aÃ§Ã£o.

O roteiro do Experimento 01 â€” fontes, objetivo com seÃ§Ãµes, rascunho, validaÃ§Ã£o de proveniÃªncia, Markdown, path â€” permanece documental e chama essa regra.

---

## 2. Fluxo executÃ¡vel atual

O runner nÃ£o segue a sequÃªncia conceitual limpa. A ordem real Ã© esta.

```text
INTENÃ‡ÃƒO recebida
â†’ prÃ©-condiÃ§Ã£o documental (intenÃ§Ã£o nÃ£o vazia, ao menos uma fonte)
â†’ INSPEÃ‡ÃƒO de arquivo (existÃªncia, extensÃ£o, tamanho) â€” ainda sem usar o conteÃºdo
â†’ AUTORIDADE de leitura, por fonte
     deny â†’ REJEIÃ‡ÃƒO do run, sem leitura
     allow â†’ segue (a polÃ­tica atual nÃ£o pede aprovaÃ§Ã£o para leitura autorizada)
â†’ AUTORIDADE de envio ao modelo
     a decisÃ£o Ã© registrada
     a confirmaÃ§Ã£o Ã© pedida
     deny NÃƒO encerra o fluxo
     recusa do usuÃ¡rio â†’ CANCELAMENTO
â†’ COMPREENSÃƒO (understandIntent), jÃ¡ sob a aprovaÃ§Ã£o de envio
â†’ CLARIFICAÃ‡ÃƒO, no mÃ¡ximo trÃªs rodadas, se o objetivo ainda tiver perguntas
â†’ CONFIRMAÃ‡ÃƒO DO OBJETIVO (aceite humano do objetivo, nÃ£o Ã© decisÃ£o de uma aÃ§Ã£o)
     recusa â†’ CANCELAMENTO
â†’ LEITURA das fontes / EFEITO observado de leitura / contexto textual
â†’ PROPOSTA de rascunho (createDraft)
â†’ VALIDAÃ‡ÃƒO do rascunho contra seÃ§Ãµes e proveniÃªncia
     invalid â†’ FALHA do run, sem arquivo
â†’ PRÃ‰VIA Markdown
â†’ pedido de destino Ã  interface
â†’ AUTORIDADE de criaÃ§Ã£o
     deny â†’ REJEIÃ‡ÃƒO, sem escrita
â†’ APROVAÃ‡ÃƒO de criaÃ§Ã£o
     recusa â†’ CANCELAMENTO
â†’ EXECUÃ‡ÃƒO da criaÃ§Ã£o / EFEITO observado
â†’ RESULTADO completed ou completed_with_reservations
â†’ REGISTRO em cada transiÃ§Ã£o, polÃ­tica, aprovaÃ§Ã£o, validaÃ§Ã£o e efeito
```

ExceÃ§Ãµes fora dessa lista viram `failed`, exceto `ExperimentCancelledError`, que vira `cancelled`.

O que esse fluxo nÃ£o tem:

- etapa de planejamento
- uma proposta de aÃ§Ã£o produzida pelo modelo (quem propÃµe as trÃªs aÃ§Ãµes Ã© o prÃ³prio runner)
- efeito observado distinto da execuÃ§Ã£o: a leitura e a escrita marcam `observed: true` no mesmo passo
- segunda verificaÃ§Ã£o do arquivo depois da escrita
- tratamento de `deny` no envio

ValidaÃ§Ã£o do rascunho ocorre **antes** do efeito persistente. Isso Ã© especÃ­fico do experimento: o arquivo sÃ³ Ã© proposto se o rascunho nÃ£o for `invalid`. NÃ£o Ã© uma lei do core.

---

## 3. Responsabilidades do runner atual

| Responsabilidade no runner | ClassificaÃ§Ã£o |
|---|---|
| Gerar `runId` | Observability |
| `recorder.start` / `record` / `setStatus` / `finish` | Observability |
| `showStatus` junto com a transiÃ§Ã£o | Interaction |
| Rejeitar intenÃ§Ã£o vazia | Core, como prÃ©-condiÃ§Ã£o de run; a mensagem Ã© neutra |
| Rejeitar ausÃªncia de fontes | Documentary-specific |
| `inspect` de path, extensÃ£o e tamanho | Domain/Capability + Infrastructure (filesystem) |
| Deduplicar paths | Documentary-specific |
| Construir `ExperimentPolicy` com as fontes | Authority/Policy, regras documentais |
| Propor `read_source` | Documentary-specific |
| Avaliar leitura e parar em `deny` | Authority/Policy, aplicada pelo runner |
| Propor `send_sources_to_model` | Documentary-specific |
| Registrar a decisÃ£o de envio e pedir `confirm` sem honorar `deny` | Authority/Policy incompleta |
| Tratar recusa de envio como cancelamento | Interaction + Core (cancelamento) |
| `understandIntent` e o loop de perguntas | Intelligence + Interaction |
| Limite de trÃªs rodadas | Documentary-specific; ainda incerto se algum dia serÃ¡ do core |
| Confirmar objetivo mostrando audiÃªncia e seÃ§Ãµes | Interaction + Documentary-specific |
| Ler fontes e montar contexto `untrusted_content` | Domain/Capability |
| Registrar efeito de leitura | Execution + Observability |
| `createDraft` | Intelligence, formulaÃ§Ã£o documental |
| `ResultValidator` | Validation, documental |
| Falhar o run se o rascunho for `invalid` | Documentary-specific; o core sÃ³ precisa saber representar `failed` |
| Renderizar Markdown e mostrar prÃ©via | Documentary-specific + Interface |
| Pedir path de saÃ­da | Interface + Documentary-specific |
| Propor `create_artifact` e parar em `deny` | Authority/Policy, aplicada pelo runner |
| Confirmar criaÃ§Ã£o | Interaction |
| `createArtifact` | Execution + Infrastructure |
| Escolher `completed` ou `completed_with_reservations` | Documentary-specific, a partir da validaÃ§Ã£o de domÃ­nio |
| `catch` de cancelamento versus falha | Core |
| Montar `ExperimentResult` com `outputPath` | Documentary-specific |

Nenhuma dessas linhas, sozinha, justifica uma classe nova. A extraÃ§Ã£o Ãºtil Ã© a repetiÃ§Ã£o jÃ¡ visÃ­vel: propor aÃ§Ã£o, avaliar, Ã s vezes confirmar, sÃ³ entÃ£o efetuar, e registrar. Hoje isso estÃ¡ copiado trÃªs vezes, e a cÃ³pia do envio estÃ¡ errada em relaÃ§Ã£o Ã  cÃ³pia da criaÃ§Ã£o.

---

## 4. Responsabilidades do futuro core

O core executÃ¡vel faz pouca coisa. Cada resposta abaixo Ã© fechada.

**O core deve coordenar o ciclo?**
Coordena sÃ³ o portÃ£o de cada aÃ§Ã£o material: decidir, e somente entÃ£o executar. NÃ£o coordena o roteiro documental (quando compreender, quando validar seÃ§Ãµes, quando pedir path). Esse roteiro continua no pacote do experimento. Coordenar o roteiro no core o obrigaria a conhecer fontes e artefato.

**O core deve decidir autoridade?**
NÃ£o. O core aplica a decisÃ£o que a autoridade devolveu. Quem conhece allowlist, `.md` e â€œnÃ£o sobrescrever fonteâ€ Ã© a polÃ­tica documental. O core nÃ£o contÃ©m essas regras.

**O core deve executar capabilities?**
SÃ³ no sentido de invocar o efeito que o chamador entregou, depois do portÃ£o. NÃ£o escolhe a capability, nÃ£o a procura num catÃ¡logo e nÃ£o sabe o que ela faz.

**O core deve conhecer recursos concretos?**
NÃ£o. `resource` e `destination` permanecem strings opacas na proposta. O core nÃ£o resolve path nem abre arquivo.

**O core deve conhecer documentos?**
NÃ£o.

**O core deve conhecer filesystem?**
NÃ£o.

**O core deve conhecer Anthropic?**
NÃ£o.

**O core deve conhecer Markdown?**
NÃ£o.

**O core deve validar resultados de domÃ­nio?**
NÃ£o. ValidaÃ§Ã£o de seÃ§Ãµes e proveniÃªncia continua no experimento. O core nÃ£o interpreta `invalid`. O experimento Ã© que deixa de pedir a criaÃ§Ã£o quando o rascunho Ã© invÃ¡lido.

**O core deve registrar execuÃ§Ã£o?**
Deve poder emitir os fatos do portÃ£o (decisÃ£o, aprovaÃ§Ã£o, efeito, recusa) por uma funÃ§Ã£o de registro injetada no chamador. NÃ£o deve abrir SQLite nem definir o esquema alÃ©m do que jÃ¡ existe. Observabilidade continua em `src/observability/`.

**O core deve controlar estados?**
Deve oferecer a transiÃ§Ã£o jÃ¡ usada hoje: guardar o status, mostrar ao usuÃ¡rio e registrar, numa funÃ§Ã£o sÃ³. NÃ£o deve decidir sozinho `understanding`, `validating` ou `completed_with_reservations`. Quem conhece o significado documental desses momentos Ã© o roteiro. O core impede execuÃ§Ã£o quando o portÃ£o nÃ£o passou; o status `rejected` ou `cancelled` do run continua sendo o roteiro reagindo ao resultado do portÃ£o, como jÃ¡ faz.

**O core deve lidar com cancelamento e falha?**
Sim, no portÃ£o. Recusa de aprovaÃ§Ã£o exigida nÃ£o executa a aÃ§Ã£o. ExceÃ§Ã£o dentro da aÃ§Ã£o nÃ£o Ã© engolida pelo portÃ£o como sucesso. O `catch` do run, que distingue cancelamento de falha, pode permanecer no roteiro documental na primeira extraÃ§Ã£o, porque ele tambÃ©m monta `ExperimentResult`. O portÃ£o nÃ£o deixa a aÃ§Ã£o acontecer nesses casos.

O que o core nÃ£o faz: escolher a prÃ³xima etapa, formular objetivo, esclarecer, validar domÃ­nio, renderizar, inspecionar arquivo, definir o resultado do experimento.

---

## 5. Fronteiras arquiteturais

Tudo no mesmo processo. Nenhum serviÃ§o, fila ou barramento.

### CORE

- **Responsabilidade:** dado uma proposta e uma aÃ§Ã£o, aplicar autoridade e consentimento exigido, e sÃ³ entÃ£o invocar a aÃ§Ã£o.
- **Entrada:** `ActionProposal`; avaliador de polÃ­tica; confirmaÃ§Ã£o; registro; a aÃ§Ã£o a invocar.
- **SaÃ­da:** executou e devolveu o valor da aÃ§Ã£o, ou negou, ou o usuÃ¡rio recusou. A aÃ§Ã£o nÃ£o Ã© chamada nos dois Ãºltimos.
- **Pode depender de:** tipos jÃ¡ em `src/cycle/contracts.ts`. FunÃ§Ãµes passadas pelo chamador.
- **NÃ£o atravessa:** documento, path, Markdown, modelo, SQL, regra de allowlist, validador de proveniÃªncia.

### DOMAIN / CAPABILITY

- **Responsabilidade:** o roteiro do Experimento 01 e as operaÃ§Ãµes de arquivo, contexto, rascunho, render e validaÃ§Ã£o.
- **Entrada:** intenÃ§Ã£o, fontes, objetivo documental, contexto.
- **SaÃ­da:** rascunho, relatÃ³rio, Markdown, efeito de arquivo, `ExperimentResult`.
- **Pode depender de:** core (para passar no portÃ£o), autoridade documental, inteligÃªncia documental, interaÃ§Ã£o documental, observabilidade.
- **NÃ£o atravessa:** nÃ£o executa leitura, envio ou criaÃ§Ã£o fora do portÃ£o. NÃ£o coloca seÃ§Ãµes de volta em `Goal` do core.

### AUTHORITY

- **Responsabilidade:** transformar uma proposta em `allow`, `require_approval` ou `deny`, com motivo.
- **Entrada:** `ActionProposal` e o que a polÃ­tica precisa saber (no experimento, os paths autorizados).
- **SaÃ­da:** `PolicyDecision`.
- **Pode depender de:** contratos do core. A polÃ­tica documental tambÃ©m depende dos descritores de fonte.
- **NÃ£o atravessa:** nÃ£o lÃª o arquivo para decidir, nÃ£o chama o modelo, nÃ£o escreve o artefato, nÃ£o pergunta ao usuÃ¡rio. Consentimento nÃ£o Ã© autoridade.

### INTELLIGENCE

- **Responsabilidade:** propor objetivo e, no experimento, propor o rascunho.
- **Entrada:** intenÃ§Ã£o, esclarecimentos, objetivo, contexto autorizado.
- **SaÃ­da:** `Goal` ou rascunho. Nunca `PolicyDecision`. Nunca efeito de arquivo.
- **Pode depender de:** contratos. O adaptador Anthropic depende do SDK e do schema documental.
- **NÃ£o atravessa:** nÃ£o autoriza, nÃ£o escolhe o path, nÃ£o marca validaÃ§Ã£o, nÃ£o recebe ferramenta de filesystem.

### INTERACTION

- **Responsabilidade:** mostrar status, perguntar, confirmar. No experimento, tambÃ©m prÃ©via e path.
- **Entrada:** textos e o status jÃ¡ decidido por quem chama.
- **SaÃ­da:** string ou booleano.
- **Pode depender de:** `CycleInteraction`. A CLI depende do contrato documental por causa da prÃ©via e do path.
- **NÃ£o atravessa:** `confirm` true nÃ£o anula `deny`. A interaÃ§Ã£o nÃ£o avalia polÃ­tica.

### OBSERVABILITY

- **Responsabilidade:** persistir run, status e eventos.
- **Entrada:** id, status, tipo de evento, payload opaco.
- **SaÃ­da:** nenhuma decisÃ£o.
- **Pode depender de:** `TaskStatus` e SQLite.
- **NÃ£o atravessa:** nÃ£o interpreta rascunho, nÃ£o bloqueia aÃ§Ã£o, nÃ£o Ã© memÃ³ria do produto.

### INFRASTRUCTURE

- **Responsabilidade:** Node, filesystem, SDK Anthropic, SQLite.
- **Entrada:** o que a capability ou o adaptador pedir.
- **SaÃ­da:** bytes, JSON, linhas gravadas.
- **Pode depender de:** bibliotecas.
- **NÃ£o atravessa:** nÃ£o decide polÃ­tica. `node:path` e `node:fs` nÃ£o entram em `src/cycle/`.

DireÃ§Ã£o permitida:

```text
roteiro documental
  â†’ core.perform
      â†’ autoridade documental
      â†’ interaÃ§Ã£o (sÃ³ se require_approval)
      â†’ aÃ§Ã£o documental
          â†’ filesystem ou modelo
  â†’ observabilidade
```

`src/cycle/` nÃ£o importa `src/documentary/`.

---

## 6. Execution Model

TrÃªs momentos, jÃ¡ nomeados nos contratos, mais o vÃ­nculo que falta.

```text
AÃ‡ÃƒO PROPOSTA     ActionProposal
DECISÃƒO           PolicyDecision
PERMISSÃƒO DE EFEITO
EFEITO            o que a aÃ§Ã£o devolveu, sÃ³ se a permissÃ£o existiu
```

IntenÃ§Ã£o nÃ£o Ã© proposta de aÃ§Ã£o. O modelo formular um rascunho nÃ£o Ã© autorizaÃ§Ã£o. AutorizaÃ§Ã£o nÃ£o Ã© execuÃ§Ã£o. ExecuÃ§Ã£o sem efeito observÃ¡vel nÃ£o Ã© sucesso do objetivo; no experimento atual essa Ãºltima distinÃ§Ã£o ainda Ã© fraca, e o core nÃ£o precisa resolvÃª-la nesta extraÃ§Ã£o.

### O que os contratos atuais cobrem

- `ActionProposal` descreve capacidade, recurso, destino, efeito pretendido e reversibilidade. Serve.
- `PolicyDecision` devolve `allow`, `require_approval` ou `deny` com motivo e a proposta. Serve.
- `CapabilityEffect`, no pacote documental, descreve o que a capability alega ter feito. Serve para o experimento. NÃ£o deve subir ao core sÃ³ para o portÃ£o existir.

### O que falta

Falta o vÃ­nculo entre a decisÃ£o e a chamada. Hoje o runner recebe a `PolicyDecision` e segue no cÃ³digo seguinte. Nada impede chamar `createArtifact` depois de `deny`. No envio, isso jÃ¡ acontece na estrutura: a confirmaÃ§Ã£o nÃ£o olha o outcome.

NÃ£o falta um tipo universal de resultado. Falta uma Ãºnica funÃ§Ã£o de portÃ£o, conceitualmente:

```text
perform(proposta, aÃ§Ã£o):
  decisÃ£o = autoridade(proposta)
  registrar decisÃ£o
  se deny:
      nÃ£o chamar aÃ§Ã£o
      devolver negado
  se require_approval:
      se o usuÃ¡rio nÃ£o confirmar:
          nÃ£o chamar aÃ§Ã£o
          devolver recusado
  chamar aÃ§Ã£o
  registrar o retorno
  devolver executado(retorno)
```

A aÃ§Ã£o Ã© um callback do roteiro documental (`ler esta fonte`, `criar este arquivo`). O core nÃ£o a escolhe. NÃ£o hÃ¡ registro de capabilities. O parÃ¢metro de tipo do retorno evita o core importar `CapabilityEffect`. Isso Ã© uma funÃ§Ã£o, nÃ£o um `UniversalResult`.

`reversible` continua informativo. O portÃ£o nÃ£o decide por ele. A polÃ­tica documental Ã© que impede sobrescrever.

Leitura, envio e criaÃ§Ã£o passam pelo mesmo `perform`. A diferenÃ§a entre elas fica na polÃ­tica e no callback, nÃ£o em trÃªs cÃ³digos de portÃ£o.

ConfirmaÃ§Ã£o do objetivo, perguntas de esclarecimento e prÃ©via nÃ£o passam por `perform`. NÃ£o sÃ£o aÃ§Ãµes materiais sobre recurso. Continuam chamadas diretas de interaÃ§Ã£o no roteiro.

---

## 7. Intelligence / Authority / Execution

Regra que a extraÃ§Ã£o tem de preservar:

```text
Intelligence proposes.
Authority decides.
Execution acts.
```

| Ato | Quem | NÃ£o Ã© |
|---|---|---|
| Interpretar intenÃ§Ã£o | InteligÃªncia, `understandIntent` | AutorizaÃ§Ã£o para ler ou gravar |
| Formular o rascunho | InteligÃªncia, `createDraft` | DecisÃ£o de criar o arquivo |
| Escolher a estratÃ©gia do experimento | O roteiro documental, hoje fixo | Uma escolha do modelo |
| Autorizar | PolÃ­tica, devolvendo `PolicyDecision` | `confirm` sozinho, e nÃ£o o texto do modelo |
| Consentir | UsuÃ¡rio, sÃ³ quando a polÃ­tica exigiu | Capacidade de anular `deny` |
| Executar | Callback dentro de `perform`, depois do portÃ£o | Chamar `files` ao lado do portÃ£o |

O modelo nÃ£o emite `PolicyDecision`. O prompt documental continua no adaptador, fora do core. â€œO modelo devolveu um objetivoâ€ continua a exigir confirmaÃ§Ã£o humana do objetivo, no roteiro, antes da leitura. Essa confirmaÃ§Ã£o nÃ£o substitui o portÃ£o das aÃ§Ãµes.

EstratÃ©gia, neste experimento, nÃ£o Ã© uma etapa do core. O runner jÃ¡ sabe a ordem. LevÃ¡-la para o modelo, ou para um planejador no core, nÃ£o tem evidÃªncia.

---

## 8. Deny / Approval / Cancellation

### Onde `deny` Ã© terminal

`deny` Ã© terminal para aquela proposta. `perform` nÃ£o invoca o callback.

NÃ£o Ã©, por si, terminal para todo run futuro de qualquer domÃ­nio. Quem decide encerrar o Experimento 01 Ã© o roteiro, que jÃ¡ trata `deny` de leitura e de criaÃ§Ã£o como `rejected`. Ele deve tratar o retorno `negado` do portÃ£o do mesmo modo, inclusive no envio.

### Quem impede a execuÃ§Ã£o

O core, porque Ã© o Ãºnico lugar que chama o callback. A capability nÃ£o consulta a polÃ­tica. A polÃ­tica nÃ£o chama a capability. A interaÃ§Ã£o nÃ£o chama a capability.

Se o roteiro chamar `createArtifact` fora de `perform`, o portÃ£o foi contornado. Isso Ã© erro de programaÃ§Ã£o do roteiro, nÃ£o um caso para um sandbox. A primeira implementaÃ§Ã£o nÃ£o coloca um token dentro de `FileCapabilities`. A regra Ã©: efeito material do experimento sÃ³ existe dentro do callback passado a `perform`.

### Core ou capability

`deny` Ã© tratado pelo core no portÃ£o. A capability nÃ£o recebe a aÃ§Ã£o quando a autoridade negou. A polÃ­tica documental Ã© quem produz o `deny` (fonte fora da allowlist, destino Ã© a prÃ³pria fonte, destino nÃ£o Ã© `.md`, capacidade desconhecida).

### AprovaÃ§Ã£o

`require_approval` pede `confirm`. `allow` nÃ£o pede confirmaÃ§Ã£o extra no portÃ£o. Hoje a criaÃ§Ã£o pede confirmaÃ§Ã£o porque a polÃ­tica devolve `require_approval`, nÃ£o porque o runner peÃ§a sempre. O portÃ£o deve seguir o outcome, nÃ£o repetir a assimetria atual.

`confirm` false nÃ£o executa. No Experimento 01 isso continua cancelando o run, como os testes jÃ¡ exigem. NÃ£o vira â€œtente outra aÃ§Ã£oâ€ nesta etapa.

`confirm` true com `deny` nÃ£o executa. Essa Ã© a correÃ§Ã£o arquitetural do buraco do envio. A polÃ­tica atual do envio sempre pede aprovaÃ§Ã£o, entÃ£o os testes atuais nÃ£o cobrem `deny` nesse caminho. O portÃ£o mesmo assim nÃ£o chama a aÃ§Ã£o.

### Cancelamento

Cancelamento Ã© recusa humana de um portÃ£o exigido, ou recusa da confirmaÃ§Ã£o de objetivo no roteiro. NÃ£o Ã© `deny`. `deny` Ã© `rejected` no experimento atual. Os dois nÃ£o devem cair no mesmo status.

---

## 9. Failure Model

| Evento | O que Ã© | Status no Experimento 01 | Quem decide |
|---|---|---|---|
| IntenÃ§Ã£o vazia | PrÃ©-condiÃ§Ã£o do run | `rejected` | Roteiro; pode usar o core sÃ³ para publicar o status |
| `deny` de leitura, envio ou criaÃ§Ã£o | PortÃ£o recusou a aÃ§Ã£o | `rejected` | Core nÃ£o executa; roteiro encerra |
| UsuÃ¡rio recusou aprovaÃ§Ã£o ou objetivo | Consentimento ausente | `cancelled` | Core nÃ£o executa a aÃ§Ã£o; roteiro encerra |
| Modelo ou Zod falha | Falha de inteligÃªncia | `failed` | ExceÃ§Ã£o no roteiro, como hoje |
| PolÃ­tica nÃ£o foi consultada | NÃ£o Ã© um evento vÃ¡lido | â€” | NÃ£o deve existir se a aÃ§Ã£o passa por `perform` |
| Callback lanÃ§a | Falha de execuÃ§Ã£o | `failed` | ExceÃ§Ã£o sobe; efeito nÃ£o Ã© registrado como sucesso |
| Rascunho `invalid` | ValidaÃ§Ã£o de domÃ­nio negativa | `failed` | Roteiro, antes de propor a criaÃ§Ã£o |
| Rascunho com lacunas ou conflitos | ValidaÃ§Ã£o com reserva | `completed_with_reservations` depois da criaÃ§Ã£o | Roteiro |
| Arquivo jÃ¡ existe | Falha de execuÃ§Ã£o na capability | `failed` | A polÃ­tica pode nÃ£o ter visto o arquivo; o `wx` falha. Continua exceÃ§Ã£o, nÃ£o um novo estado |
| Efeito diferente do pedido | Ainda incerto | â€” | O experimento marca `observed: true` ao escrever. NÃ£o hÃ¡ verificador posterior. Fora desta extraÃ§Ã£o |

Estados do ciclo jÃ¡ existentes chegam para isso: `rejected`, `cancelled`, `failed`, `completed`, `completed_with_reservations`. NÃ£o criar estado novo.

`failed` mistura falha de inteligÃªncia, falha de execuÃ§Ã£o e validaÃ§Ã£o documental negativa. Separar isso num tipo de erro rico seria abstraÃ§Ã£o sem segundo consumidor. A mensagem e o evento registrado distinguem o caso. O status permanece `failed`.

ValidaÃ§Ã£o negativa nÃ£o Ã© efeito. Ã‰ o roteiro recusando-se a propor a aÃ§Ã£o de criaÃ§Ã£o.

---

## 10. Documentary como primeira implementaÃ§Ã£o

Forma alvo:

```text
CORE
  perform + transiÃ§Ã£o de status
      â†‘ chama
ROTEIRO DOCUMENTAL
  ordem do Experimento 01
  propostas read / send / create
  compreensÃ£o, clarificaÃ§Ã£o, confirmaÃ§Ã£o de objetivo
  validaÃ§Ã£o e renderer
      â†‘ chama, sÃ³ dentro de perform
CAPABILITY E ADAPTADORES
  files, context, ExperimentPolicy
  AnthropicIntelligence
  ResultValidator, MarkdownRenderer
      â†‘
INFRA
  filesystem, SDK, SQLite, readline
```

NÃ£o Ã©:

```text
CORE
  â†’ DocumentaryRunner genÃ©rico
  â†’ callbacks de â€œqualquer domÃ­nioâ€
```

### O que sai do runner para o core

- A sequÃªncia duplicada: avaliar proposta, registrar, parar em `deny`, confirmar se `require_approval`, sÃ³ entÃ£o efetuar.
- O pareamento status + registro + `showStatus`, como funÃ§Ã£o usada pelo roteiro, sem lista de etapas documentais.

### O que permanece em `src/documentary/runner.ts`

- PrÃ©-condiÃ§Ã£o de fontes.
- InspeÃ§Ã£o e deduplicaÃ§Ã£o.
- Textos de confirmaÃ§Ã£o que citam fontes, seÃ§Ãµes e path.
- Ordem: compreender antes de ler o conteÃºdo, validar antes de criar, pedir path, escolher status final pelas reservas.
- Chamadas a `understandIntent`, `createDraft`, validador e renderer.
- Forma de `ExperimentResult`, inclusive `outputPath`.
- Limite de trÃªs esclarecimentos.
- Montagem das trÃªs `ActionProposal`.

`ExperimentPolicy`, `FileCapabilities`, `TaskContextBuilder`, schemas e o prompt Anthropic nÃ£o se movem.

O runner documental fica mais curto. Continua sendo o roteiro do experimento, nÃ£o um nÃºcleo disfarÃ§ado. Ele deixa de ser o lugar que â€œlembraâ€ de checar `deny`.

---

## 11. Testabilidade

O portÃ£o se testa com falsos no lugar de IO.

- Autoridade falsa que devolve `allow`, `require_approval` ou `deny`.
- ConfirmaÃ§Ã£o falsa que devolve sim ou nÃ£o.
- Registro em memÃ³ria.
- AÃ§Ã£o falsa que incrementa um contador e devolve um valor.

Casos do portÃ£o, sem Anthropic, disco, Markdown, CLI ou SQLite:

- `deny` nÃ£o chama a aÃ§Ã£o.
- `require_approval` com nÃ£o nÃ£o chama a aÃ§Ã£o.
- `require_approval` com sim chama a aÃ§Ã£o uma vez.
- `allow` chama a aÃ§Ã£o sem pedir confirmaÃ§Ã£o.
- `confirm` verdadeiro nÃ£o chama a aÃ§Ã£o se a decisÃ£o foi `deny`.
- ExceÃ§Ã£o da aÃ§Ã£o nÃ£o vira efeito registrado como sucesso.

Os 11 testes atuais continuam sendo o contrato do Experimento 01. Eles usam filesystem temporÃ¡rio e inteligÃªncia falsa, como jÃ¡ fazem. NÃ£o precisam de modelo real. NÃ£o devem ser reescritos para conhecer o portÃ£o, salvo se um import mudar.

Um teste novo do portÃ£o, quando a extraÃ§Ã£o for autorizada, nÃ£o substitui os 11. Cobre o `deny` do envio, que os 11 nÃ£o cobrem.

NÃ£o hÃ¡ teste de â€œworkflow genÃ©ricoâ€.

---

## 12. Riscos de over-engineering

Rejeitados para esta extraÃ§Ã£o:

| Ideia | Por que nÃ£o |
|---|---|
| UniversalRunner | O roteiro documental Ã© o produto do experimento, nÃ£o um plugin do core |
| UniversalResult | `ExperimentResult` com `outputPath` permanece documental. O retorno de `perform` Ã© sÃ³ executou, negou ou recusou |
| CapabilityRegistry | TrÃªs callbacks explÃ­citos no roteiro bastam |
| Plugin system, event bus, fila, microsserviÃ§o, multiagente | Um processo sÃ³ |
| Framework de injeÃ§Ã£o | TrÃªs funÃ§Ãµes passadas a `perform` nÃ£o sÃ£o um container |
| Motor de workflow ou DSL | A ordem do experimento Ã© cÃ³digo normal no roteiro |
| Token de permissÃ£o dentro de `FileCapabilities` | O portÃ£o jÃ¡ nÃ£o chama o callback. Token no filesystem acopla infra ao core sem um segundo bypass observado |
| Planejador no core | Planejamento nÃ£o Ã© etapa deste experimento |
| Mover validaÃ§Ã£o ou Markdown para o core | SÃ£o o domÃ­nio |
| Estado novo para cada tipo de falha | `failed` ainda distingue pela mensagem |

O risco real Ã© o oposto durante a implementaÃ§Ã£o: extrair `perform` e, no mesmo passo, mover compreensÃ£o e validaÃ§Ã£o â€œporque tambÃ©m sÃ£o etapasâ€. Isso recontamina o core. O plano abaixo para antes disso.

`perform` genÃ©rico no tipo de retorno Ã© aceitÃ¡vel sÃ³ como parÃ¢metro da funÃ§Ã£o. Se a implementaÃ§Ã£o comeÃ§ar a inspecionar o valor, a extraÃ§Ã£o falhou.

---

## 13. Plano de extraÃ§Ã£o

Cada passo termina com os 11 testes e o typecheck verdes. Rollback Ã© reverter o passo. Nenhum passo cria o Experimento 02.

### Passo 0 â€” Baseline

- **Arquivos:** nenhum.
- **Responsabilidade:** nenhuma.
- **Risco:** nenhum.
- **Validar:** `npm test`, `npm run typecheck`.
- **Rollback:** nÃ£o hÃ¡ mudanÃ§a.

### Passo 1 â€” PortÃ£o, sem trocar o runner

- **Arquivos:** criar `src/cycle/perform-action.ts`. Teste novo ao lado, com falsos, sem IO.
- **Responsabilidade extraÃ­da:** a regra `deny` e recusa nÃ£o chamam a aÃ§Ã£o; `allow` chama; `require_approval` confirma e entÃ£o chama.
- **Risco:** o arquivo nasce sem consumidor e alguÃ©m o â€œgeneralizaâ€ antes do uso. Manter uma funÃ§Ã£o e os tipos jÃ¡ existentes.
- **Validar:** testes novos do portÃ£o; os 11 seguem intactos porque o runner ainda nÃ£o mudou.
- **Rollback:** apagar o arquivo e o teste.

### Passo 2 â€” Envio, leitura e criaÃ§Ã£o passam pelo portÃ£o

- **Arquivos:** `src/documentary/runner.ts`.
- **Responsabilidade extraÃ­da:** as trÃªs checagens manuais. O runner monta a proposta e o callback; nÃ£o reimplementa `deny`.
- **Risco:** mudanÃ§a de comportamento. A criaÃ§Ã£o que hoje confirma porque a polÃ­tica pede aprovaÃ§Ã£o deve continuar confirmando. A leitura autorizada nÃ£o deve passar a pedir confirmaÃ§Ã£o. O cancelamento no meio do fluxo deve continuar sem arquivo. O buraco do `deny` no envio fecha; os testes atuais nÃ£o devem quebrar, porque esse `deny` nÃ£o ocorre na polÃ­tica vigente.
- **Validar:** os 11 testes, mais um caso de portÃ£o com `deny` no envio se o roteiro passar a usar `perform` tambÃ©m nesse ponto. Typecheck. `src/cycle/` nÃ£o importa `documentary`, `fs`, `sqlite` nem Anthropic.
- **Rollback:** restaurar as trÃªs sequÃªncias no runner e deixar o portÃ£o sem uso, ou reverter o passo inteiro.

### Passo 3 â€” Parar

- NÃ£o mover `understandIntent`, clarificaÃ§Ã£o, validador, renderer, `ExperimentResult` nem polÃ­tica para o core.
- NÃ£o criar pacote de planejamento.
- **Validar:** grep em `src/cycle` pelos termos documentais e de infra jÃ¡ usados na Etapa 17. Os 11 testes. Typecheck.
- **Rollback:** nÃ£o se aplica se o passo nÃ£o edita.

NÃ£o hÃ¡ passo 4 nesta autorizaÃ§Ã£o. Status pareado com o recorder pode esperar atÃ© `perform` estar estÃ¡vel. PuxÃ¡-lo no mesmo passo mistura duas extraÃ§Ãµes.

---

## 14. CritÃ©rios de sucesso

Quando a extraÃ§Ã£o for feita, ela estarÃ¡ concluÃ­da se:

1. `src/cycle/` continua sem importar `src/documentary`.
2. `src/cycle/` nÃ£o importa filesystem, SQLite, Anthropic nem Markdown.
3. Existe um Ãºnico lugar que aplica `PolicyDecision` antes de invocar a aÃ§Ã£o.
4. `deny` nÃ£o invoca a aÃ§Ã£o, inclusive se alguÃ©m confirmar.
5. Recusa de `require_approval` nÃ£o invoca a aÃ§Ã£o.
6. `allow` invoca a aÃ§Ã£o sem confirmaÃ§Ã£o extra do portÃ£o.
7. O retorno da aÃ§Ã£o sÃ³ existe no caminho executado.
8. O roteiro documental ainda Ã© quem sabe de fontes, seÃ§Ãµes, rascunho, prÃ©via e path.
9. Os 11 testes do Experimento 01 passam sem mudar o significado das asserÃ§Ãµes.
10. Nenhum segundo domÃ­nio foi implementado.
11. NÃ£o existem registry, runner universal, resultado universal, fila ou DSL.

CritÃ©rios rejeitados como cedo demais:

- â€œO core executa o Experimento 01 inteiro sem o runner.â€ Isso puxaria o domÃ­nio para dentro.
- â€œTodo status Ã© decidido pelo core.â€ O core nÃ£o sabe quando o rascunho estÃ¡ invÃ¡lido.
- â€œEfeito observado Ã© verificado de novo no disco.â€ NÃ£o hÃ¡ essa evidÃªncia nesta etapa.

---

## 15. QuestÃµes abertas

1. Recusa de aprovaÃ§Ã£o deve sempre cancelar o run, ou no futuro o roteiro pode propor outra aÃ§Ã£o? Os testes atuais exigem cancelamento. NÃ£o mudar isso na extraÃ§Ã£o.
2. InspeÃ§Ã£o de arquivo (`inspect`) Ã© aÃ§Ã£o material e deveria passar pelo portÃ£o antes mesmo da proposta de leitura? Hoje ela ocorre antes da polÃ­tica. Mudar a ordem pode alterar mensagens de erro. Fora do passo 2, salvo se um teste mostrar bypass.
3. Uma aprovaÃ§Ã£o de envio cobre `understandIntent` e `createDraft`. O portÃ£o nÃ£o deve partir isso em duas polÃ­ticas sem uma decisÃ£o explÃ­cita.
4. `observed: true` no ato da escrita basta? VerificaÃ§Ã£o posterior fica fora.
5. A funÃ§Ã£o Ãºnica de status + registro entra numa extraÃ§Ã£o seguinte ou permanece no runner? PreferÃªncia deste desenho: permanecer no runner atÃ© o portÃ£o estar estÃ¡vel.
6. `CapabilityEffect` no core, sim ou nÃ£o? NÃ£o, enquanto sÃ³ o experimento o produz.

Nenhuma dessas questÃµes autoriza implementaÃ§Ã£o alÃ©m do plano da seÃ§Ã£o 13, e este documento nÃ£o implementa esse plano.
