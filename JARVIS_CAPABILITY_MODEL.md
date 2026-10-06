# J.A.R.V.I.S.

## Modelo Conceitual de Capacidades

**Base:** `JARVIS_BEHAVIOR_MODEL.md`, `JARVIS_INVARIANTS.md` e `JARVIS_GENERALIZATION_TEST.md`  
**Status:** taxonomia conceitual; não representa ferramentas ou implementação  
**Objetivo:** definir o vocabulário de comportamentos que o J.A.R.V.I.S. pode combinar

---

## 1. Escopo

Uma capacidade representa algo que o J.A.R.V.I.S. pode fazer ou tentar fazer dentro de condições conhecidas.

Uma capacidade não é:

- ferramenta;
- biblioteca;
- agente;
- serviço;
- endpoint;
- permissão;
- garantia de sucesso;
- autorização para agir.

Uma ferramenta futura poderá realizar uma ou mais capacidades. Uma capacidade também poderá ser realizada por mecanismos diferentes.

Este documento organiza capacidades em:

- PERCEBER / ADQUIRIR;
- INTERPRETAR / AVALIAR;
- FORMULAR;
- AGIR;
- COMUNICAR;
- COORDENAR;
- MONITORAR;
- ADAPTAR.

---

## 2. Dimensões comuns

## 2.1 Propósito

Descreve por que a capacidade existe e qual problema comportamental resolve.

## 2.2 Entrada

Descreve informações, recursos, estado e condições necessárias.

## 2.3 Saída

Descreve aquilo que a capacidade produz para o ciclo.

Saída não significa necessariamente efeito externo.

## 2.4 Efeito

Descreve alterações possíveis no estado interno, em artefatos, em sistemas externos ou no mundo físico.

## 2.5 Risco

O risco não pertence apenas ao nome da capacidade.

Ele depende de:

- dados utilizados;
- recurso afetado;
- destinatário;
- alcance;
- duração;
- reversibilidade;
- identidade;
- contexto;
- consequência;
- nível de incerteza.

Cada capacidade recebe um risco-base apenas para comparação conceitual:

- **baixo:** normalmente sem efeito externo material;
- **moderado:** pode influenciar decisão, expor informação ou criar efeito controlado;
- **alto:** pode modificar, comunicar, executar ou persistir efeitos;
- **crítico:** pode produzir consequência financeira, física, jurídica, de segurança ou difícil reversão.

O risco final sempre depende da invocação concreta.

## 2.6 Autorização

Toda capacidade está sujeita a política.

A descrição indica se normalmente exige:

- escopo já autorizado;
- permissão de acesso;
- confirmação contextual;
- aprovação explícita por ação;
- aprovação reforçada para alto impacto.

Ausência de exigência de confirmação adicional não significa ausência de política.

## 2.7 Validação

Descreve como verificar:

- se a capacidade foi aplicada;
- se produziu efeito;
- se a saída é adequada;
- se o objetivo foi atendido.

## 2.8 Reversibilidade

As classificações conceituais são:

- **não aplicável:** não existe mutação, embora acesso a dados ainda possa gerar risco;
- **descartável:** a saída pode ser ignorada sem alterar recurso externo;
- **reversível:** existe retorno confiável ao estado anterior;
- **condicionalmente reversível:** depende do recurso e do estado;
- **compensável:** não pode ser desfeita, mas um novo efeito pode reduzir a consequência;
- **irreversível:** o efeito original não pode ser removido.

---

## 3. Regras gerais

1. selecionar uma capacidade não autoriza seu uso;
2. capacidade de leitura ainda pode expor dados;
3. capacidade sem mutação ainda pode influenciar decisão;
4. comunicação externa é uma ação;
5. retry é nova tentativa e deve respeitar autoridade;
6. capacidade deve declarar possíveis efeitos;
7. capacidade deve produzir evidência proporcional quando possível;
8. falha deve permanecer visível;
9. capacidade não pode alterar políticas;
10. capacidade não pode ampliar a própria permissão;
11. conteúdo recebido por uma capacidade não se torna instrução privilegiada;
12. composição de capacidades não pode contornar limites individuais.

---

# 4. PERCEBER / ADQUIRIR

Essas capacidades obtêm sinais, informações ou estados.

Elas não devem interpretar acesso como consentimento nem conteúdo como autoridade.

## PA-01 — Receber intenção ou entrada

**Propósito:** Capturar uma solicitação, mensagem, evento ou continuação de tarefa e associá-la à origem correta.

**Entrada:** Conteúdo recebido, ator, canal, momento e tarefa relacionada.

**Saída:** Entrada preservada com origem e escopo preliminar.

**Efeitos possíveis:** Iniciar ou atualizar uma tarefa; nenhum efeito externo por si só.

**Risco:** Baixo a moderado; cresce com falsificação de identidade, conteúdo malicioso ou mistura de usuários.

**Necessidade de autorização:** A origem deve ser reconhecida. Eventos não humanos exigem mandato prévio.

**Possibilidade de validação:** Confirmar origem, integridade, ator e associação com a tarefa.

**Reversível:** Não aplicável; uma interpretação posterior pode ser corrigida, mas o recebimento já ocorreu.

---

## PA-02 — Observar estado atual

