const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    var url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === '/wedding-invite/api/guest' && request.method === 'GET') {
      var code = url.searchParams.get('guest') || '';
      var row = await env.DB_BINDING.prepare(
        'SELECT name, attending, plus_one, plus_one_name FROM rsvp WHERE invite_code = ?'
      ).bind(code).first();
      return new Response(JSON.stringify(row || null), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    if (url.pathname === '/wedding-invite/api/rsvp' && request.method === 'POST') {
      var body = await request.json();

      if (!body.invite_code || body.invite_code === 'unknown') {
        await env.DB_BINDING.prepare(
          'INSERT INTO rsvp (name, attending, plus_one, plus_one_name) VALUES (?, ?, ?, ?)'
        ).bind(body.name, body.attending || null, body.plus_one || null, body.plus_one_name || null).run();
      } else {
        await env.DB_BINDING.prepare(
          'UPDATE rsvp SET name = ?, attending = ?, plus_one = ?, plus_one_name = ? WHERE invite_code = ?'
        ).bind(body.name, body.attending || null, body.plus_one || null, body.plus_one_name || null, body.invite_code || null).run();
      }

      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    return env.ASSETS.fetch(request);
  }
};
