export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/wedding-invite/api/rsvp' && request.method === 'POST') {
      const body = await request.json();
      await env.DB_BINDING.prepare(
        'INSERT INTO rsvp (name, attending, plus_one, invite_code) VALUES (?, ?, ?, ?)'
      ).bind(body.name, body.attending, body.plus_one, body.invite_code).run();
      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return env.ASSETS.fetch(request);
  }
};
