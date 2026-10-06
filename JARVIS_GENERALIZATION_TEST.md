# J.A.R.V.I.S.

## Teste de Generalização do Núcleo Conceitual

**Base:** `JARVIS_CONTEXT.md`, `JARVIS_INVARIANTS.md`, `EXPERIMENT_01_SELECTION.md` e `EXPERIMENT_02_SPEC.md`  
**Status:** análise conceitual; não representa arquitetura ou implementação  
**Objetivo:** verificar se o ciclo usado no primeiro experimento mantém significado em problemas de natureza diferente

---

## 1. Escopo

O núcleo conceitual avaliado é:

```text
INTENÇÃO
→ OBJETIVO
→ CONTEXTO
→ CAPACIDADES
→ POLÍTICAS/PERMISSÕES
→ EXECUÇÃO
→ VALIDAÇÃO
→ RESULTADO
```

O caso original é:

> Transformar documentos autorizados em um resultado estruturado, rastreável e verificável.

Dois problemas contrastantes foram criados:

1. planejamento pessoal de um dia de trabalho;
2. preparação controlada de um ambiente físico de trabalho.

Os casos foram escolhidos para produzir contraste:

- informação estática versus estado temporal;
- efeito cognitivo versus efeito físico;
- validação por fontes versus validação por restrições e observação;
- baixo efeito externo versus alteração de dispositivos;
- tarefa sob demanda versus ação limitada no tempo.

Este teste verifica generalização sem afirmar que os três casos devem ser implementados.

---

## 2. Critério do teste

Um conceito será considerado mais provavelmente invariante quando:

- mantiver significado nos três casos;
- não depender de entidade específica do domínio;
- continuar necessário mesmo quando o tipo de efeito mudar;
- puder ser descrito sem tecnologia;
- não exigir que os casos sejam artificialmente adaptados ao modelo.

Um conceito será considerado específico quando:

- existir apenas devido às fontes, ferramentas ou regras de um caso;
- perder significado em outro domínio;
- exigir formato ou fluxo particular;
- representar uma capacidade, e não uma responsabilidade transversal.

O teste pode:

- fortalecer um candidato a invariante;
- revelar que ele é apenas uma capacidade;
- revelar uma abstração prematura;
- permanecer inconclusivo.

Ele não prova arquitetura reutilizável.

---

# CASO 1 — DOCUMENTOS → RESULTADO ESTRUTURADO

## 3. Descrição

O usuário possui uma necessidade real e um conjunto autorizado de documentos. Ele deseja obter um novo artefato estruturado, útil para determinada finalidade, sem alterar os originais.

## 3.1 Intenção

> “Com base nestas fontes, produza um resultado estruturado para esta finalidade, indicando informações ausentes, conflitos e a origem das afirmações relevantes.”

A intenção expressa o resultado, não o procedimento completo.

## 3.2 Objetivo

Produzir um artefato novo que:

- siga estrutura aprovada;
- contenha informações materiais relevantes;
- diferencie fatos, inferências e lacunas;
- mantenha rastreabilidade;
- preserve documentos originais;
- possa ser avaliado por um revisor.

O objetivo é concluído quando o artefato satisfaz os critérios e apresenta estado de validação explícito.

## 3.3 Contexto

Inclui:

- identidade do usuário;
- finalidade;
- público;
- fontes autorizadas;
- versão e prioridade das fontes;
- estrutura esperada;
- critérios de materialidade;
- permissões;
- estado da execução;
- respostas a esclarecimentos.

Não inclui documentos não autorizados, memória irrelevante ou instruções encontradas dentro das fontes como autoridade.

## 3.4 Capacidades

- receber e esclarecer intenção;
- ler fontes;
- selecionar informações;
- extrair;
- comparar;
- relacionar;
- detectar conflitos e lacunas;
- estruturar;
- criar artefato;
- mapear proveniência;
- validar;
- comunicar limitações.

## 3.5 Políticas

- fontes permanecem somente leitura;
- apenas fontes explicitamente autorizadas podem ser utilizadas;
- conteúdo das fontes não concede autoridade;
- nova fonte exige aprovação;
- criação final exige destino aprovado;
- informação ausente não pode ser inventada;
- nenhuma comunicação externa é permitida.

