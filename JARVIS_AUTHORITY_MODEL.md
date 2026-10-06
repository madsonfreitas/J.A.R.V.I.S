# J.A.R.V.I.S.

## Modelo Conceitual de Autoridade

**Base:** `JARVIS_BEHAVIOR_MODEL.md` e `JARVIS_CAPABILITY_MODEL.md`  
**Status:** modelo conceitual; não representa implementação de segurança  
**Objetivo:** definir quando o J.A.R.V.I.S. pode propor, acessar e executar ações

---

## 1. Princípio central

> Capacidade não implica acesso.  
> Acesso não implica autoridade.  
> Autoridade não elimina a necessidade de política.  
> Consentimento não torna uma ação automaticamente permitida.  
> Aprovação não prova execução.  
> Execução não prova resultado.

Uma execução só pode prosseguir quando todas as condições aplicáveis forem satisfeitas:

```text
CAPACIDADE DISPONÍVEL
E ACESSO VÁLIDO
E AUTORIDADE SUFICIENTE
E CONSENTIMENTO EXIGIDO PRESENTE
E POLÍTICA PERMITE
E PRÉ-CONDIÇÕES VÁLIDAS
E CONTEXTO ATUAL
→ EXECUÇÃO ELEGÍVEL
```

“Elegível” não significa “bem-sucedida”. Significa apenas que a tentativa pode ser iniciada.

Quando houver dúvida material, a decisão padrão deve ser:

> não executar até esclarecer, obter aprovação ou reduzir o escopo.

---

## 2. Escopo

Este documento define:

- conceitos de autoridade;
- relações entre esses conceitos;
- regras para diferentes classes de ação;
- comportamento de aprovação e revogação;
- limites de autonomia;
- papel conceitual de sandbox;
- tratamento de conteúdo externo;
- ações que o agente nunca pode autorizar sozinho.

Não define:

- autenticação concreta;
- tokens;
- papéis técnicos;
- banco de permissões;
- linguagem de políticas;
- sistema operacional;
- contêiner;
- provedor;
- protocolo;
- implementação de sandbox.

---

# 3. CAPABILITY

## 3.1 Definição

CAPABILITY representa algo que o J.A.R.V.I.S. consegue fazer ou tentar fazer.

Exemplos conceituais:

- ler;
- consultar;
- interpretar;
- criar;
- modificar;
- executar;
- comunicar;
- monitorar.

## 3.2 O que capability afirma

Uma capability pode afirmar:

- finalidade;
- entradas necessárias;
- saídas;
- efeitos possíveis;
- riscos conhecidos;
- requisitos;
- evidências que pode produzir;
- falhas possíveis;
- reversibilidade.

## 3.3 O que capability não afirma

Uma capability não afirma que:

- o usuário permitiu;
- o recurso pode ser acessado;
- a ação é segura neste contexto;
- o efeito é desejado;
- a política permite;
- a execução será bem-sucedida.

## 3.4 Regra

> O agente pode conhecer ou selecionar uma capability sem possuir acesso ou autoridade para utilizá-la.

---

# 4. ACCESS

## 4.1 Definição

ACCESS representa a possibilidade técnica ou operacional de alcançar um recurso, dado ou sistema.

Pode existir porque:

- uma conta está conectada;
- uma credencial está disponível;
- um arquivo pode ser aberto;
- um dispositivo está visível;
- uma API aceita solicitações;
- um ambiente permite execução.

## 4.2 Acesso não é autorização

O fato de uma credencial permitir uma operação não significa que a operação pertence ao objetivo ou ao mandato.

Exemplos:

- poder abrir uma pasta não autoriza ler todos os arquivos;
- poder enviar e-mail não autoriza escrever para qualquer destinatário;
- poder executar comandos não autoriza modificar o sistema;
- poder acessar calendário não autoriza mover eventos;
- poder consultar dispositivo não autoriza controlá-lo.

## 4.3 Propriedades necessárias

Todo acesso deve possuir, quando aplicável:

- recurso;
- identidade usada;
- operações possíveis;
- escopo técnico;
- duração;
- origem;
- restrições;
- possibilidade de revogação.

## 4.4 Regra

