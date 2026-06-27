// Shared concierge types. `agent` = a human concierge or Mouha (the VPS
// oversight agent) writing into the thread from behind.
export type ConciergeRole = "user" | "assistant" | "agent"

export type ConciergeStatus = "open" | "escalated" | "human" | "closed"

export interface ConciergeMessage {
  id: string
  conversation_id: string
  role: ConciergeRole
  content: string
  created_at: string
  meta?: Record<string, unknown> | null
}

export interface ConciergeConversation {
  id: string
  created_at: string
  last_activity: string
  status: ConciergeStatus
  locale: string
  customer_email: string | null
  page_url: string | null
  user_agent: string | null
}

// What the client sends on each turn.
export interface ConciergeChatRequest {
  conversationId?: string | null
  message: string
  locale?: string
  pageUrl?: string
  email?: string
}

// What the route returns to the widget.
export interface ConciergeChatResponse {
  conversationId: string
  reply: string
  // true once a human/Mouha owns the thread — the AI stands down.
  handedOff: boolean
  escalated: boolean
}
