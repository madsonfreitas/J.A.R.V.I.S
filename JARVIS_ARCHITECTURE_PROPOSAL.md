# J.A.R.V.I.S.

## Proposta de Arquitetura Inicial

**Fase:** proposta anterior à implementação  
**Objetivo:** suportar somente o primeiro experimento de validação  
**Forma recomendada:** aplicação única, modular e supervisionada  
**Status:** proposta para revisão; nenhuma tecnologia foi escolhida

---

## 0. Nota sobre os documentos de origem

A lista fornecida menciona `EXPERIMENT_01_SPEC.md`.

Esse arquivo não existe atualmente no repositório. A especificação disponível é:

- `EXPERIMENT_02_SPEC.md` — Especificação de Validação do experimento documentos → resultado estruturado.

Esta proposta utiliza `EXPERIMENT_02_SPEC.md` como a especificação vigente, sem renomear ou alterar documentos existentes.

Também considera exclusivamente os conceitos registrados nos documentos do projeto:

- `JARVIS_CONTEXT.md`;
- `JARVIS_INVARIANTS.md`;
- `JARVIS_HYPOTHESES.md`;
- `EXPERIMENT_02_SPEC.md`;
- `JARVIS_GENERALIZATION_TEST.md`;
- `JARVIS_BEHAVIOR_MODEL.md`;
- `JARVIS_CAPABILITY_MODEL.md`;
- `JARVIS_AUTHORITY_MODEL.md`;
- `JARVIS_MEMORY_MODEL.md`.

---

## 1. Decisão arquitetural proposta

Construir inicialmente:

> **uma única aplicação modular, executada sob supervisão direta, com um único limite de implantação e um conjunto explícito de capacidades para o experimento.**

Isso pode ser chamado de **monólito modular**, desde que “modular” signifique responsabilidades e contratos claros, não uma coleção artificial de camadas.

### Características

- um único produto executável;
- um único fluxo de tarefa por execução;
- um usuário supervisionando;
- uma integração de inteligência;
- capacidades explicitamente registradas;
- políticas simples e explícitas;
- execução síncrona;
- contexto limitado à tarefa;
- registro mínimo de evidências;
- nenhuma memória pessoal de longo prazo;
- nenhuma ação em segundo plano;
- nenhum efeito externo além da criação aprovada de um novo artefato.

### Motivo

Essa forma é suficiente para testar:

- intenção → objetivo;
- esclarecimento;
- seleção de contexto;
- uso de capacidades;
- separação entre proposta e autoridade;
- execução controlada;
- validação;
- resultado;
- falha, cancelamento e recuperação;
- registro de evidências.

Distribuir essas responsabilidades agora não criaria valor de validação. Apenas adicionaria rede, implantação, consistência e observabilidade distribuída antes de existir necessidade.

---

## 2. Restrições arquiteturais do experimento

Para manter a arquitetura proporcional, o primeiro experimento assume:

1. um usuário por execução;
2. uma tarefa ativa por execução;
3. fontes fornecidas e autorizadas explicitamente;
4. documentos originais somente leitura;
5. criação de um novo artefato somente após aprovação;
6. nenhuma pesquisa externa;
7. nenhuma comunicação externa;
8. nenhuma execução de código não confiável;
9. nenhuma residência contínua;
10. nenhuma proatividade;
11. nenhuma memória de longo prazo;
12. nenhuma execução paralela obrigatória;
13. nenhum retry automático com efeito persistente;
14. revisão humana do resultado;
15. coleta de evidências para avaliar as hipóteses.

Se o experimento exigir remover uma dessas restrições, a mudança deve ser tratada como revisão de escopo, não como detalhe de implementação.

---

## 3. Princípios arquiteturais

## 3.1 Um limite de implantação

Todos os componentes lógicos permanecem inicialmente na mesma aplicação.

Separação lógica não implica separação de processo, serviço ou repositório.

## 3.2 Dependências apontam para contratos do núcleo

Detalhes do experimento dependem do núcleo por contratos estreitos.

O núcleo não deve depender de:

- formato específico de documento;
- biblioteca;
- provedor;
- esquema do artefato;
- validador de domínio.

## 3.3 Propostas probabilísticas não executam diretamente

Saídas de inteligência podem:

- propor objetivo;
- selecionar conteúdo;
- sugerir plano;
- gerar rascunho;
- sugerir ação.

Elas não podem:

- conceder permissão;
- invocar efeito diretamente;
- marcar resultado como validado sozinhas;
- alterar políticas.

## 3.4 Toda ação material cruza uma fronteira de autoridade

Antes de ler recurso, ampliar fonte ou criar artefato, uma ação explícita deve ser avaliada.

## 3.5 Execução e validação permanecem separadas

Produzir um artefato não comprova que ele atende ao objetivo.

## 3.6 Conteúdo externo permanece dado

Documentos são não confiáveis como instruções, mesmo quando autorizados como fonte.

## 3.7 Evidência operacional não é memória pessoal

Registros do experimento servem a:

- avaliação;
- auditoria;
- depuração;
- métricas.

Eles não devem personalizar automaticamente execuções futuras.

## 3.8 Abstração somente onde já existe justificativa

Os contratos propostos correspondem aos invariantes fortalecidos pelo teste de generalização.

Não haverá extensão dinâmica, plugins ou linguagem universal de políticas.

---

## 4. Visão geral

