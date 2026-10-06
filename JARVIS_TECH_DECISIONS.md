# J.A.R.V.I.S.

## Avaliação e Decisões Tecnológicas Iniciais

**Base:** `JARVIS_ARCHITECTURE_PROPOSAL.md` e documentos conceituais anteriores  
**Data da avaliação:** 2026-10-06  
**Status:** recomendações provisórias para revisão; nenhuma implementação autorizada  
**Escopo:** primeiro experimento, não arquitetura final do produto

---

## 1. Princípio de decisão

As tecnologias devem servir às hipóteses do experimento.

Elas não devem:

- determinar a identidade do produto;
- antecipar escala inexistente;
- introduzir extensão dinâmica;
- exigir infraestrutura distribuída;
- esconder autoridade em frameworks agentivos;
- dificultar substituição do modelo;
- persistir memória que o experimento não precisa;
- impedir observação e teste do ciclo.

A pergunta central é:

> Qual é o conjunto mínimo de tecnologias maduras capaz de implementar a aplicação modular proposta, manter contratos explícitos e coletar evidência confiável?

---

## 2. Critérios

Cada alternativa é avaliada por:

- **adequação:** atende ao problema real do experimento;
- **simplicidade:** quantidade de conceitos, configuração e operação;
- **custo:** licenças, infraestrutura, chamadas e manutenção;
- **performance:** suficiente para o fluxo, sem otimização especulativa;
- **maturidade:** estabilidade, documentação e ecossistema;
- **facilidade de substituição:** impacto de trocar a tecnologia;
- **compatibilidade:** aderência à arquitetura proposta;
- **lock-in:** dependência de fornecedor, formato ou ecossistema;
- **curva de aprendizado:** esforço para trabalhar com segurança e autonomia.

Nas matrizes:

- 5 significa condição mais favorável;
- para custo, 5 significa menor custo;
- para lock-in, 5 significa menor lock-in;
- pontuações são análise atual, não medição empírica.

---

## 3. Resumo das recomendações

```text
Área                    Recomendação inicial
---------------------------------------------------------------------------
Linguagem               TypeScript em modo estrito
Runtime                 Node.js 24 LTS
Modelo de IA            Um único modelo; baseline Claude Sonnet 5,
                        condicionado a benchmark comparativo
Integração de IA        SDK oficial atrás de adaptador estreito
Armazenamento           SQLite para estado/evidências + sistema de arquivos
Interface               CLI supervisionada com controles estruturados
Execução de ferramentas Adaptadores explícitos, estáticos e allowlisted
Observabilidade         Registro de execução + logs estruturados
Testes                  Vitest + corpus de avaliação próprio
Segurança               Validação de fronteiras, menor privilégio,
                        fontes read-only e nenhum código não confiável
```

Essas recomendações formam um conjunto coerente, mas cada decisão possui gatilhos de revisão.

---

# 4. LINGUAGEM

## 4.1 Alternativas

### TypeScript

**Adequação**

- contratos explícitos;
- boa representação de estados discriminados;
- ecossistema maduro para APIs de modelos;
- adequado para CLI e eventual web;
- boa compatibilidade com validação de schemas.

**Simplicidade**

- uma linguagem pode atender núcleo, CLI e futura interface web;
- exige compilação ou tratamento de TypeScript;
- tipos não existem em runtime, exigindo validação de fronteira.

**Custo**

- gratuito;
- ecossistema amplo;
- manutenção moderada.

**Performance**

- suficiente para I/O, orquestração e documentos do experimento;
- não é indicado para processamento numérico pesado, que não é requisito atual.

**Maturidade**

- alta;
- tooling e SDKs amplamente disponíveis.

**Substituição**

- a linguagem inteira não é facilmente substituível;
- provedores e adaptadores podem ser substituídos se contratos permanecerem internos.

**Lock-in**

- baixo no nível da linguagem;
- pode aumentar se tipos internos copiarem formatos de SDKs.

**Curva de aprendizado**

- moderada;
- exige compreender JavaScript assíncrono, tipos e validação de runtime.

### Python

**Adequação**

- excelente ecossistema de IA e processamento documental;
- rápido para experimentação;
- Pydantic e type hints podem estruturar contratos.

**Simplicidade**

- sintaxe direta;
- ambientes, distribuição e dependências nativas podem gerar fricção;
- disciplina adicional é necessária para manter limites arquiteturais.

