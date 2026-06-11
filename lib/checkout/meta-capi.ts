// Meta Conversions API (CAPI) — server-side Purchase event firing.
// Companion to the client-side Pixel. CAPI fires from the server with the
// same event_id so Meta deduplicates when the browser Pixel is blocked.
//
// Env vars (both required, else no-op):
//   META_PIXEL_ID          — same numeric ID as NEXT_PUBLIC_META_PIXEL_ID
//   META_CAPI_ACCESS_TOKEN — Events Manager → Settings
//
// PII is SHA-256 hashed (lowercase, trimmed) per Meta requirements. node:crypto
// is built-in — no new deps.

import crypto from "node:crypto";

const PIXEL_ID = process.env.META_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID;
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
const META_API_VERSION = "v22.0";

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

interface PurchaseEvent {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  value: number; // major units (e.g. 1950.00)
  currency: string;
  orderNumber: string; // event_id for Pixel dedup
  items: Array<{ id: string; quantity: number; price: number }>;
  fbp?: string;
  fbc?: string;
  clientIp?: string;
  clientUserAgent?: string;
  eventSourceUrl?: string;
}

export async function sendPurchaseToCAPI(params: PurchaseEvent): Promise<void> {
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    console.log("[CAPI] skipped — META_PIXEL_ID or META_CAPI_ACCESS_TOKEN unset");
    return;
  }

  const userData: Record<string, string | string[]> = {};
  if (params.email) userData.em = sha256(params.email);
  if (params.firstName) userData.fn = sha256(params.firstName);
  if (params.lastName) userData.ln = sha256(params.lastName);
  if (params.phone) userData.ph = sha256(params.phone.replace(/[^\d]/g, ""));
  if (params.city) userData.ct = sha256(params.city);
  if (params.state) userData.st = sha256(params.state);
  if (params.zip) userData.zp = sha256(params.zip);
  if (params.country) userData.country = sha256(params.country);
  if (params.fbp) userData.fbp = params.fbp;
  if (params.fbc) userData.fbc = params.fbc;
  if (params.clientIp) userData.client_ip_address = params.clientIp;
  if (params.clientUserAgent) userData.client_user_agent = params.clientUserAgent;

  const customData = {
    currency: params.currency,
    value: params.value,
    content_ids: params.items.map((i) => i.id),
    content_type: "product",
    num_items: params.items.reduce((s, i) => s + i.quantity, 0),
    contents: params.items.map((i) => ({
      id: i.id,
      quantity: i.quantity,
      item_price: i.price,
    })),
  };

  const body = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: params.orderNumber,
        action_source: "website",
        event_source_url: params.eventSourceUrl,
        user_data: userData,
        custom_data: customData,
      },
    ],
  };

  const requestUrl = `https://graph.facebook.com/${META_API_VERSION}/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`;
  try {
    const res = await fetch(requestUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.error(`[CAPI] Purchase failed (${res.status}): ${await res.text()}`);
      return;
    }
    const json = await res.json();
    console.log(`[CAPI] Purchase sent — events_received=${json.events_received}`);
  } catch (err) {
    console.error("[CAPI] fetch error:", err);
  }
}
