# J.A.R.V.I.S.

## Modelo Conceitual de Memória

**Base:** `JARVIS_CONTEXT.md`, `JARVIS_INVARIANTS.md`, `JARVIS_BEHAVIOR_MODEL.md`, `JARVIS_CAPABILITY_MODEL.md` e `JARVIS_AUTHORITY_MODEL.md`  
**Status:** modelo conceitual; nenhuma tecnologia de memória foi escolhida  
**Objetivo:** definir o que pode ser lembrado, usado, corrigido, ignorado e removido

---

## 1. Princípio central

> Memória não é verdade.  
> Persistência não implica relevância.  
> Relevância não implica autorização.  
> Preferência não implica permissão.  
> Histórico não implica aprendizado.  
> Feedback não deve alterar comportamento automaticamente.

O J.A.R.V.I.S. deve lembrar de forma seletiva, governada e contestável.

Esquecer, corrigir, limitar e remover são capacidades tão importantes quanto registrar.

---

## 2. Escopo

Este documento separa:

- conhecimento;
- histórico;
- contexto;
- memória persistente;
- preferências;
- decisões;
- tarefas;
- relacionamentos;
- feedback;
- telemetria;
- aprendizado.

Não define:

- banco de dados;
- banco vetorial;
- embeddings;
- knowledge graph;
- mecanismo de busca;
- formato de armazenamento;
- algoritmo de recuperação;
- modelo de IA;
- política técnica de backup.

---

## 3. As categorias não pertencem ao mesmo eixo

Os conceitos solicitados não são categorias mutuamente exclusivas.

Eles representam dimensões diferentes:

### Natureza semântica

- conhecimento;
- preferências;
- decisões;
- tarefas;
- relacionamentos;
- feedback.

### Estado de ciclo de vida

- contexto;
- memória persistente.

### Registro operacional

- histórico;
- telemetria.

### Mudança de comportamento

- aprendizado.

Uma decisão, por exemplo:

- pode aparecer no histórico porque ocorreu;
- pode ser persistida porque continuará válida;
- pode entrar no contexto de uma tarefa relacionada;
- pode gerar feedback;
- não deve se transformar automaticamente em regra global.

Essa separação evita criar um único depósito chamado “memória” com informações de natureza e autoridade diferentes.

---

## 4. Metadados conceituais mínimos

Toda informação candidata a uso futuro deve possuir, quando aplicável:

- **identidade ou sujeito:** a quem ou a que se refere;
- **origem:** quem informou ou qual sistema observou;
- **tipo:** fato, preferência, decisão, tarefa, relação, feedback ou evento;
- **finalidade:** por que foi coletada ou retida;
- **escopo:** usuário, tarefa, projeto, domínio, organização ou ambiente;
- **momento:** quando foi criada, observada ou confirmada;
- **validade:** quando passa a valer e quando expira;
- **confiança:** quanto a informação é sustentada;
- **proveniência:** evidências e transformações relevantes;
- **sensibilidade:** impacto potencial de exposição;
- **autoridade:** quem pode usar, corrigir ou remover;
- **retenção:** por quanto tempo deve existir;
- **estado:** ativa, contestada, substituída, expirada, revogada ou removida;
- **relações:** itens que confirma, contradiz ou substitui.

Esses são requisitos conceituais. Não constituem um esquema técnico.

---

## 5. Estados conceituais de uma informação

Uma informação pode estar:

- observada;
- candidata a memória;
- aguardando confirmação;
- ativa;
- limitada a determinado contexto;
- contestada;
- em conflito;
- substituída;
- expirada;
- revogada;
- em retenção obrigatória;
- marcada para remoção;
- removida do uso ativo.

Regras:

- informação contestada não deve ser usada como fato confirmado;
- informação substituída pode permanecer no histórico, mas não dirigir comportamento atual;
- informação expirada exige revalidação;
- informação revogada não deve continuar entrando em novos contextos;
- remoção do uso ativo deve impedir recuperação para personalização;
- retenção obrigatória deve ser transparente e não autoriza reutilização.

---

## 6. Ciclo conceitual

