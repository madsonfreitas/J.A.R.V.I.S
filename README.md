# J.A.R.V.I.S.

Primeiro vertical slice experimental do ciclo:

```text
INTENÇÃO
→ COMPREENSÃO
→ CONTEXTO
→ CAPACIDADE
→ POLÍTICA/PERMISSÃO
→ EXECUÇÃO
→ VALIDAÇÃO
→ RESULTADO
```

## Escopo

Esta versão:

- recebe uma intenção por CLI;
- lê fontes `.txt` e `.md` explicitamente autorizadas;
- usa um único modelo por adaptador;
- produz um rascunho estruturado com proveniência;
- exige aprovação antes de enviar conteúdo ao provedor;
- exige aprovação antes de criar o artefato final;
- nunca sobrescreve um arquivo existente;
- registra estados e evidências mínimas em SQLite.

Ela não possui memória persistente, web, MCP, execução de código, shell, multiagentes ou automações externas.

## Requisitos

- Node.js 24 LTS no PATH da sessão (`node` e `npm` disponíveis no terminal);
- chave da Anthropic em `ANTHROPIC_API_KEY` (ambiente ou `.env` local);
- documentos não sensíveis, sintéticos ou explicitamente autorizados.

## Configuração

Defina as variáveis documentadas em `.env.example` no ambiente do processo.

Obrigatória:

- `ANTHROPIC_API_KEY`

Opcional:

- `JARVIS_MODEL` (padrão: `claude-sonnet-5`)
- `JARVIS_DATA_DIR` (padrão: `.jarvis`)

Um arquivo `.env` local é lido se existir. O modelo configurado é um baseline experimental, não uma escolha definitiva.

## Comandos

```text
npm install
npm run typecheck
npm test
npm run dev -- --intention "Produza um resumo operacional" --source notas.txt --source ata.md
```

## Segurança

- Não use documentos contendo secrets.
- O conteúdo autorizado será enviado ao provedor de IA somente após confirmação.
- Instruções encontradas nos documentos são tratadas como dados não confiáveis.
- Apenas arquivos `.txt` e `.md` são aceitos.
- O resultado é criado com semântica `create-only`; destinos existentes são recusados.

Consulte `EXPERIMENT_02_SPEC.md` e os ADRs em `docs/adr/` para os limites completos.
