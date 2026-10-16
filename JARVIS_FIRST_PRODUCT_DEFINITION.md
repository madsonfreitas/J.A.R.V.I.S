# J.A.R.V.I.S. — First Product Definition

**Stage:** 28
**Natureza:** decisão de produto. Nenhum código, UI, planner, memória ou stack nova.
**Base:** `JARVIS_CONTEXT.md` §§24–26, `EXPERIMENT_01_SELECTION.md`, ADR-005/007, Stages 18C–27, código em `src/cycle` e `src/documentary`.

O experimento C (documentos → artefato) **não é o produto**. É a fatia que melhor exercitou o núcleo. O primeiro produto reutiliza essa *forma* (intenção + fontes autorizadas + efeito controlado + validação) e **proíbe** que o J.A.R.V.I.S. seja “o app de Markdown”.

Não existe `EXPERIMENT_01_SPEC.md` no repositório. A spec de validação do ciclo documental está em `EXPERIMENT_02_SPEC.md`.

---

## 1. Objetivo do Stage

Responder qual é o primeiro produto *real* que prova o J.A.R.V.I.S. como produto, sem reduzir a identidade ao primeiro caso.

Diferenciar:

| | |
|---|---|
| Documentado | Visão, invariantes, stages 17–27, ADRs |
| Implementado | CLI + `CoreRun`/`Permit` + roteiro documental + Anthropic + SQLite de auditoria |
| Testado | 33 testes de ciclo, política, unknown, arquivos |
| Validado semanticamente como produto | **Não.** Ninguém usou isso como ferramenta de trabalho recorrente |

---

## 2. Critérios de um produto realmente J.A.R.V.I.S.

Origem: `JARVIS_CONTEXT.md` §§24–26, Stages 18C–27. Não inventados aqui.

O primeiro produto só é J.A.R.V.I.S. se:

1. Parte de **intenção** em linguagem natural, não de um formulário de feature (`CONTEXT` 26.4).
2. Produz **resultado verificável**, não só texto convincente (`CONTEXT` 24, 25).
3. Cruza **inteligência e execução** (segundo cérebro + par de mãos, mesmo que o “mão” seja um artefato novo) (`CONTEXT` 26.3).
4. Toda ação material passa por **Attempt + política + Permit de uso único** (18C).
5. **Contexto, memória, preferência, UI e histórico não autorizam** (20–24, 27).
6. Distingue **esclarecimento ≠ Goal-confirm ≠ autorização de efeito ≠ cancelamento** (27).
7. Trata **unknown ≠ failed ≠ executed** (19, 25, 26).
8. **Cancelar não desfaz** (19).
9. O domínio **não define o Core** (`CONTEXT` 26.17–18; extração ciclo/documental).
10. O usuário **controla** efeitos relevantes e vê incerteza (`CONTEXT` 25 Controle).
11. Utilidade > sofisticação (`CONTEXT` 26.20).
12. Interface **não é o núcleo** (ADR-005; Stage 27 modelo B/C).

Se falhar nisto, é “app com LLM”.

---

## 3. Primeiro usuário

**Madson**, engenheiro de software, fundador, único usuário acessível (ADR-005: “adequada ao fundador”).

Contexto: trabalho próprio (especificações, notas, fontes locais, o repo J.A.R.V.I.S.). Técnico. Tolera CLI. Precisa de resultado que possa confrontar com arquivos.

Não determinado empiricamente: frequência semanal da dor. Isso é questão aberta, **não** R3: o usuário existe e pode recusar o MVP na primeira semana de uso real.

Não escolher um “PM genérico” ou “empresa”: não há acesso.

---

## 4. Problema

Madson junta intenção + um punhado de arquivos e precisa de um **artefato novo**, rastreável, que não corrompa originais — briefing, síntese, checklist, rascunho de spec — com o sistema **não inventando** o que as fontes não sustentam e **não enviando** conteúdo sem consentimento.

Dor: reconstruir contexto à mão, misturar rascunho com fonte, não saber o que foi enviado ao modelo.

Não é: “preciso de um CMS”. Não é: “preciso que o agente commite sozinho”.

---

## 5. Intenção

Forma natural:

> “A partir destas fontes, produz um [brief / síntese / spec mínima] para [finalidade], sem inventar fatos.”

Pequena, real (o fundador já vive isso no próprio projeto), atravessa o ciclo, verificável (artefato vs fontes), segura (allowlist, `wx`, confirmações), revela limites (lacunas, unknown, recusa).

