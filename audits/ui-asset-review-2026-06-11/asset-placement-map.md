# Maison Tanneurs asset placement map — 2026-06-11

Scope reviewed: `/Users/ryanz/maison-tanneurs-storefront/public/tanneurs/editorial` and `/Users/ryanz/maison-tanneurs-storefront/public/tanneurs/films`.

Contact sheets:
- `audits/ui-asset-review-2026-06-11/contact-sheets/editorial-all-contact.jpg`
- `audits/ui-asset-review-2026-06-11/contact-sheets/films-3frames-contact.jpg`

## Core rule

Product commerce imagery remains driven by `lib/product-images.json` and `/tanneurs/products/**`. Do not replace product card heroes/PDP first images with editorial/generated lifestyle. Hero-first product contract remains untouched.

## Recommended page / section placements

### Homepage hero — first departure

Preferred:
- Video: `/tanneurs/films/hero-terrace.mp4`
- Poster: `/tanneurs/films/hero-terrace-poster.jpg`

Why: strongest “object after atelier” / carried-into-departure image. Stone architecture + sea + bag-on-shoulder reads more travel-house than the current bright smiling courtyard. It is calmer and less generic resort.

Fallback if not using video:
- `/tanneurs/editorial/hero-shop-16x9.webp`
- mobile fallback: `/tanneurs/editorial/hero-shop-9x16.webp`

Caution: current hero-shop is beautiful but sunny/resort-like; use if video performance/crop is a problem, but keep copy and overlay more departure-focused.

### Homepage family / commerce map

No editorial image needed. Keep family list clean and typographic:
- Weekenders
- Briefcases
- Backpacks
- Crossbodies
- Totes

### Homepage `Les Premiers Modèles` / launch edit

Use product images only from `lib/product-images.json` and `/tanneurs/products/**`.

Optional editorial lead tile:
- `/tanneurs/editorial/collection-arch.webp`
- mobile: `/tanneurs/editorial/collection-arch-m.webp`

Why: strongest atmospheric launch-edit tile with product and corridor. Caution: zellige/arch is more Moroccan-coded; use once only, not as the whole brand language.

### Homepage `L’Équilibre de la Forme` / design philosophy

Preferred:
- `/tanneurs/editorial/statement-hall.webp`
- mobile: `/tanneurs/editorial/statement-hall-m.webp`

Why: object shape, proportion, clean architecture, quiet luxury. Good for “form / balance” section.

Alternative for more commerce/product-return close:
- `/tanneurs/editorial/closing-plinth.webp`
- mobile: `/tanneurs/editorial/closing-plinth-m.webp`

### Homepage duo / material-world insert

Preferred:
- `/tanneurs/editorial/duo-noir-sun.webp`
- mobile: `/tanneurs/editorial/duo-noir-sun-m.webp`
- `/tanneurs/editorial/duo-noir-pedestal.webp`
- mobile: `/tanneurs/editorial/duo-noir-pedestal-m.webp`

Why: minimal, architectural, product-as-object. Strong for quiet world-building without repeating craft.

### Homepage `Carried — at first light` / after-atelier travel

Preferred still:
- `/tanneurs/editorial/travel-olive-parapet.webp`
- mobile: `/tanneurs/editorial/travel-olive-parapet-m.webp`

Why: exactly the “after atelier” story: object in landscape, carried/used, first light. Caution: can drift toward resort/travel influencer if overused; pair with restrained copy.

Alternative / stronger movement:
- use `/tanneurs/films/hero-terrace.mp4` here if not used as the homepage hero.

### Homepage `Savoir-faire` / origin and craft proof

Preferred:
- `/tanneurs/editorial/craft-artisan-window.webp`
- mobile: `/tanneurs/editorial/craft-artisan-window-m.webp`

Why: best craft-origin still; human hand/workbench, warm light, atelier-specific.

Alternate craft stills for heritage page, not homepage first choice:
- `/tanneurs/editorial/atelier-arches.webp`
- `/tanneurs/editorial/atelier-table.webp`
- `/tanneurs/editorial/heritage-tannery.webp`