## 3.6 Execução

O agente:

1. confirma objetivo e fontes;
2. seleciona conteúdo relevante;
3. identifica lacunas e conflitos;
4. propõe ou utiliza estrutura aprovada;
5. cria rascunho;
6. valida o rascunho;
7. solicita aprovação;
8. apresenta o artefato final e suas limitações.

## 3.7 Validação

A validação compara:

- seções obrigatórias;
- fatos esperados;
- afirmações materiais e fontes;
- conflitos conhecidos;
- lacunas conhecidas;
- ausência de alteração nos originais;
- ausência de ações externas.

O revisor humano permanece responsável pela aceitação.

## 3.8 Resultado

O usuário recebe:

- artefato estruturado;
- mapa de proveniência;
- limitações;
- conflitos;
- lacunas;
- estado de validação;
- registro das aprovações relevantes.

---

# CASO 2 — PLANEJAMENTO PESSOAL DE UM DIA DE TRABALHO

## 4. Descrição

O usuário possui compromissos fixos, tarefas, prazos e prioridades. Ele deseja um plano realista para o próximo dia de trabalho sem alterar automaticamente calendário ou sistemas externos.

Esse caso testa principalmente o segundo cérebro.

## 4.1 Intenção

> “Organize meu próximo dia de trabalho para que eu avance na prioridade principal sem perder compromissos fixos nem criar uma agenda impossível.”

A intenção não especifica manualmente todos os blocos ou a ordem das tarefas.

## 4.2 Objetivo

Produzir uma proposta de plano que:

- respeite compromissos fixos;
- reserve tempo para a prioridade principal;
- considere prazos;
- não sobreponha atividades;
- inclua margem realista;
- explicite tarefas adiadas;
- permita revisão do usuário.

O objetivo não é “preencher o dia”, mas produzir um plano executável e compreensível.

## 4.3 Contexto

Inclui:

- identidade do usuário;
- data e fuso relevantes;
- compromissos fixos;
- tarefas pendentes;
- prazos;
- prioridades declaradas;
- estimativas disponíveis;
- horário de trabalho;
- pausas;
- preferências autorizadas;
- restrições pessoais;
- estado atual das tarefas.

Não inclui detalhes pessoais desnecessários, calendários não autorizados ou preferências antigas sem validade confirmada.

## 4.4 Capacidades

- compreender intenção;
- consultar compromissos autorizados;
- interpretar prioridades;
- comparar prazo e esforço;
- detectar conflito;
- estimar ou solicitar estimativa;
- ordenar;
- planejar;
- simular alternativas;
- comunicar compromissos e limitações;
- incorporar feedback.

Planejamento explícito é central neste caso, embora não seja obrigatório em todo caso do J.A.R.V.I.S.

## 4.5 Políticas

- o calendário é somente leitura neste teste;
- o plano não pode substituir compromissos fixos sem aprovação;
- preferência não equivale a autorização para cancelar ou mover eventos;
- informações pessoais permanecem no escopo da tarefa;
- estimativas incertas devem ser indicadas;
- o agente não deve apresentar sobrecarga como plano viável;
- nenhuma mensagem pode ser enviada em nome do usuário.

## 4.6 Execução

O agente:

1. confirma prioridade e restrições;
2. consulta informações autorizadas;
3. identifica conflitos e capacidade disponível;
4. solicita estimativas ausentes quando materiais;
5. propõe uma ou mais organizações possíveis;
6. apresenta consequências e tarefas não acomodadas;
7. recebe ajustes;
8. entrega plano revisado.

Não há alteração automática do calendário.

## 4.7 Validação

A validação verifica:

- ausência de sobreposição;
- respeito a compromissos fixos;
- presença da prioridade principal;
- compatibilidade com horário disponível;
- pausas e margens definidas;
- explicitação de tarefas não incluídas;
- aceitação do usuário;
- percepção posterior de realismo, caso o plano seja acompanhado.

Parte da validação é determinística. Parte depende de avaliação e experiência do usuário.

## 4.8 Resultado

O usuário recebe:

- plano proposto;
- restrições consideradas;
- conflitos detectados;
- tarefas adiadas;
- incertezas de estimativa;
- alternativas quando existirem;
- estado de aprovação.