**Custo**

- gratuito;
- ecossistema amplo.

**Performance**

- suficiente para o experimento;
- gargalo real será modelo e I/O, não CPU da linguagem.

**Maturidade**

- muito alta.

**Substituição**

- semelhante a TypeScript: linguagem difícil de trocar, integrações substituíveis.

**Lock-in**

- baixo;
- risco de acoplamento a frameworks agentivos é maior se usados sem necessidade.

**Curva de aprendizado**

- baixa a moderada;
- tipagem gradual exige disciplina.

### C#/.NET

**Adequação**

- tipos fortes;
- boa modelagem de domínio e estado;
- runtime maduro;
- boa integração com Windows;
- ecossistema de IA suficiente, mas menor que Python e TypeScript.

**Simplicidade**

- projeto e tooling consistentes;
- mais estrutura inicial;
- pode ser excessivo para um experimento pequeno.

**Performance**

- alta.

**Maturidade**

- muito alta.

**Lock-in**

- baixo para runtime moderno e multiplataforma;
- moderado se recursos específicos de Windows forem adotados.

**Curva de aprendizado**

- moderada.

### Go

**Adequação**

- binário simples;
- concorrência e performance excelentes;
- contratos estáticos;
- ecossistema menos confortável para experimentação com IA e documentos.

**Simplicidade**

- runtime operacional simples;
- código de integração e transformação tende a ser mais verboso.

**Performance**

- muito alta, além da necessidade atual.

**Maturidade**

- alta.

**Lock-in**

- baixo.

**Curva de aprendizado**

- moderada.

## 4.2 Matriz

```text
Critério                  TypeScript   Python   C#/.NET   Go
--------------------------------------------------------------
Adequação                       5         5         4       3
Simplicidade                    4         5         3       4
Custo                           5         5         5       5
Performance                     4         3         5       5
Maturidade                      5         5         5       5
Facilidade de substituição      3         3         3       3
Compatibilidade arquitetural    5         4         5       4
Baixo lock-in                   5         5         4       5
Curva de aprendizado            4         5         3       3
```

## 4.3 Recomendação

> **TypeScript em modo estrito.**

### Justificativa

A arquitetura possui muitos contratos e estados:

- intenção;
- objetivo;
- proposta de ação;
- decisão de autoridade;
- tentativa;
- efeito;
- validação;
- resultado.

TypeScript oferece bom equilíbrio entre:

- segurança estrutural;
- velocidade de desenvolvimento;
- SDKs de IA;
- CLI;
- futura interface web;
- capacidade de manter uma única linguagem.

Python continua sendo a principal alternativa.

Se o primeiro caso exigir bibliotecas documentais exclusivas ou processamento científico inexistente em TypeScript, a decisão deve ser revista.

### Condições

- tipagem estrita;
- nenhum `any` indiscriminado;
- validação em runtime nas fronteiras;
- tipos de SDKs não podem se tornar tipos do núcleo;
- código específico do provedor permanece no adaptador.

---

# 5. RUNTIME

## 5.1 Alternativas para TypeScript

### Node.js LTS

- runtime mais maduro do ecossistema;
- ampla compatibilidade com SDKs;
- documentação e depuração maduras;
- bom suporte no Windows;
- ciclo LTS previsível;
- performance suficiente.

Em 2026-10-06, o site oficial lista Node.js 24 como LTS e recomenda linhas LTS para produção.

### Bun

- inicialização e execução rápidas;
- ferramentas integradas;
- boa compatibilidade crescente com Node;
- menor histórico de produção;
- risco maior em bibliotecas de borda.

### Deno

- TypeScript e APIs modernas;
- modelo explícito de permissões;
- segurança de runtime conceitualmente atraente;
- compatibilidade com ecossistema Node melhorou, mas continua adicionando risco para SDKs e bibliotecas.

### Runtime Python

Se Python fosse escolhido, CPython 3.14 seria a linha estável atual.

É uma alternativa madura, mas pertence a outra decisão de linguagem.

## 5.2 Matriz

```text
Critério                  Node.js LTS   Bun   Deno
--------------------------------------------------
Adequação                      5         4      4
Simplicidade                   4         5      4
Custo                          5         5      5
Performance                    4         5      4
Maturidade                     5         3      4
Compatibilidade de SDK         5         4      4
Baixo lock-in                  5         4      4
Curva de aprendizado           4         4      4
```

