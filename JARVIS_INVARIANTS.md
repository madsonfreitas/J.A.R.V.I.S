# J.A.R.V.I.S.

## Análise de Invariantes Conceituais

**Base:** `JARVIS_CONTEXT.md`  
**Fase:** descoberta anterior à especificação técnica  
**Status:** análise inicial; não representa arquitetura ou implementação definitiva

---

## 1. Objetivo

Este documento investiga quais conceitos podem permanecer válidos quando o J.A.R.V.I.S. atuar com usuários, objetivos, ferramentas e domínios diferentes.

Um conceito não é considerado invariante apenas porque:

- aparece no ciclo conceitual atual;
- parece útil;
- é comum em sistemas agentivos;
- foi necessário em um primeiro experimento;
- possui um nome genérico.

Um provável invariante deve:

1. ser independente de um domínio específico;
2. preservar significado em casos de uso diferentes;
3. ser necessário para expressar a identidade ou os limites do produto;
4. continuar relevante mesmo quando ferramentas e interfaces mudarem;
5. poder ser descrito sem escolher tecnologia;
6. não depender exclusivamente de uma necessidade do primeiro experimento.

Esta análise trata invariantes como conceitos do produto. Ela não propõe classes, serviços, módulos, tabelas, APIs ou infraestrutura.

---

## 2. Significado das classificações

### Provavelmente invariante

Conceito que provavelmente permanecerá válido em diferentes domínios e experimentos.

Isso não significa que ele será utilizado com a mesma intensidade em toda tarefa nem que deverá se tornar um componente técnico separado.

### Hipótese

Conceito cujo valor ou necessidade ainda precisa ser demonstrado.

Pode fazer parte da visão, mas ainda não há evidência suficiente para tratá-lo como elemento estável do núcleo.

### Capacidade

Comportamento que o J.A.R.V.I.S. pode utilizar quando necessário, mas que não precisa existir ou ser ativado em todo ciclo.

Uma capacidade pode futuramente depender de várias implementações.

### Implementação

Mecanismo técnico escolhido para materializar um conceito.

Exemplos seriam banco de dados, fila, modelo de IA, formato de estado ou algoritmo de planejamento. Nenhum desses mecanismos é definido neste documento.

### Ainda desconhecido

Conceito cuja posição não pode ser determinada com segurança antes de experimentos ou especificações adicionais.

---

## 3. Conclusão resumida

### Prováveis invariantes

- intenção;
- objetivo;
- contexto;
- conhecimento;
- memória controlada;
- capacidade como conceito;
- políticas;
- permissões;
- execução;
- validação;
- resultado;
- feedback;
- comunicação;
- estado;
- falha;
- recuperação mínima.

### Capacidade, mas não invariante obrigatório em todo ciclo

- planejamento explícito.

### Hipótese

- aprendizado adaptativo a partir de feedback e experiência.

### Implementações

Nenhum dos dezoito conceitos deve ser tratado, em seu nível atual de abstração, como implementação.

Suas representações técnicas permanecem desconhecidas e não devem ser escolhidas nesta etapa.

---

## 4. Análise dos conceitos

## 4.1 Intenção

**Classificação principal:** provavelmente invariante

### Significado

Intenção é a expressão inicial de uma necessidade, desejo ou problema do usuário.

Ela pode ser incompleta, ambígua ou não conter uma solução previamente definida.

### Por que provavelmente é invariante

O J.A.R.V.I.S. é orientado à transformação de intenção em resultado. Retirar a intenção removeria o ponto de partida humano e aproximaria o sistema de uma automação acionada apenas por comandos predefinidos.

Em diferentes domínios, a forma da intenção muda, mas sua função permanece:

- iniciar o ciclo;
- indicar uma necessidade;
- permitir que o usuário pense em resultados antes de ferramentas.

### O que não é invariante

- linguagem natural como única forma de entrada;
- texto, voz ou evento como interface;
- formato técnico da intenção;
- necessidade de sempre haver uma frase explícita;
- método usado para interpretar a intenção.

Eventos, sinais ou tarefas programadas poderão representar intenções previamente autorizadas. Isso ainda precisa ser especificado.