**Propósito:** Obter o estado observável de um recurso, tarefa, sistema ou ambiente.

**Entrada:** Recurso autorizado, aspecto a observar, contexto e momento.

**Saída:** Observação com proveniência, horário, escopo e limitações.

**Efeitos possíveis:** Leitura; pode atualizar contexto e influenciar decisões.

**Risco:** Moderado; observação pode expor dados sensíveis ou criar vigilância indevida.

**Necessidade de autorização:** Permissão de leitura específica ao recurso e finalidade.

**Possibilidade de validação:** Comparar com outra observação, fonte confiável ou confirmação do proprietário.

**Reversível:** Não aplicável; a leitura não altera o recurso, mas exposição de informação não pode ser desfeita.

---

## PA-03 — Ler recurso autorizado

**Propósito:** Adquirir conteúdo de um recurso delimitado, como arquivo, registro ou artefato.

**Entrada:** Recurso identificado, permissão, finalidade e limites de leitura.

**Saída:** Conteúdo adquirido, metadados relevantes e indicação de partes não legíveis.

**Efeitos possíveis:** Inclusão de conteúdo no contexto; possível exposição ou retenção indevida.

**Risco:** Moderado; depende da sensibilidade e do volume.

**Necessidade de autorização:** Permissão explícita ou mandato válido de leitura.

**Possibilidade de validação:** Confirmar que o recurso correto foi lido e que o conteúdo não foi alterado.

**Reversível:** Não aplicável; o recurso permanece inalterado, mas o acesso já ocorreu.

---

## PA-04 — Consultar fonte externa

**Propósito:** Obter informação atual ou ausente em uma fonte fora do contexto já carregado.

**Entrada:** Pergunta, fonte permitida, dados que podem ser enviados e limite da consulta.

**Saída:** Resposta, proveniência, momento, limitações e eventual falha.

**Efeitos possíveis:** Envio de consulta e possível exposição de dados à fonte externa.

**Risco:** Moderado a alto; depende dos dados enviados, fonte e termos de uso.

**Necessidade de autorização:** Fonte e dados enviados devem estar autorizados. Consulta sensível exige confirmação.

**Possibilidade de validação:** Conferir resposta, fonte, atualidade e consistência com referências independentes.

**Reversível:** Geralmente irreversível quanto ao envio de dados; a resposta pode ser descartada.

---

## PA-05 — Capturar evento

**Propósito:** Receber uma mudança ou sinal relevante ao longo do tempo.

**Entrada:** Origem autorizada, tipo de evento, período de observação e mandato.

**Saída:** Evento com origem, momento, conteúdo e confiança.

**Efeitos possíveis:** Atualizar estado, iniciar avaliação ou gerar notificação.

**Risco:** Moderado a alto; pode criar monitoramento excessivo ou falso acionamento.

**Necessidade de autorização:** Assinatura e duração explicitamente autorizadas; deve existir revogação.

**Possibilidade de validação:** Confirmar origem, integridade, atualidade e correspondência com o estado observado.

**Reversível:** A captura não pode ser desfeita; monitoramento futuro pode ser encerrado.

---

# 5. INTERPRETAR / AVALIAR

Essas capacidades transformam informação em significado, relações, estimativas ou avaliações.

Suas saídas podem estar erradas e não devem ser tratadas automaticamente como fatos.

## IA-01 — Extrair informação

**Propósito:** Identificar dados, fatos ou elementos relevantes em uma entrada.

**Entrada:** Conteúdo, objetivo, critérios de relevância e contexto.

**Saída:** Elementos extraídos com referência à origem.

**Efeitos possíveis:** Produzir representação derivada; pode omitir ou distorcer informação.

**Risco:** Baixo a moderado; aumenta quando a extração alimenta decisão crítica.

**Necessidade de autorização:** Acesso à entrada deve estar autorizado; normalmente não exige confirmação por item.

**Possibilidade de validação:** Comparar cada elemento com a fonte e medir cobertura.

**Reversível:** Descartável.

---

## IA-02 — Classificar

**Propósito:** Associar informações ou situações a categorias úteis para o objetivo.

**Entrada:** Item, categorias, critérios e contexto.

**Saída:** Classificação, justificativa verificável e nível de incerteza.

**Efeitos possíveis:** Influenciar roteamento, prioridade, risco ou decisão.

**Risco:** Moderado; classificações erradas podem produzir tratamento inadequado.

**Necessidade de autorização:** Normalmente coberta pelo objetivo, mas uso em decisões sensíveis exige revisão.

**Possibilidade de validação:** Comparar com critérios, exemplos rotulados ou avaliador qualificado.

**Reversível:** Descartável; efeitos posteriores baseados nela podem não ser.

---

## IA-03 — Comparar e relacionar

**Propósito:** Identificar semelhanças, diferenças, dependências e relações entre informações.

**Entrada:** Dois ou mais itens, dimensões de comparação e finalidade.

**Saída:** Relações encontradas, diferenças, evidências e incertezas.

**Efeitos possíveis:** Influenciar síntese, decisão ou planejamento.

**Risco:** Baixo a moderado; cresce se relações inferidas forem tratadas como fatos.

**Necessidade de autorização:** Acesso aos itens e finalidade autorizados.