## 5.3 Recomendação

> **Node.js 24 LTS, com versão exata fixada no projeto.**

### Justificativa

- LTS;
- compatibilidade;
- baixo risco operacional;
- nenhum requisito de performance justifica runtime mais novo;
- suporte adequado a I/O e fluxo assíncrono.

Não usar a versão Current apenas por ser mais recente.

### Gatilhos de revisão

- incompatibilidade comprovada;
- necessidade de permissões nativas de runtime;
- distribuição em binário único se tornar requisito;
- benchmark demonstrar diferença material.

---

# 6. MODELO DE IA

## 6.1 Requisitos do experimento

O modelo precisa:

- compreender intenção;
- produzir saída estruturada;
- detectar ambiguidade;
- trabalhar com contexto delimitado;
- extrair e sintetizar;
- preservar referências;
- declarar incerteza;
- resistir razoavelmente a instruções em conteúdo;
- não precisar executar ferramentas diretamente;
- ter custo e latência mensuráveis;
- permitir fixar versão ou snapshot quando possível.

Capacidade anunciada não substitui benchmark.

## 6.2 Alternativas

### Família GPT-5 — OpenAI

**Pontos favoráveis**

- modelo de raciocínio atual da OpenAI;
- ecossistema e SDKs maduros;
- histórico de structured outputs e tool calling;
- ampla integração.

**Riscos**

- detalhes e nomes mudam rapidamente;
- lock-in em formato de API se tipos internos copiarem o provedor;
- custo e comportamento precisam ser medidos;
- pesquisa oficial atual consultada não forneceu detalhes suficientes para recomendar um identificador específico sem validação adicional.

### Claude Sonnet 5 — Anthropic

**Pontos favoráveis**

- documentação oficial indica combinação de velocidade e inteligência;
- structured outputs;
- strict tool inputs;
- contexto amplo;
- forte adequação a análise textual.

**Riscos**

- custo e latência precisam de benchmark;
- particularidades da Messages API;
- ferramentas forçadas possuem diferenças entre modelos e modos;
- lock-in se blocos de conteúdo do provedor vazarem para o núcleo.

### Gemini 3.8 Flash — Google

**Pontos favoráveis**

- structured outputs;
- function calling;
- entrada multimodal e PDF;
- contexto amplo;
- modelo orientado a velocidade e custo;
- adequado a extração e fluxos agentivos segundo documentação oficial.

**Riscos**

- recursos integrados podem induzir acoplamento;
- ingestão nativa de PDF tornaria substituição mais difícil se o núcleo dependesse dela;
- qualidade de rastreabilidade deve ser medida;
- recursos de preview não devem entrar no experimento.

### Modelo local ou open-weight

**Pontos favoráveis**

- controle de dados;
- operação offline;
- menor dependência de fornecedor;
- custo marginal previsível após infraestrutura.

**Riscos**

- qualidade de structured outputs e instruções varia;
- necessidade de hardware;
- operação, atualização e segurança;
- custo total pode superar API no volume inicial;
- aumenta variáveis do experimento.

## 6.3 Comparação

```text
Critério                    GPT-5 atual  Claude Sonnet 5  Gemini 3.8 Flash  Local
----------------------------------------------------------------------------------
Adequação provável               5              5               5           3
Simplicidade inicial             4              4               4           2
Custo previsível                 3              3               4           3
Latência provável                3              4               5           3
Maturidade da API                5              5               5           3
Saída estruturada                5              5               5           3
Facilidade de substituição       3              3               3           3
Baixo lock-in                    3              3               3           5
Curva operacional                4              4               4           2
Evidência específica do corpus   0              0               0           0
```

A última linha é decisiva: nenhum modelo foi avaliado no corpus do J.A.R.V.I.S.

## 6.4 Recomendação

> **Usar um único modelo e escolher por benchmark antes da implementação do fluxo completo.**

### Baseline provisório

> **Claude Sonnet 5** como baseline do benchmark.

### Concorrentes mínimos

- Gemini 3.8 Flash;
- modelo GPT-5 de produção disponível no momento do benchmark.

### Corpus

Usar os casos já exigidos por `EXPERIMENT_02_SPEC.md`:

- intenções ambíguas;
- informação ausente;
- fontes conflitantes;
- instruções maliciosas;
- produção estruturada;
- rastreabilidade;
- falha e ressalva.

### Métricas de seleção

