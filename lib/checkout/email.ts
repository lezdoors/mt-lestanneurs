// Order emails via the Resend REST API (fetch — no SDK dependency).
// Guarded on RESEND_API_KEY: if unset, sends are skipped (logged), so the
// checkout flow degrades gracefully until the key is configured in Vercel.

import { formatPrice } from "./format";
import { isCurrency, type Currency } from "./currency";

function asCurrency(value: string | undefined): Currency {
  return isCurrency(value) ? value : "USD";
}

const FROM_EMAIL = "Maison Tanneurs <orders@maisontanneurs.com>";
const REPLY_TO = "hello@maisontanneurs.com";
const ADMIN_EMAIL = "orders@maisontanneurs.com";

async function resendSend(payload: Record<string, unknown>): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log("[email] skipped — RESEND_API_KEY unset");
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error(`[email] Resend failed (${res.status}): ${await res.text()}`);
    }
  } catch (err) {
    console.error("[email] fetch error:", err);
  }
}

interface OrderEmailData {
  to: string;
  orderNumber: string;
  customerName: string;
  items: { title: string; price: number; quantity: number }[];
  total: number;
  currency?: string;
}

export async function sendOrderConfirmation(data: OrderEmailData): Promise<void> {
  const cur = asCurrency(data.currency);
  const itemsHtml = data.items
    .map(
      (i) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #e4dcc8;font-family:Georgia,serif;">${i.title}</td><td style="padding:8px 0;border-bottom:1px solid #e4dcc8;text-align:center;font-family:monospace;font-size:12px;">${i.quantity}</td><td style="padding:8px 0;border-bottom:1px solid #e4dcc8;text-align:right;font-family:Georgia,serif;font-style:italic;">${formatPrice(i.price * i.quantity, cur)}</td></tr>`,
    )
    .join("");

  await resendSend({
    from: FROM_EMAIL,
    reply_to: REPLY_TO,
    to: data.to,
    subject: `Order Confirmed — ${data.orderNumber}`,
    html: `
      <div style="max-width:600px;margin:0 auto;background:#f5efe3;padding:48px 32px;font-family:'Inter Tight',Helvetica,Arial,sans-serif;color:#1f1b16;">
        <div style="text-align:center;margin-bottom:40px;">
          <div style="font-family:monospace;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:#7a6f5c;margin-bottom:8px;">Order Confirmed</div>
          <div style="font-family:Georgia,serif;font-size:36px;letter-spacing:-0.01em;line-height:1.1;">MAISON TANNEURS</div>
        </div>
        <p style="font-family:Georgia,serif;font-style:italic;font-size:18px;line-height:1.5;color:#3a332a;">Dear ${data.customerName},</p>
        <p style="font-family:Georgia,serif;font-style:italic;font-size:16px;line-height:1.6;color:#3a332a;">Thank you for your order. Each piece is handcrafted by our artisans in Marrakech and will be carefully prepared for shipping.</p>
        <div style="margin:32px 0;padding:24px 0;border-top:1px solid #d9cfbb;">
          <div style="font-family:monospace;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#7a6f5c;margin-bottom:16px;">Order ${data.orderNumber}</div>
          <table style="width:100%;border-collapse:collapse;">
            <tbody>${itemsHtml}</tbody>
          </table>
          <div style="display:flex;justify-content:space-between;margin-top:16px;padding-top:16px;">
            <span style="font-family:monospace;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#7a6f5c;">Total</span>
            <span style="font-family:Georgia,serif;font-size:22px;font-style:italic;">${formatPrice(data.total, cur)}</span>
          </div>
        </div>
        <div style="text-align:center;margin-top:40px;padding-top:24px;border-top:1px solid #d9cfbb;">
          <div style="font-family:monospace;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#7a6f5c;">Maison Tanneurs · Marrakech</div>
        </div>
      </div>
    `,
  });
}

interface AdminNotificationData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: { title: string; price: number; quantity: number; product_id?: string }[];
  total: number;
  currency?: string;
  shippingAddress: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    [key: string]: unknown;
  };
}

export async function sendAdminNotification(data: AdminNotificationData): Promise<void> {
  const cur = asCurrency(data.currency);
  const itemsList = data.items
    .map((i) => `- ${i.title} (${i.quantity}x) — ${formatPrice(i.price * i.quantity, cur)}`)
    .join("\n");
  const addr = data.shippingAddress;
  const addressStr = [
    addr.line1,
    addr.line2,
    `${addr.city ?? ""}, ${addr.state ?? ""} ${addr.postal_code ?? ""}`,
    addr.country,
  ]
    .filter(Boolean)
    .join("\n");

  await resendSend({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `New Maison Tanneurs Order · ${data.orderNumber} · ${formatPrice(data.total, cur)}`,
    html: `
      <div style="font-family:monospace;font-size:13px;line-height:1.8;color:#1f1b16;max-width:600px;">
        <h2 style="font-family:Georgia,serif;font-size:24px;font-weight:normal;">New Order: ${data.orderNumber}</h2>
        <p><strong>Customer:</strong> ${data.customerName} (${data.customerEmail})</p>
        <p><strong>Total:</strong> ${formatPrice(data.total, cur)}</p>
        <p><strong>Items:</strong></p>
        <pre style="background:#f5efe3;padding:16px;white-space:pre-wrap;">${itemsList}</pre>
        <p><strong>Ship to:</strong></p>
        <pre style="background:#f5efe3;padding:16px;white-space:pre-wrap;">${addressStr}</pre>
      </div>
    `,
  });
}