```text
┌──────────────────────────────┐
│  1. Fronteira de Interação   │
└──────────────┬───────────────┘
               │ intenção, respostas, aprovações, cancelamento
               ▼
┌──────────────────────────────┐
│  2. Núcleo de Tarefa         │
│  estado + fluxo + decisões   │
└───┬─────────┬────────┬───────┘
    │         │        │
    │         │        └──────────────────────────────┐
    │         ▼                                       ▼
    │  ┌──────────────────────┐          ┌────────────────────────┐
    │  │ 3. Contexto da Tarefa│          │ 4. Adaptador de         │
    │  │ proveniência + escopo│          │    Inteligência         │
    │  └──────────┬───────────┘          └────────────────────────┘
    │             │
    ▼             ▼
┌──────────────────────────────┐
│ 5. Guardião de Autoridade    │
│ permitir / aprovar / negar   │
└──────────────┬───────────────┘
               │ ação autorizada
               ▼
┌──────────────────────────────┐
│ 6. Executor de Capacidades   │
│ catálogo explícito e estático│
└──────────────┬───────────────┘
               │ tentativa, efeito, evidência
               ▼
┌──────────────────────────────┐
│ 7. Validação                 │
│ critérios + evidências       │
└──────────────┬───────────────┘
               │ status validado
               ▼
┌──────────────────────────────┐
│ Fronteira de Interação       │
│ resultado + limitações       │
└──────────────────────────────┘

Todos os passos relevantes
               │
               ▼
┌──────────────────────────────┐
│ 8. Registro do Experimento   │
│ estado + evidências + métricas│
└──────────────────────────────┘
```

Os blocos representam componentes lógicos dentro da mesma aplicação.

---

## 5. Vocabulário de contratos

A arquitetura utiliza um vocabulário conceitual mínimo.

Esses contratos não definem classes nem formatos.

### Intenção

Contém:

- expressão original;
- ator;
- origem;
- restrições iniciais.

### Proposta de objetivo

Contém:

- resultado desejado;
- limites;
- critérios de conclusão;
- ambiguidades;
- perguntas.

### Contexto de tarefa

Contém:

- informações selecionadas;
- proveniência;
- escopo;
- validade;
- confiança;
- autorização de uso;
- conteúdo não confiável identificado.

### Proposta de ação

Contém:

- objetivo;
- capability;
- recurso;
- dados;
- destino;
- possível efeito;
- risco;
- reversibilidade;
- evidência esperada.

### Decisão de autoridade

Contém:

- permitir;
- permitir com condições;
- exigir aprovação;
- negar;
- adiar;
- escopo;
- duração;
- motivo.

### Tentativa de execução

Contém:

- ação autorizada;
- parâmetros finais;
- estado anterior;
- tentativa;
- saída;
- efeito observado;
- falha.

### Relatório de validação

Contém:

- critérios;
- evidências;
- divergências;
- status;
- limitações;
- necessidade de revisão.

### Resultado

Contém:

- objetivo;
- efeito;
- validação;
- evidências;
- falhas;
- limitações;
- estado final;
- próximo passo.

### Registro da execução

Contém:

- transições;
- perguntas;
- aprovações;
- ações;
- efeitos;
- validações;
- métricas;
- feedback.

---

# 6. COMPONENTE 1 — FRONTEIRA DE INTERAÇÃO

## 6.1 Responsabilidade

Mediar a interação entre usuário e núcleo.

Deve:

- receber intenção;
- apresentar objetivo proposto;
- coletar esclarecimentos;
- solicitar aprovação;
- receber cancelamento;
- mostrar estado;
- apresentar resultado e limitações;
- coletar feedback.

## 6.2 Por que existe

O núcleo não deve depender de chat, CLI, web, voz ou interface específica.

Também é necessário preservar a diferença entre:

- conteúdo fornecido;
- aprovação;
- cancelamento;
- feedback.

## 6.3 Contrato

### Recebe do usuário

- intenção;
- resposta a esclarecimento;
- confirmação de objetivo;
- aprovação ou negação;
- cancelamento;
- feedback.

### Entrega ao usuário

- perguntas;
- objetivo compreendido;
- ação proposta;
- efeito e risco;
- estado;
- resultado;
- evidências;
- falhas.

O contrato deve preservar identidade, momento e tipo da interação.

## 6.4 Dependências

- Núcleo de Tarefa;
- identidade fornecida pelo ambiente do experimento;
- visão de estado produzida pelo núcleo.

## 6.5 O que NÃO é responsabilidade

- interpretar intenção;
- selecionar contexto;
- decidir política;
- executar capability;
- validar resultado;
- armazenar memória;
- transformar clique em autoridade ilimitada.

## 6.6 Como pode ser substituído

Uma interface futura pode substituir a inicial desde que preserve:

- tipos de interação;
- identidade;
- aprovações;
- cancelamento;
- estado;
- resultado.

Não é necessário criar uma abstração para todas as interfaces futuras. Apenas um limite estreito entre interface inicial e núcleo.

## 6.7 Hipóteses suportadas

- `UX-01` — linguagem natural como entrada;
- `UX-02` — controles estruturados;
- `UX-03` — esclarecimento proporcional;
- `UX-04` — transparência;
- `UX-05` — confirmações proporcionais;
- `SECURITY-06` — compreensão de autorização.

---

# 7. COMPONENTE 2 — NÚCLEO DE TAREFA

## 7.1 Responsabilidade

Coordenar o ciclo comportamental e manter o estado da tarefa.

Deve:

- iniciar tarefa a partir da intenção;
- solicitar compreensão;
- controlar esclarecimento;
- confirmar objetivo;
- solicitar contexto;
- decidir se planejamento explícito é necessário;
- selecionar capabilities candidatas;
- formular propostas de ação;
- solicitar decisão de autoridade;
- iniciar execução autorizada;
- encaminhar efeitos para validação;
- controlar falha, retry seguro, recuperação e cancelamento;
- produzir estado e resultado.

