# Exploded-Craft Prompts — "From hide to whole" (for Ryan to fire in HF UI)

Concept approved 2026-06-10: the bag as its real components (cut panels,
straps, waxed thread, brass buckles) assembling into the finished piece.
Feeds the NEXT slice's Savoir-Faire / PDP anatomy module.

House rules applied: the attached reference image carries the product —
prompts never re-describe the bag; no brand names in prompt bodies; no
typography/lettering in frame; video prompts specify visible motion.

---

## A. Still — exploded flat-lay plate (image)

**Reference image to attach:** the product hero webp of the chosen bag
(start with `atlas-weekender-cognac` from
`public/tanneurs/products/atlas-weekender-cognac.webp`, or its Drive
`Hero-*` original for max resolution).

**Model:** Nano Banana Pro or FLUX.2 Pro (unlimited toggle ON).

**Prompt:**

> Overhead flat-lay on a pale warm-cream seamless studio surface, soft
> diffused daylight from the upper left, gentle natural shadows. The bag
> from the reference image sits finished at the right third of the frame.
> Laid out in precise, respectful order across the left two thirds: its
> own unassembled components — large cut leather panels in the same hide,
> two unattached shoulder straps, a coil of waxed natural linen thread,
> two saddler's needles, loose solid-brass buckles and D-rings, a wooden
> burnishing tool, and an awl. Every component matches the leather of the
> reference exactly. Museum-plate composition, generous negative space,
> nothing overlapping, no hands, no workbench clutter, no labels, no
> lettering or typography anywhere, photoreal editorial product
> photography, razor sharp.

**Variant (PDP anatomy, single-column):** same prompt but "the components
arranged in a single vertical column beside the finished bag, portrait
composition 4:5."

## B. Film — assembly clip (video)

**Start frame:** the generated flat-lay from A (upload as start image).
**Model:** Kling 3.0 if using start+end frames (end frame = finished-bag
hero on the same surface); Seedance 2.0 if single start frame (best
identity preservation, accept loop seam).

**Prompt:**

> Locked-off overhead camera, no camera movement. The cut leather panels,
> straps, brass buckles and coil of waxed linen thread slide smoothly and
> deliberately across the cream surface toward the center, aligning and
> joining in sequence — panels meeting edge to edge, straps settling into
> place, buckles arriving last — assembling into the finished bag from
> the reference. Motion is large, visible and continuous through the
> whole clip, like a choreographed tabletop stop-motion, ending composed
> and still on the completed bag. Soft diffused daylight, gentle shadows
> that move with the pieces, photoreal, no hands, no text, no lettering,
> no logos appearing.

**QA before use:** contact-sheet the frames — reject on morphing panels,
melted hardware, invented embossing/lettering, or watermark; crop Veo
watermark if present (bottom-right, ~6%/10% crop recipe in repo history).

## C. PRIORITY — Hero regeneration (shoppable hero)

The current riad-courtyard hero is on-brief (bright, architectural) but the
carried bag matches NO catalogue SKU (closest: marrakech-tote at ~50%), so
the floating "shop the look" card is disabled. Regenerate the hero with a
real product as reference and the card returns, naming the true bag.

**Reference image to attach:** `Hero-*` of the chosen SKU from Drive
`usable product pics/` — recommend `MT-BAG-013 marrakech-tote-cognac`
(structured cognac tote, closest to the current frame's energy) or
`MT-BAG-006 atlas-weekender-cognac` (the flagship duffle).

**Model:** Nano Banana Pro / FLUX.2 Pro, unlimited toggle ON. Generate
both 16:9 (5120×2880) and 9:16 (2880×5120) takes of the same scene.

**Prompt (16:9):**

> Wide architectural editorial campaign frame in a sunlit white
> carved-stucco riad courtyard, deep blue sky above, olive trees in
> terracotta pots, sharp morning light and crisp shadows. A woman in a
> flowing cream linen dress walks through the courtyard carrying the bag
> from the reference image in her hand at her side — the bag rendered
> exactly as in the reference, clearly visible, catching the light.
> Atmosphere primary, fashion-editorial energy, bright and joyful, no
> other people, no text, no lettering, no logos anywhere in frame,
> photoreal, razor sharp.

**Prompt (9:16):** same, but "vertical full-length composition, the woman
and bag in the lower two thirds, carved archway and sky filling the top."

**QA before shipping:** zoom the bag — silhouette, handles, hardware must
match the reference SKU exactly; reject on morphing or invented details.

## D. Where these land (next slice)

- Savoir-Faire: "L'Anatomie" module — flat-lay plate (A) with micro-labels
  set in live text (never baked into the image).
- PDP: optional anatomy plate in the gallery (position 2+, never ahead of
  `Hero-*`).
- Film (B): Savoir-Faire support or campaign clip — NOT the homepage hero,
  NOT the loader.