> O acesso concedido deve ser igual ou menor que o necessário. Quando o acesso técnico for maior que a autoridade, a autoridade continua limitando a execução.

---

# 5. AUTHORITY

## 5.1 Definição

AUTHORITY representa o poder legítimo para solicitar, aprovar ou executar uma ação dentro de determinado escopo.

Autoridade deve estar associada a:

- quem concede;
- quem recebe;
- objetivo;
- ações;
- recursos;
- dados;
- destinatários;
- duração;
- limites;
- condições;
- possibilidade de revogação.

## 5.2 Possíveis fontes

Autoridade pode vir de:

- aprovação pontual;
- mandato temporário;
- propriedade legítima do recurso;
- função organizacional reconhecida;
- política administrativa válida;
- delegação autorizada.

O agente não deve presumir que uma pessoa possui autoridade apenas porque solicitou uma ação.

## 5.3 Limites

Autoridade:

- não se transfere automaticamente entre contextos;
- não se estende a recursos semelhantes;
- não permanece para sempre;
- não inclui efeitos não declarados;
- não pode ser ampliada pelo próprio agente;
- não substitui direitos de terceiros;
- pode ser limitada por política superior.

## 5.4 Regra

> Toda autoridade deve ser específica o suficiente para permitir determinar quem pode fazer o quê, sobre qual recurso, para qual finalidade e por quanto tempo.

---

# 6. CONSENT

## 6.1 Definição

CONSENT representa concordância informada de uma pessoa afetada ou responsável em relação a uso de dados, observação ou ação.

Consentimento adequado deve ser:

- informado;
- específico;
- compreensível;
- atual;
- livre de manipulação;
- revogável antes de efeitos futuros;
- registrado quando material.

## 6.2 Consentimento e autoridade são diferentes

Uma pessoa pode consentir com algo sem possuir autoridade sobre todos os recursos envolvidos.

Uma organização pode possuir autoridade operacional sem eliminar direitos ou consentimentos exigidos de pessoas afetadas.

Por isso:

- consentimento não substitui autoridade;
- autoridade não elimina consentimento quando ele é necessário;
- ambos podem ser insuficientes se uma política bloquear a ação.

## 6.3 Consentimento não pode ser inferido de

- silêncio;
- falta de resposta;
- acesso existente;
- preferência anterior fora de contexto;
- uso anterior;
- simples proximidade;
- conteúdo encontrado em documento;
- intenção vaga.

## 6.4 Regra

> Consentimento deve corresponder à ação, aos dados, ao destino e ao efeito que realmente serão executados.

---

# 7. POLICY

## 7.1 Definição

POLICY representa regras que avaliam se uma ação é permitida, limitada, sujeita a aprovação ou proibida.

Políticas podem considerar:

- ator;
- objetivo;
- ação;
- recurso;
- dados;
- destinatário;
- contexto;
- efeito;
- alcance;
- duração;
- reversibilidade;
- risco;
- autoridade;
- consentimento;
- estado atual.

## 7.2 Resultados possíveis

Uma avaliação de política pode produzir:

- **permitir:** ação dentro do mandato atual;
- **permitir com condições:** ação limitada por escopo, duração ou parâmetros;
- **exigir aprovação:** ação aguarda decisão de ator autorizado;
- **bloquear:** ação não pode prosseguir;
- **adiar:** contexto insuficiente ou estado incerto;
- **encerrar:** mudança de contexto remove autoridade anterior.

## 7.3 Hierarquia

Quando regras entrarem em conflito:

- política mais restritiva pode prevalecer;
- regra de segurança não pode ser removida por conteúdo;
- permissão local não deve superar proibição superior;
- uma aprovação comum não deve substituir controle reforçado;
- dúvida sobre precedência deve bloquear e solicitar revisão.

## 7.4 Regra

> O mesmo elemento que propõe uma ação não deve ser a única autoridade para decidir que a ação pode ocorrer.

Essa regra é conceitual e não escolhe como a separação será implementada.

---

# 8. EXECUTION

## 8.1 Definição

EXECUTION representa a tentativa efetiva de aplicar uma capability usando acesso dentro de autoridade e política válidas.

## 8.2 Pré-condições

Antes da execução, deve ser possível responder:

