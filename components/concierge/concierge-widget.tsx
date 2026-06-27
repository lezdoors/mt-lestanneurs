"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useLocale, useT } from "@/lib/i18n-client"

// On-site concierge. The website only queues turns + shows replies — no LLM
// runs here (no metered API cost). Mouha (the VPS agent, already 24/7) is the
// brain: it reads the Supabase queue and writes back `assistant` replies, and a
// human/Mouha can take over with `agent` messages. The widget polls
// /api/concierge/poll for both. Matches the cart-drawer motion language.

type Role = "user" | "assistant" | "agent"
interface Msg {
  id: string
  role: Role
  content: string
}

const CID_KEY = "mt_concierge_cid"
const POLL_MS = 4000
const REPLY_TIMEOUT_MS = 45000

export function ConciergeWidget() {
  const t = useT()
  const locale = useLocale()

  const [open, setOpen] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState("")
  const [pending, setPending] = useState(false) // awaiting Mouha's reply
  const [handedOff, setHandedOff] = useState(false)
  const [escalated, setEscalated] = useState(false)
  const [timedOut, setTimedOut] = useState(false)
  const [email, setEmail] = useState("")
  const [emailDraft, setEmailDraft] = useState("")
  const [error, setError] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const lastIso = useRef<string | null>(null)

  useEffect(() => {
    const saved =
      typeof window !== "undefined" ? localStorage.getItem(CID_KEY) : null
    if (saved) setConversationId(saved)
  }, [])

  // Display-only greeting (not persisted server-side).
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        { id: "greeting", role: "assistant", content: t("concierge.greeting") },
      ])
    }
  }, [open, messages.length, t])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, pending])

  // If the brain stays quiet, fall back to the leave-your-email path so the
  // chat never dead-ends ("in case something is wrong").
  useEffect(() => {
    if (!pending) return
    const id = setTimeout(() => {
      setPending(false)
      setTimedOut(true)
    }, REPLY_TIMEOUT_MS)
    return () => clearTimeout(id)
  }, [pending])

  const send = useCallback(
    async (text: string) => {
      const content = text.trim()
      if (!content || pending) return
      setError(null)
      setTimedOut(false)
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: "user", content },
      ])
      setInput("")
      setPending(true)
      try {
        const res = await fetch("/api/concierge", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            conversationId,
            message: content,
            locale,
            pageUrl:
              typeof window !== "undefined" ? window.location.pathname : "/",
            email: email || undefined,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error("request failed")
        if (data.conversationId && data.conversationId !== conversationId) {
          setConversationId(data.conversationId)
          localStorage.setItem(CID_KEY, data.conversationId)
        }
        if (data.handedOff) setHandedOff(true)
        if (data.escalated) setEscalated(true)
        // Reply arrives via poll, not here.
      } catch {
        setError(t("concierge.error"))
        setPending(false)
      }
    },
    [conversationId, email, locale, pending, t],
  )

  // Poll for replies (Mouha `assistant` + human `agent`).
  useEffect(() => {
    if (!open || !conversationId) return
    let cancelled = false
    const tick = async () => {
      try {
        const url = new URL("/api/concierge/poll", window.location.origin)
        url.searchParams.set("conversationId", conversationId)
        if (lastIso.current) url.searchParams.set("after", lastIso.current)
        const res = await fetch(url.toString())
        if (!res.ok || cancelled) return
        const data = await res.json()
        if (data.handedOff) setHandedOff(true)
        if (Array.isArray(data.messages) && data.messages.length) {
          setMessages((m) => [
            ...m,
            ...data.messages.map(
              (x: { id: string; role: Role; content: string }): Msg => ({
                id: x.id,
                role: x.role === "agent" ? "agent" : "assistant",
                content: x.content,
              }),
            ),
          ])
          lastIso.current =
            data.messages[data.messages.length - 1].created_at || lastIso.current
          setPending(false)
          setTimedOut(false)
        }
      } catch {
        /* silent — next tick retries */
      }
    }
    const id = setInterval(tick, POLL_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [open, conversationId])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    send(input)
  }

  const onEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const v = emailDraft.trim()
    if (!v) return
    setEmail(v)
    send(v)
  }

  const showEmailCapture = (escalated || timedOut) && !email

  return (
    <>
      {/* Launcher */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t("concierge.fab")}
          className="fixed bottom-5 right-5 z-[55] flex items-center gap-2.5 rounded-full bg-ink px-5 py-3 text-ground shadow-[0_8px_30px_rgba(28,26,23,0.22)] transition-opacity hover:opacity-90"
        >
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-ground/80" />
          <span className="text-micro">{t("concierge.fab")}</span>
        </button>
      )}

      {/* Panel */}
      <div
        className={`fixed inset-x-0 bottom-0 z-[70] flex flex-col bg-ground transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[380px] sm:rounded-lg sm:border sm:border-hairline sm:shadow-[0_24px_70px_rgba(28,26,23,0.28)] ${
          open
            ? "translate-y-0"
            : "pointer-events-none translate-y-[105%] sm:translate-y-[120%]"
        }`}
        style={{ height: "min(560px, 82vh)" }}
        role="dialog"
        aria-label={t("concierge.title")}
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-hairline px-6 py-5">
          <div>
            <h2 className="font-serif text-xl leading-none text-ink">
              {t("concierge.title")}
            </h2>
            <p className="mt-1.5 font-sans text-[11px] leading-tight text-ink-muted">
              {t("concierge.subtitle")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={t("concierge.close")}
            className="text-micro text-ink-soft transition-opacity hover:opacity-50"
          >
            {t("concierge.close")}
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
          {messages.map((m) => (
            <div
              key={m.id}
              className={
                m.role === "user" ? "flex justify-end" : "flex flex-col items-start"
              }
            >
              {m.role === "agent" && (
                <span className="mb-1 text-[10px] uppercase tracking-[0.22em] text-tobacco">
                  {t("concierge.agentLabel")}
                </span>
              )}
              <div
                className={
                  m.role === "user"
                    ? "max-w-[82%] rounded-2xl rounded-br-sm bg-ink px-4 py-2.5 font-sans text-[13px] leading-relaxed text-ground"
                    : "max-w-[88%] rounded-2xl rounded-bl-sm bg-ground-deep px-4 py-2.5 font-sans text-[13px] leading-relaxed text-ink"
                }
              >
                {m.content}
              </div>
            </div>
          ))}

          {pending && (
            <div className="flex items-center gap-1.5 px-1 text-ink-muted">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-muted" />
              <span
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-muted"
                style={{ animationDelay: "0.15s" }}
              />
              <span
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-muted"
                style={{ animationDelay: "0.3s" }}
              />
            </div>
          )}

          {handedOff && (
            <p className="border-t border-hairline pt-3 text-center font-serif text-[13px] italic text-ink-muted">
              {t("concierge.handoff")}
            </p>
          )}

          {error && (
            <p className="text-center font-sans text-[12px] text-tobacco">{error}</p>
          )}
        </div>

        {/* Email capture after escalation / quiet brain */}
        {showEmailCapture && (
          <form onSubmit={onEmailSubmit} className="border-t border-hairline px-6 pt-4">
            <input
              type="email"
              required
              value={emailDraft}
              onChange={(e) => setEmailDraft(e.target.value)}
              placeholder="you@email.com"
              className="w-full border-b border-hairline bg-transparent pb-2 font-sans text-[13px] text-ink outline-none placeholder:text-ink-muted"
            />
          </form>
        )}

        {/* Input */}
        <form onSubmit={onSubmit} className="border-t border-hairline px-6 py-4">
          <div className="flex items-end gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("concierge.placeholder")}
              className="flex-1 bg-transparent font-sans text-[13px] text-ink outline-none placeholder:text-ink-muted"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="text-micro text-ink transition-opacity hover:opacity-50 disabled:opacity-30"
            >
              {t("concierge.send")}
            </button>
          </div>
          <p className="mt-2 font-sans text-[10px] leading-tight text-ink-muted">
            {t("concierge.disclaimer")}
          </p>
        </form>
      </div>
    </>
  )
}
