# HF Shot List — open site slots (2026-06-11, v2 full prompts)

House rules baked into every prompt: the attached reference image carries the
product (prompts never re-describe the bag); no brand names in prompt bodies;
no typography/lettering in frame; video prompts specify large visible motion;
all action kept away from frame edges.

---

## P1-1. Trio left tile at 4K — "The Weekender at last light" (image)

**Slot:** homepage L'Heure du Départ band, left tile (replaces my 1k interim).
**Reference to attach:** `public/tanneurs/products/atlas-weekender-cognac.webp`
(or its Drive `Hero-*` original).
**Model:** Nano Banana Pro or FLUX.2 Pro, unlimited toggle ON. **Aspect 4:5.**

> Wide editorial still on the smooth crest of a windswept sand dune at the
> last minutes of golden hour. The bag from the reference image stands alone
> and upright at the lower-right third of the frame, facing slightly left.
> Low warm sunlight rakes in from the left, skimming the sand ripples and
> casting one long soft shadow to the right. Behind it, empty dunes roll away
> to a clean horizon under a deep amber sky with no clouds. The leather glows
> warm in the side light; sand grains catch tiny specular highlights. Vast
> negative space above and left of the bag, museum-calm composition, nothing
> else in frame — no people, no footprints, no props, no birds, no lettering
> or typography anywhere, no watermark. Photoreal cinematic campaign
> photography, razor sharp on the bag, gentle atmospheric haze at the horizon.

---

## P1-2. Saddlebag orbital — still, then loop (image → video)

**Slot:** saddlebag-family PDP module (replaces the sparkle-ruined Meta clip —
that bag matched this SKU exactly).
**Reference to attach:** `public/tanneurs/products/medina-saddlebag-tooled-cognac.webp`.
**Model (still):** Nano Banana Pro, 4:5.

> Quiet luxury product still: the bag from the reference image resting on a
> low travertine plinth against a deep warm-brown shadowed wall, lit by a
> single pool of warm directional light from the upper left, like late sun
> through a high window. The tooled leather surface catches the raking light
> so the pattern reads in relief; the rest of the room falls into soft
> darkness. Shallow depth of field, the bag pin-sharp, plinth texture soft.
> Generous dark negative space around the subject, nothing else in frame, no
> people, no lettering or typography anywhere, no watermark. Photoreal
> editorial photography for a luxury leather house.

**Video (from the still):** Kling 3.0, start frame AND end frame = the same
generated still (clean loop). 8s.

> The camera orbits slowly and steadily a quarter turn around the bag at
> constant height, the pool of warm light staying fixed so the raking
> highlight travels across the tooled leather as the angle changes, shadows
> wheeling gently across the plinth, background staying dark and still. The
> motion is smooth, continuous and clearly visible from the first frame to
> the last, returning to the exact starting composition. No people, no hands,
> no text or lettering appearing, no watermark.

---

## P1-3. Craft hands — still, then stitch motion (image → video)

**Slot:** /heritage or /atelier proof module (replaces sparkle-ruined
"Craft proof — hands, thread, leather").
**Reference to attach:** none needed (no product identity) — or a cognac
panel crop for leather color match.
**Model (still):** Nano Banana Pro or Seedream, 16:9.

> Macro editorial photograph inside a warm artisan workshop: two weathered
> hands of a craftsman mid-saddle-stitch on a panel of rich cognac full-grain
> leather clamped in a wooden stitching pony, a taut natural waxed linen
> thread crossing between two needles, one needle in each hand. Warm window
> light from the left, dust motes in the beam, the workbench behind melting
> into soft amber bokeh. Skin texture, thread fibers and leather grain all
> razor sharp; everything beyond the hands soft. Honest workwear cuffs, no
> faces, no lettering or typography anywhere, no watermark. Photoreal
> documentary craft photography, dignified and quiet.

**Video (from the still):** Seedance (identity preservation) or Kling 3.0
with start+end = same frame. 8s.

> The hands pull the two needles apart in one full, confident stitch motion —
> arms drawing wide, the waxed thread sliding through the leather and
> snapping taut — then begin the next stitch, needles crossing and entering
> the new hole. The motion is large, deliberate and continuous through the
> whole clip, the rhythm of real saddle stitching. Dust motes drift through
> the window beam, the light stays constant. No faces, no text or lettering
> appearing, no watermark.

---

## P1-4. Hero film candidate — "The first departure" (video)

**Slot:** homepage hero — only ships if it beats the current shoppable still.
**Start frame to upload:** current hero still
`public/tanneurs/editorial/hero-shop-16x9.webp` (the riad courtyard with the
model carrying the weekender).
**Model:** Kling 3.0 (start frame + end frame: reuse the start frame as end
frame for a loopable hold, or a second frame of her two steps closer).
**16:9, 8–10s.** Keep her path center/right — the floating product card owns
the lower left.

> From this exact starting frame, the woman walks forward through the sunlit
> riad courtyard toward the camera at an unhurried, assured pace, the bag
> swinging gently at her side, her robe and scarf lifting and moving visibly
> in a warm breeze. Sunlight flares softly through the arch behind her and
> moves across the zellige floor as she advances. The camera holds perfectly
> still at eye level. Her path stays in the center and right of frame, the
> lower-left corner of the frame staying clear. The motion of fabric, hair
> and stride is large and clearly visible for the entire clip. No other
> people, no text or lettering appearing, no watermark.

---

## P2. Five family frames — image-backed category navigation (images)

**Slot:** /shop?c= category headers + future homepage family tiles. Shot as a
SET: identical location, light and composition language so they hang together.
**Model:** Nano Banana Pro, **4:5 each**, unlimited toggle ON.
**Attach one reference per generation:**

| Family | Reference packshot |
|---|---|
| Weekenders | `atlas-weekender-cognac.webp` |
| Briefcases | the briefcase family hero |
| Backpacks | `expedition-rolltop-noir.webp` |
| Crossbodies | `medina-saddlebag-tooled-cognac.webp` |
| Totes | `marrakech-tote-cognac.webp` |

**Same prompt every time (only the reference changes):**

> Quiet editorial still life in a bright Moroccan stone interior: the bag
> from the reference image placed on a wide ledge of pale honed stone
> beneath a tall arched window, slightly right of center, facing the light.
> One beam of warm afternoon sun falls through the arch and across the bag,
> throwing a soft elongated shadow along the ledge; the bare lime-plaster
> wall behind holds gentle gradations of warm white. Minimal and
> architectural, generous negative space, nothing else on the ledge, no
> people, no plants, no props, no lettering or typography anywhere, no
> watermark. Photoreal luxury campaign photography, razor sharp on the
> leather, soft natural falloff elsewhere.

---

## P3 — upscales only (no generation)
1. `MT assets /Under the Hero/medina-street--rooftop-bag--149-HD.png` → 4K
   (contact band / closing alternate — the Koutoubia sunset frame).
2. `MT assets /Under the Hero/interior--model-carry--160-HD.png` → 4K
   (boutique/contact side image).

## Delivery
Drop outputs in `MT assets /_site-ready-*` (or tell me the folder). I encode
to repo conventions — webp desktop + `-m` mobile pairs, h264 crf21-23 +
poster jpg — and place same-day.
