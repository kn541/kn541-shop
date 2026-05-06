# [Cursor 작업지시] 쇼핑몰 메인 교체 — Phase 3: 헤더 교체 + 모바일 하단 네비

작성일: 2026-05-06 | 기획 창 → 프론트엔드 창
대상 레포: `github.com/kn541/kn541-shop` (Public, 이 레포)
작업 폴더: `ciseco-nextjs/`
**의존성: Phase 1, 2 완료**
환경: macOS

---

## 0. 배경

새 디자인의 헤더와 모바일 하단 고정 네비를 구현합니다. **가장 큰 변경**으로 신규/수정 컴포넌트가 7개 발생하므로, **단계별 commit**으로 진행해 빌드 안정성 유지.

### 단계별 commit 권장

| 커밋 | 내용 |
|---|---|
| C1 | 신규 컴포넌트 골격 + 상수 파일 (빈 export 또는 placeholder) |
| C2 | InlineSearchBox + LangSwitcher 디자인 갱신 + Logo SVG 교체 |
| C3 | Header.tsx 1행 구조 새로 작성 (좋아요/장바구니/마이 단순화) |
| C4 | CategoryNav + HomeTabNav (좌측 6개 정렬탭 + 우측 11개 카테고리) |
| C5 | MobileBottomNav 추가 + application-layout.tsx 통합 |
| C6 | 다국어 키 추가 (messages/ko/en/zh) + 검증 |

각 커밋마다 `npm run build` 통과 확인.

---

## 1. 새 디자인 헤더 분석

디자인 자료: `/Users/kn541/Desktop/kn541/디자인/외주/public/`

### PC 헤더 (`.site-header > .header-inner`)

