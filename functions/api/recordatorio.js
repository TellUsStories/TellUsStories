// functions/api/recordatorio.js (Cloudflare Pages)
// Recordatorio a quien empieza el formulario y lo deja a medias. Cris, 24/11/2026: «simplemente un email para que
// recuerden rellenar el formulario». UN SOLO email por persona, nunca más (no insistimos: «no somos ese perfil»).
//
// El formulario avisa en cada paso (desde el paso 2) y al enviar. Se guarda en Workers KV (enlace APORTACIONES,
// claves r:<sha256 del email>) durante 30 días. Make (escenario diario) pide la lista y manda el email desde hello@.
//
//   POST {accion:'paso',  email, prot, tipo, paso, idioma}   → {ok:true}   (formulario, en cada paso)
//   POST {accion:'hecho', email}                             → {ok:true}   (formulario, al enviar la historia)
//   GET  ?accion=pendientes&clave=K                          → {items:[{email, prot, tipo, paso, idioma, ultimo}]}
//        (sin terminar, sin avisar, último paso hace más de 24 h y menos de 7 días)
//   POST {accion:'avisado', email, clave}                    → {ok:true}   (Make, después de mandar el email)
// La clave solo la tiene el escenario de Make (aquí se guarda su huella).

const HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};
const DIAS = 30;
const ESPERA_H = 24;      // horas sin tocar el formulario antes de recordar
const MAX_DIAS = 7;       // si hace más de una semana, ya no se recuerda
const IDIOMAS = ["es", "ca", "en"];

function responde(status, obj) {
  return new Response(JSON.stringify(obj), { status, headers: HEADERS });
}
function corta(v, n) {
  return String(v == null ? "" : v).replace(/[\u0000-\u001f]/g, " ").trim().slice(0, n);
}
function emailValido(e) {
  return typeof e === "string" && e.length <= 120 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}
async function claveDe(email) {
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(email));
  return "r:" + Array.from(new Uint8Array(h)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
}
async function lee(env, k) {
  const t = await env.APORTACIONES.get(k);
  return t ? JSON.parse(t) : null;
}
async function guarda(env, k, d) {
  await env.APORTACIONES.put(k, JSON.stringify(d), { expirationTtl: DIAS * 86400 });
}
// La clave la tiene solo el escenario de Make; aquí está su huella SHA-256 (el repositorio es público)
const CLAVE_HUELLA = "7a12ca5a9247356b3a1ba67ea17ad343a87d9932ffda838b76bc2b14578df67d";
async function claveOk(env, c) {
  if (typeof c !== "string" || c.length < 20) return false;
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(c));
  return Array.from(new Uint8Array(h)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("") === CLAVE_HUELLA;
}

