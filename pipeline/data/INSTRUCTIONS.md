# Product recognition from shelf photos

You are cataloguing products from shelf photos taken in a small beer & snacks shop in Tallinn (Ukrainian / Polish / Estonian / Czech goods). Price tags are mostly in Estonian; packaging mostly Ukrainian, Russian, Polish or Czech.

Photos (1024px JPEG) are in `S:\BeerAndSnacks\photos-preview\` (`<name>.jpg`). Open each one with the Read tool. If a price tag or pack text is too small, crop/zoom with a short Python script using PIL (run `python -P`), save crops to `S:\BeerAndSnacks\recognition\crops\` and Read them. Full-resolution originals exist as `S:\BeerAndSnacks\incoming-photos\<name>.HEIC` (open with `import pillow_heif; pillow_heif.register_heif_opener()`), use them only when the 1024px version is not legible.

## What to record
For EVERY distinct product visible with an identifiable name (one photo often shows 2–5 products and several tags), output one record. Each flavor is its own record. For draft-beer posters, each volume is its own record.

## Rules — read carefully, these were the mistakes in the pilot
- Read text exactly. Never invent flavors, sizes or prices. Unreadable → `null` and lower confidence.
- Check the brand spelling letter by letter on the pack (pilot error: "Baola" instead of "Biola").
- A price tag belongs to the product directly ABOVE it on the same shelf. Before assigning a price, check that the product name on the tag matches the product. If the tag names a different product (pilot error: tag "Umani limonaad 2,50" under Biola bottles), set `price: null`, confidence `low`, and explain in notes. If the tag name differs from the bottle but plausibly the same product, keep the price, confidence `medium`, note both names.
- Estonian tag words: hind = price, kg hind / hind kilo kohta = price per kg, tk = piece, maitseline / maitsega = flavoured, kuivatatud = dried, õlu = beer, siider = cider, limonaad = lemonade, mahl = juice, kommid = candies, küpsised = cookies, seemned = sunflower seeds, pähklid = nuts, juust = cheese, kaste = sauce, moos = jam, alkoholivaba = non-alcoholic.
- `price_unit`: `pcs` normally; `kg` if the tag gives €/kg only (loose goods); `100g` if the price is per 100 g. If a tag shows both a piece price and a per-kg/per-litre reference (e.g. "1.80 (22.5€/kg)"), the piece price is the price, unit `pcs`.

## Categories
`category`: beer, cider, drinks, sweets, snacks, groceries (groceries = sauces, spices, cheese, oil, preserves, other food). Alcoholic cocktails/RTD → category `drinks`, subcategory `cocktails`.
`subcategory`:
- beer: ukraine, poland, czech, germany, estonia, draft
- cider: fruit_cider, berry_cider, non_alc_cider
- drinks: juices, sodas, water, energy, tea_coffee, cocktails
- sweets: candies, dragee, wafers, desserts, cakes, cookies, chocolate
- snacks: chips, crackers, seeds, seafood, nuts, fish
- groceries: sauces, spices, cheese, preserves, oil, other

## Names
`name_ru`: Russian name in this shop's style, with flavor and size where known, e.g. "Живчик с яблоком 2л", "Shrips Оригинал", "АВК Trufalie Клубника", "Перуанский Кальмар 100г", "Опилля Корифей". Keep the brand in Latin if it is Latin on the pack. `name_original`: exactly as printed on the pack.

## Output
Write a JSON array (UTF-8, `ensure_ascii=False`) to the output path you were given. Each object:

```json
{"photo":"IMG_1908","brand":"...","name_original":"...","name_ru":"...","flavor":"..."|null,
 "size":"150g"|"0.5L"|null,"price":1.8|null,"price_unit":"pcs"|"kg"|"100g",
 "price_text":"exact tag text"|null,"category":"...","subcategory":"...",
 "confidence":"high"|"medium"|"low","notes":"anything uncertain"}
```

Every photo in your list must appear in at least one record; if a photo has no identifiable product, add one record with `name_ru: null`, confidence `low` and a note saying what is in the photo.

When done, reply in under 80 words: number of records, number of photos, number of low-confidence records.
