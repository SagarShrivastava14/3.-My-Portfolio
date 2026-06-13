# Content Admin (Decap CMS) — Setup

The owner edits all site content through a form-based admin page at **`/admin/`**.
Saves commit straight to this GitHub repo; Vercel then auto-redeploys the site.

Hosting is **Vercel**, so login uses GitHub OAuth via the two serverless functions in
`/api` (`auth.mjs`, `callback.mjs`). One-time setup:

## 1. Create a GitHub OAuth App
GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**
- **Application name:** Portfolio CMS (anything)
- **Homepage URL:** `https://sagarshrivastava14.vercel.app`
- **Authorization callback URL:** `https://sagarshrivastava14.vercel.app/api/callback`

Click **Register**, then **Generate a new client secret**. Copy the **Client ID** and
**Client secret**.

## 2. Add the secrets to Vercel
Vercel → your project → **Settings → Environment Variables** → add (Production):
- `OAUTH_GITHUB_CLIENT_ID` = your Client ID
- `OAUTH_GITHUB_CLIENT_SECRET` = your Client secret

Redeploy so the new env vars take effect.

## 3. Point the CMS at your domain
Already set in **`admin/config.yml`**:
```yaml
base_url: https://sagarshrivastava14.vercel.app
```
(Update this only if the domain ever changes.)

## 4. Give the owner access
The owner just needs **push access** to this GitHub repo (Repo → Settings → Collaborators).
They then visit `https://sagarshrivastava14.vercel.app/admin/`, click **Login with GitHub**,
authorize once, and edit content through forms.

---

## How it fits together
- `content/*.json` — the actual content (source of truth). The site reads these at load.
- `admin/config.yml` — defines the edit forms, one per content file.
- `api/auth.mjs` + `api/callback.mjs` — the GitHub login handshake.
- Editing in `/admin/` → commit to `master` → Vercel redeploy → live site updates.

## Notes
- **Bold text:** in the About paragraphs, wrap words in `**double asterisks**` for bold.
- **Popups (modals):** each popup has a unique **Key**. Services/Skills open a popup by
  putting that Key in their "Popup key" field (leave blank for no popup).
- **Certificate PDFs:** the "PDF file" field uploads into `/certificates`.
- To require a review step before changes go live, set `publish_mode: editorial_workflow`
  in `admin/config.yml`.