// ---------- El email (Cris lo aprobó el 24/11 con la prueba «La historia de Carmen te está esperando») ----------
function esc(s) {
  return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
const TEXTOS = {
  es: {
    url: "https://taleusstories.com/formulario-nuevo",
    asunto: function (p) { return p === null ? "Tu cuento te está esperando" : p ? "La historia de " + p + " te está esperando" : "Tu historia te está esperando"; },
    hola: "Hola:",
    p1: function (p) { return "Hace unos días empezaste a contarnos " + (p === null ? "<b>una historia</b>" : p ? "la historia de <b>" + esc(p) + "</b>" : "<b>tu historia</b>") + " y se quedó a medias. No te preocupes: lo que ya habías contado sigue guardado. Abre el formulario desde el mismo móvil u ordenador y seguirás justo donde lo dejaste."; },
    boton: function (p) { return p === null ? "Seguir con el cuento" : p ? "Seguir con la historia de " + esc(p) : "Seguir con tu historia"; },
    p2: "Si tienes alguna duda o algo no ha funcionado, responde a este email y te ayudamos.",
    firma: "Un abrazo,<br>Cris · Tale Us Stories",
    eslogan: "Vuestra historia, su cuento favorito.",
  },
  ca: {
    url: "https://taleusstories.com/ca/formulario-nuevo",
    asunto: function (p) { return p === null ? "El teu conte t'està esperant" : p ? "La història de " + p + " t'està esperant" : "La teva història t'està esperant"; },
    hola: "Hola:",
    p1: function (p) { return "Fa uns dies vas començar a explicar-nos " + (p === null ? "<b>una història</b>" : p ? "la història de <b>" + esc(p) + "</b>" : "<b>la teva història</b>") + " i es va quedar a mitges. No pateixis: el que ja ens havies explicat continua guardat. Obre el formulari des del mateix mòbil o ordinador i continuaràs just on ho vas deixar."; },
    boton: function (p) { return p === null ? "Continuar amb el conte" : p ? "Continuar amb la història de " + esc(p) : "Continuar amb la teva història"; },
    p2: "Si tens qualsevol dubte o alguna cosa no ha funcionat, respon aquest correu i t'ajudarem.",
    firma: "Una abraçada,<br>Cris · Tale Us Stories",
    eslogan: "La vostra història, el seu conte preferit.",
  },
  en: {
    url: "https://taleusstories.com/en/formulario-nuevo",
    asunto: function (p) { return p === null ? "Your book is waiting for you" : p ? p + "'s story is waiting for you" : "Your story is waiting for you"; },
    hola: "Hello,",
    p1: function (p) { return "A few days ago you started telling us " + (p === null ? "<b>a story</b>" : p ? "<b>" + esc(p) + "</b>'s story" : "<b>your story</b>") + " and it was left halfway. Don't worry: everything you had already told us is still saved. Open the form on the same phone or computer and you'll pick up right where you left off."; },
    boton: function (p) { return p === null ? "Continue your book" : p ? "Continue " + esc(p) + "'s story" : "Continue your story"; },
    p2: "If you have any questions or something didn't work, just reply to this email and we'll help you.",
    firma: "Warm wishes,<br>Cris · Tale Us Stories",
    eslogan: "Your story, their favourite book.",
  },
};
// 25/11 (tras el «Hola, Yo» de Ana): el nombre del protagonista se limpia antes de usarlo.
//   ""   → es su propia historia («tu historia»), también si escriben «Yo», «Jo», «Me»…
//   null → no sabemos de quién es (campo vacío o raro): texto neutro, sin nombre
//   texto → el nombre, con la primera letra en mayúscula («carmen» → «Carmen»; «mi madre» se deja tal cual)
const YO = /^(yo|jo|i|me|mí|myself|nosotros|nosotras|nosaltres|we)([\s,.(!]|$)/i;
const MINUS = /^(mi|mis|tu|tus|su|sus|la|el|los|las|my|our|the|his|her|their)\s/i;
function nombrePara(d) {
  if (d.propia) return "";
  const n = String(d.prot || "").replace(/\s+/g, " ").trim();
  if (YO.test(n)) return "";
  if (n.length < 2 || !/\p{L}/u.test(n)) return null;
  return MINUS.test(n) ? n : n.charAt(0).toLocaleUpperCase("es") + n.slice(1);
}
function correo(d) {
  const T = TEXTOS[d.idioma] || TEXTOS.es;
  const p = nombrePara(d);
  const f = "font-family:Georgia,'Times New Roman',serif;";
  const html =
    '<!doctype html><html lang="' + (TEXTOS[d.idioma] ? d.idioma : "es") + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>' +
    '<body style="margin:0;padding:0;background:#F3EDE6;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F3EDE6;"><tr><td align="center" style="padding:28px 14px;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background:#FBFAF7;border:1px solid #E3D6C8;border-radius:14px;">' +
    '<tr><td style="padding:30px 30px 6px 30px;' + f + 'text-align:center;"><div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#8C6A55;">Tale Us Stories</div></td></tr>' +
    '<tr><td style="padding:10px 30px 0 30px;' + f + 'color:#4A2C1F;font-size:16px;line-height:1.65;"><p style="margin:0 0 16px 0;">' + T.hola + '</p><p style="margin:0 0 16px 0;">' + T.p1(p) + '</p></td></tr>' +
    '<tr><td align="center" style="padding:10px 30px 22px 30px;"><a href="' + T.url + '" style="display:inline-block;background:#4A2C1F;color:#FBFAF7;' + f + 'font-size:16px;text-decoration:none;padding:13px 26px;border-radius:30px;">' + T.boton(p) + '</a></td></tr>' +
    '<tr><td style="padding:0 30px 26px 30px;' + f + 'color:#4A2C1F;font-size:16px;line-height:1.65;"><p style="margin:0 0 16px 0;">' + T.p2 + '</p><p style="margin:0;">' + T.firma + '</p></td></tr>' +
    '<tr><td style="padding:16px 30px 24px 30px;border-top:1px solid #E3D6C8;' + f + 'text-align:center;color:#6F5A4C;font-size:14px;font-style:italic;">' + T.eslogan + '<br><a href="https://taleusstories.com" style="color:#8C6A55;font-style:normal;font-size:13px;">taleusstories.com</a></td></tr>' +
    '</table></td></tr></table></body></html>';
  return { asunto: T.asunto(p), html };
}

export async function onRequestOptions() {
  return new Response("", { status: 200, headers: HEADERS });
}

export async function onRequestGet({ request, env }) {
  if (!env.APORTACIONES) return responde(500, { error: "Falta el almacén" });
  const q = new URL(request.url).searchParams;
  if (q.get("accion") !== "pendientes") return responde(400, { error: "Acción desconocida" });
  if (!(await claveOk(env, q.get("clave") || ""))) return responde(403, { error: "No autorizado" });
  const ahora = Date.now(), items = [];
  const prueba = (q.get("prueba") || "").trim().toLowerCase();
  let cursor;
  do {
    const lista = await env.APORTACIONES.list({ prefix: "r:", cursor });
    for (const k of lista.keys) {
      const d = await lee(env, k.name);
      if (!d || d.hecho || d.avisado) continue;
      const t = Date.parse(d.ultimo);
      // &prueba=<email>: ese email sale aunque no hayan pasado 24 h (para probar el escenario de Make)
      const esPrueba = prueba && d.email === prueba;
      if (!esPrueba && !(t < ahora - ESPERA_H * 3600000 && t > ahora - MAX_DIAS * 86400000)) continue;
      if (prueba && !esPrueba) continue;
      const c = correo(d);
      items.push({ email: d.email, prot: d.prot, tipo: d.tipo, propia: d.propia ? 1 : 0, paso: d.paso, idioma: d.idioma, ultimo: d.ultimo, asunto: c.asunto, html: c.html });
    }
    cursor = lista.list_complete ? null : lista.cursor;
  } while (cursor);
  return responde(200, { items, n: items.length });
}

export async function onRequestPost({ request, env }) {
  if (!env.APORTACIONES) return responde(500, { error: "Falta el almacén" });
  let b;
  try { b = await request.json(); } catch (e) { return responde(400, { error: "Petición no válida" }); }
  const email = corta(b.email, 120).toLowerCase();
  if (!emailValido(email)) return responde(400, { error: "Email no válido" });
  const k = await claveDe(email);
  const ahora = new Date().toISOString();

  if (b.accion === "paso") {
    const d = (await lee(env, k)) || { email, inicio: ahora, avisado: false };
    d.email = email;
    d.prot = corta(b.prot, 60) || d.prot || "";
    d.tipo = corta(b.tipo, 40) || d.tipo || "";
    d.propia = b.propia ? 1 : 0;      // su propia historia → el email dice «tu historia»
    d.paso = Math.max(1, Math.min(20, parseInt(b.paso, 10) || 1));
    d.idioma = IDIOMAS.includes(b.idioma) ? b.idioma : (d.idioma || "es");
    d.ultimo = ahora;
    d.hecho = false;          // si empieza otra historia después de enviar una, vuelve a contar (pero «avisado» se queda)
    await guarda(env, k, d);
    return responde(200, { ok: true });
  }

  if (b.accion === "hecho") {
    const d = (await lee(env, k)) || { email, inicio: ahora, avisado: false };
    d.hecho = true;
    d.hecho_en = ahora;
    await guarda(env, k, d);
    return responde(200, { ok: true });
  }

  if (b.accion === "avisado") {
    if (!(await claveOk(env, b.clave))) return responde(403, { error: "No autorizado" });
    const d = await lee(env, k);
    if (!d) return responde(404, { error: "No encontrado" });
    d.avisado = true;
    d.avisado_en = ahora;
    await guarda(env, k, d);
    return responde(200, { ok: true });
  }

  return responde(400, { error: "Acción desconocida" });
}
