import { IncomingForm } from 'formidable';
import { OpenAI } from 'openai';
import { Resend } from 'resend';
import fs from 'fs';

export const config = {
  api: { bodyParser: false }
};

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const resend = new Resend(process.env.RESEND_API_KEY);
const TO_EMAIL = process.env.TO_EMAIL;

const QUESTIONS = [
  'Quién es — ¿Cómo lo/la describirías en 3 palabras?',
  'Quién es — ¿Cómo es físicamente?',
  'Quién es — ¿Frase o muletilla que solo diría él/ella?',
  'Infancia — ¿Cómo era de bebé?',
  'Infancia — ¿Anécdota concreta de su infancia?',
  'Juventud — ¿Cómo era de adolescente?',
  'Juventud — ¿Decisión valiente o aventura grande?',
  'Amor — ¿Cómo conoció a su pareja?',
  'Amor — ¿Cómo fue la llegada de los niños?',
  'Con los niños — ¿Cómo son los niños?',
  'Con los niños — ¿Recuerdo especial entre ellos?',
  'Con los niños — ¿Tradición o ritual que solo tienen ellos?',
  'El legado — ¿Qué querría que los niños supieran de mayor?',
  'El legado — ¿Algo más que debamos saber?',
];

async function transcribeAudio(filePath, mimeType) {
  try {
    const fileStream = fs.createReadStream(filePath);
    const response = await openai.audio.transcriptions.create({
      file: fileStream,
      model: 'whisper-1',
      language: 'es',
    });
    return response.text;
  } catch (err) {
    console.error('Whisper error:', err);
    return '[No se pudo transcribir]';
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new IncomingForm({ keepExtensions: true, multiples: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error parsing form' });
    }

    try {
      // Extract basic fields
      const protName   = fields.protName?.[0]   || '—';
      const childNames = fields.childNames?.[0]  || '—';
      const bookType   = fields.bookType?.[0]    || '—';
      const orderer    = fields.orderer?.[0]     || '—';
      const email      = fields.email?.[0]       || '—';
      const tone       = fields.tone?.[0]        || '—';
      const noShow     = fields.noShow?.[0]      || '—';
      const gender     = fields.gender?.[0]      || 'f';

      // Quick data fields
      const birthPlace     = fields.birthPlace?.[0]     || '—';
      const job            = fields.job?.[0]            || '—';
      const sport          = fields.sport?.[0]          || '—';
      const places         = fields.places?.[0]         || '—';
      const siblings       = fields.siblings?.[0]       || '—';
      const pets           = fields.pets?.[0]           || '—';
      const childhoodPlace = fields.childhoodPlace?.[0] || '—';
      const school         = fields.school?.[0]         || '—';
      const travel         = fields.travel?.[0]         || '—';
      const childAges      = fields.childAges?.[0]      || '—';
      const nicknames      = fields.nicknames?.[0]      || '—';
      const knownStory     = fields.knownStory?.[0]     || '—';

      // Transcribe all audio files
      const transcriptions = [];
      for (let i = 0; i < 14; i++) {
        const audioFile = files[`audio_${i}`]?.[0];
        const textFallback = fields[`text_${i}`]?.[0] || '';

        if (audioFile && audioFile.size > 0) {
          const transcription = await transcribeAudio(
            audioFile.filepath,
            audioFile.mimetype || 'audio/webm'
          );
          transcriptions.push({ index: i, type: 'audio', text: transcription });
        } else if (textFallback.trim()) {
          transcriptions.push({ index: i, type: 'text', text: textFallback });
        } else {
          transcriptions.push({ index: i, type: 'empty', text: '' });
        }
      }

      // Build email HTML
      const chaptersHTML = `
        <h2 style="color:#C8544A;font-family:Georgia,serif;border-bottom:2px solid #E8D5C0;padding-bottom:8px;">
          Capítulo 0 · Quién es
        </h2>
        ${[0,1,2].map(i => renderQuestion(i, transcriptions[i])).join('')}

        <h2 style="color:#C8544A;font-family:Georgia,serif;border-bottom:2px solid #E8D5C0;padding-bottom:8px;margin-top:32px;">
          Capítulo 1 · Infancia
        </h2>
        ${[3,4].map(i => renderQuestion(i, transcriptions[i])).join('')}
        ${renderDataRow('Dónde nació/creció', birthPlace)}
        ${renderDataRow('Hermanos', siblings)}
        ${renderDataRow('Mascota', pets)}
        ${renderDataRow('Lugar especial infancia', childhoodPlace)}

        <h2 style="color:#C8544A;font-family:Georgia,serif;border-bottom:2px solid #E8D5C0;padding-bottom:8px;margin-top:32px;">
          Capítulo 2 · Juventud
        </h2>
        ${[5,6].map(i => renderQuestion(i, transcriptions[i])).join('')}
        ${renderDataRow('Estudios / colegio', school)}
        ${renderDataRow('Viaje o lugar que le marcó', travel)}

        <h2 style="color:#C8544A;font-family:Georgia,serif;border-bottom:2px solid #E8D5C0;padding-bottom:8px;margin-top:32px;">
          Capítulo 3 · Amor y familia
        </h2>
        ${[7,8].map(i => renderQuestion(i, transcriptions[i])).join('')}

        <h2 style="color:#C8544A;font-family:Georgia,serif;border-bottom:2px solid #E8D5C0;padding-bottom:8px;margin-top:32px;">
          Capítulo 4 · Con los niños hoy
        </h2>
        ${[9,10,11].map(i => renderQuestion(i, transcriptions[i])).join('')}
        ${renderDataRow('Edad de los niños', childAges)}
        ${renderDataRow('Cómo se llaman entre ellos', nicknames)}
        ${renderDataRow('Historia que ya conocen', knownStory)}

        <h2 style="color:#C8544A;font-family:Georgia,serif;border-bottom:2px solid #E8D5C0;padding-bottom:8px;margin-top:32px;">
          Capítulo 5 · El legado
        </h2>
        ${[12,13].map(i => renderQuestion(i, transcriptions[i])).join('')}
      `;

      const emailHTML = `
        <!DOCTYPE html>
        <html>
        <body style="font-family:Georgia,serif;max-width:700px;margin:0 auto;padding:32px;background:#FDF6EE;color:#1E2D4A;">

          <div style="text-align:center;margin-bottom:32px;">
            <h1 style="font-size:28px;color:#C8544A;letter-spacing:3px;text-transform:uppercase;">
              Tale Us Stories
            </h1>
            <p style="font-size:14px;color:#8A7060;">Nuevo pedido recibido</p>
          </div>

          <div style="background:white;border:1.5px solid #E8D5C0;border-radius:6px;padding:20px 24px;margin-bottom:24px;">
            <h2 style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#C8544A;margin-bottom:16px;">
              Datos del pedido
            </h2>
            ${renderDataRow('Protagonista', protName)}
            ${renderDataRow('Género', gender === 'f' ? 'Mujer' : 'Hombre')}
            ${renderDataRow('Para', childNames)}
            ${renderDataRow('Tipo de libro', bookType)}
            ${renderDataRow('Encargado por', orderer)}
            ${renderDataRow('Email cliente', email)}
            ${renderDataRow('Tono', tone)}
            ${renderDataRow('Deporte / hobby', sport)}
            ${renderDataRow('Lugares especiales', places)}
            ${renderDataRow('Trabajo', job)}
          </div>

          <div style="background:white;border:1.5px solid #E8D5C0;border-radius:6px;padding:20px 24px;margin-bottom:24px;">
            ${chaptersHTML}
          </div>

          ${noShow !== '—' ? `
          <div style="background:#FFF3CD;border:1px solid #FFD966;border-radius:6px;padding:16px 20px;margin-bottom:24px;">
            <strong style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#7A6000;">
              ⚠️ NO DEBE APARECER
            </strong>
            <p style="margin-top:8px;font-size:14px;color:#7A6000;">${noShow}</p>
          </div>` : ''}

          <div style="text-align:center;padding:24px;background:#FCEAE6;border-radius:6px;">
            <p style="font-family:Georgia,serif;font-style:italic;font-size:16px;color:#1E2D4A;">
              "Cada vida guarda historias que merecen ser contadas."
            </p>
            <p style="font-size:11px;color:#8A7060;letter-spacing:2px;margin-top:8px;">
              TALE US STORIES · LEGADO EMOCIONAL
            </p>
          </div>

        </body>
        </html>
      `;

      // Send email
      await resend.emails.send({
        from: 'Tale Us Stories <onboarding@resend.dev>',
        to: TO_EMAIL,
        subject: `📖 Nuevo libro: ${bookType} — ${protName}`,
        html: emailHTML,
      });

      return res.status(200).json({ ok: true });

    } catch (error) {
      console.error('Handler error:', error);
      return res.status(500).json({ error: 'Error processing submission' });
    }
  });
}

