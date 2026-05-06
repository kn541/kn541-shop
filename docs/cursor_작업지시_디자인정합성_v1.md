# [Cursor] 메인 페이지 디자인 정합성 보강 v1

## 0. 배경 / 문제 인식

사용자(창님)가 외주 받은 메인 페이지 디자인 원본(`/Users/kn541/Desktop/kn541/디자인/외주/public/`)과 현재 배포본(`https://shop.kn541.co.kr/ko`)을 직접 대조한 결과, **헤더와 본문 모두에서 디자인 명세와 실제 구현 사이에 다수의 차이**가 확인됨.

근본 원인:
- **Phase 3 (헤더)는 시작 전 상태**. 헤더는 여전히 Ciseco 템플릿 그대로 → 텍스트 크기, 검색 박스, 액션 아이콘, 카테고리 nav가 모두 디자인과 다름.
- **Phase 4 (본문)**도 디테일(높이, 폰트 weight, gap, 카드 폭/이미지 비율, 가격 마크업)이 디자인 원본과 어긋남.
- 본 작업은 **디자인 원본을 단일 정답(source of truth)으로 삼아 모든 컴포넌트를 재작성**하는 것을 목표로 함.

## 1. 작업 원칙

1. **디자인 원본 마크업/CSS를 그대로 복제하라.** 새로 발명하지 말 것. 픽셀 값, 폰트 weight, gap, line-height, letter-spacing 모두 명세 그대로.
2. **Tailwind v4 임의값(`[…px]`)은 허용**하되, 반복되는 값은 `tailwind.css @theme` 토큰으로 등록 후 사용.
3. **Class 이름은 디자인 원본의 시맨틱(`product-card`, `thumb`, `cart-button`, `like-button` 등)을 보존**한다 (Tailwind 유틸 클래스와 병행 가능).
4. **기존 전역 컴포넌트(전역 ProductCard, Header, Footer 등)는 손대지 않는다.** 메인 페이지 전용은 `src/components/main-page/` 하위에 두고, 필요하면 해당 컴포넌트를 폐기·재작성한다.
5. **데이터 동적 부분만 React state/prop**으로 처리. 카피·타이틀·고정 카운터(`88,888원`, `999+`, `88%` 등)는 placeholder로 그대로 둔다.
6. **단일 commit이 아닌 영역별 분리 commit 권장** — 빌드 오류 격리 / 리뷰 용이성. (5개 commit 권장: C1 토큰, C2 헤더, C3 히어로+웰컴, C4 상품섹션×4, C5 카트팝업+모바일하단)

## 2. 디자인 원본 위치

- HTML: `/Users/kn541/Desktop/kn541/디자인/외주/public/index.html` (909줄)
- CSS:  `/Users/kn541/Desktop/kn541/디자인/외주/public/css/style.css` (2337줄)
- JS:   `/Users/kn541/Desktop/kn541/디자인/외주/public/js/main.js` (324줄, 슬라이더/언어드롭다운/카트팝업 동작 참고)

**Cursor는 위 3개 파일을 작업 시작 시 반드시 정독하고, 본 지시서의 모든 픽셀/폰트 값이 원본과 일치하는지 교차 검증할 것.**

이미지 자산은 이미 Supabase Storage에 업로드 완료 (`MAIN_PAGE_ASSETS` 사용). 정적 아이콘(SVG)은 `public/images/main-v1/icons/` 사용 또는 SVG 인라인.

---

## 3. C1 — 디자인 토큰 추가

**파일**: `ciseco-nextjs/src/styles/tailwind.css`

기존 KN541 색상 토큰 11개에 추가:

```css
@theme {
  /* 기존 kn541-* 유지 */

  /* 추가 — 메인 디자인 정확값 */
  --color-kn541-green-soft: #e4f9ed;
  --color-kn541-green-light: #c8ebab;   /* value-panel 배경 */
  --color-kn541-best-gradient-start: #c9e9aa;  /* best-section 그라디언트 */
  --color-kn541-promo-start: #00eb7a;     /* promo-strip 좌 */
  --color-kn541-promo-end: #c0ff91;       /* promo-strip 우 */
  --color-kn541-search-bg: #f4f5f5;       /* 모바일 search-form 배경 */
  --color-kn541-border-soft: rgba(181, 181, 181, 0.45);  /* site-header bottom */

  --container-kn541: 1280px;
}
```

기존 globals.css 또는 layout에 Pretendard 적용 확인.

---

## 4. C2 — 헤더 (Phase 3 신규)