```text
INFORMAÇÃO OBSERVADA
↓
CANDIDATA
↓
CLASSIFICAÇÃO
↓
AVALIAÇÃO DE FINALIDADE, ESCOPO E AUTORIDADE
↓
CONFIRMAÇÃO QUANDO NECESSÁRIA
↓
RETENÇÃO OU DESCARTE
↓
SELEÇÃO PARA CONTEXTO
↓
USO
↓
REVISÃO, CORREÇÃO, EXPIRAÇÃO OU REMOÇÃO
```

Nenhuma passagem deve ser automática apenas porque a informação apareceu em uma conversa.

---

# 7. CONHECIMENTO

## 7.1 Definição

Conhecimento é informação potencialmente reutilizável para compreender, decidir, criar ou validar.

Pode descrever:

- conceitos;
- fatos;
- regras de domínio;
- procedimentos;
- evidências;
- explicações;
- informações sobre recursos e capacidades.

## 7.2 Origem

- usuário;
- fonte externa;
- documento;
- ferramenta;
- sistema;
- especialista;
- resultado validado;
- conhecimento geral de um modelo;
- memória previamente confirmada.

## 7.3 Finalidade

- apoiar compreensão;
- responder perguntas;
- interpretar contexto;
- planejar;
- comparar alternativas;
- validar resultados;
- evitar repetição de pesquisa.

## 7.4 Escopo

Pode ser:

- geral;
- de domínio;
- organizacional;
- de projeto;
- pessoal;
- específico de uma tarefa.

Conhecimento de um escopo não deve ser promovido automaticamente para outro.

## 7.5 Validade

Depende de:

- tempo;
- domínio;
- versão;
- condições;
- fonte;
- mudança de regras.

Conhecimento sem período explícito pode exigir revalidação quando atualidade for material.

## 7.6 Confiança

Deve considerar:

- qualidade da fonte;
- confirmação independente;
- atualidade;
- consenso;
- método de obtenção;
- existência de conflito;
- diferença entre fato e inferência.

Conhecimento produzido por modelo não é confirmado apenas por ser plausível.

## 7.7 Quando pode ser utilizado

- quando relevante ao objetivo;
- quando o escopo é compatível;
- quando a fonte é permitida;
- quando a validade é suficiente;
- quando a confiança é proporcional ao impacto;
- quando conflitos são apresentados.

## 7.8 Quando deve ser ignorado

- fora de escopo;
- desatualizado;
- sem origem quando a origem é necessária;
- contradito por fonte de maior autoridade;
- contestado;
- obtido para outra finalidade sem autorização;
- classificado como conteúdo não confiável e não verificado;
- irrelevante ao objetivo.

## 7.9 Possibilidade de correção

Conhecimento gerenciado deve permitir:

- corrigir;
- adicionar nova fonte;
- marcar conflito;
- substituir versão;
- reduzir confiança;
- expirar.

Conhecimento geral incorporado a um modelo futuro não deve ser confundido com memória corrigível. O sistema deve poder sobrepor correção contextual sem afirmar que modificou o conhecimento interno do modelo.

## 7.10 Possibilidade de remoção

Conhecimento gerenciado pode ser:

- removido;
- revogado;
- excluído de determinado escopo;
- impedido de entrar em novos contextos.

Remover uma entrada gerenciada não garante apagar conhecimento intrínseco de um modelo. Essa distinção deve permanecer explícita.

---

# 8. HISTÓRICO

## 8.1 Definição

Histórico é o registro semântico de acontecimentos relevantes.

Pode incluir:

- intenções;
- objetivos;
- aprovações;
- ações;
- efeitos;
- decisões;
- falhas;
- resultados;
- correções;
- cancelamentos.

## 8.2 Origem

- eventos da interação;
- mudanças de estado;
- ferramentas;
- ações do usuário;
- avaliações;
- aprovações;
- resultados observados.

## 8.3 Finalidade

- continuidade;
- reconstrução de tarefa;
- auditoria;
- explicação;
- investigação;
- suporte à recuperação;
- prestação de contas.

## 8.4 Escopo

- execução;
- tarefa;
- projeto;
- usuário;
- organização;
- recurso afetado.

Históricos de escopos diferentes não devem ser misturados.

## 8.5 Validade

O fato de um evento ter ocorrido pode permanecer válido.

Sua interpretação, relevância ou consequência pode mudar.

Exemplo:

- “o usuário aprovou naquela data” pode continuar historicamente verdadeiro;
- a aprovação pode ter expirado e não possuir autoridade atual.

