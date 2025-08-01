# Plano de Desenvolvimento – Encurtador de URL (nwsn.news)

Este documento descreve o plano de desenvolvimento para o projeto "nwsn.news", um encurtador de URL serverless utilizando Cloudflare Workers e Workers KV.

## Fases do Projeto

### Fase 1: Configuração e Estrutura Inicial

1.  **Inicializar o Projeto:**
    *   Criar o arquivo `package.json` (`npm init -y`).
    *   Instalar o `wrangler` como dependência de desenvolvimento.

2.  **Configurar o `wrangler.toml`:**
    *   Definir o nome do worker.
    *   Configurar o `main` entrypoint (ex: `src/index.ts`).
    *   Adicionar a configuração de compatibilidade (`compatibility_date`).

3.  **Estrutura de Diretórios:**
    *   Criar o diretório `src` para o código-fonte.
    *   Criar o arquivo inicial `src/index.ts`.

### Fase 2: Implementação do Worker (MVP)

1.  **Provisionar Recursos Cloudflare:**
    *   Criar os namespaces KV: `LINKS` e `CLICKS`.
    *   Definir a variável de ambiente `AUTH_TOKEN` para autenticação.

2.  **Desenvolver o Redirecionamento (`GET /:code`):**
    *   Implementar a lógica para ler o `slug` da URL.
    *   Consultar o namespace `LINKS` para obter a URL original.
    *   Retornar um `HTTP 302 Redirect`.
    *   Incrementar o contador no namespace `CLICKS`.
    *   Retornar `404` se o `slug` não for encontrado.

3.  **Desenvolver a API de Encurtamento (`POST /api/shorten`):**
    *   Implementar a autenticação via token HMAC no header `Authorization`.
    *   Gerar um `slug` aleatório de 6 caracteres (base-62).
    *   Verificar se o `slug` já existe no KV; gerar um novo em caso de colisão.
    *   Salvar o mapeamento `{slug -> url}` no namespace `LINKS`.
    *   Retornar o `slug` e a `shortUrl` formatada.

4.  **Desenvolver a API de Estatísticas (`GET /api/stats/:code`):**
    *   Implementar a autenticação via token HMAC.
    *   Ler a URL original do namespace `LINKS`.
    *   Ler o contador de cliques do namespace `CLICKS`.
    *   Retornar o objeto `{code, url, clicks}`.

### Fase 3: Deploy e Testes

1.  **Configurar CI/CD (GitHub Actions):**
    *   Criar um workflow para executar `wrangler deploy` no push para a branch `main`.

2.  **Realizar Smoke Tests:**
    *   Executar um script para:
        1.  Criar um novo link via `POST /api/shorten`.
        2.  Acessar o link encurtado e verificar o redirecionamento.
        3.  Consultar as estatísticas via `GET /api/stats/:code` e validar os dados.

3.  **Configurar o Domínio:**
    *   Adicionar a rota `nwsn.news/*` no dashboard da Cloudflare para apontar para o Worker.

## Backlog (Fora do Escopo do MVP)

*   Implementar slugs personalizados.
*   Adicionar funcionalidade de expiração de links.
*   Criar um dashboard visual para analytics.
*   Migrar a contagem de cliques para Durable Objects para maior precisão em caso de viralização.
