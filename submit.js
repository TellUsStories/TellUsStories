// netlify/functions/submit.js
// Tale Us Stories — procesamiento de formulario de historia personal
// Recibe audios + texto, transcribe con Whisper, envía email formateado con Resend

const { Resend } = require("resend");
const OpenAI = require("openai");
const Busboy = require("busboy");

// ─── Configuración ────────────────────────────────────────────────────────────

const CHAPTERS = {
  cap1: "Capítulo 1 · Quién es",
  cap2: "Capítulo 2 · Infancia",
  cap3: "Capítulo 3 · Juventud",
  cap4: "Capítulo 4 · Amor y familia",
  cap5: "Capítulo 5 · Con los niños hoy",
  cap6: "Capítulo 6 · El legado",
};

// Mapeo de nombre de campo → capítulo
const FIELD_TO_CHAPTER = {
  // Capítulo 1 — Quién es
  q1_nombre: "cap1",
  q1_apodo: "cap1",
  q1_nacimiento: "cap1",

  // Capítulo 2 — Infancia
  q2_lugar: "cap2",
  q2_recuerdo: "cap2",
  q2_juego: "cap2",

  // Capítulo 3 — Juventud
  q3_sueno: "cap3",
  q3_aventura: "cap3",
  q3_trabajo: "cap3",

  // Capítulo 4 — Amor y familia
  q4_pareja: "cap4",
  q4_hijos: "cap4",

  // Capítulo 5 — Con los niños hoy
  q5_actividad: "cap5",
  q5_lugar: "cap5",

  // Capítulo 6 — El legado
  q6_consejo: "cap6",
  q6_deseo: "cap6",
};

// ─── Helper: parsear multipart/form-data ─────────────────────────────────────

function parseMultipart(event) {
  return new Promise((resolve, reject) => {
    const contentType =
      event.headers["content-type"] || event.headers["Content-Type"];

    const bb = Busboy({ headers: { "content-type": contentType } });

    const fields = {};   // { fieldName: value }
    const files = {};    // { fieldName: { buffer, mimetype, filename } }
    const filePromises = [];

    bb.on("field", (name, val) => {
      fields[name] = val;
    });

    bb.on("file", (name, stream, info) => {
      const chunks = [];
      const p = new Promise((res) => {
        stream.on("data", (d) => chunks.push(d));
        stream.on("end", () => {
          files[name] = {
            buffer: Buffer.concat(chunks),
            mimetype: info.mimeType,
            filename: info.filename || `${name}.webm`,
          };
          res();
        });
      });
      filePromises.push(p);
    });

    bb.on("finish", async () => {
      await Promise.all(filePromises);
      resolve({ fields, files });
    });

    bb.on("error", reject);

    const body = event.isBase64Encoded
      ? Buffer.from(event.body, "base64")
      : Buffer.from(event.body || "", "utf8");

    bb.write(body);
    bb.end();
  });
}

// ─── Helper: transcribir audio con Whisper ───────────────────────────────────

async function transcribeAudio(openai, fileData, fieldName) {
  if (!fileData || fileData.buffer.length < 1000) {
    // Audio vacío o demasiado corto → sin respuesta
    return null;
  }

  try {
    // Whisper necesita un File-like object; usamos un Blob
    const blob = new Blob([fileData.buffer], { type: fileData.mimetype });
    const file = new File([blob], fileData.filename, {
      type: fileData.mimetype,
    });

    const response = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
      language: "es",
    });

    return response.text?.trim() || null;
  } catch (err) {
    console.error(`Error transcribiendo ${fieldName}:`, err.message);
    return `[Error de transcripción: ${err.message}]`;
  }
}

// ─── Helper: construir HTML del email ────────────────────────────────────────

