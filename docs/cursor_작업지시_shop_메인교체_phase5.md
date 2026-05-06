# [Cursor 작업지시] 쇼핑몰 메인 교체 — Phase 5: 이미지 자산 최적화 + Supabase Storage 업로드

작성일: 2026-05-06 | 기획 창 → 프론트엔드 창
대상 레포: `github.com/kn541/kn541-shop` (Public, 이 레포)
**의존성: 없음 — Phase 1/2/3과 병렬 실행 가능**
환경: macOS

---

## 0. 배경

새 메인페이지 디자인 이미지 자산 69개(약 23MB)를 처리합니다.

### 분류 원칙 (확정)

| 분류 | 위치 | 이유 |
|---|---|---|
| **동적 콘텐츠 이미지** | Supabase Storage `app` 버킷 `shop-main/` 폴더 | 어드민이 교체 가능, 재배포 없이 갱신, CDN |
| **정적 UI 자산** (SVG 아이콘/로고, flag) | `ciseco-nextjs/public/images/main-v1/` | 디자인 시스템 자산, next/image 정적 최적화 |

### 기존 패턴 확인 (2026-05-06 분석)
- Supabase 프로젝트: `vwlahtguyggrhvslabax` (Seoul `ap-northeast-2`)
- `app` 버킷 (Public)에 이미 `logomain.jpg`, `app-main.jpeg` 존재 — 동일 버킷의 `shop-main/` 하위 폴더로 정리

---

## 1. 입력 자료

디자인 자료 위치 (Mac 로컬):
`/Users/kn541/Desktop/kn541/디자인/외주/public/img/`

총 69개, 약 23MB.

---

## 2. 분류 매트릭스

### 그룹 A: Supabase Storage 업로드 (동적 콘텐츠)

| 그룹 | 파일 패턴 | Storage 경로 | 처리 |
|---|---|---|---|
| 배너 | `banner-box.png` | `app/shop-main/banners/banner-box.webp` | 1920px + WebP q80 |
| 배너 | `banner-gift.png`, `mobile-banner-gift.png` | `app/shop-main/banners/` | WebP q90 |
| 히어로 | `hero-1~4.png`, `hero-mo-1~4.png` | `app/shop-main/heroes/` | WebP q85 |
| 추천/인기 | `best-1~10.png` | `app/shop-main/featured/` | WebP q85 |
| 추천/인기 | `figma-card-rice.png`, `figma-card-shampoo.png` | `app/shop-main/featured/` | 1200px + WebP q85 |
| 카테고리 | `cate-best.png`, `cate-kn541.png`, `cate-mall.png`, `cate-new.png`, `cate-office.png`, `cate-reserve.png`, `cate-value.png` | `app/shop-main/categories/` | WebP q90 |
| 상품 (placeholder) | `product-1~4.png` | `app/shop-main/products/` | 1200px + WebP q85 |
| 장식 | `value-panel.png` | `app/shop-main/decorations/` | WebP q90 |

**주의**: `product-1~4.png`는 디자인 자료의 placeholder. 실제 상품 이미지는 백엔드 `products` 테이블의 `image_url` 필드. 메인페이지 본문 작업(Phase 4)에서 placeholder를 백엔드 API 응답으로 대체.

### 그룹 B: public/ 정적 자산

| 그룹 | 파일 패턴 | repo 경로 | 처리 |
|---|---|---|---|
| 아이콘 SVG | `icon-*.svg` | `ciseco-nextjs/public/images/main-v1/icons/` | 그대로 복사 |
| 아이콘 PNG | `icon-*.png` | `ciseco-nextjs/public/images/main-v1/icons/` | WebP q90 |
| 로고 SVG | `logo.svg`, `logo-footer.svg` | `ciseco-nextjs/public/images/main-v1/` | 그대로 복사 (Phase 3 헤더에서 활용) |
| 로고 PNG | `logo-footer.png` | `ciseco-nextjs/public/images/main-v1/` | WebP q90 |
| 국기 | `flag-cn.png`, `flag-en.png`, `flag-ko.png` | `ciseco-nextjs/public/images/main-v1/flags/` | 그대로 복사 (Phase 3 LangSwitcher 활용) |

---

## 3. 작업 흐름

### 3-1. 환경 변수 / 상수 파일 생성

**대상 파일**: `ciseco-nextjs/src/data/main-page-assets.ts` (신규)