---

## 4.2 Objetivo

**Classificação principal:** provavelmente invariante

### Significado

Objetivo é uma interpretação operacional da intenção.

Ele deve expressar, quando aplicável:

- resultado desejado;
- limites;
- restrições;
- critérios de conclusão;
- condições que exigem esclarecimento.

### Por que provavelmente é invariante

Uma intenção pode ser vaga demais para orientar decisões ou validar resultados.

O objetivo cria a ponte entre a necessidade humana e um trabalho que possa ser acompanhado e avaliado. Sem ele, o sistema pode executar ações corretas para a interpretação errada.

### O que não é invariante

- formato de representação;
- existência de um documento formal para toda tarefa;
- quantidade de critérios de aceitação;
- decomposição obrigatória em subtarefas;
- confirmação explícita para objetivos triviais.

O grau de formalidade deve ser proporcional ao risco e à complexidade.

---

## 4.3 Contexto

**Classificação principal:** provavelmente invariante

### Significado

Contexto é a seleção temporária de informações relevantes para compreender ou executar uma tarefa.

Pode incluir usuário, conversa, ambiente, projeto, estado, memória, ferramentas, restrições e dados atuais.

### Por que provavelmente é invariante

A mesma intenção pode exigir comportamentos diferentes conforme:

- quem solicita;
- onde a ação ocorrerá;
- qual tarefa está ativa;
- quais dados podem ser utilizados;
- quais permissões estão vigentes;
- qual histórico é relevante.

Um agente adaptável precisa distinguir situações sem tratar todas as informações disponíveis como igualmente relevantes.

### O que não é invariante

- tamanho do contexto;
- origem específica dos dados;
- técnica de seleção;
- janela de contexto de um modelo;
- estratégia de recuperação;
- formato utilizado para transportar contexto.

Contexto não deve ser confundido com armazenamento nem com tudo que o sistema conhece.

---

## 4.4 Conhecimento

**Classificação principal:** provavelmente invariante

### Significado

Conhecimento é informação que pode ser utilizada para compreender, decidir, criar ou validar.

Pode vir do usuário, de fontes externas, de ferramentas, de documentos, de modelos ou de memória.

### Por que provavelmente é invariante

O segundo cérebro precisa operar sobre informações, conceitos, regras e evidências. Isso permanece verdadeiro em qualquer domínio.

Além disso, distinguir conhecimento de contexto permite afirmar que:

- o sistema pode ter acesso a uma informação sem utilizá-la na tarefa atual;
- uma fonte de conhecimento pode estar desatualizada;
- conhecimento não é automaticamente verdade;
- políticas de autoridade não devem ser tratadas como conhecimento comum.

### Ressalva

Conhecimento provavelmente é um invariante semântico, mas ainda não está provado que precisará existir como uma entidade técnica independente.

Essa separação técnica permanece desconhecida.

### O que não é invariante

- origem específica;
- mecanismo de busca;
- embeddings;
- base vetorial;
- grafo de conhecimento;
- treinamento de modelo;
- formato documental;
- política única de atualização.

---

## 4.5 Memória

**Classificação principal:** provavelmente invariante

### Significado

Memória é informação retida do passado para uso potencial no futuro.

Ela pode representar fatos, preferências, decisões, resultados, acontecimentos ou estado de tarefas.

### Por que provavelmente é invariante

Continuidade e adaptação fazem parte da visão do J.A.R.V.I.S. Um segundo cérebro que não consegue preservar nada obrigaria o usuário a reconstruir contexto continuamente.

Entretanto, memória não precisa participar de toda tarefa. O invariante provável é a existência de uma memória governada, e não a obrigação de persistir tudo.

### Condições necessárias

Uma memória precisa poder carregar:

- origem;
- escopo;
- momento;
- validade;
- confiança;
- autorização;
- possibilidade de correção;
- possibilidade de exclusão.

### O que não é invariante

- tipos definitivos de memória;
- duração;
- banco utilizado;
- formato de armazenamento;
- embeddings;
- recuperação semântica;
- retenção automática de conversas;
- persistência de toda interação.

Memória ilimitada ou automática não faz parte do núcleo.

