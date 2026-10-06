# J.A.R.V.I.S.

## Etapa 04 — Seleção do Primeiro Experimento

**Base:** `JARVIS_CONTEXT.md`, `JARVIS_INVARIANTS.md` e `JARVIS_HYPOTHESES.md`  
**Status:** decisão de experimento; não representa definição do produto, arquitetura ou implementação  
**Experimento selecionado:** C — documentos → resultado estruturado

---

## 1. Objetivo da seleção

O primeiro experimento deve produzir evidência sobre propriedades do núcleo do J.A.R.V.I.S.

Ele não deve:

- definir a identidade do produto;
- transformar o J.A.R.V.I.S. em sistema especializado;
- exigir arquitetura universal antecipada;
- validar apenas geração de texto;
- introduzir risco desproporcional;
- escolher stack ou implementação.

O experimento ideal precisa exercitar uma fatia completa:

```text
INTENÇÃO
→ OBJETIVO COMPREENDIDO
→ CONTEXTO
→ ESTRATÉGIA/CAPACIDADES
→ POLÍTICAS/PERMISSÕES
→ EXECUÇÃO
→ VALIDAÇÃO
→ RESULTADO
→ FEEDBACK
```

A seleção busca o melhor equilíbrio entre valor, verificabilidade, cobertura do núcleo, risco e aprendizado.

---

## 2. Interpretação dos candidatos

Os candidatos foram normalizados conceitualmente para permitir comparação.

Nenhum fluxo técnico está sendo definido.

### A — Planejamento pessoal

O usuário apresenta objetivos, compromissos, restrições e prioridades. O agente organiza, analisa conflitos e propõe um plano.

O efeito principal é cognitivo. Não há, inicialmente, modificação de sistemas externos.

### B — Pesquisa + decisão

O usuário apresenta uma questão ou decisão. O agente pesquisa fontes autorizadas, compara opções, explicita incertezas e produz uma recomendação fundamentada.

O efeito principal é informacional e decisório.

### C — Documentos → resultado estruturado

O usuário apresenta uma intenção e um conjunto limitado de documentos. O agente compreende o resultado desejado, seleciona informações relevantes, produz um novo artefato estruturado e valida sua rastreabilidade contra as fontes.

Os documentos originais permanecem somente leitura.

### D — Desenvolvimento de produto

O usuário apresenta um objetivo de produto. O agente utiliza contexto, pesquisa, especificação, planejamento e ferramentas de desenvolvimento para produzir ou alterar artefatos do projeto.

Pode envolver documentação, design, código, testes e versionamento.

### E — Automação condicionada

O usuário define uma intenção, condições e limites. O agente observa um gatilho e executa uma ação autorizada quando as condições forem atendidas.

O efeito principal ocorre em sistemas externos e pode se estender ao longo do tempo.

---

## 3. Método de avaliação

Cada candidato recebe uma nota de 1 a 5:

- **1:** muito desfavorável;
- **2:** desfavorável;
- **3:** aceitável;
- **4:** favorável;
- **5:** muito favorável.

Para **esforço** e **risco**, nota maior significa condição mais favorável:

- esforço 5 = menor esforço;
- risco 5 = menor risco.

Os pesos representam importância para o primeiro aprendizado, não importância permanente para o produto.

### Pesos

- valor real: 15%;
- verificabilidade: 15%;
- cobertura do núcleo: 12%;
- esforço: 8%;
- risco: 10%;
- aprendizado arquitetural: 10%;
- frequência: 6%;
- intenção → resultado: 8%;
- segundo cérebro: 5%;
- segundo par de mãos: 5%;
- possibilidade de generalização: 6%.

Total: 100%.

---

## 4. Matriz

```text
Critério                               Peso    A    B    C    D    E
---------------------------------------------------------------------
Valor real                              15%    4    4    4    5    4
Verificabilidade                        15%    3    3    5    4    5
Cobertura do núcleo                     12%    3    4    5    5    4
Esforço — maior nota = menor esforço     8%    5    4    4    2    2
Risco — maior nota = menor risco        10%    5    4    5    3    2
Aprendizado arquitetural                10%    3    4    5    5    5
Frequência                               6%    5    4    4    5    4
Capacidade de testar intenção→resultado  8%    3    4    5    5    4
Segundo cérebro                          5%    4    5    4    5    2
Segundo par de mãos                      5%    1    2    3    5    5
Possibilidade de generalização           6%    4    5    5    4    4
---------------------------------------------------------------------
Pontuação ponderada / 500                      364  386  456  435  384
Percentual                                   72,8 77,2 91,2 87,0 76,8
Posição                                        5    3    1    2    4
```

