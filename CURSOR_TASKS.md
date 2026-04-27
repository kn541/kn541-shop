# KN541 쇼핑몰 — Cursor/Code 작업지시서
> 최종 업데이트: 2026-04-27

---

## 완료된 TASK (Cursor 처리 완료)

| TASK | 파일 | 상태 |
|---|---|---|
| TASK 2 | `(accounts)/addresses/page.tsx` | ✅ 완료 |
| TASK 3 | `(accounts)/coupons/page.tsx` | ✅ 완료 (useCoupons 재사용) |
| TASK 4 | `(accounts)/points/page.tsx` | ✅ 완료 (테이블 정리) |
| TASK 5 | `(accounts)/commission/page.tsx` | ✅ 완료 (user_type 분기) |
| TASK 6 | `(shop)/(other-pages)/terms/page.tsx` | ✅ 완료 |
| TASK 7 | `(shop)/(other-pages)/privacy/page.tsx` | ✅ 완료 |
| TASK 8 | `(shop)/(other-pages)/cs/notice/page.tsx` | ✅ 완료 (더미 폴백) |
| TASK 9 | `(shop)/(other-pages)/cs/inquiry/page.tsx` | ✅ 완료 (useInquiries) |
| TASK 10 | `(shop)/(other-pages)/search/page.tsx` | ✅ 완료 (adaptProducts+ProductCard) |

---

## 미완료 TASK

### TASK 1 — 주문 상세 페이지 (신규)
**파일:** `src/app/[locale]/(accounts)/orders/[orderId]/page.tsx`

- API: `mypageFetch('/mypage/orders/' + orderId)`
- 표시: 주문번호, 일시, 상태(한국어), 상품목록(이미지+이름+수량+금액), 배송지, 결제금액
- 배송중/완료 → 송장번호 표시
- **주문취소 버튼**: PENDING/PAID/PREPARING 상태일 때만
  - API: `mypageFetch('/mypage/orders/' + orderId + '/cancel', { method: 'PATCH', body: JSON.stringify({ cancel_reason: '고객 취소' }) })`
  - 확인 모달 → 성공 시 toast + 상태 재조회
- 뒤로가기: `/${locale}/orders`

---

## 확정된 API 경로 (백엔드 통일)

```
주문 목록:   GET  /mypage/orders
주문 상세:   GET  /mypage/orders/{id}
주문 취소:   PATCH /mypage/orders/{id}/cancel    ← /mypage prefix 통일

공지 목록:   GET  /cs/notices
공지 상세:   GET  /cs/notices/{id}               ← 상세 라우트도 동일 prefix
```

---

## ⚠️ 빌드 오류 — 로컬에서 즉시 처리 필요

**오류:**
```
Error: You cannot define a route with the same specificity as an optional 
catch-all route ("/[locale]/mypage" and "/[*]/mypage/[[...path]]").
```

**원인:** `(shop)/(other-pages)/mypage/page.tsx` 가 `(mypage)/mypage/[[...path]]/page.tsx` 와 URL 충돌.  
GitHub API로는 파일 삭제 불가 → **로컬에서 직접 삭제 후 push 필요.**

**해결 명령어:**
```bash
git rm "ciseco-nextjs/src/app/[locale]/(shop)/(other-pages)/mypage/page.tsx"
git commit -m "fix: (shop)/mypage/page.tsx 삭제 — catch-all 라우트 충돌 해소"
git push
```

이 명령어 실행 후 빌드가 정상화됩니다.

---

## 공통 인프라 (참고)

```typescript
// API 클라이언트 — 반드시 mypageFetch 사용
import { mypageFetch } from '@/lib/mypage/api'
// → access_token 헤더 자동 추가
// → { status: "success", data: T } envelope 자동 unwrap
// → 401 시 MypageApiError throw
```

| 파일 | 용도 |
|---|---|
| `src/lib/mypage/api.ts` | fetch 클라이언트 |
| `src/lib/mypage/types.ts` | 타입 정의 |
| `src/lib/mypage/mocks.ts` | Mock 데이터 |
| `src/components/common/KakaoAddressSearch.tsx` | 주소 검색 |