## 8.6 Confiança

- alta para evento diretamente observado e confirmado;
- moderada para evento reconstruído;
- baixa para interpretação inferida;
- contestada quando fontes divergem.

## 8.7 Quando pode ser utilizado

- reconstruir estado;
- explicar ações;
- investigar falhas;
- confirmar sequência;
- retomar tarefa;
- demonstrar aprovação passada;
- avaliar comportamento, dentro da finalidade permitida.

## 8.8 Quando deve ser ignorado

- quando não é relevante à tarefa;
- quando retenção expirou;
- quando pertence a outro usuário ou contexto;
- como autoridade atual;
- como preferência;
- como prova de consentimento futuro;
- como aprendizado automático.

## 8.9 Possibilidade de correção

Histórico auditável não deve ser reescrito silenciosamente.

Correções devem:

- adicionar versão ou anotação;
- preservar que o registro anterior estava incorreto;
- identificar quem corrigiu;
- explicar o motivo.

## 8.10 Possibilidade de remoção

Depende da finalidade e das obrigações aplicáveis.

Pode exigir:

- exclusão;
- anonimização;
- redução;
- retenção limitada;
- bloqueio de uso para personalização.

Retenção por auditoria não autoriza reutilização para outros fins.

---

# 9. CONTEXTO

## 9.1 Definição

Contexto é o conjunto temporário de informações selecionadas para a tarefa atual.

Contexto não é uma memória separada. É uma composição de informações oriundas de várias categorias.

## 9.2 Origem

- intenção atual;
- objetivo;
- conversa;
- estado;
- fontes;
- conhecimento;
- memória;
- preferências;
- decisões;
- tarefas;
- observações;
- políticas.

## 9.3 Finalidade

- compreender;
- planejar;
- selecionar capacidades;
- avaliar autoridade;
- executar;
- validar;
- comunicar resultado.

## 9.4 Escopo

Normalmente:

- tarefa;
- etapa;
- sessão;
- ação.

O contexto deve ser o menor conjunto suficiente.

## 9.5 Validade

Curta e dependente do estado atual.

Deve ser reavaliado quando:

- o objetivo muda;
- o ambiente muda;
- uma permissão expira;
- nova informação chega;
- a tarefa é retomada;
- uma ação produz efeito.

## 9.6 Confiança

Herda confiança e proveniência das informações que o compõem.

O contexto não aumenta a confiabilidade de uma informação apenas por incluí-la.

## 9.7 Quando pode ser utilizado

- somente na finalidade atual;
- durante a validade;
- dentro do escopo;
- conforme permissões;
- quando suficiente e atualizado.

## 9.8 Quando deve ser ignorado

- após cancelamento ou conclusão, salvo retenção justificada;
- quando desatualizado;
- quando pertence a outro escopo;
- quando contaminado;
- quando não autorizado;
- quando a proveniência foi perdida.

## 9.9 Possibilidade de correção

Deve permitir:

- remover item;
- atualizar;
- trocar fonte;
- marcar conflito;
- reduzir confiança;
- reconstruir.

## 9.10 Possibilidade de remoção

Contexto temporário deve ser descartado quando não for mais necessário.

Itens persistentes usados no contexto permanecem sujeitos às suas próprias políticas.

---

# 10. MEMÓRIA PERSISTENTE

## 10.1 Definição

Memória persistente é informação selecionada para permanecer disponível depois da tarefa ou sessão que a originou.

Persistência é um estado de ciclo de vida, não um tipo semântico único.

Uma memória persistente deve continuar identificada como:

- fato;
- preferência;
- decisão;
- tarefa;
- relacionamento;
- feedback;
- outra categoria válida.

## 10.2 Origem

- candidata proposta durante interação;
- informação explicitamente solicitada pelo usuário;
- decisão confirmada;
- preferência autorizada;
- estado de tarefa que precisa continuar;
- resultado validado;
- conhecimento gerenciado.

## 10.3 Finalidade

- continuidade;
- redução de repetição;
- personalização controlada;
- retomada;
- preservação de decisões;
- suporte a projetos;
- consistência entre sessões.

## 10.4 Escopo

Deve ser explícito:

- usuário;
- projeto;
- domínio;
- organização;
- ambiente;
- tarefa prolongada.

