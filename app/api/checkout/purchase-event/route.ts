import { NextRequest, NextResponse } from "next/server";
import { getOrder, type RevolutOrder } from "@/lib/checkout/revolut";
import { sendPurchaseToCAPI } from "@/lib/checkout/meta-capi";

// Browser-triggered CAPI backup: the success page POSTs the Revolut order id
// here so a Purchase event fires even if the webhook is delayed. Meta dedupes
// against the webhook event by event_id (the Revolut order id).

export const dynamic = "force-dynamic";

type CartItem = {
  product_id: string;
  slug?: string;
  title: string;
  price: number;
  quantity: number;
};

function parseItemsFromMetadata(
  metadata: Record<string, string> | undefined,
): CartItem[] {
  if (!metadata) return [];
  const count = parseInt(metadata.item_count || "0", 10);
  if (!count) return [];
  const items: CartItem[] = [];
  for (let i = 0; i < count; i++) {
    const raw = metadata[`item_${i}`];
    if (!raw) continue;
    try {
      items.push(JSON.parse(raw));
    } catch {
      /* skip malformed */
    }
  }
  return items;
}

function getMetaAttribution(
  request: NextRequest,
  order: RevolutOrder,
): { fbp?: string; fbc?: string } {
  return {
    fbp: order.metadata?.meta_fbp || request.cookies.get("_fbp")?.value || undefined,
    fbc: order.metadata?.meta_fbc || request.cookies.get("_fbc")?.value || undefined,
  };
}

function eventSourceUrl(request: NextRequest, orderId: string): string {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    request.nextUrl.origin ||
    "https://www.maisontanneurs.com";
  return `${siteUrl.replace(/\/$/, "")}/checkout/success?revolut_order_id=${encodeURIComponent(orderId)}`;
}

export async function POST(request: NextRequest) {
  let body: { orderId?: string };
  try {
    body = (await request.json()) as { orderId?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }

  let order: RevolutOrder;
  try {
    order = await getOrder(orderId);
  } catch (err) {
    console.error("Revolut getOrder failed for purchase event:", err);
    return NextResponse.json({ error: "Could not load order" }, { status: 502 });
  }

  if (order.state !== "COMPLETED") {
    return NextResponse.json({ sent: false, reason: "not_completed" });
  }

  const items = parseItemsFromMetadata(order.metadata);
  const customerName = order.customer?.full_name || "";
  const [firstName, ...rest] = customerName.split(" ");
  const lastName = rest.join(" ");
  const shipping = order.shipping_address;
  const attribution = getMetaAttribution(request, order);

  await sendPurchaseToCAPI({
    email: order.customer?.email,
    firstName: firstName || undefined,
    lastName: lastName || undefined,
    phone: order.customer?.phone,
    city: shipping?.city,
    state: shipping?.region,
    zip: shipping?.postcode,
    country: shipping?.country_code,
    value: order.amount / 100,
    currency: order.currency.toUpperCase(),
    orderNumber: order.id,
    items: items.map((item) => ({
      id: item.slug || item.product_id,
      quantity: item.quantity,
      price: item.price / 100,
    })),
    fbp: attribution.fbp,
    fbc: attribution.fbc,
    clientIp: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
    clientUserAgent: request.headers.get("user-agent") || undefined,
    eventSourceUrl: eventSourceUrl(request, order.id),
  });

  return NextResponse.json({ sent: true });
}
