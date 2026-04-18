const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const thumbsDir = path.join(__dirname, '..', 'public', 'thumbnails');
if (!fs.existsSync(thumbsDir)) fs.mkdirSync(thumbsDir, { recursive: true });

// 3 green color schemes per category
const PALETTE = {
  life: {
    label: '태국생활',
    gradFrom: '#4ade80',
    gradTo: '#15803d',
    badgeText: '#15803d',
  },
  lang: {
    label: '태국어',
    gradFrom: '#2dd4bf',
    gradTo: '#0f766e',
    badgeText: '#0f766e',
  },
  biz: {
    label: '태국창업',
    gradFrom: '#a3e635',
    gradTo: '#4d7c0f',
    badgeText: '#4d7c0f',
  },
};

// All 17 posts: slug, category, lines (title split into 2), subtitle
const POSTS = [
  { slug: 'thai-life-massage-tip', cat: 'life', lines: ['태국 마사지 팁,', '얼마가 적당할까?'], sub: '8년 거주자가 정리한 현실적인 기준' },
  { slug: 'thai-life-dtv-visa', cat: 'life', lines: ['태국 장기 거주,', '비자 완전 정리'], sub: '한국인이 받을 수 있는 비자 종류' },
  { slug: 'thai-life-dtv-visa-review', cat: 'life', lines: ['DTV 비자,', '5일 만에 받기'], sub: '하노이에서 신청한 전 과정 후기' },

  { slug: 'thai-lang-opi-review', cat: 'lang', lines: ['태국어 OPI,', 'Advanced Mid 후기'], sub: '시험 준비부터 결과까지' },
  { slug: 'thai-lang-favorite-expressions', cat: 'lang', lines: ['내가 좋아하는', '태국어 표현 3가지'], sub: '단어를 쪼개보면 보이는 언어의 결' },
  { slug: 'thai-lang-tones', cat: 'lang', lines: ['태국어 성조,', '한국인의 최대 난관'], sub: '5성조를 제대로 구분하는 법' },
  { slug: 'thai-lang-vowels', cat: 'lang', lines: ['태국어 장모음', '단모음의 비밀'], sub: '한국인이 가장 놓치는 발음의 차이' },
  { slug: 'thai-lang-phi-nong', cat: 'lang', lines: ["'피(พี่)' 하나면", '다 통하는 호칭'], sub: '언니·오빠·형·누나와 비교해보기' },
  { slug: 'thai-lang-school', cat: 'lang', lines: ['태국어 공부,', '학원 vs 독학 vs 과외'], sub: '내가 학원을 추천하는 이유' },

  { slug: 'thai-business-1', cat: 'biz', lines: ['태국 법인 설립,', '2주면 가능할까?'], sub: '직접 해본 전 과정 정리' },
  { slug: 'thai-business-2', cat: 'biz', lines: ['태국 사무실', '구하기 3가지 방법'], sub: '오피스·무반·공유오피스 장단점' },
  { slug: 'thai-business-3', cat: 'biz', lines: ['방콕 오피스', '추천 빌딩 3곳'], sub: '실제 견적·위치·조건 비교' },
  { slug: 'thai-business-4', cat: 'biz', lines: ['태국 주택형 사무실', 'vs 공유 오피스'], sub: 'Suetrong·Hubba Ekamai 실사용 후기' },
  { slug: 'thai-business-5', cat: 'biz', lines: ['태국 법인 49% 룰,', '가장 위험한 함정'], sub: '명의 대여의 법적 리스크' },
  { slug: 'thai-business-6', cat: 'biz', lines: ['태국 법인 이름 짓기', 'MOA·AOA 작성'], sub: '서류 양식과 실제 풀이' },
  { slug: 'thai-business-7', cat: 'biz', lines: ['태국 법인 등록과', 'VAT 실전 절차'], sub: 'DBD 온라인 시스템 활용법' },
  { slug: 'thai-business-8', cat: 'biz', lines: ['태국 법인 설립 대행,', '한국계 vs 태국계'], sub: '실제 가격과 경험 솔직 후기' },
];

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function buildSvg({ lines, sub, cat }) {
  const p = PALETTE[cat];
  const titleFontSize = 78;
  // Main title block vertical placement
  const line1Y = 280;
  const line2Y = 380;
  const subY = 470;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${p.gradFrom}"/>
      <stop offset="100%" stop-color="${p.gradTo}"/>
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.25"/>
    </filter>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>

  <circle cx="1050" cy="100" r="180" fill="#ffffff" fill-opacity="0.08"/>
  <circle cx="1100" cy="560" r="120" fill="#ffffff" fill-opacity="0.1"/>
  <circle cx="100" cy="540" r="90" fill="#ffffff" fill-opacity="0.08"/>

  <g transform="translate(80, 90)">
    <rect width="180" height="56" rx="28" fill="#ffffff" fill-opacity="0.95"/>
    <text x="90" y="37" font-family="'Noto Sans KR', sans-serif" font-size="24" font-weight="700" fill="${p.badgeText}" text-anchor="middle">${escapeXml(p.label)}</text>
  </g>

  <g font-family="'Noto Sans KR', sans-serif" fill="#ffffff" stroke="#000000" stroke-width="6" paint-order="stroke" stroke-linejoin="round" filter="url(#shadow)">
    <text x="80" y="${line1Y}" font-size="${titleFontSize}" font-weight="800">${escapeXml(lines[0])}</text>
    <text x="80" y="${line2Y}" font-size="${titleFontSize}" font-weight="800">${escapeXml(lines[1])}</text>
  </g>

  <text x="80" y="${subY}" font-family="'Noto Sans KR', sans-serif" font-size="32" font-weight="500" fill="#ffffff" fill-opacity="0.95">${escapeXml(sub)}</text>

  <g transform="translate(80, 540)">
    <rect width="8" height="36" fill="#ffffff"/>
    <text x="24" y="28" font-family="'Noto Sans KR', sans-serif" font-size="26" font-weight="700" fill="#ffffff">태국라이프</text>
  </g>
</svg>
`;
}

async function main() {
  // Clean previous PNGs for these slugs (but leave the legacy massage-tip.svg/png alone if present)
  for (const post of POSTS) {
    const svg = buildSvg(post);
    const svgPath = path.join(thumbsDir, `${post.slug}.svg`);
    const pngPath = path.join(thumbsDir, `${post.slug}.png`);
    fs.writeFileSync(svgPath, svg);
    await sharp(Buffer.from(svg)).resize(1200, 630).png({ quality: 90 }).toFile(pngPath);
    console.log(`✓ ${post.slug}.png`);
  }
  console.log(`\nDone. Generated ${POSTS.length} thumbnails.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