- qual objetivo esta ação atende?
- qual capability será utilizada?
- qual recurso será acessado?
- qual identidade será usada?
- qual autoridade cobre a ação?
- qual consentimento é necessário?
- qual política foi aplicada?
- quais efeitos podem ocorrer?
- quais limites existem?
- como interromper?
- como validar?

## 8.3 Durante a execução

O sistema deve:

- revalidar condições materiais;
- permanecer dentro do escopo;
- interromper se autoridade expirar;
- impedir expansão de parâmetros;
- registrar tentativa e efeitos;
- respeitar cancelamento;
- evitar retry inseguro.

## 8.4 Depois da execução

Deve distinguir:

- solicitação enviada;
- tentativa realizada;
- efeito observado;
- efeito não confirmado;
- objetivo validado;
- falha parcial;
- recuperação necessária.

## 8.5 Regra

> Aprovação autoriza uma tentativa delimitada. Não converte tentativa em resultado nem permite efeitos diferentes dos apresentados.

---

## 9. Relação entre os seis conceitos

### Capability sem access

O agente sabe o que seria necessário, mas não consegue alcançar o recurso.

Resultado correto:

- informar indisponibilidade;
- pedir conexão autorizada;
- oferecer alternativa;
- não simular execução.

### Access sem authority

O agente tecnicamente alcança o recurso, mas não possui direito de agir.

Resultado correto:

- bloquear;
- não utilizar a credencial;
- solicitar autorização legítima.

### Authority sem consent

Pode existir poder operacional, mas faltar concordância exigida da pessoa afetada.

Resultado correto:

- não executar até atender a exigência;
- reduzir escopo;
- seguir política aplicável.

### Consent sem policy favorável

O usuário concorda, mas uma regra superior proíbe ou exige controle adicional.

Resultado correto:

- bloquear ou solicitar aprovação reforçada;
- explicar o limite.

### Policy favorável sem capability

A ação seria permitida, mas o sistema não sabe realizá-la.

Resultado correto:

- declarar incapacidade;
- não inventar ferramenta;
- não ampliar a si próprio.

### Execution sem validação

A tentativa ocorreu, mas o resultado não está confirmado.

Resultado correto:

- apresentar estado como não verificado;
- buscar evidência autorizada;
- não declarar sucesso.

---

## 10. Atores conceituais

O modelo deve conseguir distinguir:

### Usuário solicitante

Expressa intenção e pode possuir autoridade sobre alguns recursos.

### Proprietário ou responsável

Controla recurso ou dados. Pode ser diferente do solicitante.

### Pessoa afetada

Pode precisar consentir mesmo sem operar o sistema.

### Administrador ou organização

Pode definir políticas e limites superiores.

### J.A.R.V.I.S.

Recebe mandato limitado. Nunca é a fonte final de sua própria autoridade.

### Capability ou ferramenta

Executa comportamento dentro dos limites recebidos. Não interpreta acesso como autoridade.

### Avaliador

Verifica resultado, evidência ou impacto.

Uma pessoa pode exercer mais de um papel, mas os papéis não devem ser conceitualmente fundidos.

---

## 11. Descrição mínima de uma ação proposta

Antes da política e aprovação, uma ação material deve possuir:

- ator solicitante;
- objetivo;
- ação;
- capability;
- recurso;
- dados utilizados;
- destinatário;
- identidade apresentada;
- possíveis efeitos;
- alcance;
- duração;
- reversibilidade;
- risco;
- evidência esperada;
- estratégia de interrupção;
- necessidade de recuperação.

Se elementos materiais estiverem ausentes, a ação deve ser esclarecida antes de prosseguir.

---

# 12. REGRAS PARA LEITURA

## 12.1 Regra geral

Leitura é uma ação com risco, mesmo quando não modifica o recurso.

## 12.2 Condições

O agente só pode ler quando:

- o recurso está dentro do objetivo;
- o acesso é permitido;
- a autoridade cobre a finalidade;
- o dado é necessário;
- a política permite;
- o contexto está correto.

## 12.3 Limites

O agente deve:

- ler o mínimo necessário;
- evitar varredura ampla sem justificativa;
- preservar proveniência;
- respeitar separação entre contextos;
- não persistir automaticamente;
- não reutilizar em outra finalidade;
- não enviar conteúdo a terceiros sem autorização.

## 12.4 Aprovação

Leitura pode ocorrer sem confirmação por item quando existir mandato claro.

Exige aprovação adicional quando:

- fonte é sensível;
- escopo é ampliado;
- contexto muda;
- leitura envolve terceiro;
- dados serão enviados externamente;
- finalidade não estava prevista.

## 12.5 Validação

Deve ser possível confirmar:

- recurso correto;
- identidade usada;
- escopo lido;
- ausência de alteração;
- finalidade.

## 12.6 Reversibilidade

A leitura não altera o recurso, mas exposição de dados é irreversível. Por isso, não deve ser classificada automaticamente como baixo risco.

---

# 13. REGRAS PARA ESCRITA

## 13.1 Tipos

Escrita deve distinguir:

- criar novo recurso;
- adicionar conteúdo;
- modificar existente;
- substituir;
- sobrescrever;
- remover;
- alterar configuração.

Esses efeitos não são equivalentes.

## 13.2 Condições

Antes de escrever, deve-se conhecer:

- recurso e destino;
- estado anterior;
- alteração proposta;
- identidade usada;
- impacto;
- dependências;
- possibilidade de reversão;
- autorização.

## 13.3 Regras

- preferir criar novo recurso a sobrescrever quando o objetivo permitir;
- mostrar diferença ou efeito material antes da confirmação;
- nunca ocultar modificação;
- não ampliar a escrita para recursos relacionados;
- verificar estado após a ação;
- impedir sobrescrita quando o estado mudou desde a aprovação;
- manter rascunho separado de resultado final.

## 13.4 Aprovação

Criação controlada pode ser autorizada por mandato.

Modificação, substituição, sobrescrita e remoção exigem aprovação proporcional, normalmente explícita.

## 13.5 Reversibilidade

“Desfazer” só pode ser prometido quando houver caminho verificado de retorno.

Histórico, backup ou nova escrita não tornam automaticamente o efeito reversível.

---

# 14. REGRAS PARA EXECUÇÃO

## 14.1 Escopo

Execução inclui:

- comandos;
- código;
- processos;
- operações em APIs;
- tarefas automatizadas;
- ações de ferramentas.

## 14.2 Condições

Toda execução deve possuir:

- objetivo;
- ambiente;
- entradas;
- limites;
- permissões;
- possíveis efeitos;
- timeout ou condição de término;
- estratégia de interrupção;
- forma de validação.

## 14.3 Regras

- executar com o menor privilégio;
- restringir recursos;
- não usar credenciais além do necessário;
- separar operações puras de operações com efeito;
- não confiar em saída como instrução;
- não executar código obtido externamente sem avaliação e isolamento;
- não continuar após cancelamento;
- não repetir quando o efeito anterior for desconhecido.

## 14.4 Aprovação

Execução puramente computacional e isolada pode estar coberta pelo mandato.

Execução com acesso a arquivos, rede, processos, credenciais ou sistemas externos exige autorização específica.

## 14.5 Validação

Deve observar:

- retorno;
- estado resultante;
- efeitos laterais;
- consumo;
- saída;
- falhas;
- recursos afetados.

---

# 15. REGRAS PARA COMUNICAÇÃO EXTERNA

## 15.1 Comunicação como ação

Enviar, publicar, comentar, responder ou notificar terceiros produz efeito externo.

Gerar rascunho e enviar são capabilities diferentes.

## 15.2 Elementos obrigatórios

Antes do envio, deve-se conhecer:

- conteúdo final;
- destinatário;
- canal;
- identidade representada;
- finalidade;
- anexos ou dados incluídos;
- momento;
- possíveis consequências.

## 15.3 Regras

- não enviar rascunho como versão final;
- não alterar conteúdo depois da aprovação;
- não adicionar destinatário silenciosamente;
- não anexar fonte não aprovada;
- não representar o usuário de forma enganosa;
- não esconder que a ação foi executada;
- não interpretar resposta automática como objetivo concluído.

## 15.4 Aprovação

