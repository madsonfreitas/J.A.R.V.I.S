# ADR-007 — Não implementar memória persistente no primeiro experimento

## Contexto

O experimento precisa validar intenção, contexto, autoridade, execução e resultado.

Ele pode operar com contexto e estado limitados à tarefa. As hipóteses sobre memória de longo prazo ainda não foram testadas.

## Problema

Adicionar memória persistente introduziria retenção, privacidade, recuperação, correção, remoção e contaminação entre tarefas antes de demonstrar necessidade.

## Opções consideradas

1. Contexto temporário e registro de evidências.
2. Histórico reutilizado automaticamente.
3. Memória pessoal persistente.
4. Banco vetorial.
5. Knowledge graph.

## Decisão

Usar somente:

- contexto temporário da tarefa;
- estado necessário à execução;
- registro do experimento para auditoria e métricas.

O registro do experimento não será usado para personalização ou contexto automático de novas tarefas.

## Justificativa

- isola as hipóteses do núcleo;
- reduz privacidade e retenção;
- evita decisões tecnológicas prematuras;
- impede contaminação entre execuções;
- mantém `MEMORY-06` testável.

## Consequências

### Positivas

- arquitetura menor;
- menor risco de dados;
- execuções independentes;
- resultados mais fáceis de atribuir ao comportamento atual.

### Negativas

- usuário pode repetir informações;
- continuidade entre execuções não será validada;
- preferências não serão reaproveitadas;
- o experimento não comprova o segundo cérebro de longo prazo.

## Alternativas rejeitadas

- **Histórico automático:** mistura auditoria e contexto.
- **Memória persistente:** hipóteses e governança ainda não testadas.
- **Banco vetorial:** não existe volume ou recuperação semântica comprovada.
- **Knowledge graph:** relações persistentes complexas não são requisito.

## Reversibilidade

Altamente reversível.

Memória poderá ser adicionada como componente separado após especificar finalidade, escopo, validade, correção, remoção e critérios de valor.