Não é um comando de ferramenta (`touch agenda.md`) como identidade do produto; esse comando pode ocorrer, mas o produto é **intenção → resultado autorizado**.

---

## 6. Resultado

Um arquivo **novo** (Markdown neste MVP, porque já é o formato do slice — não porque Markdown seja o J.A.R.V.I.S.) com seções, proveniência, lacunas e conflitos; status honesto (`completed` / reservas / `failed` / `unknown` / `cancelled`); `runId` para auditoria.

---

## 7. Candidatos

### C1 — Síntese operacional autorizada (forma do experimento C, produto do fundador)

Intenção + fontes locais allowlisted → artefato novo + validação de rastreabilidade + Permit por envio e por criação.

### C2 — Plano do dia (experimento A)

Objetivos e restrições → plano textual. Quase sem efeito material.

### C3 — Brief de decisão com pesquisa aberta (experimento B + web)

Pergunta → busca → recomendação. Efeito fraco; verificação subjetiva; chatbot.

### C4 — Agente de repositório (fatia de D)

Intenção sobre o git/código → diff ou commit. Alto valor para o fundador, altíssimo risco de identidade “fork do Cursor” e de efeito irreversível.

---

## 8. Matriz de decisão

Pesos alinhados a `JARVIS_CONTEXT.md` §24 e à seleção do experimento (valor, verificabilidade, diferencial, fatia pequena, núcleo, frequência). Esforço/risco: nota alta = mais favorável.

| Critério | Peso | C1 | C2 | C3 | C4 | Origem |
|---|---|---|---|---|---|---|
| Valor real para o fundador | 20% | 4 | 3 | 3 | 5 | CONTEXT 24 |
| Verificabilidade | 20% | 5 | 2 | 2 | 4 | CONTEXT 24; Stage 26 |
| Cobertura do diferencial (intenção–controle–efeito) | 20% | 5 | 2 | 3 | 5 | CONTEXT 24; 18C |
| Fatia pequena / esforço | 15% | 5 | 4 | 2 | 1 | CONTEXT 24; código já existe para C1 |
| Aprender o núcleo sem capturar identidade | 15% | 4 | 3 | 2 | 1 | CONTEXT 26.17–18; EXPERIMENT_01 C vs D |
| Frequência | 10% | 4 | 5 | 3 | 4 | CONTEXT 24 |
| **Ponderado /5** | | **4,55** | **2,95** | **2,50** | **3,45** | |

C4 perde em identidade e esforço apesar do valor. C2/C3 falham em “não é só texto”. C1 vence **como primeiro produto**, não como destino do J.A.R.V.I.S.

Incerteza: se Madson não tiver fontes reais nas próximas semanas, C1 não prova utilidade (hipótese PRODUCT, não R3).

---

## 9. Produto escolhido

## Primeiro Produto Real do J.A.R.V.I.S.

**Nome de trabalho (não marca):** síntese operacional autorizada.

**Não é:** produto documental, RAG, editor, agente de git.

### Problema

Transformar intenção + fontes que o usuário autorizou em um artefato novo, rastreável, sem alterar originais e sem efeito externo oculto.

### Usuário

Madson (fundador técnico).

### Intenção

Ver §5.

### Resultado

Arquivo novo + relatório de validação + status honesto.

### Efeito

Criação persistente local (`wx`). Chamadas ao modelo (comunicação externa). Leituras allowlisted. Sem overwrite, email, commit, browser.

### Capacidades

As já nomeadas: `read_source`, `send_intention_to_model`, `send_sources_to_model`, `create_artifact`. `inspect` permanece preparação, não o modelo a generalizar.

### Contexto

Paths e intenção do usuário; conteúdo lido após Permit; `untrusted_content`. Sem memória, sem RAG.

### Autoridade

Política documental + `confirm` por Attempt de envio/criação; Goal-confirm separado; Permit de uso único.

### Execução

Roteiro atual (`ExperimentRunner`) sobre **fontes reais do fundador**, não só fixtures.

### Evidência

E1 (retorno) + auto-relato `CapabilityEffect` (Stage 26). Reler o artefato: **fora do MVP** salvo `unknown`.

### Validação

`ResultValidator` no draft (proveniência, seções). Não verification do disco.

### Feedback

Uso repetido, recusa, cancelamento, correção verbal na próxima intenção. Sem MemoryManager.

### Memória

**Nenhuma persistente.** ADR-007. Auditoria SQLite ≠ memória.

---

## 10. Ciclo completo

