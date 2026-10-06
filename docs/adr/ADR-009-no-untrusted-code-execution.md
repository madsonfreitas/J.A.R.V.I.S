# ADR-009 — Proibir execução de código não confiável no primeiro experimento

## Contexto

O primeiro experimento apenas lê fontes autorizadas, produz rascunho e cria um novo artefato.

Não existe requisito de shell, comandos, macros, código dinâmico ou conteúdo ativo.

## Problema

Introduzir execução de código exigiria isolamento, limites de recursos, controle de rede, credenciais e recuperação que não ajudam a validar o experimento atual.

## Opções consideradas

1. Proibir execução de código e conteúdo ativo.
2. Executar no mesmo processo.
3. Processo isolado.
4. Contêiner.
5. Máquina virtual.

## Decisão

Não executar:

- shell;
- comandos genéricos;
- código fornecido pelo usuário;
- código encontrado em documentos;
- macros;
- conteúdo ativo;
- plugins dinâmicos.

Não adicionar sandbox nesta etapa porque não haverá capability de execução de código.

Se uma fonte exigir execução para ser processada, o experimento deve interromper até existir nova especificação de segurança.

## Justificativa

- elimina superfície de ataque desnecessária;
- evita falsa confiança em sandbox;
- reduz dependências e operação;
- mantém o experimento focado;
- preserva menor privilégio.

## Consequências

### Positivas

- menor risco;
- nenhuma infraestrutura de isolamento;
- regras mais fáceis de auditar;
- capacidades iniciais mais previsíveis.

### Negativas

- alguns formatos não poderão ser processados;
- não testa capability de execução;
- limita automações e desenvolvimento;
- sandbox continua não validada.

## Alternativas rejeitadas

- **Mesmo processo:** risco inaceitável.
- **Processo isolado:** não há necessidade que justifique.
- **Contêiner:** complexidade operacional prematura.
- **Máquina virtual:** custo muito superior ao experimento.

## Reversibilidade

Reversível somente após:

1. especificar a capability de execução;
2. realizar threat model;
3. definir recursos, rede, credenciais e persistência;
4. escolher isolamento proporcional;
5. criar testes de escape e efeitos;
6. registrar novo ADR.