Memória sem escopo não deve ser persistida.

## 10.5 Validade

Deve possuir:

- início;
- possível expiração;
- condição de revisão;
- evento que a invalida;
- versão atual.

Memória permanente por padrão não é aceitável.

## 10.6 Confiança

Depende do tipo:

- fato confirmado;
- declaração explícita;
- preferência confirmada;
- inferência;
- resultado validado;
- observação.

Inferência persistida deve permanecer rotulada como inferência.

## 10.7 Quando pode ser utilizada

- quando relevante;
- no mesmo escopo;
- para a finalidade autorizada;
- quando ativa;
- quando a validade permanece;
- quando não contradiz instrução atual;
- quando a sensibilidade permite.

## 10.8 Quando deve ser ignorada

- expirada;
- contestada;
- revogada;
- fora do escopo;
- sem finalidade;
- de outro usuário;
- substituída;
- incompatível com instrução atual;
- inferida com baixa confiança;
- sensível para o contexto.

## 10.9 Possibilidade de correção

O usuário deve poder:

- visualizar;
- corrigir;
- contestar;
- limitar;
- alterar escopo;
- alterar validade;
- substituir.

Correção deve preservar proveniência suficiente para evitar que versão incorreta continue ativa.

## 10.10 Possibilidade de remoção

O usuário deve poder solicitar:

- exclusão;
- esquecimento;
- revogação de uso;
- remoção de determinado escopo;
- interrupção de personalização.

Remoção deve impedir uso futuro. Limitações técnicas ou retenções obrigatórias futuras deverão ser explicadas de forma transparente.

---

# 11. PREFERÊNCIAS

## 11.1 Definição

Preferências descrevem como o usuário prefere interagir ou trabalhar.

Exemplos conceituais:

- nível de detalhe;
- estilo de comunicação;
- ordem de apresentação;
- formato preferido;
- modo de revisão;
- horário preferencial.

## 11.2 Origem

- declaração explícita;
- escolha repetida;
- correção;
- configuração;
- inferência proposta para confirmação.

## 11.3 Finalidade

- personalizar experiência;
- reduzir repetição;
- adequar comunicação;
- ordenar alternativas;
- ajustar comportamento não crítico.

## 11.4 Escopo

- global do usuário;
- contexto pessoal;
- contexto profissional;
- projeto;
- tarefa;
- canal.

Uma preferência profissional não deve ser aplicada automaticamente à vida pessoal.

## 11.5 Validade

Pode mudar a qualquer momento.

Preferências inferidas devem expirar ou exigir confirmação.

## 11.6 Confiança

- alta quando explícita e recente;
- moderada quando repetida;
- baixa quando inferida;
- inválida quando contradita pela instrução atual.

## 11.7 Quando pode ser utilizada

- quando o escopo corresponde;
- quando não conflita com a solicitação atual;
- quando não altera autoridade;
- quando não reduz segurança;
- quando permanece ativa.

## 11.8 Quando deve ser ignorada

- fora de contexto;
- quando o usuário pede algo diferente;
- quando expirada;
- quando inferida e material;
- quando conflita com política;
- quando seria usada como consentimento ou permissão.

## 11.9 Possibilidade de correção

Deve ser simples:

- atualizar;
- restringir escopo;
- marcar exceção;
- confirmar;
- rebaixar confiança.

## 11.10 Possibilidade de remoção

Deve poder ser removida integralmente ou por escopo.

Remover preferência não deve remover histórico sem solicitação separada.

---

# 12. DECISÕES

## 12.1 Definição

Decisão é uma escolha confirmada por ator autorizado entre alternativas ou cursos de ação.

Recomendação do agente não é decisão até que seja adotada por quem possui autoridade.

## 12.2 Origem

- usuário;
- grupo autorizado;
- política;
- processo de aprovação;
- resultado de decisão formal.

## 12.3 Finalidade

- preservar direção;
- evitar rediscussão sem motivo;
- orientar tarefas;
- explicar escolhas;
- manter consistência;
- registrar condições.

## 12.4 Escopo

- tarefa;
- projeto;
- período;
- domínio;
- organização;
- recurso.

## 12.5 Validade

Depende de:

- condições;
- prazo;
- premissas;
- autoridade;
- política;
- mudança de contexto.

