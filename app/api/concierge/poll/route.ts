import { NextResponse, type NextRequest } from "next/server"
import { getConversation, getMessages } from "@/lib/concierge/store"

// The widget polls this while open so messages Mouha (or a human) inject from
// behind appear live, and so it knows when the thread has been taken over.
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const conversationId = searchParams.get("conversationId")
  const after = searchParams.get("after") || undefined
  if (!conversationId) {
    return NextResponse.json({ error: "Missing conversationId" }, { status: 400 })
  }

  const conversation = await getConversation(conversationId)
  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  // Surface replies the client hasn't shown yet: Mouha's `assistant` answers
  // and any `agent` (human/Mouha takeover) messages.
  const replies = await getMessages(conversationId, {
    roles: ["assistant", "agent"],
    afterIso: after,
  })

  return NextResponse.json({
    status: conversation.status,
    handedOff: conversation.status === "human" || conversation.status === "closed",
    messages: replies.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      created_at: m.created_at,
    })),
  })
}
