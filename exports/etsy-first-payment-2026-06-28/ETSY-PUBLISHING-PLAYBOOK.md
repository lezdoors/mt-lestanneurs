# Maison Tanneurs Etsy Publishing Playbook — First Payment Lane

Purpose: get Maison Tanneurs live on Etsy with a focused, credible first batch while Meta ads stay paused.

## Strategy

Launch 8 listings first, not the full catalogue.

Why:
- Easier QA.
- Cleaner shop impression.
- Lower-friction price points lead.
- Etsy rewards clarity more than catalogue size at the beginning.

Primary goal: first external buyer/payment signal.
Secondary goal: learn which object/style gets organic marketplace attention before reopening Meta spend.

## Shop identity

Shop name/display:
Maison Tanneurs

One-line shop description:
Full-grain leather bags, cut and stitched in a Marrakech atelier.

Longer shop intro:
Maison Tanneurs makes full-grain leather bags in small editions from a Marrakech atelier. Each object is cut, stitched, finished, and repaired with the patience of the bench: travel pieces, crossbodies, satchels, and totes made to carry well and age honestly.

Tone:
- restrained
- atelier-direct
- real materials
- no tourist language
- no souk clichés
- no fake scarcity beyond actual small editions

## Etsy operational defaults

Currency:
USD if the existing Etsy shop is already set up that way. Do not change shop currency casually if Etsy warns about irreversible/payment implications.

Shipping:
Free worldwide shipping.

Processing time:
3–5 business days if stock is physically ready.
If any item is made-to-order or not in-hand, use 5–10 business days instead.

Returns:
30 days, unused, original packaging.
Buyer pays return shipping unless the item arrives damaged or wrong.

Repairs:
Lifetime repair promise. Phrase as repair support/service, not an unlimited warranty against misuse.

Discounting:
Do not launch with a discount by default.
Use `WELCOME15` only if listings get visits/favorites but no carts after initial exposure.

## First 8 listing order

1. Medina Crossbody · Cognac — $195
2. Medina Crossbody · Tooled Walnut — $245
3. Medina Saddlebag · Tooled Cognac — $265
4. Classic Cognac Satchel — $285
5. Marrakech Tote · Cognac — $295
6. Explorer Rolltop · Cognac — $285
7. Atlas Kilim Duffle — $445
8. Medina Envelope Crossbody — $185

## Manual publish workflow

For each listing:

1. Open the matching markdown file in `listing-copy/`.
2. Copy the title into Etsy.
3. Upload images from the matching folder under `upload-ready-images/` in numeric order.
   - `01-...` is primary.
   - Keep the first image as the clean product image.
4. Paste the description.
5. Paste all tags, splitting by comma.
6. Set price exactly from the markdown/CSV.
7. Set quantity conservatively.
   - If unsure, use quantity `1` for each object.
8. Use free worldwide shipping profile.
9. Save as draft first.
10. Preview the public-facing listing before publishing.

## Required QA before publish

For each listing, verify:

- Primary image shows the correct product.
- No handles/straps are cut off.
- Background is clean enough for Etsy search/grid.
- Title includes handmade + leather + product type.
- Price matches the Maison Tanneurs site.
- Description includes full-grain leather, Marrakech atelier, shipping, returns, repair.
- Tags are relevant and not spammy.
- Shipping/returns do not contradict the website.
- No Maison Izem, Chapuis, Revolut, or Ryan personal info appears anywhere.

## After publishing

Record:

- Etsy listing URL
- product slug
- publish timestamp
- first 24h: views, favorites, carts, messages
- first sale / payment status

Decision rule:

- If Etsy gets a real sale or strong organic favorites/carts, use that product family to guide the first Meta relaunch angle.
- If Etsy gets traffic but no carts, adjust title/primary image/price framing before discounting.
- If Etsy gets no traffic, do not conclude product-market failure; Etsy SEO and shop trust may need setup/history.

## Files in this pack

- `etsy-first-8-listings.csv` — all listing fields in one table.
- `listing-copy/*.md` — one copy/paste file per listing.
- `upload-ready-images/*/` — images per listing, ordered for upload.
- `contact-sheets/00-primary-image-overview.jpg` — visual overview of primary listing images.
- `contact-sheets/*.jpg` — per-listing image contact sheets.