**Possibilidade de validação:** Revisar contra fontes e critérios explícitos.

**Reversível:** Descartável.

---

## IA-04 — Detectar lacuna, conflito ou anomalia

**Propósito:** Identificar informação ausente, divergência ou comportamento fora do esperado.

**Entrada:** Fontes, expectativa, critérios e contexto.

**Saída:** Lacunas, conflitos ou anomalias com evidência e materialidade estimada.

**Efeitos possíveis:** Pausar tarefa, pedir esclarecimento ou impedir falsa conclusão.

**Risco:** Moderado; falsos positivos interrompem trabalho e falsos negativos ocultam problemas.

**Necessidade de autorização:** Normalmente dentro do objetivo; observação de dados sensíveis continua limitada.

**Possibilidade de validação:** Comparar com conjunto de referência, revisão humana ou observação independente.

**Reversível:** Descartável; decisões tomadas a partir da detecção podem produzir efeitos.

---

## IA-05 — Avaliar proveniência, qualidade e incerteza

**Propósito:** Estimar se uma informação é atual, confiável, suficiente e adequada ao objetivo.

**Entrada:** Informação, origem, tempo, contexto, critérios e evidências.

**Saída:** Avaliação de qualidade, limitações, confiança e necessidade de verificação.

**Efeitos possíveis:** Incluir, excluir ou limitar o uso da informação.

**Risco:** Moderado; confiança mal calibrada pode criar falsa certeza.

**Necessidade de autorização:** Sem aprovação adicional quando dentro do objetivo; critérios sensíveis precisam ser definidos pelo domínio.

**Possibilidade de validação:** Comparar avaliações com fontes conhecidas, resultados posteriores e revisores.

**Reversível:** Descartável.

---

## IA-06 — Avaliar restrição e risco

**Propósito:** Identificar consequências, alcance, reversibilidade e fatores de risco de uma ação proposta.

**Entrada:** Ação, recurso, dados, destinatário, contexto, efeito e políticas relevantes.

**Saída:** Fatores de risco e recomendação para avaliação de política.

**Efeitos possíveis:** Influenciar bloqueio, aprovação ou escolha de alternativa.

**Risco:** Alto se confundida com autorização definitiva.

**Necessidade de autorização:** Pode avaliar dentro do objetivo, mas NÃO pode conceder permissão.

**Possibilidade de validação:** Cenários adversariais, revisão de políticas e comparação com especialistas.

**Reversível:** Descartável; a decisão de autoridade permanece separada.

---

# 6. FORMULAR

Essas capacidades produzem representações, alternativas, planos, explicações ou conteúdo.

Elas não devem apresentar criação plausível como fato confirmado.

## FO-01 — Sintetizar

**Propósito:** Combinar informações relevantes em uma representação coerente e mais útil.

**Entrada:** Informações selecionadas, objetivo, público, restrições e proveniência.

**Saída:** Síntese com fontes, lacunas e conflitos relevantes.

**Efeitos possíveis:** Reduzir complexidade; também pode omitir nuance.

**Risco:** Moderado; aumenta em decisões críticas ou quando fontes divergem.

**Necessidade de autorização:** Uso das fontes deve estar autorizado; normalmente não exige aprovação adicional.

**Possibilidade de validação:** Comparar cobertura, fidelidade e rastreabilidade.

**Reversível:** Descartável.

---

## FO-02 — Explicar

**Propósito:** Tornar conceito, decisão, estado ou resultado compreensível para determinado público.

**Entrada:** Conteúdo, público, objetivo, nível de detalhe e evidências.

**Saída:** Explicação estruturada com limitações.

**Efeitos possíveis:** Influenciar compreensão e decisão.

**Risco:** Baixo a moderado; explicação incorreta pode gerar confiança indevida.

**Necessidade de autorização:** Normalmente dentro do objetivo; dados sensíveis devem respeitar público e destino.

**Possibilidade de validação:** Teste de compreensão, revisão factual e avaliação do público.

**Reversível:** Descartável; influência já causada pode não ser reversível.

---

## FO-03 — Gerar alternativas

**Propósito:** Produzir opções diferentes para alcançar um objetivo.

**Entrada:** Objetivo, contexto, restrições, capacidades e critérios.

**Saída:** Alternativas com vantagens, limitações, riscos e dependências.

**Efeitos possíveis:** Ampliar espaço de decisão; pode criar opções inviáveis.

**Risco:** Moderado.

**Necessidade de autorização:** Não exige autorização para formular; avaliar dados e recursos continua sujeito a escopo.

**Possibilidade de validação:** Verificar compatibilidade com restrições e viabilidade.

**Reversível:** Descartável.

---

## FO-04 — Planejar

**Propósito:** Organizar uma abordagem, etapas, dependências, aprovações e validações.

**Entrada:** Objetivo, contexto, capacidades, restrições, políticas e estado.

**Saída:** Plano proposto ou decisão de execução direta.

**Efeitos possíveis:** Orientar ações futuras; não produz efeito externo por si só.

**Risco:** Moderado; planos podem esconder ações perigosas ou assumir capacidades inexistentes.

**Necessidade de autorização:** Formular não autoriza executar. Etapas com efeitos exigem avaliação própria.

