# Local review tool for recognized products.
# Run from S:\BeerAndSnacks:  python -P review/server.py   -> http://localhost:8800
# Edits are saved to recognition/edits.json (one entry per product id).
import json, os, threading
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EDITS = os.path.join(ROOT, 'recognition', 'edits.json')
PRODUCTS = os.path.join(ROOT, 'recognition', 'products_merged.json')
lock = threading.Lock()

def load_edits():
    if os.path.exists(EDITS):
        with open(EDITS, encoding='utf-8') as f: return json.load(f)
    return {}

class H(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw): super().__init__(*a, directory=ROOT, **kw)

    def log_message(self, *a): pass

    def send_json(self, data, code=200):
        body = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers(); self.wfile.write(body)

    def do_GET(self):
        path = urlparse(self.path).path
        if path in ('/', '/index.html'):
            self.path = '/review/index.html'
        elif path == '/api/data':
            with open(PRODUCTS, encoding='utf-8') as f: products = json.load(f)
            return self.send_json({'products': products, 'edits': load_edits()})
        elif not (path.startswith('/review/') or path.startswith('/photos-preview/')):
            return self.send_error(404)
        return super().do_GET()

    def do_POST(self):
        if urlparse(self.path).path != '/api/edit': return self.send_error(404)
        n = int(self.headers.get('Content-Length', 0))
        try:
            data = json.loads(self.rfile.read(n).decode('utf-8'))
            rid = str(data['rid'])
        except Exception:
            return self.send_json({'error': 'bad request'}, 400)
        with lock:
            edits = load_edits()
            fields = {k: v for k, v in data.items() if k != 'rid'}
            edits[rid] = {**edits.get(rid, {}), **fields}
            tmp = EDITS + '.tmp'
            with open(tmp, 'w', encoding='utf-8') as f: json.dump(edits, f, ensure_ascii=False, indent=1)
            os.replace(tmp, EDITS)
        self.send_json({'ok': True})

if __name__ == '__main__':
    print('Review tool on http://localhost:8800')
    ThreadingHTTPServer(('127.0.0.1', 8800), H).serve_forever()
