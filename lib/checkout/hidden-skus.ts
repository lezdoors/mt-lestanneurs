// SKUs hidden from checkout validation + the product feed. Mirror of the
// Supabase launch gating (hidden rows should also be status='reserved' /
// featured=false in the DB). Belt-and-suspenders guard against sync drift.

export const HIDDEN_SKUS: ReadonlySet<string> = new Set([
  "test-e2e",
  "medina-duffle",
  "medina-cargo-rucksack-cognac",
  "medina-market-tote-cognac",
  "medina-zigzag-tote-chocolate",
]);

export const HIDDEN_SKUS_ARRAY: readonly string[] = Array.from(HIDDEN_SKUS);