기존 작업지시서 `docs/cursor_작업지시_shop_메인교체_phase3.md` 기반이되, 아래 픽셀 명세를 정확히 따를 것.

### 4-1. PC 헤더 구조 (디자인 원본 라인 10~180)

```
<header class="site-header">
  <!-- 1행: 로고 + 검색 + 액션 + 언어 -->
  <div class="header-inner">
     <a class="logo-link"> [SVG 로고 157x28] </a>
     <div class="header-right-box">
        <form class="search-box" role="search">
          <input type="search" placeholder="검색어를 입력해 주세요" />
          <button type="submit"> [돋보기 SVG 19x19 #05C368] </button>
        </form>
        <div class="header-actions">
          <button class="header-like"> [하트 SVG 24x20] </button>
          <button class="header-cart"> [카트 SVG 22x21] </button>
          <button class="header-my"> [사람 SVG 24x21] </button>
        </div>
        <span class="header-divider"></span>
        <div class="language-select">
          <button class="language-toggle"> [▼ + 국기 23x23] </button>
          <div class="language-menu"> [한국어/English/中文 with 국기] </div>
        </div>
     </div>
  </div>

  <!-- 2행: 카테고리 nav -->
  <div class="category-container">
    <nav class="category-nav">
      <div class="category-nav-inner">
        <button class="nav-tab is-active">홈</button>
        <button class="nav-tab">베스트상품</button>
        ... (총 17개)
      </div>
    </nav>
  </div>
</header>
```

### 4-2. 정확한 픽셀 명세 (PC, ≥1025px)

| 요소 | 값 |
|---|---|
| `.site-header` | `border-bottom: 1px solid rgba(181,181,181,0.45)` |
| `.header-inner` | `max-w-[1280px] mx-auto px-0 py-[18px] flex justify-between` |
| `.logo-link` | `w-[151px] h-[27px]` (PC), `w-[120px] h-[21px]` (모바일) |
| `.header-right-box` | `flex items-center gap-[22px]` |
| `.search-box` | `w-[360px] h-[35px] border border-kn541-green rounded-[5px] bg-white flex items-center` |
| `.search-box input` | `px-[14px] pr-[12px] text-[16px] font-normal placeholder:text-[#b5b5b5]` |
| `.search-box button` | `flex-[0_0_53px] h-full grid place-items-center` (즉 너비 53px 고정) |
| `.search-box button svg` | `w-[19px] h-[19px] fill-kn541-green` |
| `.header-actions` | `flex items-center gap-[16px]` |
| `.header-like svg` | `w-[24px] h-[20px]` |
| `.header-cart svg` | `w-[22px] h-[21px]` |
| `.header-my svg` | `w-[24px] h-[21px]` |
| `.header-divider` | `w-[1px] h-[30px] bg-kn541-black` |
| `.language-toggle` | `h-[35px] flex items-center gap-[8px] text-[16px] font-normal` |
| `.language-toggle img(국기)` | `w-[23px] h-[23px] rounded-full object-cover` |
| `.language-menu` | `absolute top-[31px] right-0 w-[105px] border border-[#b5b5b5] rounded-[5px] bg-white shadow-[0_14px_30px_rgba(18,18,18,0.12)]` |
| `.language-menu button.is-selected` | `bg-[rgba(5,195,104,0.15)]` |
| `.category-container` | `w-[1280px] mx-auto flex justify-between items-center` |
| `.category-nav` | `max-w-[970px] h-[48px] overflow-hidden` |
| `.category-nav-inner` | `flex items-center gap-[24px] h-[48px] overflow-x-auto` (스크롤바 hidden) |
| `.nav-tab` | `text-[16px] font-normal leading-[19px] tracking-[-0.02em] text-kn541-black whitespace-nowrap` |
| `.nav-tab.is-active / hover` | `text-kn541-green font-semibold` |
| `.nav-tab-underline` | `absolute bottom-0 h-[3px] bg-kn541-green transition-[left,width] duration-200` |

### 4-3. 모바일 헤더 (≤767px)

```
<div class="mobile-header">
  <a class="logo-link"> [작은 로고 120x21] </a>
  <form class="search-form">
    <input type="text" />
    <button> [돋보기 20x20 #05C368] </button>
  </form>
  <button class="btn-cart"> [카트 23x22] </button>
</div>
```