## 7.2 Por que existe

O comportamento não é uma chamada única de modelo.

É necessário preservar:

- ciclo não linear;
- estado;
- diferença entre proposta e execução;
- interrupção;
- validação antes de conclusão.

Sem esse componente, a lógica tenderia a se espalhar entre interface, modelo e ferramentas.

## 7.3 Contrato

### Entradas

- intenção;
- respostas;
- aprovações;
- cancelamento;
- decisões de autoridade;
- resultados de capabilities;
- relatórios de validação.

### Saídas

- pedido de esclarecimento;
- proposta de objetivo;
- solicitação de contexto;
- proposta de ação;
- pedido de aprovação;
- solicitação de execução;
- solicitação de validação;
- estado;
- resultado.

### Estados mínimos

- recebido;
- compreendendo;
- aguardando esclarecimento;
- objetivo confirmado;
- preparando contexto;
- planejando;
- aguardando aprovação;
- executando;
- validando;
- recuperando;
- concluído;
- parcial;
- rejeitado;
- cancelado;
- falhou.

## 7.4 Dependências

- Fronteira de Interação;
- Contexto da Tarefa;
- Adaptador de Inteligência;
- Guardião de Autoridade;
- Executor de Capacidades;
- Validação;
- Registro do Experimento.

## 7.5 O que NÃO é responsabilidade

- ler documento diretamente;
- chamar sistema externo diretamente;
- decidir política;
- conceder permissão;
- gerar conteúdo por conta própria;
- validar a própria execução;
- armazenar memória pessoal;
- escolher provedor;
- conhecer formato específico de documento.

## 7.6 Como pode ser substituído

Sua implementação interna poderá evoluir de controle simples para mecanismo mais sofisticado se:

- tarefas prolongadas;
- concorrência;
- retomada;
- execução assíncrona;
- múltiplas capacidades;
- recuperação complexa

forem comprovadamente necessárias.

O contrato comportamental deve permanecer estável antes de qualquer troca.

## 7.7 Hipóteses suportadas

- `PRODUCT-02` — valor do ciclo completo;
- `PRODUCT-03` — benefício superior à supervisão;
- `TECHNICAL-01` — intenção em objetivo;
- `TECHNICAL-05` — estado, falha e recuperação;
- `ARCHITECTURE-01` — invariantes compartilhados;
- `ARCHITECTURE-06` — planejamento opcional;
- `AUTONOMY-05` — recuperação limitada pelo efeito.

---

# 8. COMPONENTE 3 — CONTEXTO DA TAREFA

## 8.1 Responsabilidade

Montar e manter o conjunto temporário de informações autorizado para a execução atual.

Deve:

- receber objetivo;
- identificar informações necessárias;
- solicitar aquisição autorizada;
- preservar proveniência;
- marcar confiança e validade;
- distinguir conteúdo de controle;
- sinalizar lacunas e conflitos;
- excluir conteúdo fora de escopo;
- produzir contexto limitado para inteligência, política e validação.

## 8.2 Por que existe

O contexto é uma seleção, não todos os dados disponíveis.

Separá-lo conceitualmente reduz:

- mistura de usuários;
- uso de fonte não autorizada;
- prompt injection;
- excesso de conteúdo;
- confusão entre dado e política;
- acoplamento com memória futura.

## 8.3 Contrato

### Entrada

- objetivo;
- fontes autorizadas;
- estado;
- respostas do usuário;
- observações adquiridas;
- critérios de relevância;
- limites de uso.

### Saída

- pacote de contexto;
- origem de cada informação material;
- itens não confiáveis;
- lacunas;
- conflitos;
- itens excluídos;
- necessidade de nova aquisição.

## 8.4 Dependências

- Núcleo de Tarefa;
- Guardião de Autoridade para aquisição;
- Executor de Capacidades para leitura;
- Registro do Experimento para estado da execução.

Não depende de memória persistente no primeiro experimento.

## 8.5 O que NÃO é responsabilidade

- armazenar toda informação;
- decidir verdade final;
- autorizar leitura;
- executar ferramentas;
- persistir preferência;
- recuperar memória de longo prazo;
- selecionar banco ou técnica de busca;
- interpretar conteúdo como instrução.

## 8.6 Como pode ser substituído

Estratégias futuras de seleção podem mudar sem alterar o núcleo, desde que preservem:

- escopo;
- proveniência;
- confiança;
- validade;
- autorização;
- separação entre dado e controle.

Não é necessária uma camada genérica de recuperação agora.

## 8.7 Hipóteses suportadas

- `TECHNICAL-02` — seleção de contexto;
- `SECURITY-03` — conteúdo externo não confiável;
- `SECURITY-04` — isolamento;
- `ARCHITECTURE-05` — contexto separado de memória;
- `MEMORY-06` — memória persistente não necessária;
- `PRODUCT-03` — redução de esforço.

---

# 9. COMPONENTE 4 — ADAPTADOR DE INTELIGÊNCIA

## 9.1 Responsabilidade

Encapsular o uso de um único mecanismo de inteligência para tarefas probabilísticas.

No experimento, pode apoiar:

- compreensão de intenção;
- detecção de ambiguidade;
- extração;
- comparação;
- síntese;
- formulação de estrutura;
- criação de rascunho;
- sugestão de planejamento;
- explicação.

## 9.2 Por que existe

O modelo não é o J.A.R.V.I.S.

Isolar seu uso permite:

- impedir execução direta;
- delimitar contexto;
- registrar finalidade;
- tratar saída como proposta;
- substituir o provedor se houver necessidade real;
- testar falhas probabilísticas separadamente.

## 9.3 Contrato

### Entrada