| Etapa | Neste produto | Persistida? | Humano? | Auth? | Evidência? |
|---|---|---|---|---|---|
| Intenção | Sim | Texto no recorder | Sim | Não | — |
| Compreensão | Attempt `send_intention` | Eventos | Confirm do envio | Permit | Resposta do modelo / unknown |
| Contexto | Leituras + TaskContext | Não o texto; warnings sim | Paths | Permit de read | Bytes lidos |
| Planejamento | **Não explícito** (roteiro) | Não | Não | — | Stage 23 |
| Capacidade | Strings da proposta | No evento attempt | Não precisa conhecer | — | — |
| Política | `ExperimentPolicy` | Evento policy | — | Decide | — |
| Permissão | Permit volátil | Só booleanos de audit | Confirm de efeito | Sim | Stage 25: audit ≠ Permit |
| Execução | fs / Anthropic | — | Status | Após Permit | Stage 26 |
| Evidência | Relato + unknown | Evento effect | Mensagem | — | E1; sem verification |
| Validação | Draft vs fontes | Evento validation | Preview | Não | Conteúdo, não disco |
| Resultado | `ExperimentResult` | `finish` | stdout | — | Status honesto |
| Memória / feedback | Só feedback implícito (próxima intenção) | Não | Opcional | Não | — |

Omitidos de propósito: planner, memória, observation engine, Session.

---

## 11. Capacidades

Ver §9. Nenhuma tool nova. Nenhuma capability nova. Segundo domínio **não** entra no primeiro produto.

---

## 12. Contexto

| Precisa agora? | O quê |
|---|---|
| Sim | Intenção, paths, conteúdo lido, clarifications do Run |
| Não | Memória, histórico de outros Runs como contexto, web, RAG, Session |
| Incerto | Preferência de seções — vira esclarecimento, não memória |

---

## 13. Autoridade

| Ação | Classe de efeito | Quem autoriza | Reuso? |
|---|---|---|---|
| inspect | preparação / leitura de metadados | Ninguém via Permit (exceção conhecida) | N/A |
| read_source | leitura persistente local | Política allowlist (`allow`) | Não entre Attempts |
| send_* | comunicação externa | `require_approval` + confirm desta Attempt | Não |
| create_artifact | criação persistente, pouco reversível (`wx`) | `require_approval` + confirm + destino | Não |

Sucesso de envio **não** autoriza criar. Contexto/memória/preferência/aprovação de ontem **não** autorizam.

---

## 14. Interação

Stage 27 / CLI:

- Perguntar: Goal.questions.
- Autorizar efeito: `confirm` da Attempt.
- Goal-confirm: outro ato.
- Continuar: `allow` em leitura allowlisted.
- Progresso: `[status] mensagem`.
- Falha / unknown / cancel: status terminal honesto.
- Cancelar: recusar confirm (não aborta IO em curso).

---

## 15. Evidência

Criar arquivo: E1 + `observed: true` auto-relatado. Unknown se write/`unlink` incerto ou HTTP incerto.

Suficiente para o MVP do fundador **se** unknown não for vendido como sucesso. Reler disco: OUT, salvo investigação explícita futura.

---

## 16. Validação

Rastreabilidade e seções no draft. Utilidade: o fundador usaria de novo (`CONTEXT` 25). Não aceitar “a função retornou” como prova do mundo (26); aceitar como prova da Attempt.

---

## 17. Memória

**Não precisa.** Candidatos futuros (formato preferido, paths habituais) ficam fora. Quem retém: o humano, na próxima intenção. Auditoria não vira memória.

---

## 18. Generalização

| Elemento | Reutilizável | Específico | Justificativa |
|---|---|---|---|
| Intenção | Sim | — | String / compreensão |
| Objetivo | Vocabulário do ciclo | audience/seções documentais | Stage 23/24 |
| Contexto | Ideia | TaskContext de arquivos | Stage 20 |
| Planejamento | Opcional | Roteiro documental | Stage 23 |
| Capacidade | Rótulo opaco | Os quatro nomes | Stage 21 |
| Política | Mecanismo evaluate | Regras de path/.md | 18C |
| Permissão | CoreRun/Permit | — | 18C |
| Execução | attempt/execute | fs + Anthropic | Core vs adapters |
| Evidência | unknown vs executed | CapabilityEffect.observed | 26 |
| Validação | Necessidade | ResultValidator de draft | Generalization test 14.5 |
| Resultado | RunStatus | ExperimentResult | 19 |
| Memória | Fora | — | ADR-007 |
| Interação | Porto ask/confirm | CLI, preview MD | 27 |

