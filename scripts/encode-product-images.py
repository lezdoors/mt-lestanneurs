#!/usr/bin/env python3
"""
Encode Maison Tanneurs product images from the Drive source-of-truth
(`usable product pics/MT-XX-NNN__<slug>/`) into /public/tanneurs/products/
and emit lib/product-images.json (slug -> hero + gallery paths).

Strictly READ-ONLY on Drive. Never renames, moves, or writes there.
Heroes: the mandatory `Hero-*` file (prefers `-HD` variants when present).
Gallery: `<slug>-pdp/scale/macro-NN.*` ordered pdp -> scale -> macro -> other,
with HD-variant dedupe (HD wins over its non-HD twin).

Also prints the dimensional audit: LOW-RES (<1200px shortest side),
UPSCALE-CANDIDATE (<1600px), and per-folder mismatch flags.
"""
import json
import re
import sys
from pathlib import Path

from PIL import Image

DRIVE = Path.home() / "Library/CloudStorage/GoogleDrive-ryanaoufal@gmail.com/My Drive/Maison Tanneurs/usable product pics"
REPO = Path(__file__).resolve().parents[1]
OUT = REPO / "public/tanneurs/products"
MANIFEST = REPO / "lib/product-images.json"

MAX_W = 1600
QUALITY = 84
IMG_EXTS = {".png", ".jpg", ".jpeg", ".webp"}
MAX_GALLERY = 12

SKU_DIR_RE = re.compile(r"^MT-[A-Z]{2}-\d{3}__(.+)$")

# Folders without the MT-prefix that Ryan confirmed as canonical; folder name == slug.
EXTRA_SKU_DIRS = {"vintage-buckle-backpack-chocolate"}


def slug_for(folder: Path) -> str | None:
    m = SKU_DIR_RE.match(folder.name)
    if m:
        return m.group(1)
    if folder.name in EXTRA_SKU_DIRS:
        return folder.name
    return None


def is_hd(p: Path) -> bool:
    return "-hd" in p.stem.lower() or p.stem.lower().endswith(" hd")


def norm_stem(p: Path) -> str:
    # collapse HD twins onto one key so HD wins the dedupe
    s = p.stem.lower().strip()
    s = re.sub(r"[-_ ]hd$", "", s)
    s = re.sub(r"-hd-", "-", s)
    return s


def group_rank(name: str) -> int:
    n = name.lower()
    if "-pdp" in n:
        return 0
    if "-scale" in n:
        return 1
    if "-macro" in n:
        return 2
    if n.startswith("side") or n.startswith("model"):
        return 3
    return 4


def flatten_alpha(im: Image.Image) -> Image.Image:
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        bg = Image.new("RGB", im.size, (255, 255, 255))
        bg.paste(im, mask=im.split()[-1])
        return bg
    return im.convert("RGB")


def encode(src: Path, dst: Path) -> tuple[int, int]:
    dst.parent.mkdir(parents=True, exist_ok=True)
    if dst.exists() and dst.stat().st_mtime >= src.stat().st_mtime:
        with Image.open(dst) as im:
            return im.width, im.height
    with Image.open(src) as im:
        im = flatten_alpha(im)
        if im.width > MAX_W:
            ratio = MAX_W / im.width
            im = im.resize((MAX_W, int(im.height * ratio)), Image.LANCZOS)
        im.save(dst, "WEBP", quality=QUALITY, method=6)
        return im.width, im.height


def src_dims(p: Path) -> tuple[int, int]:
    with Image.open(p) as im:
        return im.width, im.height


def main() -> int:
    if not DRIVE.exists():
        print(f"FATAL: Drive folder not found: {DRIVE}", file=sys.stderr)
        return 1

    manifest: dict[str, dict] = {}
    flags: list[str] = []
    audit: list[str] = []

    folders = sorted(d for d in DRIVE.iterdir() if d.is_dir() and slug_for(d))
    print(f"Scanning {len(folders)} SKU folders in Drive (read-only)\n")

    for folder in folders:
        slug = slug_for(folder)
        files = [f for f in folder.iterdir() if f.is_file() and f.suffix.lower() in IMG_EXTS]
        heroes = [f for f in files if f.name.lower().startswith("hero")]

        if not heroes:
            flags.append(f"NO-HERO          {folder.name}")
            continue

        hd_heroes = [h for h in heroes if is_hd(h)]
        if len(heroes) > 1:
            pick_pool = hd_heroes or heroes
            hero = max(pick_pool, key=lambda p: p.stat().st_size)
            flags.append(f"MULTIPLE-HERO    {folder.name} -> using {hero.name}")
        else:
            hero = heroes[0]

        # dimensional audit on the SOURCE hero
        try:
            w, h = src_dims(hero)
            short = min(w, h)
            kb = hero.stat().st_size // 1024
            if short < 1200:
                audit.append(f"LOW-RES            {folder.name}/{hero.name}  {w}x{h}  {kb}KB")
            elif short < 1600:
                audit.append(f"UPSCALE-CANDIDATE  {folder.name}/{hero.name}  {w}x{h}  {kb}KB")
            elif kb < 150:
                audit.append(f"SUSPECT-COMPRESS   {folder.name}/{hero.name}  {w}x{h}  {kb}KB")
        except Exception as e:
            flags.append(f"UNREADABLE-HERO  {folder.name}/{hero.name}: {e}")
            continue

        # gallery: everything that's not a hero, HD-deduped, ordered
        gallery_src: dict[str, Path] = {}
        for f in files:
            if f in heroes:
                continue
            key = norm_stem(f)
            if key in gallery_src:
                if is_hd(f) and not is_hd(gallery_src[key]):
                    gallery_src[key] = f
            else:
                gallery_src[key] = f
        ordered = sorted(gallery_src.values(), key=lambda p: (group_rank(p.name), p.name.lower()))[:MAX_GALLERY]

        hero_dst = OUT / f"{slug}.webp"
        try:
            encode(hero, hero_dst)
        except Exception as e:
            flags.append(f"ENCODE-FAIL      {folder.name}/{hero.name}: {e}")
            continue

        gallery_paths: list[str] = []
        for i, g in enumerate(ordered, start=1):
            dst = OUT / slug / f"{i:02d}.webp"
            try:
                gw, gh = src_dims(g)
                if min(gw, gh) < 1200:
                    audit.append(f"GALLERY-LOW-RES    {folder.name}/{g.name}  {gw}x{gh}")
                encode(g, dst)
                gallery_paths.append(f"/tanneurs/products/{slug}/{i:02d}.webp")
            except Exception as e:
                flags.append(f"ENCODE-FAIL      {folder.name}/{g.name}: {e}")

        manifest[slug] = {
            "hero": f"/tanneurs/products/{slug}.webp",
            "gallery": gallery_paths,
        }
        print(f"  OK  {slug:44}  hero + {len(gallery_paths)} gallery")

    MANIFEST.write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n")
    print(f"\nManifest: {MANIFEST}  ({len(manifest)} slugs)")

    if flags:
        print("\n=== FLAGS (resolve with Ryan, never guess) ===")
        for f in flags:
            print(f"  {f}")
    if audit:
        print("\n=== DIMENSIONAL AUDIT — upscale candidates ===")
        for a in audit:
            print(f"  {a}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
