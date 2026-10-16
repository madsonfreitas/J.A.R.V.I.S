# ADR-010 — Persistência local, privacidade e journal do SQLite

## Contexto

A Stage 21 (`968d3ef`) deixou dez decisões em aberto e não verificou o journal do `node:sqlite`. Este registro fecha essas decisões e anexa a medição feita com `new DatabaseSync(path)`, sem opções, como `RunRecorder` abre o banco. Nada disto está implementado.

## Decisões

- **D1.** A intenção completa permanece em `runs.intention`, só no SQLite local, mesmo se o envio ao provider for negado. Padrões conhecidos de segredo são redigidos antes de gravar. Não é copiada para eventos nem sincronizada. Justificativa: o histórico local precisa do pedido; o provider e qualquer remoto não.
- **D2.** Caminhos absolutos permanecem só em `sources_inspected` e no `resource` da Attempt, localmente. Não vão ao provider como caminho nem são sincronizados. Justificativa: identificam o arquivo usado sem ampliar o envio.
- **D3.** O evento `validation` persiste `status`, `metrics` e, por issue, só `code` e `severity`. `entry.text` e `message` não entram no SQLite. O Markdown segue como hoje. Justificativa: o relatório não pode ser um segundo corpo da fonte.
- **D4.** Retenção só por exclusão manual. Não há prazo automático. Justificativa: não inventar apagamento sem um comando explícito.
- **D5.** Excluir um Run remove a linha de `runs` e os `events` do mesmo `run_id`. Não toca o Markdown, as fontes nem qualquer arquivo fora do banco. Justificativa: o documento do operador não é linha de auditoria.
- **D6.** Direção: opção A. SQLite local; remoto, se existir, é projeção seletiva. Nenhum trabalho de Supabase, schema remoto ou sincronização entra antes de uma necessidade concreta de produto. Justificativa: o histórico sensível não muda de lugar antes da minimização.
- **D7.** Se a cópia remota existir, quem a dispara é uma ação confirmada pelo operador, nunca um processo em segundo plano. Justificativa: cópia é efeito, não rotina.
- **D8.** Um operador por instalação e por arquivo local. Multioperador está fora de escopo. Justificativa: o arquivo não tem dono.
- **D9.** Mensagens persistidas não contêm caminho absoluto (só o nome do arquivo), nem segredo, nem corpo de fonte, nem mensagem bruta de SDK. Erro não reconhecido vira frase genérica. A exibição no terminal do operador não é restringida. Justificativa: o banco dura mais do que a sessão.
- **D10.** O journal de `v24.21.0` é medido antes de qualquer promessa de recuperação. Justificativa: o tipo local não documenta `journal_mode`.

Decisões adicionais para a Stage 23:

- `start`, `setStatus` e `finish` gravam `runs` e `events` na mesma transação. A medição abaixo mostra que, neste runtime, `BEGIN` seguido de morte do processo antes do `COMMIT` não conservou o `UPDATE`.
- O diretório de dados é criado com modo `0o700`. No Windows o efeito desse modo é limitado.
- Uma única função de mensagem persistível substitui os usos crus de `error.message` no que for gravado.

## Medições

Comando: `node C:\Users\Administradorr\AppData\Local\Temp\jarvis-journal-measure.mjs`. Banco só em diretório temporário. Resultado real:

- `node --version`: `v24.21.0`.
- `PRAGMA journal_mode`: `delete`. `PRAGMA synchronous`: `2`. `PRAGMA foreign_keys`: `1`.
- Arquivos: vazio antes de abrir; depois de `INSERT`/`UPDATE` com o banco aberto, só `experiment.sqlite`; durante `BEGIN` não confirmado, `experiment.sqlite` e `experiment.sqlite-journal`; depois de `close()`, o `-journal` desse arquivo não estava mais na lista.
- Sem transação, `UPDATE` e em seguida um `INSERT` inválido: o status ficou `kept`.
- Com `BEGIN`, o mesmo `INSERT` inválido e `ROLLBACK`: o status voltou a `received`.
- Processo filho morto com `SIGKILL` depois do `UPDATE` e antes do `INSERT`: sem transação, o status reaberto foi `mid` e havia 0 eventos; com `BEGIN` e sem `COMMIT`, o status reaberto foi `received`, 0 eventos, e `crash.sqlite-journal` ainda estava no diretório no momento da saída.
- `INSERT` em `events` com `run_id` inexistente foi rejeitado (`inserted: false`).

Não verificado: queda de energia, outro sistema operacional, e se o modo `0o700` altera ACL no Windows.

## Consequências

A Stage 23 pode usar transação para o par status/evento neste runtime, sem prometer recuperação geral além do que foi medido. O `.gitignore` deve passar a incluir `*.sqlite-journal`, porque esse arquivo apareceu. Chave estrangeira já vem ligada com `new DatabaseSync(path)`.

## Escopo da Stage 23

1. Transação em `start`, `setStatus` e `finish`.
2. Função única de mensagem persistível e uso dela onde o runner grava erro, inclusive inspeção.
3. Evento `validation` só com `status`, `metrics`, `code` e `severity`.
4. Redação de segredo conhecido antes de gravar a intenção.
5. `RunRecorder.deleteRun(runId)`, só linhas do banco, sem CLI.
6. `mkdir` do diretório de dados com `mode: 0o700`.
7. `*.sqlite-journal` no `.gitignore`.
8. Testes temporários: atomicidade, `deleteRun`, Run sem `finish`, marca de fonte/rascunho ausente do SQLite, caminho ausente das mensagens persistidas, segredo redigido na intenção.

## Fora de escopo

Supabase, sincronização, multioperador, memória, retry, criptografia, novas tabelas, recuperação automática e comando de exclusão na CLI.
