# HF Prompt Sheet — Hero + 12 PDP on-model (2026-06-13)

**Fire all of these in the Higgsfield UI with the unlimited toggle ON (zero credits).**

House rules baked in:
- **Reference carries the bag.** Import the packshot URL as the reference image; the prompt NEVER re-describes the bag's shape/colour — only the scene, model, light, framing. This keeps the exact catalogue product.
- **Casting: European/French.** Tailored, minimal, quiet-luxury styling (cream / camel / black / ivory). This is the whole point of the brief — a French maison, not an ambiguous-origin brand.
- **No** brand names in the prompt, **no** text/lettering in frame, **no** souk stalls, camels, Sahara dunes, tennis courts, or heavy tilework. Marrakech only ever as restrained cinema (warm plaster, stone), never as tourism.
- Generate 2–4 per slot, keep the best.

Reference URL pattern: `https://www.maisontanneurs.com/tanneurs/products/<slug>.webp`

---

## ★ HERO — replaces the current frame (priority)

**Reference:** `https://www.maisontanneurs.com/tanneurs/products/atlas-weekender-cognac.webp`
**Model:** Nano Banana Pro / FLUX.2 Pro · **Generate BOTH 16:9 and 9:16** (desktop + mobile hero).

> A tall French woman in her early thirties, dark blonde hair loosely tied back, wearing an impeccably tailored ivory wool coat over a fine cream knit and straight cream trousers, walks with quiet assurance along a sunlit street of warm pale stone, carrying the bag from the reference image in one hand at her side. Soft late-morning Mediterranean light rakes warm across honed stone façades and a tall plain doorway behind her; the architecture is elegant and restrained — clean stone, no ornament, no tilework, no signage. She is mid-stride, composed and editorial, looking just past the camera. Generous clean negative space above and to one side for a single line of type. Photoreal luxury campaign photography, 50mm, shallow depth of field with the bag and her figure sharp, the street softly falling away. Refined, European, expensive. No other people, no lettering or typography anywhere, no watermark.

*(For 9:16, keep her full figure and the bag in frame, head not cropped.)*

---

## PDP ON-MODEL — the 12 still missing (4:5 each)

Two coherent looks so the catalogue hangs together as one campaign — a **STUDIO** setup (warm cream-plaster, a simple wooden chair, model in a black tank + cream wide-leg linen — matches the briefcase/tote shots already live) and a **STREET** setup (warm pale-stone European old-town, model in tailored cream/camel, walking) — assigned per bag's character.

### Work / structured bags — STUDIO seated
Same studio every time so they read as a set:
> A French woman seated on a simple wooden chair against a warm cream lime-plaster wall, soft directional daylight from the left, wearing a black sleeveless top and ivory wide-leg linen trousers, presenting the bag from the reference image held on her lap / beside her with both hands relaxed. Calm, direct, editorial. Pale concrete floor, nothing else in frame. Photoreal luxury campaign photography, 85mm, the bag and her hands tack-sharp, soft falloff. European, quiet, expensive. No lettering or typography, no watermark.

| Slot | Reference slug |
|---|---|
| atlas-field-briefcase | `atlas-field-briefcase` |
| atlas-messenger-laptop | `atlas-messenger-laptop` |
| classic-cognac-satchel | `classic-cognac-satchel` |
| medina-crossbody-envelope | `medina-crossbody-envelope` |

### Crossbody / small bags — STREET worn
> A French woman walking along a sunlit warm-stone European old-town street, wearing a tailored cream blazer over an ivory shirt and straight trousers, the bag from the reference image worn across her body / on her shoulder, hand resting lightly on it. Late-morning golden-neutral light on honed pale stone, a plain stone doorway softly behind. Mid-stride, assured, looking past camera. 50mm, shallow depth of field, bag sharp. European, refined. No tilework, no signage, no other people, no lettering, no watermark.

| Slot | Reference slug |
|---|---|
| medina-crossbody-cognac | `medina-crossbody-cognac` |
| medina-saddlebag-tooled-cognac | `medina-saddlebag-tooled-cognac` |

### Backpacks / rolltops / rucksack — STREET, worn on shoulder
> A French woman standing on shallow warm-stone steps of an elegant European street, half-turned, wearing a camel overcoat over cream knit and trousers, the bag from the reference image worn on one shoulder / held by the top handle. Soft golden-neutral morning light, restrained pale-stone architecture behind, clean and ornament-free. Poised, editorial, looking off-frame. 50mm, bag and figure sharp, background soft. European, quiet-luxury. No tilework, no signage, no lettering, no watermark.

| Slot | Reference slug |
|---|---|
| expedition-rolltop-cognac | `expedition-rolltop-cognac` |
| expedition-rolltop-noir | `expedition-rolltop-noir` |
| explorer-rolltop-cognac | `explorer-rolltop-cognac` |
| woven-leather-backpack | `woven-leather-backpack` |
| medina-rucksack-drawstring | `medina-rucksack-drawstring` |

### Travel duffle — STUDIO or restrained stone courtyard
| Slot | Reference slug | Note |
|---|---|---|
| atlas-kilim-duffle | `atlas-kilim-duffle` | Use the STUDIO seated prompt (kilim panel is the only Moroccan note — let the bag carry it, keep the set neutral so it doesn't tip into souk register). |

---

## Delivery
Drop the keepers in a folder (e.g. Drive `_site-ready-2026-06-13/` or `usable product pics/<slug>/`). Tell me the folder — I pixel-verify each against its hero, crop 4:5, encode, and append to the PDP gallery END (never touching images[0]). Same discipline as tonight: a wrong-bag frame gets skipped, not shipped.

## New bags (incoming)
When you have clean packshots for the new SKUs: drop them named `<slug>.webp` (or `Hero-<Name>.png`) and I'll (1) add the packshot as the PDP hero, (2) wire the SKU into Supabase/Airtable, (3) commission its on-model frame from this same sheet.
