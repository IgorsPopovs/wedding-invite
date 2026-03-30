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
        'SELECT name, attending, plus_one FROM rsvp WHERE invite_code = ?'
      ).bind(code).first();
      return new Response(JSON.stringify(row || null), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    if (url.pathname === '/wedding-invite/api/rsvp' && request.method === 'POST') {
      var body = await request.json();
      await env.DB_BINDING.prepare(
        'UPDATE rsvp SET name = ?, attending = ?, plus_one = ? WHERE invite_code = ?'
      ).bind(body.name, body.attending, body.plus_one, body.invite_code).run();
      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    return env.ASSETS.fetch(request);
  }
};