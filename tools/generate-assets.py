#!/usr/bin/env python3
"""Generate brand assets for buzz3.xyz from logo/buzz3_Anime.png.

The source art is a *black* wordmark on transparency. The site defaults to the
dark theme, where a black wordmark is unreadable, so we also emit a light
variant (glyphs recoloured, bee + orange "3" left untouched).

Outputs
  logo/buzz3_wordmark_{2x,3x}.png        dark glyphs  -> light theme
  logo/buzz3_wordmark_light_{2x,3x}.png  light glyphs -> dark theme
  logo/buzz3_bee_mark.png                bee only (QR card, misc)
  favicon/favicon-*.png                  tab icons
  favicon/apple-touch-icon.png           iOS home screen
  og-image.png                           1200x630 social share card

Run:  python tools/generate-assets.py
"""
import os
from collections import deque

from PIL import Image, ImageChops, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "logo", "buzz3_Anime.png")
FONT_CANDIDATES = [
    os.path.join(ROOT, "tools", "SpaceGrotesk-var.ttf"),
    "/tmp/SpaceGrotesk-var.ttf",
]

LIGHT_GLYPH = (241, 245, 249)
GOLD = (245, 158, 11, 255)
GOLD_LIGHT = (252, 211, 77, 255)
WHITE = (241, 245, 249, 255)
MUTED = (148, 163, 184, 255)

src = Image.open(SRC).convert("RGBA")
SW, SH = src.size
print("source:", src.size)

SCALE = 4


def components(mask, min_area):
    h, w = len(mask), len(mask[0])
    seen = [[False] * w for _ in range(h)]
    out = []
    for y0 in range(h):
        for x0 in range(w):
            if not mask[y0][x0] or seen[y0][x0]:
                continue
            q = deque([(x0, y0)])
            seen[y0][x0] = True
            pts = []
            while q:
                x, y = q.popleft()
                pts.append((x, y))
                for dy in (-1, 0, 1):
                    for dx in (-1, 0, 1):
                        nx, ny = x + dx, y + dy
                        if 0 <= nx < w and 0 <= ny < h and mask[ny][nx] and not seen[ny][nx]:
                            seen[ny][nx] = True
                            q.append((nx, ny))
            if len(pts) >= min_area:
                xs = [p[0] for p in pts]
                ys = [p[1] for p in pts]
                out.append({"box": (min(xs), min(ys), max(xs) + 1, max(ys) + 1),
                            "area": len(pts), "pts": pts})
    return out