- objetivo aceito;
- ambiguidades detectadas;
- cobertura factual;
- afirmações sem suporte;
- conflitos detectados;
- rastreabilidade;
- aderência ao schema;
- resistência a conteúdo não confiável;
- latência;
- custo.

### Regra de decisão

Selecionar o modelo que atingir todos os critérios de segurança e qualidade com menor custo total aceitável.

Um modelo mais barato que produza falsa conclusão não é adequado.

### Integração

- SDK oficial do fornecedor;
- um adaptador estreito;
- nenhuma camada LiteLLM, OpenRouter ou roteador multimodelo inicialmente;
- snapshot ou versão fixa durante o experimento;
- saída do modelo sempre tratada como proposta.

---

# 7. ARMAZENAMENTO

## 7.1 Necessidades

O experimento precisa guardar:

- execução;
- estado;
- aprovações;
- tentativas;
- efeitos;
- validações;
- métricas;
- feedback;
- referências a fontes e artefatos.

Não precisa guardar memória pessoal de longo prazo.

## 7.2 Alternativas

### Arquivos JSON ou JSONL

**Vantagens**

- simplicidade;
- legibilidade;
- fácil inspeção;
- nenhuma infraestrutura.

**Limitações**

- transações frágeis;
- consultas e migrações difíceis;
- integridade relacional limitada;
- concorrência ruim;
- risco de misturar log e estado.

### SQLite

**Vantagens**

- embutido;
- sem servidor;
- transacional;
- maduro;
- arquivo único;
- adequado a estado e métricas;
- fácil exportação e inspeção.

**Limitações**

- concorrência de escrita limitada;
- proteção depende das permissões do processo e sistema de arquivos;
- não é adequado a múltiplas instâncias distribuídas.

Essas limitações não afetam o experimento supervisionado.

### PostgreSQL

**Vantagens**

- concorrência;
- recursos avançados;
- maturidade;
- caminho para múltiplos usuários.

**Limitações**

- servidor e administração;
- configuração;
- credenciais;
- custo operacional;
- complexidade não justificada.

### Banco documental

**Vantagens**

- flexibilidade de estrutura.

**Limitações**

- não elimina necessidade de contratos;
- adiciona infraestrutura;
- consultas do experimento são relacionais e temporais;
- benefício não demonstrado.

## 7.3 Matriz

```text
Critério                  JSON/JSONL   SQLite   PostgreSQL   Documental
-----------------------------------------------------------------------
Adequação                     3          5          4           3
Simplicidade                  5          5          2           2
Custo                         5          5          3           3
Integridade                   2          5          5           3
Performance no experimento    4          5          5           4
Maturidade                    5          5          5           4
Facilidade de substituição    4          4          4           3
Baixo lock-in                 5          5          5           3
Curva de aprendizado          5          4          3           3
```

## 7.4 Recomendação

> **SQLite para estado, evidências e métricas; sistema de arquivos para fontes e artefatos.**

### Limites

- documentos não devem ser copiados integralmente para o banco sem necessidade;
- banco guarda referências e metadados quando suficiente;
- artefatos permanecem arquivos identificáveis;
- nenhum ORM é necessário inicialmente;
- o driver será escolhido somente após confirmar linguagem e requisitos;
- migrações devem ser explícitas.

### Gatilhos para PostgreSQL

- múltiplas instâncias;
- múltiplos usuários concorrentes;
- acesso remoto;
- volume;
- controles de acesso no servidor;
- alta disponibilidade.

---

# 8. INTERFACE

## 8.1 Alternativas

### CLI supervisionada

**Vantagens**

- menor esforço;
- adequada ao fundador técnico;
- fácil exibir estado e logs;
- boa para scripts de experimento;
- não exige frontend ou servidor.

**Limitações**

- não representa UX para público geral;
- upload, visualização e aprovação são menos amigáveis;
- voz e residência não são testadas.

### Interface web local

**Vantagens**

- boa apresentação de aprovações;
- visualização de fontes e resultados;
- mais próxima de experiência de produto.

**Limitações**

- frontend, servidor e segurança do navegador;
- upload;
- maior escopo;
- pode antecipar decisões de UX.

### Desktop

**Vantagens**

- acesso ao ambiente local;
- presença mais integrada.

**Limitações**

- empacotamento;
- atualizações;
- permissões;
- grande esforço antes de validar valor.

### Chat puro

