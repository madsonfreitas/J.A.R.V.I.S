# ADR-005 — Usar uma CLI supervisionada como interface inicial

## Contexto

O primeiro usuário é técnico e o objetivo atual é validar comportamento, autoridade, estado e resultado, não projetar a interface final do produto.

O fluxo precisa combinar linguagem natural com confirmações estruturadas.

## Problema

Precisamos de uma interface pequena que permita intenção, esclarecimento, aprovação, cancelamento, preview e resultado sem introduzir frontend, servidor ou empacotamento desktop.

## Opções consideradas

1. CLI supervisionada.
2. Interface web local.
3. Aplicação desktop.
4. Chat puro.
5. Voz.

## Decisão

Usar uma CLI supervisionada com:

- entrada de intenção em texto;
- objetivo exibido para confirmação;
- perguntas agrupadas;
- aprovações explícitas;
- estado visível;
- cancelamento;
- preview;
- confirmação do destino;
- resumo de evidências.

## Justificativa

- menor esforço;
- adequada ao fundador;
- facilita depuração e observação;
- não exige servidor;
- permite separar conversa, aprovação e cancelamento;
- é substituível por outra interface.

## Consequências

### Positivas

- ciclo curto de desenvolvimento;
- fluxo transparente;
- testes simples;
- baixo custo;
- foco no núcleo.

### Negativas

- não valida UX para público geral;
- visualização documental é limitada;
- não valida residência, voz ou mobile;
- pode exigir familiaridade com terminal.

## Alternativas rejeitadas

- **Web local:** melhor visualização, mas aumenta escopo.
- **Desktop:** empacotamento e permissões são prematuros.
- **Chat puro:** mistura intenção, conteúdo e aprovação.
- **Voz:** não pertence ao primeiro experimento.

## Reversibilidade

Altamente reversível se a interface depender apenas do contrato de interação.

Deve ser revista se o participante não for técnico ou se a CLI impedir a avaliação de proveniência e aprovação.
