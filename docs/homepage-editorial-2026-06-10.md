# Editorial Homepage v2 — "Polène discipline, Marrakech light" (2026-06-10)

Branch `editorial-homepage`. Production repo (kechken) untouched. Two iterations:
v1 (Aman travel register) → v2 (French luxury register after live-site research).

## Design research basis

Headless-browser captures of polene-paris.com, metier.com, atelierauguste.com,
aetherapparel.com analyzed by art-direction agent. Adopted patterns: transparent
hairline header over atmospheric hero; hero speaks zero words (floating product
card instead); display type lives below the fold; one CTA morphology (underlined
tracked caps, zero buttons); products float plateless via `mix-blend-mode:
multiply` on pure-white packshots; prices whisper-size; French nomenclature.

## Brand fonts (from Drive `Fonts/`, self-hosted via next/font/local)

- Bodoni Moda SC variable (display statements + wordmark)
- Cormorant Garamond variable + italic (serif voice)
- Inter (tracked-caps utility)

## Asset list (all Drive HD originals, pixel-verified)

| Site asset | Drive source |
|---|---|
| `editorial/hero-carry-16x9.webp` (3840) | `Under the Hero/mt-hero-weekender-desert-carry-HD-16x9-v02.png` (5120x2880) |
| `editorial/hero-carry-9x16.webp` (1440) | `Under the Hero/mt-hero-weekender-desert-carry-HD-9x16-v02.png` |
| `editorial/duo-dusk-walk.webp` | `Maison tanneurs Atelier assets /model-night-desert-HD.png` (graded: temp 5700K, sat 0.70) |
| `editorial/duo-dusk-lantern.webp` | `Maisom TanneursLifestyle images/Hero-duffle-dune-lantern-dusk-HD.png` (same grade) |
| `editorial/travel-cappadocia.webp` | `Maisom TanneursLifestyle images/Hero-duffle-cappadocia-balloons-sunrise-HD.png` |
| `editorial/craft-hands.webp` | `Maison tanneurs Atelier assets /hands-leather work-HD.png` |
| `films/the-departure.mp4` + poster | `Maison Tanneurs videos/Marrakech Train Window : Traveler.mp4` — Veo watermark cropped (6%/10%), h264 CRF22 |
| Product packshots | manifest-gated Supabase heroes; medina-saddlebag white-point corrected to 255 for seamless multiply float |

Featured slugs: atlas-weekender-cognac (also hero card), oasis-weekender-oxblood,
medina-saddlebag-tooled-cognac, expedition-rolltop-noir.

## QA trail (adversarial art-director agent, fresh context per round)

- Round 1: 6.5/10 — header ghosting over sky (1.2:1), medina plate edge,
  hero-card inner square, Veo watermark, EN links above grid.
- Fixes: top scrim, white-point correction, single-surface card, watermark
  crop, French links below grid, mobile wordmark sizing.
- Round 2: all five fixes PASS, 8/10.
- Round 3 (final): French display statements verified (accents render in
  Bodoni SC), scrim smooth, dusk pair graded warmer; 8.5/10 "sits credibly
  next to polene-paris.com". No regressions; console clean.

## Open decision for Ryan

Register is French display + English prose body (Polène-inverse). The QA agent
flags full-commit-one-language as the last refinement. Deliberate hybrid for
international customers — revisit at i18n time.
