# J.A.R.V.I.S.

## Hipóteses Testáveis

**Base:** `JARVIS_CONTEXT.md` e `JARVIS_INVARIANTS.md`  
**Fase:** descoberta anterior à seleção do primeiro experimento  
**Status:** hipóteses para validação; nenhuma afirmação deste documento deve ser tratada como fato comprovado

---

## 1. Objetivo

Este documento transforma a visão do J.A.R.V.I.S. em hipóteses que podem ser investigadas, enfraquecidas ou falsificadas.

Ele não escolhe:

- MVP;
- primeiro caso de validação;
- arquitetura;
- stack;
- modelo de IA;
- ferramentas;
- sistema de memória;
- nível de autonomia.

As hipóteses estão organizadas em:

- PRODUCT;
- UX;
- TECHNICAL;
- SECURITY;
- ARCHITECTURE;
- MEMORY;
- AUTONOMY.

---

## 2. Como interpretar as hipóteses

### Hipótese

Afirmação que acreditamos poder ser verdadeira, mas que ainda exige evidência.

### Por que acreditamos nela

Raciocínio atual que justifica investigar a hipótese. Não constitui prova.

### Como poderíamos falsificá-la

Observação ou resultado que mostraria que a hipótese está errada, é limitada demais ou precisa ser reformulada.

### Evidência necessária

Dados mínimos que permitiriam tomar uma decisão melhor. Opinião isolada ou demonstração única não deve ser confundida com validação.

### Risco caso esteja errada

Consequência de construir o produto supondo que a hipótese é verdadeira quando não é.

### Prioridade

- **P0 — crítica:** deve ser investigada antes ou durante o primeiro experimento.
- **P1 — alta:** deve ser investigada antes de ampliar o produto ou consolidar abstrações.
- **P2 — futura:** pertence à visão de longo prazo e não precisa bloquear o primeiro experimento.

Prioridade indica ordem de aprendizado, não prioridade de implementação.

---

## 3. Restrições que não são hipóteses

Alguns princípios são limites normativos do produto. Eles não precisam ser validados como desejáveis para serem respeitados.

Entre eles:

- o sistema não deve conceder autoridade a si próprio;
- nenhuma ação material deve ocorrer sem autorização apropriada;
- dados não devem ser utilizados além do escopo autorizado;
- falhas e incertezas relevantes não devem ser escondidas;
- o sistema não deve alegar conclusão sem evidência adequada;
- mudanças persistentes de comportamento devem ser controláveis;
- o usuário deve poder revogar permissões;
- o primeiro experimento não define a identidade do produto.

O que deve ser testado é se os mecanismos futuros conseguem cumprir esses princípios de maneira útil e compreensível.

---

# PRODUCT

## PRODUCT-01 — A distância entre intenção e execução é uma dor relevante

**Hipótese:** Pessoas enfrentam fricção relevante porque precisam traduzir intenções em ferramentas, etapas e transferências manuais de contexto.

**Por que acreditamos nela:** Ambientes digitais são fragmentados e organizados em torno de interfaces e procedimentos, enquanto usuários pensam em resultados.

**Como poderíamos falsificá-la:** Os problemas observados são pouco frequentes, facilmente resolvidos por uma única ferramenta ou não geram esforço suficiente para justificar outra camada.

**Evidência necessária:** Observação de tarefas reais, descrição do processo atual, frequência, tempo, erros, interrupções e esforço total percebido.

**Risco caso esteja errada:** O J.A.R.V.I.S. se tornaria uma camada adicional que aumenta, em vez de reduzir, a fricção.

**Prioridade:** P0 — crítica.

---

## PRODUCT-02 — O ciclo intenção–resultado gera valor além de um chatbot

**Hipótese:** Compreender o objetivo, utilizar contexto e capacidades, executar de forma controlada e validar o efeito gera mais valor do que apenas produzir uma resposta.

**Por que acreditamos nela:** Muitos objetivos dependem de coordenação e ação, não somente de informação.

**Como poderíamos falsificá-la:** Usuários obtêm o mesmo valor com uma resposta, instrução ou ferramenta direta e não desejam delegar execução ou coordenação.

**Evidência necessária:** Comparação entre uma abordagem consultiva e uma abordagem de ciclo completo, medindo resultado, esforço, erros e preferência de uso.

**Risco caso esteja errada:** O produto acumularia complexidade operacional sem benefício proporcional.

**Prioridade:** P0 — crítica.

---

## PRODUCT-03 — O benefício pode superar o custo de supervisão

**Hipótese:** O tempo e a carga cognitiva economizados podem superar o esforço de explicar, confirmar, corrigir e verificar o trabalho do agente.

**Por que acreditamos nela:** Coordenação manual repetitiva consome atenção que poderia ser delegada.

**Como poderíamos falsificá-la:** Usuários precisam fornecer contexto, corrigir interpretações ou confirmar tantas etapas que realizar o trabalho diretamente é mais simples.

