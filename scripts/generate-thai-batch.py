# -*- coding: utf-8 -*-
"""Generate multiple 태국어 learning posts from keywords_seed.csv."""
import urllib.request, json, sys, csv, time, os

env = {}
with open('.env.local', 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if '=' in line and not line.startswith('#'):
            k, v = line.split('=', 1)
            env[k] = v

port = os.environ.get('PORT', '3000')
count = int(sys.argv[1]) if len(sys.argv) > 1 else 10
generated = 0
failed = 0

for i in range(count):
    keyword = None
    category = None
    with open('docs/keywords_seed.csv', 'r', encoding='utf-8-sig') as f:
        reader = csv.reader(f)
        header = next(reader)
        for row in reader:
            posted = row[6].strip() if len(row) > 6 else ''
            if posted != 'Y':
                keyword = row[1].strip() if len(row) > 1 else None
                category = row[2].strip() if len(row) > 2 else '기타'
                break

    if not keyword:
        print('\n모든 키워드가 발행되었습니다!')
        break

    print(f'\n[{i+1}/{count}] 생성 중: {keyword} ({category})')

    body = json.dumps({'keyword': keyword, 'category': category}).encode('utf-8')
    req = urllib.request.Request(f'http://localhost:{{port}}/api/generate-lang-post', data=body)
    req.add_header('Content-Type', 'application/json; charset=utf-8')
    req.add_header('x-admin-key', env.get('ADMIN_SECRET_KEY', ''))

    try:
        resp = urllib.request.urlopen(req, timeout=300)
        result = json.loads(resp.read().decode('utf-8'))
        p = result.get('post', {})
        print(f'  OK: {p.get("title", "")} (slug: {p.get("slug", "")})')
        generated += 1
    except urllib.error.HTTPError as e:
        print(f'  FAIL: {e.code}')
        failed += 1
    except Exception as e:
        print(f'  ERROR: {e}')
        failed += 1

    time.sleep(2)

print(f'\n=== 완료: {generated}개 생성, {failed}개 실패 ===')
