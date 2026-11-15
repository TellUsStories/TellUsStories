// functions/api/opiniones.js (Cloudflare Pages)
// Las opiniones de las familias que Cris ha publicado (las guarda Make, escenario «Opiniones de las familias»).
// Se guardan 30 minutos en la caché de Cloudflare: así Make no trabaja (ni gasta) en cada visita a la web.
// ?idioma=ca o ?idioma=en (webs /ca/ y /en/): el texto se traduce con Claude Haiku y la traducción se guarda
// 7 días por cada versión de las opiniones (solo se vuelve a traducir si cambian). Si falla, salen en castellano.

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

async function originales(context) {
  const cache = caches.default;
  const clave = new Request(new URL("/api/opiniones", context.request.url).toString());
  const guardada = await cache.match(clave);
  if (guardada) return guardada.json();
  let opiniones = [];
  try {
    const res = await fetch(LISTAR);
    if (res.ok) opiniones = limpia(await res.json());
  } catch (e) {
    opiniones = [];
  }
  const respuesta = new Response(JSON.stringify(opiniones), { status: 200, headers: HEADERS });
  context.waitUntil(cache.put(clave, respuesta));
  return opiniones;
}

async function huella(texto) {
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
  return [...new Uint8Array(h)].slice(0, 8).map((b) => b.toString(16).padStart(2, "0")).join("");
}

const IDIOMAS = {
  ca: "catalán (normativo, natural, como se habla en Cataluña; di «mare» y «pare», nunca «mama» ni «papa»)",
  en: "inglés británico natural",
};

async function traduce(env, lista, idioma) {
  const entrada = lista.map((o, i) => ({ i, texto: o.texto, para: o.para }));
  const prompt = `Traduce al ${IDIOMAS[idioma]} estas opiniones de familias sobre un cuento personalizado (Tale Us Stories). Son palabras reales de clientes: tradúcelas fielmente, con su mismo tono y sin añadir, quitar ni mejorar nada. No traduzcas los nombres propios ni «Tale Us Stories». "para" es para quién era el libro: tradúcelo igual (si está vacío, déjalo vacío). Devuelve el mismo "i".\n\n${JSON.stringify(entrada)}`;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-workspace-id": env.ANTHROPIC_WORKSPACE_ID || "wrkspc_01BRHfCojsgdwHrKUbmpEppn",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-5-5",
      max_tokens: 4000,
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              opiniones: {
                type: "array",
                items: {
                  type: "object",
                  properties: { i: { type: "integer" }, texto: { type: "string" }, para: { type: "string" } },
                  required: ["i", "texto", "para"],
                  additionalProperties: false,
                },
              },
            },
            required: ["opiniones"],
            additionalProperties: false,
          },
        },
      },
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error("Anthropic " + res.status);
  const data = await res.json();
  const bloque = (data.content || []).find((b) => b.type === "text");
  const r = JSON.parse(bloque.text).opiniones;
  return lista.map((o, i) => {
    const t = r.find((x) => x.i === i);
    return t && t.texto ? { ...o, texto: t.texto, para: o.para ? t.para || o.para : "", traducida: true } : o;
  });
}

export async function onRequestGet(context) {
  const lista = await originales(context);
  const idioma = new URL(context.request.url).searchParams.get("idioma");
  if (!IDIOMAS[idioma] || !lista.length || !context.env.ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify(lista), { status: 200, headers: HEADERS });
  }
  // Una traducción por idioma y por versión de las opiniones
  const cache = caches.default;
  const h = await huella(JSON.stringify(lista));
  const clave = new Request(new URL(`/api/opiniones?idioma=${idioma}&v=${h}`, context.request.url).toString());
  const guardada = await cache.match(clave);
  if (guardada) return new Response(guardada.body, { status: 200, headers: HEADERS });
  try {
    const traducidas = await traduce(context.env, lista, idioma);
    const cuerpo = JSON.stringify(traducidas);
    context.waitUntil(cache.put(clave, new Response(cuerpo, { headers: { ...HEADERS, "Cache-Control": "public, max-age=604800" } })));
    return new Response(cuerpo, { status: 200, headers: HEADERS });
  } catch (e) {
    return new Response(JSON.stringify(lista), { status: 200, headers: HEADERS });
  }
}
