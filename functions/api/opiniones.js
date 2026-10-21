// functions/api/opiniones.js (Cloudflare Pages)
// Las opiniones de las familias que Cris ha publicado (las guarda Make, escenario «Opiniones de las familias»).
// Se guardan 30 minutos en la caché de Cloudflare: así Make no trabaja (ni gasta) en cada visita a la web.

const LISTAR = "https://hook.eu1.make.com/mfgouvb9ekyasirnmlzkb8rs6w2nefz3?accion=listar";
const MINUTOS = 30;

const HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": `public, max-age=${MINUTOS * 60}`,
};

// Solo lo que se enseña en la web (nunca el email de la familia)
function limpia(lista) {
  if (!Array.isArray(lista)) return [];
  return lista
    .filter((o) => o && o.texto && o.nombre && Number(o.estrellas) >= 1)
    .map((o) => ({
      nombre: String(o.nombre).slice(0, 60),
      estrellas: Math.max(1, Math.min(5, Math.round(Number(o.estrellas)))),
      texto: String(o.texto).slice(0, 1200),
      para: o.para ? String(o.para).slice(0, 80) : "",
      fecha: o.fecha ? String(o.fecha).slice(0, 10) : "",
    }));
}

export async function onRequestGet(context) {
  const cache = caches.default;
  const clave = new Request(new URL("/api/opiniones", context.request.url).toString());
  const guardada = await cache.match(clave);
  if (guardada) return guardada;

  let opiniones = [];
  try {
    const res = await fetch(LISTAR);
    if (res.ok) opiniones = limpia(await res.json());
  } catch (e) {
    opiniones = [];
  }
  const respuesta = new Response(JSON.stringify(opiniones), { status: 200, headers: HEADERS });
  context.waitUntil(cache.put(clave, respuesta.clone()));
  return respuesta;
}