Uma decisão passada não é autoridade eterna.

## 12.6 Confiança

Decisão confirmada possui alta confiança quanto ao fato de ter sido tomada.

Isso não significa que seu conteúdo esteja correto ou continue adequado.

Decisão inferida não deve ser registrada como decisão.

## 12.7 Quando pode ser utilizada

- no escopo declarado;
- enquanto ativa;
- para orientar trabalho relacionado;
- quando premissas continuam válidas;
- como contexto, não como substituto de nova autorização quando necessária.

## 12.8 Quando deve ser ignorada

- substituída;
- expirada;
- tomada por ator sem autoridade;
- fora de escopo;
- premissas invalidadas;
- revogada;
- incompatível com política atual.

## 12.9 Possibilidade de correção

Decisão deve ser substituída por nova decisão explícita.

O registro histórico da decisão anterior pode permanecer, marcado como substituído.

## 12.10 Possibilidade de remoção

Pode ser removida da memória ativa.

O evento histórico de que uma decisão ocorreu pode ter retenção separada e não deve continuar orientando comportamento.

---

# 13. TAREFAS

## 13.1 Definição

Tarefa representa trabalho com objetivo, estado, limites e condição de conclusão.

## 13.2 Origem

- intenção do usuário;
- decomposição autorizada;
- continuação;
- evento sob mandato;
- atribuição organizacional;
- ação de recuperação.

## 13.3 Finalidade

- acompanhar trabalho;
- preservar estado;
- coordenar dependências;
- retomar;
- comunicar progresso;
- validar conclusão.

## 13.4 Escopo

- usuário;
- projeto;
- objetivo;
- período;
- conjunto de recursos;
- mandato.

## 13.5 Validade

Até:

- conclusão;
- cancelamento;
- expiração;
- rejeição;
- substituição;
- perda de autoridade.

Uma tarefa concluída pode permanecer no histórico sem continuar ativa.

## 13.6 Confiança

O estado deve se basear em eventos e evidências.

“Executando” não significa progresso real. “Concluída” exige validação.

## 13.7 Quando pode ser utilizada

- retomar trabalho;
- organizar prioridades;
- verificar dependências;
- comunicar estado;
- monitorar dentro do mandato;
- lembrar o usuário quando autorizado.

## 13.8 Quando deve ser ignorada

- cancelada;
- expirada;
- de outro contexto;
- sem autoridade;
- duplicada;
- concluída e irrelevante;
- estado desconhecido sem revisão.

## 13.9 Possibilidade de correção

Deve permitir:

- corrigir objetivo;
- corrigir estado;
- alterar prioridade;
- atualizar dependências;
- registrar efeito parcial;
- reabrir somente com decisão explícita.

## 13.10 Possibilidade de remoção

Pode ser:

- cancelada;
- arquivada;
- removida da visão ativa;
- excluída conforme política.

Cancelar tarefa não desfaz efeitos já produzidos.

---

# 14. RELACIONAMENTOS

## 14.1 Definição

Relacionamentos descrevem vínculos entre entidades relevantes.

Exemplos conceituais:

- usuário pertence a projeto;
- tarefa depende de tarefa;
- documento pertence a contexto;
- pessoa exerce função;
- decisão substitui decisão;
- recurso é controlado por organização.

Relacionamento não implica uso de grafo como tecnologia.

## 14.2 Origem

- declaração explícita;
- estrutura de fonte;
- sistema autorizado;
- evento observado;
- inferência;
- decisão.

## 14.3 Finalidade

- construir contexto;
- localizar informações;
- entender dependências;
- aplicar escopo;
- evitar mistura;
- apoiar autorização;
- explicar impacto.

## 14.4 Escopo

- pessoal;
- profissional;
- projeto;
- organização;
- tarefa;
- temporal.

## 14.5 Validade

Relacionamentos podem:

- começar;
- terminar;
- mudar;
- depender de função;
- valer apenas durante tarefa.

## 14.6 Confiança

- alta quando fornecido por fonte autorizada;
- moderada quando confirmada indiretamente;
- baixa quando inferida;
- contestada quando fontes divergem.

## 14.7 Quando pode ser utilizada

- quando relevante;
- quando ativa;
- no escopo autorizado;
- quando a confiança é adequada;
- quando não expõe relação sensível indevidamente.

