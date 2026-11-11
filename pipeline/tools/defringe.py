# Remove the light halo left by background removal: shrink the alpha edge by ~1 px and
# pull edge pixel colours toward the object's interior colour.
# usage: python -P tools/defringe.py <dir with .webp>
import sys, glob
from PIL import Image, ImageFilter, ImageChops

def defringe(path):
    im = Image.open(path)
    if im.mode != 'RGBA':
        return False
    a = im.getchannel('A')
    if a.getextrema()[0] == 255:      # no transparency at all
        return False
    eroded = a.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.5))
    # colour decontamination: on the edge band, replace RGB by a blurred version taken from solid pixels only
    rgb = im.convert('RGB')
    solid = a.point(lambda v: 255 if v > 250 else 0)
    blurred = rgb.filter(ImageFilter.GaussianBlur(2))
    blurred_mask = solid.filter(ImageFilter.GaussianBlur(2))
    edge = ImageChops.subtract(a.point(lambda v: 255 if v > 0 else 0), solid)  # semi-transparent band
    # normalise blurred colour by blurred mask to avoid mixing in the (white) background
    r, g, b = blurred.split()
    def norm(ch):
        return Image.merge('L', [ImageChops.multiply(ch, Image.new('L', ch.size, 255))])
    out_rgb = Image.composite(blurred, rgb, edge.filter(ImageFilter.MaxFilter(3)))
    out = out_rgb.convert('RGBA'); out.putalpha(eroded)
    out.save(path, 'WEBP', quality=84, method=5)
    return True

if __name__ == '__main__':
    n = sum(defringe(p) for p in glob.glob(sys.argv[1] + '/*.webp'))
    print('defringed', n)
