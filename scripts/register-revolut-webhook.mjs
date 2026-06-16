#!/usr/bin/env node
// One-shot: register the Maison Tanneurs webhook with the Revolut Merchant API.
//
// Usage (run in your own terminal so the key never leaves your machine):
//   REVOLUT_SECRET_KEY=sk_live_xxx node scripts/register-revolut-webhook.mjs
//
// On success it prints the webhook id + signing_secret. Copy the signing_secret
// into Vercel as REVOLUT_WEBHOOK_SECRET (Production), then redeploy.
//
// The Merchant API base + version match what the app already uses successfully
// (orders are created against the same base), so auth/version are known-good.

const KEY = process.env.REVOLUT_SECRET_KEY;
if (!KEY) {
  console.error("Set REVOLUT_SECRET_KEY (your Revolut Merchant sk_... key).");
  process.exit(1);
}

const BASE = process.env.REVOLUT_API_BASE || "https://merchant.revolut.com/api";
const WEBHOOK_URL = "https://www.maisontanneurs.com/api/webhooks/revolut";
const EVENTS = [
  "ORDER_COMPLETED",
  "ORDER_AUTHORISED",
  "ORDER_PAYMENT_FAILED",
  "ORDER_CANCELLED",
];

// Revolut has shipped the create-webhook endpoint under a few paths across
// versions; try them in order and use whichever the account accepts.
const CANDIDATES = ["/1.0/webhooks", "/webhooks", "/merchant/webhooks"];

const headers = {
  Authorization: `Bearer ${KEY}`,
  "Content-Type": "application/json",
  Accept: "application/json",
  "Revolut-Api-Version": "2024-09-01",
};

async function tryListThenCreate(path) {
  const url = `${BASE.replace(/\/$/, "")}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ url: WEBHOOK_URL, events: EVENTS }),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  return { url, status: res.status, json };
}

const errors = [];
for (const path of CANDIDATES) {
  try {
    const r = await tryListThenCreate(path);
    if (r.status >= 200 && r.status < 300) {
      console.log("\n✅ Webhook registered via", r.url);
      console.log(JSON.stringify(r.json, null, 2));
      const secret = r.json && r.json.signing_secret;
      if (secret) {
        console.log("\n👉 Add this to Vercel (Production) as REVOLUT_WEBHOOK_SECRET:");
        console.log("   " + secret);
      } else {
        console.log(
          "\n(No signing_secret in the response — check Merchant → APIs → Webhooks for it.)",
        );
      }
      process.exit(0);
    }
    errors.push(`${r.url} -> ${r.status}: ${JSON.stringify(r.json)}`);
    // 422 = likely already registered / limit reached; stop and report.
    if (r.status === 422) break;
  } catch (e) {
    errors.push(`${path} -> ${e.message}`);
  }
}

console.error("\n❌ Could not register the webhook. Responses:");
errors.forEach((e) => console.error("  - " + e));
console.error(
  "\nIf every path 404s, register it in Revolut Business → Merchant → APIs → Webhooks:" +
    `\n  URL:    ${WEBHOOK_URL}` +
    `\n  Events: ${EVENTS.join(", ")}`,
);
process.exit(1);
