# Find a product photo (packshot) for each product — v2

Shop catalog needs one clean product image per product. Input: JSON list (rid, name_ru, name_original as printed on the pack, brand, flavor, size, category, photos = our own shelf photos for reference: `S:\BeerAndSnacks\photos-preview\<photo>.jpg`, open with Read to see the pack design).

## Allowed ways to get data (important)
- Use ONLY the WebSearch and WebFetch tools to find and read web pages. Do not fetch HTML pages with Python/curl.
- Open Food Facts has an official open API you may call from Python: `https://world.openfoodfacts.org/cgi/search.pl?search_terms=<terms>&json=1&page_size=5&fields=product_name,brands,quantity,image_front_url` or `https://world.openfoodfacts.org/api/v2/search?brands_tags=<brand>&fields=product_name,quantity,image_front_url&page_size=20`. Send header `User-Agent: BeerSnacksCatalog/1.0`. It can be slow: timeout 30 s, one retry.
- To download the chosen image file, use Python with header `User-Agent: BeerSnacksCatalog/1.0` (never pretend to be a browser). If a server answers 403/429 or a challenge page, skip that source and try another; never try to get around blocks.

## Where to look
Any site is fine: online shops in Ukraine (fozzyshop.ua, metro.zakaz.ua, silpo.ua, novus.ua, varus.ua, epicentrk.ua, prom.ua), Poland (frisco.pl, zakupy.auchan.pl), Czechia (rohlik.cz), Estonia (barbora.ee, selver.ee, rimi.ee, prismamarket.ee), manufacturer sites, Open Food Facts, Wikimedia Commons, marketplaces, food blogs that show the pack. WebSearch tips: brand + product + flavor in the pack's language (Ukrainian/Polish/Czech), also try transliteration; add the site name (e.g. "fozzyshop Живчик груша").
Use WebFetch on a product page and ask it for the main product image URL (og:image).

## Choosing the image
Exactly this product and flavor (same pack design as our shelf photo), front view, preferably white/transparent background, ≥ 300 px on the short side. No lifestyle photos, collages, multi-packs, big watermarks or price stickers. If the exact flavor is not available but the same line in another flavor looks nearly identical, you may use it with `match: "similar"`. Otherwise `match: "none"` (we will cut it out of our own photo).

Download to `S:\BeerAndSnacks\images_raw\files\<rid>.<ext>`, open with PIL to check size, and Read it to confirm visually. About 4–5 tool calls per product on average; move on if a product is hard.

## Output
JSON array (UTF-8, ensure_ascii=False) to the given path, one object per input product:
`{"rid":"p123","file":"S:\\BeerAndSnacks\\images_raw\\files\\p123.jpg"|null,"source_url":"page url"|null,"image_url":"..."|null,"match":"exact"|"similar"|"none","note":"short"}`

Reply in under 40 words: counts of exact / similar / none, and which sources worked.

## Retry round — what worked best last time
1. **epicentrk.ua site search via WebFetch**: `https://epicentrk.ua/ua/search/?q=<brand+product in Ukrainian>` — read the result list, open the product page with WebFetch, take the image from `cdn.27.ua`; replace the size part of the path with `/original/` to get full size.
2. (zakaz.ua and varus.ua search pages are JS-rendered and return nothing via WebFetch — skip them.) Try instead **WebSearch with the exact Ukrainian name + "epicentrk" or + "купити"**, then WebFetch the found product page. Old note: **zakaz.ua store pages via WebFetch** (e.g. `https://novus.zakaz.ua/uk/search/?q=...`, `https://metro.zakaz.ua/uk/search/?q=...`) — images are on `img*.zakaz.ua` and download fine.
3. varus.ua product pages via WebFetch.
4. WebSearch only when the shop searches fail (it gets rate-limited — use it sparingly).
Search EVERY product in your list at least once in epicentrk and zakaz before marking it none. Never use an image of a different flavor.
