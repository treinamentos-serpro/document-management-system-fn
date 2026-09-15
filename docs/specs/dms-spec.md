# Especificação - Document Management System

> Especificação do MVP para orientar a implementação do Document Management System
> usando desenvolvimento guiado por especificação. Esta entrega documenta o
> comportamento esperado; não implementa backend, frontend, testes ou infraestrutura.

## 1. Objetivo

Entregar um sistema web capaz de receber, listar e permitir o download de documentos armazenados localmente, com metadados temporários em memória e uma gestão inicial por proprietário anônimo.

## 2. Escopo

### Dentro do escopo

- Upload de um documento por requisição.
- Validação de presença, tamanho, tipo e conteúdo não vazio do arquivo.
- Gravação dos arquivos no filesystem local da aplicação.
- Registro dos metadados em memória durante a execução do processo.
- Listagem dos documentos disponíveis para o proprietário do MVP.
- Download de um documento pelo identificador.
- Identificação de erros por respostas JSON padronizadas.
- Interface React para upload, listagem, estados de carregamento/erro e download.
- Configuração operacional por variáveis de ambiente.
- Preservação do endpoint `GET /health` existente.

### Fora do escopo

- Armazenamento externo, em nuvem, banco de dados ou serviço de terceiros.
- Persistência dos metadados após reinicialização do processo.
- Autenticação, autorização real, cadastro ou troca de usuários.
- Versionamento, edição, exclusão, busca, preview ou compartilhamento de documentos.
- Upload múltiplo em uma única requisição.
- Conversão, antivírus, OCR ou processamento do conteúdo.
- Alteração do prefixo de proxy já configurado no frontend.

### Premissas do MVP

- O backend define internamente o proprietário como `anonymous`.
- O cliente não envia nem escolhe o campo `owner`.
- O diretório de armazenamento padrão é `backend/storage`.
- Os contratos do backend não incluem o prefixo `/api`.
- Em desenvolvimento, o frontend acessa `/api/...`; o proxy do Vite remove `/api` antes de encaminhar a requisição ao backend.
- Ao reiniciar o processo, os metadados em memória são perdidos. Arquivos que permanecerem no filesystem sem metadados associados são considerados órfãos e não ficam acessíveis pela API.

## 3. Requisitos funcionais

| ID | Requisito | Critério de aceite |
| --- | --- | --- |
| RF-01 | O usuário pode enviar um documento. | `POST /upload` recebe um multipart com o campo `file` e retorna os metadados criados com status `201`. |
| RF-02 | O sistema rejeita upload sem arquivo. | Uma requisição sem `file` retorna erro JSON com status `400` e não cria metadados. |
| RF-03 | O sistema valida tamanho e tipo do arquivo. | Arquivo vazio, acima de `MAX_FILE_SIZE_BYTES` ou fora de `ALLOWED_MIME_TYPES` é rejeitado sem ficar disponível na listagem. |
| RF-04 | O sistema atribui o proprietário do documento. | Todo metadado criado contém `owner: "anonymous"`; valores enviados pelo cliente não alteram essa informação. |
| RF-05 | O sistema gera um identificador único. | Cada documento criado recebe um `id` opaco, não previsível por nome original ou caminho físico. |
| RF-06 | O sistema registra metadados do upload. | O registro contém `id`, `originalName`, `size`, `uploadedAt` e `owner`, além da referência interna necessária para localizar o arquivo. |
| RF-07 | O usuário pode listar documentos. | `GET /documents` retorna os metadados disponíveis, sem expor o nome ou caminho interno do arquivo. |
| RF-08 | A listagem possui ordenação determinística. | Os documentos são retornados por `uploadedAt` decrescente; em empate, o `id` é usado como critério secundário. |
| RF-09 | A listagem vazia é válida. | Quando não há documentos, `GET /documents` retorna `200` com uma lista vazia. |
| RF-10 | O usuário pode baixar um documento por identificador. | `GET /documents/:id/download` retorna o conteúdo binário do arquivo correto com headers de download. |
| RF-11 | O sistema trata documento inexistente. | Um `id` desconhecido retorna `404` em JSON e não tenta acessar um caminho construído diretamente a partir da entrada do cliente. |
| RF-12 | O sistema trata arquivo físico ausente. | Se o metadado existir, mas o arquivo não puder ser lido, o download retorna `404` em JSON sem expor o caminho interno. |
| RF-13 | O sistema informa falhas inesperadas. | Falhas não previstas retornam `500` em formato JSON e são registradas no backend sem vazar detalhes internos para o cliente. |
| RF-14 | O sistema mantém o health check. | `GET /health` continua retornando `200` e `{ "status": "ok" }`. |