## 14.8 Quando deve ser ignorada

- inferida e não confirmada em decisão material;
- expirada;
- fora de escopo;
- sensível para a finalidade;
- contradita;
- de identidade incerta.

## 14.9 Possibilidade de correção

Deve permitir:

- alterar vínculo;
- marcar início e fim;
- corrigir participantes;
- reduzir confiança;
- registrar conflito.

## 14.10 Possibilidade de remoção

Relacionamentos podem ser removidos ou desativados.

Registros históricos relacionados permanecem sujeitos a política separada.

---

# 15. FEEDBACK

## 15.1 Definição

Feedback é avaliação ou correção relacionada a resultado, comportamento ou experiência.

Feedback não é aprendizado automático.

## 15.2 Origem

- comentário explícito;
- correção;
- aprovação;
- rejeição;
- avaliação;
- resultado observado;
- comportamento implícito, com baixa confiança;
- avaliador qualificado.

## 15.3 Finalidade

- corrigir tarefa atual;
- avaliar utilidade;
- identificar falha;
- propor melhoria;
- gerar candidata a preferência;
- gerar candidata a memória;
- apoiar aprendizado controlado.

## 15.4 Escopo

- resultado;
- execução;
- capacidade;
- tarefa;
- projeto;
- experiência;
- produto.

Feedback local não deve se tornar regra global.

## 15.5 Validade

Depende do contexto, da versão do comportamento, do objetivo e do avaliador.

Feedback pode perder validade quando o sistema ou a tarefa muda.

## 15.6 Confiança

- alta para correção explícita do proprietário;
- variável para avaliação subjetiva;
- baixa para comportamento implícito;
- dependente de competência em conteúdo especializado.

## 15.7 Quando pode ser utilizado

- corrigir a tarefa atual;
- avaliar hipótese;
- propor preferência;
- identificar padrão com múltiplas evidências;
- sugerir melhoria;
- atualizar informação quando a autoridade é adequada.

## 15.8 Quando deve ser ignorado

- fora do escopo;
- malicioso;
- de origem não autorizada;
- isolado e usado para generalização;
- contraditório sem investigação;
- implícito em decisão de alto impacto;
- incompatível com política.

## 15.9 Possibilidade de correção

O emissor deve poder:

- corrigir;
- retirar;
- contextualizar;
- limitar o uso.

## 15.10 Possibilidade de remoção

Feedback pode ser removido da memória ativa e de conjuntos futuros de avaliação, conforme autoridade e retenção.

Resultado agregado já produzido pode exigir recalculação ou anotação, não simples apagamento conceitual.

---

# 16. TELEMETRIA

## 16.1 Definição

Telemetria é informação operacional sobre execução e funcionamento.

Pode incluir:

- tempo;
- custo;
- estado;
- erros;
- capacidades usadas;
- tentativas;
- limites;
- consumo;
- eventos de segurança.

Telemetria não deve ser confundida com memória pessoal.

## 16.2 Origem

- execução;
- ferramentas;
- monitoramento;
- políticas;
- sistema operacional futuro;
- validação;
- eventos de segurança.

## 16.3 Finalidade

- confiabilidade;
- segurança;
- depuração;
- avaliação;
- medição;
- investigação;
- capacidade operacional.

## 16.4 Escopo

- execução;
- capacidade;
- versão;
- ambiente;
- período;
- sistema.

## 16.5 Validade

Normalmente limitada no tempo.

Telemetria antiga pode ser inadequada para representar comportamento atual.

## 16.6 Confiança

Alta para medidas diretamente observadas, desde que o mecanismo seja íntegro.

Interpretações derivadas devem permanecer separadas.

## 16.7 Quando pode ser utilizada

- medir desempenho;
- investigar falha;
- detectar abuso;
- avaliar hipótese;
- controlar limites;
- melhorar segurança dentro da finalidade.

## 16.8 Quando deve ser ignorada

- para inferir preferência sem autorização;
- para reconstruir conteúdo pessoal desnecessário;
- fora da retenção;
- fora da versão relevante;
- quando corrompida;
- para finalidade não declarada.

## 16.9 Possibilidade de correção

Evento operacional original não deve ser alterado silenciosamente.

Pode receber:

- anotação;
- correção de interpretação;
- marcação de corrupção;
- substituição por medida verificada.

## 16.10 Possibilidade de remoção

Deve possuir política de retenção e minimização.

Pode exigir:

- remoção;
- agregação;
- anonimização;
- redação;
- separação de conteúdo e metadados.

Retenção para segurança não autoriza personalização.

---

# 17. APRENDIZADO

## 17.1 Definição

Aprendizado é uma mudança controlada no comportamento futuro baseada em evidência.

Não é um tipo de dado nem sinônimo de memória.

Pode utilizar conhecimento, histórico, feedback e telemetria, mas não deve resultar automaticamente deles.

## 17.2 Origem

- feedback autorizado;
- correções recorrentes;
- resultados validados;
- experimentos;
- métricas;
- falhas analisadas;
- revisão humana;
- comparação de estratégias.

## 17.3 Finalidade

- reduzir erros;
- melhorar seleção de capacidades;
- melhorar instruções;
- ajustar preferências;
- melhorar recuperação;
- corrigir conhecimento;
- propor evolução.

## 17.4 Escopo

Pode ser:

- tarefa;
- usuário;
- projeto;
- capacidade;
- domínio;
- produto.

Quanto mais amplo o escopo, maior deve ser a exigência de evidência e revisão.

## 17.5 Validade

Toda mudança deve possuir:

- hipótese;
- evidência;
- versão;
- período de observação;
- condição de reversão;
- avaliação posterior.

Aprendizado não deve ser permanente por padrão.

## 17.6 Confiança

Depende de:

- quantidade e qualidade das evidências;
- representatividade;
- consistência;
- ausência de viés conhecido;
- revisão;
- resultado de testes.

Uma única correção não sustenta regra geral.

## 17.7 Quando pode ser utilizado

- quando a mudança foi aprovada;
- quando existe evidência suficiente;
- no escopo testado;
- quando pode ser observada;
- quando existe forma de reverter;
- quando não altera autoridade silenciosamente.

## 17.8 Quando deve ser ignorado

- evidência insuficiente;
- feedback isolado;
- contexto diferente;
- fonte não confiável;
- efeito não avaliado;
- mudança que reduziria segurança;
- mudança que ampliaria autoridade;
- uso de dados sem finalidade autorizada.

## 17.9 Possibilidade de correção

Toda adaptação deve poder ser:

- revisada;
- reduzida;
- substituída;
- desativada;
- revertida;
- reavaliada.

## 17.10 Possibilidade de remoção

Deve ser possível remover ou reverter:

- regra aprendida;
- preferência derivada;
- estratégia;
- atualização de conhecimento;
- influência de dados revogados quando tecnicamente aplicável.

Aprendizado que não pode ser auditado ou revertido não deve ser adotado inicialmente.

---

## 18. Relações entre as categorias

## 18.1 Conhecimento → contexto

Conhecimento pode entrar no contexto quando relevante, válido e autorizado.

## 18.2 Histórico → contexto

Um evento passado pode explicar o estado atual, mas não concede autoridade futura.

## 18.3 Preferência → contexto

Preferência pode ajustar forma de interação, mas não permitir ações.

## 18.4 Decisão → tarefa

Decisão pode orientar trabalho enquanto suas condições permanecerem válidas.

## 18.5 Tarefa → histórico

Mudanças de estado produzem acontecimentos históricos.

## 18.6 Relacionamento → escopo

Relações podem ajudar a definir relevância e autoridade, mas precisam de confiança e validade.

## 18.7 Feedback → candidata a memória

Feedback pode gerar candidata, não persistência automática.

## 18.8 Telemetria → aprendizado

Telemetria pode sustentar hipótese de melhoria, mas não deve mudar comportamento diretamente.

## 18.9 Memória persistente → contexto

Memória só entra no contexto após nova avaliação de relevância, validade e permissão.

---

## 19. Regras de uso

Antes de usar qualquer informação retida, o J.A.R.V.I.S. deve poder responder:

1. de onde veio?
2. a quem pertence?
3. para qual finalidade foi retida?
4. em qual escopo vale?
5. ainda está válida?
6. qual sua confiança?
7. existe conflito?
8. o usuário permitiu este uso?
9. é necessária para a tarefa?
10. sua sensibilidade permite inclusão?