| 요소 | 값 |
|---|---|
| `.logo-link (모바일)` | `w-[120px] h-[21px]` |
| `.search-form` | `w-[calc(100%-190px)] h-[38px] bg-[#f4f5f5] rounded-[19px] px-[12px] flex items-center ml-[32px] relative` |
| `.search-form input` | `flex-1 bg-transparent border-0 outline-0 text-[14px] text-[#121212] placeholder:text-[#9b9b9b] pr-[30px]` |
| `.search-form button` | `absolute right-[8px] w-[20px] h-[20px] flex items-center justify-center` |
| `.search-form button svg` | `w-[18px] h-[18px]` |
| `.btn-cart` | `ml-[15px]` |
| `.btn-cart svg` | `w-[23px] h-[22px]` |

### 4-4. 모바일 카테고리 + 인증 메뉴

```
<div class="category-nav-auth mobile">
  <button class="nav-auth-btn">로그인</button>
  <div class="nav-line"></div>
  <button class="nav-auth-btn primary">회원가입</button>
</div>
```

### 4-5. 17개 카테고리 탭 (정확)

```typescript
// src/data/home-tabs.ts
export const HOME_TABS = [
  { key: "home",     label: "홈",          href: "/" },
  { key: "best",     label: "베스트상품",   href: "#data-todo" },
  { key: "new",      label: "신상품",       href: "/products" },
  { key: "recommend",label: "추천상품",     href: "#data-todo" },
  { key: "reserve",  label: "사전예약상품", href: "/products?product_type=002" },
  { key: "valueup",  label: "벨류업상품",   href: "#data-todo" },
];

export const CATEGORY_TABS = [
  { key: "home-deco",   label: "생활/홈데코",       href: "#data-todo" },
  { key: "appliance",   label: "가전/컴퓨터/디지털", href: "#data-todo" },
  { key: "kitchen",     label: "주방용품",          href: "#data-todo" },
  { key: "beauty",      label: "뷰티",             href: "#data-todo" },
  { key: "sports",      label: "자동차/스포츠",     href: "#data-todo" },
  { key: "kids",        label: "유아동/주니어",     href: "#data-todo" },
  { key: "travel",      label: "여행",             href: "#data-todo" },
  { key: "fashion",     label: "패션/잡화",         href: "#data-todo" },
  { key: "health",      label: "건강/헬스",         href: "#data-todo" },
  { key: "outdoor",     label: "캠핑/등산/낚시",    href: "#data-todo" },
  { key: "food",        label: "식품",             href: "#data-todo" },
];
```

PC: `홈|베스트|신상|추천|사전예약|벨류업` (좌측, 6개) + `구분 영역` + `카테고리 11개` (우측, 가로 스크롤)
모바일: 위 17개를 한 줄 가로 스크롤 + 활성 탭 underline 애니메이션 + 좌측 nav-left-line(세로선)

---

## 5. C3 — 히어로 (수정)

**파일**: `src/components/main-page/HeroSlider.tsx`

### 5-1. 마크업

```jsx
<section className="hero" aria-label="메인 배너">
  <div className="hero-viewport">
    {/* 4개 슬라이드, picture 태그로 모바일/PC 분기 */}
    <article className={`hero-slide ${idx === active ? "is-active" : ""}`}>
      <picture>
        <source media="(max-width: 767px)" srcSet={MAIN_PAGE_ASSETS.heroes.mobile[idx]} />
        <img src={MAIN_PAGE_ASSETS.heroes.pc[idx]} alt="" />
      </picture>
      <div className="hero-copy">
        <h1>Main Banner Title<br />Main Banner Title</h1>
        <p>Sub Title Sub Title Sub Title Sub Title Sub Title</p>
      </div>
    </article>
  </div>
  <div className="hero-controls">
    <button className="hero-pause" type="button" aria-pressed={isPaused} />
    <p>
      <span className="hero-current">{String(active + 1).padStart(2, "0")}</span>
      <span className="hero-divider">[1x8 세로선 SVG]</span>
      <strong>10</strong>
    </p>
  </div>
</section>
```

### 5-2. 픽셀 명세

| 요소 | 값 |
|---|---|
| `.hero` | `relative overflow-hidden h-[370px] bg-[#e8e8e8]` |
| `.hero-slide` | `absolute inset-0 opacity-0 invisible transition-[opacity,visibility] duration-[450ms]` |
| `.hero-slide.is-active` | `opacity-100 visible` |
| `.hero-slide img` | `w-full h-full object-cover object-center` |
| `.hero-copy` | `absolute top-[103px] left-[max(calc((100vw-1280px)/2),20px)] w-[430px] ml-[90px]` |
| `.hero-copy h1` | `text-[34px] font-medium leading-normal tracking-[-0.68px]` |
| `.hero-copy p` | `mt-[31px] text-[18px] font-normal tracking-[-0.36px]` |
| `.hero-controls` | `absolute right-[max(calc((100vw-1280px)/2),20px)] bottom-[21px] flex items-center gap-[6px]` |
| `.hero-pause, .hero-controls p` | `h-[29px] rounded-[15px] bg-[rgba(18,18,18,0.5)]` |
| `.hero-pause` | `relative w-[29px]` (재생/일시정지 의사요소로 표현, CSS 그대로 복사) |