## 4. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | Os arquivos devem ser gravados somente no filesystem local, usando `multer` com `diskStorage`. Não utilizar armazenamento externo ou upload de terceiros. |
| RNF-02 | Os metadados devem ser mantidos em memória nesta fase. A perda dos metadados após reinicialização deve ser documentada e não tratada como persistência durável. |
| RNF-03 | A configuração deve seguir o princípio 12-Factor, usando variáveis de ambiente para porta, diretório de storage, limite de tamanho, tipos permitidos e identificador do owner anônimo quando aplicável. |
| RNF-04 | O backend deve seguir Clean Architecture simples, com dependências no sentido `routes -> controllers -> services -> repositories`. Camadas internas não devem depender do Express. |
| RNF-05 | As rotas devem apenas compor middleware e delegar para controllers; controllers devem cuidar da fronteira HTTP; services devem concentrar regras de negócio; repositories devem cuidar da persistência. |
| RNF-06 | Nomes físicos devem ser gerados pelo sistema, usando identificadores seguros, e nunca devem ser derivados diretamente do nome enviado pelo cliente. O nome original deve ser tratado apenas como metadado e como valor de header sanitizado. |
| RNF-07 | O armazenamento deve impedir path traversal. Nenhuma entrada externa pode controlar diretamente o caminho final de leitura ou escrita. |
| RNF-08 | O diretório de storage deve ser criado ou validado na inicialização, e falhas de acesso devem ser tratadas de forma explícita. |
| RNF-09 | O upload deve respeitar um limite de tamanho configurável. O padrão sugerido para desenvolvimento é `10 MiB` (`10485760` bytes), podendo ser alterado sem modificação de código. |
| RNF-10 | A allowlist de MIME types deve ser configurável. O padrão sugerido deve conter tipos comuns de documentos, como `application/pdf`, `text/plain`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `application/vnd.ms-excel` e `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`. |
| RNF-11 | Respostas de erro devem ser JSON com estrutura estável e não devem revelar stack trace, credenciais, caminhos absolutos ou detalhes de infraestrutura. |
| RNF-12 | O frontend deve usar componentes funcionais React, consumir a API com `fetch` e acessar o backend pelo prefixo `/api`. |
| RNF-13 | O frontend deve informar estados de carregamento, sucesso e erro, impedir submissões concorrentes desnecessárias e atualizar a listagem após upload bem-sucedido. |
| RNF-14 | O sistema deve ser testável sem depender de serviços externos. Testes de backend devem usar o runner nativo `node:test`. |

## 5. Modelo de dados (metadados do documento)

O registro público retornado pela API não deve expor o caminho físico. O repositório pode manter uma referência interna adicional, como `storedName`, para localizar o arquivo.

| Campo | Tipo | Obrigatório | Descrição e regra |
| --- | --- | --- | --- |
| `id` | string | Sim | Identificador opaco, único no processo e seguro para uso em URL. Deve ser gerado pelo servidor. |
| `originalName` | string | Sim | Nome original informado pelo cliente, normalizado para apresentação. Não deve ser usado como caminho de armazenamento. |
| `size` | number | Sim | Tamanho do arquivo em bytes, inteiro maior ou igual a zero, obtido do arquivo recebido. Arquivo vazio é rejeitado no MVP. |
| `uploadedAt` | string | Sim | Data/hora de criação do registro em ISO 8601 UTC, por exemplo `2026-09-15T12:00:00.000Z`. |
| `owner` | string | Sim | Identificador do proprietário. No MVP deve ser sempre `anonymous`, definido pelo servidor. |
| `mimeType` | string | Sim | MIME type validado do arquivo, útil para definir `Content-Type` no download. |
| `storedName` | string | Não no contrato público | Nome físico interno gerado pelo servidor. Deve permanecer somente no repositório ou em uma representação interna do service. |
| `storagePath` | string | Não no contrato público | Referência interna ao arquivo, quando necessária. Nunca deve ser retornada ao cliente. |

### Representação pública

```json
{
  "id": "3c2d9b4e-7c48-4b1f-9f31-1ef0c3ad2b52",
  "originalName": "relatorio.pdf",
  "size": 24576,
  "uploadedAt": "2026-09-15T12:00:00.000Z",
  "owner": "anonymous",
  "mimeType": "application/pdf"
}
```

## 6. Contratos de API

### Convenções gerais

