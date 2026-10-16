# J.A.R.V.I.S. — Persistence, Privacy and Synchronization Architecture

**Stage:** 21
**Natureza:** investigação e especificação. Nenhum código de produção, integração, memória, migração ou sincronização foi implementado.
**Base verificada:** `src/observability/run-recorder.ts`, `src/config.ts`, `src/index.ts`, `src/documentary/runner.ts`, `src/documentary/files.ts`, `src/documentary/context.ts`, `src/documentary/validator.ts`, `src/documentary/policy.ts`, `src/intelligence/safe-error.ts`, adaptadores em `src/intelligence/`, testes de execução, privacidade, erro e SQLite temporário, `package.json`, `.gitignore`, ADR-004 e o modelo de continuidade já escrito.
**Node declarado:** `package.json`, `engines`, linhas 15–17, `>=24 <25`. A versão efetivamente observada neste ambiente, sem ler `.env`, foi `v24.21.0`.
**Journal do `node:sqlite`:** não verificado. A documentação de tipos local (`@types/node` `24.19.1`, `sqlite.d.ts`) não define `journal_mode`. A implementação `lib/sqlite.js` dessa instalação não está no disco. Nenhuma chamada externa foi feita para completar essa lacuna.

Marcadores usados abaixo:

- **Fato confirmado:** lido no código ou na documentação de tipos local.
- **Inferência:** conclusão a partir desses fatos, sem observação de runtime do journal ou de um banco real.
- **Recomendação:** regra proposta, ainda não implementada.
- **Decisão pendente:** escolha que esta especificação não fecha.

---

## 1. Executive Summary

O SQLite atual é um registro operacional de uma execução documental, não memória deliberada e não autorização. `RunRecorder.start` grava a intenção completa antes da classificação. `sources_inspected` grava caminhos absolutos antes da política de envio. O conteúdo integral das fontes não é argumento de nenhum `record`. Um trecho do rascunho pode reaparecer no evento `validation`. O artefato `.md` é outro destino, no caminho escolhido pelo operador.

Não há exclusão, retenção, criptografia, usuário nem sincronização. `setStatus` atualiza `runs` e insere um evento em duas operações, sem transação explícita. Um processo interrompido pode deixar `finished_at` nulo e pode deixar o status `executing` sem a linha `attempt`.

**Recomendação:** tratar o arquivo local como histórico operacional minimizado. Qualquer remoto futuro, inclusive Supabase, recebe só categorias explicitamente elegíveis e aprovadas. Autenticação remota não autoriza envio a um provider nem repete um efeito `unknown`.

**Classificação desta stage: B.** O modelo é suficiente para orientar a próxima decisão. Não é suficiente para implementar sincronização.

---

## 2. Current Architecture — Verified Findings

**Fato confirmado.** O diretório vem de `JARVIS_DATA_DIR`, padrão `.jarvis`, resolvido em caminho absoluto (`src/config.ts`, `loadConfig`, linhas 11 e 92). O arquivo é sempre `experiment.sqlite` (`src/index.ts`, `runExperiment`, linhas 69–71). `createRunRecorder` cria o diretório com `mkdir` recursivo e sem modo de permissão (`src/observability/run-recorder.ts`, linhas 68–72).

**Fato confirmado.** Há duas tabelas, criadas com `CREATE TABLE IF NOT EXISTS`, sem migração (`RunRecorder` constructor, linhas 11–29):

- `runs`: `id`, `intention`, `status`, `started_at`, `finished_at`, `message`.
- `events`: `id`, `run_id`, `created_at`, `type`, `payload`, com chave estrangeira para `runs.id`.

Não há `BEGIN`, `COMMIT`, `DELETE`, `PRAGMA journal_mode` nem `PRAGMA key`.

**Fato confirmado.** A primeira escrita da execução é a intenção inteira (`ExperimentRunner.run`, linha 67, chamando `RunRecorder.start`, linhas 32–37). Isso ocorre antes de `inspectSources`, de `declarePayloads` e de qualquer confirmação.

**Fato confirmado.** `sources_inspected` grava `id`, `path` absoluto e `sizeBytes` (runner, linhas 89–96), antes de `declarePayloads` (linhas 98–101). O id inclui o nome normalizado e seis caracteres do SHA-256 do caminho (`src/documentary/files.ts`, `toSourceId`, linhas 111–117).

