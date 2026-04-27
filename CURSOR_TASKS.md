# KN541 쇼핑몰 — Cursor/Code 작업지시서
> 최종 업데이트: 2026-04-27 — **전체 완료**

---

## 완료된 TASK

| TASK | 파일 | 상태 |
|---|---|---|
| TASK 1 | `(accounts)/orders/[orderId]/page.tsx` | ✅ 완료 |
| TASK 2 | `(accounts)/addresses/page.tsx` | ✅ 완료 |
| TASK 3 | `(accounts)/coupons/page.tsx` | ✅ 완료 |
| TASK 4 | `(accounts)/points/page.tsx` | ✅ 완료 |
| TASK 5 | `(accounts)/commission/page.tsx` | ✅ 완료 |
| TASK 6 | `(shop)/(other-pages)/terms/page.tsx` | ✅ 완료 |
| TASK 7 | `(shop)/(other-pages)/privacy/page.tsx` | ✅ 완료 |
| TASK 8 | `(shop)/(other-pages)/cs/notice/page.tsx` | ✅ 완료 |
| TASK 9 | `(shop)/(other-pages)/cs/inquiry/page.tsx` | ✅ 완료 |
| TASK 10 | `(shop)/(other-pages)/search/page.tsx` | ✅ 완료 |
| 추가 | `payment/fail/page.tsx` — mypageFetch 전환 | ✅ 완료 |

---

## 확정된 API 경로

```
주문 목록:   GET   /mypage/orders
주문 상세:   GET   /mypage/orders/{id}
주문 취소:   PATCH /mypage/orders/{id}/cancel   ← 전체 통일 완료
공지 목록:   GET   /cs/notices
공지 상세:   GET   /cs/notices/{id}
문의 목록:   GET   /cs/inquiries
문의 작성:   POST  /cs/inquiries
배송지:      GET/POST/PATCH/DELETE /my/addresses
포인트:      GET   /my/points
쿠폰:       GET   /my/coupons
수당:       GET   /my/commissions
```

---

## ⚠️ 빌드 오류 — 로컬에서 즉시 처리 필요

**오류:**
```
Error: You cannot define a route with the same specificity as an optional 
catch-all route ("/[locale]/mypage" and "/[*]/mypage/[[...path]]").
```

**해결 명령어 (터미널에서 실행):**
```bash
git rm "ciseco-nextjs/src/app/[locale]/(shop)/(other-pages)/mypage/page.tsx"
git commit -m "fix: (shop)/mypage/page.tsx 삭제 — catch-all 라우트 충돌 해소"
git push
```

이 명령어 실행 후 빌드 정상화됩니다.