Se o próximo produto for plano do dia, Permit/Attempt/unknown/confirm **continuam**. Markdown e `read_source` **não**.

---

## 19. MVP IN

- Usuário: fundador, CLI supervisionada.
- Intenção + allowlist de fontes locais.
- Ciclo 18C: proposta → política → confirm de efeito → Permit → execute.
- Goal-confirm separado.
- Esclarecimento sem autorizar efeito.
- Artefato novo `wx`, originais intactos.
- Validação de proveniência do draft.
- `unknown` / `failed` / `cancelled` visíveis.
- Auditoria SQLite local.
- Uso em **pelo menos um conjunto real** de arquivos do fundador (não só fixtures).

---

## 20. MVP OUT

Voz, visão, desktop automation, browser autônomo, multi-agente, multiusuário, memória/RAG, plugins, MCP, monitoramento, proatividade, automações, paralelismo, cloud, mobile, distribuído, Planner, ConversationManager, verification engine, resume, Session/Identity, git commit, email, overwrite, pesquisa web.

Exclusão por **necessidade do primeiro produto**, não dogma. C4 e C3 puxariam várias dessas linhas cedo demais.

---

## 21. Critérios de não-J.A.R.V.I.S.

O MVP **falha** se:

- só gerar texto sem Attempt/Permit de efeito;
- pular confirm de envio ou criação;
- tratar unknown como completed/failed;
- Goal-confirm emitir Permit;
- o Core importar Markdown/fs/Anthropic de novo;
- o marketing chamar o produto de “assistente de documentos”;
- sucesso = função retornou, sem status honesto;
- contexto/memória autorizarem;
- efeito externo (email, commit) sem política nova explícita.

---

## 22. Riscos

| Risco | Classe | Nota |
|---|---|---|
| Captura de identidade (“JARVIS = docs”) | R2 | Mitigar na linguagem do produto e no OUT |
| Fundador não repetir o uso | R2 | Critério de sucesso CONTEXT 25; pivot para outro caso, não redesenhar Core |
| `observed: true` / sem reler arquivo | R2 | Stage 26; aceitável no MVP |
| `inspect` sem Permit | R2 | Não generalizar |
| Empurrar C4 (git) no MVP | R4 **se feito agora** | Identidade + efeito irreversível |
| Memória/RAG “porque a visão tem memória” | R1 | ADR-007 |
| Utilidade não medida | R1 | Primeira semana de uso real |

Sem R3/R4 **ativos** na escolha C1.

---

## 23. Questões abertas

- Madson usará C1 em fontes reais nas próximas iterações? (utilidade)
- Nome visível do MVP (não “Documentary Product”).
- Se C1 não tiver frequência, C2 entra como *segundo* caso de generalização, não como substituto do Core.
- Reler artefato após `unknown` de create: ainda OUT.

Não bloqueiam definir o produto.

---

## 24. Critérios de aceitação do Stage

| # | Resposta |
|---|---|
| 1 Usuário | Madson / fundador |
| 2 Problema | Síntese autorizada de fontes → artefato novo |
| 3 Intenção | §5 |
| 4 Resultado | Arquivo + validação + status |
| 5 Efeito | Leituras, envio ao modelo, create `wx` |
| 6 Capacidades | As quatro atuais |
| 7 Autorização | Envio e criação; leitura por allowlist |
| 8 Contexto | Intenção, paths, conteúdos lidos neste Run |
| 9 Interação | CLI: ask / Goal-confirm / confirm de efeito |
| 10 Falha | Attempt/Run `failed`; validação inválida |
| 11 unknown | Terminal; não retry; não “falhou” |
| 12 Validação | Proveniência do draft |
| 13 Memória | Nenhuma |
| 14 Só contexto | Run atual |
| 15–16 MVP | §§19–20 |
| 17 Prova JARVIS | Ciclo + Permit + incerteza honesta + artefato |
| 18 Generalização | Tabela §18 |
| 19 Riscos | R1/R2; sem R3/R4 |
| 20 R3/R4 | Não |

---

## 25. Classificação final

**B — aprovado com riscos.**

O primeiro produto está definido com fronteira. Não é A: utilidade real ainda não foi observada; o risco de captura documental permanece e tem de ser recusado na linguagem e no OUT.

Próxima construção (quando autorizada) é **uso real do ciclo já existente**, não um produto novo nem um Planner.

Não implementar neste Stage.