- O backend expõe as rotas sem `/api`.
- O frontend chama as mesmas operações como `/api/upload`, `/api/documents` e `/api/documents/:id/download`, usando o proxy do Vite existente.
- Respostas JSON usam `Content-Type: application/json; charset=utf-8`.
- O formato de erro é:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "A requisição contém dados inválidos."
  }
}
```

- `code` deve ser estável para o frontend; `message` deve ser legível e não conter stack trace nem caminhos internos.

### POST /upload

**Objetivo:** receber e registrar um documento.

**Entrada:** `multipart/form-data` com um único campo de arquivo chamado `file`.

Exemplo conceitual:

```http
POST /upload HTTP/1.1
Content-Type: multipart/form-data; boundary=...

file=<conteúdo binário>
```

O cliente não deve enviar `owner` como requisito da operação. Se enviar campos adicionais, eles devem ser ignorados ou rejeitados conforme a política de validação, sem alterar o proprietário interno.

**Sucesso:** `201 Created` com o metadado público do documento.

```json
{
  "id": "3c2d9b4e-7c48-4b1f-9f31-1ef0c3ad2b52",
  "originalName": "relatorio.pdf",
  "size": 24576,
  "uploadedAt": "2026-09-15T12:00:00.000Z",
  "owner": "anonymous",
  "mimeType": "application/pdf"
}
```

**Erros esperados:**

| Status | Código | Situação |
| --- | --- | --- |
| `400` | `FILE_REQUIRED` | Campo `file` ausente ou formato multipart inválido. |
| `400` | `INVALID_FILE_TYPE` | MIME type não está na allowlist configurada. |
| `400` | `EMPTY_FILE` | Arquivo recebido com zero bytes. |
| `413` | `FILE_TOO_LARGE` | Arquivo excede `MAX_FILE_SIZE_BYTES`. |
| `500` | `STORAGE_ERROR` ou `INTERNAL_ERROR` | Falha ao gravar arquivo ou registrar metadados. |

Se o arquivo for gravado e o registro de metadados falhar, o service deve tentar remover o arquivo recém-criado para evitar órfão. Se a remoção também falhar, o evento deve ser registrado para limpeza operacional posterior.

### GET /documents

**Objetivo:** listar os documentos disponíveis para o proprietário do MVP.

**Entrada:** nenhuma. O owner é resolvido internamente como `anonymous`.

**Sucesso:** `200 OK` com um objeto contendo a lista pública. A lista deve ser ordenada por `uploadedAt` decrescente e, em empate, por `id` crescente.

```json
{
  "documents": [
    {
      "id": "3c2d9b4e-7c48-4b1f-9f31-1ef0c3ad2b52",
      "originalName": "relatorio.pdf",
      "size": 24576,
      "uploadedAt": "2026-09-15T12:00:00.000Z",
      "owner": "anonymous",
      "mimeType": "application/pdf"
    }
  ]
}
```

Quando não houver documentos, a resposta será:

```json
{ "documents": [] }
```

### GET /documents/:id/download

**Objetivo:** retornar o conteúdo binário do documento identificado por `id`.

**Entrada:** `id` como parâmetro de rota. O valor deve ser validado antes da consulta e nunca usado diretamente para montar caminho de filesystem.

**Sucesso:** `200 OK` com o conteúdo binário. Headers mínimos:

- `Content-Type`: MIME type registrado;
- `Content-Length`: tamanho registrado quando disponível;
- `Content-Disposition`: `attachment` com o nome original sanitizado para download.

Exemplo:

```http
HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Length: 24576
Content-Disposition: attachment; filename="relatorio.pdf"
```

**Erros esperados:**

| Status | Código | Situação |
| --- | --- | --- |
| `400` | `INVALID_DOCUMENT_ID` | Identificador ausente ou inválido. |
| `404` | `DOCUMENT_NOT_FOUND` | Não existe metadado para o identificador. |
| `404` | `FILE_NOT_FOUND` | Existe metadado, mas o arquivo físico não está disponível. |
| `500` | `DOWNLOAD_ERROR` ou `INTERNAL_ERROR` | Falha inesperada durante a leitura ou resposta. |

## 7. Decisões arquiteturais

### Backend

A implementação deve seguir uma Clean Architecture simples, sem abstrações além das necessárias:

```text
routes -> controllers -> services -> repositories
```

- **`routes/`**: registra caminhos, middleware do multer e controllers. Não contém regra de negócio.
- **`controllers/`**: traduz entrada HTTP para chamadas de service, escolhe status e serializa respostas. Não acessa filesystem ou coleção de metadados diretamente.
- **`services/`**: aplica validações e regras de upload, ownership, ordenação, tratamento de inconsistência e conversão para o modelo público. Deve ser independente do Express.
- **`repositories/`**: encapsula a coleção de metadados em memória e o acesso aos arquivos locais. Deve oferecer operações pequenas para criar, listar, buscar e ler/remover arquivos.
- **`app.js`**: compõe o Express, middleware global, health check, rotas e tratamento centralizado de erros. Deve preservar a exportação do app para testes.

O middleware do multer deve usar `diskStorage`, validar limites e gravar somente no diretório configurado. A geração do nome interno deve ser independente de `originalName`. A validação final das regras de negócio deve permanecer no service, para que não dependa apenas do comportamento do middleware.

### Frontend

A interface deve ser composta por componentes funcionais React, mantendo responsabilidades separadas:

- um serviço de API para upload, listagem e download;
- componente de upload com seleção, submissão e mensagens de estado;
- componente de listagem com nome, tamanho, data e ação de download;
- botão ou ação de download que consuma a resposta binária e inicie o download no navegador;
- estado da página responsável por carregar a lista e atualizá-la após upload.

O frontend deve usar o prefixo `/api` somente nas chamadas feitas pelo navegador. O backend permanece responsável por `/upload`, `/documents` e `/documents/:id/download` após a reescrita do proxy.

### Armazenamento local

- O diretório padrão é `backend/storage`, configurável por `STORAGE_DIR`.
- O diretório deve existir antes do primeiro upload.
- O sistema deve guardar o nome físico gerado e não o nome original como caminho confiável.
- Metadados e arquivo devem ser tratados como uma operação lógica única: se o registro falhar depois da gravação, o arquivo deve ser removido.
- Arquivos sem metadados após uma reinicialização não são listados nem baixados pela API. A limpeza de órfãos pode ser uma rotina operacional futura, mas não deve introduzir persistência de metadados nesta fase.

### Configuração sugerida

| Variável | Obrigatória | Padrão sugerido | Uso |
| --- | --- | --- | --- |
| `PORT` | Não | `3000` | Porta do backend. |
| `STORAGE_DIR` | Não | `backend/storage` | Diretório local de arquivos. |
| `MAX_FILE_SIZE_BYTES` | Não | `10485760` | Limite máximo por arquivo. |
| `ALLOWED_MIME_TYPES` | Não | Lista de documentos definida nos RNF | Allowlist separada por vírgulas. |
| `OWNER_ID` | Não | `anonymous` | Identificador interno do owner do MVP. |

## 8. Plano de execução

As etapas abaixo são o plano para uma implementação posterior. Elas não serão executadas como parte da criação desta especificação.

1. **Preparar o backend:** confirmar dependências existentes, criar a configuração derivada de ambiente e garantir o diretório local de storage sem alterar a restrição de armazenamento.
2. **Implementar repositories:** criar o repositório de metadados em memória e o acesso encapsulado aos arquivos locais, incluindo lookup, leitura, remoção e tratamento de arquivo ausente.
3. **Implementar services:** implementar upload, validação, geração de id, ownership anônimo, ordenação da listagem, download e compensação quando houver falha após a gravação.
4. **Implementar controllers e erros:** traduzir requests/responses HTTP, padronizar erros JSON e evitar exposição de detalhes internos.
5. **Implementar routes e integrar o app:** registrar multer, rotas previstas, middleware de erros e preservar `GET /health` e a exportação do app.
6. **Criar testes de backend:** cobrir health check, upload válido, ausência de arquivo, MIME inválido, arquivo vazio, limite excedido, listagem vazia, ordenação, download, id inexistente, arquivo físico ausente e limpeza após falha.
7. **Implementar serviço frontend:** criar chamadas `fetch` usando `/api`, tratamento de respostas de erro e download de conteúdo binário.
8. **Implementar componentes frontend:** criar upload, listagem e download com estados de carregamento, erro, sucesso e atualização após upload.
9. **Validar integração:** iniciar backend e frontend em ambiente de desenvolvimento e verificar proxy, upload multipart, listagem, download e respostas de erro.
10. **Executar verificação final:** rodar `cd backend && npm test` e `cd frontend && npm run build`, revisar arquivos gerados e confirmar que nenhum serviço externo foi utilizado.

### Critérios de conclusão da implementação futura

- Todos os requisitos funcionais e não funcionais deste documento possuem cobertura ou justificativa registrada.
- Os três endpoints retornam os status e formatos definidos.
- Nenhum caminho de filesystem é controlado diretamente por entrada externa.
- Os metadados não são persistidos fora da memória nesta fase.
- Os arquivos de upload permanecem exclusivamente no filesystem local.
- Backend e frontend são validados pelos testes e build previstos.

## 9. Limites desta entrega

Esta entrega cria somente este documento de especificação. Não devem ser alterados ou executados:

- `backend/src/**`;
- `frontend/src/**`;
- `backend/storage/**`;
- arquivos `package.json` ou configurações do projeto;
- testes, servidores ou builds.
