# Maison Tanneurs first-payment pass — 2026-06-28

Scope: validate the current live production site after the Stripe checkout fix, and prepare a low-risk Etsy first-payment lane while Meta ads remain paused.

## Production identity

- Live domain: https://www.maisontanneurs.com
- Vercel project serving live traffic: `mt-lestanneurs`
- Production deployment inspected: `mt-lestanneurs-xk9cvm8j2-haddaoui.vercel.app`
- Production deployment id: `dpl_GzG2UqLjLR9fgEDh7qGpx429Lh4i`
- Live aliases: `www.maisontanneurs.com`, `maisontanneurs.com`, `mt-lestanneurs.vercel.app`
- Active local repo for the live site: `/Users/ryanz/mt-lestanneurs`

Important: `/Users/ryanz/kechken` is not the live production project currently aliased to `maisontanneurs.com`. Its old launch verifier scripts still expect `/products` and `/checkout/pay`, but live `mt-lestanneurs` uses `/shop`, `/product/[id]`, and `/checkout`.

## Verified live routes

- `/` returned 200 and rendered the current editorial homepage.
- `/shop` returned 200 and rendered 24 products.
- `/product/atlas-kilim-duffle` returned 200 with PDP media, copy, add-to-bag, trust promises, and related products.
- `/checkout` returned 200 after adding a product to bag.
- `/api/checkout/session` returned 405 to HEAD, proving the route exists and rejects the wrong method.
- `/feed/products.xml` returned 200 and contained 24 product items.
- `/sitemap.xml` returned 200.

## Checkout smoke

Browser path exercised:

1. Opened `/shop`.
2. Opened `Atlas Kilim Duffle` PDP.
3. Clicked `ADD TO BAG`.
4. Confirmed bag count changed to `BAG (1)`.
5. Clicked `CHECKOUT`.
6. Confirmed `/checkout` rendered with:
   - Link / Amazon Pay express frame.
   - Contact and shipping fields.
   - Order summary with Atlas Kilim Duffle at `$445`.
   - Stripe secure payment input frame present in the DOM.
   - Pay button present as `PAY NOW · $445`.

No real card submission was made in this pass.

## Local verification

From `/Users/ryanz/mt-lestanneurs`:

- `pnpm approve-builds --all` approved `sharp` build scripts locally and changed `pnpm-workspace.yaml` from placeholder to `sharp: true`.
- `pnpm test` passed: 5/5 node tests.
- `pnpm build` passed with Next 16.0.10. Type validation remains skipped by project config.

## Etsy first-payment lane

Created a small listing kit under:

`/Users/ryanz/mt-lestanneurs/exports/etsy-first-payment-2026-06-28/`

Files:

- `README.md` — recommended first 8 listings and shop defaults.
- `etsy-first-8-listings.csv` — Etsy-ready titles, listing copy, tags, prices, site URLs, primary image URLs, and additional image URLs from the live product feed.

Recommended first listings:

1. Medina Crossbody · Cognac — $195
2. Medina Crossbody · Tooled Walnut — $245
3. Medina Saddlebag · Tooled Cognac — $265
4. Classic Cognac Satchel — $285
5. Marrakech Tote · Cognac — $295
6. Explorer Rolltop · Cognac — $285
7. Atlas Kilim Duffle — $445
8. Medina Envelope Crossbody — $185

Rationale: lower-friction price points first, with one statement kilim object for brand distinctiveness. Do not dump all 24 products at once.

## Recommendation

Use Etsy now as the first-payment channel. Keep Meta ads paused until either:

- one real site checkout succeeds and the order persists cleanly, or
- Etsy produces the first buyer/payment proof.

This lets the paid Etsy account do useful work without reopening ad spend into a still-young checkout surface.
