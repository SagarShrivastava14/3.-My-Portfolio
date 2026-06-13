// Step 1 of the GitHub OAuth flow for Decap CMS.
// Decap opens /api/auth in a popup; we redirect it to GitHub's authorize page.
// Requires env var: OAUTH_GITHUB_CLIENT_ID (set in the Vercel dashboard).
export default function handler(req, res) {
  const clientId = process.env.OAUTH_GITHUB_CLIENT_ID;
  if (!clientId) {
    res.status(500).send('Missing OAUTH_GITHUB_CLIENT_ID environment variable.');
    return;
  }

  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const redirectUri = `${proto}://${host}/api/callback`;
  const state = Math.random().toString(36).slice(2) + Date.now().toString(36);

  const authorizeUrl =
    'https://github.com/login/oauth/authorize' +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    '&scope=repo' +
    `&state=${encodeURIComponent(state)}`;

  res.writeHead(302, { Location: authorizeUrl });
  res.end();
}
