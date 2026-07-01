"use client"

import { useState } from "react"

// Register-your-piece capture — the destination of the care-card QR. Records
// the hand-written serial (N°) against an email so the maison holds an
// authenticity record and a lifetime-repair contact. Posts to /api/repair
// (Supabase insert + Resend audience, both graceful). Restrained to match the
// newsletter: quiet fields, one action.
export function RepairRegister() {
  const [serial, setSerial] = useState("")
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
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
      const res = await fetch("/api/repair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value, serial: serial.trim(), name: name.trim(), locale }),
      })
      setState(res.ok ? "done" : "error")
    } catch {
      setState("error")
    }
  }

  if (state === "done") {
    return (
      <p className="mx-auto max-w-md text-center font-serif text-lg italic text-ink">
        Your piece is registered. It is now in our record, and re-stitching at
        the bench is yours for as long as the bag exists.
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-8">
      <div className="text-left">
        <label htmlFor="repair-serial" className="text-micro mb-3 block text-ink-muted">
          Serial — N° (written inside your card)
        </label>
        <input
          id="repair-serial"
          type="text"
          autoComplete="off"
          value={serial}
          onChange={(e) => {
            setSerial(e.target.value)
            if (state === "error") setState("idle")
          }}
          placeholder="e.g. 0147"
          className="w-full border-b border-[#1c1a17]/25 bg-transparent pb-2.5 font-sans text-base text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-ink"
        />
      </div>

      <div className="text-left">
        <label htmlFor="repair-name" className="text-micro mb-3 block text-ink-muted">
          Name (optional)
        </label>
        <input
          id="repair-name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border-b border-[#1c1a17]/25 bg-transparent pb-2.5 font-sans text-base text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-ink"
        />
      </div>

      <div className="text-left">
        <label htmlFor="repair-email" className="text-micro mb-3 block text-ink-muted">
          Email
        </label>
        <input
          id="repair-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (state === "error") setState("idle")
          }}
          placeholder="you@example.com"
          className="w-full border-b border-[#1c1a17]/25 bg-transparent pb-2.5 font-sans text-base text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-ink"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={state === "loading"}
          className="link-caps text-ink transition-opacity hover:opacity-55 disabled:opacity-40"
        >
          {state === "loading" ? "Registering…" : "Register your piece"}
        </button>
      </div>

      {state === "error" && (
        <p className="text-micro text-[#9b2c2c]">
          Please enter a valid email and try again.
        </p>
      )}
    </form>
  )
}
