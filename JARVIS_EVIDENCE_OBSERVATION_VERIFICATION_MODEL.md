# J.A.R.V.I.S. — Evidence, Observation and Verification Model

**Stage:** 26  
**Natureza:** especificação. Nenhum observador, verificador, store ou monitor foi implementado.  
**Base:** `src/cycle/execution.ts`, `src/documentary/files.ts`, `validator.ts`, `runner.ts`, Stages 18C–25.

Perguntas da stage:

> Como saber que um efeito aconteceu, sem confundir “a função retornou” com “o mundo está como esperado”?  
> Como observar depois, sem transformar observação em autorização?

---

## 1. Objetivo da Stage

Separar execução, efeito, evidência, observação, validação e verificação — no comportamento real — e preservar:

```text
Execução ≠ efeito
Evidência ≠ verdade
Observação ≠ autorização
Conhecimento contínuo ≠ autoridade contínua
```

---

## 2. Evidências encontradas no código

| Conclusão | Arquivo | Símbolo | Comportamento |
|---|---|---|---|
| `executed` = `execute` retornou depois de `claimPermit` | `execution.ts` | `CoreRun.attempt` | Não relê o mundo. `effect` é opaco (`TEffect`) |
| `CapabilityEffect.observed: true` é auto-relato | `files.ts` | `createArtifact` return | Depois de `writeFile` sem erro. Sem `stat`/`readFile` do destino |
| Validação é do **draft em memória**, antes de gravar | `runner.ts` + `validator.ts` | `ResultValidator.validate` | Compara Goal, draft e `TaskContext`. Não abre o `.md` criado |
| Run `completed` usa essa validação pré-write | `runner.ts` | `finalStatus` | `create` `executed` + draft `valid` / reservas. Disco não é revalidado |
| `unknown` = efeito possível sem evidência suficiente | `files.ts`, `anthropic-intelligence.ts` | `UnknownEffectError` | `unlink` incerto; HTTP iniciado sem evidência; parse **depois** da resposta é `failed` (chamada ocorreu) |
| `inspect` observa o FS **sem** Permit | `files.ts` | `inspect` | `stat` de preparação. Não é Attempt |
| `read_source` observa conteúdo **com** Permit | `files.ts` | `readSource` | `readFile` após `claimPermit` |
| Não há tipo Observation / Evidence / Verification | `src/cycle` | — | Só `AttemptOutcome` e efeito opaco |
| Auditoria grava o relato | `runner.ts` | `record(..., "effect")` | Copia `CapabilityEffect`. Não prova o disco |
| Preview é humana, no processo | `runner.ts` | `showPreview(markdown)` | Texto **antes** do write. Não verifica o arquivo |
| Segunda criação no mesmo path falha | `tests/file-capabilities.test.ts` | `EEXIST` | O mundo (arquivo) bloqueia retry; isso é efeito persistente, não verificação explícita |

Não determinado pelo repositório: se o `writeFile` que retornou deixou bytes idênticos ao `markdown` após um crash a meio. O código não relê.

---

## 3. Execução vs efeito

O código **nomeia** a diferença (`UnknownEffectError`, `executed` ≠ validação) e **mistura** evidência de efeito com o retorno da capability.

```text
EXECUÇÃO     execute() retornou (ou lançou)
EFEITO       arquivo / chamada HTTP / bytes lidos
OBSERVAÇÃO   quase só o que a própria função diz; inspect/read são exceções
VERIFICAÇÃO  não há verificação do estado do mundo pós-efeito
VALIDAÇÃO    critérios do draft (conteúdo), não do disco
```

| Pergunta | Resposta no código |
|---|---|
| `executed` é só a função? | Sim, no core |
| `CapabilityEffect` é efeito real? | É **efeito reportado** pela capability |
| Confirma efeitos? | Não de forma independente |
| HTTP 200 prova o efeito? | Prova que houve resposta. Parse ok ≠ “o provedor fez o que o prompt pediu”. Parse fail após resposta = `failed` com mensagem de que a chamada ocorreu |
| `writeFile` sem throw prova artefato correto? | Prova que a API do FS não lançou. Não prova conteúdo, permanência, nem que outro processo não apagou em seguida |
| Validação textual = efeito? | Não. É qualidade do draft **antes** de criar o arquivo |
| Resultado da operação vs estado do mundo | `AttemptOutcome` / `ExperimentResult` vs disco/provedor. Só o primeiro é estruturado |

