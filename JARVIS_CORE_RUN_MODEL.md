# J.A.R.V.I.S. â€” Core Run Model

**Etapa:** 18B â€” Modelo mÃ­nimo de execuÃ§Ã£o do core
**Base:** conclusÃ£o B da revisÃ£o da Etapa 18, `JARVIS_CORE_EXECUTION_MODEL.md` e os contratos atuais
**Natureza:** especificaÃ§Ã£o. Nenhum cÃ³digo foi alterado.

O nÃºcleo executÃ¡vel mÃ­nimo Ã© um **Run** que registra **Attempts**. Cada Attempt material atravessa decisÃ£o, aprovaÃ§Ã£o quando exigida, permissÃ£o e, sÃ³ entÃ£o, execuÃ§Ã£o. O core nÃ£o escolhe a prÃ³xima etapa do Experimento 01.

Conceitos reutilizados: `runId`, `TaskStatus`, `ActionProposal`, `PolicyDecision`, `PolicyOutcome`, `CycleInteraction.confirm`, `CapabilityEffect`.

Conceitos necessÃ¡rios para fechar a fronteira, ainda sem tipo no cÃ³digo: **Attempt**, **Permit**, **AttemptOutcome**.

---

## 1. Run

Um Run Ã© uma execuÃ§Ã£o acompanhada de uma intenÃ§Ã£o, do inÃ­cio ao encerramento. NÃ£o Ã© uma aÃ§Ã£o. NÃ£o Ã© um arquivo. NÃ£o Ã© o resultado documental.

**Identidade.** Um `runId` prÃ³prio. O runner e o `RunRecorder` jÃ¡ usam esse identificador. O modelo reutiliza esse fato. NÃ£o cria um segundo identificador de execuÃ§Ã£o.

**RelaÃ§Ã£o com Attempt.** Um Run contÃ©m zero ou mais Attempts. Cada aÃ§Ã£o material â€” ler uma fonte, enviar conteÃºdo ao modelo, criar o artefato â€” Ã© uma Attempt distinta dentro do mesmo Run. Compreender a intenÃ§Ã£o, perguntar, confirmar o objetivo, validar o rascunho e renderizar Markdown nÃ£o sÃ£o Attempts. SÃ£o passos do roteiro documental.

**Status mÃ­nimo do Run.** O tipo `TaskStatus` jÃ¡ existe e permanece a lista de status do Run. Para o modelo de execuÃ§Ã£o, o core precisa reconhecer agora:

| Status | Papel no Run |
|---|---|
| `received` | Run iniciado |
| `awaiting_approval` | Uma Attempt espera confirmaÃ§Ã£o humana |
| `executing` | Uma Attempt autorizada estÃ¡ em execuÃ§Ã£o |
| `rejected` | O roteiro encerrou o Run depois de uma Attempt `denied` |
| `cancelled` | O roteiro encerrou o Run depois de uma aprovaÃ§Ã£o recusada, ou de outra recusa humana jÃ¡ existente |
| `failed` | O roteiro encerrou o Run depois de falha de execuÃ§Ã£o ou de outra falha jÃ¡ tratada como `failed` |
| `completed` | O roteiro encerrou o Run com sucesso |
| `completed_with_reservations` | O roteiro encerrou o Run com reservas de domÃ­nio |

Os demais valores de `TaskStatus` continuam no tipo porque o roteiro documental jÃ¡ os usa: `understanding`, `awaiting_clarification`, `objective_confirmed`, `building_context`, `validating`. Eles nomeiam fases do Experimento 01. NÃ£o sÃ£o status de Attempt. O core nÃ£o decide quando eles ocorrem.

**O Run nÃ£o interpreta** o conteÃºdo da intenÃ§Ã£o, do objetivo ou do efeito.

---

## 2. Attempt

Uma Attempt Ã© uma tentativa especÃ­fica de executar uma aÃ§Ã£o material. Ela existe para que a decisÃ£o, a aprovaÃ§Ã£o, a permissÃ£o e o efeito fiquem presos a essa tentativa, e nÃ£o apenas anotados no Run.

