# Product Requirements Document — API Integration Builder

| | |
| --- | --- |
| **Product** | API Integration Builder |
| **Author** | Amit Tarwani · Senior Product Manager |
| **Status** | Prototype (v1) — shipped |
| **Document type** | Personal portfolio project |
| **Last updated** | 2026 |
| **Related docs** | [README](../README.md) · [Roadmap](./ROADMAP.md) · [Deployment](./DEPLOYMENT.md) |

> This is an independent, unbranded prototype built to demonstrate end-to-end
> product thinking and a working slice of a no-code integration tool. It is not
> affiliated with, and contains no branding from, any commercial product.

### Version history

| Version | Date | Author | Notes |
| --- | --- | --- | --- |
| 0.1 | 2026 | A. Tarwani | Initial draft: problem, goals, v1 functional scope |
| 1.0 | 2026 | A. Tarwani | Expanded to full PRD; added the sandbox→production two-stage flow, the production proxy server, data model, NFRs, security, analytics, and rollout |

---

## 1. Executive summary

Organizations that manage their software estate need to pull data *out of* the
SaaS apps they run — users, licenses, usage, spend — over each app's REST API.
Today that means an engineering ticket per connector, inconsistent code, and a
backlog that gates how fast the platform can grow coverage.

**API Integration Builder** lets a technical-but-not-engineer user configure,
test, and ship a working API connector in minutes, with no code to write or
deploy. A connector is authored once, **tested in a sandbox**, and then
**promoted to production** through a readiness checklist. The output is a
portable JSON config plus ready-to-run code (cURL, JS, Python) that engineering
can review and trust.

The prototype ships in two run modes from one codebase: a **static sandbox**
(opens in any browser, zero install) and a **production build** backed by a
zero-dependency proxy server that removes the browser's CORS limit and injects
secrets from server environment variables.

---

## 2. Background & context

SaaS-management, security, and finance teams increasingly need a normalized view
of who has access to what, across hundreds of applications. The data exists in
each app's API, but extracting it is gated by engineering capacity, and every
connector re-solves the same problems: authentication schemes, endpoint shapes,
pagination, and mapping a vendor's idiosyncratic JSON into a consistent internal
schema.

The people who best understand a given app — the IT admin who owns it — are
usually unable to contribute the connector, because building one means writing
and deploying code. The result is a structural bottleneck: coverage grows only
as fast as engineering can service the backlog.

---

## 3. Problem statement

**Building API connectors by hand is slow, inconsistent, and centralized in
engineering — which caps how fast the platform can cover the SaaS estate.**

The cost of the status quo:

- **Throughput.** Every new connector is an engineering ticket; the backlog
  dictates coverage growth.
- **Consistency.** Auth, pagination, and field mapping are re-invented per
  integration, making connectors hard to maintain and audit.
- **Self-service gap.** IT/ops teams who understand the target app can't build
  connectors themselves — they file requests and wait.
- **Trust & hand-off.** When engineering does build one, there's no standard,
  reviewable artifact that captures "what this connector does."

---

## 4. Goals & non-goals

### 4.1 Goals

1. Let a technical-but-not-engineer user **configure, test, and ship** a working
   connector in minutes, without writing or deploying code.
2. Produce a **trustworthy, reviewable artifact** — portable JSON config plus
   generated code — that engineering can version and adopt.
3. Provide a **safe path to production**: test against a sandbox endpoint first,
   then promote to the live endpoint behind an explicit readiness gate.
4. Keep **secrets out of the browser and the repo** in the production build.

### 4.2 Non-goals (v1)

- **Scheduled / recurring syncs.** This is a *builder* and *tester*, not a
  long-running sync runner. (Roadmap v3.)
- **Encrypted secrets vault.** v1 keeps sandbox values local and uses
  environment-variable injection in production; a managed vault is v2.
- **OAuth authorization-code flows** that require a hosted redirect. v1 supports
  the client-credentials grant. (Roadmap v2.)
- **Connector marketplace / sharing UI.** Export/import JSON covers sharing in
  v1; a marketplace is v3.

---

## 5. Success metrics

**North Star:** *Number of connectors successfully tested and promoted to
production per active user per month* — it captures the full promise (built,
proven, shipped), not just activity.

| Metric | Why it matters | Target (directional) |
| --- | --- | --- |
| Time to first successful sandbox test | The core promise is speed | < 5 min from template to a 2xx |
| % of connectors started from a template | Validates catalog value | > 60% |
| Sandbox→production promotion rate | Connectors actually reach production | > 40% of tested connectors |
| Connectors saved / exported per active user | Real output, not tire-kicking | ≥ 2 |
| Self-serve rate (built without engineering) | The whole point | > 50% of new connectors |
| Generated-code adoption | Output is trusted downstream | qualitative: engineers reuse the export |

