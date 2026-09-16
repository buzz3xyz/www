#!/usr/bin/env python3
"""Generate placeholder imagery for buzz3.xyz.

The Events timeline and the Members grid both reference real photography that
doesn't exist in this repo yet. Shipping a missing <img> would mean a 404 in
the console and a broken-image glyph on screen, so this script renders
on-brand placeholders at the exact dimensions the layout expects -- each one
stamped so it is obvious it is meant to be replaced.

Outputs
  events/event-1-ai-web3-summit.jpg      1600x1000  16:10 timeline card photo
  events/event-2-defi-ai-hackathon.jpg   1600x1000
  events/event-3-genesis-meetup.jpg      1600x1000
  team/charlie-li.jpg                     400x400   square, CSS crops to a circle
  team/sarah-liu.jpg                      400x400
  team/marcus-park.jpg                    400x400
  team/elena-chen.jpg                     400x400

Replacing any of these with a real photo of the same filename needs no code
change. Deleting a team/*.jpg makes that card fall back to the member's
initials automatically (see initMemberAvatars in buzz3.js).

Run:  python tools/generate-placeholders.py
"""
import os

from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONT_CANDIDATES = [
    os.path.join(ROOT, "tools", "SpaceGrotesk-var.ttf"),
    "/tmp/SpaceGrotesk-var.ttf",
]

BG = (10, 10, 26, 255)          # --bg-primary
GOLD = (245, 158, 11)           # --color-primary
GOLD_LIGHT = (252, 211, 77)     # --color-primary-light
AMBER = (217, 119, 6)           # --color-secondary
PURPLE = (124, 58, 237)         # --color-ambient
MUTED = (148, 163, 184)         # --color-muted
ON_ACCENT = (26, 16, 5)         # --color-on-accent

font_path = next((p for p in FONT_CANDIDATES if os.path.exists(p)), None)
if not font_path:
    raise SystemExit("SpaceGrotesk-var.ttf not found next to this script")


def font(size, weight=700):
    f = ImageFont.truetype(font_path, size)
    try:
        f.set_variation_by_axes([weight])
    except Exception:
        pass
    return f


def fit_font(text, max_size, max_width, weight=700, min_size=18):
    """Largest size at or below max_size whose rendered width fits max_width."""
    probe = ImageDraw.Draw(Image.new("L", (1, 1)))
    size = max_size
    while size > min_size:
        f = font(size, weight)
        if probe.textlength(text, font=f) <= max_width:
            return f
        size -= 2
    return font(min_size, weight)


def centered(draw, text, f, y, fill, width):
    """Horizontally centred on `width`, vertically centred on `y`.

    anchor='mm' centres the em box, which is far more predictable than
    hand-tuning a top-left y for every font size.
    """
    draw.text((width / 2, y), text, font=f, fill=fill, anchor="mm")


bee = Image.open(os.path.join(ROOT, "logo", "buzz3_bee_mark.png")).convert("RGBA")


def watermark(height, alpha):
    """The bee mark, scaled to `height`, faded to `alpha` (0-255)."""
    w = max(1, round(bee.width * height / bee.height))
    r = bee.resize((w, height), Image.LANCZOS)
    a = r.getchannel("A").point(lambda v: int(v * alpha / 255))
    r.putalpha(a)
    return r


# ============================================================== events ======
EVENTS = [
    ("event-1-ai-web3-summit.jpg", "AI x Web3 Summit 2026", "March 2026 \u00b7 San Francisco"),
    ("event-2-defi-ai-hackathon.jpg", "DeFi AI Hackathon", "November 2025 \u00b7 Virtual"),
    ("event-3-genesis-meetup.jpg", "Buzz3 Genesis Meetup", "October 2024 \u00b7 Tokyo"),
]

EW, EH = 1600, 1000
events_dir = os.path.join(ROOT, "events")
os.makedirs(events_dir, exist_ok=True)

