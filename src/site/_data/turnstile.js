// Public Turnstile sitekey, baked in at build time.
// Set TURNSTILE_SITEKEY in the Cloudflare Pages project (Production and Preview)
// and make it available to the build. The widget secret stays server-side.
module.exports = {
  sitekey: process.env.TURNSTILE_SITEKEY || '',
};