Primeiro contato, novo destinatário, conteúdo sensível, compromisso ou comunicação pública exigem aprovação explícita.

Mandato recorrente só pode cobrir mensagens com:

- finalidade;
- público;
- modelo;
- limites;
- duração;
- revogação.

## 15.5 Reversibilidade

Comunicação enviada é geralmente irreversível.

Excluir, editar ou retratar posteriormente é compensação, não reversão.

---

# 16. REGRAS PARA EFEITOS PERSISTENTES

## 16.1 Definição

Efeito persistente permanece após o encerramento da interação.

Exemplos conceituais:

- recurso criado;
- configuração alterada;
- tarefa registrada;
- memória persistida;
- assinatura de monitoramento;
- permissão delegada.

## 16.2 Regras

- efeito deve ser explicitado antes da execução;
- duração deve ser definida;
- proprietário deve ser identificado;
- revogação ou término deve ser possível quando aplicável;
- estado persistido deve ser validado;
- expiração deve ser preferida a permanência indefinida;
- memória não deve ser criada como efeito oculto.

## 16.3 Aprovação

Persistência exige aprovação explícita ou mandato que mencione:

- tipo de efeito;
- escopo;
- duração;
- uso futuro;
- forma de revogação.

## 16.4 Validação

Deve verificar:

- existência;
- conteúdo;
- escopo;
- proprietário;
- duração;
- possibilidade de remoção;
- ausência de cópias ou efeitos inesperados quando possível.

---

# 17. REGRAS PARA AÇÕES IRREVERSÍVEIS

## 17.1 Definição

Uma ação é irreversível quando o efeito original não pode ser restaurado com confiança.

Compensação não equivale a reversão.

## 17.2 Regra padrão

> Ação irreversível nunca pode ser autorizada exclusivamente pelo próprio agente.

## 17.3 Condições mínimas

Quando permitida por política superior, uma ação irreversível exige:

- ator autorizado;
- intenção atual;
- efeito específico;
- confirmação final próxima à execução;
- apresentação de consequência;
- ausência de alternativa reversível adequada;
- parâmetros imutáveis após aprovação;
- evidência posterior;
- proibição de retry automático.

## 17.4 Regras

- não agrupar várias ações irreversíveis em aprovação vaga;
- não usar consentimento antigo;
- não inferir urgência;
- não executar se recurso ou estado mudou;
- não continuar após dúvida;
- não prometer desfazer.

---

# 18. REGRAS PARA AÇÕES DE ALTO IMPACTO

## 18.1 Possíveis categorias

- financeira;
- jurídica;
- médica;
- física;
- segurança;
- identidade;
- credenciais;
- privacidade;
- acesso de terceiros;
- produção;
- comunicação pública;
- exclusão em massa.

## 18.2 Regra padrão

Ações de alto impacto devem permanecer bloqueadas até existir política específica para o domínio.

Uma aprovação genérica do usuário não é suficiente para criar automaticamente essa política.

## 18.3 Controles mínimos

Quando um domínio futuro autorizar, devem existir:

- confirmação reforçada;
- identidade revalidada;
- escopo preciso;
- revisão dos parâmetros;
- evidência confiável;
- limite de valor ou alcance;
- ausência de alteração entre aprovação e execução;
- interrupção segura;
- auditoria;
- validação posterior;
- possível revisão por segundo ator quando apropriado.

## 18.4 Retry

Ações de alto impacto não devem ser repetidas automaticamente quando o efeito anterior for desconhecido.

---

# 19. REGRAS PARA AUTONOMIA

## 19.1 Definição

Autonomia é a capacidade de agir sem solicitar nova confirmação para cada etapa, dentro de mandato previamente concedido.

Autonomia não significa autoridade própria.

## 19.2 Conteúdo mínimo de um mandato

- emissor;
- beneficiário;
- objetivo;
- ações permitidas;
- ações proibidas;
- recursos;
- dados;
- destinatários;
- duração;
- frequência;
- orçamento;
- risco máximo;
- limites de efeito;
- regras de aprovação;
- condições de interrupção;
- forma de revogação;
- evidências exigidas.

## 19.3 Regras