for name, title, meta in EVENTS:
    im = Image.new("RGBA", (EW, EH), BG)

    # ambient glows -- same recipe as the OG card so the imagery feels related
    glow = Image.new("RGBA", (EW, EH), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse((EW - 640, -460, EW + 420, 400), fill=GOLD + (66,))
    gd.ellipse((-520, EH - 460, 460, EH + 420), fill=PURPLE + (80,))
    im.alpha_composite(glow.filter(ImageFilter.GaussianBlur(170)))

    grid = Image.new("RGBA", (EW, EH), (0, 0, 0, 0))
    gr = ImageDraw.Draw(grid)
    for x in range(0, EW, 50):
        gr.line([(x, 0), (x, EH)], fill=PURPLE + (16,), width=1)
    for y in range(0, EH, 50):
        gr.line([(0, y), (EW, y)], fill=PURPLE + (16,), width=1)
    im.alpha_composite(grid)

    wm = watermark(400, 24)
    im.alpha_composite(wm, ((EW - wm.width) // 2, 130))

    d = ImageDraw.Draw(im)
    title_f = fit_font(title, 82, EW - 320)
    centered(d, title, title_f, 660, GOLD_LIGHT + (255,), EW)

    d.line([((EW - 200) / 2, 748), ((EW + 200) / 2, 748)], fill=GOLD + (255,), width=4)

    meta_f = fit_font(meta, 34, EW - 400, weight=500)
    centered(d, meta, meta_f, 802, MUTED + (255,), EW)

    # honest stamp so it never reads as a real photograph
    tag_f = font(22, 500)
    tag = "PHOTO PLACEHOLDER \u2014 REPLACE WITH A REAL EVENT PHOTO"
    d.text((64, EH - 72), tag, font=tag_f, fill=MUTED + (150,))
    dim_f = font(22, 500)
    dim = f"{EW}\u00d7{EH}"
    d.text((EW - 64 - d.textlength(dim, font=dim_f), EH - 72), dim, font=dim_f, fill=MUTED + (110,))

    out = os.path.join(events_dir, name)
    im.convert("RGB").save(out, quality=88, optimize=True, subsampling=0)
    print("wrote", os.path.relpath(out, ROOT), f"{os.path.getsize(out) // 1024} KB")


# =============================================================== team =======
TEAM = [
    ("charlie-li.jpg", "CL"),
    ("sarah-liu.jpg", "SL"),
    ("marcus-park.jpg", "MP"),
    ("elena-chen.jpg", "EC"),
]

AW = AH = 400
team_dir = os.path.join(ROOT, "team")
os.makedirs(team_dir, exist_ok=True)

for name, initials in TEAM:
    # diagonal ramp matching .member-avatar's CSS gradient (primary-light ->
    # secondary), so the placeholder and the CSS fallback look identical
    im = Image.new("RGBA", (AW, AH))
    px = im.load()
    for y in range(AH):
        for x in range(AW):
            t = (x + y) / (AW + AH - 2)
            px[x, y] = tuple(
                round(GOLD_LIGHT[i] + (AMBER[i] - GOLD_LIGHT[i]) * t) for i in range(3)
            ) + (255,)

    # soft highlight top-left so the disc doesn't read as flat colour
    hl = Image.new("RGBA", (AW, AH), (0, 0, 0, 0))
    ImageDraw.Draw(hl).ellipse((-90, -120, 250, 200), fill=(255, 255, 255, 70))
    im.alpha_composite(hl.filter(ImageFilter.GaussianBlur(60)))

    # No bee watermark here: CSS crops this square to a 90px circle, so anything
    # outside the inscribed circle is cut, and at 90px a watermark is invisible
    # noise anyway. Kept clean so it matches the CSS initials fallback exactly.
    d = ImageDraw.Draw(im)
    # 1.8rem at the rendered 90px, scaled up to this 400px canvas
    ini_f = font(round(28.8 * AW / 90), 700)
    d.text((AW / 2, AH / 2), initials, font=ini_f, fill=ON_ACCENT + (235,), anchor="mm")

    out = os.path.join(team_dir, name)
    im.convert("RGB").save(out, quality=90, optimize=True)
    print("wrote", os.path.relpath(out, ROOT), f"{os.path.getsize(out) // 1024} KB")