**Possibilidade de validação:** Revisar viabilidade, completude, dependências e conformidade.

**Reversível:** Descartável e revisável.

---

## FO-05 — Recomendar

**Propósito:** Apresentar uma opção preferida com base em critérios e evidências.

**Entrada:** Alternativas, objetivo, critérios, contexto, riscos e incertezas.

**Saída:** Recomendação, justificativa, evidências, alternativas rejeitadas e limitações.

**Efeitos possíveis:** Influenciar decisão humana.

**Risco:** Moderado a crítico conforme o domínio.

**Necessidade de autorização:** Normalmente permitida como apoio; decisões sensíveis exigem revisão qualificada.

**Possibilidade de validação:** Avaliar critérios, evidências, calibração e resultado posterior.

**Reversível:** A recomendação pode ser rejeitada; sua influência não pode ser totalmente desfeita.

---

## FO-06 — Criar rascunho

**Propósito:** Produzir conteúdo ou artefato provisório para revisão.

**Entrada:** Objetivo, estrutura, contexto, fontes, estilo e restrições.

**Saída:** Rascunho claramente identificado, com evidências e pendências quando aplicável.

**Efeitos possíveis:** Criar representação temporária; pode conter erro ou conteúdo sensível.

**Risco:** Moderado; aumenta se o rascunho puder ser confundido com versão final.

**Necessidade de autorização:** Dentro do escopo aprovado; persistência ou publicação exige autorização própria.

**Possibilidade de validação:** Revisão contra critérios, fontes e público.

**Reversível:** Descartável enquanto permanecer rascunho.

---

# 7. AGIR

Essas capacidades produzem ou tentam produzir efeitos observáveis.

Elas exigem avaliação explícita de autoridade.

## AG-01 — Criar recurso

**Propósito:** Produzir um novo artefato, registro, objeto ou configuração.

**Entrada:** Conteúdo, destino, identidade, formato conceitual, política e autorização.

**Saída:** Recurso criado ou falha, com identificação e evidência.

**Efeitos possíveis:** Persistência, consumo de espaço, visibilidade e acionamento de processos.

**Risco:** Moderado a alto.

**Necessidade de autorização:** Destino, conteúdo e finalidade devem estar autorizados; criação externa normalmente exige aprovação.

**Possibilidade de validação:** Confirmar existência, conteúdo, destino e ausência de duplicação.

**Reversível:** Condicionalmente reversível; excluir o recurso pode não remover cópias ou efeitos derivados.

---

## AG-02 — Modificar recurso

**Propósito:** Alterar estado ou conteúdo existente.

**Entrada:** Recurso, alteração proposta, estado esperado, autorização e critérios.

**Saída:** Recurso modificado, efeito parcial ou falha.

**Efeitos possíveis:** Perda de conteúdo, mudança de comportamento e impacto em terceiros.

**Risco:** Alto; pode ser crítico.

**Necessidade de autorização:** Aprovação explícita ou mandato específico, com recurso e escopo.

**Possibilidade de validação:** Comparar estado anterior e posterior, critérios e efeitos dependentes.

**Reversível:** Condicionalmente reversível; depende de histórico, concorrência e efeitos posteriores.

---

## AG-03 — Remover recurso

**Propósito:** Excluir, revogar, desativar ou tornar indisponível um recurso.

**Entrada:** Recurso, escopo, motivo, impacto, autorização e alternativa de preservação.

**Saída:** Recurso removido, desativado, preservado ou falha.

**Efeitos possíveis:** Perda de dados, interrupção, quebra de dependências e impacto em terceiros.

**Risco:** Alto a crítico.

**Necessidade de autorização:** Aprovação explícita reforçada; confirmação de recurso e consequência.

**Possibilidade de validação:** Confirmar estado, dependências e retenções remanescentes.

**Reversível:** Frequentemente irreversível ou apenas compensável.

---

## AG-04 — Executar operação computacional

**Propósito:** Processar dados ou executar código/comando dentro de limites autorizados.

**Entrada:** Operação, dados, ambiente, limites, recursos e autorização.

**Saída:** Saída, efeito, erro, consumo e evidência.

**Efeitos possíveis:** Cálculo puro ou alterações em arquivos, processos, rede e sistemas.

**Risco:** De baixo a crítico conforme o ambiente e permissões.

**Necessidade de autorização:** Operações puras podem estar no mandato; código ou comando com efeito exige escopo, isolamento e confirmação proporcional.

**Possibilidade de validação:** Resultado esperado, testes, estado do ambiente e rastreio de efeitos.

**Reversível:** Varia; cálculo é descartável, efeitos externos podem ser irreversíveis.

---

## AG-05 — Invocar operação externa

**Propósito:** Solicitar a um sistema externo que consulte, crie, modifique, envie ou transacione.

**Entrada:** Sistema, ação, parâmetros, dados, destino, autorização e limites.

**Saída:** Confirmação, identificador, efeito observado, pendência ou falha.

**Efeitos possíveis:** Comunicação, transação, alteração persistente ou obrigação.

**Risco:** Alto a crítico.

**Necessidade de autorização:** Aprovação explícita ou mandato delimitado; ações financeiras, jurídicas ou equivalentes exigem controles reforçados.