**Vantagens**

- interação natural;
- implementação conceitualmente simples.

**Limitações**

- aprovação ambígua;
- estado pouco visível;
- mistura conteúdo, comando e consentimento;
- testa apenas parte da UX.

## 8.2 Matriz

```text
Critério                    CLI   Web local   Desktop   Chat puro
-----------------------------------------------------------------
Adequação ao experimento     5        4          2          3
Simplicidade                 5        3          1          4
Custo                        5        4          2          5
Transparência de estado      4        5          5          2
Aprovações estruturadas      4        5          5          2
Maturidade                   5        5          4          5
Substituição                 5        4          3          4
Curva de aprendizado         5        3          2          5
```

## 8.3 Recomendação

> **CLI supervisionada com interação natural e controles estruturados separados.**

### Requisitos

- intenção em texto;
- objetivo mostrado para confirmação;
- perguntas agrupadas;
- aprovações explícitas;
- estado visível;
- cancelamento;
- caminho das fontes selecionado explicitamente;
- preview do resultado;
- confirmação do destino;
- resumo de evidências.

Não deve ser apenas um prompt de chat.

### Limitação assumida

Esse formato valida fluxo e controlabilidade, não a UX final para usuários não técnicos.

---

# 9. EXECUÇÃO DE FERRAMENTAS

## 9.1 Alternativas

### Adaptadores em processo e allowlisted

Cada capability autorizada chama uma função explícita com entrada validada.

**Vantagens**

- simples;
- rastreável;
- fácil de testar;
- sem processo externo;
- autoridade controlada pelo núcleo.

**Limitações**

- extensões exigem alteração de código;
- isolamento depende do processo.

Isso é aceitável porque o catálogo inicial é pequeno.

### Tool calling direto do modelo

**Vantagens**

- integração rápida;
- suporte dos fornecedores.

**Limitações**

- pode misturar proposta e execução;
- política fica dependente do loop do provedor;
- maior risco de tool injection;
- difícil garantir autoridade.

Não recomendado como executor.

O modelo pode produzir proposta estruturada equivalente a uma chamada, mas o núcleo precisa reavaliá-la.

### MCP

**Vantagens**

- protocolo comum;
- descoberta e integração de ferramentas.

**Limitações**

- complexidade;
- confiança em servidores;
- permissões e transporte;
- não necessário para três ou quatro capabilities locais.

### Shell e subprocessos

**Vantagens**

- flexibilidade.

**Limitações**

- alto risco;
- quoting;
- ambiente;
- efeitos amplos;
- desnecessário para o experimento.

### Workflow engine

**Vantagens**

- estado, retry e tarefas longas.

**Limitações**

- infraestrutura;
- modelo operacional;
- complexidade sem necessidade.

## 9.2 Recomendação

> **Adaptadores explícitos, em processo, registrados estaticamente e executados somente após decisão de autoridade.**

### Regras

- sem descoberta dinâmica;
- sem shell;
- sem execução de código;
- sem chamada direta pelo modelo;
- entradas validadas;
- saída e efeito registrados;
- fontes abertas em modo somente leitura quando possível;
- artefatos criados sem sobrescrita;
- retry somente quando seguro.

---

# 10. OBSERVABILIDADE

## 10.1 Alternativas

### Console simples

É barato, mas insuficiente para:

- correlação;
- métricas;
- aprovações;
- avaliação das hipóteses.

### Logs estruturados + registro do experimento

Separa:

- telemetria operacional;
- evidências de domínio;
- estado da tarefa.

É suficiente para a aplicação única.

### OpenTelemetry

**Vantagens**

- vendor-neutral;
- traces, métricas e logs;
- exportação para múltiplos backends;
- baixo lock-in conceitual.

**Limitações**

- instrumentação e conceitos adicionais;
- collector e backend seriam excessivos agora;
- não substitui o registro de evidências do experimento.

### Plataforma especializada em LLM

Exemplos de categoria incluem plataformas de tracing e avaliação de prompts.

**Vantagens**

- visualização pronta;
- comparação de modelos;
- datasets e avaliações.

**Limitações**

- envio de prompts e documentos;
- custo;
- lock-in;
- modelo de dados externo;
- risco de confundir trace de LLM com trace do produto.

## 10.2 Recomendação

> **Logs estruturados locais + Registro do Experimento em SQLite.**

### Campos mínimos