**Evidência necessária:** Comparação do esforço total do processo atual com instrução, esclarecimentos, aprovações, correções e verificação no experimento.

**Risco caso esteja errada:** O sistema pareceria poderoso em demonstrações, mas não seria usado no cotidiano.

**Prioridade:** P0 — crítica.

---

## PRODUCT-04 — O valor pode ser repetível

**Hipótese:** Depois de uma experiência inicial bem-sucedida, usuários desejarão utilizar o J.A.R.V.I.S. novamente em tarefas semelhantes ou relacionadas.

**Por que acreditamos nela:** A dor de coordenação tende a ocorrer de forma recorrente em ambientes digitais.

**Como poderíamos falsificá-la:** O uso é percebido como curiosidade, demonstração ou solução excepcional sem intenção de repetição.

**Evidência necessária:** Uso repetido voluntário, retorno sem solicitação do pesquisador e preferência sobre o processo anterior.

**Risco caso esteja errada:** Um sucesso isolado seria interpretado incorretamente como produto sustentável.

**Prioridade:** P1 — alta.

---

## PRODUCT-05 — A direção universal pode coexistir com experimentos específicos

**Hipótese:** É possível validar o ciclo central em casos limitados sem transformar o produto em uma solução especializada.

**Por que acreditamos nela:** Conceitos como intenção, objetivo, contexto, autoridade, execução e validação parecem atravessar diferentes domínios.

**Como poderíamos falsificá-la:** Cada novo caso exige redefinir profundamente os conceitos centrais ou o primeiro domínio começa a dominar linguagem, requisitos e experiência.

**Evidência necessária:** Comparação entre casos contrastantes, identificando quais conceitos mantêm significado e quais pertencem exclusivamente ao domínio.

**Risco caso esteja errada:** O projeto poderá alternar entre especialização acidental e abstração universal sem utilidade.

**Prioridade:** P1 — alta.

---

# UX

## UX-01 — Linguagem natural é uma boa entrada para intenções

**Hipótese:** Usuários conseguem expressar objetivos iniciais com menos esforço por linguagem natural do que configurando manualmente ferramentas e fluxos.

**Por que acreditamos nela:** Pessoas normalmente descrevem necessidades e resultados com maior facilidade do que procedimentos técnicos completos.

**Como poderíamos falsificá-la:** As intenções permanecem ambíguas, exigem longas conversas ou usuários preferem controles estruturados desde o início.

**Evidência necessária:** Testes com intenções reais, quantidade de esclarecimentos, tempo até um objetivo compreendido e preferência do usuário.

**Risco caso esteja errada:** A principal interface de entrada poderá aumentar ambiguidade e esforço.

**Prioridade:** P0 — crítica.

---

## UX-02 — Linguagem natural precisa ser complementada por controles estruturados

**Hipótese:** Usuários preferirão linguagem natural para expressar intenção, mas desejarão controles explícitos para revisar escopo, permissões, efeitos e resultados.

**Por que acreditamos nela:** Conversa é flexível, enquanto ações relevantes exigem precisão e previsibilidade.

**Como poderíamos falsificá-la:** Controles estruturados não melhoram compreensão ou são percebidos apenas como burocracia sem reduzir erros.

**Evidência necessária:** Testes comparando interação somente conversacional com interação que apresenta objetivo, ações, escopo e aprovação de forma estruturada.

**Risco caso esteja errada:** A experiência poderá ficar excessivamente conversacional ou excessivamente burocrática.

**Prioridade:** P0 — crítica.

---

## UX-03 — O sistema pode esclarecer sem devolver todo o trabalho ao usuário

**Hipótese:** O J.A.R.V.I.S. consegue fazer poucas perguntas relevantes e ainda reduzir o esforço total.

**Por que acreditamos nela:** Parte da compreensão exige esclarecimento, mas perguntas bem selecionadas podem evitar erros e retrabalho.

**Como poderíamos falsificá-la:** O usuário precisa fornecer detalhes equivalentes a executar ou planejar a tarefa por conta própria.

**Evidência necessária:** Número e qualidade dos esclarecimentos, tempo gasto, informações redundantes e avaliação de esforço pelo usuário.

**Risco caso esteja errada:** O agente se tornaria um formulário conversacional mais lento que a ferramenta original.

**Prioridade:** P0 — crítica.

---

## UX-04 — Transparência operacional aumenta confiança

**Hipótese:** Mostrar objetivo, estado, ações, evidências e incertezas aumenta confiança sem sobrecarregar o usuário.

**Por que acreditamos nela:** Um agente que age precisa tornar seu comportamento compreensível e contestável.

**Como poderíamos falsificá-la:** As informações são ignoradas, confundem o usuário ou aumentam ansiedade sem melhorar sua capacidade de controlar o resultado.

**Evidência necessária:** Testes de compreensão nos quais o usuário consegue explicar o que ocorreu, o que falta e por que uma aprovação foi solicitada.

