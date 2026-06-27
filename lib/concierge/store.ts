// Server-only Supabase access for the concierge. Writes need the service role
// (RLS blocks anon on the concierge_* tables), mirroring confirm-order.ts.
import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type {
  ConciergeConversation,
  ConciergeMessage,
  ConciergeRole,
  ConciergeStatus,
} from "./types"

let _client: SupabaseClient | null = null

function getClient(): SupabaseClient | null {
  if (_client) return _client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    console.warn("[concierge] missing Supabase url/key — persistence disabled")
    return null
  }
  _client = createClient(url, key, { auth: { persistSession: false } })
  return _client
}

export async function createConversation(input: {
  locale: string
  pageUrl?: string
  userAgent?: string
}): Promise<ConciergeConversation | null> {
  const sb = getClient()
  if (!sb) return null
  const { data, error } = await sb
    .from("concierge_conversations")
    .insert({
      locale: input.locale,
      page_url: input.pageUrl ?? null,
      user_agent: input.userAgent ?? null,
    })
    .select("*")
    .single()
  if (error) {
    console.error("[concierge] createConversation:", error.message)
    return null
  }
  return data as ConciergeConversation
}

export async function getConversation(
  id: string,
): Promise<ConciergeConversation | null> {
  const sb = getClient()
  if (!sb) return null
  const { data } = await sb
    .from("concierge_conversations")
    .select("*")
    .eq("id", id)
    .maybeSingle()
  return (data as ConciergeConversation) ?? null
}

export async function touchConversation(
  id: string,
  patch: Partial<Pick<ConciergeConversation, "status" | "customer_email">> = {},
): Promise<void> {
  const sb = getClient()
  if (!sb) return
  await sb
    .from("concierge_conversations")
    .update({ last_activity: new Date().toISOString(), ...patch })
    .eq("id", id)
}

export async function addMessage(input: {
  conversationId: string
  role: ConciergeRole
  content: string
  meta?: Record<string, unknown>
}): Promise<ConciergeMessage | null> {
  const sb = getClient()
  if (!sb) return null
  const { data, error } = await sb
    .from("concierge_messages")
    .insert({
      conversation_id: input.conversationId,
      role: input.role,
      content: input.content,
      meta: input.meta ?? null,
    })
    .select("*")
    .single()
  if (error) {
    console.error("[concierge] addMessage:", error.message)
    return null
  }
  return data as ConciergeMessage
}

export async function getMessages(
  conversationId: string,
  opts: { limit?: number; afterIso?: string; roles?: ConciergeRole[] } = {},
): Promise<ConciergeMessage[]> {
  const sb = getClient()
  if (!sb) return []
  let q = sb
    .from("concierge_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
  if (opts.afterIso) q = q.gt("created_at", opts.afterIso)
  if (opts.roles?.length) q = q.in("role", opts.roles)
  if (opts.limit) q = q.limit(opts.limit)
  const { data } = await q
  return (data as ConciergeMessage[]) ?? []
}

export async function createTicket(input: {
  conversationId: string
  reason: string
  summary?: string
  customerEmail?: string | null
  priority?: "low" | "normal" | "high"
}): Promise<string | null> {
  const sb = getClient()
  if (!sb) return null
  const { data, error } = await sb
    .from("concierge_tickets")
    .insert({
      conversation_id: input.conversationId,
      reason: input.reason,
      summary: input.summary ?? null,
      customer_email: input.customerEmail ?? null,
      priority: input.priority ?? "normal",
    })
    .select("id")
    .single()
  if (error) {
    console.error("[concierge] createTicket:", error.message)
    return null
  }
  return (data as { id: string }).id
}

export function isHandedOff(status: ConciergeStatus): boolean {
  return status === "human" || status === "closed"
}