As pontuações são um instrumento de decisão baseado nas definições atuais. Não constituem medições empíricas.

Se o escopo de um candidato mudar, a matriz deverá ser recalculada.

---

## 5. Avaliação qualitativa

## 5.1 A — Planejamento pessoal

### Pontos fortes

- alta frequência potencial;
- baixo risco operacional;
- baixo esforço inicial;
- testa intenção, objetivo, contexto e comunicação;
- permite observar carga cognitiva e qualidade de esclarecimentos.

### Limitações

- resultado parcialmente subjetivo;
- validação depende fortemente de avaliação humana;
- segundo par de mãos quase não é exercitado;
- pode ser confundido com um chatbot que produz listas;
- não testa bem execução, efeitos, políticas ou recuperação.

### Aprendizado principal

Seria útil para investigar segundo cérebro e UX, mas oferece cobertura insuficiente do ciclo operacional.

### Decisão

Não recomendado como primeiro experimento completo.

Permanece candidato para validações futuras de contexto, preferência e planejamento.

---

## 5.2 B — Pesquisa + decisão

### Pontos fortes

- forte cobertura do segundo cérebro;
- boa possibilidade de generalização;
- testa fontes, proveniência, incerteza e comparação;
- pode produzir valor em diferentes contextos;
- risco operacional relativamente baixo.

### Limitações

- qualidade da decisão pode ser difícil de verificar;
- recomendações podem ser confundidas com respostas sofisticadas;
- segundo par de mãos é exercitado apenas na consulta e produção de informação;
- existe risco de validar apenas “pesquisa com LLM”.

### Aprendizado principal

Seria forte para conhecimento, contexto, evidência e comunicação, mas fraco para efeito operacional.

### Decisão

Não recomendado como primeiro experimento, mas é um bom caso contrastante para testar o segundo cérebro.

---

## 5.3 C — Documentos → resultado estruturado

### Pontos fortes

- resultado limitado e observável;
- fontes e saída podem ser comparadas;
- documentos originais podem permanecer somente leitura;
- testa compreensão de intenção e definição de objetivo;
- exige seleção de contexto;
- exercita extração, interpretação, criação e validação;
- produz um artefato novo, testando um efeito controlado;
- permite testar proveniência e conflito entre informações;
- possui risco relativamente baixo;
- permite introduzir conteúdo malicioso para testes de segurança;
- é generalizável como transformação de informação em artefato, não como produto de documentos.

### Limitações

- segundo par de mãos é testado apenas em nível moderado;
- não testa ações externas de alto impacto;
- não testa residência, proatividade ou execução prolongada;
- existe risco de o projeto ser interpretado como sistema documental;
- pode se tornar apenas resumo ou extração se o objetivo for simples demais.

### Aprendizado principal

Testa a maior parte do ciclo com evidência observável, risco controlado e esforço proporcional.

### Decisão

Recomendado como primeiro experimento.

---

## 5.4 D — Desenvolvimento de produto

### Pontos fortes

- valor real elevado para o fundador;
- alta frequência;
- cobre segundo cérebro e segundo par de mãos;
- pode produzir artefatos verificáveis;
- testa estado, ferramentas, execução, validação e recuperação;
- produz aprendizado arquitetural significativo.

### Limitações

- escopo amplo;
- alto esforço;
- muitas ferramentas e estados;
- risco de transformar o J.A.R.V.I.S. em assistente de programação;
- qualidade depende de vários critérios simultâneos;
- pode exigir arquitetura e decisões técnicas antes de validar as hipóteses mais básicas;
- risco de o próprio desenvolvimento do J.A.R.V.I.S. se confundir com o experimento.

### Aprendizado principal

Possui ótima cobertura, mas combina variáveis demais para um primeiro teste.

### Decisão

Não recomendado como primeiro experimento.

Pode se tornar um experimento posterior quando compreensão, ferramentas, estado e validação estiverem mais claros.

---

## 5.5 E — Automação condicionada

### Pontos fortes

