/**
 * Cloudflare Pages Function: POST /api/contact
 * Sends the contact form by email via Resend (https://resend.com — free tier).
 *
 * Required environment variables (Pages → Settings → Environment variables):
 *   RESEND_API_KEY  – API key from resend.com
 *   CONTACT_TO      – your inbox, e.g. contact@mirzafahad.com
 *   CONTACT_FROM    – a verified sender, e.g. "Website <noreply@mirzafahad.com>"
 */
export async function onRequestPost({ request, env }) {
  let data;
  try {
    data = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid body" }, 400);
  }

  // Honeypot — bots fill the hidden "website" field
  if (data.website) return json({ ok: true });

  const name = clean(data.name, 100);
  const phone = clean(data.phone, 40);
  const email = clean(data.email, 120);
  const subject = clean(data.subject, 80);
  const message = clean(data.message, 3000);
  const lang = data.lang === "ur" ? "ur" : "en";

  if (!name || !phone || !message) return json({ ok: false, error: "Missing fields" }, 400);

  if (!env.RESEND_API_KEY || !env.CONTACT_TO) {
    return json({ ok: false, error: "Email not configured" }, 500);
  }

  const text = [
    `New enquiry from mirzafahad.com (${lang})`,
    ``,
    `Name:    ${name}`,
    `Phone:   ${phone}`,
    `Email:   ${email || "-"}`,
    `Matter:  ${subject || "-"}`,
    ``,
    `Message:`,
    message,
    ``,
    `— Sent ${new Date().toISOString()} · IP ${request.headers.get("cf-connecting-ip") || "?"}`,
  ].join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.CONTACT_FROM || "Website <onboarding@resend.dev>",
      to: [env.CONTACT_TO],
      reply_to: email || undefined,
      subject: `Enquiry: ${subject || "General"} — ${name}`,
      text,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Resend error", res.status, err);
    return json({ ok: false, error: "Send failed" }, 502);
  }
  return json({ ok: true });
}

function clean(v, max) {
  return String(v || "").trim().slice(0, max);
}
function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
