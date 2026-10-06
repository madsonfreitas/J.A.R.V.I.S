# ADR-008 — Registrar execuções localmente sem plataforma de observabilidade

## Contexto

O experimento precisa medir hipóteses, reconstruir estado, auditar aprovações e investigar falhas.

A arquitetura possui um único processo e não precisa de tracing distribuído.

## Problema

Console simples não produz evidência suficiente, mas uma plataforma externa adicionaria dependência, custo e risco de envio de conteúdo sensível.

## Opções consideradas

1. Somente console.
2. Logs estruturados e registro de execução local.
3. OpenTelemetry com collector e backend.
4. Plataforma SaaS especializada em LLM.
5. Stack completa de métricas, logs e tracing.

## Decisão

Usar:

- logs estruturados locais;
- identificadores de execução e tarefa;
- registro de estado, aprovações, capabilities, efeitos, validações e métricas em SQLite.

Não instalar OpenTelemetry, collector ou plataforma SaaS nesta etapa.

## Justificativa

- atende às perguntas do experimento;
- reduz lock-in;
- evita envio de prompts e documentos;
- não introduz infraestrutura;
- diferencia telemetria de evidência e memória.

## Consequências

### Positivas

- baixo custo;
- dados locais;
- correlação suficiente;
- métricas consultáveis;
- política de minimização controlada pelo projeto.

### Negativas

- visualização inicial limitada;
- schema de eventos precisa ser mantido;
- não existe tracing distribuído;
- análises poderão exigir consultas próprias.

## Alternativas rejeitadas

- **Console:** insuficiente para avaliação reproduzível.
- **OpenTelemetry agora:** útil, mas não necessário em processo único.
- **SaaS de LLM:** aumenta exposição e lock-in.
- **Stack completa:** operação desproporcional.

## Reversibilidade

Altamente reversível.

OpenTelemetry ou outro backend pode ser adicionado se surgirem múltiplos processos, operação prolongada ou necessidade de exportação padronizada.

Os IDs e eventos mínimos devem facilitar essa evolução.
