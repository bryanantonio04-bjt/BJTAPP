export default async function handler(req, res) {
  // ==========================
  // CORS (permitimos tu app)
  // ==========================
  res.setHeader("Access-Control-Allow-Origin", "https://app.bjtsolution.com");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ==========================
  // Apps Script real
  // ==========================
  const TARGET =
    "https://script.google.com/macros/s/AKfycbxylg1tPkCfmE8sYzuIlBwtk9qGX3QOTr6FKXel99tgpGRvgzjwJ67_llhsCS4A27XI/exec";

  try {
    // Reenviar querystring (?action=load, ?action=ping, etc.)
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

    res
      .status(r.status)
      .setHeader("Content-Type", "application/json; charset=utf-8");

    return res.send(text);
  } catch (e) {
    console.error("Proxy error:", e);
    return res.status(500).json({
      ok: false,
      error: String(e?.message || e)
    });
  }
}