**Fato confirmado.** Classificação e esclarecimentos ficam na `ExperimentPolicy` em memória. Não há `record` desses textos. A negação de envio usa rótulos (`intenção`, `referência de compreensão`, `conteúdo de fonte`, `esclarecimento N`), não o texto classificado (`src/documentary/policy.ts`, `blockedPayloads`, linhas 127–147).

**Fato confirmado.** `perform` só chama `recordAttempt` depois que `CoreRun.attempt` retorna (runner, linhas 484–497). O evento `policy` guarda capability, outcome, motivo, `resource` e `destination` (linhas 505–512). O evento `attempt` guarda ids, flags de Permit e, se o outcome for `failed` ou `unknown`, a mensagem (linhas 513–532). O objeto `Permit` não é serializado. Ele vive no `WeakMap` do processo, como já descrito no modelo de continuidade.

**Fato confirmado.** Para envio externo, `setStatus("executing", proposal.effect)` ocorre dentro de `execute`, antes da chamada e antes de `recordAttempt` (linhas 488–492). Leituras e criação de arquivo não passam por esse `setStatus`. O texto de `effect` dessas propostas é uma frase fixa, não o conteúdo da fonte.

**Fato confirmado.** `context_built` grava avisos e contagem de caracteres (runner, linhas 223–226). Fonte vazia produz aviso com o nome (`src/documentary/context.ts`, `assemble`, linhas 22–24). O conteúdo lido não entra nesse payload.

**Fato confirmado.** `validation` grava `status`, `issues` e `metrics` (runner, linhas 269–273). Fato sem proveniência ou com id inexistente copia `entry.text` para a mensagem (`src/documentary/validator.ts`, `validate`, linhas 43–59). Avisos de lacuna e conflito gravam contagens, não os textos das lacunas (linhas 67–81).

**Fato confirmado.** O efeito persistido é só o da criação do arquivo: ação, caminho, `observed` e um detalhe fixo (runner, linha 320; `files.ts`, `createArtifact`, linhas 102–107). O Markdown em si vai para o caminho autorizado, com `wx` (linhas 79–82). Falha de escrita tenta `unlink`; se a remoção também falha, o resultado é `UnknownEffectError` (linhas 83–96).

**Fato confirmado.** `finish` grava status, mensagem e `finished_at` ( `RunRecorder.finish`, linhas 55–61). Não grava objetivo, rascunho, efeitos nem validação nessa atualização. `index.ts` imprime status, mensagem e `runId` (linhas 50–56). A prévia integral vai ao terminal (`src/interface/cli.ts`, `showPreview`, linhas 58–61).

**Fato confirmado.** Os três adaptadores enviam, depois de `claimPermit`, a intenção, os esclarecimentos e a referência de fontes em `understandIntent`, e o objetivo mais id, nome e conteúdo em `createDraft`. Pontos: `groq-intelligence.ts` linhas 85, 121 e 153; `gemini-intelligence.ts` linhas 71, 109 e 141; `anthropic-intelligence.ts` linhas 57, 92 e 123. O cliente Groq é construído com `maxRetries: 0` e timeout de 180000 ms (`create-intelligence.ts`, linhas 27–32). Ele não fixa `logLevel`.

**Fato confirmado.** Não há `SELECT` de produção, comando de lista, exportação, exclusão de Run ou limpeza. `.gitignore` ignora `.env`, `.jarvis/`, `*.sqlite`, `*.sqlite-shm`, `*.sqlite-wal` e `*.log`. O programa não cria arquivo `*.log`.

**Inferência.** ADR-004 decide “SQLite para estado” e fala em persistência transacional. O código observado não abre transação entre o `UPDATE` de `runs` e o `INSERT` de `events`. O modelo de continuidade (Stage 25) continua correto ao dizer que o processo não reconstrói um `CoreRun` a partir do arquivo. Uma frase daquele modelo ficou desatualizada: o status `executing` de envio externo agora é gravado. Esta stage usa o código atual, não aquela frase.

**Não verificado.** O modo de journal, a criação de WAL, SHM ou journal temporário, e se a chave estrangeira está efetivamente ligada no processo `v24.21.0`. Os tipos locais documentam `enableForeignKeyConstraints` com padrão `true` quando a opção é omitida (`sqlite.d.ts`, linhas 62–77). O aplicativo não passa opções. Isso é documentação de tipos, não uma medição do arquivo.