---

## 4.6 Capacidades

**Classificação principal:** provavelmente invariante

### Significado

Capacidade representa algo que o J.A.R.V.I.S. consegue fazer ou tentar fazer dentro de condições conhecidas.

O conceito deve permitir distinguir:

- o que está disponível;
- o que está indisponível;
- entradas necessárias;
- possíveis efeitos;
- limitações;
- riscos;
- permissões necessárias.

### Por que provavelmente é invariante

Universalidade exige que novos comportamentos possam ser incorporados sem redefinir a identidade do produto.

O meta-conceito de capacidade oferece uma forma de falar sobre aquilo que o agente pode fazer sem torná-lo dependente de uma ferramenta ou domínio específico.

### Distinção importante

**Capacidade como conceito** provavelmente é invariante.

**Capacidades específicas** não são invariantes.

Pesquisar, manipular arquivos, enviar mensagens, programar ou controlar dispositivos são extensões possíveis.

### O que não é invariante

- catálogo técnico;
- sistema de plugins;
- MCP;
- formato de contrato;
- descoberta dinâmica;
- quantidade de capacidades;
- ferramenta usada para realizar uma capacidade.

---

## 4.7 Políticas

**Classificação principal:** provavelmente invariante

### Significado

Políticas são regras que determinam condições, limites e obrigações aplicáveis a decisões e ações.

Elas podem definir:

- ações permitidas;
- ações bloqueadas;
- necessidade de confirmação;
- limites de custo;
- limites de duração;
- requisitos de auditoria;
- condições de uso de dados.

### Por que provavelmente são invariantes

Controle, segurança e autoridade fazem parte da identidade do J.A.R.V.I.S.

Sem políticas, o sistema dependeria do julgamento probabilístico do mesmo componente que deseja executar a ação. Isso violaria a separação entre capacidade e autoridade.

### O que não é invariante

- linguagem de políticas;
- mecanismo de avaliação;
- regras específicas de um domínio;
- classificação fixa de risco;
- armazenamento;
- interface de configuração.

Políticas de um primeiro experimento não devem ser promovidas automaticamente a políticas universais.

---

## 4.8 Permissões

**Classificação principal:** provavelmente invariante

### Significado

Permissão é uma autorização aplicável a um ator, recurso, ação, contexto e período.

Política e permissão não são sinônimos:

- política determina como a autorização deve ser avaliada;
- permissão representa autoridade concedida dentro de determinado escopo.

### Por que provavelmente é invariante

O J.A.R.V.I.S. poderá acessar dados e produzir efeitos. Portanto, precisa distinguir:

- conseguir fazer;
- ter acesso técnico;
- estar autorizado;
- possuir consentimento para este contexto.

Essa distinção permanece válida em qualquer domínio.

### O que não é invariante

- papéis específicos;
- sistema de autenticação;
- formato de token;
- tela de aprovação;
- duração padrão;
- níveis fixos de risco;
- mecanismo técnico de revogação.

---

## 4.9 Planejamento

**Classificação principal:** capacidade

### Significado

Planejamento é a formulação explícita de uma estratégia ou sequência de etapas para alcançar um objetivo.

### Por que não deve ser considerado invariante obrigatório

Nem toda tarefa precisa de um plano explícito.

Uma tarefa simples pode seguir diretamente de objetivo e contexto para a seleção de uma capacidade. Exigir planejamento sempre poderia:

- aumentar custo;
- aumentar latência;
- gerar etapas artificiais;
- tornar o comportamento menos previsível.

O provável invariante é a necessidade de escolher uma abordagem proporcional, não de produzir sempre um plano.

### Quando pode ser necessário

- múltiplas etapas;
- dependências;
- ações com efeitos;
- trabalho prolongado;
- coordenação entre capacidades;
- necessidade de revisão prévia.

### O que não é invariante

- representação do plano;
- planejador separado;
- decomposição automática;
- quantidade de etapas;
- existência de agentes planejadores;
- algoritmo de replanejamento.

---

## 4.10 Execução

**Classificação principal:** provavelmente invariante

### Significado

