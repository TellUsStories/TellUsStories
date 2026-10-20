// functions/api/transcribe.js (Cloudflare Pages)
// Recibe audio en base64, lo transcribe con Whisper (OpenAI) y devuelve el texto.
// Es la misma función que netlify/functions/transcribe.js, adaptada a Cloudflare: la clave va en la variable OPENAI_API_KEY del proyecto.

const HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function responde(status, obj) {
  return new Response(JSON.stringify(obj), { status, headers: { ...HEADERS, "Content-Type": "application/json" } });
}

export async function onRequestOptions() {
  return new Response("", { status: 200, headers: HEADERS });
}

export async function onRequestPost({ request, env }) {
  try {
    if (!env.OPENAI_API_KEY) return responde(500, { error: "OPENAI_API_KEY no configurada" });

    const { audioBase64, mimeType } = await request.json();
    if (!audioBase64) return responde(400, { error: "No se recibio audio" });

    // base64 → bytes (en Cloudflare no hay Buffer)
    const bin = atob(audioBase64);
    const audio = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) audio[i] = bin.charCodeAt(i);

    // Extensión según el formato real (el iPhone graba en mp4; Whisper usa la extensión para reconocerlo)
    const EXTS = { webm: "webm", mp4: "mp4", "x-m4a": "m4a", m4a: "m4a", ogg: "ogg", wav: "wav", mpeg: "mp3" };
    const sub = ((mimeType || "").split(";")[0].split("/")[1] || "").toLowerCase();
    const ext = EXTS[sub] || "webm";

    const form = new FormData();
    form.append("file", new File([audio], "audio." + ext, { type: mimeType || "audio/webm" }));
    form.append("model", "whisper-1");
    form.append("language", "es");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}` },
      body: form,
    });

    const rawText = await response.text();
    let data;
    try { data = JSON.parse(rawText); } catch (e) {
      return responde(500, { error: "Respuesta no JSON de Whisper: " + rawText.substring(0, 200) });
    }
    if (!response.ok) return responde(response.status, { error: (data.error && data.error.message) || "Error en Whisper" });
    return responde(200, { text: data.text });
  } catch (err) {
    return responde(500, { error: err.message });
  }
}