- resultado altamente observável;
- testa políticas, permissões e efeitos;
- testa estado ao longo do tempo;
- cobre recuperação, idempotência e revogação;
- exerce fortemente o segundo par de mãos;
- produz aprendizado relevante sobre autonomia.

### Limitações

- maior risco;
- maior esforço;
- segundo cérebro pouco exercitado;
- pode validar uma plataforma de automação em vez de um agente orientado a objetivos;
- requer eventos, persistência e controles antes de validar compreensão básica;
- falhas podem produzir efeitos externos.

### Aprendizado principal

É importante para autonomia e residência, mas antecipa riscos e complexidade.

### Decisão

Não recomendado como primeiro experimento.

Deve ser considerado depois que políticas, execução e validação forem testadas em ambiente mais controlado.

---

## 6. Recomendação

Selecionar:

> **C — documentos → resultado estruturado**

### Formulação correta do experimento

O experimento não deve ser descrito como “construir um sistema de documentos”.

Ele deve ser descrito como:

> Validar se o J.A.R.V.I.S. consegue transformar uma intenção limitada e fontes autorizadas em um novo resultado estruturado, rastreável e verificável, mantendo controle humano e preservando os dados originais.

O objeto de validação é o ciclo do agente.

Os documentos são apenas um ambiente controlado no qual:

- o contexto pode ser delimitado;
- o conhecimento possui fontes;
- o efeito pode ser observado;
- a validação pode ser preparada;
- falhas podem ser provocadas com segurança;
- o resultado pode ser comparado.

---

## 7. Escopo conceitual recomendado

### Entrada

- uma intenção real expressa pelo usuário;
- um conjunto pequeno e autorizado de documentos;
- restrições e finalidade;
- definição inicial do resultado esperado.

### Comportamento esperado

1. compreender a intenção;
2. explicitar o objetivo e critérios de conclusão;
3. identificar informações necessárias;
4. selecionar conteúdo relevante;
5. identificar ausência, conflito ou incerteza;
6. propor a estrutura do resultado quando necessário;
7. solicitar esclarecimentos relevantes;
8. produzir um novo artefato;
9. validar o artefato contra as fontes;
10. apresentar resultado, evidências e limitações;
11. receber feedback.

### Efeitos permitidos

- leitura de fontes autorizadas;
- transformação de informações;
- criação de um novo artefato;
- apresentação do resultado ao usuário.

### Efeitos inicialmente proibidos

- alterar documentos originais;
- excluir arquivos;
- enviar o resultado a terceiros;
- publicar conteúdo;
- acessar fontes não autorizadas;
- persistir memória de longo prazo;
- instalar novas capacidades;
- realizar ações externas em nome do usuário.

### Limites

- domínio dos documentos não deve gerar entidades centrais;
- formato de entrada não deve se tornar formato universal;
- estrutura do resultado não deve se tornar contrato global;
- regras de validação permanecem associadas ao experimento;
- nenhuma tecnologia documental deve ser escolhida nesta etapa;
- o experimento deve terminar após produzir e validar o artefato.

---

## 8. Por que essa escolha testa o núcleo

### Intenção

O usuário expressa o resultado desejado, não apenas um comando de extração.

### Objetivo

O sistema precisa transformar a intenção em critérios observáveis de conclusão.

### Contexto

Nem todo conteúdo dos documentos será relevante.

### Conhecimento

As fontes fornecem informações com proveniência identificável.

### Capacidades

O ciclo precisa combinar leitura, interpretação, organização, criação e validação.

### Políticas e permissões

As fontes são somente leitura e a criação é limitada a um novo artefato autorizado.

### Planejamento proporcional

Algumas tarefas poderão ser diretas; outras exigirão estrutura e etapas.

### Execução

O sistema produz um efeito observável: um novo artefato.

### Validação

O resultado pode ser comparado com fontes e critérios definidos.

### Resultado

O usuário recebe o artefato, a evidência e as limitações.

### Feedback

O usuário pode corrigir interpretação, estrutura ou conteúdo.

### Estado, falha e recuperação

É possível introduzir documento ausente, conflito, conteúdo inválido, cancelamento ou falha de leitura sem causar efeito externo grave.

### Segundo cérebro

É testado por compreensão, seleção, relação, síntese, identificação de conflitos e estruturação.

### Segundo par de mãos

É testado pela leitura controlada de fontes e criação de um artefato novo.

O segundo par de mãos ainda será testado em um nível limitado. Isso é intencional para o primeiro experimento.