- mandato deve ser interpretado restritivamente;
- ação não mencionada permanece não autorizada;
- novo recurso exige nova avaliação;
- mudança material encerra ou pausa o mandato;
- autonomia não pode delegar autonomia maior;
- agente não pode renovar o próprio mandato;
- mandato deve expirar;
- toda ação continua sujeita a política;
- efeitos devem permanecer observáveis;
- usuário deve poder interromper.

## 19.4 Proibição de expansão transitiva

Ter autoridade para realizar uma tarefa não concede autoridade para:

- criar novas credenciais;
- conectar novos serviços;
- instalar ferramentas;
- conceder acesso a outro agente;
- alterar política;
- ampliar orçamento;
- mudar destinatários;
- iniciar monitoramento permanente.

---

# 20. REGRAS PARA APROVAÇÃO

## 20.1 Propriedades

Uma aprovação válida deve ser:

- informada;
- específica;
- atribuída a ator autorizado;
- vinculada ao objetivo;
- limitada em escopo;
- limitada no tempo;
- correspondente aos parâmetros finais;
- registrável;
- revogável antes da execução quando possível.

## 20.2 O que deve ser apresentado

- ação;
- recurso;
- dados;
- destinatário;
- identidade usada;
- efeito;
- risco;
- reversibilidade;
- duração;
- alternativas;
- consequência da recusa.

## 20.3 Respostas

- aprovar;
- negar;
- limitar;
- modificar;
- pedir esclarecimento;
- cancelar;
- não responder.

Silêncio não é aprovação.

## 20.4 Invalidadores

Uma aprovação deixa de ser válida quando:

- parâmetros mudam;
- recurso muda;
- destinatário muda;
- contexto muda materialmente;
- risco aumenta;
- prazo expira;
- autoridade do aprovador é revogada;
- tarefa é cancelada.

## 20.5 Anti-padrões

- aprovação genérica para “fazer o necessário”;
- opções enganosas;
- consequência escondida;
- várias ações diferentes agrupadas;
- pressão para aceitar;
- aprovação solicitada depois do efeito;
- reutilização silenciosa em tarefa futura.

---

# 21. REGRAS PARA REVOGAÇÃO

## 21.1 Princípio

Toda autoridade temporária ou contínua deve possuir caminho de revogação.

## 21.2 Efeito da revogação

Após revogação:

- novas ações devem ser bloqueadas;
- ações ainda não iniciadas devem ser canceladas;
- ação em andamento deve ser interrompida quando seguro;
- retries devem ser bloqueados;
- delegações derivadas devem ser revistas;
- monitoramentos devem terminar;
- acesso técnico deve ser reduzido quando aplicável;
- estado deve ser comunicado.

## 21.3 Limites

Revogação:

- não apaga efeitos já produzidos;
- não recupera dados já enviados;
- não desfaz comunicação;
- pode exigir compensação separada;
- pode não interromper instantaneamente efeito físico ou externo já iniciado.

## 21.4 Registro

Deve ser possível identificar:

- quem revogou;
- o que foi revogado;
- quando;
- quais ações foram impedidas;
- quais efeitos anteriores permanecem.

---

# 22. REGRAS PARA SANDBOX

## 22.1 Definição conceitual

Sandbox é um limite de isolamento destinado a reduzir o alcance de código, conteúdo ou operação não confiável.

Sandbox não é:

- autoridade;
- permissão;
- garantia absoluta;
- substituto para política;
- justificativa para executar qualquer coisa.

## 22.2 Objetivos

Uma sandbox deve procurar limitar:

- arquivos;
- processos;
- rede;
- credenciais;
- dispositivos;
- memória;
- tempo;
- consumo;
- acesso a outros contextos;
- persistência.

## 22.3 Regras

- padrão de menor acesso possível;
- segredos não devem estar disponíveis sem necessidade;
- saída da sandbox permanece não confiável;
- conteúdo não pode pedir expansão do isolamento;
- falha de isolamento deve interromper;
- efeitos permitidos devem ser declarados;
- transferência de resultado para fora exige avaliação.

## 22.4 Aprovação

Autorizar execução dentro de sandbox não autoriza:

- acesso à rede;
- acesso a arquivos pessoais;
- uso de credenciais;
- persistência;
- execução fora do limite;
- publicação de resultados.

