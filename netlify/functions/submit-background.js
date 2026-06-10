// netlify/functions/submit-background.js
const { Resend } = require("resend");
const OpenAI = require("openai");
const Anthropic = require("@anthropic-ai/sdk");
const Busboy = require("busboy");

const FIELD_TO_CHAPTER = {
  q1_nombre:"cap1",q1_apodo:"cap1",q1_nacimiento:"cap1",
  q2_lugar:"cap2",q2_recuerdo:"cap2",q2_juego:"cap2",
  q3_sueno:"cap3",q3_aventura:"cap3",q3_trabajo:"cap3",
  q4_pareja:"cap4",q4_hijos:"cap4",
  q5_actividad:"cap5",q5_lugar:"cap5",
  q6_consejo:"cap6",q6_deseo:"cap6",
};
const CHAPTER_NAMES = {
  cap1:"Quién es",cap2:"Infancia",cap3:"Juventud",
  cap4:"Amor y familia",cap5:"Con los niños hoy",cap6:"El legado",
};
const FIELD_LABELS = {
  q1_nombre:"Nombre",q1_apodo:"Apodo",q1_nacimiento:"Nacimiento",
  q2_lugar:"Dónde creció",q2_recuerdo:"Recuerdo infancia",q2_juego:"Juego favorito",
  q3_sueno:"Sueño juventud",q3_aventura:"Gran aventura",q3_trabajo:"Primer trabajo",
  q4_pareja:"Historia de amor",q4_hijos:"Llegada hijos",
  q5_actividad:"Actividad con niños",q5_lugar:"Lugar especial",
  q6_consejo:"Consejo futuro",q6_deseo:"Deseo para niños",
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
    const body = event.isBase64Encoded ? Buffer.from(event.body, "base64") : Buffer.from(event.body || "", "utf8");
    bb.write(body);
    bb.end();
  });
}

