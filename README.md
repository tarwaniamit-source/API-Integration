# API Integration Builder

A no-code workspace to **configure, test, and ship SaaS API connectors** —
right in the browser. Pick a template (or start blank), set up authentication,
define endpoints, map the response to a clean schema, run it live, and export
the connector as portable JSON or ready-to-run code.

Each connector moves through **two stages, built right into the prototype:**

1. **Sandbox** — test the connector against a safe/sandbox endpoint until it behaves.
2. **Production** — once the sandbox test passes, confirm a readiness checklist and promote it to the live endpoint.

The app also runs in two deployment modes and auto-detects which it's in:

| Run mode | What it is | Live test calls go… | Secrets |
| --- | --- | --- | --- |
| Sandbox (static) | `index.html` opened directly or via any static host | from your **browser** (CORS-enabled APIs) | stay in your browser |
| Production (server) | the app served by the bundled Node proxy | through the **server proxy**, bypassing CORS | injected from server **env vars** |

> **Personal product project** by Amit Tarwani (Senior Product Manager).
> A working prototype paired with product docs ([PRD](docs/PRD.md),
> [Roadmap](docs/ROADMAP.md), [Deployment](docs/DEPLOYMENT.md)).
> Independent and **unbranded** — not affiliated with any commercial product.

---

## 1 - Run on the sandbox

Zero setup. Nothing is installed; nothing leaves your machine.

```bash
# just open it
open index.html                 # macOS (or double-click)

# or serve it (recommended)
python3 -m http.server 8080     # -> http://localhost:8080
# or
npm run sandbox                 # -> http://localhost:8080
```

Build a connector, set a **Sandbox base URL**, and use **Stage 1 - Run in
sandbox** to send a request. In the browser this works for CORS-enabled APIs
(the bundled **JSONPlaceholder** template tests end-to-end). A successful
sandbox test unlocks promotion to production.

**Share the sandbox publicly (GitHub Pages):**
1. Push to GitHub.
2. **Settings -> Pages -> Source:** *Deploy from a branch* -> `main` / `/ (root)`
   (or *GitHub Actions* — [`deploy.yml`](.github/workflows/deploy.yml) handles it).
3. Live at `https://<username>.github.io/<repo>/`.

---

## 2 - Deploy to production

The production build adds a tiny **zero-dependency Node server** (`server/`) that
serves the app, **proxies** API calls server-side (no CORS limit), and **injects
secrets** from environment variables. In the builder, reference a secret as
`${ENV:NAME}` (e.g. `Authorization: Bearer ${ENV:TOKEN}`); the proxy substitutes
it from `process.env` before forwarding — credentials never touch the browser
or the repo.

```bash
# locally
node server/index.js            # Node 18+ -> http://localhost:3000
npm start

# with Docker
cp .env.example .env            # add secrets
docker compose up --build       # -> http://localhost:3000
```

Inside the app, **Stage 2 - Promote to production** shows a readiness checklist,
the required environment variables, a deploy snippet, and a **Mark ready for
production** button that flips on once every check passes. Full host-by-host
guidance is in **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**.

---

## Features

- **Connector catalog** - templates for common SaaS APIs, plus a blank canvas.
- **Two environments per connector** - separate sandbox and production base URLs.
- **Authentication** - None, API Key (header/query), Bearer, Basic, OAuth 2.0 (client credentials).
- **Endpoints** - method, path, query, headers, JSON body (multiple per connector).
- **Field mapping** - normalize responses into a clean schema with dot/array paths (`data[].profile.email`) and a live mapped preview.
- **Two-stage flow** - sandbox test -> readiness checklist -> promote to production.
- **Live test** - browser (sandbox) or server proxy (production); status, latency, body.
- **Code export** - cURL, JS `fetch`, Python `requests`, secrets as placeholders.
- **Manage** - save, edit, duplicate, delete; export/import connectors as JSON.

## Why it exists

Governing SaaS spend, licenses, and access means pulling data out of hundreds of
apps over their REST APIs. Hand-building each connector is slow and gates
coverage. This tool lets a technical-but-not-engineer user build a working,
trustworthy connector in minutes. See the **[PRD](docs/PRD.md)** for full
problem framing, personas, metrics, and trade-offs.

## Project structure

```
.
├── index.html              # the app (HTML + CSS + JS) - sandbox runs from this alone
├── assets/logo.svg         # app mark
├── server/index.js         # production proxy + static server (zero dependencies)
├── Dockerfile, docker-compose.yml, .env.example
├── docs/  PRD.md, ROADMAP.md, DEPLOYMENT.md
├── .github/workflows/      # GitHub Pages deploy (sandbox)
└── README.md, LICENSE, package.json, .gitignore
```

## License

[MIT](LICENSE) - use it, fork it, build on it.