**Risco caso esteja errada:** Poderemos produzir uma interface detalhada, mas pouco útil, ou uma falsa sensação de transparência.

**Prioridade:** P0 — crítica.

---

## UX-05 — Confirmações proporcionais reduzem fadiga sem remover controle

**Hipótese:** Usuários aceitam aprovações quando elas estão ligadas a risco e consequência, mas rejeitam confirmação para toda etapa.

**Por que acreditamos nela:** Aprovação constante interrompe o fluxo; aprovação insuficiente reduz segurança e confiança.

**Como poderíamos falsificá-la:** Usuários continuam aprovando mecanicamente, não compreendem as consequências ou preferem revisar todas as ações.

**Evidência necessária:** Taxa de compreensão, tempo de aprovação, cancelamentos, aprovações automáticas por hábito e entrevistas posteriores.

**Risco caso esteja errada:** O sistema poderá causar fadiga de confirmação ou agir além da expectativa do usuário.

**Prioridade:** P0 — crítica.

---

## UX-06 — Residência contínua não é necessária para validar o valor inicial

**Hipótese:** Uma experiência sob demanda ou rapidamente disponível é suficiente para testar o ciclo intenção–resultado.

**Por que acreditamos nela:** Disponibilidade contínua, eventos e proatividade adicionam riscos e não são essenciais para testar compreensão, execução e validação.

**Como poderíamos falsificá-la:** O valor do caso depende fundamentalmente de continuidade, monitoramento ou reação a eventos ao longo do tempo.

**Evidência necessária:** Análise dos candidatos a experimento e observação de onde o valor ocorre: durante uma sessão ou entre eventos distribuídos no tempo.

**Risco caso esteja errada:** O primeiro experimento poderá testar apenas uma parte pouco representativa da promessa.

**Prioridade:** P1 — alta.

---

# TECHNICAL

## TECHNICAL-01 — Intenções podem ser convertidas em objetivos suficientemente corretos

**Hipótese:** Para tarefas limitadas, o sistema consegue produzir uma compreensão operacional do objetivo com confiabilidade suficiente.

**Por que acreditamos nela:** Modelos atuais conseguem interpretar linguagem e solicitar esclarecimentos em muitos cenários delimitados.

**Como poderíamos falsificá-la:** Objetivos são frequentemente interpretados de forma errada, ambiguidades críticas passam despercebidas ou usuários não conseguem corrigir a interpretação.

**Evidência necessária:** Conjunto representativo de intenções, comparação com interpretação humana, taxa de ambiguidades detectadas e gravidade dos erros.

**Risco caso esteja errada:** Todo o restante do ciclo poderá executar corretamente o objetivo errado.

**Prioridade:** P0 — crítica.

---

## TECHNICAL-02 — Contexto relevante pode ser selecionado com precisão suficiente

**Hipótese:** O sistema consegue utilizar informações necessárias sem incluir volume excessivo, conteúdo irrelevante ou dados de outro contexto.

**Por que acreditamos nela:** Seleção orientada ao objetivo pode limitar informações utilizadas em cada tarefa.

**Como poderíamos falsificá-la:** Informações importantes são omitidas, dados irrelevantes degradam decisões ou ocorre mistura entre usuários, projetos ou domínios.

**Evidência necessária:** Casos com contexto relevante, irrelevante, desatualizado e conflitante; medição de omissões, contaminações e vazamentos.

**Risco caso esteja errada:** Resultados incorretos, custos elevados, exposição de dados e perda de confiança.

**Prioridade:** P0 — crítica.

---

## TECHNICAL-03 — Capacidades podem ser selecionadas e utilizadas de forma previsível

**Hipótese:** Dado um objetivo limitado, o sistema consegue identificar uma capacidade adequada, fornecer entradas válidas e interpretar sua saída.

**Por que acreditamos nela:** Capacidades com limites e efeitos explícitos podem reduzir ambiguidade operacional.

**Como poderíamos falsificá-la:** O sistema escolhe ferramentas erradas, inventa capacidades, usa entradas inválidas ou interpreta incorretamente os resultados.

**Evidência necessária:** Cenários positivos, negativos e ambíguos; taxa de seleção correta; uso de capacidade inexistente; erros de entrada e efeito.

**Risco caso esteja errada:** A execução se tornaria imprevisível e potencialmente perigosa.

**Prioridade:** P0 — crítica.

---

## TECHNICAL-04 — Resultados podem ser validados independentemente da execução

**Hipótese:** Para o primeiro experimento, existirão evidências suficientes para distinguir tentativa, execução e objetivo concluído.

**Por que acreditamos nela:** Casos bem escolhidos podem possuir efeitos observáveis, regras ou confirmação humana.

**Como poderíamos falsificá-la:** O único sinal de sucesso é a própria afirmação do modelo ou o retorno superficial da ferramenta.