Execução é a aplicação de uma capacidade para produzir uma saída ou efeito.

Pode produzir:

- resposta;
- artefato;
- consulta;
- alteração;
- comunicação;
- operação externa.

### Por que provavelmente é invariante

O J.A.R.V.I.S. pretende combinar segundo cérebro e segundo par de mãos. Mesmo uma tarefa consultiva precisa aplicar alguma capacidade para produzir seu resultado.

O que varia é o tipo de efeito e o nível de autoridade necessário.

### Distinção importante

Execução como transformação é provável invariante.

Mutação de sistemas externos não é obrigatória em todo ciclo.

### O que não é invariante

- ambiente de execução;
- uso de terminal;
- execução local ou remota;
- protocolo de ferramentas;
- sandbox específico;
- política de timeout;
- mecanismo de idempotência.

---

## 4.11 Validação

**Classificação principal:** provavelmente invariante

### Significado

Validação determina em que medida o objetivo foi atendido e quais evidências sustentam essa conclusão.

### Por que provavelmente é invariante

Resultados verificáveis fazem parte da promessa e da identidade do J.A.R.V.I.S.

Sem validação, o sistema saberia apenas que tentou ou executou algo, não que resolveu a intenção.

### Formas possíveis

- regra determinística;
- comparação;
- evidência externa;
- confirmação do sistema afetado;
- revisão humana;
- aceitação do usuário;
- declaração explícita de que o resultado não pôde ser verificado.

### O que não é invariante

- validador específico;
- métrica de um domínio;
- autoridade usada como fonte;
- automação completa da validação;
- exigência de certeza absoluta.

Cada domínio poderá exigir validadores próprios. Eles não devem ser incorporados ao núcleo apenas porque foram necessários em um experimento.

---

## 4.12 Resultado

**Classificação principal:** provavelmente invariante

### Significado

Resultado é a conclusão comunicável do ciclo.

Ele deve representar, conforme o caso:

- o que foi produzido;
- o que foi alterado;
- qual efeito foi observado;
- quais evidências existem;
- quais incertezas permanecem;
- o que ainda depende do usuário.

### Por que provavelmente é invariante

O produto é orientado a resultados. Sem esse conceito, o ciclo terminaria em atividade técnica, não em valor compreensível para o usuário.

### O que não é invariante

- formato;
- interface;
- relatório;
- arquivo;
- mensagem;
- dashboard;
- nível fixo de detalhe.

Resultado não deve ser confundido com saída bruta de uma ferramenta.

---

## 4.13 Feedback

**Classificação principal:** provavelmente invariante

### Significado

Feedback é informação posterior que permite ao usuário ou ao ambiente:

- aceitar;
- rejeitar;
- corrigir;
- avaliar;
- complementar;
- interromper;
- orientar uma próxima tentativa.

### Por que provavelmente é invariante

Um sistema adaptável precisa aceitar correção. Feedback também fecha o ciclo de controle humano e permite distinguir resultado tecnicamente produzido de resultado útil.

Nem toda tarefa terá feedback explícito, mas o sistema precisa preservar a possibilidade de recebê-lo.

### O que não é invariante

- avaliação numérica;
- botão de aprovação;
- mensagem de texto;
- feedback implícito;
- momento de coleta;
- persistência automática;
- transformação imediata em memória.

Feedback não deve alterar comportamento persistentemente sem regras de governança.

---

## 4.14 Aprendizado

**Classificação principal:** hipótese

### Significado

Aprendizado representa mudança futura de comportamento ou informação com base em experiência, memória ou feedback.

### Por que permanece hipótese

A visão deseja adaptação, mas ainda não está demonstrado:

- quais mudanças geram valor;
- quais podem ser automatizadas;
- como evitar aprendizado incorreto;
- como distinguir preferência de autorização;
- quando uma mudança deve ser explícita;
- como reverter uma adaptação.

Registrar memória não é automaticamente aprender. Receber feedback também não implica modificar comportamento.

### Forma inicial mais segura

O aprendizado poderá começar como capacidade controlada:

- registrar preferência autorizada;
- corrigir informação;
- preservar uma decisão;
- atualizar conhecimento com origem;
- sugerir uma alteração que o usuário possa aprovar.

