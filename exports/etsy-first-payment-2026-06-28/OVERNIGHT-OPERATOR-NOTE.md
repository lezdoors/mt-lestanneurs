# Overnight Operator Note — Maison Tanneurs Etsy

Ryan handed over the night with two priorities:

1. Confirm Remi is not in Raccordments.
2. Keep pushing Etsy toward a first-payment path without needing Ryan at the computer.

## Raccordments access

Confirmed clean.

Raccordments workspace has only two human members:

- Ryan Haddaoui
- Hs Haddaoui

Slack API and Ryan's admin screenshot agree: Remi is not in Raccordments.

Remi exists only in the separate Maison Tanneurs workspace as `Remi Belfort` / `getyourcommand`, not in Raccordments.

## Etsy state

The Etsy pack is now more complete than the first draft.

Folder:

`/Users/ryanz/mt-lestanneurs/exports/etsy-first-payment-2026-06-28/`

Zip:

`/Users/ryanz/mt-lestanneurs/exports/etsy-first-payment-upload-pack-2026-06-28.zip`

## Added tonight

- `etsy-manual-fields-matrix.csv`
  - Etsy category suggestions
  - who made it / what is it / when made defaults
  - color guidance
  - materials
  - dimensions
  - atelier reference IDs
  - quantity/shipping/personalization defaults

- `etsy-first-payment-tracker.csv`
  - draft/published tracking
  - listing URL tracking
  - 24h views/favorites/carts/messages
  - first-sale timestamp

- Updated `etsy-first-8-listings.csv`
  - descriptions now include size, atelier reference, and materials pulled from live PDPs
  - revalidated Etsy title/tag/description limits

- Updated each file in `listing-copy/`
  - description includes dimensions/materials/reference
  - appended Etsy form-field block for manual publishing

- `prepublish-url-checks.csv`
  - verified all 8 site PDP URLs return 200
  - verified all 8 primary image URLs return 200 and are WebP

## Validation

Validated:

- 8 rows in listing CSV
- all Etsy titles under 140 characters
- all tags under Etsy's 20-character tag limit
- all listings use 11 tags, under Etsy's 13 tag limit
- all descriptions far under Etsy's 13k character description limit
- all live PDP URLs return HTTP 200
- all primary image URLs return HTTP 200

## First 8 listings

1. Medina Crossbody · Cognac — $195 — 22cm × 18cm × 6cm — MT-BAG-014
2. Medina Crossbody · Tooled Walnut — $245 — 22cm × 18cm × 6cm — MT-BAG-016
3. Medina Saddlebag · Tooled Cognac — $265 — 26cm × 22cm × 8cm — MT-BAG-020
4. Classic Cognac Satchel — $285 — 40cm × 30cm × 12cm — MT-BAG-007
5. Marrakech Tote · Cognac — $295 — 38cm × 34cm × 14cm — MT-BAG-013
6. Explorer Rolltop · Cognac — $285 — 44cm × 30cm × 16cm — MT-BAG-011
7. Atlas Kilim Duffle — $445 — 50cm × 28cm × 26cm — MT-BAG-003
8. Medina Envelope Crossbody — $185 — 24cm × 18cm × 4cm — MT-BAG-015

## Publishing stance

Do not dump all products.

Launch these 8 first, save as drafts, preview, then publish once each looks clean.

No launch discount by default. Use `WELCOME15` only if there are visits/favorites but no carts after initial exposure.

Quantity: use `1` unless exact stock is confirmed.

Shipping: free worldwide shipping, 3–5 business days if stock is physically ready; otherwise 5–10 business days.

## Remaining external blocker

Etsy itself still requires Ryan/human browser access because Etsy blocks automation/browserbase with DataDome. Amghar can own the copy/assets/QA/tracking, but Ryan must perform login/2FA/publish clicks unless a safe local browser or remote desktop handoff is provided.

## Git state

Local repo is ahead of origin. Do not push without Ryan's approval because `main` may trigger Vercel production builds.
