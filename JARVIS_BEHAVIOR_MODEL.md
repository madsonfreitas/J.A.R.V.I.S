# J.A.R.V.I.S.

## Modelo Conceitual de Comportamento

**Base:** `JARVIS_CONTEXT.md`, `JARVIS_INVARIANTS.md`, `JARVIS_HYPOTHESES.md`, `EXPERIMENT_02_SPEC.md` e `JARVIS_GENERALIZATION_TEST.md`  
**Status:** modelo conceitual; não representa arquitetura de software  
**Objetivo:** descrever como o J.A.R.V.I.S. deve se comportar da intenção ao resultado

---

## 1. Escopo

Este documento modela comportamento.

Ele não define:

- módulos;
- serviços;
- classes;
- agentes;
- protocolos;
- banco de dados;
- modelos de IA;
- formatos de mensagens;
- infraestrutura;
- interfaces técnicas.

Entradas e saídas descritas aqui são conceitos, não estruturas de dados.

O ciclo de referência é:

```text
INTENÇÃO
↓
COMPREENSÃO
↓
CONTEXTO
↓
PLANEJAMENTO
↓
CAPACIDADES
↓
POLÍTICAS/PERMISSÕES
↓
EXECUÇÃO
↓
VALIDAÇÃO
↓
RESULTADO
↓
MEMÓRIA/FEEDBACK
```

Esse desenho representa responsabilidades, não uma sequência obrigatoriamente linear.

---

## 2. Correções necessárias ao fluxo linear

## 2.1 Planejamento e capacidades formam um ciclo

Um plano não pode ignorar o que o sistema consegue fazer.

Ao mesmo tempo, capacidades não devem ser escolhidas sem compreender o objetivo e uma estratégia mínima.

A relação conceitual correta é:

```text
PLANEJAMENTO ↔ CAPACIDADES
```

O planejamento pode trabalhar inicialmente com capacidades conhecidas de forma abstrata. Depois, as etapas são associadas a capacidades disponíveis. Se uma capacidade não existir, o plano deve ser revisto, reduzido ou rejeitado.

## 2.2 Políticas aparecem antes e durante a execução

Políticas não atuam apenas depois do plano.

Elas:

- limitam quais estratégias podem ser propostas;
- determinam quais informações podem entrar no contexto;
- avaliam cada ação antes da execução;
- continuam válidas durante a ação;
- podem interromper uma tarefa se o contexto mudar.

## 2.3 Contexto pode precisar de execução controlada

Algumas informações necessárias para compreender uma tarefa só podem ser obtidas consultando uma capacidade.

Nesses casos:

```text
CONTEXTO INICIAL
→ CAPACIDADE DE CONSULTA
→ POLÍTICA/PERMISSÃO
→ EXECUÇÃO DE LEITURA
→ CONTEXTO ATUALIZADO
```

Isso não autoriza ações de escrita ou efeitos adicionais.

## 2.4 Validação pode exigir nova execução

Se a validação identificar divergência, o comportamento pode:

- corrigir o contexto;
- revisar o plano;
- selecionar outra capacidade;
- solicitar nova aprovação;
- executar uma correção;
- encerrar com resultado parcial;
- falhar com segurança.

## 2.5 Memória não atualiza comportamento automaticamente

Feedback pode gerar uma candidata a memória.

Uma candidata a memória só deve ser persistida conforme finalidade, autorização, escopo, validade e política de retenção.

Memória não equivale automaticamente a aprendizado.

---

## 3. Princípios comportamentais

O comportamento deve preservar:

1. capacidade não implica autoridade;
2. acesso não implica consentimento;
3. silêncio não implica aprovação;
4. conteúdo não confiável não altera políticas;
5. tentativa não implica efeito;
6. efeito não implica objetivo concluído;
7. saída não validada não deve ser apresentada como resultado confirmado;
8. preferência não equivale a permissão;
9. memória não equivale a verdade;
10. feedback não implica mudança automática de comportamento;
11. retry não pode ampliar autoridade;
12. cancelamento não permite retomada implícita;
13. falha deve permanecer visível;
14. informação incerta deve permanecer identificada;
15. toda ação relevante deve pertencer a um objetivo e a um mandato.

---

# 4. INTENÇÃO

## 4.1 Responsabilidade

Receber e preservar a expressão inicial da necessidade do usuário ou de um evento previamente autorizado.

A intenção deve representar o que se deseja alcançar sem exigir que o usuário conheça todas as ferramentas ou etapas.

## 4.2 Entrada

Pode receber:

- solicitação do usuário;
- mensagem;
- comando;
- seleção em interface;
- evento previamente autorizado;
- continuação explícita de tarefa existente.

Também precisa conhecer:

- origem;
- ator;
- momento;
- canal;
- contexto mínimo de identidade.

## 4.3 Saída

- intenção original preservada;
- ator associado;
- origem;
- escopo inicial;
- indicação preliminar de que a intenção pode ser compreendida, esclarecida ou rejeitada.

## 4.4 Decisões

