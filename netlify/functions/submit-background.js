// netlify/functions/submit-background.js
const { Resend } = require("resend");
const Busboy = require("busboy");

function parseMultipart(event) {
  return new Promise((resolve, reject) => {
    const contentType = event.headers["content-type"] || event.headers["Content-Type"];
    const bb = Busboy({ headers: { "content-type": contentType } });
    const fields = {};
    bb.on("field", (name, val) => { fields[name] = val; });
    bb.on("file", (name, stream) => { stream.resume(); });
    bb.on("finish", () => resolve({ fields }));
    bb.on("error", reject);
    const body = event.isBase64Encoded ? Buffer.from(event.body, "base64") : Buffer.from(event.body || "", "utf8");
    bb.write(body);
    bb.end();
  });
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const { fields } = await parseMultipart(event);
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "Tale Us Stories <onboarding@resend.dev>",
      to: ["cristinacasanovas@hotmail.com"],
      subject: "✅ Test — formulario recibido",
      html: `<p>Formulario recibido de <strong>${fields.protagonistName || 'desconocido'}</strong></p><pre>${JSON.stringify(fields, null, 2)}</pre>`,
    });

    console.log("Email de prueba enviado ✅");
  } catch (err) {
    console.error("Error:", err.message);
  }

  return { statusCode: 202, body: "" };
};