---

## 4. Modelo de evidência

Nem todas as categorias precisam existir como mecanismo. Conceitualmente:

| Classe | O que prova | O que não prova | Perto do efeito? | Pode errar/envelhecer? | Nova Attempt? | Autoridade |
|---|---|---|---|---|---|---|
| **E1 retorno da operação** | A função chegou ao fim (ou lançou) | Estado do mundo | Próxima do *caller*, não do mundo | Sim (mentira do runtime, crash depois) | Não: já é a Attempt | Já tinha Permit |
| **E2 leitura imediata do recurso** | Snapshot naquele instante | Permanência | Alta, se o recurso for o afetado | Sim, race | Se a leitura for `read_source` (ou equivalente), **sim**. `inspect` hoje não | Política da leitura, não o Permit da escrita |
| **E3 consulta posterior externa** | O que o sistema responde agora | História completa | Variável | Sim | Sim, se consequencial/externa | Permit **novo** |
| **E4 confirmação humana** | O que a pessoa afirma ter visto | O mundo | Baixa/média | Sim | Interaction pode bastar; se só fala, não é Attempt | Não emite Permit para outra ação |
| **E5 registro de terceiro** | O que o terceiro logou | Verdade | Indireta | Sim | Obter o registro pode ser Attempt | Não autoriza repetir |
| **E6 observação indireta** | Correlato | O efeito em si | Fraca | Sim | Depende | Idem |
| **E7 ausência de evidência** | Nada | Não-ocorrência | — | “Não achei” ≠ “não houve” | Investigar pode ser Attempt | Não transforma unknown em failed |

Hoje o experimento usa **E1** (core), **E1 disfarçado de observado** (`observed: true`), **E4** parcial (`confirm` / preview, não “vi o arquivo no disco”), **E7** via `unknown`. `inspect`/`read_source` são E2 de **fontes**, não do artefato criado.

---

## 5. Evidência vs verdade

```text
Evidência → interpretação → hipótese sobre o mundo
```

| Situação | O sistema pode afirmar |
|---|---|
| Parcial (`observed: true` sem reler) | “A escrita não lançou.” Não: “o arquivo está correto agora.” |
| Antiga | Nada no código usa observação velha. Conceito: não sustenta decisão nova sem recência adequada |
| Conflito | Draft marca `conflicts` **no conteúdo**. Não há conflito disco vs audit |
| Fonte não confiável | `TaskContext.trust = untrusted_content` — conteúdo lido não é instrução |
| Leitura falha | Attempt `failed` ou `inspect` throw — falta evidência, não prova de ausência de arquivo em todos os casos |
| Fonte indisponível | Investigação inconclusiva: permanece unknown / unavailable |
| Auto-evidência (J.A.R.V.I.S. gerou o registro) | Mais fraca que observação independente. É o caso de `CapabilityEffect` |
| Sistema externo | Resposta HTTP é evidência **reportada** pelo canal, não verificação no destino final |

```text
"tenho um registro" ≠ "sei exatamente o que aconteceu"
```

---

## 6. Estados epistêmicos

Não criar enum. Distinções **semanticamente úteis**:

| Estado | Significado | Evidência mínima | Risco |
|---|---|---|---|
| **unknown** | Efeito pode ter ocorrido; não dá para classificar | `UnknownEffectError` após `claimPermit` | Tratar como failed/executed |
| **reported** | A capability ou o log diz que ocorreu | `CapabilityEffect`, evento `effect` | Confundir com verified |
| **observed** | Leitura/consulta **depois**, independente do executor | E2/E3 | Stale; a leitura em si pode falhar |
| **inferred** | Conclusão indireta | Não necessário como tipo agora | Virar fato |
| **verified** | Observed comparado ao **esperado** | Expected + observed | Achar que é eterno |
| **contradictory** | Duas evidências discordam | Duas fontes | Resolver em silêncio |
| **stale** | Já foi observed, pode ter mudado | Tempo / outro ator | Decidir com snapshot velho |
| **unavailable** | Não deu para observar | Timeout, deny, down | Tratar como “não aconteceu” |

