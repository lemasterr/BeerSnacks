"""Move admin-uploaded photos from R2 (/media/<key>) into the static site (img/products/<key>.webp).

Why: every /media/... request runs a Pages Function and counts towards the free plan's
100 000 requests/day; static files don't. Run this now and then after products are added in the admin.

  python3 pipeline/tools/promote_uploads.py prepare
      1. downloads the live catalog from KV and saves a backup in .work/backup_<time>_promote/
      2. downloads each /media/... photo (and its sm/ thumbnail) from R2 into public/img/products/
         (old PNG/JPEG uploads are converted to WebP with cwebp; missing thumbnails are made by make_thumbs.sh)
      3. writes the catalog with the new image paths to public/data/catalog.json
   → then commit and push (deploys the files), and when the push is live:

  python3 pipeline/tools/promote_uploads.py publish
      checks every new image is served as image/webp on the live site, checks the live KV catalog has not
      changed since `prepare` (otherwise run prepare again), then writes public/data/catalog.json to KV.

The R2 objects are left in place (old links keep working); delete them by hand once you're sure.
Needs: wrangler (logged in), cwebp.
"""
import json, os, re, subprocess, sys, time, urllib.request

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
NS = '1673893bd1e04f2380804dc7263ea4b3'
BUCKET = 'beersnacks-images'
SITE = 'https://beersnacks.pages.dev'
IMG_DIR = os.path.join(ROOT, 'public', 'img', 'products')
CATALOG = os.path.join(ROOT, 'public', 'data', 'catalog.json')
STATE = os.path.join(ROOT, '.work', 'promote_state.json')
MEDIA = re.compile(r'^/media/([A-Za-z0-9_.-]+)$')


def wrangler(*args, capture=True):
    r = subprocess.run(['npx', 'wrangler', *args], cwd=ROOT, capture_output=capture, text=True)
    if r.returncode:
        sys.exit(f'wrangler {" ".join(args)} failed:\n{r.stderr or r.stdout}')
    return r.stdout


def live_catalog():
    return json.loads(wrangler('kv', 'key', 'get', 'catalog:compiled', '--namespace-id', NS, '--remote'))


def r2_get(key, dest):
    r = subprocess.run(['npx', 'wrangler', 'r2', 'object', 'get', f'{BUCKET}/{key}', '--remote', '--file', dest],
                       cwd=ROOT, capture_output=True, text=True)
    return r.returncode == 0 and os.path.exists(dest) and os.path.getsize(dest) > 0


def is_webp(path):
    with open(path, 'rb') as f:
        b = f.read(12)
    return b[:4] == b'RIFF' and b[8:12] == b'WEBP'


def prepare():
    cat = live_catalog()
    stamp = time.strftime('%Y%m%d_%H%M')
    bdir = os.path.join(ROOT, '.work', f'backup_{stamp}_promote')
    os.makedirs(bdir, exist_ok=True)
    with open(os.path.join(bdir, 'catalog_compiled.json'), 'w', encoding='utf-8') as f:
        json.dump(cat, f, ensure_ascii=False)
    print(f'backup: {os.path.relpath(bdir, ROOT)}/catalog_compiled.json')

    os.makedirs(os.path.join(IMG_DIR, 'sm'), exist_ok=True)
    moved, failed = [], []
    for p in cat:
        m = MEDIA.match(p.get('image') or '')
        if not m:
            continue
        key = m.group(1)
        name = re.sub(r'\.[a-z0-9]+$', '', key.lower()) + '.webp'
        dest = os.path.join(IMG_DIR, name)
        if not os.path.exists(dest):
            tmp = dest + '.download'
            if not r2_get(key, tmp):
                failed.append((p['id'], key)); continue
            if is_webp(tmp):
                os.replace(tmp, dest)
            else:  # old PNG/JPEG upload
                subprocess.run(['cwebp', '-quiet', '-q', '84', '-alpha_q', '100', '-m', '5', tmp, '-o', dest], check=True)
                os.remove(tmp)
            if key.endswith('.webp'):  # new uploads come with a thumbnail
                sm = os.path.join(IMG_DIR, 'sm', name)
                if not r2_get(f'sm/{key}', sm) and os.path.exists(sm):
                    os.remove(sm)
        p['image'] = f'img/products/{name}'
        moved.append((p['id'], key, name))

    if failed:
        print('could not download (left as is):', *failed, sep='\n  ')
    if not moved:
        print('nothing to move: no product uses /media/ photos'); return
    subprocess.run(['sh', os.path.join(ROOT, 'pipeline', 'tools', 'make_thumbs.sh')], check=True)

    with open(CATALOG, 'w', encoding='utf-8') as f:
        json.dump(cat, f, ensure_ascii=False, indent=1)
    with open(STATE, 'w', encoding='utf-8') as f:
        json.dump({'live_before': json.load(open(os.path.join(bdir, 'catalog_compiled.json'), encoding='utf-8')),
                   'images': [n for _, _, n in moved]}, f, ensure_ascii=False)
    for pid, key, name in moved:
        print(f'  {pid}: /media/{key} → img/products/{name}')
    print(f'{len(moved)} photo(s) moved. Now commit + push, wait for the deploy, then run: promote_uploads.py publish')


def publish():
    if not os.path.exists(STATE):
        sys.exit('run `prepare` first')
    state = json.load(open(STATE, encoding='utf-8'))
    for name in state['images']:
        for path in (f'/img/products/{name}', f'/img/products/sm/{name}'):
            req = urllib.request.Request(SITE + path, method='HEAD', headers={'User-Agent': 'BeerSnacksPipeline/1.0'})
            try:
                with urllib.request.urlopen(req, timeout=20) as r:
                    ctype = r.headers.get('content-type', '')
            except Exception as e:
                sys.exit(f'{path}: {e} — is the push deployed yet?')
            if 'image/webp' not in ctype:
                sys.exit(f'{path}: served as {ctype!r}, not image/webp — wait for the deploy')
    if live_catalog() != state['live_before']:
        sys.exit('the live catalog changed since `prepare` (someone edited in the admin) — run `prepare` again')
    wrangler('kv', 'key', 'put', 'catalog:compiled', '--path', CATALOG, '--namespace-id', NS, '--remote')
    os.remove(STATE)
    print(f'KV updated: {len(state["images"])} product photo(s) now served as static files')


if __name__ == '__main__':
    {'prepare': prepare, 'publish': publish}.get(sys.argv[1] if len(sys.argv) > 1 else '', lambda: sys.exit(__doc__))()