- a origem é reconhecida?
- existe um ator legítimo?
- a intenção pertence a tarefa existente ou inicia uma nova?
- há conteúdo suficiente para prosseguir à compreensão?
- a solicitação está claramente fora dos limites?

## 4.5 Possíveis falhas

- identidade ausente ou incorreta;
- intenção atribuída ao usuário errado;
- mensagem truncada;
- evento sem mandato;
- mistura entre solicitações;
- conteúdo externo tratado como intenção do usuário;
- comando malicioso disfarçado de dado.

## 4.6 Dependências

- identidade ou origem;
- canal de comunicação;
- estado de tarefa existente;
- limites mínimos de segurança.

## 4.7 Informações que devem permanecer separadas

- intenção original e interpretação;
- conteúdo do usuário e conteúdo externo;
- evento observado e ordem autorizada;
- origem da solicitação e identidade presumida;
- nova tarefa e continuação de tarefa anterior.

---

# 5. COMPREENSÃO

## 5.1 Responsabilidade

Transformar a intenção em um objetivo compreendido, mantendo explícitas incertezas, restrições e informações ausentes.

Compreensão não significa adivinhar.

## 5.2 Entrada

- intenção original;
- ator;
- contexto mínimo;
- tarefa anterior, quando aplicável;
- restrições já conhecidas;
- políticas que limitem a própria interpretação.

## 5.3 Saída

Uma proposta de objetivo contendo, quando necessário:

- resultado desejado;
- finalidade;
- beneficiário;
- limites;
- restrições;
- critérios de conclusão;
- informações desconhecidas;
- ambiguidades;
- suposições candidatas;
- necessidade de confirmação.

## 5.4 Decisões

- o resultado desejado está suficientemente claro?
- existe ambiguidade material?
- alguma suposição pode ser explicitada sem risco?
- é necessário esclarecer?
- o objetivo é possível em princípio?
- o pedido precisa ser reduzido?
- o pedido deve ser rejeitado?

## 5.5 Possíveis falhas

- falsa compreensão;
- extrapolação;
- objetivo amplo demais;
- premissa não declarada;
- perda de restrição;
- interpretação literal inadequada;
- objetivo errado confirmado por comunicação confusa.

## 5.6 Dependências

- intenção;
- comunicação;
- informações mínimas do usuário;
- noção de limites;
- possibilidade de esclarecer.

## 5.7 Informações que devem permanecer separadas

- palavras do usuário e interpretação do sistema;
- fatos explícitos e inferências;
- requisito e preferência;
- objetivo e possível solução;
- restrição e suposição;
- compreensão provisória e objetivo confirmado.

---

# 6. CONTEXTO

## 6.1 Responsabilidade

Selecionar as informações necessárias e autorizadas para compreender, decidir, executar e validar a tarefa atual.

Contexto é uma seleção temporária.

## 6.2 Entrada

- objetivo compreendido;
- identidade;
- estado da tarefa;
- informações atuais;
- fontes autorizadas;
- memória elegível;
- preferências aplicáveis;
- capacidades disponíveis;
- políticas;
- observações do ambiente.

## 6.3 Saída

Um contexto delimitado contendo:

- informações relevantes;
- origem;
- escopo;
- atualidade;
- validade;
- nível de confiança;
- autorização de uso;
- conflitos;
- lacunas;
- itens excluídos por política ou irrelevância.

## 6.4 Decisões

- qual informação é necessária?
- qual informação é permitida?
- qual informação está atual?
- o que precisa ser consultado?
- o que deve ser excluído?
- existe conflito entre fontes?
- a tarefa pode avançar com a lacuna?
- o contexto precisa ser atualizado?

## 6.5 Possíveis falhas

- omissão de informação material;
- inclusão de informação irrelevante;
- uso de informação expirada;
- contaminação entre usuários ou projetos;
- uso de dado não autorizado;
- perda de proveniência;
- prompt injection tratado como instrução;
- excesso de contexto degradando decisões.

## 6.6 Dependências

- objetivo;
- fontes;
- proveniência;
- identidade;
- escopo;
- tempo;
- permissões de leitura;
- capacidade de consulta quando necessária.

## 6.7 Informações que devem permanecer separadas

- contexto atual e memória persistente;
- dado e instrução;
- conteúdo externo e política;
- fato observado e inferência;
- preferência e permissão;
- informação atual e histórica;
- dados de usuários, projetos e ambientes diferentes;
- segredo e dado operacional comum.

---

# 7. PLANEJAMENTO

## 7.1 Responsabilidade

Determinar uma abordagem proporcional para alcançar o objetivo.

Planejamento explícito é uma capacidade condicional, não uma obrigação para toda tarefa.

## 7.2 Entrada

- objetivo confirmado;
- contexto selecionado;
- restrições;
- critérios de conclusão;
- resumo das capacidades disponíveis;
- limitações conhecidas;
- políticas aplicáveis;
- estado atual.

## 7.3 Saída

Pode produzir:

- decisão de executar diretamente;
- plano proposto;
- etapas;
- dependências;
- pontos de aprovação;
- critérios intermediários;
- opções alternativas;
- condições de interrupção;
- possibilidades de recuperação.

## 7.4 Decisões

- é necessário um plano explícito?
- quais etapas são realmente necessárias?
- quais etapas podem produzir efeitos?
- onde é necessária aprovação?
- quais verificações intermediárias existem?
- existe alternativa mais simples?
- o objetivo deve ser dividido?
- a tarefa pode ser concluída com capacidades disponíveis?

## 7.5 Possíveis falhas

- planejamento excessivo;
- plano impossível;
- dependência inexistente;
- ignorar política;
- ignorar estado atual;
- assumir capacidade indisponível;
- criar etapas sem valor;
- esconder efeitos em passos aparentemente simples.

## 7.6 Dependências

- objetivo;
- contexto;
- critérios de conclusão;
- consciência das capacidades;
- restrições de política;
- estado.

## 7.7 Informações que devem permanecer separadas

- plano proposto e plano autorizado;
- estado desejado e estado observado;
- estimativa e fato;
- etapa lógica e ferramenta concreta;
- alternativa possível e ação selecionada;
- plano atual e histórico de planos anteriores.

---

# 8. CAPACIDADES

## 8.1 Responsabilidade

Identificar comportamentos disponíveis que possam realizar partes do objetivo dentro de limites conhecidos.

Uma capacidade descreve o que pode ser feito, não o que está autorizado.

## 8.2 Entrada

- objetivo;
- plano ou necessidade direta;
- contexto;
- requisitos de entrada;
- efeito desejado;
- limitações;
- estado de disponibilidade.

## 8.3 Saída

Seleção de capacidades candidatas contendo:

- finalidade;
- entradas necessárias;
- possível saída;
- possíveis efeitos;
- limitações;
- riscos;
- pré-condições;
- permissões necessárias;
- evidências que pode produzir;
- falhas conhecidas.

## 8.4 Decisões

- existe capacidade adequada?
- está disponível?
- suas entradas são suficientes?
- o efeito é compatível com o objetivo?
- existe opção menos arriscada?
- a capacidade consegue fornecer evidência?
- o plano precisa ser revisto?
- deve haver intervenção humana?

## 8.5 Possíveis falhas

- inventar capacidade;
- selecionar comportamento inadequado;
- ignorar efeito colateral;
- tratar ferramenta indisponível como disponível;
- fornecer entradas erradas;
- interpretar saída incorretamente;
- confundir capacidade com autorização;
- escolher opção mais poderosa que o necessário.

## 8.6 Dependências

- autoconhecimento operacional;
- objetivo;
- plano;
- contexto;
- disponibilidade;
- descrição de efeitos e limites.

## 8.7 Informações que devem permanecer separadas

- capacidade e ferramenta;
- capacidade e permissão;
- efeito declarado e efeito observado;
- disponibilidade e autorização;
- entrada solicitada e dado efetivamente fornecido;
- comportamento geral e integração específica.

---

# 9. POLÍTICAS E PERMISSÕES

## 9.1 Responsabilidade

Determinar se uma ação proposta:

- é permitida;
- é permitida com limites;
- exige aprovação;
- deve ser bloqueada.

Política avalia regras. Permissão representa autoridade concedida.

## 9.2 Entrada

- ator;
- objetivo;
- ação proposta;
- capacidade;
- recurso;
- contexto;
- dados envolvidos;
- possível efeito;
- destino;
- alcance;
- duração;
- reversibilidade;
- mandato existente;
- risco conhecido.

## 9.3 Saída

Uma decisão de autoridade:

- permitido;
- permitido com condições;
- requer aprovação;
- bloqueado;
- autorização ausente;
- autorização expirada;
- contexto insuficiente.

A saída deve indicar:

- escopo;
- duração;
- condições;
- motivo;
- obrigação de registro;
- necessidade de nova avaliação.

## 9.4 Decisões

- o ator pode solicitar essa ação?
- o recurso está dentro do escopo?
- os dados podem ser utilizados?
- o possível efeito está autorizado?
- a permissão ainda é válida?
- o risco exige confirmação?
- o contexto mudou?
- a ação deve ser rejeitada mesmo com confirmação comum?

## 9.5 Possíveis falhas

- escalada de privilégio;
- permissão ampla demais;
- política ambígua;
- autorização expirada aceita;
- conteúdo externo alterando regra;
- preferência interpretada como consentimento;
- aprovação sem compreensão;
- ação diferente escondida em parâmetros;
- fadiga de confirmação.

## 9.6 Dependências

- identidade;
- escopo;
- proveniência;
- ação e efeito propostos;
- mandato;
- tempo;
- regras aplicáveis.

## 9.7 Informações que devem permanecer separadas

- política e conteúdo;
- política e preferência;
- autenticação e autorização;
- permissão e capacidade;
- aprovação e execução;
- ação proposta e parâmetros finais;
- mandato atual e autorizações históricas;
- usuário solicitante e pessoa afetada.

---

# 10. EXECUÇÃO

## 10.1 Responsabilidade