**Possibilidade de validação:** Consultar estado externo independente da resposta inicial e obter comprovante.

**Reversível:** Frequentemente compensável ou irreversível.

---

## AG-06 — Controlar ou configurar sistema/dispositivo

**Propósito:** Alterar estado operacional de software, equipamento ou ambiente físico.

**Entrada:** Recurso, estado desejado, estado atual, duração, limites e autorização.

**Saída:** Comando emitido, estado observado, falha ou efeito parcial.

**Efeitos possíveis:** Mudança operacional, física, energética ou de segurança.

**Risco:** Alto a crítico.

**Necessidade de autorização:** Mandato específico, limites físicos e confirmação proporcional.

**Possibilidade de validação:** Observar estado após ação e confirmar ausência de efeito fora do escopo.

**Reversível:** Condicionalmente reversível; alguns efeitos físicos são apenas compensáveis.

---

# 8. COMUNICAR

Comunicação pode ser interação com o usuário ou ação externa.

Esses dois casos não devem ser tratados como equivalentes.

## CM-01 — Solicitar esclarecimento

**Propósito:** Obter informação necessária para reduzir ambiguidade material.

**Entrada:** Incerteza, objetivo, opções e impacto de não responder.

**Saída:** Pergunta, resposta, ausência de resposta ou mudança de escopo.

**Efeitos possíveis:** Pausar tarefa e atualizar objetivo ou contexto.

**Risco:** Baixo; perguntas inadequadas podem expor dados ou aumentar fricção.

**Necessidade de autorização:** Não exige aprovação adicional para perguntar ao próprio usuário.

**Possibilidade de validação:** Verificar se a resposta resolveu a incerteza e reduziu erro.

**Reversível:** Não aplicável; a pergunta já foi comunicada.

---

## CM-02 — Solicitar aprovação

**Propósito:** Obter decisão informada antes de efeito não coberto pelo mandato.

**Entrada:** Ação, recurso, dados, destino, efeito, risco, duração e alternativas.

**Saída:** Aprovação, negação, modificação, ausência de resposta ou cancelamento.

**Efeitos possíveis:** Conceder autoridade delimitada; não executa a ação por si só.

**Risco:** Alto se a solicitação for incompleta ou manipulativa.

**Necessidade de autorização:** A própria solicitação é permitida; a resposta precisa vir de ator autorizado.

**Possibilidade de validação:** Testar compreensão do usuário e correspondência entre aprovado e executado.

**Reversível:** A permissão pode ser revogada para ações futuras; efeitos já executados permanecem.

---

## CM-03 — Apresentar resultado

**Propósito:** Comunicar estado, efeito, evidência, limitações e próximos passos.

**Entrada:** Objetivo, validação, estado, evidências e público.

**Saída:** Resultado compreensível e rastreável.

**Efeitos possíveis:** Informar e influenciar decisão.

**Risco:** Moderado; cresce com conteúdo sensível ou falsa certeza.

**Necessidade de autorização:** Público e canal devem estar autorizados.

**Possibilidade de validação:** Teste de compreensão, fidelidade e correspondência com evidências.

**Reversível:** A mensagem não pode ser retirada da compreensão do usuário; correções podem ser emitidas.

---

## CM-04 — Notificar

**Propósito:** Informar evento, mudança, risco ou necessidade de intervenção no momento adequado.

**Entrada:** Evento, relevância, destinatário, urgência, política e preferências.

**Saída:** Notificação enviada, suprimida, agrupada ou falha.

**Efeitos possíveis:** Interrupção, atenção, exposição em canal e acionamento humano.

**Risco:** Moderado; pode ser intrusivo ou revelar informação.

**Necessidade de autorização:** Canal, tipo de evento e frequência devem estar autorizados.

**Possibilidade de validação:** Entrega, compreensão, relevância e taxa de ação ou rejeição.

**Reversível:** Geralmente irreversível após envio.

---

## CM-05 — Comunicar externamente em nome do usuário

**Propósito:** Enviar mensagem ou informação a terceiro representando o usuário.

**Entrada:** Conteúdo final, destinatário, canal, identidade, intenção e aprovação.

**Saída:** Comunicação enviada, confirmação, falha ou rascunho não enviado.

**Efeitos possíveis:** Compromisso social, profissional, jurídico ou divulgação de dados.

**Risco:** Alto a crítico.

**Necessidade de autorização:** Aprovação explícita do conteúdo, destinatário e identidade, salvo mandato específico previamente definido.

**Possibilidade de validação:** Confirmar conteúdo, destino, entrega e identidade utilizada.

**Reversível:** Geralmente irreversível; retratação é compensação, não reversão.

---

# 9. COORDENAR

Essas capacidades organizam outras capacidades, estado e dependências.

Coordenação não implica que deva existir um único orquestrador técnico.

## CD-01 — Selecionar capacidade

**Propósito:** Escolher o comportamento mais adequado e menos arriscado para uma necessidade.

**Entrada:** Objetivo, contexto, plano, capacidades disponíveis, efeitos e limites.

**Saída:** Capacidade candidata, justificativa, requisitos e alternativas.

**Efeitos possíveis:** Direcionar execução futura.

**Risco:** Moderado; seleção errada pode ampliar risco ou falhar silenciosamente.

