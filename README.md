# nwsn.news - Encurtador de URL Serverless

Este é um serviço de encurtamento de URLs serverless, sem interface gráfica, construído com Cloudflare Workers e Workers KV. Ele foi projetado para ser rápido, eficiente e operar dentro dos limites do plano gratuito da Cloudflare.

## Visão Geral da Arquitetura

- **Lógica de Roteamento:** Cloudflare Workers executados na edge para baixa latência.
- **Armazenamento:** Cloudflare Workers KV para persistir os mapeamentos de URL e a contagem de cliques.
  - `LINKS`: Namespace KV para mapear `slug` -> `URL original`.
  - `CLICKS`: Namespace KV para mapear `slug` -> `contagem de cliques`.
- **Autenticação:** As rotas de API são protegidas por um token Bearer.

---

## Configuração do Ambiente

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/tomazetti/nwsn-news.git
    cd nwsn-news
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure os recursos da Cloudflare:**
    - Crie os namespaces KV e adicione as configurações ao `wrangler.toml`:
      ```bash
      npx wrangler kv namespace create "LINKS"
      npx wrangler kv namespace create "CLICKS"
      ```
    - Adicione o token de autenticação como um segredo do worker:
      ```bash
      npx wrangler secret put AUTH_TOKEN
      ```

---

## Uso

### Desenvolvimento Local

Para iniciar um servidor local para desenvolvimento e testes, execute:

```bash
npx wrangler dev
```

### Deploy

O deploy é automatizado via GitHub Actions. Qualquer push para a branch `main` acionará o workflow de deploy.

Para fazer o deploy manualmente, use o comando:

```bash
npx wrangler deploy
```

---

## Documentação da API

A URL base para os endpoints é a URL do seu worker (ex: `https://nwsn-news.andre-07f.workers.dev`).

### Autenticação

Todos os endpoints da API (`/api/*`) exigem um token de autenticação. O token deve ser fornecido no header `Authorization`.

- **Header:** `Authorization: Bearer <SEU_AUTH_TOKEN>`

### 1. Encurtar uma URL

- **Endpoint:** `POST /api/shorten`
- **Descrição:** Cria um novo link encurtado.
- **Corpo da Requisição (JSON):**
  ```json
  {
    "url": "https://sua-url-longa-aqui.com/com/parametros"
  }
  ```
- **Resposta de Sucesso (200 OK):**
  ```json
  {
    "code": "gerado12",
    "shortUrl": "https://nwsn.news/gerado12"
  }
  ```
- **Exemplo com `curl`:**
  ```bash
  curl -X POST "https://nwsn.news/api/shorten" \
       -H "Authorization: Bearer <SEU_AUTH_TOKEN>" \
       -H "Content-Type: application/json" \
       -d '{"url": "https://gemini.google.com"}'
  ```

### 2. Obter Estatísticas de um Link

- **Endpoint:** `GET /api/stats/:code`
- **Descrição:** Retorna a URL original e a contagem de cliques para um determinado código.
- **Parâmetro da URL:**
  - `code`: O código de 6 caracteres do link encurtado.
- **Resposta de Sucesso (200 OK):**
  ```json
  {
    "code": "gerado12",
    "url": "https://sua-url-longa-aqui.com/com/parametros",
    "clicks": 10
  }
  ```
- **Exemplo com `curl`:
  ```bash
  curl "https://nwsn.news/api/stats/gerado12" \
       -H "Authorization: Bearer <SEU_AUTH_TOKEN>"
  ```

### 3. Redirecionamento

- **Endpoint:** `GET /:code`
- **Descrição:** Redireciona o usuário para a URL original e incrementa o contador de cliques.
- **Comportamento:** Retorna uma resposta `HTTP 302 Found` com o `Location` header apontando para a URL original.
- **Uso:** Basta acessar a URL encurtada em um navegador ou cliente HTTP.
  ```
  https://nwsn.news/gerado12
  ```
