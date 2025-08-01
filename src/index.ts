export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.slice(1);

    // Rota de redirecionamento
    if (path && !path.startsWith('api/')) {
      const destination = await env.LINKS.get(path);
      if (destination) {
        // Incrementa o contador de cliques de forma assíncrona
        await env.CLICKS.put(path, String(Number(await env.CLICKS.get(path) || 0) + 1));
        return Response.redirect(destination, 302);
      }
      return new Response('Link não encontrado', { status: 404 });
    }

    // Rotas da API
    if (path.startsWith('api/')) {
      // Middleware de autenticação
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || authHeader !== `Bearer ${env.AUTH_TOKEN}`) {
        return new Response('Não autorizado', { status: 401 });
      }

      // Rota para encurtar URL
      if (path === 'api/shorten' && request.method === 'POST') {
        const { url: longUrl } = await request.json();
        if (!longUrl) {
          return new Response('URL não fornecida', { status: 400 });
        }

        // Verifica se a URL já foi encurtada
        const urlHash = await sha256(longUrl);
        const existingCode = await env.URLS.get(urlHash);

        if (existingCode) {
          return new Response(JSON.stringify({ code: existingCode, shortUrl: `${url.origin}/${existingCode}` }), {
            headers: { 'Content-Type': 'application/json' },
          });
        }

        const code = generateCode();
        await env.LINKS.put(code, longUrl);
        await env.URLS.put(urlHash, code);

        return new Response(JSON.stringify({ code, shortUrl: `${url.origin}/${code}` }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Rota para obter estatísticas
      if (path.startsWith('api/stats/') && request.method === 'GET') {
        const code = path.split('/')[2];
        const originalUrl = await env.LINKS.get(code);
        if (!originalUrl) {
          return new Response('Link não encontrado', { status: 404 });
        }

        const clicks = await env.CLICKS.get(code) || 0;

        return new Response(JSON.stringify({ code, url: originalUrl, clicks: Number(clicks) }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response('Rota não encontrada', { status: 404 });
  },
};

function generateCode() {
  // Gera um código alfanumérico de 6 caracteres
  return Math.random().toString(36).substring(2, 8);
}

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}