```typescript
// 메인페이지 이미지 자산 URL 매핑
// 동적 자산은 Supabase Storage URL, 정적 자산은 public/ 경로
//
// TODO 향후: 어드민에서 교체 가능한 이미지는 system_codes 또는 main_page_assets 테이블로 이전

const STORAGE_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/app/shop-main`
  : 'https://vwlahtguyggrhvslabax.supabase.co/storage/v1/object/public/app/shop-main'

export const MAIN_PAGE_ASSETS = {
  // 동적 — Supabase Storage
  banners: {
    box: `${STORAGE_BASE}/banners/banner-box.webp`,
    gift: `${STORAGE_BASE}/banners/banner-gift.webp`,
    mobileGift: `${STORAGE_BASE}/banners/mobile-banner-gift.webp`,
  },
  heroes: {
    pc: [1, 2, 3, 4].map(i => `${STORAGE_BASE}/heroes/hero-${i}.webp`),
    mobile: [1, 2, 3, 4].map(i => `${STORAGE_BASE}/heroes/hero-mo-${i}.webp`),
  },
  featured: {
    best: Array.from({ length: 10 }, (_, i) => `${STORAGE_BASE}/featured/best-${i + 1}.webp`),
    figma: {
      rice: `${STORAGE_BASE}/featured/figma-card-rice.webp`,
      shampoo: `${STORAGE_BASE}/featured/figma-card-shampoo.webp`,
    },
  },
  categories: {
    best: `${STORAGE_BASE}/categories/cate-best.webp`,
    kn541: `${STORAGE_BASE}/categories/cate-kn541.webp`,
    mall: `${STORAGE_BASE}/categories/cate-mall.webp`,
    new: `${STORAGE_BASE}/categories/cate-new.webp`,
    office: `${STORAGE_BASE}/categories/cate-office.webp`,
    reserve: `${STORAGE_BASE}/categories/cate-reserve.webp`,
    value: `${STORAGE_BASE}/categories/cate-value.webp`,
  },
  products: [1, 2, 3, 4].map(i => `${STORAGE_BASE}/products/product-${i}.webp`),
  decorations: {
    valuePanel: `${STORAGE_BASE}/decorations/value-panel.webp`,
  },

  // 정적 — public/
  icons: {
    base: '/images/main-v1/icons',
  },
  logos: {
    main: '/images/main-v1/logo.svg',
    footer: '/images/main-v1/logo-footer.svg',
  },
  flags: {
    ko: '/images/main-v1/flags/flag-ko.png',
    en: '/images/main-v1/flags/flag-en.png',
    cn: '/images/main-v1/flags/flag-cn.png',
  },
} as const
```

`next.config.js`의 `images.remotePatterns`에 Supabase 도메인 추가 확인:
```javascript
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'vwlahtguyggrhvslabax.supabase.co' },
    // ... 기존 패턴
  ],
}
```

기존 설정에 이미 있으면 변경 X.

### 3-2. WebP 변환 스크립트

`ciseco-nextjs/scripts/optimize-main-v1-images.mjs` (신규):

```javascript
import sharp from 'sharp'
import { readdir, mkdir, copyFile } from 'fs/promises'
import { join, parse } from 'path'

const INPUT = process.argv[2]
const OUT_DYNAMIC = '_temp_dynamic'  // Supabase 업로드용 임시 폴더
const OUT_STATIC = 'public/images/main-v1'  // public/ 정적 자산

const RULES = [
  // === 동적 (Supabase) ===
  { match: /^banner-box\.png$/, type: 'dynamic', subdir: 'banners', maxWidth: 1920, quality: 80 },
  { match: /^(banner-gift|mobile-banner-gift)\.png$/, type: 'dynamic', subdir: 'banners', quality: 90 },
  { match: /^hero(-mo)?-\d+\.png$/, type: 'dynamic', subdir: 'heroes', quality: 85 },
  { match: /^best-\d+\.png$/, type: 'dynamic', subdir: 'featured', quality: 85 },
  { match: /^figma-card-\w+\.png$/, type: 'dynamic', subdir: 'featured', maxWidth: 1200, quality: 85 },
  { match: /^cate-\w+\.png$/, type: 'dynamic', subdir: 'categories', quality: 90 },
  { match: /^product-\d+\.png$/, type: 'dynamic', subdir: 'products', maxWidth: 1200, quality: 85 },
  { match: /^value-panel\.png$/, type: 'dynamic', subdir: 'decorations', quality: 90 },
  // === 정적 (public/) ===
  { match: /^icon-.+\.svg$/, type: 'static', subdir: 'icons', copyOnly: true },
  { match: /^icon-.+\.png$/, type: 'static', subdir: 'icons', quality: 90 },
  { match: /^logo(-footer)?\.svg$/, type: 'static', subdir: '', copyOnly: true },
  { match: /^logo-footer\.png$/, type: 'static', subdir: '', quality: 90 },
  { match: /^flag-\w+\.png$/, type: 'static', subdir: 'flags', copyOnly: true },
]