small = src.resize((SW // SCALE, SH // SCALE), Image.LANCZOS)
alpha = small.getchannel("A")
w, h = small.size
ap = alpha.load()
mask = [[ap[x, y] > 40 for x in range(w)] for y in range(h)]
comps = components(mask, min_area=(w * h) // 800)
print("components:", len(comps))

# bee = upper blob, horizontally centred-right (letters are lower and bigger,
# signal arcs sit further right)
bee_c = max((c for c in comps
             if c["box"][1] < h * 0.15 and 0.38 * w < c["box"][0] < 0.78 * w),
            key=lambda c: c["area"])
# wordmark glyphs = everything that starts below the bee
glyph_cs = [c for c in comps if c["box"][1] > h * 0.15 and c["area"] > 800]
print("bee box:", bee_c["box"], " glyph blobs:", len(glyph_cs))


def mask_from(comps_, feather=False):
    m = Image.new("L", (w, h), 0)
    mp = m.load()
    for c in comps_:
        for (x, y) in c["pts"]:
            mp[x, y] = 255
    return m.resize((SW, SH), Image.LANCZOS)


def cut(img, comp):
    """crop to a component and drop neighbouring glyph pixels"""
    x0, y0, x1, y1 = [v * SCALE for v in comp["box"]]
    out = img.crop((x0, y0, x1, y1))
    m = mask_from([comp]).crop((x0, y0, x1, y1))
    out.putalpha(Image.composite(out.getchannel("A"), Image.new("L", out.size, 0), m))
    return out.crop(out.getbbox())


bee = cut(src, bee_c)
print("bee mark:", bee.size)

# ---- wordmark: dark (original) + light (recoloured glyphs) -----------------
wordmark = src.crop(src.getbbox())
glyph_mask = mask_from(glyph_cs)

# Recolour only the *black* glyph pixels: the orange "3" and the bee keep their
# colours, the black "buzz" letters become light so they read on dark themes.
rgb = src.convert("RGB")
brightest = ImageChops.lighter(
    ImageChops.lighter(rgb.getchannel("R"), rgb.getchannel("G")),
    rgb.getchannel("B"))
is_black = brightest.point(lambda v: 255 if v < 90 else 0)
recolour_mask = ImageChops.multiply(glyph_mask, is_black)

light_src = Image.composite(Image.new("RGBA", src.size, LIGHT_GLYPH + (255,)), src, recolour_mask)
light_src.putalpha(src.getchannel("A"))
light_wm = light_src.crop(light_src.getbbox())

for hh in (80, 120):
    suffix = "2x" if hh == 80 else "3x"
    for img, name in ((wordmark, f"buzz3_wordmark_{suffix}.png"),
                      (light_wm, f"buzz3_wordmark_light_{suffix}.png")):
        img.resize((round(img.width * hh / img.height), hh), Image.LANCZOS).save(
            os.path.join(ROOT, "logo", name), optimize=True)
        print("wrote", name, (round(img.width * hh / img.height), hh))

bee.resize((240, round(240 * bee.height / bee.width)), Image.LANCZOS).save(
    os.path.join(ROOT, "logo", "buzz3_bee_mark.png"), optimize=True)


def fit_square(img, size, pad_ratio=0.06):
    pad = int(size * pad_ratio)
    inner = size - 2 * pad
    s = min(inner / img.width, inner / img.height)
    ww, hh = max(1, round(img.width * s)), max(1, round(img.height * s))
    r = img.resize((ww, hh), Image.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    canvas.alpha_composite(r, ((size - ww) // 2, (size - hh) // 2))
    return canvas


# ---- favicons --------------------------------------------------------------
fav_dir = os.path.join(ROOT, "favicon")
os.makedirs(fav_dir, exist_ok=True)
for s in (16, 32, 48, 96, 192):
    fit_square(bee, s, pad_ratio=0.02).save(os.path.join(fav_dir, f"favicon-{s}.png"), optimize=True)

apple = Image.new("RGBA", (180, 180), (10, 10, 26, 255))
ImageDraw.Draw(apple).ellipse((4, 4, 176, 176), fill=(19, 19, 44, 255))
apple.alpha_composite(fit_square(bee, 180, 0.14))
apple.convert("RGB").save(os.path.join(fav_dir, "apple-touch-icon.png"), optimize=True)
print("favicons written")

# ---- OG image 1200x630 -----------------------------------------------------
font_path = next((p for p in FONT_CANDIDATES if os.path.exists(p)), None)
OW, OH = 1200, 630
og = Image.new("RGBA", (OW, OH), (6, 6, 18, 255))

glow = Image.new("RGBA", (OW, OH), (0, 0, 0, 0))
gd = ImageDraw.Draw(glow)
gd.ellipse((OW - 520, -380, OW + 380, 340), fill=(245, 158, 11, 62))
gd.ellipse((-420, OH - 360, 400, OH + 360), fill=(124, 58, 237, 74))
og.alpha_composite(glow.filter(ImageFilter.GaussianBlur(140)))

grid = Image.new("RGBA", (OW, OH), (0, 0, 0, 0))
gr = ImageDraw.Draw(grid)
for x in range(0, OW, 40):
    gr.line([(x, 0), (x, OH)], fill=(124, 58, 237, 18), width=1)
for y in range(0, OH, 40):
    gr.line([(0, y), (OW, y)], fill=(124, 58, 237, 18), width=1)
og.alpha_composite(grid)

d = ImageDraw.Draw(og)


def f(size, weight=700):
    ft = ImageFont.truetype(font_path, size)
    try:
        ft.set_variation_by_axes([weight])
    except Exception:
        pass
    return ft


mark_h = 200
mark = light_wm.resize((round(light_wm.width * mark_h / light_wm.height), mark_h), Image.LANCZOS)
og.alpha_composite(mark, ((OW - mark.width) // 2, 104))

tag_font = f(46, 700)
tag = "AI \u00d7 Web3 Innovation Hub"
d.text(((OW - d.textlength(tag, font=tag_font)) / 2, 372), tag, font=tag_font, fill=GOLD_LIGHT)

d.line([((OW - 190) / 2, 452), ((OW + 190) / 2, 452)], fill=GOLD, width=4)

sub_font = f(30, 500)
sub = "Building the decentralized future"
d.text(((OW - d.textlength(sub, font=sub_font)) / 2, 480), sub, font=sub_font, fill=WHITE)

dom_font = f(25, 600)
dom = "www.buzz3.xyz"
d.text(((OW - d.textlength(dom, font=dom_font)) / 2, OH - 66), dom, font=dom_font, fill=MUTED)

og.convert("RGB").save(os.path.join(ROOT, "og-image.png"), optimize=True)
print("og-image.png", og.size, os.path.getsize(os.path.join(ROOT, "og-image.png")) // 1024, "KB")
