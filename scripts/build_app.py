"""Build the phone app (a single static page) into app/dist.

    python scripts/build_app.py

Reads the vocabulary JSON in languages/*/vocab, the Japanese verb list, the fixed grammar question
banks (used by the offline placement check) and the writing/speaking prompt banks, injects them into
app/src/laoshi.html (which keeps empty placeholders so it stays small enough to edit), wraps the page for standalone use (manifest, service worker, shim) and writes
app/dist/. Run it after editing any vocab file, then commit.
"""
import json, re, shutil, pathlib, glob, time
BUILD = str(int(time.time()))

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = (ROOT / 'app/src/laoshi.html').read_text(encoding='utf8')
OUT = ROOT / 'app/dist'

def rows(pattern, exclude=()):
    out = []
    for f in sorted(glob.glob(str(ROOT / pattern))):
        if any(x in f for x in exclude):
            continue
        for o in json.load(open(f, encoding='utf8')):
            out.append([o['w'], o['p'], o['m'], o['l'], o['t'], o.get('z', ''), o.get('e', '')])
    return out

def order(rs, key):
    return sorted(rs, key=lambda r: key.index(r[3]) if r[3] in key else 99)

zh = order(rows('languages/zh/vocab/*.json'), ['HSK 5', 'HSK 6', 'HSK 7-9'])
ja = order(rows('languages/ja/vocab/*.json', exclude=('starter',)), ['N5', 'N4', 'N3', 'N2', 'N1'])

def inject(src, name, data, loop):
    pat = re.compile(r'const %s=\[.*?\];\n%s\.forEach' % (name, name), re.S)
    new = 'const %s=%s;\n%s.forEach' % (name, json.dumps(data, ensure_ascii=False, separators=(',', ':')), name)
    assert pat.search(src), name
    return pat.sub(lambda m: new, src, count=1)

page = inject(SRC, 'BIG', zh, 'BIG')
page = inject(page, 'BIGJ', ja, 'BIGJ')

def load(path):
    return json.load(open(ROOT / path, encoding='utf8'))

def inject_const(src, name, data):
    pat = re.compile(r'const %s=.*?;//@data\n' % name, re.S)
    assert pat.search(src), name
    new = 'const %s=%s;//@data\n' % (name, json.dumps(data, ensure_ascii=False, separators=(',', ':')))
    return pat.sub(lambda m: new, src, count=1)

page = inject_const(page, 'JVERBS', load('languages/ja/grammar/verbs.json'))
page = inject_const(page, 'QBANK', {'zh': load('languages/zh/grammar/question-bank.json'),
                                    'ja': load('languages/ja/grammar/question-bank.json')})
page = inject_const(page, 'PROMPTS', {'zh': load('languages/zh/prompts.json'), 'ja': load('languages/ja/prompts.json')})

title = re.search(r'<title>(.*?)</title>', page).group(1)
head = ('<!doctype html><html lang="en"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
        '<meta name="theme-color" content="#0C7A64"><link rel="manifest" href="manifest.webmanifest">'
        '<link rel="icon" href="icon-192.png"><link rel="apple-touch-icon" href="icon-192.png">'
        '<style>html{color-scheme:light}body{margin:0}[hidden]{display:none!important}'
        ':root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}</style>'
        '<script src="shim.js?v=' + BUILD + '"></script></head><body>')
tail = ('<script>if("serviceWorker"in navigator)addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}))</script>'
        '</body></html>')
OUT.mkdir(parents=True, exist_ok=True)
(OUT / 'index.html').write_text(head + page + tail, encoding='utf8')
for f in ['shim.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', '.nojekyll']:
    shutil.copy(ROOT / 'app' / f, OUT / f)
sw = (ROOT / 'app/sw.js').read_text(encoding='utf8').replace("'laoshi-v1'", "'laoshi-" + BUILD + "'")
(OUT / 'sw.js').write_text(sw, encoding='utf8')
print('built', OUT / 'index.html', 'zh', len(zh), 'ja', len(ja))