const baseFor = (type) => type === 'dynamic' ? OUT_DYNAMIC : OUT_STATIC

const files = await readdir(INPUT)
const report = []

for (const file of files) {
  const rule = RULES.find(r => r.match.test(file))
  if (!rule) { console.log('SKIP:', file); continue }

  const { name } = parse(file)
  const inputPath = join(INPUT, file)
  const outDir = join(baseFor(rule.type), rule.subdir)
  await mkdir(outDir, { recursive: true })

  if (rule.copyOnly) {
    const outPath = join(outDir, file)
    await copyFile(inputPath, outPath)
    report.push({ in: file, out: outPath, type: rule.type, action: 'copy' })
    continue
  }

  const outPath = join(outDir, `${name}.webp`)
  let pipeline = sharp(inputPath)
  if (rule.maxWidth) pipeline = pipeline.resize(rule.maxWidth, null, { withoutEnlargement: true })
  await pipeline.webp({ quality: rule.quality }).toFile(outPath)
  report.push({ in: file, out: outPath, type: rule.type, action: 'webp', q: rule.quality })
}

console.log(JSON.stringify(report, null, 2))
```

실행:
```bash
cd ciseco-nextjs
npm install --save-dev sharp
node scripts/optimize-main-v1-images.mjs '/Users/kn541/Desktop/kn541/디자인/외주/public/img' > optimization-report.json
```

결과:
- `_temp_dynamic/banners/`, `_temp_dynamic/heroes/`, ... (Supabase 업로드 대기)
- `public/images/main-v1/icons/`, `public/images/main-v1/flags/`, ... (커밋 대상)

### 3-3. Supabase Storage 업로드

**도구**: Supabase CLI 또는 일회성 Node 스크립트

**방법 A — Supabase CLI** (Mac):
```bash
brew install supabase/tap/supabase
supabase login
# 또는 access token 환경변수 설정

# 업로드 (서비스 키 또는 publishable 키 필요)
# .env.local의 SUPABASE_SERVICE_ROLE_KEY 사용 (CLAUDE.md 환경변수 규정 준수)

# 일괄 업로드는 CLI에 직접 명령이 없으므로 방법 B 권장
```

**방법 B — 일회성 Node 스크립트 (권장)**:

`ciseco-nextjs/scripts/upload-main-v1-to-supabase.mjs` (신규, 일회성):

```javascript
import { createClient } from '@supabase/supabase-js'
import { readdir } from 'fs/promises'
import { readFile } from 'fs/promises'
import { join, relative } from 'path'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY  // .env.local

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('환경변수 누락: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
const ROOT = '_temp_dynamic'
const BUCKET = 'app'
const PREFIX = 'shop-main'

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(path)
    else yield path
  }
}