**1행** (단일 행, 높이 ~70px):
- 좌: 로고 (`.logo-link` SVG, KN541 SHOP)
- 중앙: 인라인 검색 폼 (`.search-box <form role="search">`)
  - input placeholder "검색어를 입력해 주세요"
  - 검색 SVG 아이콘 (#05c368 `kn541-green`)
- 우: `.header-right-box`
  - `.header-actions` 3개 (좋아요/장바구니/마이) 각각 SVG
  - 구분선 `.header-divider`
  - `.language-select` 언어 드롭다운 (국기 표시)

**2행** (`.category-container`):
- `.category-nav-inner` 17개 항목
- 좌측 6개: **홈 / 베스트상품 / 신상품 / 추천상품 / 사전예약상품 / 벨류업상품**
- 우측 11개: **생활/홈데코, 가전/컴퓨터/디지털, 주방용품, 뷰티, 자동차/스포츠, 유아동/주니어, 여행, 패션/잡화, 건강/헬스, 캠핑/등산/낚시, 식품**
- `.nav-tab.is-active` 상태에 underline (`.nav-tab-underline` div가 left/width 애니메이션)

### Mobile 헤더

**1행** (`.mobile-header.container.pc` — 모바일에서만 표시):
- 로고 SVG (작은 버전)
- `.search-form` 인라인 (input + 검색 버튼)
- `.btn-cart` 장바구니

**2행** (가로 스크롤 카테고리 — `.category-nav` 모바일):
- PC와 동일 17개, 가로 스크롤로 표시
- progress bar (`.progress-bar-fill`) 스크롤 진행도

**3행** (`.category-nav-auth.mobile`):
- 로그인 버튼 / 구분선 / 회원가입 버튼 (`.nav-auth-btn.primary`)

### Mobile 하단 고정 (`.mobile-bottom`)

`public/index.html` 820행 부근 — 작업 시작 시 정확한 항목/구조 확인.
일반적으로 5개: 홈/카테고리/검색/장바구니/마이 — **디자인의 정확한 항목 확인 필수**.

---

## 2. 작업 시작 전 — Cursor가 확인하고 보고할 사항

작업 시작 전 다음 5건을 분석하고 결정사항을 보고. **불확실하면 멈추고 창님 결정 받기**.

### 2-A. 좌측 6개 정렬탭의 라우트
- 홈 = `/` 확정
- 베스트/신상품/추천/사전예약/벨류업 → 백엔드 API 또는 프론트 라우트 매핑 확인:
  - 기존 `app/[locale]/(shop)/(other-pages)/` 하위에 관련 라우트 있는지
  - 백엔드 `/products?sort=best` 등 쿼리 파라미터 지원 여부 (Swagger 확인: https://kn541-production.up.railway.app/docs)
  - 매핑 가능하면 그대로 사용 / 미정이면 placeholder `#` + 보고

### 2-B. 우측 11개 카테고리와 백엔드 매칭
- 디자인 11개: 생활/홈데코, 가전/컴퓨터/디지털, 주방용품, 뷰티, 자동차/스포츠, 유아동/주니어, 여행, 패션/잡화, 건강/헬스, 캠핑/등산/낚시, 식품
- 백엔드 `/categories` API 응답 라벨 확인. **일치 정도 보고**:
  - 정확 일치: 그대로 사용
  - 부분 일치: 가까운 것 매핑
  - 미존재: `#` placeholder + 보고
- API의 18개 카테고리(CLAUDE.md 기준)와 디자인 11개의 차이 정리

### 2-C. 모바일 하단 nav 항목
- `public/index.html` 820~끝 영역 정확히 분석
- 5개(또는 4개) 항목명/아이콘/라우트 정리 후 보고

### 2-D. 알림/주문배송 흡수 방법
- 기존 `HeaderUserActions.tsx`에 알림/주문배송 진입점 있음 (CLAUDE.md 헤더 1행 설명)
- 새 디자인에는 없음
- 권장 방안 = **마이 버튼을 드롭다운으로**: 마이페이지 / 알림 / 주문배송 / 로그아웃
- 다른 안 있으면 보고

### 2-E. 좋아요(찜) 버튼 라우트
- 기존 위시리스트 페이지 위치 확인: `app/[locale]/(shop)/(other-pages)/account/wishlist` 또는 다른 곳?
- 발견되는 라우트로 매핑

---

## 3. 작업 항목

### 3-1. 폐기 처리 (즉시 삭제 X, 사용 중단)

기존 컴포넌트는 **삭제 X**. Header.tsx에서 import 제거하고 deprecation 코멘트만 추가:

```typescript
// @deprecated Phase 3 — 인라인 검색박스로 대체 (InlineSearchBox.tsx)
// 후속 정리에서 삭제 예정
```

대상:
- `SearchBtnPopover.tsx` → `InlineSearchBox.tsx`로 대체
- `HeaderUserActions.tsx` → `MyMenuBtn.tsx` (드롭다운)로 흡수
- `HamburgerBtnMenu.tsx` → `MobileBottomNav.tsx`로 대체

### 3-2. 신규 컴포넌트 (5개)

| 파일 | 역할 |
|---|---|
| `src/components/Header/InlineSearchBox.tsx` | 인라인 검색 폼 (PC/모바일 공통, 반응형) |
| `src/components/Header/WishlistBtn.tsx` | 좋아요(찜) → 위시리스트 페이지 링크 |
| `src/components/Header/MyMenuBtn.tsx` | 마이 메뉴 드롭다운 (마이페이지/알림/주문배송/로그아웃 흡수) |
| `src/components/Header/HomeTabNav.tsx` | 카테고리 nav 좌측 6개 정렬 탭 |
| `src/components/MobileBottomNav.tsx` | 모바일 하단 고정 nav |

### 3-3. 기존 컴포넌트 재작성

| 파일 | 변경 |
|---|---|
| `src/components/Header/Header.tsx` | 1행 구조로 단순화 (로고 + 인라인검색 + 우측액션 + 언어) |
| `src/components/Header/LangSwitcher.tsx` | 디자인 국기 드롭다운 (한국어/English/中文) |
| `src/components/Header/CategoryNav.tsx` | underline 애니메이션 + 가로 스크롤 + HomeTabNav 통합 |
| `src/components/Header/CategoryNavClient.tsx` | active tab underline 위치 계산 클라이언트 로직 |
| `src/components/Header/CartBtn.tsx` | 디자인 SVG 아이콘으로 교체 |
| `src/components/Logo.tsx` | KN541 SHOP 디자인 로고 SVG (PC/모바일 두 사이즈) |

### 3-4. 신규 상수 파일

`src/data/home-tabs.ts` (신규):

```typescript
// 메인페이지 좌측 정렬 탭 (홈/베스트/신상품/추천/사전예약/벨류업)
// 라벨은 i18n 키로 처리 → messages/{locale}.json HomeTabs 네임스페이스
export const HOME_TABS = [
  { code: 'home', i18nKey: 'home', href: '/' },
  { code: 'best', i18nKey: 'best', href: '?' },        // 작업 시작 시 §2-A에서 결정
  { code: 'new', i18nKey: 'new', href: '?' },
  { code: 'recommended', i18nKey: 'recommended', href: '?' },
  { code: 'preorder', i18nKey: 'preorder', href: '?' },
  { code: 'value', i18nKey: 'value', href: '?' },
] as const
```

### 3-5. 카테고리 데이터 통합 (CategoryNav.tsx)

좌측 6개: `HOME_TABS` 상수 (프론트)
우측 11개: 백엔드 `/categories` API (기존 CategoryNav 패턴 유지)
시각적으로 한 줄에 통합. 좌우 구분선 또는 자연스러운 연속.

### 3-6. 모바일 하단 nav (MobileBottomNav.tsx)

- `<nav class="mobile-bottom" aria-label="모바일 하단 메뉴">`
- 위치: `application-layout.tsx`에 추가 (Footer 아래, 전역 전역으로 fixed bottom)
- Tailwind: `lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-kn541-gray-200`
- 항목: §2-C에서 결정된 5개 (예상: 홈/카테고리/검색/장바구니/마이)

### 3-7. 헤더 인터랙션 (`public/js/main.js` 참조)

- 카테고리 underline 애니메이션 (active 위치로 이동) → `CategoryNavClient.tsx`에서 `useRef` + `useEffect`로 width/left 계산
- 모바일 카테고리 가로 스크롤 + progress bar
- 언어 드롭다운 (외부 클릭 시 닫힘) → `LangSwitcher.tsx`에서 `useEffect` + ref outside click
- 좋아요 버튼 토글: 헤더에서는 페이지 이동만 (위시리스트 토글은 상품 카드에서 — Phase 4)

### 3-8. 다국어 처리

`messages/ko.json`, `en.json`, `zh.json`에 추가:

```json
{
  "Header": {
    "search": "검색어를 입력해 주세요",
    "wishlist": "찜",
    "cart": "장바구니",
    "myPage": "마이페이지",
    "notifications": "알림",
    "orderTracking": "주문/배송",
    "logout": "로그아웃",
    "login": "로그인",
    "signup": "회원가입"
  },
  "HomeTabs": {
    "home": "홈",
    "best": "베스트상품",
    "new": "신상품",
    "recommended": "추천상품",
    "preorder": "사전예약상품",
    "value": "벨류업상품"
  },
  "MobileBottomNav": {
    // §2-C 결정 후 키 추가
  }
}
```

### 3-9. application-layout.tsx 수정

- `<MobileBottomNav />` 추가 (Footer 다음, body의 마지막)
- 모바일 하단 nav가 콘텐츠를 가리지 않도록 body에 `pb-16 lg:pb-0` 등 padding 추가 (필요 시)

---

## 4. 변경 파일 요약

### 신규 (6개)
- `src/components/Header/InlineSearchBox.tsx`
- `src/components/Header/WishlistBtn.tsx`
- `src/components/Header/MyMenuBtn.tsx`
- `src/components/Header/HomeTabNav.tsx`
- `src/components/MobileBottomNav.tsx`
- `src/data/home-tabs.ts`

### 재작성 (6개)
- `src/components/Header/Header.tsx`
- `src/components/Header/LangSwitcher.tsx`
- `src/components/Header/CategoryNav.tsx`
- `src/components/Header/CategoryNavClient.tsx`
- `src/components/Header/CartBtn.tsx`
- `src/components/Logo.tsx`

### 수정 (4개)
- `src/components/Header/SearchBtnPopover.tsx` (deprecation 코멘트)
- `src/components/Header/HeaderUserActions.tsx` (deprecation 코멘트)
- `src/components/Header/HamburgerBtnMenu.tsx` (deprecation 코멘트)
- `src/app/[locale]/(shop)/application-layout.tsx` (MobileBottomNav 추가)

### 다국어 (3개)
- `messages/ko.json`, `messages/en.json`, `messages/zh.json` (Header, HomeTabs, MobileBottomNav 네임스페이스 추가)

---

## 5. 검증

### 빌드
- `npm run build` 각 커밋마다 통과
- `npm run dev` 정상

### 페이지별 시각 검증
- `/ko` PC (≥1024px): 1행 헤더 + 카테고리 nav 17개 + 푸터 + 모바일 하단 nav 숨김
- `/ko` 태블릿 (768~1023px): 디자인 분기 따라
- `/ko` 모바일 (<768px): mobile-header + 가로 스크롤 카테고리 + auth 버튼 + mobile-bottom-nav 표시
- `/en`, `/zh`: 라벨 번역, 회사정보(Footer)는 한국어 유지

### 인터랙션
- 인라인 검색 폼 submit 동작 (placeholder만 — 실제 검색 결과 페이지는 Phase 4)
- 좋아요 버튼 클릭 → 위시리스트 페이지 이동
- 마이 버튼 클릭 → 드롭다운 표시 (마이페이지/알림/주문배송/로그아웃)
- 언어 드롭다운 외부 클릭 시 닫힘
- 카테고리 탭 클릭 → underline 위치 이동 + 라우팅
- 모바일 카테고리 가로 스크롤 + progress bar 동작
- 모바일 하단 nav 클릭 → 해당 페이지 이동

### 기존 페이지 영향 확인 (회귀 테스트)
- 마이페이지 — 새 헤더 정상 표시
- 장바구니 — 카트 버튼 정상
- 결제 — 헤더 정상
- 분양몰(myshop) — 헤더 정상

---

## 6. 완료 보고 (창님께 직접)

```
[Phase 3 완료 보고]

[작업 시작 시 결정사항 — §2 보고]
- 2-A 좌측 6개 라우트:
  - 홈 = / (확정)
  - 베스트 = [라우트 또는 placeholder]
  - 신상품 = ...
- 2-B 우측 11개 매핑:
  - 일치 N건 / 부분일치 N건 / 미존재 N건
  - 미존재 항목: [목록]
- 2-C 모바일 하단 nav: [N개 항목] 홈/카테고리/검색/장바구니/마이
- 2-D 알림·주문배송: 마이 드롭다운으로 흡수
- 2-E 좋아요 버튼: /account/wishlist (또는 결정된 라우트)

[산출물]
✅ 신규 6개: InlineSearchBox / WishlistBtn / MyMenuBtn / HomeTabNav / MobileBottomNav / home-tabs.ts
✅ 재작성 6개: Header / LangSwitcher / CategoryNav(+Client) / CartBtn / Logo
✅ 폐기 처리(deprecation 코멘트만): SearchBtnPopover / HeaderUserActions / HamburgerBtnMenu
✅ application-layout.tsx에 MobileBottomNav 통합
✅ 다국어: ko/en/zh Header, HomeTabs, MobileBottomNav 네임스페이스 추가

빌드: ✅ 6개 커밋 모두 통과
배포: [Vercel preview URL]
커밋:
  C1 [SHA] 신규 골격
  C2 [SHA] InlineSearch + Lang + Logo
  C3 [SHA] Header 1행
  C4 [SHA] CategoryNav 통합
  C5 [SHA] MobileBottomNav
  C6 [SHA] 다국어 + 검증

확인 필요:
- 좌측 정렬탭 라우트 placeholder 항목: [목록]
- 우측 카테고리 미존재 항목: [목록]
- 헤더의 알림/주문배송 흡수 방식 OK인지

다음: Phase 4 (메인페이지 본문) 대기
```

---

## 7. 주의사항

- **Supabase 직접 연결 금지**, **alert() 금지** → toast, **하드코딩 금지** (CLAUDE.md)
- 기존 7개 헤더 컴포넌트(Header2, AvatarDropdown, CategoriesDropdown, CurrLangDropdown, MegaMenuPopover, SearchBtnPopover-deprecated, HeaderUserActions-deprecated, HamburgerBtnMenu-deprecated)는 **Ciseco 템플릿 잔재로 다른 페이지에서 사용 중일 수 있음**. import 경로 변경하지 않음. Phase 3에서는 Header.tsx에서만 사용 중단.
- **Vercel 배포 검증**: 각 커밋마다 production이 자동 배포됨. 깨지면 즉시 롤백 또는 fix-forward.
- 카테고리 좌측 정렬탭의 라우트가 미정인 항목은 `href="#"` placeholder + `data-todo="route-tbd"` 속성 부여 (후속 검색 용이).
- 알림/주문배송 흡수 시 기존 로직 보존 — Cursor가 `HeaderUserActions.tsx`를 읽고 알림/주문배송 처리 로직(API 호출, 뱃지 카운트 등)을 `MyMenuBtn` 드롭다운으로 이전.
- **국기 base64 인라인 분리**: 기존 `public/index.html`의 `<image xlink:href="data:image/png;base64,...">` 형태 → SVG 외부 파일로 분리 (`public/images/flags/ko.svg` 등) 권장. 또는 react-country-flag 등 라이브러리 사용 검토.

---

*작성: 기획 창 | 2026-05-06 | github.com/kn541/kn541-shop*
