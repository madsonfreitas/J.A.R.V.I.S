# J.A.R.V.I.S. â€” Fechamento da Etapa 18C

**Status:** APPROVED
**Natureza:** registro de fechamento. Esta etapa nÃ£o altera arquitetura, contratos, fluxo nem cÃ³digo de execuÃ§Ã£o.

---

## 1. Objetivo da etapa

A Etapa 18C implementou e validou o nÃºcleo mÃ­nimo de execuÃ§Ã£o do J.A.R.V.I.S. com:

- Run;
- Attempt;
- PolicyDecision;
- Approval, quando a polÃ­tica exige;
- Permit;
- AttemptOutcome;
- execuÃ§Ã£o da capacidade;
- efeito observado, opaco para o core.

O core aplica a fronteira de uma aÃ§Ã£o. O roteiro do Experimento 01 continua no domÃ­nio documental.

---

## 2. Problema encontrado

A primeira ligaÃ§Ã£o de `send_sources_to_model` consumia o Permit num callback que apenas devolvia `{ authorized: true }`. O efeito material, `messages.create`, acontecia depois, em `createDraft`, fora dessa fronteira.

`understandIntent` tambÃ©m chamava `messages.create` sem Attempt prÃ³pria. O sucesso da Attempt anterior funcionava como autorizaÃ§Ã£o implÃ­cita para outra chamada externa.

---

## 3. CorreÃ§Ã£o aplicada

`send_intention_to_model` e `send_sources_to_model` passaram a ter fronteiras de execuÃ§Ã£o prÃ³prias.

- `send_intention_to_model` executa a chamada de `understandIntent`.
- `send_sources_to_model` executa a chamada de `createDraft`.

Nas duas, `claimPermit` ocorre imediatamente antes de `messages.create`. Cada uma usa o prÃ³prio Permit. A polÃ­tica do Experimento 01 exige aprovaÃ§Ã£o para as duas, com a mesma regra jÃ¡ existente: envio a um provedor externo pede consentimento explÃ­cito.

---

## 4. Invariantes validadas

Confirmadas no cÃ³digo e nos testes desta etapa:

- a autorizaÃ§Ã£o controla o efeito material da chamada ao modelo que ela cobre;
- Attempt A nÃ£o autoriza Attempt B;
- o Permit Ã© especÃ­fico da Attempt, da capability, do recurso e do destino;
- o Permit nÃ£o Ã© autorizaÃ§Ã£o genÃ©rica para continuar o fluxo;
- `deny` nÃ£o executa a chamada externa;
- `refused` nÃ£o executa a chamada externa;
- `executed` significa que a execuÃ§Ã£o daquela Attempt retornou depois de consumir o seu Permit;
- as chamadas externas ao modelo encontradas no cÃ³digo acontecem dentro das Attempts correspondentes.

`executed` nÃ£o significa confirmaÃ§Ã£o de entrega pelo provedor, nem sucesso de todo o Run.

---

## 5. EvidÃªncia

InspeÃ§Ã£o do cÃ³digo atual, nesta sessÃ£o de fechamento:

- existe uma Ãºnica ocorrÃªncia de `messages.create`, em `AnthropicIntelligence.complete`;
- `understandIntent` chama `complete` com o claim `send_intention_to_model`;
- `createDraft` chama `complete` com o claim `send_sources_to_model`;
- `claimPermit` Ã© a primeira instruÃ§Ã£o de `complete`, antes de `messages.create`;
- o runner sÃ³ chama esses mÃ©todos dentro de `CoreRun.attempt`;
- `CoreRun.attempt` retorna `denied` ou `refused` sem chamar `execute`;
- `claimPermit` recusa Attempt, capability, recurso ou destino diferentes, e recusa um Permit jÃ¡ consumido;
- `src/cycle/` nÃ£o importa Anthropic, Markdown, contexto documental, regras do Experimento 01 nem APIs de filesystem. O Ãºnico mÃ³dulo de plataforma importado ali Ã© `node:crypto`, para gerar `attemptId`.

Resultados observados ao fechar a etapa:

- `npm test` â€” 28 testes passando;
- `npm run typecheck` â€” passou.

---

## 6. Riscos conhecidos

### Permit antes de claim

Se uma capability falhar antes de `claimPermit`, o Permit pode permanecer vÃ¡lido enquanto ainda existir referÃªncia a ele.

Neste momento:

- o runner nÃ£o reapresenta esse Permit;
- nÃ£o existe reutilizaÃ§Ã£o demonstrada no fluxo atual;
- isso nÃ£o foi redesenhado nesta etapa.

`KNOWN RISK â€” NOT BLOCKING 18C`

### Efeito externo seguido de falha local

Se `messages.create` concluir e o processamento ou o parsing local falhar depois:

- a chamada externa jÃ¡ pode ter ocorrido;
- a Attempt termina como `failed`;
- um retry futuro poderia enviar a mesma chamada outra vez.

NÃ£o hÃ¡ confirmaÃ§Ã£o de entrega alÃ©m da resposta da chamada. Nenhuma soluÃ§Ã£o de retry ou idempotÃªncia foi implementada.

`FUTURE CONCERN â€” RETRY/IDEMPOTENCY`

---

## 7. DecisÃµes que NÃƒO foram tomadas

A Etapa 18C nÃ£o resolveu:

- retry;
- idempotÃªncia;
- confirmaÃ§Ã£o de efeitos externos;
- exactly-once execution;
- recuperaÃ§Ã£o apÃ³s falha externa;
- sistema universal de efeitos;
- workflow engine.

Esses assuntos permanecem fora do escopo desta etapa.

---

## 8. Limites da 18C

A etapa nÃ£o transforma o core em um workflow engine.

O core continua responsÃ¡vel pelo mecanismo de uma aÃ§Ã£o: proposta, decisÃ£o, aprovaÃ§Ã£o quando exigida, Permit, execuÃ§Ã£o e desfecho. A ordem do Experimento 01, as fontes, o Markdown, a proveniÃªncia e as regras documentais permanecem no domÃ­nio documental.

---

## 9. Resultado

`STATUS: APPROVED`

A Etapa 18C estÃ¡ encerrada. A fronteira abaixo foi validada no cÃ³digo real das chamadas externas ao modelo:

```text
ActionProposal
â†’ PolicyDecision
â†’ Approval
â†’ Permit
â†’ execuÃ§Ã£o
â†’ efeito
â†’ Outcome
```
