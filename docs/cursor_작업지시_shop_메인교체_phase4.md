# [Cursor 작업지시] 쇼핑몰 메인 교체 — Phase 4: 메인페이지 본문

작성일: 2026-05-06 | 기획 창 → 프론트엔드 창
대상 레포: `github.com/kn541/kn541-shop` (Public, 이 레포)
작업 폴더: `ciseco-nextjs/`
**의존성**: Phase 1 (Tailwind 토큰) ✅ / Phase 5 (이미지 자산 + main-page-assets.ts) ✅
**선행 권장**: Phase 3 (헤더) — 본문의 좌측 6개 정렬탭 라우트가 헤더의 HomeTabNav와 매칭됨. Phase 3이 미완료여도 Phase 4 진행 가능하며, 라우트 placeholder는 추후 정리.
환경: macOS

---

## 0. 배경

새 디자인의 메인페이지 본문을 구현합니다. 헤더(Phase 3)·푸터(Phase 2)·이미지 자산(Phase 5)은 이미 적용된 상태에서 본문만 교체.

기존 Ciseco 템플릿의 `(home)/page.tsx` 콘텐츠는 폐기하고 새 디자인으로 재작성.

### 사용 가능한 자원 (이미 준비됨)
- 이미지: `MAIN_PAGE_ASSETS` (`src/data/main-page-assets.ts`) — 모든 동적 이미지 URL
- 색상: `kn541-*` Tailwind 토큰 (`--color-kn541-green`, `--color-kn541-black` 등)
- 가격: `formatPrice()` 함수 — `88,888원` 형식
- 디자인 자료: `/Users/kn541/Desktop/kn541/디자인/외주/public/`

---

## 1. 새 디자인 본문 구조 (참조)

`public/index.html` 본문 부분 정독 필수 (대략 180~720행). 주요 섹션:

| 순서 | 섹션 | 주요 자원 | 데이터 출처 |
|---|---|---|---|
| 1 | 히어로 슬라이더 | `MAIN_PAGE_ASSETS.heroes.pc/mobile` | 정적 이미지 (4슬라이드) |
| 2 | Welcome 인사 + 시계 배너 | `MAIN_PAGE_ASSETS.banners.clock` | 정적 |
| 3 | 큰 프로모 배너 | `MAIN_PAGE_ASSETS.banners.box` | 정적 |
| 4 | 카테고리 7타일 | `MAIN_PAGE_ASSETS.categories.*` | 정적 + 라우팅 |
| 5 | Figma 카드 (5종) | `MAIN_PAGE_ASSETS.featured.figma.*` | 정적 |
| 6 | 추천상품 4개 | `MAIN_PAGE_ASSETS.products` (placeholder) | **백엔드 API** |
| 7 | Best 상품 10개 | `MAIN_PAGE_ASSETS.featured.best` (placeholder) | **백엔드 API** |
| 8 | 선물/이벤트 배너 | `MAIN_PAGE_ASSETS.banners.gift / mobileGift` | 정적 |
| 9 | Value 패널 | `MAIN_PAGE_ASSETS.decorations.valuePanel` | 정적 |

**※ 정확한 섹션 순서/구성은 `public/index.html` 정독 후 결정**. 위 표는 가이드.

### Cart Drawer (별도 컴포넌트)
디자인의 `.cart-drawer` 또는 우측 슬라이딩 패널 — 헤더의 카트 버튼 클릭 시 표출. Phase 3에서 CartBtn은 만들었으니 본문 작업과 함께 Drawer 구현.

---

## 2. 작업 시작 전 — Cursor가 분석하고 보고할 사항

작업 시작 전 다음 4건 분석 후 보고. 불확실 시 멈추고 창님 결정 받기.

### 2-A. 메인페이지 라우트 확인
- 현재 메인 라우트: `ciseco-nextjs/src/app/[locale]/(shop)/(home)/page.tsx`인지 다른 위치인지
- locale별 라우팅 구조 확인 (`/ko`, `/en`, `/zh`)