function renderQuestion(index, transcription) {
  if (!transcription || transcription.type === 'empty') {
    return `
      <div style="margin-bottom:16px;padding:14px 16px;border-left:3px solid #E8D5C0;background:#fafafa;">
        <p style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#8A7060;margin-bottom:6px;">
          ${QUESTIONS[index]}
        </p>
        <p style="font-size:13px;color:#E8D5C0;font-style:italic;">Sin respuesta</p>
      </div>`;
  }
  const icon = transcription.type === 'audio' ? '🎙' : '✏️';
  return `
    <div style="margin-bottom:16px;padding:14px 16px;border-left:3px solid #C8544A;background:#FCEAE6;border-radius:0 4px 4px 0;">
      <p style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#C8544A;margin-bottom:8px;">
        ${icon} ${QUESTIONS[index]}
      </p>
      <p style="font-size:15px;color:#1E2D4A;line-height:1.7;font-style:italic;margin:0;">
        "${transcription.text}"
      </p>
    </div>`;
}

function renderDataRow(label, value) {
  if (!value || value === '—') return '';
  return `
    <div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #E8D5C0;font-size:13px;">
      <span style="color:#8A7060;font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:.5px;min-width:160px;">${label}</span>
      <span style="color:#1E2D4A;text-align:right;flex:1;">${value}</span>
    </div>`;
}
