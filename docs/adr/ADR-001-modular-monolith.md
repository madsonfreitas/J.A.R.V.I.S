# ADR-001 — Adotar um monólito modular para o primeiro experimento

## Contexto

O J.A.R.V.I.S. está no início e precisa validar um único fluxo supervisionado: intenção, contexto, autorização, execução, validação e resultado.

Ainda não existem usuários concorrentes, escala, equipes independentes ou necessidades diferentes de implantação.

## Problema

Precisamos separar responsabilidades importantes sem introduzir distribuição, infraestrutura e coordenação operacional antes de comprovar valor.

## Opções consideradas

1. Script único sem limites internos.
2. Aplicação única com módulos e contratos explícitos.
3. Microserviços.
4. Workflow engine externo.
5. Sistema distribuído orientado a eventos.

## Decisão

Adotar uma única aplicação implantável, organizada como monólito modular.

Os componentes são separações lógicas dentro do mesmo processo. Eles não serão serviços independentes.

## Justificativa

- cobre todo o primeiro experimento;
- mantém execução e depuração simples;
- evita rede e consistência distribuída;
- permite testar contratos;
- reduz custo operacional;
- deixa limites claros sem superengenharia.

## Consequências

### Positivas

- desenvolvimento e testes mais simples;
- rastreabilidade ponta a ponta;
- implantação única;
- refatoração interna barata;
- menor quantidade de falhas operacionais.

### Negativas

- componentes compartilham processo;
- isolamento de falhas é menor;
- disciplina modular precisa ser mantida pelo código e pelos testes;
- escala independente não existe.

## Alternativas rejeitadas

- **Script sem módulos:** dificultaria autoridade, validação e evolução.
- **Microserviços:** não há escala nem implantação independente que os justifique.
- **Workflow engine:** adicionaria modelo e infraestrutura externos.
- **Event bus:** o experimento é síncrono e supervisionado.

## Reversibilidade

Reversível por extração gradual de componentes se surgirem necessidades comprovadas de escala, isolamento, disponibilidade ou implantação independente.

Os contratos internos devem ser preservados para reduzir o custo dessa mudança.