---

## 3. Data Inventory and Classification

Nenhuma linha desta tabela está implementada como política de sincronização. “Elegibilidade” é **recomendação**.

| Categoria | Fato confirmado hoje | Finalidade | Persistir? | Sensibilidade | Minimização recomendada | Acesso | Retenção proposta | Exclusão | Sincronizar? | Exposição indireta |
|---|---|---|---|---|---|---|---|---|---|---|
| Intenção original | Coluna `runs.intention`, integral, antes da classificação | Saber qual pedido iniciou o Run | Sim, como registro operacional | Alta: pode ser dado pessoal ou secreto | Não copiar para evento redundante. Não tratar o texto como público | Processo local que lê o arquivo | Até exclusão explícita do Run ou do arquivo | Apagar a linha e os eventos do mesmo `run_id`, mais cópias remotas se existirem | Não por padrão | Um remoto que copie `runs` leva o texto mesmo se o envio ao modelo foi negado |
| Mensagens de estado | `runs.message` e evento `status` | Explicar a fase | Sim, frases curtas | Média quando incluem caminho | Frases fixas. Caminho só no evento de efeito ou de inspeção, não repetido em toda mensagem | Local | Igual ao Run | Igual ao Run | Só status e código, sem caminho, se um dia houver remoto | `Artefato criado em ${outputPath}` e erros de inspeção incluem caminho absoluto |
| Caminhos absolutos | `sources_inspected.path`, `policy.resource` na leitura, destino de criação | Provar qual arquivo local foi usado | Sim, no local | Alta: revelam usuário, pasta e nome | Não enviar ao provider como caminho. Não sincronizar | Local | Igual ao Run | Igual ao Run | Não | O id da fonte deriva do nome e de um prefixo do hash do caminho |
| Metadados de fontes | Id, tamanho, nome dentro do caminho, aviso de fonte vazia | Auditoria da inspeção e do contexto | Sim, sem conteúdo | Média | Tamanho e id opaco. Nome só se for indispensável à auditoria local | Local | Igual ao Run | Igual ao Run | Contagem e tamanho, não nome nem caminho | Aviso `A fonte ${nome} está vazia` |
| Eventos de política | Outcome, motivo, capability, resource, destination | Mostrar a decisão, não o payload | Sim | Média por causa de caminhos em `resource` | Motivos já são rótulos. Separar caminho de motivo | Local | Igual ao Run | Igual ao Run | Outcome e capability, sem `resource` de caminho | Destino de modelo é o nome do modelo, não um segredo |
| Attempts e outcomes | Ids, flags de Permit, outcome | Auditoria de uso único e de incerteza | Sim | Baixa, salvo a mensagem de erro anexa | Não gravar o objeto Permit nem o efeito bruto da leitura | Local | Igual ao Run | Igual ao Run | Outcome, attemptId e capability | `permitConsumed` em `unknown` não autoriza outra tentativa |
| Mensagens de erro | `attempt.error` e, no `catch`, `error.message` | Explicar falha ou incerteza | Sim, minimizadas | Alta se a mensagem trouxer chave, URL ou caminho | Uma frase estável mais status ou “tempo esgotado” | Local | Igual ao Run | Igual ao Run | Código estável, nunca a mensagem bruta do SDK | `displayError` na CLI não recebe a lista de chaves |
| Aprovações | Ação e `approved: true`; na criação, o destino | Provar que houve confirmação daquela ação | Sim | Média por causa do destino | Não gravar o texto confirmado nem o conteúdo enviado | Local | Igual ao Run | Igual ao Run | Ação e booleano, sem destino | Aprovar envio não aprova criação, e o inverso também |
| Relatórios de validação | Status, métricas e issues | Qualidade do rascunho | Sim, sem texto de fonte | Alta quando `entry.text` entra na issue | Contagens e códigos. Não persistir `entry.text` | Local | Igual ao Run | Igual ao Run | Status e códigos | O rascunho pode citar a fonte |
| Efeitos observados | Só o efeito da criação | Saber que um arquivo novo foi escrito | Sim | Média: contém o caminho | Detalhe fixo, sem corpo do Markdown | Local | Igual ao Run | Igual ao Run | Ação e `observed`, sem caminho | `observed: true` é auto-relato da escrita, não releitura |
| Artefatos produzidos | Arquivo `.md` no destino autorizado | Entregar o resultado ao operador | Sim, como documento, não como linha | Alta: pode reproduzir fontes | Continuar fora do SQLite. Não copiar o corpo para evento | Quem lê aquele caminho | Decisão do operador sobre o arquivo | Apagar o arquivo não apaga o Run | Não por padrão | Prévia no terminal repete o corpo durante a sessão |
| Dados para recuperação | O que já está no arquivo se o processo morrer | Diagnosticar Run incompleto | Só o já gravado | A mesma das categorias acima | Não inventar um segundo log | Local | Igual ao Run | Não há recuperação automática | Não | Registro incompleto não é consentimento para continuar |
| Memória deliberada | Não existe no código | Fora desta stage | Não | — | Não criar agora | — | — | — | Não | Persistir histórico não cria memória |
| Metadados de sincronização | Não existem | Evitar duplicar eventos no futuro | Só se a sincronização for aprovada | Baixa se forem ids e cursors | Cursor, hash do lote e resultado do envio. Sem payload | Local, e no remoto só o necessário ao protocolo | Enquanto o lote existir | Apagar com o Run | O cursor pode ser remoto; o payload, não por isso | Um cursor não é autorização de reenvio |