O resultado é uma proposta controlada, não uma decisão irrevogável.

---

# CASO 3 — PREPARAÇÃO CONTROLADA DE UM AMBIENTE DE TRABALHO

## 5. Descrição

O usuário deseja preparar um ambiente físico autorizado para uma sessão temporária de concentração.

Exemplo conceitual:

> ajustar dispositivos previamente autorizados para um perfil de foco durante noventa minutos.

Esse caso testa principalmente o segundo par de mãos, políticas, efeito e validação.

Não constitui decisão de implementar automação residencial.

## 5.1 Intenção

> “Prepare meu ambiente de trabalho para uma sessão de foco de noventa minutos.”

A intenção expressa um estado desejado sem listar comandos de cada dispositivo.

## 5.2 Objetivo

Produzir, dentro de limites previamente configurados, um estado de ambiente que:

- utilize apenas dispositivos autorizados;
- respeite limites de segurança e conforto;
- permaneça ativo pelo período indicado;
- não altere recursos fora do ambiente;
- possa ser cancelado;
- tenha efeitos verificados.

O objetivo precisa ser convertido em estados observáveis, não apenas em comandos enviados.

## 5.3 Contexto

Inclui:

- identidade do usuário;
- ambiente selecionado;
- presença ou controle legítimo;
- dispositivos autorizados;
- estado atual dos dispositivos;
- perfil de foco aprovado;
- duração;
- limites de temperatura, iluminação e energia;
- outras pessoas potencialmente afetadas;
- permissões vigentes;
- capacidade de desfazer ou encerrar.

Não inclui dispositivos fora do ambiente, sensores não autorizados ou inferências invasivas sobre pessoas.

## 5.4 Capacidades

- compreender intenção;
- consultar estado;
- identificar dispositivos;
- comparar estado atual e desejado;
- propor transições;
- avaliar restrições;
- solicitar confirmação;
- executar comandos;
- verificar novo estado;
- monitorar apenas durante o mandato;
- encerrar ou compensar alterações permitidas;
- comunicar falhas.

## 5.5 Políticas

- somente dispositivos autorizados podem ser consultados ou alterados;
- o perfil não pode ampliar sua própria lista de dispositivos;
- limites físicos e de segurança não podem ser ultrapassados;
- presença de outras pessoas pode exigir confirmação adicional;
- dispositivos sensíveis permanecem bloqueados;
- duração é limitada;
- monitoramento termina com o mandato;
- falha de verificação impede alegação de conclusão;
- cancelamento deve interromper novas ações.

## 5.6 Execução

O agente:

1. confirma ambiente, duração e perfil;
2. consulta estado dos dispositivos autorizados;
3. identifica mudanças necessárias;
4. avalia políticas e pede aprovação quando aplicável;
5. envia comandos permitidos;
6. consulta novamente o estado;
7. registra sucessos e falhas;
8. informa estado final;
9. encerra ou reverte alterações permitidas ao término, conforme mandato.

Comando enviado não significa objetivo concluído.

## 5.7 Validação

A validação verifica:

- dispositivo correto;
- estado observado após o comando;
- conformidade com limites;
- ausência de alteração fora do escopo;
- duração respeitada;
- falhas parciais identificadas;
- cancelamento efetivo;
- avaliação do usuário sobre o ambiente.

Evidências incluem estados observados e confirmação humana quando sensores não forem suficientes.

## 5.8 Resultado

O usuário recebe:

- estado desejado solicitado;
- ações tentadas;
- dispositivos alterados;
- estados confirmados;
- falhas;
- limitações;
- duração do mandato;
- opções seguras de correção ou encerramento.

O resultado pode ser:

- concluído;
- concluído parcialmente;
- bloqueado por política;
- não verificável;
- cancelado;
- falhou com estado conhecido.

---

## 6. Comparação dos três casos

### 6.1 Matriz conceitual

