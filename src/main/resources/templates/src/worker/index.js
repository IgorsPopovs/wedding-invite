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
      var visitRow = await env.DB_BINDING.prepare(
        'SELECT MAX(visited_at) as last_visit FROM visits WHERE invite_code = ?'
      ).bind(code).first();
      var lastVisit = visitRow ? visitRow.last_visit : null;
      if (row) {
        row.last_visit = lastVisit;
      } else if (lastVisit) {
        row = { last_visit: lastVisit };
      }
      return new Response(JSON.stringify(row || null), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    if (url.pathname === '/wedding-invite/api/rsvp' && request.method === 'POST') {
      var body = await request.json();
      await env.DB_BINDING.prepare(`
        INSERT INTO rsvp (invite_code, name, attending, plus_one, plus_one_name, updated_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(invite_code) DO UPDATE SET
          name = excluded.name,
          attending = excluded.attending,
          plus_one = excluded.plus_one,
          plus_one_name = excluded.plus_one_name,
          updated_at = excluded.updated_at
      `).bind(
        body.invite_code,
        body.name,
        body.attending !== undefined ? body.attending : null,
        body.plus_one !== undefined ? body.plus_one : null,
        body.plus_one_name || null
      ).run();

      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    if (url.pathname === '/wedding-invite/api/visit' && request.method === 'POST') {
      var body = await request.json();
      await env.DB_BINDING.prepare(
        'INSERT INTO visits (invite_code, user_agent) VALUES (?, ?)'
      ).bind(body.invite_code || null, body.user_agent || null).run();
      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    var response = await env.ASSETS.fetch(request);
    var contentType = response.headers.get('Content-Type') || '';
    if (contentType.includes('text/html')) {
      var newHeaders = new Headers(response.headers);
      newHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      return new Response(response.body, { status: response.status, headers: newHeaders });
    }
    return response;
  }
};