const report = []
for await (const localPath of walk(ROOT)) {
  const relPath = relative(ROOT, localPath)         // banners/banner-box.webp
  const remotePath = `${PREFIX}/${relPath}`           // shop-main/banners/banner-box.webp
  const buf = await readFile(localPath)

  const { error } = await supabase.storage.from(BUCKET).upload(remotePath, buf, {
    contentType: localPath.endsWith('.webp') ? 'image/webp' : 'image/png',
    upsert: true,
  })

  if (error) {
    console.error('FAIL:', remotePath, error.message)
    report.push({ remotePath, status: 'fail', error: error.message })
  } else {
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${remotePath}`
    console.log('OK:', publicUrl)
    report.push({ remotePath, status: 'ok', url: publicUrl })
  }
}

console.log(JSON.stringify(report, null, 2))
```

실행:
```bash
node scripts/upload-main-v1-to-supabase.mjs > upload-report.json
```

업로드 완료 후 `_temp_dynamic/` 폴더 삭제 (gitignore도 가능).

### 3-4. 매핑 문서 작성

**경로**: `kn541-shop/docs/design/main-page-images-map.md`

내용:
- 각 이미지의 원본 파일명, 위치(Supabase URL 또는 public 경로), 사용 섹션(Phase 4 추정)
- next/image 사용 가이드

### 3-5. 검증

- `_temp_dynamic/` 폴더 크기와 `public/images/main-v1/` 폴더 크기 분리 보고
- Supabase Storage 업로드 성공 건수 / 실패 건수
- 무작위 5건 — Supabase URL 직접 fetch 시 200 OK 확인:
  ```bash
  curl -I "https://vwlahtguyggrhvslabax.supabase.co/storage/v1/object/public/app/shop-main/banners/banner-box.webp"
  ```
- `npm run build` 정상 (이미지 미참조 상태이므로 영향 없어야 함)

---

## 4. 변경 파일 요약

### 신규 (4개)
- `ciseco-nextjs/src/data/main-page-assets.ts` — URL 상수
- `ciseco-nextjs/scripts/optimize-main-v1-images.mjs` — 변환 스크립트
- `ciseco-nextjs/scripts/upload-main-v1-to-supabase.mjs` — 업로드 스크립트
- `kn541-shop/docs/design/main-page-images-map.md` — 매핑 문서

### 추가 (public/ 자산)
- `ciseco-nextjs/public/images/main-v1/icons/icon-*.svg|webp`
- `ciseco-nextjs/public/images/main-v1/flags/flag-*.png`
- `ciseco-nextjs/public/images/main-v1/logo*.svg|webp`

### .gitignore 추가
- `ciseco-nextjs/_temp_dynamic/` (Supabase 업로드 임시 폴더)
- `ciseco-nextjs/optimization-report.json`
- `ciseco-nextjs/upload-report.json`

### 수정 (필요 시)
- `ciseco-nextjs/next.config.js` — `images.remotePatterns`에 Supabase 도메인 (이미 있으면 스킵)

---

## 5. 완료 보고 (창님께 직접)

```
[Phase 5 완료 보고]

[입력]
원본: 69개 / 약 23MB

[그룹 A — Supabase Storage]
✅ app/shop-main/ 하위 6개 폴더에 업로드
   - banners: N개
   - heroes: N개
   - featured: N개
   - categories: N개
   - products: N개 (placeholder)
   - decorations: N개
✅ 업로드 성공 N건 / 실패 N건
✅ 무작위 5건 URL 200 OK

[그룹 B — public/ 정적]
✅ public/images/main-v1/ 하위
   - icons: N개 (svg+webp)
   - flags: 3개
   - logo*.svg, logo-footer.webp

[총 압축률]
원본 23MB → 동적 YMB (Supabase) + 정적 ZMB (repo)

[산출물]
✅ src/data/main-page-assets.ts — URL 상수 매핑
✅ scripts/optimize-main-v1-images.mjs — 변환 스크립트
✅ scripts/upload-main-v1-to-supabase.mjs — 일회성 업로드 스크립트
✅ docs/design/main-page-images-map.md — 매핑 문서
✅ .gitignore 갱신 (_temp_dynamic, *-report.json)

[빌드/배포]
빌드: ✅ npm run build 정상
커밋: [SHA]

다음: Phase 4 (메인 본문) 작업 시 MAIN_PAGE_ASSETS 참조
```

---

## 6. 주의사항

- **Supabase Service Role Key** — `.env.local`에서만 사용 (CLAUDE.md 환경변수 규정). 절대 커밋하지 않음. `upload-main-v1-to-supabase.mjs`는 `process.env`로만 키 접근.
- **버킷 정책 확인** — `app` 버킷이 Public이지만 INSERT 권한이 service role에만 부여됐는지 확인. 만약 서비스 키 없으면 어드민이 수동 업로드 또는 별도 작업 요청.
- **재실행 안전성** — `upload-main-v1-to-supabase.mjs`는 `upsert: true`로 멱등. 실패 후 재실행 가능.
- `_temp_dynamic/` 폴더는 업로드 후 삭제 권장 (또는 .gitignore로 커밋 차단).
- `MAIN_PAGE_ASSETS` 상수의 Supabase URL — 환경변수 `NEXT_PUBLIC_SUPABASE_URL` 우선, fallback으로 하드코딩 URL (서울 리전 이전 후 URL 안정).
- **Phase 4 진행 시 사용 섹션 확정** — 매핑 문서의 "사용 섹션" 컬럼은 추정값. Phase 4에서 본문 컴포넌트 작업하면서 정확히 매칭.
- **product-1~4.png는 placeholder** — 실 상품 이미지는 백엔드 `products.image_url`. Phase 4에서 백엔드 응답으로 대체.

---

*작성: 기획 창 | 2026-05-06 | github.com/kn541/kn541-shop*
*v2 갱신: 동적/정적 분리, Supabase Storage 통합*
