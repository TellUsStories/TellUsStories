// functions/api/aportaciones.js (Cloudflare Pages)
// Formulario colaborativo: quien encarga el libro crea un enlace secreto (/aportar?c=…) y lo pasa a otras
// personas (hermanos, la pareja, la propia protagonista…), que añaden sus recuerdos por etapas.
// Se guardan en Workers KV (enlace APORTACIONES del proyecto de Pages) durante 120 días.
// El formulario las lee al enviar el pedido y las añade a la nota de su etapa, firmadas («Aportación de Jordi»).
//
//   POST {accion:'crear', prot, quien}                  → {id}
//   GET  ?c=<id>                                        → {prot, quien, items:[{nombre, relacion, etapa, texto, fecha}]}
//   POST {accion:'aportar', c, nombre, relacion, etapa, texto, fotos:[b64…]} → {ok:true, n}
//   GET  ?c=<id>&f=<n>  → foto n en JPEG (&b64=1 → en base64)

const HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};
const ETAPAS = ["infancia", "juventud", "familia", "ninos", "otros"];
const DIAS = 120;
const MAX_ITEMS = 60;
const MAX_FOTOS = 20;              // por enlace
const FOTOS_POR_APORTACION = 3;
const MAX_FOTO_B64 = 1500000;      // ~1,1 MB de JPEG (el navegador las deja en ~200-400 KB)

function responde(status, obj) {
  return new Response(JSON.stringify(obj), { status, headers: HEADERS });
}
function corta(v, n) {
  return String(v == null ? "" : v).replace(/\u0000/g, "").trim().slice(0, n);
}
function idValido(id) {
  return typeof id === "string" && /^[a-z0-9]{20}$/.test(id);
}
function nuevoId() {
  const abc = "abcdefghijklmnopqrstuvwxyz0123456789";
  const b = new Uint8Array(20);
  crypto.getRandomValues(b);
  let s = "";
  for (let i = 0; i < b.length; i++) s += abc[b[i] % abc.length];
  return s;
}
async function lee(env, id) {
  const t = await env.APORTACIONES.get("c:" + id);
  return t ? JSON.parse(t) : null;
}
async function guarda(env, id, datos) {
  await env.APORTACIONES.put("c:" + id, JSON.stringify(datos), { expirationTtl: DIAS * 86400 });
}

export async function onRequestOptions() {
  return new Response("", { status: 200, headers: HEADERS });
}

export async function onRequestGet({ request, env }) {
  if (!env.APORTACIONES) return responde(500, { error: "Falta el almacén APORTACIONES" });
  const q = new URL(request.url).searchParams;
  const id = q.get("c") || "";
  if (!idValido(id)) return responde(400, { error: "Enlace no válido" });
  // ?c=<id>&f=<n> → la foto n (JPEG). ?b64=1 la devuelve en base64 (texto), para el formulario
  if (q.has("f")) {
    const n = parseInt(q.get("f"), 10);
    if (!(n > 0)) return responde(400, { error: "Foto no válida" });
    const f = await env.APORTACIONES.get("f:" + id + ":" + n);
    if (!f) return responde(404, { error: "Foto no encontrada" });
    if (q.get("b64") === "1") return new Response(f, { status: 200, headers: { ...HEADERS, "Content-Type": "text/plain; charset=utf-8" } });
    const bin = Uint8Array.from(atob(f), function (c) { return c.charCodeAt(0); });
    return new Response(bin, { status: 200, headers: { ...HEADERS, "Content-Type": "image/jpeg", "Cache-Control": "private, max-age=86400" } });
  }
  const d = await lee(env, id);
  if (!d) return responde(404, { error: "Este enlace ha caducado o no existe" });
  return responde(200, { prot: d.prot, quien: d.quien, g: d.g || "", items: d.items || [] });
}

export async function onRequestPost({ request, env }) {
  if (!env.APORTACIONES) return responde(500, { error: "Falta el almacén APORTACIONES" });
  let b;
  try { b = await request.json(); } catch (e) { return responde(400, { error: "Petición no válida" }); }

  if (b.accion === "crear") {
    const prot = corta(b.prot, 60), quien = corta(b.quien, 60);
    if (!prot) return responde(400, { error: "Falta el nombre del protagonista" });
    const id = nuevoId(), g = b.g === "f" ? "f" : b.g === "m" ? "m" : "";
    await guarda(env, id, { prot, quien, g, creado: new Date().toISOString(), items: [] });
    return responde(200, { id });
  }

  if (b.accion === "aportar") {
    const id = b.c;
    if (!idValido(id)) return responde(400, { error: "Enlace no válido" });
    const d = await lee(env, id);
    if (!d) return responde(404, { error: "Este enlace ha caducado o no existe" });
    const nombre = corta(b.nombre, 50), relacion = corta(b.relacion, 50), texto = corta(b.texto, 12000);
    const etapa = ETAPAS.includes(b.etapa) ? b.etapa : "otros";
    // Fotos: JPEG en base64 (el navegador ya las reduce); cada una en su propia clave f:<id>:<n>
    const fotos = (Array.isArray(b.fotos) ? b.fotos : []).filter(function (f) {
      return typeof f === "string" && f.length > 100 && f.length <= MAX_FOTO_B64 && /^[A-Za-z0-9+/=]+$/.test(f);
    }).slice(0, FOTOS_POR_APORTACION);
    if (!nombre) return responde(400, { error: "Pon tu nombre" });
    if (texto.length < 3 && !fotos.length) return responde(400, { error: "Cuéntanos algún recuerdo o añade una foto" });
    d.items = d.items || [];
    if (d.items.length >= MAX_ITEMS) return responde(400, { error: "Ya hay muchas aportaciones en este enlace" });
    d.nf = d.nf || 0;
    if (d.nf + fotos.length > MAX_FOTOS) return responde(400, { error: "Ya hay muchas fotos en este enlace (máximo " + MAX_FOTOS + ")" });
    const nums = [];
    for (const f of fotos) {
      d.nf++;
      await env.APORTACIONES.put("f:" + id + ":" + d.nf, f, { expirationTtl: DIAS * 86400 });
      nums.push(d.nf);
    }
    const item = { nombre, relacion, etapa, texto, fecha: new Date().toISOString() };
    if (nums.length) item.fotos = nums;
    d.items.push(item);
    await guarda(env, id, d);
    return responde(200, { ok: true, n: d.items.length });
  }

  return responde(400, { error: "Acción desconocida" });
}
