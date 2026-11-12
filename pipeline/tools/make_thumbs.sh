#!/bin/sh
# Light copies of product photos for the catalog cards: public/img/products/sm/<name>.webp, 560 px tall.
# Run after adding images to public/img/products (only missing or outdated thumbnails are rebuilt).
cd "$(dirname "$0")/../../public/img/products" || exit 1
mkdir -p sm
for f in *.webp; do
  [ -f "sm/$f" ] && [ "sm/$f" -nt "$f" ] && continue
  cwebp -quiet -q 80 -alpha_q 85 -m 6 -resize 0 560 "./$f" -o "./sm/$f" || echo "failed: $f"
done
