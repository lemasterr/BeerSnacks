"""Give every non-beer product a sort_order that keeps one product line together.
sort_order = subcategory position * 10000 + rank * 10 (rank inside the subcategory).
Inside a subcategory: lines (brands) ordered by size, biggest first; inside a line: by type, then name,
so flavours of one product stand next to each other.
usage: resort.py catalog.json categories_full.json out.json"""
import json, re, sys
from collections import defaultdict

ALIASES = [  # (regex on normalised English name, line key) — first match wins, more specific first
    (r'^shake', 'shake'), (r'^guarana', 'guarana'), (r'^non stop', 'non stop'),
    (r'^dzhusik', 'dzhusik'), (r'^nash sik', 'nash sik'), (r'sandora', 'sandora'), (r'^sokovita', 'sokovita'),
    (r'^the banka', 'the banka'), (r'^vita\b', 'vita'), (r'^zhyvchyk', 'zhyvchyk'), (r'^air heads', 'air heads'),
    (r'^biola fruit water', 'biola fruit water'), (r'^biola', 'biola'), (r'garage', 'garage'),
    (r'taras', 'taras kvass'), (r'^lvivsk', 'lvivskyi kvass'), (r'^yar[iy]lo', 'yarylo kvass'),
    (r'^opillia', 'opillia kvass'), (r'^old kyiv', 'old kyiv kvass'),
    (r'^mojo', 'mojo'), (r'^morshynska', 'morshynska'), (r'^obolon', 'obolon'), (r'^uman', 'uman'),
    (r'^(galka|halka)', 'galka'), (r'^kava zi lvova', 'kava zi lvova'), (r'^maccoffee', 'maccoffee'),
    (r'^old lviv', 'old lviv'), (r'^sherlock', 'sherlock'), (r'^tea moments', 'tea moments'), (r'^trypilske', 'trypilske'),
    (r'^bukovia', 'bukovia'), (r'^detox', 'detox'), (r'^lu[zž]ansk', 'luzanska'), (r'^poljana', 'poljana'), (r'^shayansk', 'shayanska'),
    (r'^(lux|luks|liuks|lyuks)\b', 'lux'), (r'^big bob', 'big bob'), (r'^big panda', 'big panda'),
    (r'^chicken (chips|crisps)', 'chicken chips'), (r'^flint', 'flint'), (r'^golden chips', 'golden chips'),
    (r'^hrumer', 'hrumer'), (r'^jokers', 'jokers'), (r'(lotisti|^veal with adjika)', 'lotisti'),
    (r'^snekkin', 'snekkin'), (r'^khvylyasti', 'khvylyasti'), (r'^star snack', 'star snack'), (r'^salut', 'salut'),
    (r'^khomka', 'khomka'), (r'martin', 'martin'), (r'^san sanych', 'san sanych'), (r'^(zaichata|zaychata|zayka)', 'zaychata'),
    (r'peanut', 'peanuts'),
    (r'(christmas|sunny wreath|ametist assorted|^ametist candies)', 'gift boxes'),
    (r'trufalie', 'avk trufalie'), (r'(royal charm|kuninglik|creamo)', 'royal charm'), (r'biguin', 'mr biguin'),
    (r'^amanti', 'amanti'), (r'^amet[iy]st|^date with nut', 'ametist'),
    (r'mon blanc', 'roshen mon blanc'), (r'yummi gummi', 'roshen yummi gummi'), (r'bony fruit', 'roshen bony fruit'),
    (r'lviv(skyi)? truffle', 'svitoch truffle'), (r'star glow', 'star glow'), (r'^(tortufel|tortoff)', 'tortufel'),
    (r'jack', 'jack'), (r'^marmeladoff', 'marmeladoff'), (r'kontik', 'kontik'), (r'^timi', 'timi'),
    (r'^roshen', 'roshen'), (r'bam[ -]?buk', 'bam buk'), (r'^artek', 'artek'), (r'rollio', 'rollio'),
    (r'(boguslavna|bohuslavna)', 'boguslavna'), (r'^tendi', 'tendi'), (r'^bonifie', 'bonifie'),
    (r'^veres', 'veres'), (r'^shchedro', 'shchedro'), (r'^torchyn', 'torchyn'), (r'^olis', 'olis'), (r'^caramix', 'caramix'),
    (r'^iris', 'iris'), (r'^avokado', 'avokado'), (r'^(smakko|shakko)', 'smakko'), (r'^tsvit', 'tsvit aromat'),
    (r'^mivina', 'mivina'),
    # fish & seafood: group by the fish, not by brand
    (r'squid', 'squid'), (r'(salmon|sockeye)', 'salmon'), (r'\bmari\b', 'mari'), (r'bleak', 'bleak'), (r'anchov', 'anchovy'),
    (r'(blue whiting|putassu)', 'blue whiting'), (r'\bcod\b', 'cod'), (r'pollock', 'pollock'), (r'\broe\b', 'roe'),
    (r'roach', 'roach'), (r'(octopus|mussel)', 'shellfish'), (r'tuna', 'tuna'),
]
LAST = {'gift boxes'}          # seasonal boxes go to the end of their subcategory
KVASS = re.compile(r'kvass')   # sodas: all kvass brands as one block after the soft drinks

def line(p):
    n = (p.get('name_en') or p.get('name_ru') or '').lower().strip()
    for rx, key in ALIASES:
        if re.search(rx, n): return key
    n = re.sub(r'^(dried|flaked dried)\s+', '', n)
    return n.split()[0] if n else ''

cat = json.load(open(sys.argv[1])); cats = {c['slug']: c['subcategories'] for c in json.load(open(sys.argv[2]))}
groups = defaultdict(list)
for p in cat:
    if p['category'] == 'beer': continue
    groups[(p['category'], p.get('subcategory') or '')].append(p)
for (c, sub), ps in groups.items():
    subs = cats.get(c, [])
    base = (subs.index(sub) if sub in subs else len(subs)) * 10000
    lines = defaultdict(list)
    for p in ps: lines[line(p)].append(p)
    size = {k: sum(1 for p in v if p.get('in_stock')) or 0.5 for k, v in lines.items()}
    order = sorted(lines, key=lambda k: (k in LAST, bool(KVASS.search(k)) and sub == 'sodas', -size[k], k))
    rank = 0
    for k in order:
        for p in sorted(lines[k], key=lambda p: ((p.get('type_ru') or '').lower(), (p.get('name_en') or '').lower())):
            rank += 1; p['sort_order'] = base + rank * 10
json.dump(cat, open(sys.argv[3], 'w'), ensure_ascii=False, indent=1)
for (c, sub), ps in sorted(groups.items()):
    if c in ('drinks',) and sub in ('energy', 'sodas', 'cocktails') or (c, sub) == ('sweets', 'candies'):
        print(f'== {c}/{sub}'); print('  ' + ' | '.join(p['name_en'] for p in sorted(ps, key=lambda p: p['sort_order']) if p.get('in_stock')))