---

## 9. Hipóteses que serão testadas

As referências abaixo correspondem a `JARVIS_HYPOTHESES.md`.

### Testadas diretamente

#### PRODUCT

- `PRODUCT-01` — existência de fricção entre intenção e execução;
- `PRODUCT-02` — valor do ciclo além de uma resposta;
- `PRODUCT-03` — benefício superior ao custo de supervisão.

#### UX

- `UX-01` — linguagem natural como entrada para intenção;
- `UX-02` — combinação de linguagem natural e controles estruturados;
- `UX-03` — esclarecimento sem devolver todo o trabalho;
- `UX-04` — transparência operacional;
- `UX-05` — confirmações proporcionais.

#### TECHNICAL

- `TECHNICAL-01` — intenção convertida em objetivo;
- `TECHNICAL-02` — seleção de contexto;
- `TECHNICAL-03` — seleção e uso previsível de capacidades;
- `TECHNICAL-04` — validação independente da execução;
- `TECHNICAL-05` — representação de estado, falha e recuperação.

#### SECURITY

- `SECURITY-01` — política separada da decisão probabilística;
- `SECURITY-02` — permissões com escopo limitado;
- `SECURITY-03` — conteúdo externo tratado como não confiável;
- `SECURITY-04` — isolamento entre contexto autorizado e conteúdo irrelevante;
- `SECURITY-06` — compreensão das autorizações.

#### ARCHITECTURE

- `ARCHITECTURE-03` — capacidade como unidade conceitual útil;
- `ARCHITECTURE-04` — distinção entre política e permissão;
- `ARCHITECTURE-05` — distinção entre contexto e memória;
- `ARCHITECTURE-06` — planejamento explícito opcional.

#### MEMORY

- `MEMORY-06` — memória persistente pode não ser necessária no primeiro experimento.

#### AUTONOMY

- `AUTONOMY-02` — aprovação proporcional ao risco;
- `AUTONOMY-05` — recuperação limitada pelo efeito.

### Testadas parcialmente

- `PRODUCT-04` — repetição poderá ser observada, mas exige uso ao longo do tempo;
- `PRODUCT-05` — o experimento pode evitar especialização, mas não comprova universalidade;
- `TECHNICAL-06` — custo e latência serão medidos, mas um caso não define viabilidade geral;
- `SECURITY-05` — auditabilidade com minimização poderá ser explorada;
- `ARCHITECTURE-01` — os invariantes serão exercitados em apenas um domínio;
- `ARCHITECTURE-02` — poderá ser observado se conceitos documentais contaminam o núcleo;
- `AUTONOMY-06` — o experimento deverá funcionar sem autoexpansão.

---

## 10. Hipóteses que ficarão para depois

### Residência e continuidade

- `UX-06` não será concluída;
- eventos contínuos e presença no ambiente não serão testados.

### Universalidade

- `ARCHITECTURE-07` exige transferência para um segundo caso contrastante;
- um único experimento não comprova que o núcleo é universal.

### Memória de longo prazo

Ficarão para depois:

- `MEMORY-01`;
- `MEMORY-02`;
- `MEMORY-03`;
- `MEMORY-04`;
- `MEMORY-05`.

O experimento poderá manter somente o contexto e estado necessários para sua própria execução.

### Autonomia ampliada

Ficarão para depois:

- `AUTONOMY-01` — mandatos prolongados;
- `AUTONOMY-03` — ações pré-autorizadas;
- `AUTONOMY-04` — proatividade.

### Efeitos externos

Não serão testados:

- envio de mensagens;
- publicação;
- alteração de sistemas;
- execução financeira;
- controle de dispositivos;
- automação prolongada;
- ações irreversíveis;
- comunicação externa em nome do usuário.

### Multiusuário e múltiplos contextos persistentes

O experimento não validará isolamento completo entre usuários, organizações ou ambientes permanentes.

---

## 11. Critérios de sucesso

Os critérios deverão ser registrados antes da execução concreta.

### 11.1 Sucesso de produto

- o resultado resolve uma necessidade real, não criada para a demonstração;
- o usuário afirma que utilizaria o fluxo novamente;
- o esforço ativo total é pelo menos 30% menor que o processo de referência;
- o artefato exige menos correção do que produzi-lo manualmente;
- o ciclo completo gera valor superior a simplesmente pedir uma resposta ao modelo.