### 5-3. JS 동작 (원본 `js/main.js` 70~140행 참조)

- 자동 슬라이드 5초 간격
- pause 버튼 클릭 시 `aria-pressed` 토글, 자동 재생 멈춤/재개
- 현재 인덱스/총 개수 텍스트 동기화

---

## 6. C4 — 웰컴 + 카테고리 타일 (수정)

**파일**: `src/components/main-page/WelcomeSection.tsx` (신규 또는 기존 CategoryTiles 재작성)

### 6-1. 마크업 (디자인 원본 라인 240~300)

```jsx
<section className="welcome container">
  <div className="welcome-mobile pc">
    [달력 아이콘 17x17] <span>가치 소비의 지름길, 5월 사전예약 상품 OPEN!</span> [→ 9x15]
  </div>
  <p className="eyebrow mobile">WELCOME TO KN541 SHOP</p>
  <h2 className="welcome-description mobile">소비의 가치가 혜택으로 돌아오는 KN541 SHOP에 오신 것을 환영합니다.</h2>

  <div className="quick-icons" aria-label="바로가기">
    {/* 7개 타일 */}
  </div>
</section>
```

### 6-2. 7개 타일 데이터 (라우트 매핑)

```typescript
const QUICK_ICONS = [
  { key: "best",    label: "베스트 상품",   img: "cate-best.png",   href: "#data-todo" },
  { key: "mall",    label: "내 쇼핑몰",     img: "cate-mall.png",   href: "/myshop" },
  { key: "new",     label: "신상품",        img: "cate-new.png",    href: "/products" },
  { key: "reserve", label: "사전 예약",     img: "cate-reserve.png",href: "/products?product_type=002" },
  { key: "value",   label: "벨류업",        img: "cate-value.png",  href: "#data-todo" },
  { key: "office",  label: "오피스 라이프", img: "cate-office.png", href: "#data-todo" },
  { key: "kn541",   label: "KN541",         img: "cate-kn541.png",  href: "#data-todo" },
];
```

### 6-3. 픽셀 명세

| 요소 | 값 |
|---|---|
| `.welcome` | `pt-[72px] pb-[34px]` |
| `.quick-icons` | `grid grid-cols-7 gap-[23px] mt-[34px]` |
| `.quick-icon` | `grid justify-items-center gap-[16px] min-h-[135px] text-[20px] font-medium tracking-[-0.4px] whitespace-nowrap text-kn541-black` |
| `.quick-icon span` | `grid w-[97px] h-[97px] place-items-center rounded-full transition` |
| `.quick-icon span img` | `w-[75px] h-[75px] object-contain` |
| `.quick-icon:first/last span img` | `w-auto h-[71px]` (첫 best, 마지막 kn541) |
| hover/active | `text-kn541-green font-semibold`, `span: bg-[#f0f0f0]` |

### 6-4. 반응형
- 1024- : `grid-cols-4`
- 767- : 모바일 가로 스크롤 변형 (원본 css 1500~1700행 참조)

---

## 7. C5 — 상품 카드 통일 (`MainProductCard.tsx` 재작성)

**핵심 발견**: 디자인 원본에는 별도의 "FigmaCard" 컴포넌트가 없다. `figma-card-rice.png`, `figma-card-blue-books.png`는 **이미지 파일명일 뿐**이며, 모든 상품 섹션(사전예약, 베스트, 신제품, 벨류업, 추천)은 단일 `.product-card` 마크업을 재사용한다.

기존 `FigmaCards.tsx`가 별도 카드로 만들어졌다면 **삭제하고 통합**한다.

### 7-1. 단일 마크업 (모든 섹션 공통)

```jsx
<article className={`product-card ${compact ? "compact" : ""}`} data-placeholder={isPlaceholder}>
  <div className="thumb">
    <img src={imageUrl} alt={title || ""} />
    <button
      className={`like-button ${liked ? "is-liked" : ""}`}
      type="button"
      aria-label="찜하기"
      aria-pressed={liked}
      onClick={onToggleLike}
    />
  </div>
  <button
    className={`cart-button ${added ? "is-added" : ""}`}
    type="button"
    onClick={onAddToCart}
  >
    [icon-cart-card.svg 18x17] 담기
  </button>
  <h3>
    <span className="title-line">{titleLine1}</span>
    <span className="title-line">{titleLine2}</span>
  </h3>
  <p className="price">
    <span>{discountRate}%</span>
    <strong>{formatPrice(price)}</strong>
    <del>{formatPrice(originalPrice)}</del>
  </p>
  <p className="review">{reviewCount}+</p>
</article>
```