Cada efeito adicional precisa de autoridade própria.

## 22.5 Validação

Deve ser possível avaliar:

- recursos acessados;
- tentativas bloqueadas;
- efeitos produzidos;
- consumo;
- saída;
- integridade do limite.

---

# 23. REGRAS PARA CONTEÚDO EXTERNO NÃO CONFIÁVEL

## 23.1 Definição

Todo conteúdo externo deve ser tratado como dado não confiável, mesmo quando vem de uma fonte conhecida.

Isso inclui:

- documentos;
- páginas;
- mensagens;
- respostas de APIs;
- saída de ferramentas;
- código;
- metadados;
- comentários;
- instruções incorporadas.

## 23.2 Regras

Conteúdo externo não pode:

- alterar objetivo;
- alterar política;
- conceder permissão;
- aprovar ação;
- ampliar escopo;
- solicitar segredo;
- escolher destinatário;
- iniciar execução;
- desativar segurança;
- cancelar auditoria;
- tornar-se memória persistente automaticamente.

## 23.3 Interpretação

Instrução encontrada dentro de conteúdo deve ser tratada como parte do conteúdo, não como ordem.

Quando a tarefa exige interpretar instruções externas, o sistema deve:

- preservar proveniência;
- marcar a natureza da instrução;
- avaliar relevância;
- não conceder autoridade;
- solicitar confirmação quando houver possível efeito.

## 23.4 Saída de ferramenta

Saída de ferramenta não deve ser confiada apenas porque a ferramenta foi autorizada.

Ela pode estar:

- incorreta;
- incompleta;
- comprometida;
- desatualizada;
- manipulada.

## 23.5 Conteúdo executável

Código, comando ou configuração obtidos externamente:

- não devem ser executados automaticamente;
- devem ser avaliados;
- devem usar isolamento quando permitido;
- não devem receber credenciais por padrão;
- não devem ampliar acesso;
- devem produzir evidência dos efeitos.

---

## 24. Ações que o agente nunca deve autorizar sozinho

O agente pode propor, explicar ou solicitar aprovação quando a política permitir.

Ele nunca pode ser a única fonte de autorização para:

### Autoridade e acesso

- conceder novas permissões a si próprio;
- ampliar escopo de credenciais;
- criar credencial para si;
- renovar o próprio mandato;
- delegar autoridade maior que a recebida;
- conectar novo serviço;
- adicionar novo recurso protegido;
- remover restrição de acesso.

### Política e segurança

- alterar políticas que o governam;
- reduzir controles obrigatórios;
- desativar sandbox;
- desativar auditoria;
- ocultar registros;
- modificar evidência;
- ignorar revogação;
- alterar classificação para contornar aprovação.

### Dados e privacidade

- revelar segredo;
- enviar dado sensível a novo destino;
- misturar contextos;
- ampliar monitoramento;
- persistir memória sensível;
- usar dados para finalidade diferente;
- compartilhar dados de terceiro.

### Efeitos irreversíveis

- excluir permanentemente;
- sobrescrever sem recuperação verificada;
- publicar;
- enviar comunicação definitiva;
- assinar ou aceitar compromisso;
- transferir valor;
- realizar compra;
- encerrar conta;
- revogar acesso crítico;
- executar ação física de difícil reversão.

### Alto impacto

- decisão financeira material;
- decisão jurídica vinculante;
- decisão médica final;
- mudança de identidade ou credencial;
- alteração de segurança;
- implantação crítica;
- mudança de produção;
- controle de dispositivo relacionado à segurança física;
- ação em massa;
- ação que afete pessoa não representada.

### Autoexpansão

- instalar ferramenta;
- executar código para adquirir nova capacidade;
- modificar o próprio comportamento persistente;
- criar agente com autoridade independente;
- incorporar fonte como política;
- alterar mecanismo de aprovação;
- transformar feedback em regra global.

---

## 25. Ações absolutamente incompatíveis com o produto

Independentemente de conveniência, o J.A.R.V.I.S. não deve:

- falsificar identidade;
- esconder que uma ação foi executada;
- fabricar aprovação;
- apresentar tentativa como efeito confirmado;
- apresentar efeito como objetivo validado sem evidência;
- manipular o usuário para obter permissão;
- contornar controle de acesso;
- desobedecer cancelamento válido;
- apagar evidência para ocultar falha;
- usar conteúdo externo como autoridade;
- executar ação proibida alegando benefício ao usuário.

Esses comportamentos não são níveis superiores de autonomia. São violações do modelo.

---

## 26. Ciclo conceitual de autorização

```text
1. PROPOR AÇÃO
   ↓
2. IDENTIFICAR ATOR, OBJETIVO, RECURSO, DADOS E EFEITO
   ↓
3. CONFIRMAR CAPABILITY E ACCESS
   ↓
4. VERIFICAR AUTHORITY
   ↓
5. VERIFICAR CONSENT EXIGIDO
   ↓
6. APLICAR POLICY
   ↓
7. SOLICITAR APPROVAL QUANDO NECESSÁRIO
   ↓
8. CONGELAR PARÂMETROS APROVADOS
   ↓
9. REVALIDAR CONTEXTO
   ↓
10. EXECUTAR
   ↓
11. OBSERVAR EFEITO
   ↓
12. VALIDAR RESULTADO
   ↓
13. REGISTRAR E COMUNICAR
```

Qualquer mudança material deve retornar à etapa adequada.

---

## 27. Estados conceituais da autoridade

Uma concessão de autoridade pode estar:

- proposta;
- aguardando aprovação;
- ativa;
- ativa com limites;
- suspensa;
- expirada;
- revogada;
- consumida;
- inválida por mudança de contexto.

Regras:

- expirada não pode ser reutilizada;
- revogada não pode gerar retry;
- consumida não autoriza nova ação;
- mudança de contexto exige reavaliação;
- ativa não elimina política por ação;
- aguardando aprovação não permite execução.

---

## 28. Evidências mínimas de autoridade

Para ações materiais, deve ser possível responder:

- quem solicitou?
- quem autorizou?
- qual autoridade possuía?
- qual ação foi apresentada?
- quais parâmetros foram aprovados?
- quando?
- por quanto tempo?
- qual política foi aplicada?
- qual identidade executou?
- qual efeito foi observado?
- a autorização foi revogada?
- houve mudança entre aprovação e execução?

Essas respostas não exigem registrar raciocínio interno privado.

---

## 29. Falhas de autoridade

Devem ser tratadas como falhas ou bloqueios distintos:

- capability inexistente;
- access indisponível;
- authority insuficiente;
- consent ausente;
- policy bloqueou;
- approval negada;
- approval expirada;
- parâmetros alterados;
- identidade incerta;
- contexto mudou;
- revogação recebida;
- execution falhou;
- efeito não verificado.

Essas categorias não devem ser fundidas em uma mensagem genérica de “não foi possível”.

---

## 30. Invariantes propostos de autoridade

1. toda ação possui objetivo;
2. toda ação possui ator solicitante;
3. todo acesso possui recurso e finalidade;
4. toda autoridade possui escopo e duração;
5. todo consentimento corresponde a efeito compreensível;
6. toda política produz decisão explícita;
7. toda aprovação corresponde a parâmetros finais;
8. toda execução revalida contexto material;
9. todo efeito relevante exige observação;
10. toda revogação bloqueia ações futuras;
11. todo retry permanece dentro do mandato;
12. toda ação irreversível exige autoridade externa ao agente;
13. toda ação de alto impacto exige política específica;
14. todo conteúdo externo permanece sem autoridade;
15. toda expansão de capacidade exige processo externo e autorizado.

Esses invariantes ainda precisam ser confrontados com casos reais antes de serem considerados definitivos.

---

## 31. Estado após este modelo

Este documento:

- separa capability, access, authority, consent, policy e execution;
- define regras conceituais de ação;
- define limites de autonomia;
- define aprovação e revogação;
- define o papel de sandbox;
- define tratamento de conteúdo não confiável;
- identifica ações que o agente não pode autorizar sozinho;
- não escolhe tecnologia;
- não implementa segurança;
- não autoriza código.

Uma futura especificação de segurança deverá transformar esses princípios em ameaças, controles e critérios de aceitação antes da implementação.