**Evidência necessária:** Critérios de conclusão definidos antes da execução e fontes de evidência independentes ou revisão humana qualificada.

**Risco caso esteja errada:** O sistema poderá produzir falsas conclusões convincentes.

**Prioridade:** P0 — crítica.

---

## TECHNICAL-05 — Estado, falha e recuperação podem ser representados sem esconder efeitos parciais

**Hipótese:** O sistema consegue identificar onde uma tarefa parou, quais efeitos ocorreram e quais opções seguras permanecem.

**Por que acreditamos nela:** O ciclo conceitual separa execução, validação, falha e recuperação.

**Como poderíamos falsificá-la:** Após uma interrupção, não é possível determinar o que ocorreu, evitar duplicidade ou retomar com segurança.

**Evidência necessária:** Testes com timeout, indisponibilidade, cancelamento, falha parcial e validação negativa.

**Risco caso esteja errada:** Duplicação de ações, perda de trabalho, resultados inconsistentes e danos ocultos.

**Prioridade:** P0 — crítica para qualquer experimento com efeitos.

---

## TECHNICAL-06 — Custo e latência podem permanecer inferiores ao valor entregue

**Hipótese:** O ciclo completo pode operar com tempo e custo aceitáveis para o usuário e o caso escolhido.

**Por que acreditamos nela:** Nem toda etapa precisa utilizar mecanismos caros ou planejamento complexo.

**Como poderíamos falsificá-la:** O tempo de espera, consumo de recursos ou custo monetário supera o benefício do resultado.

**Evidência necessária:** Medições ponta a ponta, incluindo interpretação, ferramentas, validação, correções e repetições.

**Risco caso esteja errada:** O produto poderá ser tecnicamente capaz, mas economicamente ou operacionalmente inviável.

**Prioridade:** P1 — alta.

---

# SECURITY

## SECURITY-01 — Separar política da decisão probabilística reduz ações não autorizadas

**Hipótese:** Controles de política que não dependem exclusivamente do modelo conseguem impedir ações fora do mandato.

**Por que acreditamos nela:** O componente que propõe uma ação não deve ser a única autoridade para permiti-la.

**Como poderíamos falsificá-la:** Ações conseguem contornar a política, parâmetros perigosos passam pela avaliação ou a aplicação é inconsistente.

**Evidência necessária:** Testes positivos e negativos, tentativas de bypass, alterações de contexto e ações com parâmetros parcialmente autorizados.

**Risco caso esteja errada:** O sistema poderá executar ações que o usuário não autorizou.

**Prioridade:** P0 — crítica.

---

## SECURITY-02 — Permissões com escopo e duração limitados são viáveis

**Hipótese:** É possível conceder somente a autoridade necessária para uma tarefa sem tornar a experiência inviável.

**Por que acreditamos nela:** Privilégio mínimo reduz impacto de erro, abuso e comprometimento.

**Como poderíamos falsificá-la:** Ferramentas exigem permissões amplas demais ou o usuário precisa reautorizar tantas vezes que abandona o fluxo.

**Evidência necessária:** Mapeamento de recursos e efeitos, testes de autorização mínima, revogação e observação do esforço do usuário.

**Risco caso esteja errada:** Escolha entre permissões excessivas e experiência impraticável.

**Prioridade:** P0 — crítica.

---

## SECURITY-03 — Conteúdo externo pode ser tratado como não confiável

**Hipótese:** O sistema consegue impedir que documentos, páginas, mensagens ou saídas de ferramentas substituam políticas e instruções autorizadas.

**Por que acreditamos nela:** Separação de autoridade, proveniência e limites de ferramentas pode reduzir prompt injection e tool injection.

**Como poderíamos falsificá-la:** Conteúdo externo consegue alterar objetivo, obter dados, acionar capacidades ou ampliar autoridade.

**Evidência necessária:** Testes adversariais com instruções maliciosas, conteúdo indireto, exfiltração e tentativas de escalada.

**Risco caso esteja errada:** Vazamento de dados, execução indevida e comprometimento completo do agente.

**Prioridade:** P0 — crítica antes de utilizar conteúdo externo com ferramentas.

---

## SECURITY-04 — Contextos e dados podem ser isolados de forma compreensível

**Hipótese:** Informações pessoais, profissionais, de projetos ou de usuários diferentes podem permanecer separadas sem exigir gerenciamento excessivo.

**Por que acreditamos nela:** Contexto possui escopo e o usuário deve controlar finalidade e persistência.

**Como poderíamos falsificá-la:** Dados aparecem em tarefas erradas, o usuário não entende onde serão usados ou a separação exige configuração impraticável.

**Evidência necessária:** Testes de contaminação entre contextos, inspeção de acesso, revogação e avaliação da compreensão do usuário.

**Risco caso esteja errada:** Violação de privacidade, decisões incorretas e perda de confiança.

**Prioridade:** P0 — crítica.

---

## SECURITY-05 — Auditoria útil pode coexistir com minimização de dados

