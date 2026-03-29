export default {
  async fetch(request, env) {
    // Просто отдаём всё из public через ASSETS
    return env.ASSETS.fetch(request);
  }
};