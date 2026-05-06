# 메인페이지 이미지 자산 매핑 (Phase 5)

> 자동 생성·검토: `scripts/optimize-main-v1-images.mjs` RULES 기준  
> 입력: 디자인 패키지 `public/img/` (약 69개 / 23MB)  
> 출력: 동적 → Supabase `app` 버킷 `shop-main/` · 정적 → `public/images/main-v1/`

## 분류 요약

| 구분 | 개수(참고) | 저장 위치 |
|------|------------|-----------|
| 동적(WebP) | 39 | `_temp_dynamic/` → 업로드 후 `shop-main/{banners,heroes,...}` |
| 정적(SVG/PNG/WebP) | 30 | `ciseco-nextjs/public/images/main-v1/` |

## 코드에서 사용

```typescript
import { MAIN_PAGE_ASSETS } from '@/data/main-page-assets'
```

`NEXT_PUBLIC_SUPABASE_URL`이 있으면 해당 프로젝트 Storage URL을 쓰고, 없으면 `main-page-assets.ts`의 fallback 호스트(`vwlahtguyggrhvslabax.supabase.co`)를 사용합니다.

## next/image

- **정적**: `src`에 절대 경로 `/images/main-v1/...` (또는 import).
- **Supabase**: `src`에 `MAIN_PAGE_ASSETS`의 전체 HTTPS URL. `next.config.mjs`는 이미 `hostname: '**'` 패턴으로 외부 이미지 허용.
- **권장**: 히어로·배너는 `priority` / `sizes`로 LCP 최적화. placeholder 상품(`products/*`)은 Phase 4에서 API 썸네일로 교체 예정.

## 동적 자산 → Storage 경로 (Supabase)

| 섹션(추정) | 원본 패턴 | Storage 경로 (업로드 후) |
|-------------|-----------|---------------------------|
| 배너 | `banner-box.png` | `shop-main/banners/banner-box.webp` (max 1920px, q80) |
| 배너 | `banner-clock.png` | `shop-main/banners/banner-clock.webp` (q90) |
| 배너 | `banner-gift.png`, `mobile-banner-gift.png` | `shop-main/banners/*.webp` (q90) |
| 히어로 | `hero-1~4.png`, `hero-mo-1~4.png` | `shop-main/heroes/*.webp` (q85) |
| 베스트/그리드 | `best-1~10.png` | `shop-main/featured/best-N.webp` (q85) |
| 카드 샘플 | `figma-card-*.png` | `shop-main/featured/*.webp` (max 1200px, q85) |
| 퀵 카테고리 | `cate-*.png` | `shop-main/categories/*.webp` (q90) |
| 상품 placeholder | `product-1~4.png` | `shop-main/products/*.webp` (max 1200px, q85) |
| 장식 | `value-panel.png` | `shop-main/decorations/value-panel.webp` (q90) |

## 정적 자산 → public 경로

| 원본 패턴 | 출력 |
|-----------|------|
| `icon-*.svg` | `public/images/main-v1/icons/*.svg` (복사) |
| `icon-*.png` | `public/images/main-v1/icons/*.webp` (q90) |
| `logo.svg`, `logo-footer.svg` | `public/images/main-v1/*.svg` (복사) |
| `logo.png`, `logo-footer.png` | `public/images/main-v1/*.webp` (q90) |
| `flag-*.png` | `public/images/main-v1/flags/*.png` (복사) |

## 운영 절차

1. 로컬 `.env.local`에 `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` 설정 (커밋 금지).
2. `node scripts/optimize-main-v1-images.mjs '<디자인>/public/img' > optimization-report.json`
3. `node scripts/upload-main-v1-to-supabase.mjs > upload-report.json`
4. 업로드 후 샘플 URL에 `curl -I` 로 200 확인.

## 압축 결과 (로컬 1회 측정 예시)

- 원본 디렉터리: 약 **23MB**
- `_temp_dynamic` 합계: 약 **2.4MB** (WebP)
- `public/images/main-v1` 합계: 약 **196KB**

실제 수치는 입력 해상도·내용에 따라 달라질 수 있습니다.