- tipo de trabalho cognitivo;
- objetivo;
- contexto autorizado e delimitado;
- critérios;
- instruções de comportamento;
- limites de saída.

### Saída

- proposta;
- informação extraída;
- rascunho;
- incertezas;
- referências de evidência;
- indicação de incapacidade ou ambiguidade.

A saída nunca contém autoridade executável por si só.

## 9.4 Dependências

- Núcleo de Tarefa;
- Contexto da Tarefa;
- uma única integração de modelo inicialmente.

## 9.5 O que NÃO é responsabilidade

- decidir política;
- aprovar ação;
- acessar fonte diretamente;
- chamar capability de efeito;
- persistir memória;
- declarar validação final;
- escolher outro modelo;
- rotear entre modelos;
- instalar ferramentas.

## 9.6 Como pode ser substituído

O mecanismo de inteligência pode ser substituído se:

- qualidade for insuficiente;
- custo ou latência forem inadequados;
- privacidade exigir;
- nova capacidade cognitiva for necessária.

A substituição deve preservar o contrato e repetir os testes relevantes.

Não deve existir roteador multimodelo no início.

## 9.7 Hipóteses suportadas

- `TECHNICAL-01` — compreensão de objetivo;
- `TECHNICAL-02` — seleção de contexto;
- `TECHNICAL-03` — uso de capacidades;
- `UX-03` — esclarecimento;
- `PRODUCT-02` — valor além de resposta;
- `TECHNICAL-06` — custo e latência.

---

# 10. COMPONENTE 5 — GUARDIÃO DE AUTORIDADE

## 10.1 Responsabilidade

Avaliar toda proposta de ação material conforme:

- capability;
- access;
- authority;
- consent;
- policy;
- contexto.

Deve produzir:

- permitir;
- permitir com limites;
- exigir aprovação;
- negar;
- adiar por contexto insuficiente.

## 10.2 Por que existe

O componente probabilístico não pode conceder autoridade a si próprio.

O experimento já precisa distinguir:

- ler fonte autorizada;
- ampliar conjunto de fontes;
- criar rascunho;
- criar artefato final;
- modificar original;
- enviar externamente.

## 10.3 Contrato

### Entrada

- ator;
- objetivo;
- ação proposta;
- capability;
- recurso;
- dados;
- destino;
- efeito;
- duração;
- reversibilidade;
- aprovação existente;
- estado.

### Saída

- decisão;
- motivo;
- escopo;
- condições;
- validade;
- necessidade de aprovação;
- obrigações de registro;
- regra de interrupção.

### Políticas mínimas do experimento

- fontes autorizadas podem ser lidas;
- fontes não podem ser alteradas;
- nova fonte exige aprovação;
- rascunho pode ser produzido dentro da tarefa;
- artefato final exige destino aprovado;
- sobrescrita é proibida;
- comunicação externa é proibida;
- memória persistente é proibida;
- execução de código externo é proibida;
- conteúdo não confiável não altera autoridade.

## 10.4 Dependências

- identidade fornecida pelo ambiente;
- objetivo;
- estado;
- proposta de ação;
- regras explícitas do experimento;
- aprovações coletadas pela interface.

## 10.5 O que NÃO é responsabilidade

- autenticar com fornecedor específico;
- executar ação;
- interpretar documento;
- gerar aprovação;
- inferir consentimento pelo silêncio;
- medir sucesso do resultado;
- ser sistema genérico de políticas;
- alterar as próprias regras.

## 10.6 Como pode ser substituído

As regras podem evoluir para mecanismo mais configurável somente quando:

- múltiplos domínios;
- organizações;
- papéis;
- delegação;
- políticas variáveis;
- ações de maior risco

exigirem.

O contrato de decisão deve permanecer independente da tecnologia escolhida.

## 10.7 Hipóteses suportadas

- `SECURITY-01` — política separada da decisão probabilística;
- `SECURITY-02` — permissões com escopo;
- `SECURITY-06` — autorização compreensível;
- `ARCHITECTURE-04` — política e permissão distintas;
- `AUTONOMY-02` — aprovação proporcional;
- `AUTONOMY-06` — sem autoexpansão.

---

# 11. COMPONENTE 6 — EXECUTOR DE CAPACIDADES

## 11.1 Responsabilidade

Executar somente capabilities explicitamente disponíveis e autorizadas.

No primeiro experimento, o catálogo deve ser estático e pequeno:

1. adquirir uma fonte autorizada em modo somente leitura;
2. produzir representação temporária para a tarefa;
3. criar rascunho;
4. criar novo artefato final em destino aprovado;
5. obter evidências operacionais sobre a criação.

Detalhes documentais permanecem em adaptadores do experimento.

## 11.2 Por que existe

É necessário separar:

- seleção de capability;
- autorização;
- execução;
- efeito observado.

Também contém o domínio documental para impedir que formatos e regras contaminem o núcleo.

## 11.3 Contrato

### Entrada

- ação autorizada;
- capability identificada;
- parâmetros finais;
- recurso;
- limites;
- estado esperado;
- condição de interrupção.

### Saída

- tentativa;
- saída;
- efeito observado;
- evidência;
- falha;
- efeito parcial;
- recursos efetivamente acessados.

### Regra

O executor deve rejeitar solicitações sem decisão de autoridade válida ou fora do catálogo explícito.

## 11.4 Adaptadores do experimento

O executor poderá conter adaptadores substituíveis para:

- leitura de fontes selecionadas;
- interpretação de formato quando necessária;
- criação do artefato.

Esses adaptadores são específicos do experimento.

Eles não definem “recurso”, “capability” ou “resultado” para o núcleo.

## 11.5 Dependências

