// functions/api/aportaciones.js (Cloudflare Pages)
// Formulario colaborativo: quien encarga el libro crea un enlace secreto (/aportar?c=…) y lo pasa a otras
// personas (hermanos, la pareja, la propia protagonista…), que añaden sus recuerdos por etapas.
// Se guardan en Workers KV (enlace APORTACIONES del proyecto de Pages) durante 120 días.
// El formulario las lee al enviar el pedido y las añade a la nota de su etapa, firmadas («Aportación de Jordi»).
//
//   POST {accion:'crear', prot, quien}                  → {id}
//   GET  ?c=<id>                                        → {prot, quien, items:[{nombre, relacion, etapa, texto, fecha}]}
//   POST {accion:'aportar', c, nombre, relacion, etapa, texto} → {ok:true, n}

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
  const id = new URL(request.url).searchParams.get("c") || "";
  if (!idValido(id)) return responde(400, { error: "Enlace no válido" });
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
    if (!nombre) return responde(400, { error: "Pon tu nombre" });
    if (texto.length < 3) return responde(400, { error: "Cuéntanos algún recuerdo" });
    d.items = d.items || [];
    if (d.items.length >= MAX_ITEMS) return responde(400, { error: "Ya hay muchas aportaciones en este enlace" });
    d.items.push({ nombre, relacion, etapa, texto, fecha: new Date().toISOString() });
    await guarda(env, id, d);
    return responde(200, { ok: true, n: d.items.length });
  }

  return responde(400, { error: "Acción desconocida" });
}
