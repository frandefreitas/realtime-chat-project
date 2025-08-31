export const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api").replace(/\/+$/, "");
export const ROOT = API.endsWith("/api") ? API.slice(0, -4) : API;

async function handle(r) {
  if (!r.ok) {
    let msg = `HTTP ${r.status}`;
    try { const j = await r.json(); msg = j?.message || j?.error || msg; } catch {}
    const e = new Error(msg); e.status = r.status; throw e;
  }
  const ct = r.headers.get("content-type") || "";
  return ct.includes("application/json") ? r.json() : r.text();
}

export function getJSON(path) {
  return fetch(`${API}${path}`, { credentials: "include" }).then(handle);
}
export function postJSON(path, body) {
  return fetch(`${API}${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  }).then(handle);
}
export function postForm(path, formData) {
  return fetch(`${API}${path}`, {
    method: "POST",
    credentials: "include",
    body: formData
  }).then(handle);
}