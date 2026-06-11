# Launch curation — collection grid keep/hide (2026-06-10)

Contact-sheet review of all 27 manifest-gated published heroes (art-direction
agent, tiles at /tmp/mt-curate, mapping preserved below). Enforced via
`CURATED_ORDER` in `lib/products.ts` — hidden SKUs stay published in Supabase
but do not render on /shop, related modules, or PDPs (404).

## Visible (19, merchandising order)

atlas-weekender-cognac*, oasis-weekender-oxblood*, atlas-kilim-duffle,
medina-rucksack-drawstring, atlas-field-briefcase, atlas-messenger-laptop,
atlas-briefcase-vintage, classic-cognac-satchel, expedition-rolltop-noir*,
expedition-rolltop-cognac, explorer-rolltop-cognac, woven-leather-backpack,
medina-crossbody-cognac*, medina-saddlebag-tooled-cognac,
medina-crossbody-tooled-walnut, medina-crossbody-envelope,
marrakech-tote-cognac, medina-market-tote-cognac, medina-zigzag-tote-chocolate

(* = launch priority)

## Hidden (8) — reasons

| Slug | Reason |
|---|---|
| medina-duffle | Hero is PIXEL-IDENTICAL to atlas-weekender-cognac — duplicate identity / wrong-file upload. Needs its own Drive hero. |
| vintage-buckle-backpack | Shot on a gray studio plate (~184-203 lum) — prints a visible rectangle under multiply float. Needs white-plate reshoot/normalize. |
| vintage-satchel-light-brown | Near-1:1 Birkin silhouette clone (credibility/legal risk) + AI-read artifacts (floating strap tips, implausible zipper). |
| heritage-rucksack | Gray plate (245) with white letterbox bars → visible plate edges; oversaturated catalog register. |
| medina-cargo-rucksack-cognac | Dramatic side-lighting + HDR bloom, register mismatch with flat packshots; reads AI-upscaled. |
| atlas-kilim-rucksack | Blotchy red-purple mottling reads water-damaged; souk register. |
| cognac-brogue-backpack | Gaping unstyled zip showing black void; heavy scuffing reads damaged. |
| medina-crossbody-clasp-teal | Crossbody with no strap in frame (incomplete silhouette); lone cold-color outlier. |

## Re-admission path

Fix the Drive hero (white plate, full silhouette, house register) →
re-encode via manifest pipeline → add slug back to CURATED_ORDER.

Naming review flagged: expedition-rolltop-cognac vs explorer-rolltop-cognac
are DISTINCT bags (X-strap vs single-strap) with near-twin names.
