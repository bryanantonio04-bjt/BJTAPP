export default async function handler(req, res) {
  // ==========================
  // CORS (allowlist)
  // ==========================
  const allowlist = new Set([
    "https://app.bjtsolution.com",
    "http://localhost:3000",
    "http://localhost:5173"
  ]);

  const origin = req.headers.origin;
  if (origin && allowlist.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  // ==========================
  // Apps Script real (por ENV)
  // ==========================
  const TARGET = process.env.SHEETS_TARGET_URL ||
    "https://script.google.com/macros/s/AKfycbxylg1tPkCfmE8sYzuIlBwtk9qGX3QOTr6FKXel99tgpGRvgzjwJ67_llhsCS4A27XI/exec";

  try {
    // Reenviar querystring (?action=load, etc.)
    const url = new URL(TARGET);
    const qs = new URLSearchParams(req.query || {}).toString();
    if (qs) url.search = qs;

    const init = {
      method: req.method,
      headers: { "Content-Type": "application/json" }
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      init.body = JSON.stringify(req.body || {});
    }

    const r = await fetch(url.toString(), init);
    const text = await r.text();

    // Fuerza JSON: si upstream no devuelve JSON, avisamos bonito
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      return res.status(502).json({
        ok: false,
        error: "Upstream did not return JSON",
        status: r.status,
        preview: text.slice(0, 400)
      });
    }

    return res.status(r.status).json(json);
  } catch (e) {
    console.error("Proxy error:", e);
    return res.status(500).json({
      ok: false,
      error: String(e?.message || e)
    });
  }
}

