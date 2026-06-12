// netlify/functions/transcribe.js
// Recibe audio en base64, lo transcribe con Whisper (OpenAI) y devuelve el texto.

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: "Method Not Allowed" };
  }

  try {
    const { audioBase64, mimeType } = JSON.parse(event.body);

    if (!audioBase64) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "No se recibió audio" }),
      };
    }

    const audioBuffer = Buffer.from(audioBase64, "base64");

    const boundary = "----NetlifyFormBoundary" + Date.now();
    const ext = (mimeType && mimeType.includes("webm")) ? "webm" : "mp3";

    const preamble =
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="audio.${ext}"\r\n` +
      `Content-Type: ${mimeType || "audio/webm"}\r\n\r\n`;

    const modelField =
      `\r\n--${boundary}\r\n` +
      `Content-Disposition: form-data; name="model"\r\n\r\n` +
      `whisper-1`;

    const languageField =
      `\r\n--${boundary}\r\n` +
      `Content-Disposition: form-data; name="language"\r\n\r\n` +
      `es`;

    const closing = `\r\n--${boundary}--\r\n`;

    const body = Buffer.concat([
      Buffer.from(preamble, "utf-8"),
      audioBuffer,
      Buffer.from(modelField + languageField + closing, "utf-8"),
    ]);

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
      },
      body: body,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: data.error?.message || "Error en Whisper" }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ text: data.text }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