Aplicar capacidades autorizadas para produzir tentativas, saídas ou efeitos dentro do escopo aprovado.

## 10.2 Entrada

- objetivo;
- plano ou ação direta;
- capacidade selecionada;
- parâmetros finais;
- contexto atual;
- autorização válida;
- limites;
- condição de interrupção;
- estado anterior.

## 10.3 Saída

- tentativa registrada;
- saída produzida;
- efeito observado, se houver;
- estado atualizado;
- evidências operacionais;
- falha;
- efeito parcial;
- necessidade de validação;
- necessidade de recuperação.

## 10.4 Decisões

- a autorização ainda é válida?
- as pré-condições continuam verdadeiras?
- é seguro iniciar?
- a próxima etapa pode prosseguir?
- houve mudança material no contexto?
- a ação deve pausar?
- existe efeito parcial?
- deve interromper?

## 10.5 Possíveis falhas

- indisponibilidade;
- timeout;
- entrada inválida;
- efeito parcial;
- duplicação;
- execução no recurso errado;
- consequência não prevista;
- tool injection;
- alteração de contexto durante a ação;
- perda de estado;
- execução após cancelamento.

## 10.6 Dependências

- capacidade;
- autorização;
- contexto atual;
- estado;
- parâmetros;
- limites;
- condição de cancelamento;
- observação dos efeitos.

## 10.7 Informações que devem permanecer separadas

- solicitação de ação e tentativa;
- tentativa e efeito;
- retorno da ferramenta e estado real;
- efeito esperado e observado;
- saída bruta e resultado apresentado;
- erro técnico e bloqueio de política;
- registro operacional e memória pessoal;
- dados sensíveis e metadados de auditoria.

---

# 11. VALIDAÇÃO

## 11.1 Responsabilidade

Comparar objetivo, critérios, efeitos e evidências para determinar o que realmente foi alcançado.

## 11.2 Entrada

- objetivo;
- critérios de conclusão;
- estado anterior;
- tentativas;
- saídas;
- efeitos observados;
- evidências;
- limitações;
- critérios específicos da capacidade;
- revisão humana quando necessária.

## 11.3 Saída

Um estado de validação:

- validado;
- validado com ressalvas;
- parcialmente validado;
- não validado;
- não verificável;
- bloqueado;
- exige revisão humana;
- exige recuperação.

Também deve indicar:

- evidências;
- divergências;
- incertezas;
- efeitos não confirmados;
- critérios não atendidos.

## 11.4 Decisões

- o objetivo foi atingido?
- quais critérios foram atendidos?
- a evidência é suficiente?
- a evidência é independente da alegação do executor?
- existe resultado parcial útil?
- é possível corrigir?
- é necessário reexecutar?
- deve pedir revisão?
- deve encerrar com falha?

## 11.5 Possíveis falhas

- executor validar a si próprio sem evidência;
- aceitar retorno superficial;
- usar evidência desatualizada;
- ignorar efeito parcial;
- confundir plausibilidade com verdade;
- ocultar conflito;
- exagerar certeza;
- considerar sucesso técnico como sucesso do usuário.

## 11.6 Dependências

- objetivo;
- critérios;
- efeitos;
- evidências;
- proveniência;
- capacidade de observação;
- avaliador quando aplicável.

## 11.7 Informações que devem permanecer separadas

- alegação e evidência;
- saída e resultado;
- fato observado e inferência;
- resultado parcial e completo;
- confiança e verdade;
- validação automática e aceitação humana;
- critério geral e validador específico.

---

# 12. RESULTADO

## 12.1 Responsabilidade

Comunicar ao usuário o estado real do objetivo de forma compreensível, verificável e acionável.

## 12.2 Entrada

- objetivo;
- estado da execução;
- estado de validação;
- efeitos;
- evidências;
- falhas;
- limitações;
- incertezas;
- ações pendentes;
- necessidade de decisão humana.

## 12.3 Saída

Uma comunicação de resultado contendo, conforme necessário:

- o que foi pedido;
- o que foi feito;
- o que foi confirmado;
- o que não foi feito;
- o que falhou;
- quais evidências existem;
- quais limitações permanecem;
- qual ação do usuário é necessária;
- estado final ou parcial.

## 12.4 Decisões

- o resultado pode ser apresentado como concluído?
- precisa ser marcado como parcial?
- qual detalhe é relevante ao usuário?
- quais evidências devem ser exibidas?
- é necessário reconhecimento do usuário?
- existe opção segura de continuar?

## 12.5 Possíveis falhas

- falsa conclusão;
- excesso de confiança;
- omissão de efeito parcial;
- linguagem ambígua;
- detalhe excessivo;
- evidência insuficiente;
- falha escondida;
- resultado correto, mas inutilizável;
- confundir próximo passo com ação já realizada.

## 12.6 Dependências

- validação;
- estado;
- evidências;
- comunicação;
- finalidade do usuário;
- nível de detalhe adequado.

## 12.7 Informações que devem permanecer separadas

