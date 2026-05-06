# 작업지시서 — 디자인설정 shop 연동 v1

작성: 기획 창 (창님) | 2026-05-06 | 대상: Cursor (kn541-shop)

---

## 1. 배경

어드민 디자인설정 모듈이 별도 레포(`kn541/kn541`)에서 진행 중. shop 측 작업은 **메인 페이지 히어로/상품 진열을 DB 데이터 기반으로 동적 렌더링**으로 전환하는 것.

### 데이터 소스

**전제**: 백엔드 API(`/public/hero-banners`, `/public/main-products`)가 먼저 완성되어야 함. 백엔드 완료 보고 받은 후 작업 시작.

shop의 기존 데이터 접근 패턴(FastAPI 호출 vs Supabase 직접)을 grep으로 먼저 확인:
```bash
grep -rn "supabase\|NEXT_PUBLIC_API" src/ | head -20
```

**조회 대상은 `v_active_*` 뷰** — 시간 필터/상품 노출 상태 체크가 뷰 안에서 이미 처리됨. shop은 단순 SELECT 또는 GET만 하면 됨.

| 용도 | 백엔드 API 경로 | 또는 Supabase 뷰 직접 |
|---|---|---|
| 히어로 배너 | `GET /public/hero-banners` | `v_active_hero_banners` |
| 메인 진열 (섹션별) | `GET /public/main-products?section_code=FEATURED` | `v_active_main_page_products` |

---

## 2. 작업 범위

### 2-1. 메인 페이지 히어로 슬라이더 동적화

`src/app/(home)/page.tsx` 또는 `HeroSlider` 관련 컴포넌트를 grep으로 찾아 다음으로 전환:

**현재 (정적):**
- 하드코딩된 이미지/문구 배열로 슬라이더 렌더링

**변경 후 (동적):**
- 서버 컴포넌트에서 `v_active_hero_banners` 조회 → SSR 렌더링
- 데이터 형태: `[{id, title, image_url, mobile_image_url, link_url, link_target, alt_text, sort_order}]`
- 클릭 시 `link_url`로 이동, target은 `link_target` 필드 사용
- 모바일 분기: `mobile_image_url`이 있으면 `<picture>` 또는 매체 쿼리로 조건 표시. 없으면 `image_url` 공용

**Next.js 캐시 전략:**
```ts
// 60초마다 재검증 (어드민에서 시간 도래 후 최대 1분 내 노출)
export const revalidate = 60;
```

### 2-2. 메인 페이지 상품 진열 섹션

기존 메인의 상품 진열 섹션(추천/신상품/베스트 등)이 있으면 같은 패턴으로 전환.

- 섹션별로 `v_active_main_page_products`를 `section_code` 필터로 조회
- 결과가 비어있으면 해당 섹션 아예 렌더링 X (어색하게 빈 카드 X)
- 상품 카드 컴포넌트는 기존 재사용

**섹션 매핑 (system_codes design_section_type 참조)**
- FEATURED → "추천 상품"
- NEW → "신상품"
- BEST → "베스트셀러"
- SALE → "할인 상품"

shop 메인에 어떤 섹션을 노출할지는 디자인 흐름에 맞게 Cursor가 판단. 모두 다 노출할 필요 없음 — 기존 메인 구성 유지하면서 데이터만 갈아끼우는 게 목표.

---

## 3. 메인 페이지 회귀 방지

직전 Phase 5(상품 카드 정합성) + Phase 6(컨테이너 1280) 작업 완료된 상태.
- 헤더, 컨테이너, 폰트, 거터는 절대 건드리지 말 것.
- **이번 작업은 데이터 소스 전환에만 집중.** 마크업/CSS 변경 금지.

---

## 4. 커밋 분리 (3 커밋)

| 커밋 | 내용 |
|---|---|
| **D1** | 히어로 슬라이더 데이터 소스 전환 (정적 → `v_active_hero_banners`) + revalidate 60 |
| **D2** | 메인 상품 진열 섹션 데이터 소스 전환 (`v_active_main_page_products` 섹션 필터) |
| **D3** | `npm run build` 통과 + Vercel READY + 회귀 시나리오 점검 보고 |

---

## 5. 완료 기준

- ✅ 어드민에서 히어로 등록 + `publish_at`을 현재 시각으로 → 1분 내 shop 메인에 표시
- ✅ `unpublish_at` 도래 후 1분 내 shop에서 사라짐
- ✅ 어드민에서 상품 진열 등록 → 시간 도래 시 해당 섹션에 노출
- ✅ 모바일 이미지가 등록된 항목은 모바일에서 모바일 이미지로 표시
- ✅ `link_url=NULL`이면 클릭 비활성, 있으면 `link_target` 따라 이동
- ✅ 메인 페이지 회귀 0건 (헤더/컨테이너/카드/폰트 모두 정상)
- ✅ Vercel production READY

---

## 6. 절대 금지

- ❌ 백엔드 API 미완성 상태에서 작업 시작 (반드시 백엔드 완료 보고 받은 후)
- ❌ Supabase 직접 INSERT/UPDATE (이 작업은 어드민에서만)
- ❌ 메인 페이지 마크업/CSS 변경 (데이터 소스 전환만)
- ❌ 캐시를 0으로 두기 (DB 부하 폭발 방지, 60초 권장)

---

## 7. 작업 시작 전 확인

```bash
git pull origin main
cat docs/API_SPEC.md  # 백엔드 완성 API 확인 (특히 /public/hero-banners 등록 여부)
```

API_SPEC에 신규 공개 API가 등록되어 있지 않으면 백엔드 작업이 아직 안 끝난 것 — 창님께 보고 후 대기.