**Decisão pendente:** quais dessas recomendações de minimização serão aplicadas ao SQLite atual antes de qualquer remoto.

---

## 4. Local Persistence Model

**Fato confirmado.** O SQLite guarda histórico operacional de Runs no mesmo arquivo. Não é o estado vivo do `CoreRun`. Não é memória. Não é a fonte que o provider lê.

Três papéis, hoje só o primeiro existe de forma parcial:

- **Estado operacional:** o Run em andamento no processo, com política, esclarecimentos e Permit na memória.
- **Histórico:** as linhas que sobrevivem a `close()`.
- **Memória deliberada:** não especificada aqui e não implementada.

**Fato confirmado.** `setStatus` faz `UPDATE` em `runs` e depois `INSERT` em `events` (`run-recorder.ts`, linhas 48–52). Não há transação. **Inferência:** uma interrupção entre as duas operações pode deixar status e evento divergentes.

**Fato confirmado.** Interrupção depois de `start` e antes de `finish` deixa `finished_at` nulo. Interrupção depois do `setStatus("executing")` e antes de `recordAttempt` deixa um Run em `executing` sem o evento `attempt` daquele envio. Isso não distingue “a chamada não começou” de “a chamada pode ter saído”.

**Recomendação:** um Run com `finished_at` nulo é registro incompleto. Ele pode ser diagnosticado. Não pode ser retomado, reenviado nem sincronizado como sucesso. A recuperação permitida é leitura humana do que foi gravado, não uma nova autorização.

**Fato confirmado.** O diretório e o arquivo recebem as permissões do processo e do umask. Não há modo explícito nem criptografia de aplicação. Proteção de disco, proteção de chave e exposição na memória do processo são problemas diferentes. Criptografar o arquivo não esconde a intenção do processo que a possui, nem a prévia no terminal, nem o Markdown.

**Não verificado.** Journal, WAL e arquivos auxiliares. **Impacto:** não dá para afirmar durabilidade nem o conjunto exato de arquivos a apagar além de `experiment.sqlite`. O `.gitignore` apenas evita versionar sufixos conhecidos.

**Recomendação:** sanitizar no ponto em que a mensagem entra no recorder, não só no adaptador. Hoje `uncertainProviderMessage` reduz erro de provider; o `catch` de `run` grava `error.message` cru (runner, linhas 350–352).

**Fato confirmado.** A intenção e os caminhos são persistidos antes da classificação. Isso continua sendo persistência, mesmo quando o provider não recebe o texto.

---

## 5. Privacy and Data Minimization

**Fato confirmado.** Envio ao provider e gravação local obedecem a momentos diferentes. A política pode negar o envio e o SQLite já ter a intenção e os caminhos.

**Recomendação:** minimizar no local o que não serve à auditoria daquela ação.

