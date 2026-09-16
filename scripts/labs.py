"""Regenerate the frontier-lab marks in public/assets/img/labs.

The source marks come from @lobehub/icons-static-png (MIT). Its `dark` set is white on
transparent, so we take the alpha as a silhouette and tint it to the site cream. Marks are
scaled by ink area rather than bounding box: a dense mark and an airy one then read at the
same weight in the orbit, which matching box sizes does not achieve.

    npm pack @lobehub/icons-static-png && tar xzf lobehub-icons-static-png-*.tgz
    python3 scripts/labs.py package/dark

The brand marks belong to their owners; only the recolouring is ours.
"""
import math
import sys
from pathlib import Path

from PIL import Image

TILE = 132                  # 3x the 44px display size
CREAM = (232, 231, 225)     # --ink
TARGET_MASS = 74            # sqrt of the ink area each mark should carry
LABS = ["openai", "anthropic", "deepmind", "mistral", "xai"]

src = Path(sys.argv[1] if len(sys.argv) > 1 else "package/dark")
out = Path(__file__).resolve().parent.parent / "public/assets/img/labs"
out.mkdir(parents=True, exist_ok=True)

for name in LABS:
    im = Image.open(src / f"{name}.png").convert("RGBA")
    im = im.crop(im.getchannel("A").getbbox())

    mask = im.getchannel("A").point(lambda v: 255 if v > 128 else 0)
    ink = sum(1 for v in mask.getdata() if v)
    scale = TARGET_MASS / math.sqrt(ink)
    w, h = round(im.width * scale), round(im.height * scale)
    fit = min(TILE / w, TILE / h, 1.0)          # never overflow the tile
    w, h = max(1, int(w * fit)), max(1, int(h * fit))
    im = im.resize((w, h), Image.LANCZOS)

    tinted = Image.new("RGBA", im.size, CREAM + (0,))
    tinted.putalpha(im.getchannel("A"))         # keeps the mark's own holes

    tile = Image.new("RGBA", (TILE, TILE), (0, 0, 0, 0))
    tile.alpha_composite(tinted, ((TILE - w) // 2, (TILE - h) // 2))
    tile.save(out / f"{name}.png", optimize=True)
    print(f"{name:10} {w:3}x{h:3}  ink={ink}")