**Identidade.** Cada Attempt tem um `attemptId` prÃ³prio, diferente do `runId`. Duas leituras de duas fontes sÃ£o duas Attempts. Repetir a mesma proposta depois de uma recusa Ã© outra Attempt, nÃ£o a reabertura da anterior.

**ActionProposal.** A Attempt carrega exatamente uma `ActionProposal`: capability, resource, destination, effect e reversible. A proposta descreve o que se pretende. NÃ£o autoriza.

**PolicyDecision.** A Attempt carrega exatamente uma `PolicyDecision`, produzida pela autoridade do experimento para aquela proposta. A decisÃ£o continua sendo `allow`, `require_approval` ou `deny`, com motivo. Quem avalia Ã© a polÃ­tica do experimento. O core nÃ£o contÃ©m a regra documental.

**Approval.** SÃ³ existe quando `PolicyDecision.outcome` Ã© `require_approval`. Ã‰ o booleano jÃ¡ devolvido por `CycleInteraction.confirm`. NÃ£o Ã© um tipo novo. `allow` nÃ£o pede aprovaÃ§Ã£o. `deny` nÃ£o pede aprovaÃ§Ã£o. AprovaÃ§Ã£o concedida nÃ£o altera o outcome da decisÃ£o.

**Permit.** SÃ³ existe se esta Attempt estiver autorizada a executar. A seÃ§Ã£o 3 define as condiÃ§Ãµes. A Attempt negada ou recusada nÃ£o tem Permit.

**Execution.** Ã‰ a entrada na capability material desta Attempt. SÃ³ ocorre se o Permit desta Attempt for apresentado. Entrar na capability e lanÃ§ar erro ainda Ã© execuÃ§Ã£o: a Attempt termina `failed`. NÃ£o entrar na capability nÃ£o Ã© execuÃ§Ã£o.

**ObservedEffect.** Opcional, e sÃ³ no desfecho `executed`. Ã‰ o relato do que a capability observou depois de rodar. No Experimento 01 esse relato jÃ¡ tem forma: `CapabilityEffect`. Para o core, esse valor Ã© opaco. A Attempt nÃ£o exige que todo `executed` traga um efeito observado; se a capability retornar sem relato, o desfecho ainda pode ser `executed` e o efeito fica ausente. O roteiro documental Ã© quem decide se ausÃªncia de efeito impede o sucesso do Run.

---

## 3. Permit

O Permit Ã© a prova, emitida pelo core, de que **aquela** Attempt pode executar **uma** vez.

**Quem emite.** Somente o core. A polÃ­tica nÃ£o emite. A capability nÃ£o emite. A interaÃ§Ã£o nÃ£o emite. O modelo nÃ£o emite.

**Quando pode existir.**

- `PolicyDecision.outcome` Ã© `allow`, ou
- `PolicyDecision.outcome` Ã© `require_approval` e `confirm` desta Attempt retornou verdadeiro.

NÃ£o existe quando o outcome Ã© `deny`. NÃ£o existe quando a aprovaÃ§Ã£o exigida foi recusada. NÃ£o existe antes da decisÃ£o. NÃ£o existe para outra Attempt.

**VÃ­nculo.** O Permit identifica `runId`, `attemptId` e a `PolicyDecision` daquela Attempt. Capability, resource e destination conferidos sÃ£o os da proposta que a decisÃ£o carregou. Um Permit de leitura nÃ£o serve para criaÃ§Ã£o. Um Permit de um `attemptId` nÃ£o serve para outro.

**Uso.** Um Permit autoriza uma execuÃ§Ã£o. Depois de apresentado, estÃ¡ consumido. NÃ£o autoriza segunda chamada.

**`deny`.** O core nÃ£o emite Permit. Sem Permit, a capability material nÃ£o executa essa Attempt. Registrar a `PolicyDecision` no SQLite nÃ£o substitui o Permit.

**O que a capability material verifica.**

- recebeu um Permit;
- o Permit foi emitido pelo core para o `runId` e o `attemptId` desta chamada;
- a capability, o resource e o destination do Permit sÃ£o os desta aÃ§Ã£o;
- o Permit ainda nÃ£o foi consumido.

Se qualquer verificaÃ§Ã£o falha, a capability nÃ£o executa.