- Intenção: uma coluna, não uma cópia em cada evento.
- Caminho: evento de inspeção e, quando a ação for sobre arquivo, o `resource` daquela Attempt. Fora dali, não repetir.
- Conteúdo de fonte: não persistir no SQLite. O documento autorizado continua sendo o único corpo.
- Validação: código e contagem. Não o `entry.text`.
- Erro de provider: frase estável, status ou tempo esgotado, sem URL, corpo ou chave.
- Referência enviada ao modelo na compreensão continua opaca. Isso não torna o caminho local opaco.

**Fato confirmado.** O aviso da Groq diz que o programa envia o conteúdo autorizado e não controla a retenção na conta (`runner.ts`, `providerNotice`, linhas 379–382). Não promete exclusão. O aviso do Gemini continua limitado ao Free Tier (linhas 374–377). Nenhum dos dois descreve o SQLite.

**Decisão pendente:** se a intenção completa deve continuar no histórico local quando a classificação posterior for `private` ou `unknown`.

---

## 6. Retention and Deletion

**Fato confirmado.** Não há prazo, `DELETE`, comando de apagar Run, exportação nem verificação de remoção. O único `unlink` é o do artefato cuja escrita falhou e cuja remoção foi possível.

**Recomendação,** ainda não implementada:

- Retenção local do Run: até o operador apagar o arquivo do banco ou, no futuro, um Run identificado. Não há prazo automático enquanto essa escolha não for aprovada.
- Exclusão de um Run: remover a linha em `runs` e os `events` daquele `run_id`. Não apaga o `.md` nem as fontes. Esses são arquivos do operador.
- Exclusão do arquivo `experiment.sqlite` remove o histórico que estiver nele. Não remove journal ou WAL se o runtime os tiver criado. Essa parte segue não verificada.
- Exclusão lógica, exclusão de linhas e remoção do arquivo são operações diferentes. Nenhuma está implementada.
- Não existe “apagar também do provider”. O J.A.R.V.I.S. não controla a retenção da Anthropic, do Gemini nem da Groq.

**Decisão pendente:** prazo, se houver, e se apagar o Run apaga só o SQLite ou também pede confirmação para apagar o Markdown.

---

## 7. Error Handling and Redaction

**Fato confirmado.** `uncertainProviderMessage` não copia a mensagem original. Acrescenta “Tempo esgotado.” para `AbortError`, `TimeoutError` ou construtor `APIConnectionTimeoutError`, ou `Status N.` quando há status HTTP. `redactSensitive` cobre a chave recebida, `Bearer`, `x-api-key`, `sk-ant-` e `AIza` (`src/intelligence/safe-error.ts`, linhas 3–45 e 64–71).

**Fato confirmado.** `index.ts`, linha 92, chama `displayError(error)` sem lista de chaves. Uma chave Groq que não case com aqueles padrões pode permanecer se aparecer numa exceção não tratada.

**Fato confirmado.** Mensagens de inspeção incluem o caminho resolvido (`files.ts`, linhas 18–33) e o `catch` do runner as persiste.

**Recomendação:** uma única função de mensagem persistível, usada por adaptador, `catch` e CLI. Ela não recebe o corpo da fonte nem o prompt. Segredo conhecido é redactado. O que não for reconhecido vira frase genérica, não a mensagem bruta.

**Decisão pendente:** se caminhos em erros de inspeção permanecem no histórico. São úteis para diagnóstico e revelam o ambiente.

---

## 8. Local/Remote Boundary

Quatro responsabilidades. Só as duas primeiras existem no código.

### Core

Intenção em memória, política, confirmação, `Permit`, execução, validação e resultado. Persistência não altera `PolicyDecision` nem amplia o Permit.

### Persistência local

Histórico operacional no SQLite e artefato no caminho autorizado. Recuperação definida por este modelo é diagnóstica: ler um Run incompleto não emite Permit.

### Persistência remota futura

Somente categorias classificadas como elegíveis e cuja sincronização tenha sido autorizada como ação própria. Não é destino automático do arquivo. Não substitui, por esta especificação, o SQLite.

### Providers de IA

Destinos externos já existentes. Continuam sujeitos a `send_intention_to_model` e `send_sources_to_model`. Uma linha remota, uma sessão autenticada ou um bucket não autorizam essas ações e não as repetem.

**Recomendação:** a integração com Supabase não pode chamar adaptador, não pode ler fonte para “completar” um registro e não pode tratar ausência de classificação como permissão de cópia.

---

## 9. Supabase Integration Options

