import indexHtml from '../public/index.html';

export default {
  async fetch(request) {
    return new Response(indexHtml, {
      headers: { 'Content-Type': 'text/html' },
    });
  },
};