# KN541 쇼핑몰 — Cursor/Code 작업지시서
> 작성일: 2026-04-27 | 우선순위 순 정렬 | 환경: Next.js 15 App Router + Tailwind + TypeScript

---

## 공통 규칙
- 파일 경로 prefix: `ciseco-nextjs/src/app/[locale]/(shop)/(other-pages)/`
- API 베이스: `process.env.NEXT_PUBLIC_API_URL`
- **비로그인 가드 패턴** (모든 마이페이지에 적용):
  ```tsx
  const [authChecked, setAuthChecked] = useState(false)
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) { router.replace(`/${locale}`); return }
    setAuthChecked(true)
  }, [locale, router])
  if (!authChecked) return <LoadingSpinner />
  ```
- `locale`: `usePathname().split('/')[1] || 'ko'`
- `router.push`(next/navigation)는 locale 명시: `/${locale}/...`
- `<Link>`(@/shared/link, next-intl)는 href에 locale 포함 금지: `/products/...`

---

## TASK 1 — 마이페이지: 주문 목록
**파일:** `mypage/orders/page.tsx`

- API: `GET /mypage/orders?page=1&size=10` (Authorization 헤더)
- 응답: `data.items[]` — order_id, order_no, order_status, total_amount, created_at, items[0].product_name, item_count
- 주문 상태 한국어:
  - PENDING→결제대기, PAID→결제완료, PREPARING→상품준비중, SHIPPED→배송중, DELIVERED→배송완료, CANCELLED→취소됨
- 각 주문 클릭 → `/${locale}/mypage/orders/[order_id]` 이동
- 페이지당 10건, 페이지네이션
- 빈 목록 → "아직 주문이 없습니다" + 쇼핑하기 버튼

---

## TASK 2 — 마이페이지: 주문 상세 + 취소
**파일:** `mypage/orders/[id]/page.tsx`

- API: `GET /mypage/orders/{order_id}` (Authorization)
- 표시: 주문번호, 주문일시, 상태, 상품목록(이미지+이름+수량+금액), 배송지, 결제수단, 결제금액
- 배송중/완료 → 송장번호 표시
- 결제대기/결제완료 상태 → **주문취소 버튼** 표시
  - 확인 모달 후 `PATCH /orders/{order_id}/cancel` body: `{cancel_reason: "고객 취소"}`
  - 취소 성공 시 toast + 상태 업데이트

---

## TASK 3 — 마이페이지: 배송지 관리
**파일:** `mypage/addresses/page.tsx`

- 목록: `GET /my/addresses`
- 추가: `POST /my/addresses` body: `{recipient_name, recipient_phone, zip_code, address1, address2?, delivery_memo?, is_default}`
- 삭제: `DELETE /my/addresses/{id}`
- 기본 설정: `PATCH /my/addresses/{id}` body: `{is_default: true}`
- 주소 검색: 기존 `@/components/common/KakaoAddressSearch` 컴포넌트 재사용
- 기본 배송지에 "기본" 뱃지 표시, 최대 5개 제한

---

## TASK 4 — 위시리스트 기능 (LikeButton 연동)
**파일:** `mypage/wishlists/page.tsx` + `src/components/LikeButton.tsx` 수정

- 위시리스트 목록: `GET /my/wishlists`
- 추가: `POST /my/wishlists` body: `{product_id}`
- 삭제: `DELETE /my/wishlists/{product_id}`
- **LikeButton.tsx 수정**: 클릭 시 비로그인 → 로그인 페이지, 로그인 → API 토글
- 상품 목록/상세에서 LikeButton에 `productId` prop 전달 (현재 미전달)
- 위시리스트 페이지: 기존 ProductCard 컴포넌트로 상품 목록 표시

---

## TASK 5 — 마이페이지: 프로필 수정
**파일:** `mypage/profile/page.tsx` (기존 파일 확인 후 수정)

