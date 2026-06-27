"use client"

import { useState } from "react"
import { useT } from "@/lib/i18n-client"
import { Reveal } from "@/components/editorial/reveal"

// Newsletter — the atelier-editions list, tied to the "small editions, no two
// repeat" story. Restrained: one line of intent, one field, one quiet action.
// Posts to /api/newsletter (Resend Audience + Supabase mirror, both graceful).
export function Newsletter() {
  const t = useT()
  const [email, setEmail] = useState("")
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle")

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (state === "loading") return
    const value = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setState("error")
      return
    }
    setState("loading")
    try {
      const locale =
        typeof document !== "undefined"
          ? document.documentElement.lang || "en"
          : "en"
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value, locale }),
      })
      setState(res.ok ? "done" : "error")
    } catch {
      setState("error")
    }
  }

  return (
    <section className="bg-white px-6 py-24 text-center md:py-32">
      <Reveal>
        <div className="mx-auto max-w-xl">
          <p className="text-micro mb-6 text-ink-muted">
            {t("newsletter.eyebrow")}
          </p>
          <h2 className="font-serif text-3xl leading-[1.15] text-ink md:text-4xl">
            {t("newsletter.title")}
          </h2>
          <p className="mx-auto mt-5 max-w-md font-serif text-base leading-relaxed text-ink-soft md:text-lg">
            {t("newsletter.body")}
          </p>

          {state === "done" ? (
            <p className="mt-10 font-serif text-lg italic text-ink">
              {t("newsletter.success")}
            </p>
          ) : (
            <form
              onSubmit={onSubmit}
              className="mx-auto mt-10 flex max-w-md items-end gap-4"
            >
              <div className="flex-1 text-left">
                <label htmlFor="newsletter-email" className="sr-only">
                  {t("newsletter.placeholder")}
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (state === "error") setState("idle")
                  }}
                  placeholder={t("newsletter.placeholder")}
                  className="w-full border-b border-[#1c1a17]/25 bg-transparent pb-2.5 font-sans text-base text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-ink"
                />
              </div>
              <button
                type="submit"
                disabled={state === "loading"}
                className="link-caps shrink-0 pb-2.5 text-ink transition-opacity hover:opacity-55 disabled:opacity-40"
              >
                {state === "loading" ? t("newsletter.sending") : t("newsletter.cta")}
              </button>
            </form>
          )}

          {state === "error" && (
            <p className="mt-3 text-micro text-[#9b2c2c]">
              {t("newsletter.error")}
            </p>
          )}
        </div>
      </Reveal>
    </section>
  )
}