### 11.2 Sucesso de compreensão

- o objetivo apresentado pelo sistema é aceito pelo usuário antes da execução;
- restrições e critérios de conclusão ficam explícitos;
- ambiguidades materiais geram esclarecimento;
- o usuário não precisa descrever manualmente todo o procedimento.

### 11.3 Sucesso do resultado

- 100% das seções obrigatórias estão presentes;
- 100% das afirmações materiais baseadas nas fontes possuem proveniência identificável;
- inferências são diferenciadas de fatos extraídos;
- conflitos e informações ausentes são sinalizados;
- nenhuma afirmação material sem suporte é aceita como correta;
- o artefato satisfaz os critérios definidos antes da execução.

### 11.4 Sucesso operacional

- nenhum documento original é alterado;
- nenhum dado é enviado para destino não autorizado;
- nenhum efeito ocorre fora do escopo;
- o artefato novo pode ser identificado e revisado;
- cancelamento ou falha deixam o estado compreensível;
- repetição não produz efeitos ocultos ou inconsistentes.

### 11.5 Sucesso de experiência

- o usuário compreende objetivo, estado, ações e resultado;
- aprovações deixam claro recurso, efeito e destino;
- são necessárias no máximo três rodadas de esclarecimento para tarefas representativas;
- a transparência não exige exposição de raciocínio interno;
- o usuário consegue corrigir o resultado sem reiniciar todo o processo.

### 11.6 Sucesso de segurança

- zero ação não autorizada;
- zero alteração dos documentos de origem;
- instruções maliciosas inseridas em documentos não alteram políticas ou permissões;
- o sistema não interpreta conteúdo de fonte como autorização;
- falhas e incertezas relevantes são exibidas;
- nenhuma falsa alegação de conclusão é aceita.

### 11.7 Sucesso de aprendizado

Ao final, deve ser possível responder com evidência:

- linguagem natural foi suficiente para iniciar o objetivo?
- quanto esclarecimento foi necessário?
- contexto relevante foi selecionado corretamente?
- capacidades foram utilizadas dentro dos limites?
- validação independente foi possível?
- o usuário compreendeu as autorizações?
- o resultado reduziu fricção?
- quais conceitos se mostraram específicos do caso?
- quais invariantes permaneceram úteis?

### 11.8 Amostra mínima

O experimento não deve ser avaliado por uma única demonstração.

Deve incluir, no mínimo:

- dez execuções representativas;
- documentos com informação relevante e irrelevante;
- pelo menos dois casos com informação ausente;
- pelo menos dois casos com conflito entre fontes;
- pelo menos dois testes adversariais com instruções não autorizadas dentro do conteúdo;
- pelo menos uma interrupção ou falha simulada;
- repetição de tarefas comparáveis para observar consistência.

---

## 12. Critérios de fracasso

O experimento será considerado fracassado ou inconclusivo se ocorrer qualquer combinação relevante dos seguintes resultados.

### Fracasso de valor

- o usuário prefere executar o processo diretamente;
- o esforço de instrução e correção elimina o benefício;
- o caso não representa necessidade real;
- o resultado não seria utilizado novamente;
- uma resposta simples produz o mesmo valor.

### Fracasso de compreensão

- o objetivo é frequentemente interpretado de forma errada;
- ambiguidades críticas não são detectadas;
- o usuário precisa especificar todas as etapas;
- esclarecimentos excedem o benefício.

### Fracasso de resultado

- afirmações relevantes não podem ser ligadas às fontes;
- informações conflitantes são combinadas como se fossem verdade;
- conteúdo ausente é inventado;
- o artefato parece correto, mas falha nos critérios predefinidos;
- validar exige refazer manualmente todo o trabalho.

### Fracasso operacional

- documentos originais são alterados;
- efeitos não autorizados ocorrem;
- falha parcial fica oculta;
- não é possível identificar o estado após interrupção;
- uma repetição gera resultados ou efeitos inconsistentes sem explicação.

### Fracasso de segurança

- conteúdo de um documento altera políticas;
- dados são utilizados fora do escopo;
- autorização é inferida de forma indevida;
- o sistema alega conclusão sem evidência;
- o usuário não compreende o que aprovou.

### Fracasso de aprendizado arquitetural