Se a resposta material for desconhecida, a informação deve ser ignorada, limitada ou esclarecida.

---

## 20. Regras de conflito

Quando informações conflitarem:

- não escolher silenciosamente;
- preservar proveniência;
- identificar versões;
- considerar atualidade e autoridade;
- distinguir fato de preferência;
- distinguir histórico de estado atual;
- pedir esclarecimento quando o conflito for material;
- não criar hierarquia universal sem evidência.

Instrução explícita atual pode superar preferência antiga, mas não pode superar política válida.

Decisão nova pode substituir decisão antiga, mas a mudança deve ser registrada.

---

## 21. Correção

Correção deve:

- identificar item;
- identificar autoridade para corrigir;
- preservar origem da correção;
- impedir uso futuro da versão incorreta;
- atualizar itens dependentes quando aplicável;
- marcar conflitos ainda não resolvidos;
- não reescrever auditoria silenciosamente.

Corrigir memória não significa alterar automaticamente todos os resultados históricos que utilizaram a informação.

Resultados afetados podem precisar de reavaliação.

---

## 22. Remoção e esquecimento

## 22.1 Tipos

- remover do contexto;
- remover da memória ativa;
- revogar uso futuro;
- excluir conteúdo persistente;
- anonimizar;
- expirar;
- remover relacionamento;
- desativar preferência;
- reverter aprendizado.

## 22.2 Regras

- remoção deve ter escopo claro;
- exclusão de memória e exclusão de histórico são pedidos diferentes;
- cópias e derivados devem ser considerados;
- retenção obrigatória futura deve ser transparente;
- informação removida não pode continuar personalizando;
- índices ou representações derivadas futuras deverão respeitar remoção;
- efeitos já produzidos não desaparecem automaticamente.

## 22.3 Confirmação

O usuário deve receber indicação do que:

- foi removido;
- deixou de ser usado;
- permanece por obrigação;
- não pode ser desfeito;
- exige reavaliação.

---

## 23. Separações obrigatórias

Devem permanecer separados:

- memória e contexto;
- conhecimento e verdade;
- histórico e autoridade;
- preferência e permissão;
- decisão e recomendação;
- tarefa e intenção;
- relacionamento e prova;
- feedback e aprendizado;
- telemetria e personalização;
- auditoria e memória do usuário;
- fato e inferência;
- evento e interpretação;
- persistência e relevância;
- retenção e consentimento para reutilização.

---

## 24. Informações que não devem ser memorizadas por padrão

- segredos;
- credenciais;
- conteúdo sensível sem finalidade;
- conversas completas apenas “por garantia”;
- dados de terceiros;
- inferências de alta sensibilidade;
- instruções de conteúdo externo;
- informações fora do objetivo;
- permissões expiradas como se fossem atuais;
- aprovações pontuais como mandatos permanentes;
- raciocínio interno privado;
- dados temporários sem valor futuro;
- conteúdo malicioso;
- resultados não validados como fatos.

---

## 25. Invariantes propostos

1. toda memória possui origem;
2. toda memória possui finalidade;
3. toda memória possui escopo;
4. toda memória possui validade ou condição de revisão;
5. confiança não equivale a verdade;
6. memória persistente não entra automaticamente no contexto;
7. preferência nunca concede autoridade;
8. histórico não renova aprovação;
9. feedback não produz aprendizado automático;
10. telemetria não é memória pessoal;
11. informação contestada não dirige ação crítica;
12. correção impede uso ativo da versão incorreta;
13. remoção impede uso futuro dentro do escopo;
14. aprendizagem ampla exige evidência mais forte;
15. o usuário mantém controle sobre memória pessoal persistida.

Esses invariantes ainda precisam de validação por casos reais.

---

## 26. Estado após este modelo

Este documento:

- separa categorias sem tratá-las como depósitos técnicos;
- define origem, finalidade, escopo, validade e confiança;
- define regras de uso e descarte;
- define correção, remoção e aprendizado controlado;
- não escolhe armazenamento;
- não escolhe busca;
- não escolhe embeddings;
- não escolhe banco vetorial;
- não escolhe knowledge graph;
- não autoriza implementação.

Uma futura especificação deverá transformar essas regras em cenários e critérios de aceitação antes de qualquer decisão tecnológica.