- resultado provisório e final;
- resumo e registro operacional;
- evidência e explicação;
- sucesso técnico e utilidade;
- recomendação e ação executada;
- limitação e erro;
- resultado do usuário e telemetria interna.

---

# 13. MEMÓRIA E FEEDBACK

## 13.1 Responsabilidade

Receber avaliação, correção e informações que possam melhorar continuidade futura, sem alterar comportamento ou persistir dados de forma automática.

## 13.2 Entrada

- resultado apresentado;
- feedback explícito;
- correções;
- aceitação ou rejeição;
- estado final;
- evidências;
- candidatos a memória;
- política de retenção;
- autorização;
- escopo.

## 13.3 Saída

Pode produzir:

- feedback registrado;
- correção aplicada ao resultado;
- candidata a memória;
- memória persistida com autorização;
- memória rejeitada;
- sugestão de preferência;
- item de aprendizado para avaliação;
- decisão de não reter.

## 13.4 Decisões

- o feedback corrige esta tarefa ou comportamento futuro?
- a informação deve ser persistida?
- existe finalidade?
- qual escopo?
- por quanto tempo?
- é fato, preferência, decisão ou inferência?
- exige confirmação?
- substitui memória anterior?
- precisa ser esquecida após a tarefa?

## 13.5 Possíveis falhas

- memorizar erro;
- memorizar dado sensível sem necessidade;
- transformar preferência em permissão;
- misturar contextos;
- manter informação expirada;
- alterar comportamento silenciosamente;
- usar feedback isolado como regra universal;
- não permitir correção ou exclusão.

## 13.6 Dependências

- feedback;
- identidade;
- proveniência;
- política de retenção;
- autorização;
- escopo;
- tempo;
- capacidade de correção e exclusão.

## 13.7 Informações que devem permanecer separadas

- feedback e memória;
- memória e aprendizado;
- preferência e autorização;
- fato e inferência;
- memória pessoal e profissional;
- estado temporário e conhecimento persistente;
- histórico de auditoria e memória usada para personalização;
- correção local e regra universal.

---

# 14. ESCLARECIMENTO

## 14.1 Responsabilidade

Obter informação necessária quando prosseguir criaria risco material de interpretar ou executar incorretamente.

## 14.2 Pode ser iniciado por

- compreensão;
- contexto;
- planejamento;
- seleção de capacidades;
- política;
- validação;
- recuperação.

## 14.3 Comportamento

1. identificar exatamente a incerteza;
2. explicar por que ela importa quando necessário;
3. agrupar perguntas relacionadas;
4. apresentar opções quando forem legítimas;
5. pausar somente o trabalho dependente da resposta;
6. receber a resposta;
7. atualizar o conceito que originou a dúvida;
8. reavaliar decisões afetadas.

## 14.4 Saídas possíveis

- resposta suficiente;
- resposta parcial;
- mudança de objetivo;
- redução de escopo;
- cancelamento;
- ausência de resposta;
- rejeição.

## 14.5 Limites

- não repetir pergunta sem nova razão;
- não pedir detalhes que o sistema possa obter de fonte autorizada com menor esforço;
- não presumir consentimento pelo silêncio;
- não continuar se a dúvida material permanecer;
- não transformar esclarecimento em transferência total do planejamento para o usuário.

## 14.6 Informações separadas

- pergunta e autorização;
- resposta e confirmação do objetivo inteiro;
- ausência de resposta e negação;
- esclarecimento factual e aprovação de efeito.

---

# 15. REJEIÇÃO

## 15.1 Responsabilidade

Encerrar ou limitar uma solicitação que não pode ou não deve ser executada.

## 15.2 Motivos

- ação proibida;
- autoridade insuficiente;
- risco inaceitável;
- objetivo incompatível com limites;
- solicitação para ampliar autoridade;
- incapacidade conhecida;
- ausência de informação essencial sem possibilidade de esclarecimento;
- violação de escopo;
- conteúdo malicioso.

## 15.3 Comportamento

Uma rejeição deve:

- ocorrer antes do efeito proibido;
- indicar a categoria do motivo;
- não revelar informação sensível;
- explicar o que não será feito;
- oferecer alternativa segura quando existir;
- preservar o estado;
- não ser reclassificada como falha técnica.

## 15.4 Resultado

- rejeitado integralmente;
- escopo reduzido proposto;
- alternativa segura;
- encaminhamento para aprovação superior;
- incapacidade declarada.

## 15.5 Informações separadas

- proibido e indisponível;
- sem permissão e impossível;
- rejeição de política e erro técnico;
- alternativa sugerida e ação autorizada.

---

# 16. APROVAÇÃO

## 16.1 Responsabilidade

Obter decisão humana informada antes de ação ou efeito que exceda autoridade já concedida.

## 16.2 Conteúdo mínimo de uma solicitação

- objetivo relacionado;
- ação proposta;
- recurso afetado;
- dados utilizados;
- destino;
- efeito esperado;
- risco relevante;
- reversibilidade;
- duração ou escopo;
- alternativas;
- consequência de negar.