- Núcleo de Tarefa;
- Guardião de Autoridade;
- recursos fornecidos ao experimento;
- Registro do Experimento.

Não depende diretamente do Adaptador de Inteligência para conceder autoridade.

## 11.6 O que NÃO é responsabilidade

- escolher a própria capability;
- criar nova capability;
- interpretar autorização;
- ampliar fonte;
- planejar;
- validar objetivo;
- chamar rede;
- instalar plugin;
- executar código;
- persistir memória;
- sobrescrever fonte.

## 11.7 Como pode ser substituído

Cada adaptador específico pode ser substituído independentemente se seu contrato preservar:

- entrada;
- efeito;
- evidência;
- falha;
- recursos acessados.

Uma futura capability não exige plugin dinâmico. Pode ser adicionada explicitamente até existir evidência para mecanismo extensível.

## 11.8 Hipóteses suportadas

- `TECHNICAL-03` — capacidades previsíveis;
- `TECHNICAL-05` — efeitos e falhas;
- `ARCHITECTURE-02` — domínio fora do núcleo;
- `ARCHITECTURE-03` — capability como unidade de extensão;
- `SECURITY-02` — menor acesso;
- `AUTONOMY-05` — retry limitado pelo efeito.

---

# 12. COMPONENTE 7 — VALIDAÇÃO

## 12.1 Responsabilidade

Comparar:

- objetivo;
- critérios de conclusão;
- saída;
- efeito;
- evidências;
- revisão humana.

Deve produzir estado de validação sem depender apenas da alegação da inteligência ou do executor.

## 12.2 Por que existe

O diferencial do J.A.R.V.I.S. depende de resultado verificável.

Sem este componente:

- arquivo criado seria confundido com objetivo concluído;
- resposta plausível poderia ser tratada como correta;
- efeito parcial poderia ser escondido.

## 12.3 Contrato

### Entrada

- objetivo confirmado;
- critérios;
- artefato;
- fontes autorizadas;
- mapa de proveniência;
- efeito observado;
- checklist do experimento;
- decisão do avaliador quando necessária.

### Saída

- validado;
- validado com ressalvas;
- parcial;
- não validado;
- não verificável;
- divergências;
- lacunas;
- conflitos;
- ação recomendada.

## 12.4 Duas classes de validação

### Validação transversal

- ação autorizada;
- original preservado;
- estado conhecido;
- evidência presente;
- efeito identificado.

### Validação específica do experimento

- seções obrigatórias;
- cobertura factual;
- rastreabilidade;
- conflitos;
- lacunas;
- avaliação humana.

Os validadores documentais devem permanecer fora do núcleo.

## 12.5 Dependências

- Núcleo de Tarefa;
- Contexto da Tarefa;
- Executor de Capacidades;
- critérios definidos pelo usuário;
- avaliador humano;
- Registro do Experimento.

## 12.6 O que NÃO é responsabilidade

- executar correção;
- aprovar ação;
- alterar política;
- gerar objetivo;
- modificar artefato;
- declarar certeza sem evidência;
- substituir avaliador humano quando exigido.

## 12.7 Como pode ser substituído

Validadores específicos podem mudar por capability ou domínio.

O contrato transversal deve continuar representando:

- critérios;
- evidências;
- status;
- divergências;
- incerteza.

Não deve existir um “validador universal” que finja compreender todos os domínios.

## 12.8 Hipóteses suportadas

- `TECHNICAL-04` — validação independente;
- `PRODUCT-02` — ciclo além de resposta;
- `UX-04` — transparência;
- `ARCHITECTURE-01` — validação como invariante;
- `PRODUCT-03` — valor líquido;
- `SECURITY-05` — evidência suficiente.

---

# 13. COMPONENTE 8 — REGISTRO DO EXPERIMENTO

## 13.1 Responsabilidade

Registrar o mínimo necessário para:

- reconstruir estado;
- avaliar hipóteses;
- calcular métricas;
- investigar falha;
- demonstrar aprovação e efeito;
- comparar execuções.

## 13.2 Por que existe

O experimento exige evidência.

Sem registro, resultados seriam avaliados por impressão e memória informal.

## 13.3 Contrato

### Recebe

- transição de estado;
- intenção;
- objetivo confirmado;
- pergunta e resposta;
- decisão de autoridade;
- aprovação;
- tentativa;
- efeito;
- validação;
- resultado;
- métricas;
- feedback.

### Fornece

- visão da execução;
- evidências para avaliação;
- dados de métricas;
- estado para recuperação limitada;
- registro de falhas.

## 13.4 Minimização

O registro deve:

- evitar copiar documentos integralmente sem necessidade;
- evitar segredos;
- separar telemetria de conteúdo;
- registrar referências quando suficiente;
- respeitar retenção;
- não ser usado para personalização.

## 13.5 Dependências

Todos os componentes podem emitir registros relevantes.

Somente o Núcleo de Tarefa deve decidir a transição comportamental com base no estado atual.

## 13.6 O que NÃO é responsabilidade

- memória pessoal;
- base de conhecimento;
- contexto ativo;
- fila;
- event bus;
- mecanismo de aprendizado;
- sistema de analytics geral;
- data lake;
- observabilidade distribuída.

## 13.7 Como pode ser substituído

O mecanismo de retenção pode mudar sem alterar os componentes se preservar:

- ordem suficiente;
- identidade da execução;
- eventos;
- aprovações;
- efeitos;
- métricas;
- política de retenção.

Nenhum banco deve ser escolhido antes de conhecer volume, duração e consultas reais.

## 13.8 Hipóteses suportadas

