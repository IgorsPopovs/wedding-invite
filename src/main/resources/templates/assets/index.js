export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // If path starts with /wedding-invite
    if (url.pathname.startsWith("/wedding-invite")) {
      // Remove the prefix
      let assetPath = url.pathname.replace("/wedding-invite", "") || "/";
      // Rewrite the URL for ASSETS fetch
      const newUrl = new URL(assetPath, "https://example.com"); // host doesn't matter
      return env.ASSETS.fetch(newUrl.toString(), request);
    }

    // Otherwise, pass through (your Home Assistant site)
    return fetch(request);
  }
};