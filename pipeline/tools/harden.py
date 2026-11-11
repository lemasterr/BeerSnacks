# Harden a soft background-removal alpha: threshold, keep the largest object, fill holes.
# usage: python -P harden.py in.png out.png [threshold]
import sys
from PIL import Image, ImageFilter, ImageDraw, ImageChops

def harden(src, dst, thr=20):
    im = Image.open(src).convert('RGBA')
    a = im.getchannel('A')
    m = a.point(lambda v: 255 if v > thr else 0)
    # close small gaps on the contour, then fill holes: flood the background from the border
    m = m.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.MinFilter(9))
    w, h = m.size
    pad = Image.new('L', (w + 2, h + 2), 0); pad.paste(m, (1, 1))
    ImageDraw.floodfill(pad, (0, 0), 128)
    bg = pad.crop((1, 1, w + 1, h + 1)).point(lambda v: 255 if v == 128 else 0)
    solid = ImageChops.invert(bg)
    # keep soft edge from the original only at the contour
    edge = solid.filter(ImageFilter.GaussianBlur(1.2))
    im.putalpha(edge)
    bbox = solid.getbbox()
    if bbox: im = im.crop(bbox)
    im.save(dst)

if __name__ == '__main__':
    harden(sys.argv[1], sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 20)