**Necessidade de autorização:** Seleção não autoriza invocação.

**Possibilidade de validação:** Avaliar adequação, disponibilidade, menor privilégio e resultado posterior.

**Reversível:** Descartável antes da execução.

---

## CD-02 — Decompor e sequenciar

**Propósito:** Dividir objetivo complexo em etapas e ordenar dependências.

**Entrada:** Objetivo, contexto, capacidades, restrições e critérios.

**Saída:** Etapas, ordem, dependências, checkpoints e pontos de aprovação.

**Efeitos possíveis:** Estruturar trabalho; pode aumentar custo e complexidade.

**Risco:** Moderado.

**Necessidade de autorização:** Decomposição não autoriza execução.

**Possibilidade de validação:** Revisar completude, necessidade, dependências e conformidade.

**Reversível:** Descartável e revisável.

---

## CD-03 — Administrar estado da tarefa

**Propósito:** Manter representação atual de progresso, espera, autorização, falha e conclusão.

**Entrada:** Eventos da tarefa, ações, efeitos, aprovações e validações.

**Saída:** Estado atualizado e transição explicável.

**Efeitos possíveis:** Controlar continuidade, pausa, cancelamento e retomada.

**Risco:** Alto se o estado estiver incorreto ou for perdido.

**Necessidade de autorização:** Atualizações decorrentes da tarefa são permitidas; persistência além dela exige política.

**Possibilidade de validação:** Reconstruir transições e comparar com eventos observados.

**Reversível:** Estado incorreto pode ser corrigido, mas efeitos executados não são revertidos por isso.

---

## CD-04 — Coordenar dependências

**Propósito:** Garantir que pré-condições e resultados necessários estejam disponíveis antes da próxima etapa.

**Entrada:** Etapas, dependências, estados, capacidades e prazos.

**Saída:** Etapa liberada, aguardando, bloqueada ou inválida.

**Efeitos possíveis:** Iniciar, pausar ou impedir trabalho.

**Risco:** Moderado a alto; erro pode gerar execução fora de ordem.

**Necessidade de autorização:** Cada efeito continua sujeito à sua própria autorização.

**Possibilidade de validação:** Conferir pré-condições e ordem observada.

**Reversível:** A decisão de coordenação pode ser revista antes de efeitos.

---

## CD-05 — Delegar

**Propósito:** Atribuir uma tarefa limitada a outra capacidade, operador ou agente autorizado.

**Entrada:** Objetivo delegado, escopo, contexto mínimo, limites, critérios e autoridade.

**Saída:** Trabalho aceito, recusado, resultado, estado ou falha.

**Efeitos possíveis:** Compartilhar dados e distribuir execução.

**Risco:** Alto; pode ampliar exposição, autoridade e dificuldade de auditoria.

**Necessidade de autorização:** Destino, dados e autoridade delegada precisam estar explicitamente permitidos.

**Possibilidade de validação:** Verificar escopo recebido, ações realizadas, evidências e resultado.

**Reversível:** Delegação futura pode ser revogada; dados enviados e efeitos já ocorridos podem ser irreversíveis.

---

## CD-06 — Interromper, cancelar e direcionar recuperação

**Propósito:** Impedir novas ações e levar a tarefa a um estado seguro.

**Entrada:** Cancelamento, falha, mudança de política, limite ou risco.

**Saída:** Pausa, cancelamento, recuperação, estado parcial ou encerramento.

**Efeitos possíveis:** Parar trabalho, preservar estado e iniciar compensação autorizada.

**Risco:** Alto; interrupção incorreta pode deixar efeitos parciais.

**Necessidade de autorização:** Cancelamento legítimo deve ser obedecido; compensações com novos efeitos exigem autoridade.

**Possibilidade de validação:** Confirmar que novas ações cessaram e que efeitos foram identificados.

**Reversível:** Pausa pode ser revertida; cancelamento exige nova autorização para retomar.

---

# 10. MONITORAR

Monitoramento ocorre ao longo do tempo e exige finalidade, duração e revogação explícitas.

## MO-01 — Acompanhar tarefa ativa

**Propósito:** Observar progresso, espera, falha e conclusão de uma tarefa em andamento.

**Entrada:** Tarefa, estado esperado, eventos e limite temporal.

**Saída:** Atualização de estado, progresso, bloqueio ou conclusão.

**Efeitos possíveis:** Atualizar estado e gerar comunicação.

**Risco:** Moderado; monitoramento incorreto pode ocultar falha ou consumir recursos.

**Necessidade de autorização:** Coberto pelo mandato da tarefa durante sua duração.

**Possibilidade de validação:** Comparar eventos, efeitos e estado reportado.

**Reversível:** O acompanhamento pode ser encerrado; observações já coletadas permanecem sujeitas à retenção.

---

## MO-02 — Observar eventos autorizados

**Propósito:** Detectar mudanças relevantes fora de uma interação imediata.

**Entrada:** Fontes de eventos, tipos, filtros, duração e mandato.

**Saída:** Eventos observados com proveniência e momento.

**Efeitos possíveis:** Atualizar contexto, gerar alerta ou iniciar avaliação.

**Risco:** Alto; pode se tornar vigilância ou gerar exposição contínua.