**Counter-metrics (guardrails):** connectors promoted to production *without* a
passing sandbox test (should trend to 0 — the gate exists for a reason); support
requests citing confusing failures.

---

## 6. Target users & personas

| Persona | Context | Job to be done | Success looks like |
| --- | --- | --- | --- |
| **IT / SaaS admin** (primary) | Owns and administers specific apps; comfortable with API docs but not a developer | "Pull our users and licenses out of an app I own, without filing a ticket." | Starts from a template, tests it in sandbox, promotes to production, exports config — zero engineering involvement |
| **Integration engineer** (secondary) | Builds and maintains connectors for the platform | "Get a consistent, trustworthy starting point instead of writing each connector from scratch." | Reviews exported JSON + generated snippet; adopts it rather than rebuilding |
| **Ops / data analyst** (tertiary) | Consumes the extracted data | "Get the same shape of data regardless of which app it came from." | Field mapping yields a consistent canonical schema across sources |

---

## 7. Key user journey

The product is organized around a single, legible flow that mirrors how an
integration actually works, ending in an explicit two-stage gate:

```
Configure → Map → ── Stage 1: SANDBOX ── → ── Stage 2: PRODUCTION ──
 (details,    (response   (test against the      (readiness checklist →
  auth,        → schema)   sandbox endpoint        promote to the live
  endpoints)               until it behaves)       endpoint)
```

1. **Pick a starting point.** Choose a catalog template (prefilled base URLs,
   auth, a starter endpoint, sample mappings) or a blank canvas.
2. **Configure the connection.** Name, vendor, category, **sandbox base URL**,
   **production base URL**, description.
3. **Set authentication.** API key / bearer / basic / OAuth2 client-credentials.
4. **Define endpoints.** Method, path, query params, headers, JSON body.
5. **Map the response.** Bind canonical field names to dot/array JSON paths
   (`data[].profile.email`), verified by a live mapped preview.
6. **Stage 1 — Sandbox.** Send the request against the sandbox URL; inspect
   status, latency, and body. A successful test marks the connector *tested* and
   unlocks Stage 2.
7. **Stage 2 — Production.** Work the readiness checklist, review the required
   environment variables and deploy snippet, optionally run a production test
   through the proxy, then **promote** the connector to production-ready.
8. **Export & hand off.** Download portable JSON and generated code (cURL, JS
   `fetch`, Python `requests`).

A live **pipeline diagram** at the top of the builder
(`Source API → Auth → Endpoint → Mapping → Your schema`) updates as the user
configures each stage, keeping the abstract idea of "an integration" concrete.

---

## 8. Scope

### 8.1 In scope (v1)

- Connector catalog with prefilled templates and a blank canvas
- Two environments per connector (sandbox + production base URLs)
- Authentication: none, API key (header/query), bearer, basic, OAuth2 (client credentials)
- Multiple endpoints per connector (method, path, query, headers, body)
- Field mapping with dot + array paths and a live mapped preview
- Stage 1 sandbox live testing (browser or server proxy)
- Stage 2 production readiness checklist + promotion
- Code export (cURL, JS, Python) and portable JSON export/import
- Connector management (save, edit, duplicate, delete) with local persistence
- Two run modes: static sandbox and production proxy server, auto-detected

### 8.2 Out of scope (v1)

Scheduled syncs; managed secrets vault; OAuth auth-code flow; pagination
automation; transforms; multi-user accounts; a hosted marketplace.

---

## 9. Functional requirements

Priority key: **P0** = must-have for v1, **P1** = should-have, **P2** = nice-to-have.

### 9.1 Catalog & templates

| ID | Requirement | Priority | Acceptance criteria |
| --- | --- | --- | --- |
| FR-1.1 | Start from a template for a common app | P0 | Selecting a template prefills sandbox + production base URLs, auth type, a starter endpoint, and sample mappings |
| FR-1.2 | Start from a blank canvas | P0 | A "Blank" option creates an empty connector with sensible defaults |

### 9.2 Connection & environments

| ID | Requirement | Priority | Acceptance criteria |
| --- | --- | --- | --- |
| FR-2.1 | Capture name, vendor, category, description | P0 | Fields persist; name is required to save |
| FR-2.2 | Separate **sandbox** and **production** base URLs | P0 | Each environment's tests/code use its own base URL |

### 9.3 Authentication

| ID | Requirement | Priority | Acceptance criteria |
| --- | --- | --- | --- |
| FR-3.1 | Configure auth: none / API key / bearer / basic / OAuth2 client-creds | P0 | Each method exposes only its relevant fields |
| FR-3.2 | Never expose secrets in generated code | P0 | Generated snippets use placeholders (`$TOKEN`, `$API_KEY`) / `${ENV:NAME}`, never literals |