async function transcribeAudio(openai, fileData) {
  if (!fileData || fileData.buffer.length < 1000) return null;
  try {
    const blob = new Blob([fileData.buffer], { type: fileData.mimetype });
    const file = new File([blob], fileData.filename, { type: fileData.mimetype });
    const response = await openai.audio.transcriptions.create({ file, model: "whisper-1", language: "es" });
    return response.text?.trim() || null;
  } catch (err) {
    console.error("Error transcribiendo:", err.message);
    return null;
  }
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  try {
    console.log("Iniciando pipeline...");
    const { fields, files } = await parseMultipart(event);
    console.log("Formulario parseado. Campos:", Object.keys(fields).join(", "));

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Transcribir audios
    const allData = { ...fields };
    const audioEntries = Object.entries(files).filter(([name]) => name.endsWith('_audio'));
    console.log(`Transcribiendo ${audioEntries.length} audios...`);
    for (const [fieldName, fileData] of audioEntries) {
      const text = await transcribeAudio(openai, fileData);
      if (text) {
        const baseField = fieldName.replace(/_audio$/, "");
        allData[baseField] = allData[baseField] ? `${allData[baseField]}\n${text}` : text;
      }
    }

    const protagonist = {
      nombre: fields.protagonistName || "el protagonista",
      genero: fields.gender || "mujer",
      ninos: fields.childName || "los niños",
      relacion: fields.relacion || "mamá",
    };

    // Construir historia
    const byChapter = {};
    for (const [field, chapKey] of Object.entries(FIELD_TO_CHAPTER)) {
      if (!byChapter[chapKey]) byChapter[chapKey] = [];
      if (allData[field]) byChapter[chapKey].push(`${FIELD_LABELS[field]}: ${allData[field]}`);
    }
    const historyText = Object.entries(CHAPTER_NAMES).map(([key, title]) => {
      const entries = byChapter[key] || [];
      if (!entries.length) return "";
      return `## ${title}\n${entries.join("\n")}`;
    }).filter(Boolean).join("\n\n");

    console.log("Generando libro con Claude...");
    const { nombre, relacion, ninos, genero } = protagonist;
    const nino_a = genero === "hombre" ? "niño" : "niña";

    const claudeResponse = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 5000,
      messages: [{ role: "user", content: `Eres el escritor de "Tale Us Stories". Escribe un libro ilustrado de 20 páginas para niños basándote en esta historia real.

PROTAGONISTA: ${nombre} (${relacion} de ${ninos})
GÉNERO: ${genero}

REGLAS:
- Frases cortas, máximo 8 palabras por línea
- Habla directamente a los niños
- Tono cálido con humor suave
- Máx 10 líneas por página
- Marca frases emotivas con [T]frase[/T]

HISTORIA:
${historyText || "Historia de prueba — protagonista especial para los niños."}

Responde SOLO con JSON:
{
  "titulo": "EL UNIVERSO DE ${nombre.toUpperCase()}",
  "contraportada_frase": "frase emotiva de 2 líneas",
  "paginas": [
    {"numero": 1, "tipo": "solo_ilustracion", "titulo": "Portadilla", "texto": "", "imagen_prompt": "prompt para ilustración"},
    {"numero": 2, "tipo": "texto_ilustracion", "titulo": "Título", "texto": "texto\\nde la página", "imagen_prompt": "prompt"}
  ]
}` }],
    });

    const rawText = claudeResponse.content[0].text;
    const clean = rawText.replace(/\`\`\`json|\`\`\`/g, "").trim();
    const libro = JSON.parse(clean);
    console.log(`Libro generado: ${libro.paginas.length} páginas`);

    // Construir email
    const paginasHtml = libro.paginas.map(p => {
      const texto = (p.texto || "").replace(/\[T\](.*?)\[\/T\]/g, '<strong style="color:#c47a3a;">$1</strong>').replace(/\n/g, "<br>");
      return `<div style="margin-bottom:20px;padding:16px;background:#fffbeb;border-radius:8px;border-left:4px solid #fde68a;">
        <div style="font-size:10px;color:#b45309;text-transform:uppercase;letter-spacing:2px;margin-bottom:4px;">Página ${p.numero} · ${p.tipo}</div>
        <div style="font-size:16px;color:#c47a3a;font-style:italic;margin-bottom:8px;">${p.titulo}</div>
        ${texto ? `<div style="font-size:13px;line-height:1.8;color:#5a3e28;margin-bottom:8px;">${texto}</div>` : ''}
        <div style="font-size:11px;color:#6b4c2a;font-family:monospace;background:#fff;padding:8px;border-radius:4px;border:1px dashed #e8d5b0;">🎨 ${p.imagen_prompt}</div>
      </div>`;
    }).join("");

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:Georgia,serif;background:#fdf6e3;padding:20px;">
<div style="max-width:700px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;">
  <div style="background:linear-gradient(135deg,#b45309,#d97706);padding:32px;text-align:center;">
    <h1 style="color:white;margin:0;font-size:24px;">📖 ${libro.titulo}</h1>
    <p style="color:#fde68a;margin:8px 0 0;font-style:italic;">${libro.contraportada_frase}</p>
  </div>
  <div style="padding:20px 32px;background:#fffbeb;">
    <p style="font-size:14px;color:#2c1810;"><strong>Protagonista:</strong> ${nombre} · <strong>Para:</strong> ${ninos} · <strong>Páginas:</strong> ${libro.paginas.length}</p>
  </div>
  <div style="padding:24px 32px;">${paginasHtml}</div>
  <div style="padding:16px 32px;background:#f0e8d8;text-align:center;">
    <p style="font-size:11px;color:#8b6914;">Tale Us Stories · ${new Date().toLocaleString("es-ES")}</p>
  </div>
</div>
</body></html>`;

    console.log("Enviando email...");
    await resend.emails.send({
      from: "Tale Us Stories <onboarding@resend.dev>",
      to: [process.env.TO_EMAIL || "cristinacasanovas@hotmail.com"],
      subject: `📖 ${libro.titulo} — listo para revisar`,
      html,
    });
    console.log("Email enviado correctamente ✅");

  } catch (err) {
    console.error("Error:", err.message, err.stack);
  }

  return { statusCode: 202, body: "" };
};
