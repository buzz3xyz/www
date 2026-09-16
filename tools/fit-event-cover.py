#!/usr/bin/env python3
"""Fit an event poster into the 16:10 frame the timeline cards use.

Event posters are usually square or portrait. Dropping one straight into a 16:10
card and letting `object-fit: cover` do the work slices the title off the top and
the artwork off the bottom — on a square poster that loses ~37% of the height,
which is more than enough to behead the design.

This script composites instead: the poster is scaled to the full frame height,
and the leftover width is filled with a heavily blurred, darkened copy of the
poster itself. That is the same trick video players use for mismatched aspect
ratios, and it reads as a deliberate frame rather than as letterboxing.

If the source is already within 8% of the target ratio it is simply centre-cropped,
because at that point the crop is lossless-looking and the blur band would only
add noise.

Usage
  python tools/fit-event-cover.py <source> <output.jpg> [--width 1600] [--height 1000]

Example
  python tools/fit-event-cover.py ~/Downloads/poster.png events/event-4-xxx.jpg
"""
import argparse
import os

from PIL import Image, ImageEnhance, ImageFilter


def cover(img, w, h):
    """Scale to cover, then centre-crop to exactly w x h."""
    s = max(w / img.width, h / img.height)
    r = img.resize((max(1, round(img.width * s)), max(1, round(img.height * s))), Image.LANCZOS)
    left = (r.width - w) // 2
    top = (r.height - h) // 2
    return r.crop((left, top, left + w, top + h))


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("source")
    ap.add_argument("output")
    ap.add_argument("--width", type=int, default=1600)
    ap.add_argument("--height", type=int, default=1000)
    ap.add_argument("--blur", type=float, default=90.0,
                    help="gaussian radius for the filler band (default 90)")
    ap.add_argument("--dim", type=float, default=0.5,
                    help="brightness multiplier for the filler band (default 0.5)")
    ap.add_argument("--quality", type=int, default=90)
    args = ap.parse_args()

    W, H = args.width, args.height
    src = Image.open(args.source).convert("RGB")
    ratio, target = src.width / src.height, W / H
    print(f"source  {src.width}x{src.height}  ratio {ratio:.3f}  (target {target:.3f})")

    if abs(ratio - target) / target <= 0.08:
        out = cover(src, W, H)
        print("within 8% of target -> plain centre crop")
    else:
        # filler: the poster blown up to cover, blurred and dimmed
        bg = cover(src, W, H).filter(ImageFilter.GaussianBlur(args.blur))
        bg = ImageEnhance.Brightness(bg).enhance(args.dim)

        # foreground: whole poster, full height, centred
        fg = src.resize((max(1, round(src.width * H / src.height)), H), Image.LANCZOS)
        x = (W - fg.width) // 2

        # a soft shadow so the poster separates from the blur band
        shadow = Image.new("RGB", (W, H), (0, 0, 0))
        mask = Image.new("L", (W, H), 0)
        mask.paste(Image.new("L", fg.size, 255), (x, 0))
        shadow = Image.composite(shadow, bg, mask.filter(ImageFilter.GaussianBlur(28)))
        out = shadow
        out.paste(fg, (x, 0))
        print(f"composited  poster {fg.width}x{fg.height} + {x}px blur band per side")

    os.makedirs(os.path.dirname(os.path.abspath(args.output)), exist_ok=True)
    out.save(args.output, quality=args.quality, optimize=True, subsampling=0)
    print(f"wrote   {args.output}  {out.width}x{out.height}  {os.path.getsize(args.output) // 1024} KB")


if __name__ == "__main__":
    main()