### 7-2. 픽셀 명세

| 요소 | 값 |
|---|---|
| `.product-card` | `w-[280px] text-kn541-black` |
| `.thumb` | `relative overflow-hidden w-full h-[320px] rounded-[10px] bg-[#e8e8e8]` |
| `.thumb img` | `w-full h-full object-cover` |
| `.like-button` | `absolute right-[20.28px] bottom-[20px] w-[23.72px] h-[20px]` |
| `.cart-button` | `flex items-center justify-center gap-[9px] w-full h-[36px] mt-[12px] border border-[#b5b5b5] rounded-[5px] text-[16px] font-normal` |
| `.cart-button img` | `w-[18px] h-[17px]` |
| `.cart-button.is-added` | `border-kn541-green bg-kn541-green-soft text-kn541-green` |
| `.product-card h3` | `overflow-hidden min-h-[38px] my-[17px_11px] text-[16px] font-light leading-normal tracking-[-0.32px]` |
| `.title-line` | `block whitespace-nowrap` (2줄 강제 줄바꿈) |
| `.price` | `flex items-baseline flex-wrap gap-x-[12px] m-0 leading-[1.2]` |
| `.price span` | `text-[#ff5452] text-[18px] font-normal` (할인율) |
| `.price strong` | `text-[18px] font-bold` (현재가) |
| `.price del` | `order-[-1] basis-full mb-[3px] text-[#b5b5b5] text-[14px] font-normal decoration-1` |
| `.review` | `relative ml-[17px] mt-[14px] text-[#b5b5b5] text-[13px] font-normal leading-[1.2]` |
| `.review::before` | 의사요소 — 별 아이콘 (icon-review-card.svg 12x12) |

### 7-3. placeholder 카피 (디자인 원본 그대로)

```typescript
{
  imageUrl: MAIN_PAGE_ASSETS.featured.best[i],
  titleLine1: "[사전예약] 제품명 제품명 제품명 제품명 제품",
  titleLine2: "제품명 제품명 제품명 제품명 제품명",
  discountRate: 88,
  price: 88888,
  originalPrice: 88888,
  reviewCount: "999",
  isPlaceholder: true,
}
```

### 7-4. 가격 포맷

`formatPrice(88888)` → `"88,888원"` (Phase 1에서 적용 완료)

---

## 8. C6 — 상품 섹션별 레이아웃

### 8-1. 사전예약 섹션 (라인 301~440)

```jsx
<section className="product-section container">
  <div className="section-heading eyebrow-heading">
    <div>
      <p className="eyebrow">사전 예약 상품</p>
      <h2>이 달의 특별한 사전 예약 상품을 만나보세요.</h2>
    </div>
    <a href="/products?product_type=002" className="pc">전체보기 <ChevronRight /></a>
    <div className="eyebrow-content">
      <p className="eyebrow-content-title">사전예약 종료까지</p>
      <div className="eyebrow-content-wrap">
        [그라디언트 시계 SVG 19x19]
        <h2 className="eyebrow-content-stress">88 : 88 : 88</h2>
      </div>
    </div>
  </div>
  <div className="slider-shell">
    <button className="rail-arrow rail-prev mobile" type="button">[← SVG]</button>
    <div className="product-rail" data-rail>
      {/* product-card × 9개 (가로 스크롤) */}
    </div>
    <button className="rail-arrow rail-next mobile" type="button">[→ SVG]</button>
  </div>
</section>
```

### 8-2. 베스트 섹션 (라인 441~530)

```jsx
<section className="best-section">
  <div className="best-inner container">
    <div className="best-heading">
      <div className="best-heading-text mobile">
        <p className="best-sub-title">BEST ITEMS</p>
        <h2 className="best-title">베스트 상품</h2>
        <p className="best-description">지금 인기 급상승 중인 상품을 만나보세요.</p>
      </div>
      <div className="section-heading pc mb-best-section">
        <div>
          <p className="eyebrow">베스트 상품</p>
          <p className="mb-best-description">지금 인기 급상승 중인 상품을 만나보세요.</p>
        </div>
        <a href="#data-todo">전체보기 <ChevronRight /></a>
      </div>
      <div className="best-heading-image">
        <img src={MAIN_PAGE_ASSETS.featured.best[0]} alt="베스트 상품 이미지" />
      </div>
    </div>
    <div className="best-grid m-best-grid">
      {/* product-card.compact × 8개 (4열 × 2행) */}
    </div>
  </div>
</section>
```