**O Permit nÃ£o substitui a PolicyDecision.** A decisÃ£o continua sendo o julgamento da autoridade. O Permit Ã© sÃ³ a consequÃªncia aplicÃ¡vel desse julgamento para uma Attempt. Guardar a decisÃ£o sem o Permit nÃ£o autoriza. Mostrar o Permit sem a decisÃ£o correspondente Ã© invÃ¡lido.

---

## 4. AttemptOutcome

O desfecho mÃ­nimo de uma Attempt Ã© um destes quatro:

| Desfecho | Quando ocorre | Houve execuÃ§Ã£o? | Pode existir `CapabilityEffect`? |
|---|---|---|---|
| `denied` | A decisÃ£o foi `deny` | NÃ£o | NÃ£o |
| `refused` | A decisÃ£o foi `require_approval` e a confirmaÃ§Ã£o foi falsa | NÃ£o | NÃ£o |
| `failed` | O Permit foi aceito, a capability foi entrada e a execuÃ§Ã£o nÃ£o se completou | Sim, a entrada ocorreu | NÃ£o. Efeito parcial nÃ£o confirmado nÃ£o conta como efeito desta Attempt |
| `executed` | O Permit foi aceito e a capability concluiu a chamada | Sim | Sim, como efeito opaco. Pode estar ausente se a capability nÃ£o relatou |

`denied` e `refused` sÃ£o desfechos diferentes. Negar Ã© autoridade. Recusar Ã© o usuÃ¡rio. Os dois nÃ£o produzem Permit.

**Quem interpreta.** O roteiro do experimento. No Experimento 01, o comportamento jÃ¡ observado Ã©: `denied` encerra o Run como `rejected`; `refused` encerra como `cancelled`; `failed` encerra como `failed`; `executed` nÃ£o encerra por si. O roteiro segue, valida o que for de domÃ­nio e sÃ³ entÃ£o escolhe `completed` ou `completed_with_reservations`.

**Quem nÃ£o interpreta.** O core nÃ£o lÃª `CapabilityEffect`. A capability nÃ£o transforma o desfecho em status do Run. A polÃ­tica nÃ£o escolhe o desfecho depois de ter emitido a decisÃ£o. O modelo nÃ£o escolhe o desfecho.

O AttemptOutcome nÃ£o Ã© um resultado universal do J.A.R.V.I.S. `ExperimentResult` continua sendo o resultado do Experimento 01.

---

## 5. Fluxo normativo

```text
ActionProposal
â†’ PolicyDecision
â†’ Approval, somente se outcome = require_approval
â†’ Permit, somente se allow, ou se require_approval foi confirmado
â†’ Capability execution, somente com esse Permit
â†’ ObservedEffect, opaco, somente se a execuÃ§Ã£o concluiu
â†’ AttemptOutcome
```

**Deny**

```text
ActionProposal
â†’ PolicyDecision deny
â†’ nÃ£o pede Approval
â†’ nÃ£o emite Permit
â†’ nÃ£o executa
â†’ AttemptOutcome denied
```

**AprovaÃ§Ã£o recusada**

```text
ActionProposal
â†’ PolicyDecision require_approval
â†’ confirm = falso
â†’ nÃ£o emite Permit
â†’ nÃ£o executa
â†’ AttemptOutcome refused
```

**ExecuÃ§Ã£o com falha**

```text
ActionProposal
â†’ PolicyDecision allow, ou require_approval confirmado
â†’ Permit
â†’ capability Ã© entrada e falha
â†’ Permit consumido
â†’ nÃ£o hÃ¡ CapabilityEffect desta Attempt
â†’ AttemptOutcome failed
```

**ExecuÃ§Ã£o bem-sucedida**

```text
ActionProposal
â†’ PolicyDecision allow, ou require_approval confirmado
â†’ Permit
â†’ capability conclui
â†’ ObservedEffect opaco, quando houver
â†’ AttemptOutcome executed
```

ConfirmaÃ§Ã£o do objetivo, esclarecimento, validaÃ§Ã£o do rascunho e prÃ©via ficam fora desse fluxo. NÃ£o sÃ£o Attempts.

---

## 6. Invariantes

