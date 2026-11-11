# Write catalog texts for new products (4 languages)

Shop: Beer&Snacks, Tallinn — Ukrainian/Polish/Czech/Estonian beer, drinks, sweets, snacks and groceries. Customers read the site in Ukrainian (uk), English (en), Estonian (et) and Russian (ru).

Input: a JSON list of products recognized from shelf photos (`name_ru`, `name_original` as printed on the pack, brand, flavor, size, category, subcategory, notes). Style reference: `S:\BeerAndSnacks\content\examples.json` — match its tone and length exactly (short, factual, no marketing words, no exclamation marks).

For each product produce:
- `name_uk`, `name_en`, `name_et`, `name_ru`: product name with brand and flavor, WITHOUT size/weight (size goes into `volume`). Keep Latin brand names in Latin (Shrips, Big Bob, Roshen, Non Stop…). Ukrainian brand names: Cyrillic in uk/ru (Живчик, Щедро, Верес), transliterated in en/et (Zhyvchyk, Shchedro, Veres). Fix obvious recognition typos in `name_ru`.
- `type_uk/en/et/ru`: short type like the examples ("Конфеты", "Газированный напиток", "Светлое пиво", "Сушёный кальмар", "Соус", "Приправа").
- `description_uk/en/et/ru`: one short line, 4–10 words, only facts that follow from the name/pack (flavor, what it is). Do not invent ingredients, origin or awards.
- `volume`: size in site format: liquids "0.5L", "1L", "0.33L", "1.5L"; weight "100г", "250г", "60г". If sold by weight (price_unit kg / 100g) and no pack size, use "". If unknown, "".
- `abv`: only for beer/cider/cocktails if it is in the input (e.g. "5%"), else "".
- `subcategory`: keep the input value; if null, choose the best fitting one: beer: ukraine poland czech germany estonia draft; cider: fruit_cider berry_cider non_alc_cider; drinks: juices sodas water energy tea_coffee cocktails kvass; sweets: candies dragee wafers desserts cakes cookies chocolate icecream; snacks: chips crackers seeds seafood nuts fish meat; groceries: sauces spices cheese preserves oil other.

Output: JSON array (UTF-8, ensure_ascii=False) written to the given path, one object per input product, with `rid` plus the fields above. Estonian must be real Estonian (õ ä ö ü), Ukrainian real Ukrainian (і ї є ґ), not Russian.

Reply in under 40 words.
