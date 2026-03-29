export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/bride-photo.png') {
      const img = await env.ASSETS.get('bride-photo.png');
      return new Response(img, { headers: { 'Content-Type': 'image/png' } });
    }

    if (url.pathname === '/groom-photo.png') {
      const img = await env.ASSETS.get('groom-photo.png');
      return new Response(img, { headers: { 'Content-Type': 'image/png' } });
    }

    return new Response(
      `<html>
        <body>
          <img src="/bride-photo.png" />
          <img src="/groom-photo.png" />
        </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}