## 16.3 Respostas possíveis

- aprovar;
- negar;
- aprovar com limites;
- modificar;
- pedir esclarecimento;
- cancelar;
- não responder.

Ausência de resposta nunca equivale a aprovação.

## 16.4 Comportamento após aprovação

Antes de executar, deve-se confirmar:

- que o contexto não mudou materialmente;
- que os parâmetros finais correspondem ao aprovado;
- que a aprovação não expirou;
- que a capacidade continua disponível.

Mudança material exige nova avaliação e possivelmente nova aprovação.

## 16.5 Informações separadas

- aprovação e autenticação;
- aprovação e execução concluída;
- ação aprovada e parâmetros alterados;
- permissão persistente e confirmação pontual;
- compreensão do usuário e simples clique.

---

# 17. INTERRUPÇÃO

## 17.1 Responsabilidade

Pausar ou encerrar novas ações quando continuar não for seguro, autorizado ou útil.

## 17.2 Origem

- usuário;
- política;
- mudança de contexto;
- falha;
- perda de capacidade;
- cancelamento;
- condição de segurança;
- impossibilidade de validar;
- limite de custo ou duração.

## 17.3 Comportamento

1. impedir novas ações;
2. determinar se a ação atual pode parar com segurança;
3. observar efeitos já produzidos;
4. preservar estado necessário;
5. comunicar situação;
6. indicar se é pausa, cancelamento ou falha;
7. não retomar sem condição válida.

## 17.4 Saída

- pausado;
- aguardando usuário;
- aguardando capacidade;
- bloqueado;
- cancelado;
- encerrado com falha;
- pronto para recuperação.

## 17.5 Informações separadas

- solicitação de interrupção e confirmação de que parou;
- pausa e cancelamento;
- ação interrompida e efeito já produzido;
- estado preservado e memória permanente.

---

# 18. FALHA

## 18.1 Responsabilidade

Representar explicitamente que uma etapa ou objetivo não ocorreu conforme esperado.

## 18.2 Categorias conceituais

- falha de compreensão;
- falha de contexto;
- capacidade indisponível;
- bloqueio de política;
- autorização ausente;
- falha de execução;
- efeito parcial;
- falha de validação;
- falha de comunicação;
- estado desconhecido;
- limite excedido.

Bloqueio de política não é defeito do sistema. Pode ser comportamento correto.

## 18.3 Informações mínimas

- onde ocorreu;
- o que era esperado;
- o que foi observado;
- efeitos conhecidos;
- efeitos desconhecidos;
- possibilidade de retry;
- possibilidade de recuperação;
- necessidade de intervenção;
- estado atual.

## 18.4 Comportamento

- não esconder;
- não alegar conclusão;
- não repetir automaticamente sem avaliação;
- preservar evidência;
- classificar impacto;
- direcionar para recuperação ou encerramento.

## 18.5 Informações separadas

- causa e sintoma;
- erro técnico e impacto no objetivo;
- falha e rejeição;
- falha transitória e permanente;
- efeito conhecido e desconhecido;
- mensagem ao usuário e diagnóstico interno.

---

# 19. RETRY

## 19.1 Responsabilidade

Repetir uma tentativa somente quando houver motivo para acreditar que a falha é transitória e que a repetição permanece segura.

## 19.2 Pré-condições

Retry só pode ocorrer quando:

- a ação continua autorizada;
- o objetivo não mudou;
- o contexto relevante permanece válido;
- a falha parece transitória;
- o efeito anterior é conhecido;
- repetição não duplica consequência indevida;
- existe limite de tentativas;
- a capacidade permanece adequada.

## 19.3 Retry não deve ocorrer

- após rejeição de política;
- para contornar falta de permissão;
- quando o efeito anterior é desconhecido;
- quando pode duplicar ação irreversível;
- após cancelamento;
- quando a validação mostrou que a estratégia está errada;
- indefinidamente;
- com ampliação silenciosa de escopo.

## 19.4 Saída

- nova tentativa autorizada;
- recuperação alternativa;
- intervenção humana;
- encerramento seguro.

## 19.5 Informações separadas

- nova tentativa e nova ação;
- falha transitória e estratégia incorreta;
- retry e replanejamento;
- limite operacional e permissão.

---

# 20. RECUPERAÇÃO

## 20.1 Responsabilidade

Restabelecer um estado seguro e decidir como continuar ou encerrar após falha, interrupção ou validação negativa.

## 20.2 Estratégias possíveis

- retry seguro;
- corrigir entrada;
- atualizar contexto;
- selecionar capacidade alternativa;
- replanejar;
- solicitar aprovação;
- compensar efeito;
- reverter quando possível;
- preservar resultado parcial;
- pedir intervenção;
- encerrar com estado conhecido.

## 20.3 Decisões

- há risco em continuar?
- o efeito anterior é conhecido?
- a autorização cobre a recuperação?
- compensar produz novo efeito?
- existe alternativa mais segura?
- o resultado parcial é útil?
- é necessário novo objetivo?
- deve encerrar?

## 20.4 Possíveis falhas

