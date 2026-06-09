// netlify/functions/submit.js
// Tale Us Stories — pipeline completo

const { Resend } = require("resend");
const OpenAI = require("openai");
const Anthropic = require("@anthropic-ai/sdk");
const Busboy = require("busboy");

const FIELD_TO_CHAPTER = {
  q1_nombre: "cap1", q1_apodo: "cap1", q1_nacimiento: "cap1",
  q2_lugar: "cap2", q2_recuerdo: "cap2", q2_juego: "cap2",
  q3_sueno: "cap3", q3_aventura: "cap3", q3_trabajo: "cap3",
  q4_pareja: "cap4", q4_hijos: "cap4",
  q5_actividad: "cap5", q5_lugar: "cap5",
  q6_consejo: "cap6", q6_deseo: "cap6",
};

const CHAPTER_NAMES = {
  cap1: "Quién es", cap2: "Infancia", cap3: "Juventud",
  cap4: "Amor y familia", cap5: "Con los niños hoy", cap6: "El legado",
};

const FIELD_LABELS = {
  q1_nombre: "Nombre completo", q1_apodo: "Apodo", q1_nacimiento: "Nacimiento",
  q2_lugar: "Dónde creció", q2_recuerdo: "Recuerdo de infancia", q2_juego: "Juego favorito",
  q3_sueno: "Sueño de juventud", q3_aventura: "Gran aventura", q3_trabajo: "Primer trabajo",
  q4_pareja: "Historia de amor", q4_hijos: "Llegada de los hijos",
  q5_actividad: "Actividad con los niños", q5_lugar: "Lugar especial",
  q6_consejo: "Consejo para el futuro", q6_deseo: "Deseo para los niños",
};

function parseMultipart(event) {
  return new Promise((resolve, reject) => {
    const contentType = event.headers["content-type"] || event.headers["Content-Type"];
    const bb = Busboy({ headers: { "content-type": contentType } });
    const fields = {};
    const files = {};
    const filePromises = [];

    bb.on("field", (name, val) => { fields[name] = val; });
    bb.on("file", (name, stream, info) => {
      const chunks = [];
      const p = new Promise((res) => {
        stream.on("data", (d) => chunks.push(d));
        stream.on("end", () => {
          files[name] = { buffer: Buffer.concat(chunks), mimetype: info.mimeType, filename: info.filename || `${name}.webm` };
          res();
        });
      });
      filePromises.push(p);
    });

    bb.on("finish", async () => { await Promise.all(filePromises); resolve({ fields, files }); });
    bb.on("error", reject);

    const body = event.isBase64Encoded
      ? Buffer.from(event.body, "base64")
      : Buffer.from(event.body || "", "utf8");
    bb.write(body);
    bb.end();
  });
}

async function transcribeAudio(openai, fileData, fieldName) {
  if (!fileData || fileData.buffer.length < 1000) return null;
  try {
    const blob = new Blob([fileData.buffer], { type: fileData.mimetype });
    const file = new File([blob], fileData.filename, { type: fileData.mimetype });
    const response = await openai.audio.transcriptions.create({ file, model: "whisper-1", language: "es" });
    return response.text?.trim() || null;
  } catch (err) {
    console.error(`Error transcribiendo ${fieldName}:`, err.message);
    return `[Error de transcripción: ${err.message}]`;
  }
}