- `PRODUCT-01` — medição da fricção;
- `PRODUCT-03` — benefício líquido;
- `PRODUCT-04` — repetição;
- `TECHNICAL-05` — estado e recuperação;
- `TECHNICAL-06` — custo e latência;
- `SECURITY-05` — auditoria com minimização;
- hipóteses do experimento relacionadas a métricas.

---

## 14. Fluxo principal

### 14.1 Receber intenção

1. Fronteira de Interação recebe intenção e fontes indicadas.
2. Núcleo de Tarefa cria uma execução.
3. Registro do Experimento registra origem e estado inicial.

### 14.2 Compreender objetivo

1. Núcleo solicita ao Adaptador de Inteligência uma proposta de objetivo.
2. Adaptador recebe somente contexto inicial permitido.
3. Núcleo apresenta a proposta ao usuário.
4. Usuário confirma ou esclarece.

### 14.3 Autorizar e adquirir fontes

1. Núcleo formula proposta de leitura.
2. Guardião de Autoridade verifica fontes e finalidade.
3. Executor de Capacidades lê somente fontes autorizadas.
4. Contexto da Tarefa incorpora conteúdo como não confiável, com proveniência.

### 14.4 Produzir rascunho

1. Núcleo decide se precisa de planejamento explícito.
2. Adaptador de Inteligência interpreta e formula o rascunho.
3. Contexto preserva referências e lacunas.
4. Nenhum efeito final é criado nesta etapa.

### 14.5 Validar rascunho

1. Validação compara rascunho, objetivo, fontes e checklist.
2. Divergências retornam ao Núcleo.
3. Núcleo esclarece, corrige ou encerra com ressalvas.

### 14.6 Aprovar efeito

1. Núcleo propõe criação do artefato final.
2. Guardião exige destino e aprovação.
3. Usuário aprova parâmetros finais.
4. Mudança posterior invalida a aprovação.

### 14.7 Executar

1. Executor cria novo artefato.
2. Não sobrescreve originais.
3. Produz evidência do efeito.

### 14.8 Validar resultado

1. Validação confirma existência, conteúdo, proveniência e critérios.
2. Avaliador humano revisa quando necessário.
3. Núcleo atribui estado final.

### 14.9 Comunicar e registrar

1. Fronteira apresenta resultado, evidências e limitações.
2. Usuário fornece feedback.
3. Registro salva métricas.
4. Nenhuma memória pessoal é atualizada.

---

## 15. Fluxos de exceção

## 15.1 Ambiguidade

```text
Núcleo
→ Fronteira solicita esclarecimento
→ usuário responde
→ objetivo/contexto é reavaliado
```

## 15.2 Política bloqueia

```text
Proposta de ação
→ Guardião nega
→ nenhuma execução
→ motivo retorna ao usuário
```

## 15.3 Conteúdo tenta instruir o agente

```text
Contexto marca conteúdo como não confiável
→ instrução não altera objetivo ou política
→ evento é registrado
→ tarefa continua ou é interrompida se houver dúvida
```

## 15.4 Falha de leitura

```text
Executor informa falha
→ Núcleo verifica materialidade
→ pede nova fonte, continua com ressalva ou encerra
```

## 15.5 Falha de criação

```text
Executor informa efeito parcial
→ Núcleo interrompe
→ Validação identifica estado
→ sem retry se houver risco de duplicação
→ usuário decide próximo passo
```

## 15.6 Cancelamento

```text
Fronteira recebe cancelamento
→ Núcleo bloqueia novas ações
→ Executor interrompe quando seguro
→ estado e efeitos são registrados
→ sem retomada automática
```

---

## 16. Fronteiras de confiança

## 16.1 Usuário e identidade

Para o experimento supervisionado, a identidade é fornecida pelo ambiente de execução.

Um sistema completo de autenticação não faz parte da primeira arquitetura.

Se houver acesso remoto, múltiplos usuários ou dados de terceiros, essa decisão precisa ser revista antes da implementação correspondente.

## 16.2 Conteúdo de fontes

Documentos autorizados são confiáveis como recursos permitidos, mas não como instruções ou autoridade.

## 16.3 Inteligência probabilística

Saídas são propostas não confiáveis até:

- serem verificadas;
- cruzarem política quando houver ação;
- serem validadas.

## 16.4 Capacidades

Uma capability pode falhar ou produzir efeito parcial.

Seu retorno não é prova suficiente de conclusão.

## 16.5 Registro

Registros precisam ser íntegros o suficiente para avaliação, mas não devem acumular conteúdo sensível desnecessário.

---

## 17. Persistência mínima

O primeiro experimento precisa persistir apenas:

- estado suficiente da execução;
- aprovações;
- tentativas e efeitos;
- resultados de validação;
- métricas;
- feedback;
- referências às fontes e artefatos.

Não precisa persistir:

- conversas completas por padrão;
- conhecimento geral;
- memória pessoal;
- preferências;
- embeddings;
- representações semânticas globais;
- histórico entre tarefas para personalização.

A tecnologia de persistência permanece em aberto.

Se o experimento puder ser executado e avaliado com retenção simples e limitada, isso é preferível.

---

## 18. Tratamento de memória

Não existe componente de memória de longo prazo na arquitetura inicial.

### Existe

- contexto temporário da tarefa;
- estado necessário à execução;
- registro de evidências do experimento.

### Não existe

- recuperação de preferências entre tarefas;
- memória semântica pessoal;
- histórico usado automaticamente;
- aprendizado adaptativo;
- personalização persistente.

### Motivo

`MEMORY-06` propõe que memória persistente pode não ser necessária para validar o ciclo.

Introduzir memória agora:

- aumentaria privacidade;
- adicionaria retenção;
- criaria contaminação entre execuções;
- dificultaria atribuir resultado ao núcleo básico;
- exigiria decisões tecnológicas prematuras.