### O que não deve ser assumido

- treinamento contínuo de modelos;
- autoaperfeiçoamento irrestrito;
- alteração autônoma de políticas;
- geração e instalação autônoma de código;
- otimização invisível;
- comportamento emergente não auditável.

---

## 4.15 Comunicação

**Classificação principal:** provavelmente invariante

### Significado

Comunicação é a troca de informação necessária para:

- receber intenção;
- pedir esclarecimento;
- apresentar opções;
- solicitar autorização;
- informar progresso;
- comunicar falhas;
- entregar resultados;
- receber feedback.

### Por que provavelmente é invariante

Controle humano, transparência e colaboração exigem comunicação.

Ela permanece necessária independentemente de a interface ser texto, voz, interface visual ou outro meio.

### Distinção importante

Comunicação com o próprio usuário faz parte da interação.

Comunicação externa em nome do usuário é uma ação com consequência e deve ser submetida a políticas e permissões.

### O que não é invariante

- chat;
- voz;
- notificações;
- personalidade;
- nome do assistente;
- interface visual;
- canal;
- estilo fixo de resposta.

---

## 4.16 Estado

**Classificação principal:** provavelmente invariante

### Significado

Estado representa a situação atual de uma tarefa ou ciclo.

Pode expressar:

- objetivo atual;
- contexto selecionado;
- etapa;
- ações concluídas;
- ações pendentes;
- aprovações;
- efeitos observados;
- falhas;
- possibilidade de retomada.

### Por que provavelmente é invariante

O ciclo não é necessariamente linear. Execuções podem ser interrompidas, aguardar autorização, falhar ou continuar ao longo do tempo.

Sem estado, o sistema não consegue distinguir:

- ainda não iniciado;
- em andamento;
- aguardando usuário;
- bloqueado;
- parcialmente concluído;
- validado;
- encerrado com falha.

### O que não é invariante

- máquina de estados específica;
- persistência em banco;
- lista definitiva de estados;
- fila;
- sessão;
- sistema de eventos;
- duração da retenção.

---

## 4.17 Falha

**Classificação principal:** provavelmente invariante

### Significado

Falha representa a impossibilidade total ou parcial de alcançar o objetivo ou concluir uma etapa conforme esperado.

Pode surgir por:

- intenção incompreendida;
- contexto insuficiente;
- capacidade indisponível;
- bloqueio de política;
- falta de permissão;
- erro de ferramenta;
- efeito inesperado;
- validação negativa;
- mudança no ambiente.

### Por que provavelmente é invariante

Falhas são inevitáveis em qualquer domínio e especialmente relevantes quando sistemas probabilísticos e ferramentas externas estão envolvidos.

Tratálas como conceito normal do ciclo evita falsa conclusão e comportamento imprevisível.

### O que não é invariante

- taxonomia definitiva de erros;
- códigos;
- exceções técnicas;
- quantidade de tentativas;
- política universal de retry;
- mensagem de erro específica.

Uma política bloqueando uma ação não deve ser tratada necessariamente como defeito. Pode ser um encerramento correto.

---

## 4.18 Recuperação

**Classificação principal:** provavelmente invariante

### Significado

Recuperação é a capacidade mínima de responder de forma segura a falhas, interrupções ou validações negativas.

Pode significar:

- interromper com segurança;
- informar o estado real;
- preservar trabalho válido;
- pedir intervenção;
- corrigir contexto;
- tentar estratégia autorizada diferente;
- retomar posteriormente;
- compensar ou reverter um efeito quando possível.

### Por que provavelmente é invariante

Um agente operacional não pode assumir que todas as etapas terão sucesso.

Sem alguma forma de recuperação, qualquer falha poderá causar:

- perda de estado;
- repetição indevida;
- efeito parcial oculto;
- falsa conclusão;
- necessidade de reiniciar todo o trabalho.

### Limite da invariância

O provável invariante é possuir um contrato de recuperação segura.

Recuperação automática, retry, rollback e compensação são capacidades ou estratégias dependentes do caso.

### O que não é invariante

