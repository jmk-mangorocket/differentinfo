# -*- coding: utf-8 -*-
"""Generate the next unposted keyword from the baby_keywords CSV."""
import urllib.request, json, re, sys, csv

env = {}
with open('.env.local', 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if '=' in line and not line.startswith('#'):
            k, v = line.split('=', 1)
            env[k] = v

# Pick next unposted keyword
keyword = None
category = None
with open('docs/baby_keywords.csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    header = next(reader)
    for row in reader:
        posted = row[6].strip() if len(row) > 6 else ''
        if posted != 'Y':
            keyword = row[1].strip()
            category = row[2].strip()
            break

if not keyword:
    sys.stdout.buffer.write(b'All keywords have been posted!\n')
    sys.exit(0)

sys.stdout.buffer.write(f'Next keyword: {keyword} | Category: {category}\n'.encode('utf-8'))
sys.stdout.buffer.write(b'Generating...\n')
sys.stdout.flush()

body = json.dumps({'keyword': keyword, 'category': category}).encode('utf-8')
import os
port = os.environ.get('PORT', '3001')
req = urllib.request.Request(f'http://localhost:{port}/api/generate-rag-post', data=body)
req.add_header('Content-Type', 'application/json; charset=utf-8')
req.add_header('x-admin-key', env.get('ADMIN_SECRET_KEY', ''))

try:
    resp = urllib.request.urlopen(req, timeout=300)
    result = json.loads(resp.read().decode('utf-8'))
    ri = result.get('ragInfo', {})
    p = result.get('post', {})
    content = p.get('content', '')

    partner = re.findall(r'href="(https://link\.coupang\.com[^"]+)"', content)
    search = re.findall(r'href="(https://www\.coupang\.com/np/search[^"]+)"', content)
    internal = re.findall(r'href="(/posts/[^"]+)"', content)
    has_disc = '\uc218\uc218\ub8cc' in content or '\ud30c\ud2b8\ub108\uc2a4' in content
    h2s = re.findall(r'<h2[^>]*>(.*?)</h2>', content)

    out = f"""
=== RESULT ===
Title: {p['title']}
Slug: {p['slug']}
Content: {len(content)} chars
H2 sections: {h2s}
Partner links: {len(partner)}
"""
    for l in partner[:3]:
        out += f"  {l[:80]}\n"
    out += f"Search links (fallback): {len(search)}\n"
    out += f"Internal links: {internal}\n"
    out += f"Disclosure: {has_disc}\n"
    out += f"Scraped: {ri.get('scrapedProductsIncluded',0)}, Fallback: {ri.get('coupangLinksIncluded',0)}\n"
    out += f"URL: https://kanomsoft.com/posts/{p['slug']}\n"
    sys.stdout.buffer.write(out.encode('utf-8'))

except urllib.error.HTTPError as e:
    body = e.read().decode('utf-8')
    sys.stdout.buffer.write(f'HTTP Error {e.code}: {body[:300]}\n'.encode('utf-8'))
except Exception as e:
    sys.stdout.buffer.write(f'Error: {e}\n'.encode('utf-8'))