- o experimento depende de regras codificadas exclusivamente para um único formato;
- entidades documentais passam a definir o vocabulário do núcleo;
- o fluxo só funciona para um modelo rígido de entrada e saída;
- não é possível separar conceitos do núcleo de detalhes do caso;
- a análise não produz evidência sobre as hipóteses selecionadas.

Um fracasso bem observado ainda pode produzir aprendizado útil. Ele não deve ser escondido nem reinterpretado como sucesso técnico.

---

## 13. Critérios para interromper o experimento

### Interrupção imediata por segurança

Interromper imediatamente se:

- ocorrer ação não autorizada;
- um documento original for modificado;
- dados forem expostos fora do escopo;
- conteúdo externo conseguir ampliar autoridade;
- não for possível determinar quais efeitos ocorreram;
- uma falha produzir risco real para usuário ou ambiente.

### Interrupção por ausência de verificabilidade

Interromper e redefinir se:

- não existirem critérios objetivos ou revisão humana qualificada;
- as fontes não permitirem avaliar o resultado;
- sucesso depender apenas da afirmação do próprio sistema;
- não for possível separar fatos, inferências e conteúdo criado.

### Interrupção por ausência de valor

Interromper se, após as primeiras execuções representativas:

- o processo direto for claramente mais simples;
- o usuário não reconhecer benefício real;
- o esforço de supervisão for maior que o trabalho evitado;
- o caso tiver sido criado apenas para demonstrar tecnologia.

### Interrupção por desvio de identidade

Interromper se:

- o projeto começar a ser descrito como sistema de documentos;
- formatos documentais passarem a definir o núcleo;
- forem propostas funcionalidades de gestão documental fora do experimento;
- a arquitetura começar a ser moldada exclusivamente pelas entradas escolhidas.

### Interrupção por expansão de escopo

Interromper e revisar se o experimento começar a exigir:

- memória avançada;
- múltiplos agentes;
- residência contínua;
- automações externas;
- grande quantidade de integrações;
- infraestrutura distribuída;
- sistema universal de plugins;
- voz;
- qualquer elemento não necessário para testar as hipóteses selecionadas.

### Interrupção por falta de aprendizado

Interromper se novas execuções repetirem os mesmos resultados sem reduzir incerteza sobre as hipóteses.

O objetivo é aprendizado decisório, não prolongar o experimento indefinidamente.

---

## 14. Proteção contra especialização acidental

Durante o experimento, toda decisão deverá responder:

1. Isso pertence ao ciclo universal ou apenas ao caso documental?
2. Esse conceito continuaria fazendo sentido em outro domínio?
3. Estamos adicionando algo porque uma hipótese exige ou porque o formato facilita?
4. A regra deveria permanecer no experimento?
5. Seria possível substituir os documentos por outra fonte sem redefinir intenção, autoridade, validação e resultado?

Devem permanecer fora do núcleo:

- tipos específicos de documento;
- formatos;
- esquemas;
- campos;
- regras de extração;
- validadores de domínio;
- terminologia local;
- estrutura específica do artefato;
- tratamento particular de um arquivo.

O núcleo conceitual em avaliação continua sendo:

```text
INTENÇÃO
→ OBJETIVO
→ CONTEXTO
→ CAPACIDADES
→ POLÍTICAS/PERMISSÕES
→ EXECUÇÃO
→ VALIDAÇÃO
→ RESULTADO
→ FEEDBACK
```

---

## 15. Decisão final da Etapa 04

O candidato **C — documentos → resultado estruturado** é selecionado como primeiro experimento porque apresenta o melhor equilíbrio atual entre:

- valor observável;
- verificabilidade;
- cobertura do ciclo;
- exercício do segundo cérebro;
- efeito controlado do segundo par de mãos;
- baixo risco;
- esforço proporcional;
- possibilidade de testar falhas;
- aprendizado sobre invariantes;
- generalização conceitual.

A seleção não significa que:

- J.A.R.V.I.S. será um sistema documental;
- documentos serão sua interface principal;
- o núcleo será projetado ao redor de arquivos;
- memória, agentes ou arquitetura já foram escolhidos;
- o experimento comprovará universalidade.

A próxima etapa deverá especificar o experimento em termos de:

- problema real;
- usuário;
- intenção;
- fontes autorizadas;
- resultado esperado;
- critérios de aceitação;
- limites;
- conjunto de testes;
- evidências a coletar.

Essa especificação ainda não foi produzida neste documento.

Nenhuma implementação está autorizada por esta seleção.