**Fato confirmado.** Não há cliente, schema remoto, variável de projeto nem fluxo Supabase no código. `package.json` não depende dele.

**Finalidade possível,** se um dia for aprovada: consulta e guarda seletiva de histórico entre máquinas, para o operador dono daqueles Runs. Não é memória. Não é fila de reexecução. Não é o canal até a Anthropic, o Gemini ou a Groq.

**Dados que poderiam ser sincronizados,** só depois das decisões da seção 3: status final, capability, outcome, attemptId, códigos de validação e o fato de ter havido aprovação. Sem intenção integral, sem caminho, sem conteúdo, sem `entry.text`, sem erro bruto.

**Dados locais por padrão:** intenção, caminhos, nomes, avisos com nome, Markdown, prévia, classificação, esclarecimentos, chaves e qualquer registro incompleto ou `unknown`.

### Opção A — SQLite operacional e Supabase seletivo

O processo continua lendo e escrevendo só o SQLite. Um passo posterior, autorizado à parte, copia o subconjunto elegível.

Vantagem: o Core e o experimento offline não mudam de fonte de verdade. O remoto não recebe o que a política ainda não classificou para cópia.
Risco: dois lugares podem divergir; exclusão local não apaga o remoto se o protocolo não o disser.
Pré-requisito: lista fechada de colunas elegíveis, identidade do operador e regra de exclusão nos dois lados.
Pendente: quem dispara a cópia e se ela é uma ação com confirmação.

### Opção B — Supabase como persistência principal

O Run passaria a depender da rede para existir.

Vantagem: um só banco remoto e políticas de acesso no servidor.
Risco: intenção e caminhos iriam ao remoto no mesmo momento em que hoje vão ao SQLite, isto é, antes da classificação, a menos que o modelo local mude antes. Falha de rede interromperia a auditoria. O provider continuaria sendo outro destino, mas o histórico sensível já teria saído da máquina.
Pré-requisito: minimização implementada antes da primeira escrita remota, mais um modo offline explícito.
Pendente: o que permanece no disco quando a rede falta.

### Opção C — Híbrida com fronteira explícita

SQLite continua operacional. Supabase guarda projeção já minimizada. A projeção tem identificador do Run e do lote. Não é espelho.

Vantagem: combina A com um contrato de projeção, idempotência e exclusão.
Risco: é o desenho mais fácil de inflar até virar espelho. A fronteira precisa ser uma lista fechada, não “tudo o que for útil”.
Pré-requisito: os mesmos de A, mais cursor e detecção de duplicata.
Pendente: se a projeção é push autorizado ou pull.

**Recomendação, não decisão:** a opção A é a única que preserva os princípios sem exigir que o histórico sensível mude de lugar primeiro. A opção C só se distingue de A quando a projeção e o protocolo existem. A opção B aumenta a exposição antes de existir minimização. A escolha permanece **decisão pendente**. Esta stage não adota fornecedor.

Em qualquer opção, schema remoto, migração, chave de API e política de linha no servidor são trabalho posterior. Credencial de Supabase não entra no repositório, não entra no prompt e não é autoridade de `Permit`.

---

## 10. Identity and Data Isolation

**Fato confirmado.** Não há usuário, sessão, organização nem coluna de provider em `runs`. O isolamento real é o `run_id` dentro de um arquivo. Quem lê o arquivo lê todos os Runs. Várias execuções no mesmo `JARVIS_DATA_DIR` compartilham o arquivo.

**Recomendação:** no remoto, cada linha carrega o identificador do operador dono. Acesso é negado sem esse vínculo. Organização, se existir no futuro, é outra fronteira, não um atalho para ler Runs de outro membro. Papel de leitura não inclui reexecução.

**Decisão pendente:** um operador por instalação local, ou mais de um compartilhando o mesmo `experiment.sqlite`. O código não separa esses casos.

Princípio do menor privilégio no remoto: a chave usada pelo processo só escreve a projeção já aprovada e só lê as linhas daquele operador. Não usa service role no cliente. Não há, hoje, lugar no código para essa chave.

---

## 11. Synchronization Semantics

Nada disto está implementado. São regras propostas para o caso de a sincronização ser aprovada.