**Hipótese:** É possível registrar objetivo, ações, permissões, efeitos e falhas sem armazenar conteúdo sensível desnecessário.

**Por que acreditamos nela:** Auditoria precisa de eventos e metadados relevantes, não necessariamente de cópias integrais de todos os dados.

**Como poderíamos falsificá-la:** Investigar falhas exige armazenar conteúdo excessivo ou logs minimizados não permitem reconstruir decisões relevantes.

**Evidência necessária:** Exercícios de investigação com registros redigidos, análise de exposição e verificação de rastreabilidade.

**Risco caso esteja errada:** Escolha entre baixa auditabilidade e retenção perigosa de dados.

**Prioridade:** P1 — alta.

---

## SECURITY-06 — Usuários conseguem compreender autorizações relevantes

**Hipótese:** O sistema pode apresentar ação, recurso, destino, efeito e duração de forma que o usuário tome uma decisão informada.

**Por que acreditamos nela:** Autorizações claras podem preservar controle sem exigir conhecimento técnico profundo.

**Como poderíamos falsificá-la:** Usuários aprovam sem compreender, interpretam escopo incorretamente ou não conseguem prever consequências.

**Evidência necessária:** Testes em que o usuário explica com suas próprias palavras o que está autorizando e identifica consequências.

**Risco caso esteja errada:** Aprovação se tornaria ritual sem consentimento real.

**Prioridade:** P0 — crítica.

---

# ARCHITECTURE

## ARCHITECTURE-01 — Existem invariantes compartilhados entre casos diferentes

**Hipótese:** Intenção, objetivo, contexto, capacidade, autoridade, execução, validação e resultado mantêm significado útil em domínios contrastantes.

**Por que acreditamos nela:** Esses conceitos descrevem relações humanas e operacionais mais amplas que uma ferramenta específica.

**Como poderíamos falsificá-la:** Os conceitos precisam ser redefinidos em cada domínio ou ficam genéricos demais para orientar decisões.

**Evidência necessária:** Modelagem conceitual de casos contrastantes e registro das adaptações necessárias em cada conceito.

**Risco caso esteja errada:** O núcleo universal será uma abstração vazia ou uma coleção de exceções.

**Prioridade:** P0 — crítica para a descoberta.

---

## ARCHITECTURE-02 — Especificidades de domínio podem permanecer fora do núcleo

**Hipótese:** Entidades, regras, validadores e integrações específicos podem ser adicionados sem contaminar o vocabulário central.

**Por que acreditamos nela:** O núcleo pretende coordenar capacidades, não representar profundamente todos os domínios.

**Como poderíamos falsificá-la:** Regras de um caso precisam alterar conceitos centrais ou condicionais de domínio se acumulam no núcleo.

**Evidência necessária:** Comparação entre pelo menos dois casos e análise das mudanças exigidas no vocabulário conceitual compartilhado.

**Risco caso esteja errada:** Especialização acidental ou núcleo complexo e cheio de exceções.

**Prioridade:** P1 — alta.

---

## ARCHITECTURE-03 — Capacidade é uma unidade útil de extensão

**Hipótese:** Comportamentos diferentes podem ser descritos por entradas, efeitos, limites, riscos e permissões sem acoplá-los a um único domínio.

**Por que acreditamos nela:** O conceito separa aquilo que o agente pode fazer da ferramenta concreta que realiza o trabalho.

**Como poderíamos falsificá-la:** Capacidades ficam vagas, exigem contratos incompatíveis ou não conseguem expressar efeitos e limites relevantes.

**Evidência necessária:** Descrição de capacidades contrastantes e tentativa de aplicar o mesmo vocabulário sem eliminar diferenças importantes.

**Risco caso esteja errada:** Extensibilidade dependerá de abstrações frágeis ou específicas de ferramenta.

**Prioridade:** P1 — alta.

---

## ARCHITECTURE-04 — Política e permissão precisam permanecer distintas

**Hipótese:** Separar regras de decisão de autoridade concedida melhora clareza, segurança e reutilização.

**Por que acreditamos nela:** Uma política pode avaliar diferentes usuários e contextos, enquanto uma permissão representa uma concessão específica.

**Como poderíamos falsificá-la:** A distinção não melhora decisões, gera duplicação ou não consegue representar os casos reais.

**Evidência necessária:** Modelagem de cenários com diferentes atores, recursos, durações, revogações e consequências.

**Risco caso esteja errada:** O modelo conceitual poderá ser complexo sem benefício ou incapaz de representar autoridade.

**Prioridade:** P0 — crítica para segurança conceitual.

---

## ARCHITECTURE-05 — Contexto e memória precisam permanecer distintos

**Hipótese:** Tratar memória como fonte persistente e contexto como seleção atual reduz mistura de informações e melhora controle.

**Por que acreditamos nela:** Nem tudo que foi armazenado é relevante, atual ou autorizado para toda tarefa.

