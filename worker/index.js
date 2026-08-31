/**
 * Worker for mirzafahad.com
 * - POST /api/contact : sends the contact form by email via Resend
 * - everything else   : served from the static site build (_site)
 *
 * Secrets (Worker > Settings > Variables and secrets):
 *   RESEND_API_KEY, CONTACT_TO, CONTACT_FROM
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === "www.mirzafahad.com") {
      url.hostname = "mirzafahad.com";
      return Response.redirect(url.toString(), 301);
    }
    if (url.pathname === "/api/contact" && request.method === "POST") {
      return handleContact(request, env);
    }
    return env.ASSETS.fetch(request);
  },
};

async function handleContact(request, env) {
  let data;
  try {
    data = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid body" }, 400);
  }
  if (data.website) return json({ ok: true }); // honeypot

  const clean = (v, max) => String(v || "").trim().slice(0, max);
  const name = clean(data.name, 100);
  const phone = clean(data.phone, 40);
  const email = clean(data.email, 120);
  const subject = clean(data.subject, 80);
  const message = clean(data.message, 3000);
  const lang = data.lang === "ur" ? "ur" : "en";

  if (!name || !phone || !message) return json({ ok: false, error: "Missing fields" }, 400);
  if (!env.RESEND_API_KEY || !env.CONTACT_TO) return json({ ok: false, error: "Email not configured" }, 500);

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
    console.error("Resend error", res.status, await res.text());
    return json({ ok: false, error: "Send failed" }, 502);
  }
  return json({ ok: true });
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
