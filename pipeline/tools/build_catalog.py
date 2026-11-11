# Build the new catalog: live catalog + updates from shelf photos + new products with texts.
# Run from S:\BeerAndSnacks:  python -P tools/build_catalog.py
# Inputs:  backup/catalog_migrated.json, backup/kv/site_categories.json, backup/kv/site_translations.json,
#          recognition/final_products.json, content/text_out_*.json, images_map.json (optional: rid -> image path)
# Outputs: build/catalog.json, build/categories.json, build/translations.json, build/report.json
import json, glob, os, re
from datetime import datetime, timezone
from collections import Counter, defaultdict

J = lambda p: json.load(open(p, encoding='utf-8'))
os.makedirs('build', exist_ok=True)
now = datetime.now(timezone.utc).isoformat()

cat = J('backup/catalog_migrated.json')
final = J('recognition/final_products.json')
texts = {t['rid']: t for f in sorted(glob.glob('content/text_out_*.json')) for t in J(f)}
images = J('images_map.json') if os.path.exists('images_map.json') else {}
by_id = {p['id']: p for p in cat}

LANGS = ['uk', 'en', 'et', 'ru']
def vol_from_size(s):
    s = (s or '').strip()
    if not s: return ''
    s = s.replace(',', '.').replace(' ', '')
    m = re.match(r'^([\d.]+)\s*(l|л|ml|мл|g|г|гр|kg|кг)$', s, re.I)
    if not m: return s
    v, u = m.group(1), m.group(2).lower()
    if u in ('l', 'л'): return f'{float(v):g}L'
    if u in ('ml', 'мл'): return f'{float(v)/1000:g}L'
    if u in ('kg', 'кг'): return f'{float(v)*1000:g}г'
    return f'{float(v):g}г'

report = {'updated': [], 'new': [], 'missing_text': [], 'not_on_photos': []}
seen_ids = set()

# 1) updates to existing products
for y in final:
    if y.get('action') != 'update': continue
    p = by_id.get(y['match_id'])
    if not p: continue
    old = p.get('price')
    if y.get('price') is not None: p['price'] = y['price']
    p['price_unit'] = y.get('price_unit') or 'pcs'
    if y.get('price_05'): p['price_05'] = y['price_05']
    if (not p.get('volume') or p.get('volume') in ('0', '0г')) and y.get('size'): p['volume'] = vol_from_size(y['size'])
    p['in_stock'] = True
    p['updated_at'] = now
    seen_ids.add(p['id'])
    report['updated'].append({'id': p['id'], 'name': p['name_ru'], 'old_price': old, 'new_price': p['price']})

# 2) new products
order = defaultdict(int)
new_keys, by_new = {}, {}
for y in final:
    if y.get('action') != 'new': continue
    t = texts.get(y['rid'])
    if not t:
        report['missing_text'].append(y['rid']); continue
    sub = t.get('subcategory') or y.get('subcategory') or ''
    order[(y['category'], sub)] += 1
    p = {
        'id': f"n-{y['rid']}",
        'category': y['category'], 'subcategory': sub,
        'image': images.get(y['rid'], ''),
        'price': y['price'], 'price_unit': y.get('price_unit') or 'pcs',
        'volume': t.get('volume') or vol_from_size(y.get('size')),
        'abv': t.get('abv') or '', 'ibu': '',
        'in_stock': True, 'stock_oismae': False, 'stock_mahtra': False,
        'sort_order': 100 + order[(y['category'], sub)],
        'updated_at': now,
    }
    if y.get('price_05'): p['price_05'] = y['price_05']
    for l in LANGS:
        for f in ('name', 'type', 'description'):
            p[f'{f}_{l}'] = (t.get(f'{f}_{l}') or '').strip()
    key = (p['name_ru'].lower(), (p['volume'] or '').lower(), p['category'])
    if key in new_keys:  # same product recognized on two photos
        report.setdefault('dropped_duplicates', []).append({'id': p['id'], 'same_as': new_keys[key]})
        if not images.get(new_keys[key][2:]) and p['image']: by_new[new_keys[key]]['image'] = p['image']
        continue
    new_keys[key] = p['id']; by_new[p['id']] = p
    cat.append(p)
    report['new'].append(p['id'])

report['not_on_photos'] = [{'id': p['id'], 'name': p['name_ru'], 'price': p.get('price'), 'category': p['category']}
                           for p in cat if not p['id'].startswith('n-') and p['id'] not in seen_ids]

# 3) categories + translations
cats = J('backup/kv/site_categories.json')
trans = J('backup/kv/site_translations.json')
NEW_CATS = {'groceries': {'uk': 'Продукти', 'en': 'Groceries', 'et': 'Toidukaubad', 'ru': 'Продукты'}}
NEW_SUBS = {
    'draft': ('Розливне', 'Draft', 'Vaadiõlu', 'Разливное'), 'cocktails': ('Коктейлі', 'Cocktails', 'Kokteilid', 'Коктейли'),
    'kvass': ('Квас', 'Kvass', 'Kali', 'Квас'), 'cookies': ('Печиво', 'Cookies', 'Küpsised', 'Печенье'),
    'chocolate': ('Шоколад', 'Chocolate', 'Šokolaad', 'Шоколад'), 'icecream': ('Морозиво', 'Ice cream', 'Jäätis', 'Мороженое'),
    'meat': ("М'ясні снеки", 'Meat snacks', 'Lihasnäkid', 'Мясные снеки'), 'fish': ('Риба', 'Fish', 'Kala', 'Рыба'),
    'sauces': ('Соуси', 'Sauces', 'Kastmed', 'Соусы'), 'spices': ('Приправи', 'Spices', 'Maitseained', 'Приправы'),
    'cheese': ('Сир', 'Cheese', 'Juust', 'Сыр'), 'preserves': ('Варення та джеми', 'Jams', 'Moosid', 'Варенье и джемы'),
    'oil': ('Олія', 'Oil', 'Õli', 'Масло'), 'other': ('Інше', 'Other', 'Muu', 'Другое'),
}
for slug, names in NEW_CATS.items():
    if not any(c['slug'] == slug for c in cats):
        cats.append({'slug': slug, 'sort_order': len(cats), 'subcategories': ['all']})
    for l in LANGS: trans[l].setdefault('categories', {})[slug] = names[l]
for slug, names in NEW_SUBS.items():
    for l, n in zip(LANGS, names): trans[l].setdefault('subcategories', {}).setdefault(slug, n)
used = defaultdict(Counter)
for p in cat:
    if p.get('subcategory'): used[p['category']][p['subcategory']] += 1
for c in cats:
    subs = c.get('subcategories') or ['all']
    for s, _ in used[c['slug']].most_common():
        if s not in subs: subs.append(s)
    c['subcategories'] = subs
unknown = sorted({s for c in cats for s in c['subcategories'] if s != 'all' and s not in trans['ru'].get('subcategories', {})})

json.dump(cat, open('build/catalog.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
json.dump(cats, open('build/categories.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
json.dump(trans, open('build/translations.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
json.dump(report, open('build/report.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('catalog', len(cat), '| updated', len(report['updated']), '| new', len(report['new']), '| missing text', report['missing_text'])
print('not on photos (old prices):', len(report['not_on_photos']), '| without image:', sum(1 for p in cat if not p.get('image')))
print('categories', [(c['slug'], len(c['subcategories'])) for c in cats], '| untranslated subcats', unknown)