**Como poderíamos falsificá-la:** A distinção não produz benefício observável ou gera complexidade sem evitar contaminação.

**Evidência necessária:** Casos com memórias relevantes, irrelevantes, conflitantes, expiradas e proibidas no contexto atual.

**Risco caso esteja errada:** Complexidade conceitual desnecessária ou uso indevido de informações persistidas.

**Prioridade:** P1 — alta.

---

## ARCHITECTURE-06 — Planejamento explícito deve ser opcional

**Hipótese:** Selecionar planejamento conforme complexidade produz melhor equilíbrio que planejar todas as tarefas.

**Por que acreditamos nela:** Tarefas simples podem ser executadas diretamente, enquanto tarefas complexas precisam de estratégia e acompanhamento.

**Como poderíamos falsificá-la:** A ausência de plano explícito causa erros frequentes mesmo em tarefas simples, ou o custo de decidir quando planejar supera o benefício.

**Evidência necessária:** Comparação de tarefas simples e complexas com e sem planejamento explícito, medindo qualidade, custo e latência.

**Risco caso esteja errada:** Planejamento excessivo ou execução impulsiva.

**Prioridade:** P1 — alta.

---

## ARCHITECTURE-07 — Universalidade pode ser demonstrada por transferência, não por abstração antecipada

**Hipótese:** A capacidade de incorporar um segundo caso contrastante com mudanças limitadas é evidência melhor de universalidade do que criar extensões genéricas previamente.

**Por que acreditamos nela:** Reutilização real revela invariantes; generalização antecipada apenas expressa expectativas.

**Como poderíamos falsificá-la:** Mesmo casos cuidadosamente escolhidos não fornecem evidência suficiente ou exigem reconstrução completa apesar de conceitos compartilhados.

**Evidência necessária:** Registro das mudanças necessárias ao passar de um caso validado para outro caso contrastante.

**Risco caso esteja errada:** Poderemos adiar decisões necessárias ou interpretar reutilização superficial como universalidade.

**Prioridade:** P1 — alta.

---

# MEMORY

## MEMORY-01 — Memória seletiva reduz reconstrução de contexto

**Hipótese:** Reter informações autorizadas e relevantes reduz repetição e melhora continuidade.

**Por que acreditamos nela:** Usuários perdem tempo reapresentando preferências, decisões e estado de tarefas.

**Como poderíamos falsificá-la:** A memória raramente é reutilizada, exige mais correção do que economiza ou não reduz esforço.

**Evidência necessária:** Comparação de tarefas repetidas com e sem memória, medindo informações reapresentadas, correções e tempo.

**Risco caso esteja errada:** O sistema armazenará dados sem produzir valor proporcional.

**Prioridade:** P1 — alta.

---

## MEMORY-02 — Armazenar menos é melhor que armazenar tudo

**Hipótese:** Memória selecionada por propósito produz mais valor e menos risco do que retenção integral de interações.

**Por que acreditamos nela:** Retenção indiscriminada aumenta ruído, privacidade, custo e possibilidade de utilizar informação fora de contexto.

**Como poderíamos falsificá-la:** Seleção perde informações importantes com frequência e retenção ampla produz benefício líquido sem risco inaceitável.

**Evidência necessária:** Comparação de relevância recuperada, omissões, falsos positivos, custo e exposição entre estratégias de retenção.

**Risco caso esteja errada:** Perda de continuidade ou, no extremo oposto, acúmulo perigoso e inútil de dados.

**Prioridade:** P1 — alta.

---

## MEMORY-03 — Proveniência, tempo e confiança são necessários

**Hipótese:** Memórias sem origem, validade temporal e nível de confiança causam mais erros do que memórias qualificadas.

**Por que acreditamos nela:** Informações podem mudar, conflitar ou ter sido inferidas incorretamente.

**Como poderíamos falsificá-la:** Esses metadados não alteram decisões nem ajudam usuários a corrigir ou avaliar memórias.

**Evidência necessária:** Casos com informações conflitantes, expiradas, inferidas e explicitamente fornecidas; análise das decisões resultantes.

**Risco caso esteja errada:** A memória poderá transformar informações temporárias ou incertas em fatos persistentes.

**Prioridade:** P1 — alta.

---

## MEMORY-04 — Controle e correção pelo usuário aumentam confiança

**Hipótese:** Usuários confiarão mais na memória se puderem visualizar, corrigir, excluir e limitar informações persistidas.

**Por que acreditamos nela:** Memória pessoal afeta privacidade e comportamento futuro do sistema.

**Como poderíamos falsificá-la:** Os controles são pouco utilizados, incompreensíveis ou não alteram confiança e disposição de uso.

**Evidência necessária:** Testes de compreensão, correção, exclusão e revogação, acompanhados de avaliação de confiança.

**Risco caso esteja errada:** Poderemos criar controles complexos sem resolver o problema de confiança.