---

## 19. Tratamento de sandbox

Não existe executor de código no experimento.

Por isso, uma sandbox de execução de código não é componente da arquitetura inicial.

### Regras

- documentos são tratados como dados;
- conteúdo ativo não deve ser executado;
- instruções incorporadas não podem acionar capabilities;
- bibliotecas futuras que processem conteúdo ativo exigirão análise específica;
- se uma fonte só puder ser processada executando conteúdo não confiável, o experimento deve parar até existir especificação de isolamento.

Sandbox deverá ser adicionada somente quando uma capability realmente executar código, comandos ou conteúdo ativo.

---

## 20. Observabilidade mínima

Não será introduzida plataforma de observabilidade.

O Registro do Experimento deve ser suficiente para responder:

- qual era o objetivo?
- quais fontes foram autorizadas?
- quais perguntas foram feitas?
- quais ações foram propostas?
- quais aprovações foram concedidas?
- quais capabilities foram utilizadas?
- quais efeitos foram observados?
- como o resultado foi validado?
- onde ocorreu falha?
- quanto tempo e esforço foram consumidos?

Se essas perguntas não puderem ser respondidas, o experimento não produz evidência suficiente.

---

## 21. Dependências permitidas entre componentes

```text
Fronteira de Interação
        ↓
Núcleo de Tarefa
        ├──→ Contexto da Tarefa
        ├──→ Adaptador de Inteligência
        ├──→ Guardião de Autoridade
        ├──→ Executor de Capacidades
        ├──→ Validação
        └──→ Registro do Experimento

Contexto da Tarefa
        ├──→ Executor de Capacidades, para aquisição autorizada
        └──→ Registro do Experimento, para estado da execução

Executor de Capacidades
        └──→ Adaptadores específicos do experimento

Validação
        ├──→ critérios do experimento
        └──→ avaliador humano
```

### Dependências proibidas

- Adaptador de Inteligência → Executor direto;
- Adaptador de Inteligência → Guardião para autoaprovação;
- documento → política;
- Executor → nova capability dinâmica;
- Validação → modificação de resultado;
- Registro → personalização;
- adaptador documental → conceito central;
- interface → ferramenta diretamente.

---

## 22. Estratégia de substituição

## 22.1 Interface

Substituível preservando tipos de interação e aprovação.

## 22.2 Inteligência

Substituível preservando propostas, incerteza e referências.

## 22.3 Adaptadores de capability

Substituíveis preservando tentativa, efeito, evidência e falha.

## 22.4 Validador específico

Substituível por domínio, preservando status e evidências.

## 22.5 Registro

Substituível preservando execução, ordem, aprovações, efeitos e métricas.

## 22.6 Guardião de Autoridade

Regras internas substituíveis preservando decisão, escopo, condições e motivo.

## 22.7 Núcleo de Tarefa

Sua estratégia interna pode evoluir, mas mudanças devem preservar estados e invariantes comportamentais.

Substituição não exige criar uma plataforma genérica desde o início. Exige apenas evitar dependências diretas desnecessárias.

---

## 23. Hipóteses cobertas pela arquitetura

### Produto

- `PRODUCT-01`;
- `PRODUCT-02`;
- `PRODUCT-03`;
- `PRODUCT-04` parcialmente;
- `PRODUCT-05` parcialmente.

### UX

- `UX-01`;
- `UX-02`;
- `UX-03`;
- `UX-04`;
- `UX-05`.

### Técnica

- `TECHNICAL-01`;
- `TECHNICAL-02`;
- `TECHNICAL-03`;
- `TECHNICAL-04`;
- `TECHNICAL-05`;
- `TECHNICAL-06`.

### Segurança

- `SECURITY-01`;
- `SECURITY-02`;
- `SECURITY-03`;
- `SECURITY-04`;
- `SECURITY-05`;
- `SECURITY-06`.

### Arquitetura

- `ARCHITECTURE-01` parcialmente;
- `ARCHITECTURE-02`;
- `ARCHITECTURE-03`;
- `ARCHITECTURE-04`;
- `ARCHITECTURE-05`;
- `ARCHITECTURE-06`.

### Memória

- `MEMORY-06`.

### Autonomia

- `AUTONOMY-02`;
- `AUTONOMY-05`;
- `AUTONOMY-06`.

---

## 24. Hipóteses não cobertas

Esta arquitetura não testa adequadamente:

- memória persistente útil;
- personalização;
- múltiplos usuários;
- isolamento organizacional completo;
- residência;
- proatividade;
- monitoramento contínuo;
- autonomia prolongada;
- ações externas de alto impacto;
- comunicação externa;
- transações;
- múltiplos modelos;
- multiagentes;
- paralelismo;
- escala;
- universalidade comprovada.

Essas lacunas são intencionais.

---

## 25. Elementos deliberadamente ausentes

## 25.1 Microserviços

Não há escala, independência de implantação ou equipes que justifiquem.

## 25.2 Multi-agent

Nenhuma hipótese exige entidades autônomas especializadas.

## 25.3 Múltiplos modelos

Um único mecanismo é suficiente para medir qualidade, custo e limites iniciais.

## 25.4 Filas e event bus

O experimento é supervisionado e síncrono.

## 25.5 Kubernetes e infraestrutura distribuída

Não existe necessidade de escala ou disponibilidade distribuída.

## 25.6 Banco vetorial e embeddings

As fontes são pequenas, explícitas e limitadas à tarefa.

## 25.7 Knowledge graph

Não existe requisito de relacionamento persistente complexo.

## 25.8 Plugins dinâmicos

