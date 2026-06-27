import { NextResponse, type NextRequest } from "next/server"
import type { ConciergeChatRequest } from "@/lib/concierge/types"
import {
  addMessage,
  createConversation,
  getConversation,
  isHandedOff,
  touchConversation,
} from "@/lib/concierge/store"
import { escalate } from "@/lib/concierge/escalate"
import { notifyMouha } from "@/lib/concierge/notify"

// The website does NOT run an LLM (no metered API cost). It securely queues the
// visitor's turn into Supabase and pings Mouha — the VPS agent that already runs
// 24/7 and acts as the concierge brain. Mouha answers by writing an `assistant`
// message back; the widget picks it up via /api/concierge/poll. A human/Mouha
// can take over by writing an `agent` message + setting status `human`.
export const dynamic = "force-dynamic"

const MAX_INPUT = 1500

// Always escalate these regardless of what the brain decides.
const HARD_ESCALATE_RE =
  /\b(refund|chargeback|charge ?back|speak (to|with) (a )?(human|person|someone)|real person|complaint|dispute|where('| i)s my order|order (didn'?t|not|never) (arrive|come))\b/i

export async function POST(request: NextRequest) {
  let body: ConciergeChatRequest
  try {
    body = (await request.json()) as ConciergeChatRequest
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const message = (body.message || "").trim().slice(0, MAX_INPUT)
  if (!message) {
    return NextResponse.json({ error: "Empty message" }, { status: 400 })
  }
  const locale = (body.locale || "en").slice(0, 5)
  const email = body.email?.trim() || null

  let conversation = body.conversationId
    ? await getConversation(body.conversationId)
    : null
  if (!conversation) {
    conversation = await createConversation({
      locale,
      pageUrl: body.pageUrl,
      userAgent: request.headers.get("user-agent") || undefined,
    })
  }
  if (!conversation) {
    return NextResponse.json(
      { error: "Concierge is unavailable right now." },
      { status: 503 },
    )
  }
  const conversationId = conversation.id

  await addMessage({ conversationId, role: "user", content: message })
  await touchConversation(conversationId, email ? { customer_email: email } : {})

  const escalated = HARD_ESCALATE_RE.test(message)
  if (escalated) {
    await escalate({
      conversationId,
      reason: "payment/order/human request",
      email,
      locale,
    })
  } else {
    // Nudge Mouha that there's a turn waiting (Mouha also polls as backup).
    await notifyMouha({
      event: "concierge.message",
      conversationId,
      message,
      locale,
      pageUrl: body.pageUrl,
    })
  }

  return NextResponse.json({
    conversationId,
    queued: true,
    handedOff: isHandedOff(conversation.status),
    escalated,
  })
}
