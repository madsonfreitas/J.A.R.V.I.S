# ADR-003 — Usar um único modelo atrás de um adaptador estreito

## Contexto

O primeiro experimento precisa de compreensão, extração, síntese e geração estruturada.

Nenhum modelo foi avaliado no corpus do J.A.R.V.I.S., e a arquitetura não possui necessidade comprovada de roteamento entre modelos.

## Problema

Precisamos integrar inteligência probabilística sem transformar o fornecedor no núcleo, criar abstração multimodelo prematura ou escolher um modelo apenas por especificações comerciais.

## Opções consideradas

1. SDK oficial de um fornecedor atrás de adaptador interno.
2. Chamar SDK oficial diretamente em todo o código.
3. Gateway ou roteador multimodelo.
4. Múltiplos modelos especializados desde o início.
5. Modelo local.

## Decisão

Usar um único modelo hospedado, acessado por SDK oficial e isolado atrás de um adaptador estreito.

O modelo será escolhido por benchmark sobre o corpus do experimento. Claude Sonnet 5 será apenas o baseline inicial da comparação, não uma escolha definitiva.

Uma versão ou snapshot deverá ser fixada durante a execução do experimento.

## Justificativa

- reduz variáveis;
- permite medir qualidade, custo e latência;
- limita lock-in ao adaptador;
- evita roteamento e fallback prematuros;
- mantém saídas do modelo como propostas;
- permite substituir fornecedor sem alterar contratos do núcleo.

## Consequências

### Positivas

- integração inicial simples;
- resultados comparáveis;
- custo mensurável;
- comportamento mais reproduzível;
- nenhum framework agentivo necessário.

### Negativas

- indisponibilidade do fornecedor interrompe o experimento;
- não existe fallback automático;
- recursos específicos do modelo não podem vazar para o núcleo;
- benchmark precisa ser criado antes do fluxo completo.

## Alternativas rejeitadas

- **SDK espalhado pelo código:** aumentaria lock-in.
- **Roteador multimodelo:** não existe necessidade de roteamento.
- **Múltiplos modelos:** adicionariam custo e dificuldade de atribuir resultados.
- **Modelo local:** adicionaria hardware, operação e uma variável relevante de qualidade.

## Reversibilidade

Altamente reversível se o adaptador permanecer estreito e os tipos do fornecedor não entrarem no núcleo.

Trocar o modelo exige repetir o corpus e registrar nova versão, custo, latência e limitações.