```text
Conceito       Caso 1: documentos       Caso 2: planejamento      Caso 3: ambiente
-----------------------------------------------------------------------------------------
Intenção       Produzir artefato         Organizar o dia           Preparar ambiente
Objetivo       Resultado rastreável      Plano viável              Estado físico limitado
Contexto       Fontes e critérios        Agenda, tarefas, limites   Dispositivos, estado, tempo
Capacidades    Ler, extrair, estruturar  Priorizar, estimar, planejar Observar, comandar, verificar
Políticas      Fontes somente leitura    Agenda somente leitura     Dispositivos e limites
Permissão      Usar fontes e criar saída Consultar e propor plano   Consultar e alterar recursos
Execução       Criar artefato            Produzir proposta          Alterar estado físico
Validação      Comparar com fontes       Checar restrições/aceitação Observar estado resultante
Resultado      Artefato + evidências     Plano + compromissos       Estado + efeitos confirmados
Risco          Informacional             Cognitivo/organizacional   Operacional/físico
Tempo          Execução delimitada       Horizonte de um dia        Mandato de 90 minutos
Recuperação    Preservar originais       Revisar plano              Parar/compensar quando possível
```

---

## 7. O que permanece igual

## 7.1 Existe um ator

Nos três casos, alguém:

- expressa intenção;
- possui determinado contexto;
- concede autoridade;
- avalia o resultado.

Isso fortalece **ator ou identidade** como provável invariante.

## 7.2 A intenção precisa se tornar objetivo

As três intenções são incompletas:

- “produza um resultado” não define estrutura e critérios;
- “organize meu dia” não define prioridade e limites;
- “prepare o ambiente” não define estados e mandato.

O objetivo traduz intenção em uma condição avaliável.

## 7.3 Contexto é seleção

Cada caso possui muitas informações possíveis, mas somente algumas são relevantes e autorizadas.

Contexto continua significando seleção temporária, não armazenamento geral.

## 7.4 Capacidades possuem condições e efeitos

Nos três casos, o agente precisa saber:

- o que consegue fazer;
- quais entradas são necessárias;
- quais efeitos pode produzir;
- quais limites existem;
- como verificar o resultado.

Isso fortalece capacidade como conceito, não qualquer capacidade específica.

## 7.5 Capacidade permanece separada de autoridade

O agente pode tecnicamente:

- ler outro documento;
- mover um evento;
- alterar outro dispositivo.

Isso não significa que está autorizado.

Política, permissão e mandato permanecem necessários.

## 7.6 Execução produz efeito

O tipo de efeito muda:

- artefato informacional;
- proposta cognitiva;
- alteração física.

A relação permanece:

> aplicar capacidade → produzir tentativa ou efeito observável.

## 7.7 Validação é diferente de execução

- criar arquivo não prova correção;
- criar plano não prova viabilidade;
- enviar comando não prova mudança física.

Os três casos exigem evidência posterior.

## 7.8 Resultado comunica estado real

O resultado sempre precisa distinguir:

- o que foi pedido;
- o que foi feito;
- o que foi confirmado;
- o que falhou;
- o que permanece incerto;
- o que depende do usuário.

## 7.9 Estado, falha e recuperação permanecem relevantes

Todos os casos podem:

- aguardar esclarecimento;
- ser bloqueados por política;
- concluir parcialmente;
- ser cancelados;
- falhar;
- precisar de correção.

Isso fortalece esses conceitos como transversais.

---

## 8. O que muda

## 8.1 Natureza do contexto

- documentos usam fontes textuais;
- planejamento usa compromissos, prioridades e estimativas;
- ambiente usa estado físico, presença, dispositivos e tempo.

O conceito de contexto permanece. Seus conteúdos pertencem às capacidades e ao domínio.

## 8.2 Tipo de conhecimento

- no caso documental, conhecimento vem principalmente de fontes;
- no planejamento, inclui preferências, prazos e estimativas;
- no ambiente, inclui configuração, estado observado e limites.

“Documento” não generaliza. “Informação com proveniência, validade e escopo” generaliza melhor.

## 8.3 Capacidades específicas

- extração não é necessária no planejamento ou controle físico;
- priorização não é central ao caso documental;
- comando de dispositivo não existe nos outros casos.

Essas capacidades não pertencem ao núcleo.

## 8.4 Tipo de efeito

- criação de artefato;
- criação de proposta;
- mutação física.

O núcleo precisa compreender efeitos sem assumir que todo efeito é arquivo, texto ou comando.

## 8.5 Risco e autorização

