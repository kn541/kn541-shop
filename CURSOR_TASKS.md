# KN541 쇼핑몰 — Cursor/Code 작업지시서 (정확한 구조 기반)
> 작성일: 2026-04-27 (구조 재조사 후 재작성)

---

## 실제 디렉토리 구조 (레포 확인 완료)

```
src/app/[locale]/
  (accounts)/           ← 마이페이지 모든 하위 페이지
    layout.tsx          ← 사이드바 탭 포함 공통 레이아웃
    PageTab.tsx
    AccountHeaderInfo.tsx
    orders/             → URL: /ko/orders
      page.tsx          ✅ 구현됨 (useOrders 훅 사용, mock fallback 있음)
      [orderId]/        → URL: /ko/orders/{id}  ← page.tsx 없음, 신규 필요
    account-wishlists/  → URL: /ko/account-wishlists
      page.tsx          ✅ 구현됨
    account-password/   → URL: /ko/account-password
      page.tsx          ✅ 구현됨
    addresses/          → URL: /ko/addresses     ← page.tsx 없음, 신규 필요
    commission/         → URL: /ko/commission    ← page.tsx 없음, 신규 필요
    coupons/            → URL: /ko/coupons       ← page.tsx 없음, 신규 필요
    points/             → URL: /ko/points        ← page.tsx 없음, 신규 필요
    myshop/             → URL: /ko/myshop        ← page.tsx 없음, 신규 필요
    dividends/          → URL: /ko/dividends     ← page.tsx 없음, 신규 필요
    tree/               → URL: /ko/tree          ← page.tsx 없음, 신규 필요
    account/            → URL: /ko/account       (프로필)
    upgrade-paid/
    withdraw/

  (mypage)/             ← 마이페이지 홈 전용
    mypage/[[...path]]/ → URL: /ko/mypage (catch-all)
      page.tsx          ✅ 기존 catch-all (SPA 방식)

  (shop)/(other-pages)/
    mypage/             ← ⚠️ 이번 세션에서 잘못 생성된 page.tsx 존재
                           → (mypage) 라우트그룹과 충돌 주의
    products/, cart/, checkout/ ...
    cs/notice/, cs/inquiry/, faq/ ...
    terms/, privacy/    ← page.tsx 없음, 신규 필요
```

---

## 공통 API 인프라 (이미 존재, 재사용 필수)

```typescript
// src/lib/mypage/api.ts
import { mypageFetch } from '@/lib/mypage/api'
// → 자동으로 localStorage access_token 헤더 추가
// → { status: "success", data: T } envelope 자동 unwrap
// → 401 시 MypageApiError throw

// 사용 예시
const data = await mypageFetch<OrderListResponse>('/mypage/orders?page=1&size=10')
```

**기존 훅 목록** (src/lib/mypage/):
| 훅 | API 경로 | 상태 |
|---|---|---|
| `useOrders` | `/mypage/orders` | ✅ mock fallback 있음 |
| `useProfile` | `/auth/me` | ✅ mock fallback 있음 |
| `useCoupons` | 미확인 | ✅ 파일 있음 |
| `usePoints` | 미확인 | ✅ 파일 있음 |
| `useInquiries` | 미확인 | ✅ 파일 있음 |
| `useMyShop` | 미확인 | ✅ 파일 있음 |
| `useMypageHome` | `/mypage/home` | ✅ 파일 있음 |

---

## 공통 규칙

- **비로그인 가드**: `(accounts)/layout.tsx`에서 이미 처리하고 있을 가능성 큼 → 개별 페이지에서 중복 불필요
- **API 클라이언트**: 반드시 `mypageFetch` 사용 (직접 fetch 금지)
- **locale**: `useLocale()` from `next-intl` 사용 (이미 accounts 페이지들이 이렇게 씀)
- **번역**: `useTranslations('Account')` from `next-intl`

---

## TASK 1 — 주문 상세 페이지 (신규)
**파일:** `src/app/[locale]/(accounts)/orders/[orderId]/page.tsx`

현재 목록 페이지(`orders/page.tsx`)에서 `/${locale}/orders/${order_id}` 링크로 이동하지만 상세 페이지가 없음.

**요구사항:**
- API: `mypageFetch<OrderDetailResponse>('/mypage/orders/' + orderId)`
- `OrderDetailResponse` 타입은 `src/lib/mypage/types.ts`에 있으면 재사용, 없으면 추가
- 표시: 주문번호, 주문일시, 상태, 상품목록(이미지+이름+수량+금액), 배송지, 결제금액 합계
- 배송중/완료 → 송장번호 표시
- **주문취소 버튼**: 상태가 PENDING/PAID/PREPARING일 때만 표시
  - API: `mypageFetch('/orders/' + orderId + '/cancel', { method: 'PATCH', body: JSON.stringify({ cancel_reason: '고객 취소' }) })`
  - 확인 모달 후 실행, 성공 시 toast + 상태 재조회
- 뒤로가기 버튼: `/${locale}/orders`

---

## TASK 2 — 배송지 관리 페이지 (신규)
**파일:** `src/app/[locale]/(accounts)/addresses/page.tsx`

**API 경로** (백엔드 `/my/addresses` 사용):
- 목록: `mypageFetch<AddressList>('/my/addresses')`
- 추가: `mypageFetch('/my/addresses', { method: 'POST', body: ... })`
- 삭제: `mypageFetch('/my/addresses/' + id, { method: 'DELETE' })`
- 기본설정: `mypageFetch('/my/addresses/' + id, { method: 'PATCH', body: JSON.stringify({ is_default: true }) })`