- número de tentativas;
- rollback automático;
- algoritmo de retry;
- checkpoint técnico;
- estratégia de compensação;
- retomada automática;
- possibilidade de reversão para toda ação.

---

## 5. Relações importantes entre os invariantes

Os conceitos não devem ser tratados como uma sequência rígida nem como elementos totalmente independentes.

### Intenção e objetivo

A intenção expressa uma necessidade. O objetivo representa a compreensão operacional dessa necessidade.

### Conhecimento, memória e contexto

- conhecimento é informação utilizável;
- memória é informação retida;
- contexto é informação selecionada para o momento atual.

Memória e conhecimento podem alimentar contexto.

### Capacidade, política e permissão

- capacidade indica o que pode ser feito;
- política indica como a autoridade deve ser avaliada;
- permissão indica qual autoridade foi concedida.

### Planejamento e execução

Planejamento é opcional e proporcional. Execução aplica uma capacidade para produzir uma saída ou efeito.

### Execução, validação e resultado

- execução realiza;
- validação verifica;
- resultado comunica a conclusão real.

Esses conceitos não devem ser fundidos.

### Feedback, memória e aprendizado

- feedback informa correção ou avaliação;
- memória pode preservar essa informação;
- aprendizado pode alterar comportamento futuro.

Nenhuma passagem entre esses conceitos deve ser automática por definição.

### Estado, falha e recuperação

- estado descreve onde o ciclo está;
- falha registra que algo não ocorreu como esperado;
- recuperação define como encerrar, corrigir ou continuar com segurança.

---

## 6. Conceitos adicionais que podem ser invariantes

A análise dos dezoito conceitos revela candidatos que não estavam explicitamente separados na lista original.

Eles ainda precisam de validação antes de serem adicionados ao conjunto principal.

### Ator ou identidade

Intenções, permissões, memória e resultados precisam estar associados a alguém ou a alguma autoridade reconhecível.

**Classificação atual:** provável invariante de suporte.

### Escopo ou mandato

Define até onde uma autorização, objetivo ou ação pode alcançar.

**Classificação atual:** provável invariante de suporte.

### Evidência

Conecta validação a fatos observáveis e impede que uma alegação de sucesso seja aceita sem fundamento.

**Classificação atual:** provável invariante de suporte.

### Efeito

Representa a mudança ou saída produzida pela execução, separando tentativa de consequência.

**Classificação atual:** provável invariante de suporte.

### Proveniência

Registra de onde uma informação, memória, regra ou evidência veio.

**Classificação atual:** provável invariante de suporte.

### Tempo e validade

Contexto, memória, permissões, estado e evidências podem expirar ou mudar de significado.

**Classificação atual:** provável invariante de suporte.

### Incerteza

Permite representar limites de compreensão, conhecimento e validação.

**Classificação atual:** provável invariante de suporte.

### Risco

Ajuda políticas a considerar consequência, alcance e reversibilidade.

**Classificação atual:** hipótese de conceito transversal. Ainda é necessário descobrir se precisa de representação própria ou se será derivado de outros elementos.

---

## 7. O que não deve entrar no núcleo por causa do primeiro experimento

O primeiro experimento poderá exigir conceitos locais. Eles não devem ser promovidos automaticamente a invariantes.

### Entidades de um domínio

Exemplos:

- documento;
- repositório;
- tarefa de programação;
- planilha;
- produto;
- compromisso;
- mensagem;
- dispositivo;
- registro empresarial.

Essas entidades pertencem aos seus contextos.

### Ferramentas e integrações específicas

Exemplos:

- sistema de arquivos;
- navegador;
- GitHub;
- e-mail;
- calendário;
- terminal;
- API específica;
- aplicativo empresarial.

O núcleo pode precisar do conceito de capacidade ou ferramenta, mas não dessas integrações em particular.

### Formatos de dados

Exemplos:

- PDF;
- planilha;
- JSON;
- documento de texto;
- imagem;
- código-fonte.

Um formato necessário no experimento não se torna formato canônico do produto.

### Fluxo fixo do experimento

A sequência específica de passos usada em um caso não deve se tornar o ciclo universal.

O ciclo conceitual permite:

