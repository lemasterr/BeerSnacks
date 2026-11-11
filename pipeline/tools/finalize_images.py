# Turn downloaded packshots / cutouts into site-ready WebP.
# - images with transparency: trim to the object
# - images on a plain light background: remove it by flood-filling from the borders
# usage: python -P tools/finalize_images.py OUT_DIR rid=path [rid=path ...]   -> OUT_DIR/n-<rid>.webp
import sys, os
from PIL import Image, ImageOps, ImageDraw, ImageChops, ImageFilter

MAX = 800

def remove_plain_bg(im, tol=24):
    """Flood-fill near-white/near-uniform background from the 4 borders and make it transparent."""
    rgb = im.convert('RGB')
    w, h = rgb.size
    corners = [rgb.getpixel(p) for p in ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1))]
    bgc = max(set(corners), key=corners.count)
    if sum(bgc) / 3 < 200:            # dark/colored backgrounds: leave as is
        return im.convert('RGBA'), False
    mask = Image.new('L', (w + 2, h + 2), 0)
    diff = ImageChops.difference(rgb, Image.new('RGB', (w, h), bgc)).convert('L').point(lambda v: 255 if v > tol else 0)
    mask.paste(diff, (1, 1))
    ImageDraw.floodfill(mask, (0, 0), 128)
    bg = mask.crop((1, 1, w + 1, h + 1)).point(lambda v: 255 if v == 128 else 0)
    alpha = ImageChops.invert(bg).filter(ImageFilter.GaussianBlur(0.8))
    out = rgb.convert('RGBA'); out.putalpha(alpha)
    return out, True

def big_components(alpha, scale=200, min_share=0.12):
    """Mask of connected opaque regions whose area is >= min_share of the largest one."""
    w, h = alpha.size
    f = scale / max(w, h)
    small = alpha.resize((max(1, int(w * f)), max(1, int(h * f)))).point(lambda v: 255 if v > 10 else 0)
    sw, sh = small.size
    px = small.load()
    seen = [[False] * sw for _ in range(sh)]
    comps = []
    for y in range(sh):
        for x in range(sw):
            if px[x, y] and not seen[y][x]:
                stack, pts = [(x, y)], []
                seen[y][x] = True
                while stack:
                    cx, cy = stack.pop(); pts.append((cx, cy))
                    for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1), (cx + 1, cy + 1), (cx - 1, cy - 1), (cx + 1, cy - 1), (cx - 1, cy + 1)):
                        if 0 <= nx < sw and 0 <= ny < sh and px[nx, ny] and not seen[ny][nx]:
                            seen[ny][nx] = True; stack.append((nx, ny))
                comps.append(pts)
    if len(comps) <= 1: return None
    biggest = max(len(c) for c in comps)
    m = Image.new('L', (sw, sh), 0); mp = m.load()
    for c in comps:
        if len(c) >= biggest * min_share:
            for p in c: mp[p] = 255
    return m.filter(ImageFilter.MaxFilter(3)).resize((w, h), Image.BILINEAR).point(lambda v: 255 if v > 40 else 0)

def finalize(src, dst):
    im = ImageOps.exif_transpose(Image.open(src))
    if im.mode in ('RGBA', 'LA') or (im.mode == 'P' and 'transparency' in im.info):
        im = im.convert('RGBA')
        if im.getchannel('A').getextrema()[0] == 255:   # fully opaque "RGBA"
            im, _ = remove_plain_bg(im)
    else:
        im, _ = remove_plain_bg(im)
    im.thumbnail((1000, 1000), Image.LANCZOS)  # work on a smaller image: filters below are O(k²)
    # Drop small detached blobs (shop watermark icons in corners): erode to kill them,
    # dilate back, and keep alpha only inside that region.
    a = im.getchannel('A')
    keep = big_components(a)
    if keep is not None:
        im.putalpha(ImageChops.multiply(a, keep))
    bbox = im.getchannel('A').point(lambda v: 255 if v > 10 else 0).getbbox()
    if bbox: im = im.crop(bbox)
    im.thumbnail((MAX, MAX), Image.LANCZOS)
    pad = int(max(im.size) * 0.04)
    c = Image.new('RGBA', (im.width + 2 * pad, im.height + 2 * pad), (0, 0, 0, 0)); c.paste(im, (pad, pad))
    c.save(dst, 'WEBP', quality=84, method=5)

if __name__ == '__main__':
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    for pair in sys.argv[2:]:
        rid, path = pair.split('=', 1)
        try:
            finalize(path, os.path.join(out, f'n-{rid}.webp')); print('ok', rid)
        except Exception as e:
            print('FAIL', rid, e)