| 요소 | 값 |
|---|---|
| `.best-section` | `mt-[28px] py-[96px_84px] bg-[linear-gradient(180deg,#c9e9aa_0%,#fff_30%)]` |
| `.best-heading` | `flex items-center justify-between w-full mb-[52px] gap-[24px]` |
| `.best-heading-image img` | `absolute w-[498px] h-[284px] aspect-[249/142] object-contain mr-[106px]` |
| `.best-sub-title` | `text-[55px] font-medium leading-normal text-kn541-black` (모바일만) |
| `.best-title` | `text-[28px] font-semibold tracking-[-0.56px]` |
| `.best-description` | `text-[16px] font-normal tracking-[-0.32px]` |
| `.best-grid` | `grid grid-cols-[repeat(4,280px)] gap-[40px_55px]` |
| `.eyebrow` | `text-[28px] font-bold leading-[100%] tracking-[-0.02em] mb-[7px]` |

### 8-3. 프로모 띠 (라인 532~540)

```jsx
{/* 모바일 — promo-strip */}
<section className="promo-strip container mobile">
  <p>가치 소비의 지름길, 5월 사전예약 상품 OPEN!</p>
  <div className="promo-images">
    <img src={MAIN_PAGE_ASSETS.banners.gift} alt="" />
  </div>
</section>

{/* PC — promo-strip-pc (다른 이미지) */}
<section className="promo-strip-pc">
  <img src={MAIN_PAGE_ASSETS.banners.mobileGift} alt="" />
</section>
```

| 요소 | 값 |
|---|---|
| `.promo-strip` | `flex items-center justify-between h-[70px] my-[62px_41px] mx-auto px-[52px] bg-[linear-gradient(90deg,#00eb7a_0%,#c0ff91_100%)]` |
| `.promo-strip p` | `text-[20px] font-bold text-kn541-black` |
| `.promo-images` | `relative flex items-center w-[360px] h-[70px]` |

### 8-4. 신제품 섹션 (라인 542~613)

```jsx
<section className="product-section container new-product-section">
  <div className="section-heading">
    <div>
      <p className="eyebrow">신제품</p>
      <h2>방금 도착한 따끈따끈한 신상품을 만나보세요.</h2>
    </div>
    <a href="/products"><ChevronRight /></a>
  </div>
  <div className="slider-shell">
    <div className="product-rail" data-rail>
      {/* product-card × 9개 (백엔드 신규 정렬, 없으면 placeholder) */}
    </div>
  </div>
</section>
```

### 8-5. 벨류업 섹션 (라인 615~688)

```jsx
<section className="product-section container">
  <div className="section-heading value-heading-mobile">
    <div>
      <p className="eyebrow">벨류업 상품</p>
      <h2>소비의 가치를 높여주는 특별한 상품을 만나보세요.</h2>
    </div>
    <a href="#data-todo"><ChevronRight /></a>
  </div>
  <div className="two-column-products">
    <article className="value-panel">
      <img src={MAIN_PAGE_ASSETS.banners.valuePanel} alt="" />
      <div>
        <h2>벨류업 상품</h2>
        <p>소비의 가치를 높여주는<br />특별한 상품을 만나보세요.</p>
      </div>
    </article>
    <div className="best-grid small">
      {/* product-card.compact × 6개 (3열 × 2행) */}
    </div>
  </div>
</section>
```

| 요소 | 값 |
|---|---|
| `.two-column-products` | `grid grid-cols-[280px_1fr] gap-[50px]` |
| `.value-panel` | `relative overflow-hidden min-h-[1047px] bg-kn541-green-light` |
| `.value-panel::after` | 의사요소 어두운 그라디언트 오버레이 `linear-gradient(180deg,rgba(11,24,0,0.4),rgba(120,120,120,0.2))` |
| `.value-panel div` | `absolute top-[192px] left-[32px] z-10 text-white text-shadow-[2px_2px_2px_rgba(0,0,0,0.25)]` |
| `.value-panel h2` | `text-[38px] font-semibold` |
| `.value-panel p` | `mt-[22px] text-[20px] font-normal tracking-[-0.4px]` |
| `.best-grid.small` | `grid grid-cols-[repeat(3,280px)] gap-[40px_55px]` |

### 8-6. 추천 섹션 (라인 690~738)