- omitir etapas desnecessárias;
- repetir etapas;
- solicitar intervenção;
- terminar com bloqueio seguro;
- alterar estratégia.

### Regras e validadores de domínio

Uma regra específica pode ser essencial para validar determinado caso, mas deve permanecer associada àquele contexto.

### Modelo de risco do primeiro caso

Ações consideradas simples em um domínio podem ser críticas em outro.

Níveis, aprovações e limites locais não devem ser universalizados sem evidência.

### Interface utilizada

Chat, CLI, voz, dashboard ou formulário podem servir ao experimento.

Nenhum deles define a comunicação do núcleo.

### Estrutura do resultado

Relatório, arquivo, mensagem, commit ou alteração externa são formas de resultado, não o conceito universal de resultado.

### Estratégia de planejamento

Um caso com múltiplas etapas não prova que todo objetivo necessita de plano explícito.

### Estratégia de memória

Dados que precisam persistir em um experimento não definem:

- memória universal;
- tempo de retenção;
- recuperação;
- indexação;
- busca;
- tecnologia.

### Estratégia de recuperação

Retry, rollback ou checkpoint necessários em um caso não devem se tornar política global.

### Terminologia local

Nomes usados por uma profissão ou ferramenta não devem vazar para o vocabulário central sem justificativa independente.

---

## 8. Teste recomendado para confirmar invariantes

Antes de consolidar um conceito como invariante, ele deve ser confrontado com casos contrastantes.

Para cada candidato, perguntar:

1. O conceito mantém o mesmo significado em casos cognitivos e operacionais?
2. Continua válido em tarefas somente de leitura e em tarefas com efeito externo?
3. Continua válido para tarefas instantâneas e prolongadas?
4. Continua válido para diferentes usuários e contextos?
5. Sua ausência compromete a identidade, o controle ou a verificabilidade?
6. Ele descreve uma necessidade do produto ou uma solução técnica?
7. O primeiro experimento está influenciando sua inclusão?
8. Ele pode permanecer conceitual sem exigir tecnologia específica?

Um conceito deve ser rebaixado de invariante para hipótese ou capacidade quando:

- só aparece em um domínio;
- exige fluxo rígido;
- depende de uma ferramenta;
- não agrega valor fora do experimento inicial;
- existe apenas para acomodar uma implementação escolhida;
- pode ser removido sem afetar a promessa central.

---

## 9. Resultado da análise

O núcleo conceitual provável não é uma coleção de ferramentas.

Ele é um conjunto de relações estáveis:

```text
UM ATOR EXPRESSA UMA INTENÇÃO
→ UM OBJETIVO É COMPREENDIDO
→ CONTEXTO E CONHECIMENTO SÃO SELECIONADOS
→ CAPACIDADES POSSÍVEIS SÃO IDENTIFICADAS
→ POLÍTICAS E PERMISSÕES LIMITAM A AUTORIDADE
→ UMA CAPACIDADE É EXECUTADA
→ SEUS EFEITOS SÃO VALIDADOS
→ UM RESULTADO É COMUNICADO
→ FEEDBACK PODE CORRIGIR ESTADO E MEMÓRIA
→ FALHAS SÃO EXPOSTAS E TRATADAS COM RECUPERAÇÃO SEGURA
```

Planejamento explícito deve permanecer uma capacidade proporcional à complexidade.

Aprendizado deve permanecer uma hipótese controlada até que seja possível demonstrar valor, segurança, auditabilidade e reversibilidade.

As fronteiras técnicas, representações e mecanismos de todos esses conceitos continuam deliberadamente indefinidos.

---

## 10. Estado após esta análise

Esta análise:

- não escolhe MVP;
- não escolhe primeiro experimento;
- não cria arquitetura técnica;
- não define componentes;
- não escolhe stack;
- não escolhe banco de dados;
- não escolhe modelo de IA;
- não escolhe sistema de memória;
- não escolhe protocolo de ferramentas;
- não transforma um caso específico em definição do produto.

Os conceitos classificados como “provavelmente invariantes” ainda precisarão ser testados por especificações e casos contrastantes antes de serem considerados invariantes confirmados.
