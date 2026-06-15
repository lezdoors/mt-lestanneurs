# HF On-Model Prompt Sheet — v2 with WARDROBE VARIETY (2026-06-13)

**Fix from v1:** every shot was ivory → the whole catalogue read as one white outfit. v2 gives each bag a distinct quiet-luxury outfit, chosen to CONTRAST the bag so it stands out. No two adjacent PDPs look alike.

## How to fire (your UI)
- Use the trained Soul **"MaisonModel"** as the model (character picker).
- **Turn prompt-enhance OFF** — with it on, Higgsfield rewrites the scene into a bag-only packshot and drops the model.
- Add the bag as a **reference / product element** (not the only image input).
- 4:5, generate 2–4, keep the best where the bag matches the real packshot.

## Wardrobe palette (all quiet-luxury, rich neutrals — never loud)
camel · black · charcoal grey · chocolate brown · olive/khaki · navy · oatmeal/taupe · stone grey · ivory (sparingly) · burgundy accent knit

---

## The 12 PDP on-model — each its own outfit + scene

| # | Bag (slug) | Outfit | Scene | Why it pops |
|---|---|---|---|---|
| 1 | medina-saddlebag-tooled-cognac | **Black** turtleneck + black tailored trousers | European stone street, walking | cognac bag glows on black |
| 2 | medina-crossbody-cognac | **Camel** coat over white tee + denim | stone steps, half-turned | tonal warmth, bag a shade deeper |
| 3 | medina-crossbody-envelope | **Charcoal** suit, sharp | shadowed stone archway | cool grey vs warm leather |
| 4 | medina-rucksack-drawstring | **Olive** field jacket + cream trousers | sunlit old-town corner | earthy, outdoorsy register |
| 5 | woven-leather-backpack | **Oatmeal** knit + tailored brown trousers | warm plaster wall, standing | tonal, texture-on-texture |
| 6 | expedition-rolltop-noir | **Stone-grey** overcoat + black knit | cool morning street | noir bag reads architectural |
| 7 | expedition-rolltop-cognac | **Navy** blazer + grey trousers | stone steps, shoulder-worn | navy + cognac = classic menswear |
| 8 | explorer-rolltop-cognac | **Chocolate** suede jacket + cream | golden corner, half-turn | brown-on-brown, monochrome luxe |
| 9 | atlas-field-briefcase | **Charcoal** three-piece, hand at side | seated on a wooden chair, plaster studio | work register, sharp |
| 10 | atlas-messenger-laptop | **Navy** knit + tailored grey, standing | plaster studio, soft light | professional, calm |
| 11 | classic-cognac-satchel | **Burgundy** fine knit + camel trousers | European street, walking | jewel-tone accent, still quiet |
| 12 | atlas-kilim-duffle | **Black** tailoring, travel-poised | restrained stone courtyard | lets the kilim panel carry the color |

**Base prompt (swap in the row's OUTFIT + SCENE):**
> Full-length editorial fashion photograph of the model wearing [OUTFIT], carrying / wearing the bag from the reference image, [SCENE]. Late-morning golden-neutral light, restrained pale-stone architecture, ornament-free. Mid-stride or poised, assured, looking just past the camera. The bag is rendered exactly as the reference — same hardware, stitching, leather tone. Photoreal luxury campaign photography, 50mm, bag and figure sharp, background soft. Refined French quiet-luxury register. No tilework, no signage, no other people, no lettering or typography, no watermark.

---

## New bags (the 8) — workflow
1. Clean cutouts ready in Drive `New bags 06:13/_ready-to-upload/` (18 JPGs).
2. Run the **Shots app** on the best frame per bag → 9 packshot angles (the gallery).
3. For their on-model shots, reuse the matrix above — assign each new bag an **unused** outfit so the whole site stays varied.

## Delivery
Drop outputs per bag/slug in a folder, tell me — I pixel-verify, crop, encode, append to the PDP gallery (hero/images[0] never touched), and wire new SKUs into Supabase/Airtable. Wrong-bag or off-register frames get skipped, not shipped.
