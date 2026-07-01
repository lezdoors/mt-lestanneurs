// THE single launch-gating list. Imported by the storefront catalogue
// (lib/supabase.ts), checkout validation (app/api/checkout/session) and
// the Meta product feed (app/feed/products.xml). A SKU on this list is
// invisible AND unsellable everywhere; a SKU off it is fully live.
//
// medina-duffle        — pixel-dupe of atlas-weekender-cognac
// medina-cargo-rucksack-cognac — register mismatch, pending re-shoot
// vintage-satchel-light-brown — photo set depicts a different bag than the
//   sellable product (Birkin-silhouette lookalike); re-gen from the real
//   satchel before relisting (returns + lookalike risk)

export const HIDDEN_SKUS: ReadonlySet<string> = new Set([
  "test-e2e",
  "medina-duffle",
  "medina-cargo-rucksack-cognac",
  "vintage-satchel-light-brown",
]);

export const HIDDEN_SKUS_ARRAY: readonly string[] = Array.from(HIDDEN_SKUS);