`unknown` ≠ false.  
`verified` ≠ permanentemente true.

No código: **unknown** e **reported** existem de facto. **observed/verified** independentes **não**. `ResultValidator` não é verified de efeito.

---

## 7. Expected vs observed state

| | Esperado | Observado no código |
|---|---|---|
| Criar arquivo | Path novo com markdown validado | `writeFile` sem throw + `observed: true`. Conteúdo não é relido |
| Enviar ao modelo | JSON parseável de intenção/draft | Body recebido e parseado, ou `unknown`/`failed` |

Não há:

```text
esperado: arquivo X com conteúdo Y
observado: X existe
verificação: bytes = Y
```

HTTP 200/resposta parseada ≠ “o destino final (humano, fila, ferramenta) recebeu o sentido do pedido”. Para este experimento, o efeito *é* a chamada ao provedor; não há segundo hop. Ainda assim a resposta não prova qualidade factual das fontes (isso é validação do draft, outro eixo).

---

## 8. Efeitos internos vs externos

| Classe | Exemplo atual | Observar | Verificar | Repetir | Não verificar |
|---|---|---|---|---|---|
| Interno | `goal` na stack, draft JS | Não precisa do mundo | N/A | N/A | Perde no crash (Stage 25) |
| Persistente local | `.md` via `wx` | `stat`/`read` | Comparar bytes/path | `EEXIST` / duplicar | Arquivo errado ou órfão |
| Externo | `messages.create` | Só a resposta; não há API de “o prompt ficou” | Limitado ao que o provedor devolve | Custo, duplicar tokens | `unknown` real |
| Social | Não há email | — | — | Alto | Alto |
| Contínuo | Não há | — | — | — | — |

Verificação obrigatória universal: **não**. Custo e latência. Efeitos irreversíveis/externos pedem mais evidência que um `writeFile` local no experimento.

---

## 9. Observação como ação

> Ler o mundo também é ação?

**Depende da observação**, e o código já distingue dois modos:

| | Preparação `inspect` | Operacional `read_source` |
|---|---|---|
| Permit | Não | Sim |
| O que faz | `stat`, metadados | `readFile` conteúdo (e depois pode ir ao modelo) |
| Risco | Path allowlist só na política de **read**, não no inspect | Conteúdo sobe a contexto / provedor |

Justificativa da distinção: preparação barata, local, para montar política (`ExperimentPolicy` usa paths inspecionados). Leitura de conteúdo é consequencial (privacidade, envio).

Consultar API, email, banco, dispositivo: **observação operacional** — Attempt + política + Permit, porque acessa sistema alheio ou dado sensível.

Observação contínua / invasiva: fora do experimento; seria ação (e provavelmente `require_approval`).

Exceção `inspect`: Stage 21 R2. **Não generalizar** para “toda observação é grátis”. Investigar um `unknown` de `create_artifact` relendo o destino se parece com `inspect`, mas é **operacional** se o path não era o das fontes allowlisted — hoje nem existe esse passo.

---

## 10. Observação vs autorização

```text
Observation → Context → ActionProposal → Policy → Permit
Observation ↛ Permit
```

Descobrir que o arquivo existe **não** autoriza apagar, sobrescrever, enviar. Descobrir que a mensagem chegou **não** autoriza enviar outra.

Igual a Context ↛ Authority (Stage 20). Observação é uma fonte de contexto, às vezes via Attempt de leitura.

---

## 11. Unknown + observação

```text
Attempt A → unknown
Attempt B → observar
```

B **não** é retry. É **investigation** (Stage 25).

- Precisa Permit? Se B lê recurso protegido/externo, **sim**, Permit de B, não o de A.
- Pode resolver o unknown de A? Pode **atualar a hipótese** (“agora o arquivo existe”). Não reescreve o `AttemptOutcome` de A no core (A já terminou). Auditoria de A permanece `unknown`; B acrescenta evidência posterior.
- Concluir que A aconteceu / não aconteceu: só se a evidência for adequada **e** ainda assim é hipótese (outro processo pode ter criado o arquivo).
- Conflito: observed ausente + A unknown → **não** vira `failed` de A automaticamente (Stage 25: ausência ≠ não ocorreu, se a janela/timing for ruim).

