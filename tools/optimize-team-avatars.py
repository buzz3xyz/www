#!/usr/bin/env python3
"""Turn full-size team photos into web-weight avatar JPEGs.

The avatars render at 90 CSS px in a circle (`.member-avatar`), so a 3x display
only ever needs 270 px. Photos straight off a camera are 1000-4000 px and, when
saved as PNG, land around 1.5 MB each -- 6 MB+ of image data to paint four 90 px
circles. This script centre-crops to a square and writes a 400x400 progressive
JPEG, which is ~20-30 KB, i.e. roughly a 50x reduction with no visible loss at
the size the page actually draws them.

The centre crop matters: the avatar is masked to a circle, so the subject's face
must sit near the middle of the frame. Anything else gets its chin or forehead
clipped by the mask.

Usage
  python tools/optimize-team-avatars.py [folder] [--size 400] [--quality 86]
  python tools/optimize-team-avatars.py --check          # report only, write nothing

  # Originals are left in place by default. Pass --move-originals DIR to relocate
  # them somewhere unpublished (e.g. .workbuddy-ai/source-assets/team).
"""
import argparse
import os
import sys

from PIL import Image

EXTS = {".png", ".jpg", ".jpeg", ".webp", ".tif", ".tiff", ".bmp"}


def square_crop(img, size):
    """Scale to cover a square, then centre-crop -- mirrors CSS object-fit: cover."""
    s = max(size / img.width, size / img.height)
    r = img.resize((max(1, round(img.width * s)), max(1, round(img.height * s))), Image.LANCZOS)
    left = (r.width - size) // 2
    top = (r.height - size) // 2
    return r.crop((left, top, left + size, top + size))


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("folder", nargs="?", default="team")
    ap.add_argument("--size", type=int, default=400, help="output edge length (default 400)")
    ap.add_argument("--quality", type=int, default=86)
    ap.add_argument("--check", action="store_true", help="report only, write nothing")
    ap.add_argument("--move-originals", metavar="DIR",
                    help="move non-JPEG sources here instead of leaving them behind")
    args = ap.parse_args()

    if not os.path.isdir(args.folder):
        sys.exit(f"not a directory: {args.folder}")

    sources = sorted(f for f in os.listdir(args.folder)
                     if os.path.splitext(f)[1].lower() in EXTS)
    if not sources:
        sys.exit(f"no images in {args.folder}")

    before = after = 0
    for name in sources:
        src = os.path.join(args.folder, name)
        stem, ext = os.path.splitext(name)
        out = os.path.join(args.folder, stem + ".jpg")
        b = os.path.getsize(src)
        before += b

        with Image.open(src) as im:
            w, h = im.size
            # a JPEG source that is already small and square needs no work
            if ext.lower() in (".jpg", ".jpeg") and max(w, h) <= args.size:
                print(f"  {name:24s} {w}x{h}  already small -> left alone")
                after += b
                continue
            square = square_crop(im.convert("RGB"), args.size)

        if args.check:
            print(f"  {name:24s} {w}x{h}  {b // 1024} KB  -> would write {stem}.jpg")
            after += b
            continue

        square.save(out, "JPEG", quality=args.quality, optimize=True, progressive=True)
        a = os.path.getsize(out)
        after += a
        print(f"  {name:24s} {w}x{h} {b // 1024:5d} KB  ->  {stem}.jpg "
              f"{args.size}x{args.size} {a // 1024:4d} KB  ({b / a:.0f}x smaller)")

        if args.move_originals and ext.lower() != ".jpg":
            dest_dir = os.path.join(args.move_originals, os.path.basename(
                os.path.normpath(args.folder)))
            os.makedirs(dest_dir, exist_ok=True)
            os.replace(src, os.path.join(dest_dir, name))
            print(f"  {'':24s} original moved -> {dest_dir}/{name}")

    if not args.check:
        saved = before - after
        pct = (saved / before * 100) if before else 0
        print(f"\ntotal {before // 1024} KB -> {after // 1024} KB  "
              f"(saved {saved // 1024} KB, {pct:.0f}%)")


if __name__ == "__main__":
    main()