### 2-B. 백엔드 상품 API
- Swagger: https://kn541-production.up.railway.app/docs
- 다음 endpoint 존재 여부 확인:
  - `GET /products?sort=best&limit=10` → Best 상품 10개
  - `GET /products?sort=recommended&limit=4` → 추천상품 4개
  - `GET /products?category={id}` → 카테고리별 상품
  - `GET /categories` → 카테고리 목록
- 응답 구조 확인 (id, name, price, image_url, sale_price, sold_count 등)
- 미존재 시 — placeholder(MAIN_PAGE_ASSETS.products / .featured.best)로 일단 렌더 + 보고

### 2-C. 카테고리 7타일 라우트 매핑
디자인 7개 카테고리 타일과 백엔드 `/categories` 응답 매칭:
- best, kn541, mall, new, office, reserve, value
- 일치/부분일치/미존재 분류

### 2-D. 다국어 처리 범위
- 메인 본문 텍스트(섹션 제목, 버튼 라벨 등)의 i18n 키 추가
- 상품 이름 — 백엔드 응답이 다국어 지원하는지 확인

---

## 3. 작업 항목

### 3-1. 디자인 정독 (필수 첫 단계)
- `public/index.html` 본문 부분
- `public/css/style.css` 본문 관련 클래스 (`.hero-section`, `.product-card`, `.category-section`, `.best-section`, `.cart-drawer` 등)
- `public/js/main.js` 본문 인터랙션 (slider, 좋아요 토글, 카트 추가 등)

### 3-2. 신규 섹션 컴포넌트

`ciseco-nextjs/src/components/main-page/` 폴더 신설:

| 파일 | 역할 |
|---|---|
| `HeroSlider.tsx` | 히어로 슬라이더 (4슬라이드, swiper 또는 자체 구현) |
| `WelcomeBanner.tsx` | Welcome 인사 + 시계 배너 |
| `PromoBanner.tsx` | 큰 프로모 배너 (banner-box) |
| `CategoryTiles.tsx` | 카테고리 7타일 |
| `FigmaCards.tsx` | Figma 카드 5종 |
| `RecommendedProducts.tsx` | 추천상품 4개 (백엔드 API) |
| `BestProducts.tsx` | Best 상품 10개 (백엔드 API) |
| `GiftBanner.tsx` | 선물/이벤트 배너 |
| `ValuePanel.tsx` | Value 패널 |
| `ProductCard.tsx` | 재사용 상품 카드 (다른 섹션에서도 사용) |

### 3-3. 메인페이지 재작성

`ciseco-nextjs/src/app/[locale]/(shop)/(home)/page.tsx` (실제 경로는 §2-A에서 확인):
- 기존 Ciseco 콘텐츠 폐기
- 위 섹션 컴포넌트들을 순서대로 배치
- Server Component 우선, 인터랙션 필요한 부분만 Client Component로 분리
- 백엔드 API 호출은 Server Component (Next.js 16 fetch + revalidate)

### 3-4. 백엔드 API 연동

**원칙**: CLAUDE.md — 모든 데이터는 FastAPI 경유. Supabase 직접 호출 금지.

```typescript
// 예시 — RecommendedProducts.tsx (Server Component)
async function getRecommendedProducts() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?sort=recommended&limit=4`, {
    next: { revalidate: 60 }, // 1분 캐싱
  })
  if (!res.ok) return []
  return res.json()
}
```

응답 구조에 따라 `ProductCard`에 적절히 매핑.

### 3-5. Cart Drawer 컴포넌트

`ciseco-nextjs/src/components/CartDrawer.tsx` (신규):
- 헤더의 CartBtn 클릭 시 우측에서 슬라이딩
- 장바구니 항목 목록 + 합계 + 결제하기 버튼
- 디자인 `.cart-drawer` 스타일 참조
- 기존 장바구니 상태 관리 로직 활용 (예: `aside-sidebar-cart.tsx` — Phase 1 보고에서 발견된 USD 가격 표기 사용처)
- **이 컴포넌트가 Phase 1 직접포맷 56건 중 일부를 정리** — `aside-sidebar-cart.tsx`의 `$` 표기 → `formatPrice` 호출로 교체

### 3-6. 카테고리 7타일 — Phase 3 의존성 처리

Phase 3 완료 시 — HomeTabNav 라우트와 일관된 라우트 사용
Phase 3 미완료 시 — placeholder `#` 또는 `/categories/{slug}` 형태 임시 사용

