# [Cursor 작업지시] 쇼핑몰 메인 교체 — Phase 5: 이미지 자산 최적화

작성일: 2026-05-06 | 기획 창 → 프론트엔드 창
대상 레포: `github.com/kn541/kn541-shop` (Public, 이 레포)
작업 폴더: `ciseco-nextjs/public/images/main-v1/` (신규 디렉토리)
**의존성: 없음 — Phase 1/2/3과 병렬 실행 가능**
환경: macOS

---

## 0. 배경

새 메인페이지 디자인의 이미지 자산 69개(약 23MB)를 최적화하여 프로젝트에 통합합니다. 단일 `banner-box.png`가 9.8MB로 가장 큼 — LCP 타격 방지를 위해 필수 작업.

본 단계는 다른 Phase와 의존성 없음, 동시 실행으로 시간 절약.

---

## 1. 입력 자료

디자인 자료 위치 (Mac 로컬 — Phase 1/2 보고에서 확인됨):
`/Users/kn541/Desktop/kn541/디자인/외주/public/img/`

총 69개, 약 23MB.

### 큰 이미지 (>500KB) — 우선 최적화 대상
- `banner-box.png` 9.8MB
- `product-1.png` 1.5MB / `product-2.png` 1.6MB / `product-3.png` 2.1MB / `product-4.png` 1.4MB
- `figma-card-rice.png` 2.1MB / `figma-card-shampoo.png` 1.5MB

### 중간 (50-500KB)
- `best-1.png` ~ `best-10.png` (10개)
- `hero-1.png` ~ `hero-4.png`, `hero-mo-1.png` ~ `hero-mo-4.png` (8개)
- `cate-best.png`, `cate-kn541.png`, `cate-mall.png`, `cate-new.png`, `cate-office.png`, `cate-reserve.png`, `cate-value.png` (7개)
- `banner-gift.png`, `mobile-banner-gift.png`, `value-panel.png`, `logo-footer.png`

### 작은 (<50KB)
- `icon-*.png` / `icon-*.svg` (다수)
- `flag-cn.png`, `flag-en.png`, `flag-ko.png`
- `logo.svg`, `logo-footer.svg`

---

## 2. 최적화 전략

| 카테고리 | 처리 방식 |
|---|---|
| `banner-box.png` | 최대 폭 1920px + WebP (품질 80) |
| `product-*.png`, `figma-card-*.png` | 최대 폭 1200px + WebP (품질 85) |
| `best-*.png`, `hero-*.png`, `hero-mo-*.png` | 원본 크기 유지 + WebP (품질 85) |
| `cate-*.png`, `banner-gift*.png`, `value-panel.png`, `logo-footer.png` | WebP 변환만 (품질 90) |
| `icon-*.png` | WebP 변환 (품질 90) |
| `icon-*.svg`, `logo*.svg` | 그대로 복사 |
| `flag-*.png` | Phase 5에서는 그대로 복사 (base64 인라인 분리는 Phase 3 헤더 작업에서 처리) |

---

## 3. 출력 위치

`ciseco-nextjs/public/images/main-v1/` 디렉토리 생성. 원본 파일명 유지하되 확장자만 변경:
- `banner-box.png` → `banner-box.webp`
- `product-1.png` → `product-1.webp`
- `icon-cart.svg` → `icon-cart.svg` (그대로)
- `icon-cart.png` → `icon-cart.webp`

---

## 4. 도구 (macOS)

`sharp` 일회성 스크립트 (권장):

```bash
cd ~/path/to/kn541-shop/ciseco-nextjs
npm install --save-dev sharp
```

Cursor가 `scripts/optimize-main-v1-images.mjs` 작성:

```javascript
import sharp from 'sharp'
import { readdir, mkdir, copyFile } from 'fs/promises'
import { join, parse } from 'path'

const INPUT = process.argv[2]   // 디자인 zip 압축해제 후 public/img/ 경로
const OUTPUT = 'public/images/main-v1'

const RULES = [
  { match: /^banner-box\.png$/, maxWidth: 1920, quality: 80 },
  { match: /^(product-\d+|figma-card-\w+)\.png$/, maxWidth: 1200, quality: 85 },
  { match: /^(best-\d+|hero(-mo)?-\d+)\.png$/, quality: 85 },
  { match: /^(cate-\w+|banner-gift|mobile-banner-gift|value-panel|logo-footer)\.png$/, quality: 90 },
  { match: /^icon-.+\.png$/, quality: 90 },
  { match: /\.svg$/, copyOnly: true },
  { match: /^flag-.+\.png$/, copyOnly: true },
]

await mkdir(OUTPUT, { recursive: true })
const files = await readdir(INPUT)
const report = []

for (const file of files) {
  const rule = RULES.find(r => r.match.test(file))
  if (!rule) { console.log('스킵:', file); continue }

  const { name } = parse(file)
  const inputPath = join(INPUT, file)

  if (rule.copyOnly) {
    await copyFile(inputPath, join(OUTPUT, file))
    report.push({ in: file, out: file, action: 'copy' })
    continue
  }

  const outputPath = join(OUTPUT, `${name}.webp`)
  let pipeline = sharp(inputPath)
  if (rule.maxWidth) pipeline = pipeline.resize(rule.maxWidth, null, { withoutEnlargement: true })
  await pipeline.webp({ quality: rule.quality }).toFile(outputPath)
  report.push({ in: file, out: `${name}.webp`, action: 'webp', q: rule.quality })
}

console.log(JSON.stringify(report, null, 2))
```

실행:
```bash
node scripts/optimize-main-v1-images.mjs '/Users/kn541/Desktop/kn541/디자인/외주/public/img' > optimization-report.json
```

---

## 5. 매핑 문서 작성

**경로**: `kn541-shop/docs/design/main-page-images-map.md`

**형식**:
```markdown
# 메인페이지 이미지 매핑 (Phase 4 참조용)

생성일: 2026-05-06
원본 위치: /Users/kn541/Desktop/kn541/디자인/외주/public/img/
출력 폴더: ciseco-nextjs/public/images/main-v1/
총 압축률: XX% (23MB → YYMB)

## 변환 매핑표

| 원본 | 신규 | 원본 크기 | 신규 크기 | 사용 섹션(예상) |
|---|---|---|---|---|
| banner-box.png | banner-box.webp | 9.8MB | ~250KB | Promo 배너 (.promo-strip-pc) |
| product-1.png | product-1.webp | 1.5MB | ~80KB | 상품 카드 |
| ...

## next/image 사용 가이드 (Phase 4)

```tsx
import Image from 'next/image'

<Image
  src="/images/main-v1/banner-box.webp"
  alt="배너"
  width={1920}
  height={1080}
  priority
  sizes="(max-width: 768px) 100vw, 1280px"
/>
```

- hero/배너: `priority` + 적절한 `sizes`
- 상품 카드: `loading="lazy"` (기본) + `sizes="(max-width: 768px) 50vw, 280px"`
- 작은 아이콘: `width`/`height` 명시
```

**섹션 매핑은 추정으로**: `/Users/kn541/Desktop/kn541/디자인/외주/public/index.html` grep으로 src 경로 찾아 매칭. Phase 4 진행 시 정확히 맞출 수 있음.

---

## 6. 검증

- 출력 폴더 크기: 23MB → **5MB 이하** 목표
- 변환 실패 0건
- 매핑 문서 모든 항목 채워짐 (사용 섹션 항목은 추정 가능)
- `npm run build` 정상 — 이미지 미참조 상태이므로 빌드에 영향 없어야 함
- 결과 폴더 `ls -lh` 출력 캡처

---

## 7. 완료 보고 (창님께 직접)

```
[Phase 5 완료 보고]

✅ 입력: 69개 / 약 23MB
✅ 출력: N개 / 약 YMB (압축률 XX% ↓)
✅ WebP 변환: N개
✅ SVG/그대로 복사: N개
✅ 매핑 문서: kn541-shop/docs/design/main-page-images-map.md

상위 절감 5건:
1. banner-box.png 9.8MB → banner-box.webp XKB (XX% ↓)
2. ...

커밋: [SHA]
빌드: ✅ npm run build 정상

다음: Phase 4 (메인 본문)에서 이 이미지들 참조 예정
```

---

## 8. 주의사항

- 출력 폴더 `ciseco-nextjs/public/images/main-v1/` 외에 다른 곳 건드리지 않음
- `optimization-report.json`은 임시 파일 — `.gitignore`에 추가하거나 작업 후 삭제
- 스크립트 `scripts/optimize-main-v1-images.mjs`는 향후 재사용 가능하므로 commit 권장
- **Phase 4에서 이 이미지들을 참조하기 전에는 어떤 컴포넌트도 수정 X**

---

*작성: 기획 창 | 2026-05-06 | github.com/kn541/kn541-shop*