- A fonte de verdade operacional permanece o SQLite até uma decisão contrária.
- Sincronização é parcial e explícita. Ausência de marca de sincronização significa “não copiado”, não “autorizado a copiar”.
- Cada lote tem identificador determinístico derivado de `runId` mais a lista de eventos incluídos. Reenviar o mesmo lote é idempotente. Não cria segunda execução.
- Duplicata remota é ignorada. Não dispara provider.
- Conflito entre histórico local e linha remota não se resolve sozinho. Histórico de auditoria não é editável por um cliente para “corrigir” outcome. Correção, se um dia existir, é outro evento.
- Falha de rede no meio do lote deixa o lote incompleto e não copiado. Não completa o restante em silêncio e não marca o Run como sincronizado.
- Registro incompleto (`finished_at` nulo) e outcome `unknown` não entram no lote.
- Exportação, se aprovada, é o mesmo subconjunto elegível, para o operador, sem criar outro canal de reexecução.

---

## 12. Failure, Recovery and Unknown Outcomes

**Fato confirmado.** `unknown` é o outcome quando `execute` lança `UnknownEffectError`. O evento guarda a mensagem sanitizada do provider ou, em outros casos, a mensagem que a exceção trouxe. O adaptador Groq não repete a chamada. Timeout não é sucesso nem falha conhecida.

**Recomendação:**

- Não retomar a Attempt. O Permit antigo não existe mais depois do processo.
- Não agendar retry a partir do SQLite.
- Não sincronizar `unknown`.
- Diagnosticar: `finished_at` nulo, ou status `executing` sem `attempt` correspondente, significa incerteza de gravação. Não significa que a chamada externa não ocorreu.
- `failed` local depois de resposta recebida continua `failed`. Não é reclassificado para facilitar cópia.

**Não verificado.** O que o runtime faz com o arquivo se o processo morre durante o `INSERT`. Sem o journal comprovado, a recuperação não pode prometer que a última operação é atômica.

---

## 13. Security and Adversarial Analysis

| Situação | O que o código faz hoje | O que o modelo exige |
|---|---|---|
| Autenticado tenta ler Run de outro | Não há autenticação nem outro usuário | Remoto futuro nega a linha. Auth não cria Permit |
| Intenção sensível e envio negado | A intenção já está em `runs.intention`; o provider não é chamado se a política nega | Cópia remota não inclui essa coluna por padrão |
| Apagou local e o remoto ainda tem | Não há remoto nem exclusão | Exclusão aprovada precisa nomear os dois destinos. Falha remota deixa a pendência visível, sem fingir que apagou |
| Lote pela metade | Não há lote | Lote incompleto não é sucesso e não é reexecutado contra provider |
| Outcome `unknown` | Uma chamada, registro de incerteza, sem retry | Sincronização não vê isso como trabalho pendente de reenvio |
| Sincronizador tenta repetir efeito externo | Não existe sincronizador | Proibido. Efeito externo só nasce de política, confirmação e Permit novos |
| Erro com credencial | Caminho do provider é reduzido; outros `Error.message` não | Mensagem persistível não carrega segredo |
| Validação incorpora texto da fonte | `entry.text` pode ir ao evento `validation` | Não persistir esse texto. Não sincronizá-lo |
| Caminho revela o ambiente | Caminho absoluto é gravado antes da classificação | Permanecer local |
| Linha remota alterada sem autorização | Não há linha remota | Outcome histórico não é atualizável por escritas anônimas ou de outro operador |
| Registro antigo contra estado atual | Não há merge | Não há merge automático. O estado atual do processo não herda autoridade do arquivo |

Dados, política, consentimento e autoridade continuam separados. O arquivo prova o que foi registrado. A política decide o próximo envio. O consentimento é a confirmação daquela ação. O Permit autoriza uma execução. Nenhum dos quatro substitui o outro.

---

## 14. Relationship with Core Authority

**Fato confirmado.** `CoreRun.attempt` avalia a política, confirma se necessário, emite o Permit e exige consumo. O recorder escreve depois, ou, no caso de `executing`, imediatamente antes da chamada externa, ainda dentro da Attempt já autorizada. Escrever `executing` não é uma segunda autorização.

**Recomendação:** nenhum leitor de SQLite, e nenhum cliente Supabase, chama `understandIntent`, `createDraft`, `readSource` ou `createArtifact`. Recuperação não emite Permit. Memória futura, se um dia for especificada em outra stage, também não emite Permit.

