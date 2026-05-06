# Phase 6 작업지시서 — 전체 페이지 컨테이너 1280px 통일

작성: 기획 창 (창님) | 2026-05-06 | 대상: Cursor (kn541-shop)

---

## 1. 목표

KN541 shop **전체 페이지 PC 컨테이너 가로를 1280px로 통일**.
SSG.COM(≈1284) 등 한국 메이저 e커머스 표준에 맞춤.

## 2. 현재 상태

| 영역 | 컨테이너 | 비고 |
|---|---|---|
| 메인 `/(home)` | ✅ **1280** | `max-w-[1280px]`, `max(calc((100vw-1280px)/2),20px)` 거터 |
| 푸터 (전역) | ✅ **1280** | `max-w-[1280px]` (`MainFooter` 또는 `Footer`) |
| 그 외 페이지 (`/products`, `/cart`, `/myshop`, `/account`, `/login`, `/signup`, `/vendor-inquiry`, `/terms/*` 등) | ⚠ Ciseco 기본 `container` 클래스 — Tailwind v4 기본값 또는 `max-w-screen-2xl(1536)` 가능성 | 통일 필요 |
| 전역 `Header.tsx` (메인 외 페이지에서 사용) | ⚠ Ciseco `MainNav*` 컨테이너 | 통일 필요 |

## 3. 작업 지시

### 3-1. 컨테이너 토큰 한 곳만 변경 (C6-1)

`frontend/ciseco-nextjs/src/app/globals.css`의 `@theme` 또는 `@utility`에서:

**옵션 A — `container` utility 재정의 (권장)**
```css
@utility container {
  max-width: 1280px;
  margin-inline: auto;
  padding-inline: 1rem;
}
```
Tailwind v4의 `screens`별 반응형 max-width를 무시하고 **모든 BP에서 1280 고정**.

**옵션 B — 전용 토큰 추가**
```css
@theme {
  --container-kn541: 1280px;
}
```
이후 사용처에서 `max-w-(--container-kn541)` 또는 `max-w-[1280px]` 명시.

→ Cursor가 현재 `container` 정의 방식을 grep으로 파악 후 적합한 옵션 선택.

### 3-2. 전역 컴포넌트 정렬 (C6-2)

- `Header.tsx` (메인 외 페이지에서 사용되는 전역 헤더) — `container` 사용처가 자동 1280 적용되는지 확인. 별도 `max-w-screen-*` 박혀있으면 1280으로 변경.
- `MainNav1`, `MainNav2`, `Navigation` 등 헤더 하위 컴포넌트 — 동일.
- `Footer` / `MainFooter` — 이미 `max-w-[1280px]`. 변경 없음.

### 3-3. 페이지별 grep & 일괄 치환 (C6-3)

`frontend/ciseco-nextjs/src` 하위 grep:
```bash
grep -rn "max-w-screen-2xl\|max-w-screen-xl\|max-w-7xl\|max-w-\[15\|max-w-\[14\|max-w-\[13\|max-w-\[12" src/
```

치환 규칙:
- `max-w-screen-2xl` (1536) → `max-w-[1280px]`
- `max-w-screen-xl` (1280) → 그대로 OK
- `max-w-7xl` (1280) → 그대로 OK
- `max-w-[1440px]` / `[1400px]` / `[1350px]` / `[1300px]` 등 → `max-w-[1280px]`
- `max-w-[1200px]` / `[1248px]` 등 (1280 미만) → 본문 가독성 컨테이너인지 확인 후 1280으로 통일 또는 그대로 유지 (Cursor 판단)

### 3-4. 메인 페이지 — 변경 금지 (회귀 방지)

`/(home)` 라우트의 `MainHeader`, `MainPageCartProvider`, `WelcomeSection`, `HeroSlider`, `MainProductCard`, `CartPopup`, `MobileBottomNav` 등은 **건드리지 말 것**.
이미 1280으로 적용 + Phase 3~5에서 검증 완료. 회귀 발생 시 즉시 롤백.

### 3-5. 모바일 거터 유지

모든 컨테이너는 `mx-auto max-w-[1280px] px-4` (또는 `sm:px-5`) 형태 유지. 모바일에서 양쪽 16px 거터 유지. 모바일 동작 변경 금지.

## 4. 커밋 분리 (4 커밋)

| 커밋 | 내용 |
|---|---|
| **C6-1** | `globals.css` `@utility container` 또는 `@theme` 1280 토큰 |
| **C6-2** | 전역 `Header.tsx` + `MainNav*` 컨테이너 정렬 |
| **C6-3** | 페이지별 `max-w-screen-2xl` 등 일괄 치환 (`/products`, `/cart`, `/myshop`, `/account`, `/login`, `/signup`, `/vendor-inquiry`, `/terms/*`) |
| **C6-4** | `npm run build` 통과 + Vercel READY 확인 + 회귀 시나리오 점검 보고 |

## 5. 완료 기준

- ✅ `npm run build` 통과 (오류 0)
- ✅ Vercel production READY (4 commit 모두)
- ✅ 메인 페이지 회귀 0건 — 헤더/히어로/퀵아이콘/상품/팝업/모바일하단 정상
- ✅ `/`, `/ko/products`, `/ko/cart`, `/ko/myshop`, `/ko/vendor-inquiry`, `/ko/terms/service` 모두 PC 1280 컨테이너로 표시
- ✅ 모바일(≤767) 양쪽 16px 거터 유지

## 6. 회귀 시 즉시 롤백

C6-2/C6-3 적용 후 메인이 깨지면 해당 commit revert. 메인은 절대 건드리지 않을 것.

---

작업 완료 후 창님께 5 commit hash + Vercel deployment id + 영향받은 파일 수 보고.