### 9.4 Endpoints

| ID | Requirement | Priority | Acceptance criteria |
| --- | --- | --- | --- |
| FR-4.1 | Define one or more endpoints | P0 | Method, path, query params, headers, and (for write methods) a JSON body |
| FR-4.2 | Visual method affordance | P1 | Methods are color-coded; body field appears only for POST/PUT/PATCH |

### 9.5 Field mapping

| ID | Requirement | Priority | Acceptance criteria |
| --- | --- | --- | --- |
| FR-5.1 | Map response fields to canonical names | P0 | Supports dot and array notation (`data[].email`) |
| FR-5.2 | Live mapped preview | P0 | Mapping resolves against the actual test response and shows the normalized object |

### 9.6 Stage 1 — Sandbox testing

| ID | Requirement | Priority | Acceptance criteria |
| --- | --- | --- | --- |
| FR-6.1 | Send a live request against the sandbox URL | P0 | Returns status, latency, and body; errors (incl. CORS) are explained, not silent |
| FR-6.2 | Choose transport | P1 | Auto / browser / server-proxy; proxy enabled only when the server is detected |
| FR-6.3 | A passing sandbox test unlocks production | P0 | On a 2xx, connector is marked *tested*; Stage 2 promotion becomes available |

### 9.7 Stage 2 — Production promotion

| ID | Requirement | Priority | Acceptance criteria |
| --- | --- | --- | --- |
| FR-7.1 | Readiness checklist | P0 | Name, production URL, auth, ≥1 endpoint, ≥1 mapping, passed sandbox test — each shown as pass/fail |
| FR-7.2 | Required environment variables surfaced | P0 | Derived from the auth type, shown as `${ENV:NAME}` references |
| FR-7.3 | Deploy snippet | P1 | Shows the run command and the exact proxy request for the production endpoint |
| FR-7.4 | Promote gate | P0 | "Mark ready for production" enables only when every check passes; promoted connectors show a production-ready badge |

### 9.8 Export & management

| ID | Requirement | Priority | Acceptance criteria |
| --- | --- | --- | --- |
| FR-8.1 | Export connector as code | P0 | One click yields valid cURL, JS `fetch`, and Python `requests` |
| FR-8.2 | Export / import portable JSON | P0 | Round-trips a connector; import validates structure |
| FR-8.3 | Manage connectors | P0 | Save / edit / duplicate / delete; survives reload |

### 9.9 Run modes

| ID | Requirement | Priority | Acceptance criteria |
| --- | --- | --- | --- |
| FR-9.1 | Static sandbox mode | P0 | App runs from `index.html` alone; tests use the browser |
| FR-9.2 | Production proxy mode | P0 | When served by the bundled server, the app detects it, flips a mode badge, and routes tests through `/api/proxy` |

---

## 10. Non-functional requirements

- **Performance.** First paint < 1s on a static host; a live test reflects the
  upstream latency plus negligible overhead.
- **Footprint.** Front-end has zero runtime dependencies; the production server
  has zero npm dependencies (Node 18+ built-ins only).
- **Security.** See §13. No secrets in generated code; proxy forwards only
  absolute `http(s)` URLs; request bodies capped at 1 MB; container runs as a
  non-root user.
- **Privacy.** In sandbox mode no data leaves the browser. Connector configs
  persist only in `localStorage` on the user's device.
- **Reliability.** A connector saved in one session loads intact in the next.
- **Accessibility.** Keyboard-operable controls, legible contrast, semantic
  labels (target WCAG 2.1 AA for v1.x).
- **Browser support.** Current Chrome, Edge, Firefox, Safari.
- **Portability.** Static build hosts anywhere; production build runs locally,
  via Docker, or on any Node PaaS.

---

## 11. System overview

**Front-end** — a single, dependency-free HTML/CSS/JS app. State lives in
`localStorage`. It builds requests, generates code, resolves field-mapping
paths, and renders the live pipeline and two-stage flow.

**Production server** (`server/index.js`) — a zero-dependency Node 18+ process
that:
1. serves the static app,
2. exposes `GET /api/health` so the front-end can detect production mode,
3. exposes `POST /api/proxy` to forward requests **server-side**, removing the
   browser CORS limitation,
4. injects secrets: any `${ENV:NAME}` in the proxied url/headers/body is replaced
   from `process.env` before the request is sent.

**Mode detection** — on load the app pings `/api/health`; success flips it to
*Production* (proxy transport enabled), otherwise it stays *Sandbox (static)*.

### Proxy contract

```
POST /api/proxy
{ "method":"GET", "url":"https://api.example.com/v1/users",
  "headers": { "Authorization": "Bearer ${ENV:TOKEN}" }, "body": null }

→ { "ok":true, "status":200, "statusText":"OK", "ms":142, "headers":{…}, "body":"…" }
```