Ausência de linha, de classificação ou de marca de sincronização não é autorização.

---

## 15. Architectural Risks

- Intenção e caminhos já persistidos antes da classificação. Uma sincronização ingênua os exportaria.
- `entry.text` na validação é um canal de conteúdo para o SQLite.
- Duas escritas sem transação e journal não verificado limitam o que se pode afirmar após crash.
- Um arquivo único sem dono não escala para dois operadores sem misturar Runs.
- Tratar Supabase como espelho, ou como banco principal, muda a exposição antes de existir minimização.
- Repetir `unknown` a partir de uma fila remota violaria o Core.
- ADR-004 promete transação e reconstrução que o código não faz. Implementar remoto em cima dessa leitura do ADR repetiria a folga.
- Criptografia de disco, se aprovada depois, não resolve prévia, Markdown nem processo em execução.

---

## 16. Open Questions

1. A intenção completa continua no SQLite quando o envio é negado?
2. Caminhos absolutos continuam no histórico local?
3. `entry.text` sai do evento `validation`?
4. Há prazo de retenção ou só exclusão manual?
5. Apagar o Run apaga o Markdown?
6. A primeira integração remota, se existir, é A, B ou C?
7. Quem dispara a cópia: uma ação confirmada ou um processo separado?
8. Um ou vários operadores por arquivo local?
9. Qual frase de erro é segura para caminho de inspeção?
10. O journal de `v24.21.0` precisa ser medido antes de prometer recuperação?

Nenhuma destas perguntas foi respondida por esta stage.

---

## 17. Proposed Invariants

1. Persistência não é memória deliberada.
2. Persistência não é autorização.
3. Autenticação não é consentimento para envio ou para reexecução.
4. Acesso ao arquivo não é permissão para compartilhá-lo.
5. Dado local não é elegível para sincronização por existir.
6. Contexto e histórico não concedem autoridade.
7. Permit continua limitado à ação em que foi emitido. O banco não o amplia nem o reconstitui.
8. `unknown` não provoca repetição automática de efeito externo, local ou remotamente.
9. Conteúdo de fonte não é coluna de SQLite. Texto de rascunho não entra em issue persistida.
10. Intenção e caminho gravados antes da política continuam dados persistidos, não dados públicos.
11. Run incompleto pode ser lido e não pode ser continuado.
12. Ausência de classificação, de linha ou de cursor não é autorização.
13. Provider de IA e armazenamento remoto são destinos diferentes, cada um com a própria ação.
14. O modelo não depende de um fornecedor remoto para o Core funcionar.
15. Exclusão local não afirma exclusão remota, e o inverso também, enquanto os dois existirem.

---

## 18. Implementation Boundary

Dentro de uma implementação futura, e só depois das decisões: minimização das escritas já existentes, transação ou equivalente comprovado entre status e evento, exclusão explícita de Run, e mensagens de erro persistíveis.

Fora desta stage e fora dessa implementação mínima: cliente Supabase, schema remoto, login, organização, fila, memória, roteador de providers, retry, criptografia apresentada como solução única, e qualquer leitura de banco real ou de `.env`.

Este documento não altera `src/`, testes, `package.json`, `.gitignore` nem configuração.

---

## 19. Recommended Next Stage

**Recomendação:** uma stage curta de decisões, não de integração. Fechar as perguntas 1–5 e 9 da seção 16. Só então especificar a minimização local. Medir o journal de `v24.21.0` numa base temporária, sem abrir banco real do operador, antes de escrever garantia de crash.

Supabase, se ainda for desejado, vem depois da minimização e da escolha explícita entre A, B e C. Não é a próxima implementação.

---

## 20. Acceptance Criteria

Esta stage está aceita como especificação B quando:

- O documento distingue fato, inferência, recomendação e decisão pendente.
- Nenhuma frase afirma que o journal foi comprovado.
- Nenhuma frase afirma que Supabase já é a fonte de verdade ou que substitui o SQLite.
- Persistência, autenticação e sincronização não são descritas como autorização.
- `unknown` permanece fora de retry e fora de sincronização.
- O único arquivo produzido por esta stage é este documento.

Não está aceita como autorização para codar. A implementação futura só começa depois que as decisões pendentes forem aprovadas e o escopo for limitado à fronteira da seção 18.
