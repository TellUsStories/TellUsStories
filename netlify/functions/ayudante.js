// netlify/functions/ayudante.js
// El ayudante del formulario: lee lo que la familia ha contado de una etapa y devuelve, en JSON,
// las preguntas que faltan (como mucho 3) y un resumen para que lo confirmen; también corrige
// la dedicatoria (solo faltas, sin cambiar palabras). Llama a la API de Anthropic con fetch, igual
// que transcribe.js llama a Whisper. La clave va en la variable de entorno ANTHROPIC_API_KEY de Netlify.

const MODELO = "claude-opus-5-5";
const LIMITE = 12000; // caracteres por campo, para que nadie mande un texto enorme

const HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

function corta(t) { return String(t == null ? "" : t).slice(0, LIMITE); }
function responde(statusCode, obj) { return { statusCode, headers: HEADERS, body: JSON.stringify(obj) }; }

// Esquemas de la respuesta (structured outputs): la IA solo puede contestar con este JSON
const ESQUEMA_REVISAR = {
  type: "object",
  properties: {
    preguntas: { type: "array", items: { type: "string" } },
    resumen: { type: "string" },
  },
  required: ["preguntas", "resumen"],
  additionalProperties: false,
};
const ESQUEMA_DEDICATORIA = {
  type: "object",
  properties: {
    texto: { type: "string" },
    firma: { type: "string" },
    hayCambios: { type: "boolean" },
  },
  required: ["texto", "firma", "hayCambios"],
  additionalProperties: false,
};

function promptRevisar(d) {
  const imprescindibles = (d.imprescindibles || []).map((x) => "- " + corta(x)).join("\n");
  return `Ayudas a una familia a rellenar el formulario de un libro ilustrado personalizado: la historia real de ${corta(d.protagonista) || "una persona"}, contada para ${corta(d.ninos) || "sus niños"}. Ahora están en la etapa «${corta(d.etapaNombre)}».

Esto es lo que han contado (transcrito de notas de voz o escrito; puede tener errores de transcripción):
<contado>
${corta(d.texto)}
</contado>
<respuestas_anteriores>
${corta(d.respuestasPrevias) || "(ninguna)"}
</respuestas_anteriores>

Lo imprescindible de esta etapa para poder escribir el libro:
${imprescindibles}

Devuelve:
1. "preguntas": como mucho 2 preguntas cortas, cálidas y fáciles de contestar, SOLO sobre datos imprescindibles que falten. No preguntes nada que ya esté contado (aunque sea de pasada) ni lo que no aplica (si dicen que no tenía hermanos o que no hay pareja, no lo vuelvas a preguntar). Si en lo contado no hay ningún recuerdo concreto ni anécdota, puedes usar una de las preguntas para pedir algo sencillo y cotidiano de esta etapa (por ejemplo: si tenía algún amigo o amiga especial, su juego favorito, qué quería ser de mayor). Si ya está todo, devuelve la lista vacía: es lo mejor si no falta nada importante. Tutea a la familia y habla en español de España. Usa el nombre de la protagonista.
2. "resumen": un resumen en español de lo que has entendido de esta etapa, en 3 a 6 líneas que empiecen por «• », con los datos concretos (nombres, lugares, anécdotas), para que la familia compruebe que lo has entendido bien. No inventes nada que no hayan dicho. Si en las respuestas anteriores hay una «CORRECCIÓN DE LA FAMILIA», aplícala: manda sobre lo que se contó antes, y el resumen debe reflejarla.`;
}

function promptDedicatoria(d) {
  return `Corrige SOLO la ortografía, las tildes, las mayúsculas y los signos de puntuación (incluidos los de apertura ¿ ¡) de esta dedicatoria y de su firma. No cambies ninguna palabra, no añadas ni quites nada, no la reescribas ni la embellezcas: tiene que seguir siendo exactamente la dedicatoria de quien la escribió. Si ya estaba bien, devuélvela igual y "hayCambios": false.
<dedicatoria>
${corta(d.texto)}
</dedicatoria>
<firma>
${corta(d.firma)}
</firma>`;
}

async function preguntaAClaude(prompt, esquema) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      // Si un filtro de seguridad rechazara la petición, se reintenta sola con otro modelo
      "anthropic-beta": "server-side-fallback-2026-07-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODELO,
      max_tokens: 4000,
      fallbacks: "default",
      output_config: { effort: "low", format: { type: "json_schema", schema: esquema } },
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const raw = await res.text();
  if (!res.ok) throw new Error("Anthropic " + res.status + ": " + raw.slice(0, 300));
  const data = JSON.parse(raw);
  if (data.stop_reason === "refusal") throw new Error("La IA no ha podido responder (refusal)");
  const bloque = (data.content || []).find((b) => b.type === "text");
  if (!bloque) throw new Error("Respuesta sin texto");
  return JSON.parse(bloque.text);
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers: HEADERS, body: "" };
  if (event.httpMethod !== "POST") return responde(405, { error: "Method Not Allowed" });
  if (!process.env.ANTHROPIC_API_KEY) return responde(500, { error: "ANTHROPIC_API_KEY no configurada" });

  let d;
  try { d = JSON.parse(event.body || "{}"); } catch (e) { return responde(400, { error: "JSON no válido" }); }

  try {
    if (d.accion === "revisar") {
      const r = await preguntaAClaude(promptRevisar(d), ESQUEMA_REVISAR);
      return responde(200, { preguntas: (r.preguntas || []).slice(0, 2), resumen: r.resumen || "" });
    }
    if (d.accion === "dedicatoria") {
      if (!String(d.texto || "").trim()) return responde(200, { texto: "", firma: d.firma || "", hayCambios: false });
      const r = await preguntaAClaude(promptDedicatoria(d), ESQUEMA_DEDICATORIA);
      return responde(200, r);
    }
    return responde(400, { error: "Acción desconocida" });
  } catch (err) {
    console.log("ERROR ayudante:", err.message);
    // El formulario nunca se bloquea: si algo falla, sigue sin ayuda de la IA
    return responde(502, { error: err.message });
  }
};
