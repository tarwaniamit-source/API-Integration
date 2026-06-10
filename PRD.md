# Product Requirements Document — API Integration Builder

**Author:** Amit Tarwani · Senior Product Manager
**Status:** Prototype (v1) · **Last updated:** 2026
**Type:** Personal portfolio project

> This is an independent, unbranded prototype built to demonstrate product
> thinking and a working slice of a no-code integration tool. It is not
> affiliated with, and contains no branding from, any commercial product.

---

## 1. Problem

Mid-to-large organizations run hundreds of SaaS applications. To govern spend,
licenses, and access, a SaaS-management platform needs data *out* of each of
those apps — usually via their REST APIs. Building each connector by hand is
slow: every engineer re-discovers the same auth quirks, pagination, and
response shapes, and non-engineers (IT admins, ops) can't contribute at all.

**The cost of the status quo**

- Every new connector is an engineering ticket; the backlog gates how fast the
  platform can add coverage.
- Connector logic is inconsistent — auth and field mapping are re-invented per
  integration, which makes them hard to maintain.
- IT/ops teams who understand the target app can't self-serve; they file
  requests and wait.

## 2. Goal

Let a technical-but-not-engineer user **configure, test, and ship a working API
connector in minutes**, without writing or deploying code, and produce an
artifact (config + generated code) that engineering can trust and version.

**Non-goals (v1)**

- Scheduling / running syncs on a cadence (this is a *builder*, not a runner).
- Storing production secrets (v1 keeps secrets local and emits placeholders).
- OAuth *authorization-code* flows requiring a redirect server.

## 3. Target users

| Persona | Need | Success looks like |
| --- | --- | --- |
| **IT / SaaS admin** (primary) | Pull users & licenses from an app they own | Builds a connector from a template, tests it, exports config — no ticket filed |
| **Integration engineer** | A consistent starting point and trustworthy code | Reviews exported JSON + generated snippet instead of writing from scratch |
| **Ops / data analyst** | Normalized data across apps | Field mapping yields the same schema regardless of source app |

## 4. User stories & acceptance criteria

| ID | Story | Priority | Acceptance |
| --- | --- | --- | --- |
| US-1 | As an admin, I can start from a template for a common app so I don't configure everything from zero. | Must | Catalog prefills base URL, auth type, a starter endpoint, and sample mappings. |
| US-2 | As an admin, I can configure auth (API key, bearer, basic, OAuth2 client-creds). | Must | Each method exposes the right fields; secrets never appear in generated code. |
| US-3 | As an admin, I can define one or more endpoints with method, path, query, headers, body. | Must | Endpoints render with method coloring; body shown only for write methods. |
| US-4 | As an analyst, I can map response fields to canonical names. | Must | Dot/array (`data[].email`) paths resolve against a real response in the preview. |
| US-5 | As an admin, I can test a request live and see the response and timing. | Must | Live call returns status, latency, body; CORS failures explained, not silent. |
| US-6 | As an engineer, I can export the connector as code/config. | Must | One click yields valid cURL, JS `fetch`, Python `requests`, and portable JSON. |
| US-7 | As a user, my work persists and I can manage many connectors. | Must | Save/edit/duplicate/delete/import; survives reload. |

## 5. Solution overview

A single-screen builder organized as a five-step pipeline that mirrors how an
integration actually flows:

```
Source API → Authentication → Endpoint → Field Mapping → Your Schema
```

The pipeline is shown live at the top of the builder and updates as the user
configures each stage, so the abstract idea of "an integration" stays concrete.
Output is two-fold: a **portable JSON config** (for version control and
engineering hand-off) and **ready-to-run code** in three languages.

## 6. Key product decisions & trade-offs

- **Builder, not runner.** Shipping the *authoring* experience first proves the
  hardest UX problem (making API config approachable) without taking on
  scheduling, storage, and secrets-management infra. Those are fast-followers.
- **Placeholders over stored secrets.** Generated code uses `$TOKEN` / `$API_KEY`
  env vars. This is safer, makes snippets shareable, and teaches good hygiene —
  at the cost of one extra step before a snippet runs.
- **Browser-side live test.** Instant feedback with zero backend. The trade-off
  is CORS: some APIs block browser calls. We turn that failure into a teachable
  moment rather than a dead end, and the generated server-side code always works.
- **Catalog templates.** Most value comes from a few high-frequency apps, so we
  seed templates rather than chase breadth in v1.

## 7. Success metrics

| Metric | Why it matters | Target (directional) |
| --- | --- | --- |
| Time to first successful test | Core promise is speed | < 5 min from template to a 2xx |
| % of connectors started from a template | Validates catalog value | > 60% |
| Connectors exported / saved per active user | Real output, not tire-kicking | ≥ 2 |
| Self-serve rate (built without engineering) | The whole point | > 50% of new connectors |

## 8. Risks

- **CORS limits live testing** for many real APIs → mitigated by clear messaging
  + always-correct exported code; a server-side proxy is the v2 fix.
- **Field-mapping paths are powerful but unfamiliar** → mitigated by seeded
  examples and a live mapped-preview against the actual response.
- **Scope creep toward a full iPaaS** → the explicit non-goals keep v1 honest.

## 9. Roadmap

See [ROADMAP.md](./ROADMAP.md).