> Investigar um efeito desconhecido não significa repetir o efeito.

---

## 12. Observação + nova ação

```text
observar → condição X → agir
```

A observação **informa** planejamento/contexto (“não criar de novo se `wx`/arquivo existe”). **Não** emite Permit da criação, da exclusão, nem do envio.

Política pode usar fatos observados (allowlist, destino ocupado). Continua sendo `evaluate(proposta)` agora, não um atalho.

`EEXIST` no teste é o **mundo** recusando a segunda escrita **depois** de um Permit novo — autorização houve; o efeito duplicado falhou. Isso não é Observation → Permit.

---

## 13. Conflito de evidências

Não há scorer.

Comportamento conceitual: estado **contradictory** / perguntar (como esclarecimento de Goal). Não calar uma fonte.

Timestamp e origem importam: auto-relato (`CapabilityEffect`) vs leitura posterior vs humano. Não determinado no código além de `untrusted_content` para fontes.

Audit `executed` vs externo “não encontrado”: não “corrigir” A para `failed`. Registrar conflito; investigar; humana se o impacto for alto.

---

## 14. Evidência desatualizada

Observação tem validade para **esta** decisão. Não há TTL.

Necessidade futura: **sim, conceitualmente** (stale), quando residência/intervalo existir. Não cache. Não implementar. Quem decide de novo observa de novo se o fato for material (existência de arquivo, status de serviço).

---

## 15. Verification vs Validation

| | Pergunta | No código |
|---|---|---|
| Observation | O que vimos? | `inspect` / `readFile` / retorno HTTP / auto-relato |
| Effect | O que saiu da função para o mundo? | Arquivo, chamada; mal separado do return |
| Result | O que a Attempt/Run declara? | `AttemptOutcome`, `ExperimentResult` |
| **Validation** | O produto atende critérios? | `ResultValidator` no **draft** |
| **Verification** | O mundo bate com o efeito esperado? | **Ausente** pós-write |

Mistura documentada: `observed: true` parece verification; é reported. `completed` parece “arquivo ok”; é executed + validação **pré**-write.

---

## 16. Casos adversariais

| Caso | Conhecido | Desconhecido | Evidência | Efeito confirmado? | Nova ação? | Novo Permit? |
|---|---|---|---|---|---|---|
| 1. Return sem efeito | Função ok | Mundo | E1 | Não | Investigar / corrigir | Sim se agir de novo |
| 2. Efeito sem retorno | Possível mundo mudou | Outcome | E7 / disco | Não pelo core | Investigar | Sim para observar/agir |
| 3. Efeito + crash pré-record | Disco/API | Auditoria da Attempt | Mundo, não SQLite | Não no log | Investigar (Stage 25) | Sim |
| 4. Observação positiva falsa | Snapshot | Mundo agora | E2 velho | Não | Nova observação se material | Se a obs for Attempt |
| 5. Observação negativa falsa | “Não achei” | Timing | E7 | Não | Não afirmar failed de A | Idem |
| 6. Conflito | Discordância | Qual é o mundo | Duas E | Não | Perguntar / terceira obs | Sim se obs operacional |
| 7. Evidência antiga | Era verdade às 10:00 | 10:30 | Stale | Não para decidir agora | Reobservar se material | Idem |
| 8. Investigação confirma | Hipótese “A ocorreu” | Certeza causal | E2/E3 | Relativo ao snapshot | Não retry | Permit de B só |
| 9. Investigação negativa | “Não está lá agora” | Se A nunca ocorreu | E7/E3 | Não | Não retry automático | Idem |
| 10. Investigação inconclusiva | Unavailable | Tudo o mais | Falha de obs | Não | Permanece unknown | Não forçar failed |

---

## 17. Relação com Memory

```text
Observation → Context (deste Run / desta decisão)
Observation → candidata a Memory só se retenção explícita (Stage 22)
```

- Permanecer no Run: default.
- Auditoria: eventos `effect` / `attempt` — evidência histórica, não memória.
- Memória persistente: não automática.
- Memória **não** é evidência atual (stale por definição se o mundo muda).

---

## 18. Relação com Continuity

```text
Run A unknown → processo morre → Run B investigação
```