**UI 요구사항:**
- 주소 검색: `@/components/common/KakaoAddressSearch` 컴포넌트 재사용
- 필드: recipient_name, recipient_phone, zip_code, address1, address2(선택), delivery_memo(선택), is_default
- 기본 배송지에 "기본" 뱃지
- 최대 5개 (초과 시 추가 버튼 비활성화)

---

## TASK 3 — 쿠폰 페이지 (신규)
**파일:** `src/app/[locale]/(accounts)/coupons/page.tsx`

- 기존 `useCoupons` 훅(`src/lib/mypage/useCoupons.ts`) 확인 후 재사용
- 표시: 쿠폰명, 할인금액/율, 사용 가능 기간, 사용 가능 상품 조건
- 탭: 사용 가능 / 사용 완료 / 만료
- 쿠폰 없으면 "보유한 쿠폰이 없습니다" 안내

---

## TASK 4 — 포인트 페이지 (신규)
**파일:** `src/app/[locale]/(accounts)/points/page.tsx`

- 기존 `usePoints` 훅(`src/lib/mypage/usePoints.ts`) 확인 후 재사용
- 상단: 현재 포인트 잔액 (큰 글씨)
- 하단: 적립/사용 내역 테이블 (날짜, 내용, 포인트 변동, 잔액)
- 1포인트 = 1원 안내 텍스트

---

## TASK 5 — 수당 현황 페이지 (신규, 창업회원 전용)
**파일:** `src/app/[locale]/(accounts)/commission/page.tsx`

- 창업회원 여부 확인: `useProfile()` → `user_type` 또는 `member_level` 기준
- 비창업회원 → "창업회원 전용 기능입니다" 안내 + 업그레이드 링크
- API: `mypageFetch('/my/commissions?month=YYYY-MM')`
- 표시: 이번달 수당, 누적 수당, 월별 내역 테이블
- 월 선택 드롭다운 (최근 12개월)

---

## TASK 6 — 이용약관 페이지 (신규)
**파일:** `src/app/[locale]/(shop)/(other-pages)/terms/page.tsx`

회원가입 페이지 약관 링크 `/ko/terms` 현재 404.

- 레이아웃: `(other-pages)/layout.tsx` 자동 적용 (헤더·푸터 포함)
- 스타일: `<div className="container max-w-3xl py-16 prose prose-sm dark:prose-invert">`
- 내용: 전자상거래 표준 이용약관 (회사명: KN541, 전화: 070-4436-0928)
- 주요 조항: 서비스 이용, 회원가입/탈퇴, 개인정보, 결제/환불, 면책사항

---

## TASK 7 — 개인정보처리방침 페이지 (신규)
**파일:** `src/app/[locale]/(shop)/(other-pages)/privacy/page.tsx`

회원가입 페이지 약관 링크 `/ko/privacy` 현재 404.

- 레이아웃: `(other-pages)/layout.tsx` 자동 적용
- 동일 prose 스타일
- 내용: 개인정보처리방침 (수집항목, 이용목적, 보유기간, 제3자 제공, 처리위탁, 권리·의무, 안전성 확보조치, 담당자 연락처)

---

## TASK 8 — CS: 공지사항 페이지 내용 구현
**파일:** `src/app/[locale]/(shop)/(other-pages)/cs/notice/page.tsx`

현재 200 응답이지만 내용 비어있을 가능성.

- API: `fetch(BASE + '/cs/notices?page=1&size=10')` (인증 불필요)
- 실패 시 정적 더미 공지 3개 폴백:
  ```
  [공지] KN541 서비스 안내
  [공지] 배송 안내
  [공지] 이용약관 변경 안내
  ```
- 상세 페이지: `/ko/cs/notice/[id]`

---

## TASK 9 — CS: 1:1 문의 페이지 내용 구현
**파일:** `src/app/[locale]/(shop)/(other-pages)/cs/inquiry/page.tsx`

- 기존 `useInquiries` 훅(`src/lib/mypage/useInquiries.ts`) 확인 후 재사용
- 비로그인 → `/ko/login?redirect=/ko/cs/inquiry`
- 문의 작성 폼: 카테고리(주문/결제, 배송, 교환/반품, 상품문의, 기타), 제목, 내용
- API: `mypageFetch('/cs/inquiries', { method: 'POST', body: ... })`
- 답변 상태 배지: 답변대기(주황), 답변완료(초록)

---

## TASK 10 — 상품 검색 페이지 연동
**파일:** `src/app/[locale]/(shop)/(other-pages)/search/page.tsx`

- URL 파라미터: `?q=검색어`
- API: `fetch(BASE + '/products?search=' + q + '&page=1&size=20')`
- 기존 `ProductCard` 컴포넌트(`@/components/ProductCard`) 재사용
- 결과 없으면 "검색 결과가 없습니다" + 상품목록 바로가기

---

## ⚠️ 충돌 주의

`(shop)/(other-pages)/mypage/page.tsx` 파일이 이번 세션에 잘못 생성됨.
`(mypage)/mypage/[[...path]]/page.tsx` 와 URL 충돌 가능.

**처리 방법**: `(shop)/(other-pages)/mypage/page.tsx` 파일 삭제 또는
`_page_removed.tsx`로 rename하여 라우팅에서 제외할 것.

---

## 참고 링크
- 실제 API 경로 확인: `src/lib/mypage/api.ts`, `src/lib/mypage/use*.ts`
- 타입 정의: `src/lib/mypage/types.ts`
- Mock 데이터: `src/lib/mypage/mocks.ts`
- 주소검색: `src/components/common/KakaoAddressSearch.tsx`
