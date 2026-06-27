// Escalation = the moment Mouha (the VPS oversight agent) and the atelier are
// pulled in "from behind". We do three things, each best-effort and guarded:
//   1. open a ticket row (the queue Mouha works from)
//   2. POST to MOUHA_WEBHOOK_URL (live 24/7 notification)
//   3. email orders@ via Resend (fallback so nothing is ever missed)
import { createTicket, touchConversation, getMessages } from "./store"
import { notifyMouha } from "./notify"

const ADMIN_EMAIL = "orders@maisontanneurs.com"
const FROM_EMAIL = "Maison Tanneurs <orders@maisontanneurs.com>"
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.maisontanneurs.com"

async function emailAtelier(input: {
  reason: string
  email: string | null
  transcript: string
  conversationId: string
}): Promise<void> {
  const key = process.env.RESEND_API_KEY
  if (!key) return
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        reply_to: input.email || undefined,
        subject: `Concierge escalation — ${input.reason}`,
        html: `<div style="font-family:monospace;font-size:13px;line-height:1.7;color:#1f1b16;max-width:640px;">
          <h2 style="font-family:Georgia,serif;font-weight:normal;">Concierge escalation</h2>
          <p><strong>Reason:</strong> ${input.reason}</p>
          <p><strong>Customer email:</strong> ${input.email || "not provided"}</p>
          <p><strong>Conversation:</strong> ${input.conversationId}</p>
          <p><strong>Transcript:</strong></p>
          <pre style="background:#f5efe3;padding:16px;white-space:pre-wrap;">${input.transcript}</pre>
          <p style="color:#7a6f5c;">Reply to the customer by email, or take over the thread from the concierge console.</p>
        </div>`,
      }),
    })
  } catch (err) {
    console.error("[concierge] escalation email error:", err)
  }
}

export async function escalate(input: {
  conversationId: string
  reason: string
  email: string | null
  locale: string
}): Promise<void> {
  const history = await getMessages(input.conversationId, { limit: 40 })
  const transcript = history
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n")
  const summary = history
    .filter((m) => m.role === "user")
    .slice(-3)
    .map((m) => m.content)
    .join(" | ")
    .slice(0, 300)

  const ticketId = await createTicket({
    conversationId: input.conversationId,
    reason: input.reason,
    summary,
    customerEmail: input.email,
    priority: /refund|charge|payment|complaint|broke|wrong|missing|never/i.test(
      input.reason + " " + summary,
    )
      ? "high"
      : "normal",
  })

  await touchConversation(input.conversationId, {
    status: "escalated",
    ...(input.email ? { customer_email: input.email } : {}),
  })

  await Promise.all([
    notifyMouha({
      event: "concierge.escalation",
      ticketId,
      conversationId: input.conversationId,
      reason: input.reason,
      email: input.email,
      summary,
      locale: input.locale,
      url: `${SITE_URL}`,
    }),
    emailAtelier({
      reason: input.reason,
      email: input.email,
      transcript,
      conversationId: input.conversationId,
    }),
  ])
}