- Relação: **correlação** (conhecimento), não continuidade do Run A.
- A não precisa “continuar existindo” como `CoreRun`.
- B pode **informar** o que o mundo mostra agora; não altera o `AttemptOutcome` de A no core e **não** herda Permit de A.
- Investigar A ≠ continuar A.

---

## 19. Relação com Identity / Session

Origem da evidência importa para **confiança** (humano disse que viu o arquivo vs `stat` vs auto-relato). Não cria Identity.

Observação “pelo usuário” (`confirm`, preview) ≠ observação “pelo sistema” (`readFile`). Nenhuma das duas autoriza a próxima ação.

Auditoria futura pode anotar *que tipo* de evidência (reported/observed/human), sem `identityId`.

---

## 20. Modelos possíveis

| Modelo | Falso sucesso | Falso unknown | Custo | Universal? | J.A.R.V.I.S. |
|---|---|---|---|---|---|
| **A — execução basta** | Alto | Baixo | Mínimo | Não para efeito externo | Core hoje é A em `executed` |
| **B — + validação local** | Médio (valida produto, não disco) | Baixo | Baixo | Só produtos estruturados | **É o experimento documental** |
| **C — + observação externa sempre** | Baixo | Pode subir (obs falha) | Alto | Não | Desproporcional agora |
| **D — observação opcional / proporcional** | Controlado | Controlado | Sob demanda | Adequado à visão | **Direção futura** (unknown, irreversível, externo) |
| **E — verificação obrigatória antes de completed** | Mais baixo | Pode inflar unknown | Alto | Não | Só classes de efeito que o risco justificar |

Não escolher C/E para todo efeito. O experimento 01 pode permanecer A+B. Unknown já puxa para D **quando** alguém investigar — fora desta stage.

---

## 21. Limites do Core

O Core **não** precisa de Observation, Evidence, Verification, EpistemicState.

Precisa: Attempt autorizada, `executed`/`failed`/`unknown` honestos, efeito **opaco**.

| Camada | Papel |
|---|---|
| **Core** | Portão de autoridade; classificar incerteza da Attempt |
| **Runtime** | Quando investigar vs parar vs perguntar |
| **Capability** | Efeito concreto; pode **reportar**; não decide política |
| **Observability** | Registrar relatos e, no futuro, tipo da evidência |
| **Domain** | Validation (draft); critérios de verification se existirem |

> O Core garante que a ação autorizada rode uma vez e que a incerteza não seja fingida. Não precisa saber o que foi observado no mundo.

Não expandir o Core nesta stage.

Hipóteses futuras (não implementar): reler artefato após create; Attempt de investigação pós-unknown; marcar `CapabilityEffect.observed` como reported. Sem EvidenceManager.

---

## 22. Riscos

| Risco | Classe | Nota |
|---|---|---|
| `observed: true` lido como verification | R2 | Nome vs fato. Controlado se o modelo mandar |
| `completed` sem reler o arquivo | R2 | Aceitável no slice; não generalizar a email/API |
| Generalizar `inspect` sem Permit | R2 | Stage 21 |
| Observation automática → retry | R4 **se implementado** | Investigation ≠ retry |
| Observation → Permit | R4 **se implementado** | |
| Confidence engine | R1 | Sem evidência |
| Verificação obrigatória universal | R1 | Custo; infla unknown |

Sem R3/R4 ativos. O core já recusa converter unknown em failed/executed.

---

## 23. Questões abertas

- Investigação pós-`create_artifact` unknown: `inspect` do destino ou `read_source` com política nova?
- Deve o runner, um dia, reler o `.md` antes de `completed` (D mínimo) sem virar engine?
- Corrigir o nome `observed` na documentação de capability vs no tipo (só quando houver mudança de código autorizada).
- Efeito social (email): qual E3/E4 mínima — fora do experimento.

---

## 24. Classificação da Stage

**B — aprovado com riscos.**

As quatro regras se sustentam no runtime: execução não é efeito (`unknown`); evidência não é verdade (`observed` auto-relatado); observação não autoriza (`inspect`/`read` não emitem Permit de escrita); conhecimento não continua autoridade (Stage 25).

Não é A: validação está deslocada do efeito persistente; `CapabilityEffect.observed` é enganoso; não há observação independente pós-write.

Não implementar observador, verificador, polling nem store.