async function generarLibro(anthropic, historyText, protagonist) {
  const { nombre, relacion, ninos, genero } = protagonist;
  const nino_a = genero === "hombre" ? "niño" : "niña";
  const ella_el = genero === "hombre" ? "Él" : "Ella";

  const prompt = `Eres el escritor de "Tale Us Stories", editorial de libros ilustrados personalizados donde los niños descubren la historia real de un adulto que quieren.

Escribe el texto completo de un libro ilustrado para niños basándote en esta historia real.

ESTILO OBLIGATORIO:

EJEMPLO PÁGINA 1:
"${ninos},
vosotros conocéis a ${nombre} como ${relacion}.
La que encuentra los zapatos que nadie encuentra.
La que organiza cumpleaños para treinta personas
como si fuera algo normal.

Pero antes de ser vuestra ${relacion}...
fue una ${nino_a}.
Y esta es la historia de cómo
esa ${nino_a} se convirtió en vuestra ${relacion}.

Aunque, para ser sinceros,
nadie sabe muy bien cómo
le dio tiempo a hacer tantas cosas."

EJEMPLO PÁGINA FINAL:
"Vuestra ${relacion} ha cruzado océanos.
Ha construido hogares.
Os ha traído al mundo.
Ha llorado, ha reído,
ha caído y se ha levantado.

${ella_el} la tiene.
Y vosotros,
también la tenéis.

Sois los hijos de alguien extraordinaria.
No lo olvidéis nunca.
Cuidarla siempre."

REGLAS DE TEXTO:
- Frases MUY cortas. Máximo 8 palabras por línea
- Cada idea en su propia línea (usa \\n)
- Máximo 10 líneas por página con texto — no más
- El texto va CENTRADO en la página — nunca justificado
- El título de cada página va arriba centrado
- El texto va en el centro/parte superior de la página
- La ilustración ocupa la parte inferior de la página
- Tono cálido, cercano, con humor suave
- Habla SIEMPRE directamente a los niños
- Detalles muy específicos y reales
- Un toque de humor por capítulo
- Marca frases emotivas con [T]frase[/T]
- NO uses adjetivos genéricos

ESTRUCTURA DEL LIBRO — 20 páginas interiores exactas (sin contar portada ni contraportada):
- Páginas 1-2: portadilla interior + dedicatoria (solo ilustración, texto mínimo)
- Páginas 3-4: introducción (texto centrado arriba + ilustración abajo)
- Páginas 5-8: infancia (texto+ilustración, máximo 1 página solo ilustración)
- Páginas 9-12: juventud y aventuras (texto+ilustración, máximo 1 página solo ilustración)
- Páginas 13-16: amor y familia (texto+ilustración, máximo 1 página solo ilustración)
- Páginas 17-18: con los niños hoy (texto+ilustración)
- Páginas 19-20: legado y cierre (texto emotivo centrado + ilustración preciosa abajo)

TIPOS DE PÁGINA — máximo 3-4 páginas "solo_ilustracion" en todo el libro:
- "texto_ilustracion": título arriba centrado, texto centrado (máximo 10 líneas), ilustración grande abajo
- "solo_ilustracion": sin texto, solo ilustración (máximo 3-4 veces en todo el libro)
- "frase_grande": una sola frase muy emotiva centrada, ilustración de fondo

PARA CADA PÁGINA genera un prompt en inglés para Nano Banana (Google Gemini image AI).
El prompt debe describir la escena exacta y terminar SIEMPRE con:
"children's book illustration, warm watercolor style, rounded cartoon faces, small black dot eyes, rosy peach cheeks, dark brown ink outlines, flowing watercolor washes with paint splatter drops, warm ochre and cream tones, white background, cozy tender mood --ar 3:2"

PORTADA:
- Título siempre: "EL UNIVERSO DE ${nombre.toUpperCase()}"
- Estilo: siluetas de adulto y niño, fondo a cuadros azul y crema, círculo dorado central, paleta azul marino + terracota + dorado, tipografía bold
- Prompt termina con: "book cover illustration, bold graphic watercolor style, silhouettes, checkered background in blue and cream, golden circle, navy blue terracotta and gold palette, bold typography --ar 2:3"

CONTRAPORTADA:
- Una sola frase corta y emotiva que defina la esencia de ${nombre}
- Máximo 2 líneas

HISTORIA:
${historyText}

Responde SOLO con este JSON:
{
  "titulo": "EL UNIVERSO DE ${nombre.toUpperCase()}",
  "portada_prompt": "prompt completo para la portada",
  "contraportada_frase": "frase emotiva para la contraportada",
  "paginas": [
    {
      "numero": 1,
      "tipo": "solo_ilustracion",
      "titulo": "título de la página",
      "texto": "texto con \\n para saltos de línea (vacío si es solo_ilustracion)",
      "imagen_prompt": "prompt completo para Nano Banana"
    }
  ]
}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 5000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].text;
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function buildEmailHtml(allData, protagonist, libro) {
  const { nombre, ninos, relacion } = protagonist;

  const byChapter = {};
  for (const [field, chapKey] of Object.entries(FIELD_TO_CHAPTER)) {
    if (!byChapter[chapKey]) byChapter[chapKey] = [];
    const value = allData[field];
    if (value) byChapter[chapKey].push({ field, value });
  }

  const historiaHtml = Object.entries(CHAPTER_NAMES).map(([key, title]) => {
    const entries = byChapter[key] || [];
    if (!entries.length) return "";
    const rows = entries.map(({ field, value }) => `
      <tr>
        <td style="padding:6px 12px;color:#8b6914;font-size:12px;vertical-align:top;width:160px;">${FIELD_LABELS[field] || field}</td>
        <td style="padding:6px 12px;font-size:13px;line-height:1.6;color:#2c1810;">${escapeHtml(value)}</td>
      </tr>`).join("");
    return `
      <div style="margin-bottom:20px;">
        <h3 style="margin:0 0 8px;font-size:12px;font-weight:700;color:#b45309;text-transform:uppercase;letter-spacing:1px;">${title}</h3>
        <table style="width:100%;border-collapse:collapse;background:#fffbeb;border-radius:8px;">${rows}</table>
      </div>`;
  }).join("");

  const libroHtml = libro.paginas.map(p => {
    const textoFormateado = (p.texto || "")
      .replace(/\[T\](.*?)\[\/T\]/g, '<span style="color:#b45309;">$1</span>')
      .replace(/\n/g, "<br>");
    return `
      <div style="margin-bottom:28px;padding:20px;background:#fffbeb;border-radius:12px;border-left:4px solid #fde68a;">
        <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#b45309;margin-bottom:6px;">Página ${p.numero} · ${p.tipo || 'texto_ilustracion'}</div>
        <div style="font-size:18px;color:#c47a3a;font-style:italic;margin-bottom:10px;">${p.titulo}</div>
        ${textoFormateado ? `<div style="font-size:14px;line-height:2;color:#4a3728;text-align:center;margin-bottom:14px;">${textoFormateado}</div>` : '<div style="font-size:12px;color:#8b6914;font-style:italic;margin-bottom:14px;text-align:center;">— Solo ilustración —</div>'}
        <div style="background:#fff;border:1px dashed #e8d5b0;border-radius:8px;padding:10px;">
          <div style="font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#8b6914;margin-bottom:4px;">🎨 Prompt Nano Banana</div>
          <div style="font-size:11px;color:#4a2c0a;font-family:monospace;line-height:1.6;">${escapeHtml(p.imagen_prompt)}</div>
        </div>
      </div>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#fdf6e3;font-family:Georgia,serif;">
<div style="max-width:700px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08);">
  <div style="background:linear-gradient(135deg,#b45309,#d97706);padding:32px 40px;text-align:center;">
    <p style="margin:0;font-size:11px;letter-spacing:3px;color:#fde68a;text-transform:uppercase;">Tale Us Stories</p>
    <h1 style="margin:8px 0 4px;font-size:22px;color:#fff;font-weight:400;">📖 Nuevo libro generado</h1>
    <p style="margin:0;font-size:16px;color:#fde68a;font-style:italic;">${escapeHtml(libro.titulo)}</p>
  </div>
  <div style="padding:20px 40px;background:#fffbeb;border-bottom:2px solid #fde68a;">
    <p style="margin:0;font-size:14px;color:#2c1810;line-height:1.8;">
      <strong>Protagonista:</strong> ${escapeHtml(nombre)}<br>
      <strong>Relación:</strong> ${escapeHtml(relacion)}<br>
      <strong>Para:</strong> ${escapeHtml(ninos)}<br>
      <strong>Páginas interiores:</strong> ${libro.paginas.length}
    </p>
  </div>
  <div style="padding:24px 40px;background:#fff8f0;border-bottom:1px solid #fde68a;">
    <h2 style="margin:0 0 12px;font-size:14px;color:#b45309;">🎨 Portada — ${escapeHtml(libro.titulo)}</h2>
    <div style="background:#fff;border:1px dashed #e8d5b0;border-radius:8px;padding:12px;margin-bottom:12px;">
      <div style="font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#8b6914;margin-bottom:4px;">Prompt Nano Banana portada</div>
      <div style="font-size:11px;color:#4a2c0a;font-family:monospace;line-height:1.6;">${escapeHtml(libro.portada_prompt || '')}</div>
    </div>
    <div style="padding:12px;background:#fffbeb;border-radius:8px;">
      <div style="font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#8b6914;margin-bottom:4px;">💬 Frase contraportada</div>
      <div style="font-size:14px;color:#2c1810;font-style:italic;line-height:1.8;">${escapeHtml(libro.contraportada_frase || '')}</div>
    </div>
  </div>
  <div style="padding:32px 40px;">
    <h2 style="margin:0 0 20px;font-size:16px;color:#b45309;border-bottom:2px solid #fde68a;padding-bottom:8px;">✨ 20 páginas interiores + Prompts Nano Banana</h2>
    ${libroHtml}
  </div>
  <div style="padding:28px 40px;background:#f9f5eb;border-top:1px solid #e7e0d0;">
    <h2 style="margin:0 0 16px;font-size:15px;color:#b45309;">📝 Historia original transcrita</h2>
    ${historiaHtml}
  </div>
  <div style="padding:16px 40px;background:#f0e8d8;text-align:center;">
    <p style="margin:0;font-size:11px;color:#8b6914;">Generado automáticamente · Tale Us Stories · ${new Date().toLocaleString("es-ES")}</p>
  </div>
</div>
</body>
</html>`;
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const { fields, files } = await parseMultipart(event);

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const resend = new Resend(process.env.RESEND_API_KEY);

    const transcriptions = await Promise.all(
      Object.keys(files).map(async (fieldName) => {
        const text = await transcribeAudio(openai, files[fieldName], fieldName);
        return { fieldName, text };
      })
    );

    const allData = { ...fields };
    for (const { fieldName, text } of transcriptions) {
      if (!text) continue;
      const baseField = fieldName.replace(/_audio$/, "");
      allData[baseField] = allData[baseField] ? `${allData[baseField]}\n\n[Audio]: ${text}` : `[Audio]: ${text}`;
    }

    const protagonist = {
      nombre: fields.protagonistName || fields.q1_nombre || "el protagonista",
      genero: fields.gender || "mujer",
      ninos: fields.childName || fields.senderName || "los niños",
      relacion: fields.relacion || (fields.gender === "hombre" ? "papá" : "mamá"),
    };

    const byChapter = {};
    for (const [field, chapKey] of Object.entries(FIELD_TO_CHAPTER)) {
      if (!byChapter[chapKey]) byChapter[chapKey] = [];
      const value = allData[field];
      if (value) byChapter[chapKey].push(`${FIELD_LABELS[field]}: ${value}`);
    }
    const historyText = Object.entries(CHAPTER_NAMES).map(([key, title]) => {
      const entries = byChapter[key] || [];\
      if (!entries.length) return "";
      return `## ${title}\n${entries.join("\n")}`;
    }).filter(Boolean).join("\n\n");

    console.log("Generando libro con Claude...");
    const libro = await generarLibro(anthropic, historyText, protagonist);

    const htmlBody = buildEmailHtml(allData, protagonist, libro);
    const subject = `📖 ${libro.titulo} — listo para ilustrar`;

    const { error: emailError } = await resend.emails.send({
      from: "Tale Us Stories <onboarding@resend.dev>",
      to: [process.env.TO_EMAIL || "cristinacasanovas@hotmail.com"],
      subject,
      html: htmlBody,
    });

    if (emailError) throw new Error(`Resend error: ${emailError.message}`);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true, message: "Libro generado y enviado.", titulo: libro.titulo, paginas: libro.paginas.length }),
    };

  } catch (err) {
    console.error("Error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: false, error: err.message || "Error interno" }),
    };
  }
};
