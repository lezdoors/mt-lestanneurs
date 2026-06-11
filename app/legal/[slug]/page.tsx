import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { PageShell } from "@/components/editorial/page-shell"

// Policy content ported from the production site (kechken) — same facts,
// same commitments. Do not alter commitments without Ryan's approval.

type Section = { heading: string; body?: string; items?: string[] }
type LegalPage = {
  eyebrow: string
  title: string
  description: string
  updated: string
  sections: Section[]
}

const EMAIL = "hello@maisontanneurs.com"

const PAGES: Record<string, LegalPage> = {
  shipping: {
    eyebrow: "Shipping",
    title: "How it gets to you.",
    description:
      "How Maison Tanneurs ships leather goods worldwide. Free worldwide shipping via DHL Express, with most orders arriving in 5 to 10 business days.",
    updated: "19 May 2026",
    sections: [
      {
        heading: "Free worldwide shipping",
        body: "Every order ships free, worldwide, with no minimum — via DHL Express, direct from Marrakech.",
      },
      {
        heading: "Delivery times",
        items: [
          "Most destinations · 5–10 business days, DHL Express direct from Marrakech.",
          "Remote destinations · transit may take longer depending on local customs and carrier access.",
        ],
      },
      {
        heading: "Tracking",
        body: `You receive a tracking number by email the day your piece leaves the atelier. Questions about a shipment — write to ${EMAIL} with your order number.`,
      },
      {
        heading: "Customs and duties",
        body: "Orders may be subject to import duties and taxes assessed by the destination country. These are the responsibility of the recipient and are not collected at checkout.",
      },
      {
        heading: "Lost or damaged packages",
        body: `If a package arrives damaged or does not arrive, write to ${EMAIL} and we will open a carrier investigation and make it right.`,
      },
      {
        heading: "Address changes",
        body: "Write to us as soon as possible after ordering. Once a piece has left the atelier, the courier may not be able to redirect it.",
      },
    ],
  },
  returns: {
    eyebrow: "Returns",
    title: "Returns and exchanges.",
    description:
      "Returns and exchanges at Maison Tanneurs. Thirty days, unused and undamaged, with original packaging.",
    updated: "19 May 2026",
    sections: [
      {
        heading: "What we accept",
        items: [
          "Bags returned unused, undamaged, with the dust bag and original packaging.",
          "Small leather goods returned unused, undamaged, with original packaging.",
        ],
      },
      {
        heading: "What we cannot accept",
        items: [
          "Items returned more than 30 days after delivery.",
          "Items that have been used, conditioned, altered, or damaged by the customer.",
          "Final-sale items (clearly marked on the product page at purchase).",
        ],
      },
      {
        heading: "How to return",
        items: [
          `Write to ${EMAIL} within 30 days of delivery with your order number and the reason for the return.`,
          "We will arrange a tracked return shipping label (EU and US orders) and email it to you within one working day.",
          "Ship the bag back within 14 days of receiving the label.",
          "Once we receive and inspect the return, we will refund the original payment method within 5 business days, or dispatch the exchange.",
        ],
      },
      {
        heading: "Damaged or wrong items",
        body: `If we sent the wrong piece or it arrived damaged, write to ${EMAIL} — return shipping is on us and the replacement is prioritised on the bench.`,
      },
    ],
  },
  repair: {
    eyebrow: "Lifetime Repair",
    title: "For as long as the bag exists.",
    description:
      "The Maison Tanneurs lifetime repair guarantee. Every piece can be re-stitched, edge-coated, and re-lined at our Marrakech atelier for as long as the object exists.",
    updated: "29 May 2026",
    sections: [
      {
        heading: "What is covered",
        items: [
          "Re-stitching seams that have come loose with wear.",
          "Re-coating or re-burnishing edges that have softened.",
          "Re-lining a torn or worn interior with matching vegetable-tanned leather.",
          "Replacing solid-brass hardware (rivets, buckles, D-rings) with matching parts.",
          "Conditioning and reviving leather that has dried out from long use.",
        ],
      },
      {
        heading: "What is not covered",
        items: [
          "Damage caused by sharp objects, chemicals, fire, or accidents (insurance territory, not workmanship).",
          "Cosmetic patina, scratches, and natural ageing — full-grain leather is meant to record the life of the bag, and we will not erase that without your explicit instruction.",
          "Modifications made by another leatherworker. We can still repair the bag, but the warranty on that section is voided.",
        ],
      },
      {
        heading: "How it works",
        body: `Write to ${EMAIL} with the subject "Repair Request", photos of the piece, and where it lives. We confirm the work, you ship it to the bench, and it returns repaired.`,
      },
      {
        heading: "Cost",
        body: "Workmanship covered by this guarantee is repaired at no charge. Round-trip shipping to the atelier is the owner's only cost.",
      },
    ],
  },
  care: {
    eyebrow: "Care",
    title: "How to keep it.",
    description:
      "How to care for your Maison Tanneurs full-grain leather bag so it patinas well and lasts a decade.",
    updated: "19 May 2026",
    sections: [
      {
        heading: "Full-grain leather",
        items: [
          "Wipe with a dry soft cloth after use. Leather develops its character through wear — small marks are part of the patina.",
          "Apply a neutral leather conditioner every 3–6 months, working with the grain.",
          "Store in the included dust bag, away from direct sunlight and heat sources.",
          "If the leather gets wet, blot dry with a soft towel and let it air dry at room temperature. Do not use a hairdryer.",
          "Avoid contact with oils, alcohol-based products, and dark denim (which can transfer dye onto lighter leather).",
        ],
      },
      {
        heading: "Solid brass hardware",
        items: [
          "Brass develops a soft natural patina over time — this is intentional. Don't polish it unless you want to reset.",
          "To reset the shine, use a soft cloth with a small amount of brass polish, then buff dry.",
          "Keep hardware dry. If exposed to saltwater or chlorine, rinse with fresh water and dry thoroughly.",
        ],
      },
      {
        heading: "Repairs",
        body: `When a seam softens or an edge wears, write to ${EMAIL} — every piece is covered by our lifetime repair guarantee.`,
      },
    ],
  },
  faq: {
    eyebrow: "Help",
    title: "Frequently asked.",
    description:
      "Common questions about ordering, shipping, and caring for Maison Tanneurs leather goods.",
    updated: "19 May 2026",
    sections: [
      {
        heading: "What is Maison Tanneurs?",
        body: "A leather house with one Marrakech atelier. Full-grain hides, cut and saddle-stitched by hand, in editions small enough to keep every stitch honest.",
      },
      {
        heading: "How is each piece produced?",
        body: "One artisan takes a piece from cut to finish on a single bench — saddle-stitched in waxed linen, edges burnished by hand.",
      },
      {
        heading: "How long does shipping take?",
        body: "Most destinations 5–10 business days via DHL Express, direct from Marrakech.",
      },
      {
        heading: "Do you offer free shipping?",
        body: "Yes — free worldwide shipping on every order, with no minimum and no surcharge for DHL Express service.",
      },
      {
        heading: "What sizes do you carry?",
        body: "Bags are one-size. Dimensions are listed on each product page.",
      },
      {
        heading: "Can I return something?",
        body: "Within 30 days of delivery, unused and undamaged, with original packaging. See Returns for the full process.",
      },
      {
        heading: "Still have a question?",
        body: `Write to ${EMAIL} — we answer within one working day.`,
      },
    ],
  },
  terms: {
    eyebrow: "Terms",
    title: "Terms of sale.",
    description:
      "The terms under which Maison Tanneurs sells hand-stitched leather goods, shipped direct from a Marrakech atelier.",
    updated: "19 May 2026",
    sections: [
      {
        heading: "About Maison Tanneurs",
        body: "Maison Tanneurs sells full-grain leather goods made by hand in Marrakech and shipped worldwide. By placing an order you accept these terms.",
      },
      {
        heading: "Placing an order",
        body: "An order is confirmed when you receive the confirmation email. We may decline or cancel an order where stock, pricing, or payment cannot be verified — any payment taken is refunded in full.",
      },
      {
        heading: "Pricing and payment",
        body: "Prices are shown in euros and may change between editions; the price at checkout is the price you pay. Payment is handled by our payment processor — we never see or store your card number.",
      },
      {
        heading: "Production and shipping",
        body: "Pieces ship from the Marrakech atelier — see the Shipping page for times and customs. Risk passes to you on delivery.",
      },
      {
        heading: "Returns and refunds",
        body: "Thirty days, unused and undamaged, with original packaging — see the Returns page for the full process.",
      },
      {
        heading: "Intellectual property",
        body: "All photography, text, and designs on this site belong to Maison Tanneurs and may not be reproduced without written permission.",
      },
      {
        heading: "Limitation of liability",
        body: "Nothing in these terms limits rights you hold under applicable consumer law. Beyond that, our liability is limited to the price paid for the piece.",
      },
      {
        heading: "Contact",
        body: `Questions about these terms — write to ${EMAIL}.`,
      },
    ],
  },
  privacy: {
    eyebrow: "Privacy",
    title: "Privacy policy.",
    description:
      "How Maison Tanneurs collects, uses, and protects the personal information of customers.",
    updated: "19 May 2026",
    sections: [
      {
        heading: "Information we collect",
        items: [
          "Order details: name, billing and shipping address, email, phone number, and the items you ordered.",
          "Payment information: handled exclusively by our payment processor. We never see or store your card number.",
          `Correspondence: messages you send to ${EMAIL} or via our contact forms.`,
          "Site analytics: anonymous information about how you use the site (pages visited, device type, time on page), collected via privacy-respecting analytics.",
          "Marketing email: if you opt into the newsletter, we store your email and the date you subscribed.",
        ],
      },
      {
        heading: "How we use it",
        items: [
          "To fulfill your order — passing your name and shipping address to our Marrakech atelier and the express courier handling delivery.",
          "To send order confirmations, shipping updates, and post-delivery follow-ups.",
          "To respond to your questions and resolve any issues with your order.",
          "To improve the site and the product range based on aggregate analytics.",
          "To send marketing emails — only if you have explicitly opted in. You can unsubscribe at any time using the link in any email.",
        ],
      },
      {
        heading: "Who we share it with",
        items: [
          "Our payment processor — for payment processing.",
          "Our Marrakech atelier — for finishing and dispatch.",
          "Our express courier — for delivery.",
          "Our email service — for transactional and newsletter email delivery.",
        ],
      },
      {
        heading: "Your rights",
        body: `You can request a copy of your data, correct it, or ask us to delete it at any time — write to ${EMAIL}.`,
      },
      {
        heading: "Security",
        body: "Data is transmitted over encrypted connections and access is limited to the people who need it to fulfil your order.",
      },
    ],
  },
}

export function generateStaticParams() {
  return Object.keys(PAGES).map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const page = PAGES[slug]
  if (!page) return { title: "Maison Tanneurs" }
  return {
    title: `${page.title.replace(/\.$/, "")} — Maison Tanneurs`,
    description: page.description,
  }
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const page = PAGES[slug]
  if (!page) notFound()

  return (
    <PageShell eyebrow={page.eyebrow} title={page.title}>
      <div className="mx-auto max-w-2xl px-6">
        <p className="text-micro mb-12 text-center text-ink-muted">
          Last updated · {page.updated}
        </p>
        <div className="border-t border-hairline">
          {page.sections.map((s) => (
            <section key={s.heading} className="border-b border-hairline py-10">
              <h2 className="font-serif text-2xl text-ink">{s.heading}</h2>
              {s.body && (
                <p className="mt-4 font-serif text-base leading-relaxed text-ink-soft md:text-lg">
                  {s.body}
                </p>
              )}
              {s.items && (
                <ul className="mt-4 flex flex-col gap-3 font-serif text-base leading-relaxed text-ink-soft md:text-lg">
                  {s.items.map((item) => (
                    <li key={item} className="border-l border-hairline pl-5">
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </PageShell>
  )
}
