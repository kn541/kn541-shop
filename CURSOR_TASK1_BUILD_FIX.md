# KN541 Cursor 작업지시서 — TASK 1: 쇼핑몰 빌드 에러 수정

**긴급도: 🔴 최우선 (현재 배포 불가 상태)**
**작업 도구: Cursor (kn541-shop 레포)**
**작성일: 2026-04-27**

---

## 에러 내용

```
Error: You cannot define a route with the same specificity as an optional catch-all route
("/[locale]/mypage" and "/[*]/mypage/[[...path]]").
```

## 원인

`/[locale]/mypage/page.tsx`와 `/[locale]/mypage/[[...path]]/page.tsx`가 동시에 존재하여 Next.js 16 라우팅 충돌 발생.

## 해결 방법

`/[locale]/mypage/page.tsx` 파일을 **삭제**하세요.
`/[locale]/mypage/[[...path]]/page.tsx`가 catch-all로 모든 마이페이지 경로를 처리합니다.

만약 `mypage/page.tsx`가 `/account`로 리다이렉트하는 용도라면, 해당 로직을 `[[...path]]/page.tsx` 내부에서 path가 빈 배열일 때 리다이렉트하도록 변경하세요.

## 검증

```bash
cd ciseco-nextjs
npm run build
```

에러 없이 빌드 성공하면 git push → Vercel 자동 배포 확인.

## 주의사항
- next.config.mjs의 eslint 설정 경고도 있지만 빌드 실패 원인은 아님 (나중에 제거해도 됨)
- 빌드 성공 후 shop.kn541.co.kr 접속하여 상품 목록 정상 표시 확인