```jsx
<section className="product-section container last-section">
  <div className="section-heading">
    <div>
      <p className="eyebrow">추천 상품</p>
      <h2>지금 주목할 만한 추천 상품을 만나보세요.</h2>
    </div>
    <a href="#data-todo"><ChevronRight /></a>
  </div>
  <div className="product-rail final-rail">
    {/* product-card.compact × 4개 (4열 grid, getRecommendedProductsForMain 결과) */}
  </div>
</section>
```

| 요소 | 값 |
|---|---|
| `.final-rail` | `grid grid-cols-[repeat(4,280px)] gap-[53px] overflow-visible` (auto-flow 제거) |

추천 응답이 없으면 섹션 자체를 렌더하지 않음 (Phase 4 결정사항 유지).

---

## 9. C7 — 카트 팝업 (드로어 → 중앙 팝업)

현재 `AsideSidebarCartClient`는 우측 사이드바 드로어. 디자인은 **중앙 정렬 모달 팝업**(원본 라인 779~819).

**파일**: `src/components/main-page/CartPopup.tsx` (신규, AsideSidebarCart는 다른 라우트에서 그대로 사용 가능)

### 9-1. 마크업

```jsx
<div className="cart-popup" role="dialog" aria-modal="true" hidden={!isOpen}>
  <div className="cart-popup-panel">
    <button className="cart-popup-close" type="button" aria-label="닫기" onClick={onClose} />
    <div className="cart-popup-handle" aria-hidden="true" />
    <h2>상품선택</h2>
    <div className="cart-popup-product">
      <img src={item.image} alt="" />
      <p>
        <span>{item.titleLine1}</span>
        <span>{item.titleLine2}</span>
      </p>
    </div>
    <div className="cart-popup-price">
      <strong>{formatPrice(item.price)}</strong>
      <del>{formatPrice(item.originalPrice)}</del>
      <span>{item.discountRate}%</span>
      <div className="qty-control" aria-label="수량 선택">
        <button className="qty-minus" type="button" onClick={dec} aria-label="수량 감소" />
        <output>{qty}</output>
        <button className="qty-plus" type="button" onClick={inc} aria-label="수량 증가" />
      </div>
    </div>
    <dl className="cart-popup-info">
      <div><dt>주문한도</dt><dd>최대 5개</dd></div>
      <div><dt>배송방법</dt><dd>택배발송</dd></div>
      <div><dt>배송비</dt><dd>4,000원</dd></div>
    </dl>
    <button className="cart-popup-submit" type="button" onClick={addToCart}>장바구니 담기</button>
  </div>
</div>
```

### 9-2. 픽셀 명세

| 요소 | 값 |
|---|---|
| `.cart-popup` | `fixed inset-0 z-[60] grid place-items-center bg-black/50` |
| `.cart-popup-panel` | `relative w-[400px] p-[38px_29.73px_22px_30px] overflow-hidden border-[0.5px] border-[#b5b5b5] rounded-[40px] bg-white` |
| `.cart-popup-close` | `absolute top-[41.5px] right-[30px] w-[18px] h-[18px]` (X 의사요소) |
| `.cart-popup h2` | `mt-0 mb-[17px] text-[22px] font-semibold tracking-[-0.44px]` |
| `.cart-popup-product` | `flex items-start gap-[14px] h-[76px] border-b border-[#b5b5b5]` |
| `.cart-popup-product img` | `w-[50px] h-[50px] rounded-[5px] object-cover` |
| `.cart-popup-price strong` | `text-[18px] font-semibold text-kn541-black` |
| `.cart-popup-price del` | `ml-[12px] text-[14px] text-[#b5b5b5]` |
| `.cart-popup-price span` | `ml-[44px] text-[18px] text-[#ff5452]` |
| `.qty-control` | `absolute top-[14px] right-0 grid grid-cols-[28px_41px_28px] w-[97px] h-[35px] rounded-[20px] bg-[#f0f0f0]` |
| `.cart-popup-submit` | `block w-[340px] bg-kn541-green text-white` (CSS 1465+ 행 추가 확인) |

### 9-3. 트리거

`product-card`의 `cart-button` 클릭 → 카트 팝업 열림 → 수량 선택 → "장바구니 담기" → CartContext.addItem.

---

## 10. C8 — 모바일 하단 네비 (원본 라인 819+)

**파일**: `src/components/main-page/MobileBottomNav.tsx`

PC에서는 `display: none`. 모바일(≤767px)에서만 표시.