- run ID;
- task ID;
- estado;
- componente;
- tipo de evento;
- duração;
- custo;
- decisão de autoridade;
- capability;
- efeito;
- validação;
- erro;
- conteúdo sensível redigido.

### OpenTelemetry

Não instalar inicialmente.

Preservar IDs e eventos de forma que uma instrumentação OpenTelemetry possa ser adicionada se:

- houver mais processos;
- backend externo;
- necessidade de tracing padronizado;
- operação prolongada.

---

# 11. TESTES

## 11.1 Tipos necessários

### Testes unitários determinísticos

Para:

- transições de estado;
- política;
- cancelamento;
- retry;
- regras de autoridade;
- validação estrutural.

### Testes de contrato

Para:

- adaptador de inteligência;
- capabilities;
- armazenamento;
- validadores.

### Testes de integração

Para:

- fontes read-only;
- criação sem sobrescrita;
- registro de evidências;
- falha parcial;
- cancelamento.

### Avaliações de modelo

Para:

- intenção;
- ambiguidade;
- extração;
- conflito;
- lacuna;
- rastreabilidade;
- prompt injection;
- saída estruturada.

### Teste ponta a ponta

Para o protocolo completo do experimento.

## 11.2 Alternativas de framework TypeScript

### `node:test`

- integrado;
- sem dependência;
- maduro;
- suporte TypeScript depende do fluxo do projeto;
- menos recursos de DX.

### Vitest

- rápido;
- boa integração TypeScript;
- mocks e cobertura;
- API clara;
- uma dependência adicional.

### Jest

- muito maduro;
- ecossistema amplo;
- configuração e transformação podem ser mais pesadas.

### Plataforma de avaliação de prompts

- útil para variações e modelos;
- adiciona outra abstração;
- não substitui testes do núcleo.

## 11.3 Recomendação

> **Vitest para testes automatizados + runner de avaliação próprio sobre o corpus definido na especificação.**

### Estratégia

- inteligência falsa para testar fluxo determinístico;
- chamadas reais separadas para avaliação de modelo;
- nenhuma snapshot textual tratada como prova de qualidade;
- fixtures com resultado esperado;
- corpus adversarial;
- diretório temporário para I/O;
- teste de não sobrescrita;
- teste de alteração de parâmetros após aprovação;
- teste de cancelamento;
- teste de falha parcial;
- métricas registradas por versão de modelo.

### Ferramenta externa de eval

Pode ser avaliada depois que o runner próprio revelar necessidades repetidas.

---

# 12. SEGURANÇA

Segurança não é uma biblioteca única.

Ela combina limites de escopo, validação, autoridade, isolamento e práticas operacionais.

## 12.1 Alternativas de isolamento

### Controles na aplicação

- allowlist;
- validação;
- caminhos autorizados;
- fontes read-only;
- sem shell;
- sem código dinâmico.

É a base obrigatória.

### Processo separado

- melhora isolamento de parser ou tarefa;
- adiciona comunicação e lifecycle;
- pode ser útil para formatos arriscados.

Não é necessário para fontes simples inicialmente.

### Contêiner

- isolamento de processo e filesystem;
- maior configuração no Windows;
- não é garantia completa;
- útil quando código não confiável for introduzido.

### Máquina virtual

- isolamento mais forte;
- custo e operação altos;
- desproporcional ao experimento.

## 12.2 Segredos

### Alternativas

- arquivo `.env` ignorado;
- variável de ambiente;
- cofre do sistema operacional;
- secret manager de nuvem.

### Recomendação

- segredo fornecido ao processo por ambiente;
- arquivo local opcional apenas se explicitamente ignorado e fora dos artefatos;
- nunca armazenar chave no SQLite, logs ou documentos;
- secret manager de nuvem somente quando houver implantação remota.

## 12.3 Validação de fronteiras

### Recomendação

Usar schemas de runtime para:

- configuração;
- saída estruturada do modelo;
- propostas de ação;
- decisões de autoridade;
- resultados de capabilities;
- estado persistido.

Se TypeScript for confirmado, **Zod** é uma alternativa madura e compatível.

Alternativas:

- JSON Schema com validador dedicado;
- Valibot;
- schemas manuais.

Recomendação inicial:

> Zod nas fronteiras, sem transformar schemas do provedor em domínio.

## 12.4 Arquivos

Regras:

- raiz autorizada;
- normalização e verificação de caminho;
- bloqueio de path traversal;
- limite de tamanho;
- allowlist inicial de formatos;
- não executar macros;
- não renderizar conteúdo ativo;
- abrir originais como somente leitura;
- criar resultado com operação que falha se o destino existir;
- não seguir referência externa automaticamente;
- verificar tipo real quando material.

## 12.5 Rede

No experimento:

- saída de rede permitida apenas ao provedor do modelo;
- nenhuma pesquisa web;
- nenhuma URL encontrada em documento é acessada;
- nenhum webhook;
- nenhum servidor público;
- interface local.

## 12.6 Dados enviados ao modelo

- utilizar documentos sintéticos, anonimizados ou explicitamente autorizados;
- informar que conteúdo será enviado ao fornecedor;
- minimizar trechos;
- não enviar segredo;
- registrar fornecedor e modelo;
- verificar opções de retenção e privacidade do plano contratado antes de dados reais.

## 12.7 Dependências

- poucas dependências;
- versões fixadas;
- lockfile;
- atualização deliberada;
- scanner de vulnerabilidade;
- alertas de dependência no GitHub;
- revisão antes de pacote com código nativo ou parser complexo.

## 12.8 Autenticação

Não introduzir serviço de autenticação no experimento local de usuário único.

Usar a sessão local como fronteira operacional.

Essa decisão deixa de ser válida se:

- aplicação escutar fora de localhost;
- houver outro usuário;
- houver acesso remoto;
- fontes pertencerem a terceiros;
- houver implantação compartilhada.

## 12.9 Recomendação consolidada

> Segurança aplicada no processo, com allowlists, validação de schemas, menor privilégio, interface local, fontes read-only, create-only para saída e nenhum código não confiável.

Não adicionar contêiner ou VM sem capability que justifique.

---

## 13. Matriz consolidada de risco de lock-in

```text
Decisão                    Lock-in principal             Mitigação
-----------------------------------------------------------------------------
TypeScript/Node            Ecossistema da linguagem      Contratos internos
Modelo hospedado           API e comportamento           Adaptador + benchmark
SDK oficial                Formatos do fornecedor        Mapear na borda
SQLite                     SQL e arquivo local           Migrações + exportação
CLI                        Fluxo de interação             Contrato de interface
Adaptadores em processo    Código da aplicação            Contratos de capability
Logs próprios              Formato de eventos             Esquema mínimo estável
Vitest                     API de testes                   Testar comportamento
Zod                        Definição de schemas            Usar somente na borda
```

O maior lock-in inicial é o comportamento do modelo, não a linguagem ou o banco.

Por isso, o corpus de avaliação e o adaptador são mais importantes que uma abstração multimodelo.

---

## 14. Decisões propostas

## TD-001 — Linguagem

**Recomendação:** TypeScript estrito.  
**Status:** proposta.  
**Revisar se:** ecossistema documental exigir Python de forma material.

## TD-002 — Runtime

**Recomendação:** Node.js 24 LTS com versão fixada.  
**Status:** proposta.  
**Revisar se:** compatibilidade ou isolamento exigirem outro runtime.

## TD-003 — Modelo

**Recomendação:** um único modelo escolhido por benchmark; Claude Sonnet 5 como baseline provisório.  
**Status:** decisão condicionada.  
**Revisar se:** outro candidato superar qualidade, segurança e custo no corpus.

## TD-004 — SDK de IA

**Recomendação:** SDK oficial atrás de adaptador próprio.  
**Status:** proposta.  
**Revisar se:** houver necessidade comprovada de múltiplos provedores simultâneos.

## TD-005 — Armazenamento

**Recomendação:** SQLite + sistema de arquivos.  
**Status:** proposta.  
**Revisar se:** concorrência, acesso remoto ou escala exigirem servidor.

## TD-006 — Interface

**Recomendação:** CLI supervisionada e estruturada.  
**Status:** proposta.  
**Revisar se:** o usuário do experimento não for técnico ou upload/preview impedir avaliação.

## TD-007 — Execução de capabilities

**Recomendação:** adaptadores estáticos, em processo e allowlisted.  
**Status:** proposta.  
**Revisar se:** isolamento ou extensões independentes forem comprovadamente necessários.

## TD-008 — Observabilidade

**Recomendação:** logs estruturados + registro em SQLite.  
**Status:** proposta.  
**Revisar se:** múltiplos processos ou backend externo justificarem OpenTelemetry.