- recovery ampliar dano;
- rollback presumido, mas impossível;
- compensação parcial;
- retry duplicado;
- perda de estado;
- nova estratégia fora da autorização;
- esconder falha original.

## 20.5 Dependências

- estado;
- falha;
- efeitos observados;
- políticas;
- capacidades;
- evidências;
- autorização;
- possibilidade de reversão.

## 20.6 Informações separadas

- recuperação e retry;
- reversão e compensação;
- resultado parcial e sucesso;
- nova estratégia e objetivo original;
- autorização original e autorização adicional.

---

# 21. CANCELAMENTO

## 21.1 Responsabilidade

Encerrar uma tarefa por decisão válida do usuário ou por regra equivalente de autoridade.

## 21.2 Comportamento

Após cancelamento:

1. novas ações não devem iniciar;
2. ação atual deve parar de forma segura quando possível;
3. efeitos já ocorridos devem ser identificados;
4. trabalho incompleto deve ser marcado;
5. recuperação mínima pode ocorrer para preservar segurança;
6. ações compensatórias com novos efeitos exigem autoridade;
7. resultado deve indicar cancelamento;
8. retomada exige nova intenção ou autorização explícita.

## 21.3 Possíveis estados finais

- cancelado sem efeito;
- cancelado com efeito parcial conhecido;
- cancelado após compensação;
- cancelamento solicitado, mas parada ainda não confirmada;
- cancelado com necessidade de intervenção.

## 21.4 Informações separadas

- pedido de cancelamento e parada confirmada;
- cancelamento e pausa;
- limpeza segura e nova execução;
- estado temporário e memória persistente.

---

# 22. ESTADOS CONCEITUAIS

Os estados abaixo ajudam a descrever comportamento. Eles não definem uma máquina de estados técnica.

```text
RECEBIDO
COMPREENDENDO
AGUARDANDO_ESCLARECIMENTO
OBJETIVO_CONFIRMADO
CONSTRUINDO_CONTEXTO
PLANEJANDO
SELECIONANDO_CAPACIDADES
AGUARDANDO_APROVAÇÃO
AUTORIZADO
EXECUTANDO
PAUSADO
VALIDANDO
RECUPERANDO
CONCLUÍDO
CONCLUÍDO_COM_RESSALVAS
PARCIAL
REJEITADO
CANCELADO
FALHOU
ESTADO_DESCONHECIDO
```

### Regras

- `CONCLUÍDO` exige validação adequada;
- `AUTORIZADO` não significa executado;
- `EXECUTANDO` não significa efeito confirmado;
- `PARCIAL` não deve ser apresentado como concluído;
- `CANCELADO` não permite retomada automática;
- `REJEITADO` não deve iniciar execução;
- `ESTADO_DESCONHECIDO` exige interrupção e investigação;
- `CONCLUÍDO_COM_RESSALVAS` deve expor as ressalvas.

---

# 23. TRANSIÇÕES PRINCIPAIS

```text
RECEBIDO
→ COMPREENDENDO

COMPREENDENDO
→ AGUARDANDO_ESCLARECIMENTO
→ OBJETIVO_CONFIRMADO
→ REJEITADO

AGUARDANDO_ESCLARECIMENTO
→ COMPREENDENDO
→ CANCELADO

OBJETIVO_CONFIRMADO
→ CONSTRUINDO_CONTEXTO

CONSTRUINDO_CONTEXTO
→ AGUARDANDO_ESCLARECIMENTO
→ PLANEJANDO
→ SELECIONANDO_CAPACIDADES
→ REJEITADO

PLANEJANDO
↔ SELECIONANDO_CAPACIDADES

SELECIONANDO_CAPACIDADES
→ AGUARDANDO_APROVAÇÃO
→ AUTORIZADO
→ REJEITADO

AGUARDANDO_APROVAÇÃO
→ AUTORIZADO
→ REJEITADO
→ CANCELADO

AUTORIZADO
→ EXECUTANDO

EXECUTANDO
→ VALIDANDO
→ PAUSADO
→ RECUPERANDO
→ CANCELADO
→ FALHOU

VALIDANDO
→ CONCLUÍDO
→ CONCLUÍDO_COM_RESSALVAS
→ PARCIAL
→ RECUPERANDO
→ FALHOU

RECUPERANDO
→ PLANEJANDO
→ SELECIONANDO_CAPACIDADES
→ AGUARDANDO_APROVAÇÃO
→ EXECUTANDO
→ PARCIAL
→ FALHOU
→ CANCELADO
```

Qualquer estado ativo pode transicionar para interrupção segura quando o usuário cancelar ou uma política exigir.

---

# 24. MODELOS DE CAMINHO

## 24.1 Caminho simples

```text
INTENÇÃO
→ COMPREENSÃO SUFICIENTE
→ CONTEXTO MÍNIMO
→ CAPACIDADE DIRETA
→ POLÍTICA PERMITE
→ EXECUÇÃO
→ VALIDAÇÃO
→ RESULTADO
```

Não há planejamento explícito.