function buildEmailHtml(data, protagonist) {
  const { nombre = "—", genero = "mujer", childName = "—" } = protagonist;

  // Agrupar respuestas por capítulo
  const byChapter = {};
  for (const [field, chapKey] of Object.entries(FIELD_TO_CHAPTER)) {
    if (!byChapter[chapKey]) byChapter[chapKey] = [];
    const value = data[field];
    if (value) {
      byChapter[chapKey].push({ field, value });
    }
  }

  // Renderizar capítulos
  const chaptersHtml = Object.entries(CHAPTERS)
    .map(([key, title]) => {
      const entries = byChapter[key] || [];
      if (entries.length === 0) return "";

      const rows = entries
        .map(
          ({ field, value }) => `
          <tr>
            <td style="padding:8px 12px;color:#666;font-size:13px;vertical-align:top;width:180px;">
              ${fieldLabel(field)}
            </td>
            <td style="padding:8px 12px;font-size:14px;line-height:1.6;color:#1a1a1a;">
              ${escapeHtml(value)}
            </td>
          </tr>`
        )
        .join("");

      return `
        <div style="margin-bottom:32px;">
          <h2 style="margin:0 0 12px;font-size:16px;font-weight:700;color:#b45309;
                     border-bottom:2px solid #fde68a;padding-bottom:6px;">
            ${title}
          </h2>
          <table style="width:100%;border-collapse:collapse;">
            ${rows}
          </table>
        </div>`;
    })
    .join("");

  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fdf6e3;font-family:'Georgia',serif;">
  <div style="max-width:680px;margin:0 auto;background:#fff;border-radius:12px;
              overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#b45309,#d97706);padding:32px 40px;text-align:center;">
      <p style="margin:0;font-size:12px;letter-spacing:2px;color:#fde68a;text-transform:uppercase;">
        Tale Us Stories
      </p>
      <h1 style="margin:8px 0 0;font-size:26px;color:#fff;font-weight:400;">
        Nueva historia recibida ✨
      </h1>
    </div>

    <!-- Resumen -->
    <div style="padding:28px 40px;background:#fffbeb;border-bottom:1px solid #fde68a;">
      <p style="margin:0;font-size:15px;color:#1a1a1a;line-height:1.7;">
        <strong>Protagonista:</strong> ${escapeHtml(nombre)}<br>
        <strong>Género:</strong> ${genero === "hombre" ? "Hombre" : "Mujer"}<br>
        <strong>Historia encargada por:</strong> ${escapeHtml(childName)}
      </p>
    </div>

    <!-- Contenido por capítulos -->
    <div style="padding:32px 40px;">
      ${chaptersHtml || "<p style='color:#999;font-style:italic;'>Sin respuestas recibidas.</p>"}
    </div>

    <!-- Footer -->
    <div style="padding:20px 40px;background:#f9f5eb;border-top:1px solid #e7e0d0;text-align:center;">
      <p style="margin:0;font-size:12px;color:#999;">
        Generado automáticamente por Tale Us Stories · ${new Date().toLocaleString("es-ES")}
      </p>
    </div>
  </div>
</body>
</html>`;
}

function fieldLabel(field) {
  const labels = {
    q1_nombre: "Nombre completo",
    q1_apodo: "Apodo / cómo le llaman",
    q1_nacimiento: "Lugar y año de nacimiento",
    q2_lugar: "Dónde creció",
    q2_recuerdo: "Recuerdo de infancia",
    q2_juego: "Juego o actividad favorita",
    q3_sueno: "Sueño de juventud",
    q3_aventura: "Gran aventura",
    q3_trabajo: "Primer trabajo / vocación",
    q4_pareja: "Historia de amor",
    q4_hijos: "Llegada de los hijos",
    q5_actividad: "Actividad favorita con los niños",
    q5_lugar: "Lugar especial compartido",
    q6_consejo: "Consejo para el futuro",
    q6_deseo: "Deseo para los niños",
  };
  return labels[field] || field;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─── Handler principal ────────────────────────────────────────────────────────

exports.handler = async (event) => {
  // Solo POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    // 1. Parsear formulario
    const { fields, files } = await parseMultipart(event);

    // Inicializar clientes
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const resend = new Resend(process.env.RESEND_API_KEY);

    // 2. Transcribir audios en paralelo
    const audioFields = Object.keys(files);
    const transcriptions = await Promise.all(
      audioFields.map(async (fieldName) => {
        const text = await transcribeAudio(openai, files[fieldName], fieldName);
        return { fieldName, text };
      })
    );

    // 3. Fusionar campos de texto + transcripciones
    //    Regla: si existe texto escrito Y audio → concatenar; si solo uno → usar ese
    const allData = { ...fields };

    for (const { fieldName, text } of transcriptions) {
      if (!text) continue;
      // Los campos de audio suelen llamarse igual que el campo texto pero con sufijo _audio
      // Ej: q2_recuerdo_audio → corresponde a q2_recuerdo
      const baseField = fieldName.replace(/_audio$/, "");
      if (allData[baseField]) {
        allData[baseField] = `${allData[baseField]}\n\n[Audio]: ${text}`;
      } else {
        allData[baseField] = `[Audio]: ${text}`;
      }
    }

    // 4. Metadatos del protagonista
    const protagonist = {
      nombre: fields.protagonistName || fields.q1_nombre || "Sin nombre",
      genero: fields.gender || "mujer",
      childName: fields.childName || fields.senderName || "quien encargó el libro",
    };

    // 5. Construir email
    const htmlBody = buildEmailHtml(allData, protagonist);

    const subject = `📖 Nueva historia: ${protagonist.nombre} — Tale Us Stories`;

    // 6. Enviar email
    const { error: emailError } = await resend.emails.send({
      from: "Tale Us Stories <noreply@taleusstories.com>",
      to: [process.env.TO_EMAIL || "cristinacasanovas@hotmail.com"],
      subject,
      html: htmlBody,
    });

    if (emailError) {
      console.error("Error enviando email:", emailError);
      throw new Error(`Resend error: ${emailError.message}`);
    }

    // 7. Respuesta de éxito
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ok: true,
        message: "Historia recibida y enviada correctamente.",
        protagonist: protagonist.nombre,
        transcribedFields: transcriptions
          .filter((t) => t.text)
          .map((t) => t.fieldName),
      }),
    };
  } catch (err) {
    console.error("Error en submit.js:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ok: false,
        error: err.message || "Error interno del servidor",
      }),
    };
  }
};