**Prioridade:** P1 — alta.

---

## MEMORY-05 — Separar memória por contexto reduz contaminação

**Hipótese:** Escopos pessoais, profissionais, de projeto e de tarefa reduzem uso indevido de informações.

**Por que acreditamos nela:** Uma informação válida em um contexto pode ser irrelevante ou sensível em outro.

**Como poderíamos falsificá-la:** A separação não impede contaminação, é difícil de compreender ou exige manutenção excessiva.

**Evidência necessária:** Testes com contextos conflitantes, mudança de escopo e tentativas de recuperar informações não autorizadas.

**Risco caso esteja errada:** Vazamento de dados e decisões baseadas no contexto errado.

**Prioridade:** P0 — crítica antes de memória multicontexto.

---

## MEMORY-06 — Memória persistente pode não ser necessária no primeiro experimento

**Hipótese:** O ciclo central pode ser validado inicialmente com contexto de sessão ou estado limitado.

**Por que acreditamos nela:** Intenção, autorização, execução e validação podem ser testadas sem resolver memória de longo prazo.

**Como poderíamos falsificá-la:** O valor ou a conclusão do caso escolhido depende necessariamente de continuidade entre sessões.

**Evidência necessária:** Análise dos candidatos a experimento e identificação do mínimo de persistência necessário.

**Risco caso esteja errada:** O experimento poderá validar um ciclo artificialmente simples e ignorar continuidade essencial.

**Prioridade:** P0 — crítica para controlar escopo.

---

# AUTONOMY

## AUTONOMY-01 — Usuários aceitam delegação dentro de mandatos explícitos

**Hipótese:** Usuários estão dispostos a delegar ações quando objetivo, escopo, duração e limites são compreensíveis e revogáveis.

**Por que acreditamos nela:** Delegação controlada reduz trabalho sem exigir confiança irrestrita.

**Como poderíamos falsificá-la:** Usuários preferem aprovar cada ação, não compreendem o mandato ou evitam delegar mesmo em tarefas repetitivas.

**Evidência necessária:** Testes com mandatos limitados, avaliação de compreensão, taxa de revogação e preferência sobre confirmação individual.

**Risco caso esteja errada:** Autonomia será um custo de confiança, não uma fonte de valor.

**Prioridade:** P1 — alta.

---

## AUTONOMY-02 — Aprovação proporcional ao risco é melhor que uma regra única

**Hipótese:** Diferenciar ações por efeito, alcance, dados, destinatário e reversibilidade produz melhor equilíbrio entre segurança e fluidez.

**Por que acreditamos nela:** O mesmo tipo de ação pode ter consequências muito diferentes conforme o contexto.

**Como poderíamos falsificá-la:** Usuários não compreendem a diferenciação, classificações são inconsistentes ou ações perigosas recebem baixa proteção.

**Evidência necessária:** Cenários com consequências variadas, comparação de decisões humanas, erros de classificação e fadiga de aprovação.

**Risco caso esteja errada:** Proteção insuficiente ou interrupções excessivas.

**Prioridade:** P0 — crítica.

---

## AUTONOMY-03 — Ações reversíveis e de baixo impacto podem ser pré-autorizadas

**Hipótese:** Depois de compreender o escopo, usuários aceitarão execução automática de ações limitadas, reversíveis e observáveis.

**Por que acreditamos nela:** Confirmar cada ação de baixo impacto pode eliminar o ganho operacional.

**Como poderíamos falsificá-la:** Usuários sentem perda de controle, a reversão não funciona ou efeitos considerados baixos revelam consequências indiretas relevantes.

**Evidência necessária:** Experimentos supervisionados com ações realmente reversíveis, registro de surpresa, cancelamento e necessidade de correção.

**Risco caso esteja errada:** Ações inesperadas e perda de confiança.

**Prioridade:** P1 — alta.

---

## AUTONOMY-04 — Proatividade pode gerar valor sem se tornar intrusiva

**Hipótese:** Sugestões baseadas em eventos autorizados podem ser úteis quando relevantes, explicáveis e configuráveis.

**Por que acreditamos nela:** Algumas oportunidades perdem valor se dependem de o usuário lembrar de perguntar.

**Como poderíamos falsificá-la:** Alertas são ignorados, interrompem o usuário, expõem dados ou geram custo superior ao benefício.

**Evidência necessária:** Taxa de utilidade percebida, ações aceitas, notificações ignoradas, interrupções e ajustes de preferência.

**Risco caso esteja errada:** O J.A.R.V.I.S. será percebido como vigilante, ruidoso ou invasivo.

**Prioridade:** P2 — futura.

---

## AUTONOMY-05 — Recuperação autônoma deve ser limitada por efeito

**Hipótese:** O sistema pode corrigir ou tentar novamente operações sem novo consentimento somente quando a tentativa adicional permanece dentro do mandato e não amplia consequências.