## TD-009 — Testes

**Recomendação:** Vitest + runner próprio de avaliação.  
**Status:** proposta.  
**Revisar se:** complexidade de datasets justificar plataforma especializada.

## TD-010 — Validação de runtime

**Recomendação:** Zod nas fronteiras.  
**Status:** proposta dependente de TypeScript.  
**Revisar se:** JSON Schema compartilhado se tornar requisito.

## TD-011 — Segurança de execução

**Recomendação:** sem shell, sem código dinâmico, sem conteúdo ativo e sem sandbox adicional no primeiro experimento.  
**Status:** proposta.  
**Revisar antes de:** introduzir execução de código ou parser ativo.

---

## 15. Dependências mínimas esperadas

A implementação futura deve tentar limitar-se a categorias essenciais:

- SDK do modelo escolhido;
- validação de schema;
- acesso a SQLite;
- parser somente para formatos aprovados;
- framework de testes;
- logging estruturado, se o runtime não for suficiente.

Não adicionar inicialmente:

- framework agentivo;
- ORM;
- dependency injection container;
- roteador de modelos;
- workflow engine;
- vector database;
- biblioteca MCP;
- plataforma SaaS de tracing;
- framework web;
- SDK de cloud;
- fila;
- cache distribuído.

Cada dependência futura deverá possuir justificativa própria.

---

## 16. Benchmark obrigatório antes de consolidar o modelo

### Preparação

1. selecionar corpus do experimento;
2. definir schemas de saída;
3. fixar prompts e critérios;
4. escolher snapshots dos modelos;
5. definir limite de custo;
6. anonimizar dados.

### Execução

Avaliar cada candidato nas mesmas condições e sem tool execution direta.

### Critérios eliminatórios

- ação ou instrução não autorizada;
- saída fora do schema de forma recorrente;
- falsa conclusão material;
- falha em distinguir conteúdo de instrução;
- rastreabilidade abaixo do requisito;
- custo ou latência inviáveis.

### Resultado

O benchmark deve produzir:

- modelo selecionado;
- versão;
- custo por execução;
- latência;
- taxas de qualidade;
- limitações;
- data de revisão.

---

## 17. O que ainda não está decidido

Mesmo após esta análise, permanecem abertos:

- modelo vencedor;
- formatos documentais;
- parser;
- driver SQLite;
- biblioteca de CLI;
- biblioteca de logging;
- estratégia de build;
- gerenciador de pacotes;
- formato exato dos schemas;
- política de retenção;
- modo de distribuição;
- implantação.

Não escolher essas tecnologias antes de confirmar necessidade concreta.

---

## 18. Fontes oficiais consultadas

- [Node.js Releases](https://nodejs.org/en/about/previous-releases)
- [Python Downloads](https://www.python.org/downloads/)
- [SQLite Is Serverless](https://sqlite.org/serverless.html)
- [SQLite Is Transactional](https://sqlite.org/transactional.html)
- [OpenTelemetry overview](https://opentelemetry.io/docs/what-is-opentelemetry/)
- [Anthropic models overview](https://docs.anthropic.com/en/docs/about-claude/models/overview)
- [Anthropic structured outputs](https://docs.anthropic.com/en/docs/build-with-claude/structured-outputs)
- [Google Gemini 3.8 Flash](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash)
- [OpenAI model documentation](https://platform.openai.com/docs/models)

Informações de modelos e preços mudam rapidamente. Identificadores e custos devem ser verificados novamente no momento do benchmark.

---

## 19. Recomendação final

Para o primeiro experimento, a combinação mais proporcional é:

```text
TypeScript estrito
Node.js 24 LTS
CLI supervisionada
Um modelo hospedado selecionado por benchmark
SDK oficial isolado em adaptador
Capabilities em processo e allowlisted
SQLite para estado/evidência
Sistema de arquivos para fontes/artefatos
Logs estruturados locais
Vitest + corpus próprio
Zod nas fronteiras
Sem shell, sem código dinâmico e sem serviços distribuídos
```

Essa combinação favorece:

- simplicidade;
- contratos explícitos;
- baixo custo operacional;
- rastreabilidade;
- substituição do fornecedor de IA;
- aprendizado técnico;
- implementação incremental.

Ela não deve ser tratada como stack definitiva do J.A.R.V.I.S.

Nenhuma instalação ou implementação está autorizada por este documento.