**Necessidade de autorização:** Explícita, delimitada, temporária e revogável.

**Possibilidade de validação:** Conferir origem, filtros, eventos perdidos e falsos positivos.

**Reversível:** Monitoramento futuro pode ser encerrado; coleta já ocorrida não pode ser desfeita completamente.

---

## MO-03 — Avaliar condição ou gatilho

**Propósito:** Determinar se uma condição previamente definida foi satisfeita.

**Entrada:** Evento, estado, condição, janela temporal e política.

**Saída:** Condição satisfeita, não satisfeita, incerta ou inválida.

**Efeitos possíveis:** Iniciar solicitação, notificação ou ação condicionada.

**Risco:** Moderado a alto; falso positivo pode iniciar efeito indevido.

**Necessidade de autorização:** A condição e suas possíveis consequências devem estar autorizadas previamente.

**Possibilidade de validação:** Reproduzir avaliação com os mesmos fatos e critérios.

**Reversível:** A avaliação é descartável; efeitos acionados podem não ser.

---

## MO-04 — Monitorar limites

**Propósito:** Acompanhar custo, tempo, tentativas, recursos, escopo ou duração de um mandato.

**Entrada:** Limites definidos, consumo observado e estado.

**Saída:** Consumo atual, alerta, bloqueio ou expiração.

**Efeitos possíveis:** Pausar ou encerrar trabalho.

**Risco:** Moderado; falha pode causar consumo ou autonomia excessivos.

**Necessidade de autorização:** Limites fazem parte da política; não requer nova confirmação para aplicá-los.

**Possibilidade de validação:** Comparar registros de consumo e limites.

**Reversível:** Bloqueio pode ser revisto por autoridade; consumo já ocorrido não.

---

## MO-05 — Detectar mudança ou anomalia

**Propósito:** Identificar desvio relevante em relação a estado, padrão ou condição esperada.

**Entrada:** Observações, referência, período e critérios.

**Saída:** Mudança detectada, evidência, incerteza e materialidade.

**Efeitos possíveis:** Gerar alerta, revalidar contexto ou interromper execução.

**Risco:** Moderado a alto; falsos positivos interrompem e falsos negativos ocultam risco.

**Necessidade de autorização:** Monitoramento e dados precisam estar autorizados.

**Possibilidade de validação:** Conjunto de eventos conhecido, revisão humana e comparação posterior.

**Reversível:** Detecção é descartável; notificações ou ações resultantes podem não ser.

---

# 11. ADAPTAR

Adaptação deve ser controlada, auditável e reversível.

Ela não autoriza autoexpansão irrestrita.

## AD-01 — Aplicar feedback à tarefa atual

**Propósito:** Corrigir objetivo, contexto, plano ou resultado durante a execução atual.

**Entrada:** Feedback, estado, origem, escopo e evidência.

**Saída:** Correção local, nova versão ou decisão de manter o comportamento anterior.

**Efeitos possíveis:** Alterar a tarefa atual sem criar regra permanente.

**Risco:** Moderado; feedback pode ser ambíguo ou malicioso.

**Necessidade de autorização:** Feedback deve vir de ator autorizado para aquela tarefa.

**Possibilidade de validação:** Confirmar que a correção corresponde ao feedback e não excede o escopo.

**Reversível:** Geralmente reversível dentro da tarefa antes de efeitos externos.

---

## AD-02 — Propor candidata a memória

**Propósito:** Identificar informação que poderá ser útil no futuro sem persistir automaticamente.

**Entrada:** Fato, decisão, preferência, resultado, proveniência e finalidade.

**Saída:** Candidata com tipo, escopo, validade, confiança e justificativa.

**Efeitos possíveis:** Nenhuma persistência até aprovação ou política aplicável.

**Risco:** Moderado; seleção inadequada pode incentivar retenção excessiva.

**Necessidade de autorização:** Propor é permitido; persistir depende de política e, quando necessário, aprovação.

**Possibilidade de validação:** Avaliar utilidade, correção, finalidade e duplicidade.

**Reversível:** Descartável antes da persistência.

---

## AD-03 — Corrigir, excluir ou esquecer memória

**Propósito:** Manter memória sob controle do usuário e remover informação incorreta ou indevida.

**Entrada:** Memória identificada, correção ou solicitação de exclusão, autoridade e escopo.

**Saída:** Memória corrigida, removida, desativada ou falha explicada.

**Efeitos possíveis:** Alterar comportamento futuro e retenção.

**Risco:** Alto; pode apagar informação necessária ou deixar cópias residuais.

**Necessidade de autorização:** Proprietário ou autoridade aplicável deve confirmar.

**Possibilidade de validação:** Confirmar que a memória não é mais recuperada ou que a versão correta prevalece.

**Reversível:** Correção pode ser reversível com histórico; exclusão pode ser irreversível.

---

## AD-04 — Atualizar preferência autorizada

**Propósito:** Ajustar a forma de interação ou trabalho conforme preferência explícita.

**Entrada:** Preferência, usuário, escopo, duração e confirmação.

**Saída:** Preferência atualizada e limites de aplicação.

**Efeitos possíveis:** Alterar respostas e escolhas futuras sem conceder autoridade.