O risco aumenta:

- informacional;
- organizacional;
- físico e operacional.

Políticas não podem ser baseadas apenas no nome da capacidade. Precisam considerar recurso, contexto, alcance, duração, consequência e reversibilidade.

## 8.6 Forma de validação

- evidência documental;
- consistência de restrições e aceitação;
- observação de estado.

Validação parece invariante. Validadores são específicos.

## 8.7 Temporalidade

- o caso documental pode terminar na entrega;
- o plano cobre um horizonte futuro;
- o controle físico possui mandato e encerramento.

Tempo e validade tornam-se mais fortes como candidatos a invariantes de suporte.

## 8.8 Recuperação

- preservar fonte e rascunho;
- revisar proposta;
- interromper ou compensar efeito.

O contrato de recuperação é transversal, mas a estratégia pertence à capacidade.

---

## 9. Abstrações que parecem legítimas

As abstrações abaixo são conceituais. Não representam decisão de criar componentes técnicos.

## 9.1 Ator

Representa quem solicita, autoriza, é afetado ou avalia.

Aparece nos três casos.

## 9.2 Intenção

Representa a necessidade expressa antes de existir um procedimento completo.

## 9.3 Objetivo

Representa:

- resultado desejado;
- restrições;
- condição de conclusão;
- limites.

## 9.4 Contexto

Representa informação selecionada para a decisão atual, com escopo e autorização.

Não deve ser especializado como “conjunto de documentos”.

## 9.5 Recurso

Representa aquilo que pode ser consultado ou afetado:

- fonte;
- agenda;
- tarefa;
- dispositivo.

Ainda precisa ser validado se “recurso” é suficientemente útil ou genérico demais.

## 9.6 Capacidade

Representa comportamento disponível, incluindo:

- condições;
- entradas;
- possíveis efeitos;
- limitações;
- riscos;
- autorização necessária;
- forma de validação.

## 9.7 Política

Representa regras para avaliar o que é permitido, proibido ou exige confirmação.

## 9.8 Permissão ou mandato

Representa autoridade concedida a determinado ator, recurso, ação, contexto e período.

“Mandato” torna-se especialmente relevante para ações temporais.

## 9.9 Execução ou tentativa

Representa a aplicação de uma capacidade.

Deve permitir distinguir tentativa de efeito confirmado.

## 9.10 Efeito

Representa a saída ou mudança observável produzida:

- artefato;
- proposta;
- estado físico.

O teste fortalece efeito como candidato a invariante.

## 9.11 Evidência

Representa informação utilizada para avaliar resultado:

- fonte;
- verificação de restrição;
- estado observado;
- confirmação humana.

## 9.12 Validação

Representa comparação entre objetivo, efeito e evidência.

O mecanismo de validação permanece específico.

## 9.13 Resultado

Representa a comunicação final ou parcial de:

- efeito;
- evidência;
- estado;
- falhas;
- limitações;
- próximos passos.

## 9.14 Estado

Representa a posição atual no ciclo, incluindo espera, bloqueio, conclusão parcial, cancelamento e falha.

## 9.15 Tempo e validade

Representam:

- atualidade do contexto;
- duração da permissão;
- horizonte do objetivo;
- validade da evidência;
- duração do efeito.

O contraste entre casos fortalece sua legitimidade.

## 9.16 Falha e recuperação

Falha representa desvio entre intenção, execução e resultado.

Recuperação representa encerramento, correção ou continuação segura.

---

## 10. Abstrações que seriam prematuras

## 10.1 Documento como entrada universal

Contexto pode vir de agenda, sensores, APIs, memória ou interação.

“Documento” deve permanecer no experimento.

## 10.2 Artefato como resultado universal

Um resultado pode ser plano, decisão, estado observado, mensagem ou efeito físico.

O núcleo precisa de resultado e efeito, não de arquivo como padrão.

## 10.3 Seções obrigatórias universais

Seções são uma regra do caso documental.

Outros casos possuem restrições e estados, não necessariamente seções.

## 10.4 Mapa documental de proveniência universal

Proveniência parece legítima. Página, trecho, campo e documento são detalhes de uma capacidade.

## 10.5 Planejador obrigatório

Planejamento é central ao Caso 2, proporcional no Caso 1 e simples no Caso 3.