O catálogo de capabilities é pequeno e explícito.

## 25.9 MCP

Pode ser avaliado futuramente como protocolo de integração. Não é requisito do núcleo.

## 25.10 Sistema genérico de políticas

As regras iniciais são pequenas e conhecidas.

## 25.11 Memória de longo prazo

Não é necessária para testar o ciclo.

## 25.12 Sandbox de código

Não existe capability de execução de código no experimento.

---

## 26. Gatilhos que justificariam evolução

Uma nova complexidade só deve ser considerada quando existir evidência.

### Persistência mais robusta

Quando houver:

- retomada real;
- concorrência;
- volume;
- consulta histórica;
- retenção longa.

### Fila ou processamento assíncrono

Quando houver:

- tarefas prolongadas;
- desconexão do usuário;
- recuperação independente;
- múltiplos trabalhos concorrentes.

### Sistema de extensões

Quando várias capabilities independentes mostrarem contratos repetidos e manutenção manual se tornar problema.

### MCP

Quando integrações compatíveis existirem e a comparação mostrar benefício superior a adaptadores diretos.

### Multi-agent

Quando houver necessidade comprovada de:

- isolamento;
- paralelismo;
- especialização com contexto separado;
- responsabilidade independente.

### Múltiplos modelos

Quando métricas mostrarem diferença material de:

- qualidade;
- custo;
- latência;
- modalidade;
- privacidade.

### Banco vetorial

Quando recuperação sobre volume e semântica não puder ser atendida de forma simples e mensurável.

### Knowledge graph

Quando relacionamentos persistentes e consultas estruturadas forem centrais e não apenas interessantes.

### Microserviços

Quando componentes precisarem de:

- implantação independente;
- escala independente;
- isolamento forte;
- equipes independentes;
- disponibilidade distinta.

### Sandbox

Quando for introduzida execução de código ou processamento ativo não confiável.

---

## 27. Riscos da proposta

## 27.1 Núcleo de Tarefa se tornar um componente central excessivo

Mitigação conceitual:

- ele coordena, mas não interpreta, autoriza, executa ou valida;
- contratos impedem dependências diretas com detalhes.

Se começar a conter regras documentais ou integrações, a separação falhou.

## 27.2 Contratos genéricos demais

Mitigação:

- modelar apenas campos exigidos pelos invariantes;
- permitir que adaptadores mantenham detalhes;
- revisar após o experimento.

## 27.3 Guardião virar mecanismo genérico prematuro

Mitigação:

- regras explícitas do experimento;
- sem linguagem de políticas;
- sem hierarquia organizacional.

## 27.4 Contexto virar sistema de memória

Mitigação:

- contexto termina com a tarefa;
- registro não alimenta automaticamente novas execuções;
- nenhuma personalização.

## 27.5 Adaptador de Inteligência receber poder excessivo

Mitigação:

- saída é proposta;
- sem execução direta;
- sem permissão;
- sem validação final.

## 27.6 Domínio documental contaminar o núcleo

Mitigação:

- leitura, formatos e artefatos ficam nos adaptadores do experimento;
- núcleo usa recurso, efeito e evidência;
- revisão explícita após a validação.

---

## 28. Critérios para aceitar a arquitetura

A proposta é adequada se permitir:

- implementar o experimento sem componente distribuído;
- testar todas as etapas do ciclo;
- bloquear ação sem autoridade;
- tratar conteúdo externo como dado;
- substituir a integração de inteligência;
- trocar adaptadores documentais sem alterar o núcleo;
- validar resultado de forma independente;
- registrar métricas;
- executar sem memória persistente;
- cancelar e recuperar com estado conhecido.

Deve ser rejeitada ou revisada se:

- exigir framework complexo para representar o fluxo;
- depender de sistema de plugins;
- permitir modelo chamar ferramenta diretamente sem política;
- usar documento como entidade central;
- exigir banco vetorial;
- incluir multiagentes sem hipótese;
- misturar registro com memória;
- misturar execução com validação;
- não permitir rastrear autoridade.

---

## 29. Decisões ainda não tomadas

Continuam abertas:

- linguagem;
- framework;
- modelo;
- provedor;
- interface inicial;
- formato de estado;
- mecanismo de persistência;
- formatos documentais suportados;
- representação dos contratos;
- mecanismo de parsing;
- local, cloud ou híbrido;
- autenticação futura;
- implantação;
- empacotamento;
- testes concretos;
- bibliotecas.

A arquitetura proposta reduz o espaço dessas decisões, mas não as resolve.

---

## 30. Próxima decisão recomendada

Antes da implementação, a próxima etapa deve ser:

1. revisar esta proposta;
2. confirmar os oito componentes lógicos;
3. escolher uma necessidade real e documentos de teste;
4. definir o conjunto mínimo de formatos;
5. transformar os contratos conceituais em critérios de aceitação;
6. somente então comparar opções de stack com base nesses requisitos.

Não deve haver escolha tecnológica antes da aprovação desta arquitetura conceitual e do escopo concreto do experimento.

---

## 31. Resumo

A menor arquitetura capaz de testar o primeiro experimento é:

- uma única aplicação modular;
- uma fronteira de interação;
- um núcleo de tarefa;
- um contexto temporário;
- um adaptador de inteligência;
- um guardião de autoridade;
- um executor com capabilities explícitas;
- validação independente;
- um registro mínimo do experimento.

Não há justificativa atual para:

- distribuição;
- agentes especializados;
- múltiplos modelos;
- infraestrutura de eventos;
- memória avançada;
- mecanismos universais de extensão.

Essa arquitetura existe para testar hipóteses. Ela não representa a arquitetura final do J.A.R.V.I.S.
