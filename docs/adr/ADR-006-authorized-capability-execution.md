# ADR-006 — Separar proposta, autoridade, execução e validação

## Contexto

O modelo comportamental distingue capability, access, authority, consent, policy, execution e validation.

O modelo de IA é probabilístico e documentos podem conter instruções não confiáveis.

## Problema

Permitir que o modelo chame ferramentas diretamente misturaria compreensão, autoridade, efeito e confirmação de sucesso.

Precisamos executar capacidades sem permitir autoautorização ou falsa conclusão.

## Opções consideradas

1. Tool calling direto do modelo.
2. Framework agentivo com loop automático.
3. Proposta estruturada → guardião de autoridade → executor → validador.
4. MCP como requisito do núcleo.
5. Shell ou subprocessos genéricos.

## Decisão

Adotar o fluxo:

```text
MODELO PROPÕE
→ NÚCLEO NORMALIZA
→ AUTORIDADE AVALIA
→ EXECUTOR INVOCA CAPABILITY ALLOWLISTED
→ EFEITO É OBSERVADO
→ VALIDADOR AVALIA
```

As capabilities iniciais serão estáticas, explícitas e executadas em processo.

O modelo não chamará ferramentas diretamente. MCP, shell, plugins dinâmicos e framework agentivo não serão usados.

## Justificativa

- preserva separação de autoridade;
- facilita testes;
- reduz tool injection;
- torna efeitos rastreáveis;
- permite bloquear parâmetros alterados;
- impede que retorno da ferramenta seja tratado como conclusão.

## Consequências

### Positivas

- comportamento previsível;
- política testável;
- executor substituível;
- validação independente;
- catálogo pequeno e auditável.

### Negativas

- mais código de coordenação;
- novas capabilities exigem alteração explícita;
- não existe descoberta dinâmica;
- validação precisa ser modelada por capability.

## Alternativas rejeitadas

- **Tool calling direto:** mistura proposta e execução.
- **Framework agentivo:** oculta ciclo e adiciona abstrações.
- **MCP:** não é necessário para poucas capabilities locais.
- **Shell genérico:** superfície de efeito ampla demais.
- **Plugins:** extensibilidade ainda não foi comprovada.

## Reversibilidade

Adaptadores em processo podem ser substituídos por outros transportes no futuro.

A separação entre proposta, autoridade, execução e validação é uma restrição de segurança e não deve ser removida, mesmo que a tecnologia mude.