### Homepage `Le Départ` film

Preferred:
- Video: `/tanneurs/films/the-departure.mp4`
- Poster: `/tanneurs/films/the-departure-poster.jpg`

Why: strongest emotional proof of travel world. Keep as the named film section. Do not replace with craft video.

### Homepage trust/service strip

No imagery. Keep text/hairline system.

### Homepage `Small on purpose` / commercial close

Preferred:
- `/tanneurs/editorial/closing-plinth.webp`
- mobile: `/tanneurs/editorial/closing-plinth-m.webp`

Why: one object under light; good closing CTA back to collection.

### Heritage / Savoir-faire page

Hero / opening:
- `/tanneurs/editorial/atelier-arches.webp`

Process table:
- `/tanneurs/editorial/atelier-table.webp`

Tannery/material proof:
- `/tanneurs/editorial/heritage-tannery.webp`

Stamp/detail proof:
- `/tanneurs/editorial/craft-emboss.webp`
- `/tanneurs/editorial/craft-promise.webp`

Craft film if a second film/module is desired:
- `/tanneurs/films/the-making.mp4`
- `/tanneurs/films/the-making-poster.jpg`

Why: keep craft concentrated here so homepage can shift toward travel/world.

### Shop page

Keep product grid clean white with product images only:
- Product heroes/galleries from `lib/product-images.json`
- Do not insert lifestyle/editorial tiles into `/shop` grid unless deliberately designing a future campaign tile.

Hero/meta image if needed:
- `/tanneurs/editorial/hero-shop-16x9.webp`

### PDPs

Keep product galleries from `lib/product-images.json` only, hero first. Do not use editorial assets as PDP first images.

Optional PDP secondary editorial module after the buy/details area:
- Weekenders/travel: `/tanneurs/films/the-departure.mp4` or `/tanneurs/editorial/travel-olive-parapet.webp`
- Craft/material proof: `/tanneurs/films/the-making.mp4` or `/tanneurs/editorial/craft-artisan-window.webp`

Only add these if it improves the page; do not disrupt Add to Bag / service confidence.

### Boutique / trade pages

Boutique:
- `/tanneurs/editorial/boutique-court.webp`
- `/tanneurs/editorial/boutique-worktable.webp`

Trade:
- `/tanneurs/editorial/trade-retail.webp`
- `/tanneurs/editorial/trade-hospitality.webp`
- `/tanneurs/editorial/trade-gifting.webp`

Caution: these can feel showroom/mockup-ish. Keep secondary; do not let them define the main brand world.

### OG / social preview

Preferred current safe option:
- `/tanneurs/editorial/hero-shop-16x9.webp`

Alternative if wanting more distinctive Maison Tanneurs travel:
- `/tanneurs/films/the-departure-poster.jpg`

## Caution / avoid overuse

- `/tanneurs/editorial/hero-ryad-16x9.webp` and `/hero-ryad-9x16.webp`: visually pretty but bright resort/courtyard; use cautiously or not at all for main hero.
- `/tanneurs/editorial/collection-arch.webp`: strong but zellige/arch can become Moroccan-coded if repeated.
- `/tanneurs/editorial/travel-olive-parapet.webp`: good after-atelier story, but avoid making the site feel like generic influencer travel.
- `/tanneurs/editorial/trade-retail.webp`: showroom/product-row image is useful for trade/boutique only; not homepage identity.

## Desired homepage asset order

1. Hero: `hero-terrace.mp4` + poster, or fallback `hero-shop-16x9.webp` / `hero-shop-9x16.webp`.
2. Family nav: no image.
3. Launch edit: product images + optional `collection-arch` editorial lead tile.
4. Design philosophy: `statement-hall`.
5. Product/object insert: `duo-noir-sun` + `duo-noir-pedestal`.
6. After-atelier travel: `travel-olive-parapet`.
7. Savoir-faire origin: `craft-artisan-window`.
8. Film: `the-departure.mp4` + poster.
9. Trust band: no image.
10. Closing CTA: `closing-plinth`.