1. `deny` nunca produz Permit.
2. Sem Permit vÃ¡lido para aquela Attempt, nÃ£o existe execuÃ§Ã£o autorizada.
3. ConfirmaÃ§Ã£o do usuÃ¡rio nÃ£o transforma `deny` em `allow` e nÃ£o cria Permit.
4. `allow` nÃ£o exige confirmaÃ§Ã£o para emitir Permit.
5. Uma Attempt representa uma proposta e uma decisÃ£o. Outra execuÃ§Ã£o Ã© outra Attempt.
6. Um Permit identifica `runId` e `attemptId` e vale para uma execuÃ§Ã£o.
7. O core nÃ£o interpreta conteÃºdo de domÃ­nio.
8. O core nÃ£o conhece Markdown, arquivos, proveniÃªncia ou Anthropic.
9. A capability nÃ£o decide polÃ­tica.
10. A capability material executa somente quando recebe um Permit vÃ¡lido para aquela Attempt.
11. `CapabilityEffect` nÃ£o aparece em Attempt `denied`, `refused` ou `failed`.
12. AttemptOutcome `executed` nÃ£o significa Run `completed`.

---

## 7. Limite do core

NÃ£o pertencem a este modelo, e nÃ£o devem entrar na implementaÃ§Ã£o dele:

- workflow engine
- step engine
- registry
- capability catalog
- UniversalResult
- validaÃ§Ã£o documental
- Markdown
- filesystem
- Anthropic
- memÃ³ria de produto
- MCP
- plugins
- planejamento de tarefas
- escolha da prÃ³xima etapa do Experimento 01
- critÃ©rio de seÃ§Ã£o, lacuna ou proveniÃªncia
- path de saÃ­da e `ExperimentResult`

A polÃ­tica de allowlist, extensÃ£o `.md` e proibiÃ§Ã£o de sobrescrever fonte permanece no experimento. O core sÃ³ aplica a `PolicyDecision` que essa polÃ­tica devolver.

---

## 8. Exemplo conceitual

O exemplo usa a criaÃ§Ã£o do artefato do Experimento 01. Ele ilustra o fluxo. NÃ£o define o core e nÃ£o adiciona regra documental ao core.

Uma Attempt de `create_artifact` entra com a proposta jÃ¡ montada pelo roteiro: capability, destino e efeito pretendido.

A polÃ­tica documental devolve `require_approval`, ou `deny` se o destino for uma fonte ou nÃ£o for Markdown.

Se for `deny`, o core nÃ£o pede confirmaÃ§Ã£o, nÃ£o emite Permit e a Attempt termina `denied`. O arquivo nÃ£o Ã© aberto. O roteiro, como hoje, pode encerrar o Run em `rejected`.

Se for `require_approval` e o usuÃ¡rio recusar, a Attempt termina `refused`. O arquivo nÃ£o Ã© aberto. O roteiro pode encerrar o Run em `cancelled`.

Se o usuÃ¡rio confirmar, o core emite o Permit daquela Attempt. `FileCapabilities.createArtifact` sÃ³ escreve se esse Permit for o da mesma Attempt e do mesmo destino. Se a escrita quebra, a Attempt termina `failed` e nÃ£o hÃ¡ `CapabilityEffect`. Se a escrita conclui, a capability devolve o `CapabilityEffect` opaco e a Attempt termina `executed`. O roteiro ainda valida Ã  parte e sÃ³ entÃ£o marca o Run como `completed` ou `completed_with_reservations`.

A leitura autorizada segue o mesmo fluxo com `allow`: hÃ¡ Permit sem confirmaÃ§Ã£o extra. O envio ao modelo segue o mesmo fluxo com `require_approval`. A diferenÃ§a entre as trÃªs aÃ§Ãµes estÃ¡ na polÃ­tica e na capability, nÃ£o num portÃ£o diferente para cada uma.

---

## 9. InconsistÃªncias com o cÃ³digo atual

Nada disso foi corrigido.

1. **`deny` do envio nÃ£o Ã© aplicado.** Em `ExperimentRunner`, a decisÃ£o de `send_sources_to_model` Ã© registrada e a confirmaÃ§Ã£o Ã© pedida sem encerrar em `deny`. Leitura e criaÃ§Ã£o param em `deny`. NÃ£o existe Permit. A decisÃ£o pode ficar sÃ³ no registro.