## 24.2 Caminho com esclarecimento

```text
INTENÇÃO
→ AMBIGUIDADE MATERIAL
→ PERGUNTA
→ RESPOSTA
→ OBJETIVO ATUALIZADO
→ CONTINUAÇÃO
```

## 24.3 Caminho com aprovação

```text
AÇÃO PROPOSTA
→ POLÍTICA EXIGE CONFIRMAÇÃO
→ EFEITO EXPLICADO
→ USUÁRIO APROVA COM ESCOPO
→ CONTEXTO REVALIDADO
→ EXECUÇÃO
```

## 24.4 Caminho com rejeição

```text
SOLICITAÇÃO
→ POLÍTICA BLOQUEIA OU CAPACIDADE INEXISTE
→ NENHUM EFEITO
→ MOTIVO COMUNICADO
→ ALTERNATIVA SEGURA, SE EXISTIR
```

## 24.5 Caminho com falha transitória

```text
EXECUÇÃO
→ FALHA TRANSITÓRIA
→ EFEITO ANTERIOR CONHECIDO
→ RETRY SEGURO E LIMITADO
→ VALIDAÇÃO
```

## 24.6 Caminho com efeito parcial

```text
EXECUÇÃO
→ EFEITO PARCIAL
→ INTERRUPÇÃO
→ ESTADO OBSERVADO
→ RECUPERAÇÃO OU INTERVENÇÃO
→ RESULTADO PARCIAL OU FALHA
```

## 24.7 Caminho com cancelamento

```text
USUÁRIO CANCELA
→ NOVAS AÇÕES BLOQUEADAS
→ PARADA SEGURA
→ EFEITOS IDENTIFICADOS
→ ESTADO CANCELADO
→ SEM RETOMADA AUTOMÁTICA
```

## 24.8 Caminho com validação negativa

```text
EXECUÇÃO CONCLUÍDA
→ EVIDÊNCIA NÃO SATISFAZ OBJETIVO
→ NÃO DECLARAR SUCESSO
→ CORRIGIR, REPLANEJAR, PEDIR AJUDA OU ENCERRAR
```

---

# 25. INFORMAÇÕES QUE NUNCA DEVEM SER FUNDIDAS

## 25.1 Intenção e objetivo

A intenção pertence ao usuário. O objetivo é uma interpretação que precisa permanecer contestável.

## 25.2 Contexto e memória

Contexto é seleção atual. Memória é retenção.

## 25.3 Conhecimento e autoridade

Uma fonte pode informar, mas não conceder permissão.

## 25.4 Capacidade e permissão

Saber fazer não significa poder fazer.

## 25.5 Plano e execução

Uma etapa planejada não ocorreu até existir tentativa e efeito.

## 25.6 Tentativa e efeito

Uma chamada bem-sucedida não garante mudança no mundo.

## 25.7 Efeito e resultado

Um efeito pode existir sem satisfazer o objetivo.

## 25.8 Validação e comunicação

Apresentar algo como válido não o torna válido.

## 25.9 Preferência e mandato

O modo preferido de trabalhar não concede autoridade operacional.

## 25.10 Feedback e aprendizado

Uma correção não deve se tornar regra permanente automaticamente.

## 25.11 Auditoria e memória

Dados retidos para investigação não devem ser usados automaticamente para personalização.

## 25.12 Rejeição e falha

Recusar corretamente uma ação proibida é sucesso de controle, não erro técnico.

---

# 26. INVARIANTES COMPORTAMENTAIS PROPOSTOS

O modelo sugere os seguintes invariantes comportamentais, ainda sujeitos a validação:

1. toda tarefa deve possuir origem e ator identificáveis;
2. toda execução deve estar ligada a objetivo compreendido;
3. toda informação usada deve possuir escopo e origem quando material;
4. toda capacidade deve declarar limites e possíveis efeitos;
5. toda ação deve passar por avaliação de autoridade;
6. toda aprovação deve possuir escopo;
7. toda tentativa deve atualizar estado;
8. todo efeito relevante deve ser observado quando possível;
9. toda conclusão deve estar ligada a validação;
10. toda falha material deve permanecer visível;
11. todo retry deve permanecer dentro do mandato;
12. todo cancelamento deve bloquear novas ações;
13. toda recuperação deve preservar ou restabelecer estado seguro;
14. toda memória persistida deve possuir finalidade e governança;
15. todo resultado deve distinguir confirmado, parcial, incerto e não realizado.

Esses invariantes descrevem comportamento. Não implicam componentes técnicos individuais.

---

# 27. ESTADO APÓS O MODELO

Este documento:

- modela o ciclo conceitual;
- modela caminhos não lineares;
- separa comportamento normal, rejeição, falha e cancelamento;
- define relações entre planejamento e capacidades;
- preserva a separação entre autoridade e execução;
- não escolhe tecnologia;
- não define arquitetura;
- não autoriza implementação.

O próximo passo futuro poderá transformar este modelo em cenários, regras de aceitação e casos de teste conceituais antes de qualquer desenho técnico.