Não deve ser obrigatório em toda execução.

## 10.6 Três níveis fixos de risco

Baixo, médio e alto podem ser úteis para comunicação, mas não representam toda a combinação de efeito, alcance, dados, duração e reversibilidade.

## 10.7 Fluxo linear único

Os casos exigem:

- esclarecimento;
- iteração;
- espera;
- validação;
- cancelamento;
- recuperação.

Uma sequência rígida seria insuficiente.

## 10.8 Um validador universal

As evidências diferem profundamente.

O conceito de validação generaliza. O procedimento não.

## 10.9 Memória persistente obrigatória

Os três casos podem utilizar contexto de execução sem exigir memória de longo prazo.

Persistência deve permanecer hipótese e capacidade controlada.

## 10.10 Orquestrador central como solução técnica

O ciclo mostra coordenação conceitual, mas não prova que um único componente técnico deve concentrar todas as responsabilidades.

## 10.11 Sistema universal de plugins

Os casos mostram capacidades diferentes, mas não demonstram a necessidade de plugins, MCP ou descoberta dinâmica.

## 10.12 Arquitetura orientada a eventos

O Caso 3 envolve tempo e estado, mas isso não justifica tornar todo o sistema orientado a eventos.

## 10.13 Agentes especializados

Nenhum dos três casos demonstra que documentos, planejamento ou dispositivos precisam ser agentes separados.

## 10.14 Uma taxonomia técnica definitiva

O vocabulário conceitual foi fortalecido, mas ainda não existe evidência para classes, interfaces, serviços ou bancos.

---

## 11. Responsabilidades que parecem pertencer ao núcleo

“Pertencer ao núcleo” significa responsabilidade conceitual transversal, não componente técnico confirmado.

## 11.1 Compreensão do trabalho

- receber intenção;
- explicitar objetivo;
- identificar incerteza;
- solicitar esclarecimento.

## 11.2 Seleção de contexto

- identificar informação relevante;
- aplicar escopo;
- preservar proveniência;
- considerar tempo e validade.

## 11.3 Descoberta de possibilidades

- identificar capacidades disponíveis;
- conhecer limitações;
- conhecer efeitos e requisitos.

## 11.4 Controle de autoridade

- avaliar políticas;
- verificar permissões;
- solicitar aprovação;
- aplicar duração e escopo;
- bloquear ação.

## 11.5 Coordenação da execução

- iniciar tentativa;
- acompanhar estado;
- distinguir ação de efeito;
- interromper;
- registrar falha;
- permitir recuperação segura.

## 11.6 Validação

- relacionar objetivo, efeito e evidência;
- declarar nível de verificação;
- impedir falsa conclusão.

## 11.7 Comunicação do resultado

- apresentar estado;
- mostrar efeitos;
- mostrar evidências;
- mostrar limitações;
- obter feedback.

## 11.8 Governança transversal

- identidade;
- escopo;
- tempo;
- risco;
- proveniência;
- observabilidade;
- controle do usuário.

Ainda é necessário descobrir se risco deve ser conceito próprio ou derivado dos demais.

---

## 12. Responsabilidades que pertencem às capacidades

## 12.1 Caso documental

- leitura de formatos;
- extração;
- segmentação;
- comparação textual;
- geração de estrutura;
- localização de evidência em fonte;
- criação de artefato.

## 12.2 Planejamento pessoal

- consulta de compromissos;
- priorização;
- estimativa;
- organização temporal;
- detecção de sobreposição;
- geração de alternativas.

## 12.3 Ambiente físico

- descoberta de dispositivos;
- leitura de estado;
- envio de comando;
- consulta de sensores;
- controle temporário;
- compensação ou encerramento.

## 12.4 Validadores específicos

- completude de artefato;
- viabilidade de agenda;
- confirmação de estado físico.

O núcleo coordena a necessidade de validação. Cada capacidade fornece evidências e critérios compatíveis com seu efeito.

## 12.5 Políticas específicas

- fonte somente leitura;
- calendário somente leitura;
- limite de temperatura;
- dispositivo bloqueado;
- duração máxima.

O mecanismo conceitual de política parece transversal. As regras pertencem ao contexto e à capacidade.

