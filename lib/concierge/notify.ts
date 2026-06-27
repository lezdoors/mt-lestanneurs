// Single outbound notifier to Mouha (the VPS agent that acts as the concierge
// brain). Fires on every user turn (so Mouha answers promptly) and on
// escalations. Best-effort + guarded — if MOUHA_WEBHOOK_URL is unset, Mouha
// falls back to polling the Supabase queue itself.
export async function notifyMouha(payload: Record<string, unknown>): Promise<void> {
  const url = process.env.MOUHA_WEBHOOK_URL
  if (!url) return
  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(process.env.MOUHA_WEBHOOK_SECRET
          ? { "x-mt-secret": process.env.MOUHA_WEBHOOK_SECRET }
          : {}),
      },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    console.error("[concierge] Mouha webhook error:", err)
  }
}
