# ADR-004 — Usar SQLite para estado e sistema de arquivos para artefatos

## Contexto

O experimento precisa registrar tarefas, aprovações, tentativas, efeitos, validações, métricas e feedback.

As fontes e os resultados são documentos e artefatos explicitamente identificáveis. Não há concorrência distribuída nem memória pessoal.

## Problema

Precisamos de persistência transacional e consultável sem operar um servidor ou transformar documentos em registros internos desnecessários.

## Opções consideradas

1. Arquivos JSON ou JSONL.
2. SQLite.
3. PostgreSQL.
4. Banco documental.
5. Armazenar tudo no sistema de arquivos.

## Decisão

Usar SQLite para estado, evidências e métricas.

Manter fontes e artefatos no sistema de arquivos, armazenando no banco apenas referências e metadados necessários.

Não adotar ORM inicialmente.

## Justificativa

- SQLite é embutido e transacional;
- não exige servidor;
- oferece integridade superior a JSONL;
- é adequado ao volume e à concorrência do experimento;
- documentos continuam visíveis e independentes;
- SQL e exportação reduzem lock-in.

## Consequências

### Positivas

- operação simples;
- um arquivo de banco;
- transações;
- consultas de métricas;
- reconstrução de estado;
- baixo custo.

### Negativas

- concorrência de escrita limitada;
- proteção depende do processo e do sistema de arquivos;
- não atende múltiplas instâncias distribuídas;
- migrações continuam necessárias.

## Alternativas rejeitadas

- **JSON/JSONL:** simples, mas frágil para estado e integridade.
- **PostgreSQL:** exige servidor e administração sem necessidade atual.
- **Banco documental:** flexibilidade não resolve os contratos e adiciona infraestrutura.
- **Somente arquivos:** dificulta consultas, transações e consistência.

## Reversibilidade

Reversível por exportação e migração de schema.

Deve ser revista quando existirem múltiplos usuários concorrentes, acesso remoto, múltiplas instâncias ou requisitos de alta disponibilidade.