---

## 13. Sinais de influência indevida do experimento inicial

Não existe arquitetura técnica definida, portanto ainda não é possível afirmar que ela já foi puxada para o domínio documental.

Entretanto, existe risco explícito.

`EXPERIMENT_02_SPEC.md` utiliza intensamente:

- documento;
- fonte;
- seção;
- afirmação factual;
- artefato;
- mapa de proveniência;
- leitura;
- extração.

Esses termos são corretos dentro do experimento, mas não devem ser elevados ao núcleo.

### Sinais que exigem interrupção

Interromper e revisar se futuras decisões:

- tratarem todo contexto como documento;
- tratarem todo resultado como arquivo;
- exigirem seções em todo objetivo;
- modelarem toda evidência como trecho textual;
- assumirem que toda capacidade é leitura e escrita;
- definirem permissões apenas como acesso a arquivos;
- transformarem validação em comparação textual universal;
- escolherem tecnologias documentais antes de testar outras fontes;
- nomearem componentes centrais segundo entidades documentais.

### Correção conceitual recomendada

No núcleo, preferir:

- **informação ou recurso**, não documento;
- **efeito ou saída**, não arquivo;
- **evidência**, não citação textual;
- **critério de conclusão**, não seção obrigatória;
- **capacidade**, não processador documental;
- **política sobre recurso e efeito**, não permissão de arquivo;
- **validação**, não conferência documental.

Isso não significa criar essas abstrações tecnicamente agora. Significa preservar vocabulário conceitual independente.

---

## 14. Resultado do teste

### 14.1 O ciclo conceitual generalizou

Os três casos puderam ser descritos usando:

- intenção;
- objetivo;
- contexto;
- capacidade;
- política;
- permissão;
- execução;
- validação;
- resultado.

O significado central desses conceitos permaneceu estável.

### 14.2 Conceitos de suporte foram fortalecidos

O contraste fortaleceu:

- ator;
- mandato;
- recurso;
- efeito;
- evidência;
- proveniência;
- estado;
- tempo e validade;
- falha;
- recuperação.

“Recurso” e “risco” ainda precisam de análise adicional para evitar generalidade vazia.

### 14.3 Planejamento permaneceu capacidade

Planejamento foi:

- opcional no caso documental;
- central no planejamento pessoal;
- simples e operacional no ambiente físico.

Isso sustenta a decisão de não tratá-lo como etapa obrigatória em todo ciclo.

### 14.4 Memória não foi necessária como requisito universal da execução

Os casos podem operar com contexto e estado de curto prazo.

Isso não invalida memória como parte da visão. Apenas mantém memória de longo prazo fora do núcleo mínimo comprovado.

### 14.5 Validação generalizou; validadores não

A necessidade de verificar efeito permaneceu.

As evidências e os métodos mudaram completamente.

### 14.6 O segundo cérebro e o segundo par de mãos variam em intensidade

- Caso 1 equilibra cognição e criação controlada;
- Caso 2 enfatiza cognição;
- Caso 3 enfatiza ação.

O núcleo precisa acomodar essa variação sem exigir que toda tarefa utilize ambos na mesma intensidade.

---

## 15. Conclusão

O teste fornece evidência conceitual inicial de que o ciclo:

```text
INTENÇÃO
→ OBJETIVO
→ CONTEXTO
→ CAPACIDADES
→ POLÍTICAS/PERMISSÕES
→ EXECUÇÃO
→ VALIDAÇÃO
→ RESULTADO
```

pode atravessar domínios diferentes sem perder seu significado principal.

Isso sustenta, mas não comprova, a hipótese de um núcleo universal.

As abstrações mais legítimas são relações entre:

- ator;
- intenção;
- objetivo;
- contexto;
- capacidade;
- autoridade;
- execução;
- efeito;
- evidência;
- validação;
- resultado;
- estado e recuperação.

As entidades, ferramentas, regras e validadores de cada domínio devem permanecer nas capacidades.

O experimento inicial ainda não determinou uma arquitetura documental, mas contém vocabulário capaz de produzir esse desvio se for generalizado. Esse risco deve permanecer explicitamente monitorado.

Nenhuma arquitetura técnica ou implementação é autorizada por esta análise.