### 3-7. 가격 표기 56건 정리 (이번 단계에서 가능한 것)

Phase 1 발견 56건 중 메인페이지·장바구니·결제 관련 항목은 본 단계에서 손볼 가능성 큼. 발견하는 즉시 `formatPrice` 호출로 교체:
- `cart/page.tsx:177` — `.toLocaleString('ko-KR')}원` → `formatPrice(amount, 'ko')`
- `checkout/page.tsx:537` — 동일
- `aside-sidebar-cart.tsx:45` — `$` → `formatPrice`
- `PriceRangeSlider.tsx:50` — `$` → `formatPrice`
- 기타 본문에서 발견되는 직접포맷

### 3-8. 다국어 처리

`messages/ko.json`, `en.json`, `zh.json`에 `MainPage` 네임스페이스 추가:
```json
{
  "MainPage": {
    "welcomeTitle": "...",
    "recommendedTitle": "추천 상품",
    "bestTitle": "베스트 상품",
    "viewMore": "더보기",
    "addToCart": "장바구니",
    "buyNow": "바로 구매",
    "..."
  }
}
```

상품 이름·설명은 백엔드 응답을 그대로 표시 (현재 한국어).

---

## 4. 단계별 commit 권장

| 커밋 | 내용 |
|---|---|
| C1 | 디자인 분석 보고서 + 신규 컴포넌트 빈 골격 + ProductCard 베이스 |
| C2 | HeroSlider + WelcomeBanner + PromoBanner (정적 섹션) |
| C3 | CategoryTiles + FigmaCards + GiftBanner + ValuePanel (정적 섹션) |
| C4 | RecommendedProducts + BestProducts (백엔드 API 연동) |
| C5 | CartDrawer + 카트 인터랙션 |
| C6 | (home) page.tsx 통합 + 메인페이지 재작성 |
| C7 | 가격 표기 정리 + 다국어 키 |

각 커밋마다 `npm run build` 통과.

---

## 5. 변경 파일 요약

### 신규 (10개)
- `src/components/main-page/HeroSlider.tsx`
- `src/components/main-page/WelcomeBanner.tsx`
- `src/components/main-page/PromoBanner.tsx`
- `src/components/main-page/CategoryTiles.tsx`
- `src/components/main-page/FigmaCards.tsx`
- `src/components/main-page/RecommendedProducts.tsx`
- `src/components/main-page/BestProducts.tsx`
- `src/components/main-page/GiftBanner.tsx`
- `src/components/main-page/ValuePanel.tsx`
- `src/components/main-page/ProductCard.tsx`

### 신규 또는 재작성
- `src/components/CartDrawer.tsx` (신규)
- `src/app/[locale]/(shop)/(home)/page.tsx` (재작성)

### 수정 (가격 표기 정리)
- `src/components/aside-sidebar-cart.tsx`
- `src/components/PriceRangeSlider.tsx`
- `src/app/[locale]/(shop)/(other-pages)/cart/page.tsx`
- `src/app/[locale]/(shop)/(other-pages)/checkout/page.tsx`
- 기타 본문에서 발견되는 직접포맷

### 다국어
- `messages/ko.json`, `en.json`, `zh.json` — `MainPage` 네임스페이스 추가

---

## 6. 검증

### 빌드
- 각 커밋마다 `npm run build` 통과

### 페이지별 시각 검증
- `/ko` 메인페이지 — 모든 섹션 새 디자인 적용
- 모든 이미지 정상 로딩 (200) — `MAIN_PAGE_ASSETS` 참조
- 가격 표기 `88,888원` 형식
- 반응형: PC / 태블릿 / 모바일

