# -*- coding: utf-8 -*-
"""Generate multiple posts sequentially from baby_keywords CSV."""
import urllib.request, json, re, sys, csv, time

env = {}
with open('.env.local', 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if '=' in line and not line.startswith('#'):
            k, v = line.split('=', 1)
            env[k] = v

import os
port = os.environ.get('PORT', '3001')
count = int(sys.argv[1]) if len(sys.argv) > 1 else 10
generated = 0
failed = 0

for i in range(count):
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
        sys.stdout.buffer.write(b'\nAll keywords have been posted!\n')
        break

    sys.stdout.buffer.write(f'\n[{i+1}/{count}] Generating: {keyword} ({category})\n'.encode('utf-8'))
    sys.stdout.flush()

    body = json.dumps({'keyword': keyword, 'category': category}).encode('utf-8')
    req = urllib.request.Request(f'http://localhost:{port}/api/generate-rag-post', data=body)
    req.add_header('Content-Type', 'application/json; charset=utf-8')
    req.add_header('x-admin-key', env.get('ADMIN_SECRET_KEY', ''))

    try:
        resp = urllib.request.urlopen(req, timeout=300)
        result = json.loads(resp.read().decode('utf-8'))
        p = result.get('post', {})
        ri = result.get('ragInfo', {})
        content = p.get('content', '')

        partner = re.findall(r'href="(https://link\.coupang\.com[^"]+)"', content)
        search = re.findall(r'href="(https://www\.coupang\.com/np/search[^"]+)"', content)

        out = f'  OK: {p.get("title","?")} | {len(content)} chars | search_links={len(search)} | partner_links={len(partner)}\n'
        out += f'  URL: https://kanomsoft.com/posts/{p.get("slug","?")}\n'
        sys.stdout.buffer.write(out.encode('utf-8'))
        generated += 1

    except urllib.error.HTTPError as e:
        body_text = e.read().decode('utf-8')
        sys.stdout.buffer.write(f'  FAIL (HTTP {e.code}): {body_text[:200]}\n'.encode('utf-8'))
        failed += 1

    except Exception as e:
        sys.stdout.buffer.write(f'  FAIL: {e}\n'.encode('utf-8'))
        failed += 1

    sys.stdout.flush()
    # Brief pause between generations to avoid rate limits
    if i < count - 1:
        time.sleep(3)

sys.stdout.buffer.write(f'\n=== DONE: {generated} generated, {failed} failed ===\n'.encode('utf-8'))