2. **NÃ£o existe Attempt nem Permit.** O `runId` existe. NÃ£o hÃ¡ `attemptId`. As trÃªs aÃ§Ãµes nÃ£o sÃ£o tentativas identificÃ¡veis. `CapabilityEffect` comeÃ§a a existir sÃ³ depois da execuÃ§Ã£o e nÃ£o aponta para uma tentativa.

3. **AttemptOutcome nÃ£o existe.** O runner converte negaÃ§Ã£o em `TaskStatus.rejected`, recusa em exceÃ§Ã£o `ExperimentCancelledError` e depois `cancelled`, e falha em `failed`. `denied` e `refused` nÃ£o sÃ£o desfechos de tentativa. Cancelamento de aprovaÃ§Ã£o Ã© exceÃ§Ã£o, nÃ£o resultado da Attempt.

4. **`TaskStatus` mistura Run e fases documentais.** `understanding`, `awaiting_clarification`, `objective_confirmed`, `building_context` e `validating` estÃ£o no mesmo tipo que o status do Run. O modelo nÃ£o cria outro tipo. TambÃ©m nÃ£o trata essas fases como Attempt.

5. **`executed` nÃ£o Ã© `completed`.** O cÃ³digo sÃ³ tem status de Run. Uma leitura bem-sucedida vira efeito no array e o Run continua. Isso combina com a invariante 12, mas nÃ£o hÃ¡ desfecho de Attempt para dizÃª-lo.

6. **`CapabilityEffect` Ã© documental.** O campo `action` usa `DocumentaryActionKind`, nÃ£o a capability string da `ActionProposal`. `observed: true` Ã© marcado pela prÃ³pria escrita, no mesmo passo, sem verificaÃ§Ã£o posterior. Serve como efeito opaco do exemplo. NÃ£o serve como AttemptOutcome.

7. **AprovaÃ§Ã£o nÃ£o estÃ¡ ligada Ã  decisÃ£o.** `PolicyDecision` nÃ£o tem campo de aprovaÃ§Ã£o. O recorder grava um evento `approval` separado. Nada impede `confirm` verdadeiro de seguir depois de um `deny` no caminho do envio.

8. **Leitura sÃ³ testa `deny`.** Se a polÃ­tica devolvesse `require_approval` para leitura, o runner atual leria mesmo assim. A polÃ­tica vigente devolve `allow`. O fluxo normativo nÃ£o leria sem Permit, e `require_approval` pediria confirmaÃ§Ã£o antes do Permit.

9. **CriaÃ§Ã£o pede confirmaÃ§Ã£o depois de qualquer outcome que nÃ£o seja `deny`.** Hoje a polÃ­tica de criaÃ§Ã£o vÃ¡lida devolve `require_approval`, entÃ£o o efeito coincide com o fluxo normativo. O runner nÃ£o distingue `allow` de `require_approval` nesse ponto.

10. **`inspect` ocorre antes de qualquer Attempt.** A capability olha extensÃ£o e tamanho antes da polÃ­tica de leitura. O modelo nÃ£o transforma inspeÃ§Ã£o em Attempt. O cÃ³digo continua com um acesso a arquivo fora do Permit.

11. **Efeito de leitura Ã© montado pelo runner, nÃ£o pela capability.** `readSource` devolve texto. O runner fabrica o `CapabilityEffect`. A criaÃ§Ã£o devolve o efeito na capability. Os dois caminhos nÃ£o relatam o efeito do mesmo modo.

12. **Uma aprovaÃ§Ã£o de envio cobre duas chamadas ao modelo.** `understandIntent` e `createDraft` ocorrem depois de uma Ãºnica confirmaÃ§Ã£o. O modelo normativo liga um Permit a uma Attempt. O cÃ³digo nÃ£o tem duas Attempts de envio. Esta especificaÃ§Ã£o nÃ£o parte essa aprovaÃ§Ã£o. A diferenÃ§a fica registrada para a implementaÃ§Ã£o nÃ£o inventar uma segunda polÃ­tica sem decisÃ£o explÃ­cita.