---

## 12. Data model

A connector is a single JSON object — the unit of export, import, and version
control:

```jsonc
{
  "id": "string",
  "name": "string",
  "vendor": "string",
  "category": "string",
  "sandboxUrl": "https://sandbox.api.example.com/v1",
  "prodUrl":    "https://api.example.com/v1",
  "desc": "string",
  "auth": {
    "type": "none | apiKey | bearer | basic | oauth2",
    "keyName": "X-API-Key", "in": "header | query",     // apiKey
    "token": "…",                                        // bearer (sandbox only; prod uses ${ENV})
    "user": "…", "pass": "…",                            // basic
    "tokenUrl": "…", "clientId": "…", "clientSecret": "…", "scope": "…" // oauth2
  },
  "endpoints": [
    { "id":"…", "name":"List users", "method":"GET", "path":"/users",
      "query":[{"k":"limit","v":"100"}], "headers":[{"k":"Accept","v":"application/json"}], "body":"" }
  ],
  "mappings": [ { "canonical": "email", "source": "data[].profile.email" } ],
  "tested": false,
  "prodReady": false,
  "createdAt": 0,
  "updatedAt": 0
}
```

---

## 13. Security & privacy

- **Secrets never in code or repo.** Generated snippets use placeholders;
  production credentials live in server environment variables and are injected
  only at request time via `${ENV:NAME}`.
- **Local-only by default.** Sandbox mode performs no server round-trips for the
  user's data; configs stay in `localStorage`.
- **Proxy safeguards.** Only absolute `http(s)` URLs are forwarded; bodies are
  capped (1 MB); the container runs as a non-root user.
- **Deployment caveat.** An open proxy must not be exposed publicly without the
  operator's own auth / network controls — documented in DEPLOYMENT.md.

---

## 14. Analytics & instrumentation

To evaluate the metrics in §5, the product should (in a hosted deployment)
capture privacy-respecting events:

- `connector_started` (with `source: template | blank`)
- `sandbox_test_run` / `sandbox_test_succeeded` (+ latency, status class)
- `connector_promoted` (production-ready)
- `connector_exported` (format) / `connector_saved`
- `transport_used` (browser | proxy)

Funnel of record: *started → mapped → sandbox-tested → promoted → exported*.

---

## 15. Release & rollout plan

1. **Internal prototype (now).** Static sandbox + production proxy; dogfood with
   a handful of templates.
2. **Limited pilot.** Share with a few IT admins; instrument the funnel; target
   the time-to-first-test and self-serve metrics.
3. **General availability (static).** Publish the sandbox via static hosting for
   broad, no-risk trial.
4. **Production rollout.** Stand up the proxy behind access control for teams
   that need authenticated / CORS-restricted APIs.

---

## 16. Dependencies & assumptions

- **Assumes** users can obtain API credentials for the apps they own and can
  read basic API docs.
- **Assumes** target APIs are REST/JSON over HTTPS.
- **Depends on** Node 18+ for the production server (built-in `fetch`); no other
  runtime dependencies.

---

## 17. Risks & mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| CORS blocks browser tests for many real APIs | Sandbox feels broken | Server proxy in the production build; clear messaging + always-correct exported code in sandbox |
| Field-mapping paths are powerful but unfamiliar | Users get stuck | Seeded examples per template + live mapped preview against the real response |
| Scope creep toward a full iPaaS | v1 never ships | Explicit non-goals (§4.2) and a phased roadmap |
| Secret mishandling by users | Credential leak | Placeholders in code, env-var injection, and explicit guidance; no secrets in exports |
| Promotion without real validation | Bad connector reaches production | Promotion gated on a passing sandbox test (counter-metric tracked) |

---

## 18. Open questions

- Should production-ready connectors be **locked** from edits, or versioned on
  change (and lose the ready flag until re-tested)?
- Do we need **per-environment credentials** (distinct sandbox vs production
  auth) in v1.x, or is that v2?
- What is the right **pagination** abstraction to add first (cursor vs offset vs
  link-header)?

---

## 19. Roadmap

See **[ROADMAP.md](./ROADMAP.md)** for the phased plan (v1 authoring +
sandbox→production, v2 trust & reach, v3 builder → platform).

---

## Appendix · Glossary

- **Connector / integration** — a saved configuration describing how to call one
  app's API and normalize its response.
- **Canonical schema** — the consistent internal field names a connector maps to.
- **Sandbox** — both the safe test *environment* (sandbox base URL) and the
  static *run mode* (browser-only).
- **Production** — both the live *environment* (production base URL) and the
  *run mode* served by the proxy server.
- **Proxy** — the server endpoint that forwards requests server-side and injects
  secrets, removing the browser CORS limit.
