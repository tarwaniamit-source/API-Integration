# Deployment Guide

Two tracks, matching the two run modes of the app.

## Track 1 — Sandbox (static)

The sandbox is just `index.html` + `assets/`. Host it anywhere static.

**GitHub Pages**
1. Push the repo.
2. **Settings → Pages → Source:** *Deploy from a branch* → `main` / `/ (root)`,
   or set Source to *GitHub Actions* (the included workflow deploys on push).
3. Public URL: `https://<username>.github.io/<repo>/`.

**Netlify / Vercel / Cloudflare Pages** — framework preset *None / static*, no
build command, publish directory `.`.

In sandbox mode, live tests run from the visitor's browser, so they only succeed
against APIs that send CORS headers. For everything else, use the production
build.

## Track 2 — Production (proxy server)

Adds `server/index.js` — a zero-dependency Node 18+ server that serves the app,
proxies API calls server-side (no CORS limit), and injects secrets from the
environment.

**Local**
```bash
node server/index.js     # http://localhost:3000   (or: npm start)
```

**Docker**
```bash
cp .env.example .env     # add your secrets
docker compose up --build
# or:
docker build -t aib . && docker run -p 3000:3000 -e TOKEN=sk_live_xxx aib
```

**Platform-as-a-service**

| Platform | Setting |
| --- | --- |
| Render | New Web Service → runtime Node → start `node server/index.js` |
| Railway | New project from repo → detects `npm start` |
| Fly.io | `fly launch` → uses the included Dockerfile |

Set API secrets as environment variables in the platform dashboard; the app
reads the assigned `PORT` automatically.

## How secret injection works

In the builder, write a secret as a placeholder, e.g. `Authorization: Bearer
${ENV:TOKEN}`. When a test runs through the proxy, the server replaces
`${ENV:TOKEN}` with `process.env.TOKEN` (anywhere in url/headers/body) before
making the call. Set `TOKEN` in `.env` or your platform env vars.

## Proxy contract

`POST /api/proxy`
```json
{ "method": "GET", "url": "https://api.example.com/v1/users",
  "headers": { "Authorization": "Bearer ${ENV:TOKEN}" }, "body": null }
```
Response: `{ "ok": true, "status": 200, "statusText": "OK", "ms": 142, "headers": {}, "body": "…" }`

`GET /api/health` → `{ "status": "ok", "proxy": true }` — how the front-end
detects production mode.

## Security notes

- Only absolute `http(s)` URLs are forwarded (no `file://`, etc.).
- Request bodies are capped at 1 MB.
- The container runs as a non-root user.
- For a public deployment, put the proxy behind your own auth / network rules —
  never expose an open proxy to the internet.
