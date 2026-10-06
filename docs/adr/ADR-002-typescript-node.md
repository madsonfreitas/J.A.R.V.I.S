# ADR-002 — Usar TypeScript estrito com Node.js LTS

## Contexto

A arquitetura inicial possui contratos explícitos, estados de tarefa, integrações de IA, CLI, validação de fronteiras e operações predominantemente orientadas a I/O.

## Problema

Precisamos de uma linguagem e runtime maduros que permitam implementar o experimento com baixo custo, boa modelagem de contratos e possibilidade de evolução sem otimizar performance inexistente.

## Opções consideradas

1. TypeScript com Node.js LTS.
2. Python com CPython.
3. C# com .NET.
4. Go.
5. TypeScript com Bun ou Deno.

## Decisão

Usar TypeScript em modo estrito sobre Node.js 24 LTS, com a versão exata fixada no projeto.

Dados recebidos em fronteiras deverão ser validados em runtime; os tipos TypeScript não serão tratados como validação suficiente.

## Justificativa

- bom equilíbrio entre contratos e velocidade;
- SDKs maduros para provedores de IA;
- adequado a CLI e eventual interface web;
- runtime LTS estável;
- bom suporte no Windows;
- performance suficiente;
- uma linguagem pode atender diferentes interfaces futuras.

## Consequências

### Positivas

- estados e contratos podem ser modelados explicitamente;
- ecossistema amplo;
- baixo custo operacional;
- futura interface web pode compartilhar linguagem e tipos internos controlados.

### Negativas

- tipos são apagados em runtime;
- validação de entrada continua obrigatória;
- JavaScript assíncrono exige disciplina;
- troca posterior de linguagem teria custo elevado.

## Alternativas rejeitadas

- **Python:** excelente alternativa, mas a proposta atual prioriza contratos estritos e evolução de interface.
- **C#/.NET:** robusto, porém adiciona estrutura além do necessário no primeiro experimento.
- **Go:** performance e distribuição são superiores à necessidade atual; ecossistema de IA é menos conveniente.
- **Bun/Deno:** benefícios não compensam menor maturidade e risco de compatibilidade neste estágio.

## Reversibilidade

A decisão é moderadamente reversível e cara no nível da aplicação.

Deve ser revisada antes da implementação se o conjunto mínimo de formatos exigir bibliotecas disponíveis apenas ou significativamente melhores em Python.

Contratos independentes de SDK e formatos abertos de persistência reduzem o custo de uma futura migração.
