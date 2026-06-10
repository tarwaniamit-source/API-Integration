# Roadmap — API Integration Builder

A pragmatic, value-first sequence. Each phase ships something usable on its own.

## Now — v1: Authoring + sandbox→production flow (this prototype)
- Connector catalog with prefilled templates
- Two environments per connector: separate **sandbox** and **production** base URLs
- Auth: none / API key / bearer / basic / OAuth2 (client credentials)
- Multi-endpoint definition (method, path, query, headers, body)
- Field mapping with dot + array (`data[].email`) paths and a live mapped preview
- **Stage 1 — Sandbox:** live test (browser or server proxy), status, latency, response
- **Stage 2 — Production:** readiness checklist, required env vars, deploy snippet, "promote to production"
- **Production server**: zero-dependency Node proxy (bypasses CORS) + secret injection via `${ENV:NAME}`
- Code export: cURL, JS `fetch`, Python `requests`
- Portable JSON export/import; save / edit / duplicate / delete; local persistence
- Docker + Compose; GitHub Pages workflow for the static sandbox

## Next — v2: Trust & reach
- **Secrets vault** — encrypted credential storage instead of browser/local
- **Pagination handling** — cursor / offset / link-header patterns as config
- **OAuth authorization-code flow** with a hosted redirect
- **Schema library** — reusable canonical schemas (User, License, Invoice)
- **Per-environment auth** — distinct credentials for sandbox vs production

## Later — v3: From builder to platform
- **Scheduled syncs** — turn a saved connector into a recurring job
- **Transforms** — light post-mapping logic (filter, rename, derive)
- **Connector versioning & review** — diff configs, request approval
- **Marketplace** — share community connectors as importable JSON
- **Observability** — run history, failure alerts, data-volume dashboards

## Guardrails
- Keep "template → tested connector in under 5 minutes" intact every phase.
- Config-first; add code-writing only when config can't express it.
- Secrets never written to exported artifacts or version control.