**Por que acreditamos nela:** Algumas falhas transitórias podem ser recuperadas sem interromper o usuário, mas retries podem duplicar efeitos.

**Como poderíamos falsificá-la:** O sistema não consegue distinguir repetição segura, efeitos parciais ou mudança de risco entre tentativas.

**Evidência necessária:** Testes com falha transitória, efeito parcial, idempotência, timeout e alteração de contexto.

**Risco caso esteja errada:** Duplicação, escalada de impacto e ações fora da expectativa.

**Prioridade:** P0 — crítica para qualquer execução com retry.

---

## AUTONOMY-06 — Autoexpansão irrestrita não é necessária para produzir valor

**Hipótese:** O J.A.R.V.I.S. pode evoluir por capacidades adicionadas e aprovadas externamente, sem instalar ferramentas, alterar regras ou gerar autoridade para si próprio.

**Por que acreditamos nela:** Expansão controlada preserva segurança, previsibilidade e auditabilidade.

**Como poderíamos falsificá-la:** Casos essenciais exigem adaptação dinâmica impossível de obter por capacidades previamente governadas.

**Evidência necessária:** Observação de necessidades não atendidas, frequência de novas capacidades e análise de alternativas controladas.

**Risco caso esteja errada:** O produto poderá evoluir lentamente; porém aceitar autoexpansão irrestrita criaria risco muito maior.

**Prioridade:** P1 — alta como limite de produto.

---

## 4. Dependências entre hipóteses

As hipóteses não são independentes.

### Valor depende de experiência

`PRODUCT-03` depende de `UX-03` e `UX-05`.

Se esclarecimentos e aprovações forem excessivos, o benefício líquido pode desaparecer.

### Execução depende de compreensão

`TECHNICAL-03` não produz valor se `TECHNICAL-01` falhar.

Selecionar corretamente uma capacidade para o objetivo errado continua sendo falha.

### Confiança depende de segurança e transparência

`PRODUCT-04` depende de `UX-04`, `SECURITY-01`, `SECURITY-04` e `SECURITY-06`.

Uso repetido não deve ser interpretado como confiança se o usuário não compreende os efeitos.

### Universalidade depende de invariantes e separação de domínio

`PRODUCT-05` depende de `ARCHITECTURE-01`, `ARCHITECTURE-02` e `ARCHITECTURE-07`.

### Memória depende de contexto e controle

`MEMORY-01` não deve ser considerada validada se `MEMORY-04` ou `MEMORY-05` falharem.

Uma memória útil, mas incontrolável ou contaminada, não satisfaz a visão do produto.

### Autonomia depende de autoridade e recuperação

`AUTONOMY-01` depende de `SECURITY-02`, `SECURITY-06`, `AUTONOMY-02` e `AUTONOMY-05`.

---

## 5. Ordem recomendada de investigação

Esta ordem indica aprendizado, não implementação.

### Primeiro: existência de valor

- `PRODUCT-01`;
- `PRODUCT-02`;
- `PRODUCT-03`;
- `UX-01`;
- `UX-03`.

Se essas hipóteses forem falsificadas, decisões técnicas posteriores terão pouco valor.

### Segundo: controlabilidade do ciclo

- `UX-02`;
- `UX-04`;
- `UX-05`;
- `TECHNICAL-01`;
- `TECHNICAL-04`;
- `SECURITY-06`;
- `AUTONOMY-02`.

### Terceiro: viabilidade operacional segura

- `TECHNICAL-02`;
- `TECHNICAL-03`;
- `TECHNICAL-05`;
- `SECURITY-01`;
- `SECURITY-02`;
- `SECURITY-03`;
- `SECURITY-04`.

### Quarto: invariantes e evolução

- hipóteses de ARCHITECTURE;
- hipóteses de MEMORY;
- `PRODUCT-05`.

### Futuro: residência e autonomia ampliada

- `UX-06`;
- `AUTONOMY-01`;
- `AUTONOMY-03`;
- `AUTONOMY-04`;
- `AUTONOMY-05`.

---

## 6. Critério para considerar uma hipótese investigada

Uma hipótese não deve ser marcada simplesmente como “validada”.

O registro deverá indicar:

- contexto em que foi testada;
- usuário ou perfil observado;
- experimento realizado;
- evidência coletada;
- limitações da evidência;
- resultado: sustentada, enfraquecida, falsificada ou inconclusiva;
- decisão decorrente;
- data da revisão.

Uma hipótese sustentada em um caso continua limitada àquele contexto até que outras evidências permitam generalização.

---

## 7. Estado após este documento

Este documento:

- não escolhe o primeiro experimento;
- não escolhe o MVP;
- não comprova nenhuma hipótese;
- não define arquitetura técnica;
- não escolhe tecnologias;
- não transforma visão em requisito implementável automaticamente;
- não autoriza código.

O próximo uso deste material será comparar candidatos a experimento pela quantidade e importância das hipóteses que cada um consegue testar com risco e escopo aceitáveis.