### 인터랙션
- 히어로 슬라이더 자동 슬라이드 + 화살표/인디케이터
- 상품 카드 좋아요 토글
- 장바구니 추가 시 CartDrawer 슬라이딩 표출
- 카트 내 수량 조정 / 삭제

### 성능
- LCP — 큰 이미지(banner-box.png 9.8MB)에 `priority` 속성 + 적절한 `sizes`
- next/image 자동 최적화 활용 (Vercel CDN이 WebP/AVIF로 변환)

### API 연동
- Swagger /docs와 동일한 응답 구조로 매핑
- API 실패 시 graceful fallback (placeholder 또는 빈 상태)

---

## 7. 완료 보고

```
[Phase 4 완료 보고]

[작업 시작 시 결정사항 — §2 보고]
2-A 메인 라우트: app/[locale]/(shop)/(home)/page.tsx
2-B 백엔드 API:
   - /products?sort=best&limit=10 → 사용 / 미존재 / placeholder
   - /products?sort=recommended&limit=4 → ...
   - /categories → ...
2-C 카테고리 매핑: 일치 N건 / 부분일치 N건 / placeholder N건
2-D 다국어 키: MainPage 네임스페이스 N개 키

[산출물]
✅ 신규 main-page 컴포넌트 10개
✅ CartDrawer 신규
✅ home page.tsx 재작성
✅ 가격 표기 정리: N건 (발견된 56건 중 본문 관련)
✅ 다국어 ko/en/zh MainPage 네임스페이스

빌드: ✅ 7개 커밋 모두 통과
배포: [Vercel preview URL]
커밋:
  C1 [SHA] 디자인 분석 + 골격
  C2 [SHA] Hero/Welcome/Promo
  C3 [SHA] Category/Figma/Gift/Value
  C4 [SHA] Recommended/Best (API 연동)
  C5 [SHA] CartDrawer
  C6 [SHA] home page 통합
  C7 [SHA] 가격 표기 + 다국어

확인 필요:
- placeholder 라우트: [목록]
- 미존재 백엔드 endpoint: [목록]
- LCP 측정 필요 (Lighthouse) — 결과 별도 보고

다음: Phase 6 (가격 표기 잔여 정리 + 회귀 테스트) 또는 운영 전환
```

---

## 8. 주의사항

- **Supabase 직접 연결 금지** — 모든 상품/카테고리 데이터는 FastAPI 경유 (CLAUDE.md)
- **alert() 금지** → toast 사용 (장바구니 추가 알림 등)
- **환경변수 하드코딩 금지** — `process.env.NEXT_PUBLIC_API_URL` 등
- **이미지는 next/image 사용** — `MAIN_PAGE_ASSETS`의 Supabase URL은 `next.config.mjs`의 `remotePatterns: '**'`로 이미 허용됨 (Phase 5 보고 확인). hero/banner는 `priority` 속성 필수.
- **Server Component 우선** — 백엔드 데이터 fetch는 Server Component에서. Client Component는 인터랙션 필요한 곳만(슬라이더, 카트 토글, 좋아요).
- **placeholder 처리** — 백엔드 endpoint 미존재 시 디자인 자료의 `MAIN_PAGE_ASSETS.products` / `MAIN_PAGE_ASSETS.featured.best`을 placeholder로 사용 (이름·가격은 가짜값). 보고에서 placeholder 사용 명시.
- **카테고리 7타일** — 디자인 라벨(베스트/KN541/몰/신상품/오피스/사전예약/벨류) ↔ 백엔드 카테고리 매칭이 부분일치만 가능할 수 있음. 매핑 결과 보고.
- **회귀 테스트** — 메인페이지 외 다른 페이지(마이/장바구니/결제) 빌드 깨지지 않게. CartDrawer가 기존 `aside-sidebar-cart.tsx`를 대체할 수 있는데 — 두 컴포넌트가 공존하는 동안에는 Header에서만 CartDrawer 사용, 다른 페이지는 기존 컴포넌트 유지.

---

*작성: 기획 창 | 2026-05-06 | github.com/kn541/kn541-shop*