**Risco:** Moderado; preferência pode ser aplicada fora de contexto ou confundida com permissão.

**Necessidade de autorização:** Usuário deve fornecer ou confirmar a preferência.

**Possibilidade de validação:** Demonstrar aplicação no escopo correto e permitir inspeção.

**Reversível:** Reversível por correção ou exclusão.

---

## AD-05 — Atualizar conhecimento controlado

**Propósito:** Incorporar informação nova ou corrigida com proveniência e governança.

**Entrada:** Informação, fonte, validade, escopo, confiança e autorização.

**Saída:** Conhecimento adicionado, substituído, marcado como conflitante ou rejeitado.

**Efeitos possíveis:** Influenciar tarefas futuras.

**Risco:** Alto; conhecimento incorreto pode propagar erros.

**Necessidade de autorização:** Fonte e escopo devem ser permitidos; alterações críticas exigem revisão.

**Possibilidade de validação:** Conferir fonte, consistência, validade e comportamento posterior.

**Reversível:** Condicionalmente reversível se houver versionamento e proveniência.

---

## AD-06 — Propor melhoria de estratégia ou capacidade

**Propósito:** Identificar padrão de falha ou oportunidade de melhoria sem modificar automaticamente código, política ou autoridade.

**Entrada:** Evidências de execuções, feedback, métricas, falhas e contexto.

**Saída:** Proposta de mudança, justificativa, impacto e evidências.

**Efeitos possíveis:** Nenhum efeito operacional até revisão humana e processo separado.

**Risco:** Moderado na proposta; crítico se aplicado automaticamente.

**Necessidade de autorização:** Proposta pode ser gerada dentro de avaliação; qualquer alteração exige processo explícito.

**Possibilidade de validação:** Comparar evidências, testar em ambiente controlado e revisar impacto.

**Reversível:** A proposta é descartável; implementação futura precisará de reversão própria.

---

## 12. Composição de capacidades

Casos de uso não devem ser tratados automaticamente como capacidades do núcleo.

Eles normalmente compõem capacidades menores.

### Pesquisa

Pode combinar:

- PA-04 Consultar fonte externa;
- IA-01 Extrair;
- IA-03 Comparar e relacionar;
- IA-05 Avaliar proveniência;
- FO-01 Sintetizar;
- CM-03 Apresentar resultado.

### Planejamento pessoal

Pode combinar:

- PA-02 Observar estado;
- IA-04 Detectar conflito;
- FO-03 Gerar alternativas;
- FO-04 Planejar;
- FO-05 Recomendar;
- CM-03 Apresentar resultado.

### Documentos → resultado estruturado

Pode combinar:

- PA-03 Ler recurso;
- IA-01 Extrair;
- IA-03 Comparar;
- IA-04 Detectar lacunas;
- FO-01 Sintetizar;
- FO-06 Criar rascunho;
- AG-01 Criar recurso;
- CM-03 Apresentar resultado.

### Automação condicionada

Pode combinar:

- PA-05 Capturar evento;
- MO-03 Avaliar condição;
- IA-06 Avaliar risco;
- CM-02 Solicitar aprovação;
- AG-05 Invocar operação externa;
- MO-01 Acompanhar tarefa;
- CD-06 Direcionar recuperação.

Essas composições são exemplos conceituais, não fluxos implementados.

---

## 13. Capacidades explicitamente excluídas

O modelo não reconhece como capacidades legítimas:

- conceder permissão a si próprio;
- alterar políticas autonomamente;
- ocultar ação ou evidência;
- apagar auditoria;
- ignorar cancelamento;
- persistir tudo automaticamente;
- transformar preferência em autorização;
- instalar código ou ferramenta sem processo autorizado;
- ampliar escopo silenciosamente;
- executar ação proibida para atingir um objetivo;
- alterar memória sem governança;
- comunicar-se externamente sem identidade e autoridade;
- declarar sucesso sem validação.

Esses comportamentos violam a identidade do produto.

---

## 14. O que pertence ao núcleo conceitual

O núcleo provavelmente precisa compreender, para qualquer capacidade:

- identidade;
- propósito;
- entradas;
- saídas;
- recursos;
- efeitos possíveis;
- estado;
- riscos;
- autorização necessária;
- evidências;
- falhas;
- possibilidade de validação;
- reversibilidade;
- duração e escopo.

Isso não significa que exista uma única representação técnica para todos esses elementos.

---

## 15. O que permanece específico

Devem permanecer fora do núcleo:

- ferramentas;
- formatos;
- APIs;
- comandos;
- modelos;
- regras de domínio;
- critérios especializados;
- validadores especializados;
- protocolos;
- interfaces;
- parâmetros técnicos;
- estratégias de retry;
- estratégias de compensação.

Esses elementos pertencem a capacidades concretas e futuras implementações.

---

## 16. Estado após esta taxonomia

Esta taxonomia:

- define linguagem conceitual para comportamentos;
- permite comparar capacidades por efeito e risco;
- preserva separação entre capacidade e autoridade;
- não define ferramentas;
- não escolhe bibliotecas;
- não define arquitetura;
- não autoriza implementação.

As capacidades deverão ser testadas contra casos reais antes de seus contratos serem considerados estáveis.