- 조회: `GET /auth/me` (Authorization)
- 수정: `PATCH /my/profile` body: `{name, email, phone}`
- 수정 불가 필드: 아이디, 회원번호, 회원유형 (표시만)
- 저장 후 toast 알림

---

## TASK 6 — 마이페이지: 비밀번호 변경
**파일:** `mypage/change-password/page.tsx` (기존 파일 확인 후 수정)

- API: `POST /my/change-password` body: `{current_password, new_password}`
- 입력: 현재 비밀번호, 새 비밀번호 (8자 이상), 새 비밀번호 확인 (일치 검사)
- 성공 → toast + 폼 초기화

---

## TASK 7 — 이용약관 · 개인정보처리방침 페이지 (신규)
**파일:**
- `ciseco-nextjs/src/app/[locale]/(shop)/(other-pages)/terms/page.tsx`
- `ciseco-nextjs/src/app/[locale]/(shop)/(other-pages)/privacy/page.tsx`

- 회원가입 약관 링크(`/ko/terms`, `/ko/privacy`) 현재 404 → 실제 페이지 생성
- 내용: 전자상거래 표준 약관 템플릿 사용
- 회사명: KN541, 연락처: 070-4436-0928
- 레이아웃: (other-pages)/layout.tsx 자동 적용 (헤더·푸터 포함)
- 스타일: `prose prose-sm max-w-3xl mx-auto` 클래스로 긴 텍스트 문서 형식

---

## TASK 8 — CS: 공지사항 페이지
**파일:** `cs/notice/page.tsx` (기존 파일 내용 수정)

- 공지 목록 API: `GET /cs/notices?page=1&size=10`
  - 실패 시 정적 더미 공지 3개로 폴백 (서비스 안내, 이용 안내, 개발 중 안내)
- 응답: `{items: [{notice_id, title, created_at, is_pinned}], total}`
- 클릭 → `/cs/notice/[id]` 상세
- is_pinned 공지 → "📌" 아이콘 + 상단 고정

---

## TASK 9 — CS: 1:1 문의 페이지
**파일:** `cs/inquiry/page.tsx` (기존 파일 내용 수정)

- 비로그인 → 로그인 페이지 이동
- 문의 목록: `GET /cs/inquiries` (Authorization)
- 문의 작성: `POST /cs/inquiries` body: `{title, content, category}`
  - category 옵션: 주문/결제, 배송, 교환/반품, 상품문의, 기타
- 답변 상태: 답변대기(주황 뱃지), 답변완료(초록 뱃지)

---

## TASK 10 — 상품 검색 기능
**파일:** `search/page.tsx` (기존 파일 확인)

- URL 파라미터: `?q=검색어`
- API: `GET /products?search={q}&page=1&size=20`
- 헤더 검색창 입력 → `/${locale}/search?q=xxx` 이동
- 결과 없으면 "검색 결과가 없습니다" + 상품목록 바로가기
- 로딩 중 스켈레톤 UI
- 기존 ProductCard 컴포넌트 재사용

---

## TASK 11 — 수당 현황 (창업회원 전용)
**파일:** `mypage/commission/page.tsx` (기존 파일 확인)

- 창업회원(user_type='006') 아니면 → "창업회원 전용 기능입니다" 안내 화면
- API: `GET /my/commissions?month=2026-04` (Authorization)
- 표시: 이번달 수당, 누적 수당, 월별 수당 테이블
- 월 선택 드롭다운 (최근 12개월)

---

## 공통 컴포넌트 참고
| 컴포넌트 | 경로 |
|---|---|
| 주소검색 | `src/components/common/KakaoAddressSearch.tsx` |
| 장바구니 | `src/lib/cart-context.tsx` → `useCart()` |
| 토스트 | `import toast from 'react-hot-toast'` |
| ProductCard | `src/components/ProductCard.tsx` |
| 로딩 스피너 | `<svg className="h-8 w-8 animate-spin text-primary-600">` |