```jsx
<nav className="mobile-bottom" aria-label="모바일 하단 메뉴">
  <button className="mb-btn" type="button"> [메뉴 SVG 17x14] 메뉴 </button>
  <button className="mb-btn" type="button"> [홈 SVG] 홈 </button>
  <button className="mb-btn" type="button"> [카트 SVG] 장바구니 </button>
  <button className="mb-btn" type="button"> [마이 SVG] 마이 </button>
</nav>
```

원본 CSS 라인 1267 시작 — `display: none` 기본, 모바일 미디어쿼리에서 `display: flex` 활성화.

---

## 11. 검증 체크리스트

작업 완료 후 다음을 확인:

- [ ] `npm run build` 통과 (Tailwind v4 토큰 인식)
- [ ] Vercel 배포 READY
- [ ] PC 1280px 폭 컨테이너 정렬 (히어로 copy 좌측 거터, hero-controls 우측 거터)
- [ ] 헤더 높이 정확 (`py-[18px]` 18 + 18 + 27(로고) = 63px)
- [ ] 검색박스 360x35 (PC), 38px 높이 (모바일)
- [ ] 카테고리 nav 48px 높이, 17개 탭 모두 노출, 활성 탭 underline 동작
- [ ] 히어로 370px 높이, 4개 슬라이드 5초 자동, pause 토글
- [ ] 7개 카테고리 타일 (best/mall/new/reserve/value/office/kn541), 97x97 원형 + 75x75 이미지
- [ ] 상품 카드 280×(320+카트버튼+제목+가격+리뷰) 구조 통일
- [ ] 가격 split 마크업 `<span>88%</span><strong>88,888원</strong><del>88,888원</del>` 정확
- [ ] best-section 그라디언트 배경 (#c9e9aa → #fff)
- [ ] value-panel 1047px 높이, 그라디언트 오버레이, 텍스트 absolute
- [ ] promo-strip 그라디언트 (#00eb7a → #c0ff91), 70px 높이
- [ ] 카트 클릭 시 중앙 팝업 (400px wide, radius 40)
- [ ] 모바일 하단 네비 (≤767px)
- [ ] 추천 4개 — 응답 없으면 섹션 미렌더
- [ ] 다국어 ko/en/zh 빌드 통과
- [ ] 회귀: /cart, /checkout, /myshop, /products 페이지 빌드 + 정상 렌더

## 12. Commit 권장 분할

```
C1: chore(shop): tailwind 토큰 추가 (kn541 디자인 정합성)
C2: feat(shop): 헤더 신규 — site-header + mobile-header + category-nav (Phase 3)
C3: refactor(shop): 히어로 + 웰컴 + 카테고리 타일을 디자인 원본 스펙으로 정확 재현
C4: refactor(shop): 모든 상품 섹션을 product-card 단일 컴포넌트로 통일 (figma-card 별도 컴포넌트 폐기)
C5: feat(shop): 카트 중앙 팝업 + 모바일 하단 네비 추가
```

각 commit 후 빌드 확인 권장. C2와 C4는 큰 변화이므로 분리 필수.

## 13. Cursor 작업 시작 가이드

1. 위 디자인 원본 3개 파일을 정독 (특히 style.css 108~570행, index.html 10~280행).
2. `src/components/main-page/` 하위 기존 파일 전수 검토 → 디자인 원본 기준으로 재작성 또는 새 파일 추가.
3. **전역 컴포넌트 (`src/components/Header/Header.tsx`, `Footer.tsx`)는 손대지 않음** — Phase 2에서 Footer는 이미 새 디자인 적용됨, Header는 메인 전용 헤더가 별도로 main-page 하위에 들어감.

   ⚠️ **주의**: 메인 페이지가 새 헤더를 쓰도록 `src/app/[locale]/(shop)/(home)/page.tsx`에서 layout 헤더를 override하거나, 메인 헤더를 `MainPageBody.tsx` 최상단에서 직접 렌더하는 방식으로 처리. 다른 페이지(상품, 마이 등)는 기존 Ciseco 헤더 유지.
4. 각 commit 후 즉시 빌드 + 푸시 → Vercel 배포 자동.
5. 최종 검증 시 `https://shop.kn541.co.kr/ko` 와 `/Users/kn541/Desktop/kn541/디자인/외주/public/index.html` 직접 비교.

작업 완료 보고 시 다음을 명시:
- C1~C5 commit SHA 5개
- 빌드 통과 / Vercel 배포 URL
- 디자인 원본 대조 결과 (사용자가 지적한 "탑 텍스트 크기, 검색버튼, 아이콘, 탑 높이, 히어로 높이, 상품 이미지/텍스트/기능" 6개 항목 모두 해결됐는지)
