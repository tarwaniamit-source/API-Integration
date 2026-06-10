/**
 * API Integration Builder — production server.
 * Zero dependencies. Requires Node 18+ (uses the built-in global fetch).
 *
 *   node server/index.js
 *
 *   - Serves the static app from the project root.
 *   - GET  /api/health  -> { status, proxy:true }  (app flips to Production mode)
 *   - POST /api/proxy   -> forwards a request server-side, bypassing browser CORS.
 *
 * Secrets: any string in the proxied url/headers/body shaped like ${ENV:NAME}
 * is replaced from process.env.NAME before sending — so production credentials
 * live in the server environment, never in the browser or a repo.
 */
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const ROOT = path.resolve(__dirname, "..");
const MAX_BODY = 1_000_000;

const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon",
  ".md": "text/markdown; charset=utf-8",
};

function injectEnv(value) {
  if (typeof value === "string")
    return value.replace(/\$\{ENV:([A-Z0-9_]+)\}/g, (_, n) => (process.env[n] != null ? process.env[n] : ""));
  if (Array.isArray(value)) return value.map(injectEnv);
  if (value && typeof value === "object") {
    const out = {}; for (const k of Object.keys(value)) out[k] = injectEnv(value[k]); return out;
  }
  return value;
}
function sendJson(res, code, obj) {
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(obj));
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on("data", (c) => { size += c.length; if (size > MAX_BODY) { reject(new Error("body too large")); req.destroy(); return; } chunks.push(c); });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}
async function handleProxy(req, res) {
  let payload;
  try { payload = JSON.parse(await readBody(req)); }
  catch (e) { return sendJson(res, 400, { error: "Invalid JSON body" }); }
  const method = (payload.method || "GET").toUpperCase();
  const url = injectEnv(payload.url);
  const headers = injectEnv(payload.headers || {});
  const body = payload.body != null ? injectEnv(payload.body) : undefined;
  if (!/^https?:\/\//i.test(url || "")) return sendJson(res, 400, { error: "url must be an absolute http(s) URL" });
  const t0 = Date.now();
  try {
    const upstream = await fetch(url, { method, headers, body: ["GET", "HEAD"].includes(method) ? undefined : body });
    const text = await upstream.text();
    const respHeaders = {}; upstream.headers.forEach((v, k) => { respHeaders[k] = v; });
    return sendJson(res, 200, { ok: upstream.ok, status: upstream.status, statusText: upstream.statusText, ms: Date.now() - t0, headers: respHeaders, body: text });
  } catch (err) { return sendJson(res, 502, { error: "Upstream request failed: " + err.message }); }
}
function serveStatic(req, res) {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/") urlPath = "/index.html";
  const filePath = path.join(ROOT, path.normalize(urlPath));
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); return res.end("Forbidden"); }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (!path.extname(filePath))
        return fs.readFile(path.join(ROOT, "index.html"), (e2, d2) => {
          if (e2) { res.writeHead(404); return res.end("Not found"); }
          res.writeHead(200, { "Content-Type": MIME[".html"] }); res.end(d2);
        });
      res.writeHead(404); return res.end("Not found");
    }
    res.writeHead(200, { "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream" });
    res.end(data);
  });
}
http.createServer((req, res) => {
  const url = req.url.split("?")[0];
  if (url === "/api/health") return sendJson(res, 200, { status: "ok", proxy: true, version: 1 });
  if (url === "/api/proxy" && req.method === "POST") return handleProxy(req, res).catch((e) => sendJson(res, 500, { error: e.message }));
  if (url.startsWith("/api/")) return sendJson(res, 404, { error: "Unknown endpoint" });
  if (req.method !== "GET") { res.writeHead(405); return res.end("Method not allowed"); }
  return serveStatic(req, res);
}).listen(PORT, () => {
  console.log(`API Integration Builder (production) -> http://localhost:${PORT}`);
  console.log(`Proxy active. Set secrets as env vars; reference them as \${ENV:NAME}.`);
});
