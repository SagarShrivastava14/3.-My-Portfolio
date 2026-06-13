// Step 2 of the GitHub OAuth flow for Decap CMS.
// GitHub redirects back here with ?code=...; we exchange it for an access
// token and hand it to the Decap window via postMessage.
// Requires env vars (set in the Vercel dashboard):
//   OAUTH_GITHUB_CLIENT_ID
//   OAUTH_GITHUB_CLIENT_SECRET
export default async function handler(req, res) {
  const clientId = process.env.OAUTH_GITHUB_CLIENT_ID;
  const clientSecret = process.env.OAUTH_GITHUB_CLIENT_SECRET;
  const code = req.query.code;

  if (!clientId || !clientSecret) {
    res.status(500).send('Missing OAuth environment variables.');
    return;
  }
  if (!code) {
    res.status(400).send('Missing OAuth code.');
    return;
  }

  let result;
  let status;
  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });
    const data = await tokenRes.json();
    if (data.access_token) {
      status = 'success';
      result = { token: data.access_token, provider: 'github' };
    } else {
      status = 'error';
      result = { message: data.error_description || 'No access token returned.' };
    }
  } catch (err) {
    status = 'error';
    result = { message: String(err && err.message ? err.message : err) };
  }

  // The handshake Decap expects: announce "authorizing", then on the opener's
  // reply post "authorization:github:<status>:<json>".
  const payload = JSON.stringify(result);
  const body = `<!doctype html><html><body><script>
  (function () {
    function receiveMessage(e) {
      window.opener.postMessage(
        'authorization:github:${status}:' + ${JSON.stringify(payload)},
        e.origin
      );
      window.removeEventListener('message', receiveMessage, false);
    }
    window.addEventListener('message', receiveMessage, false);
    window.opener.postMessage('authorizing:github', '*');
  })();
  <\/script></body></html>`;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(body);
}
