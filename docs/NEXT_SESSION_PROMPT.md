# KN541 다음 세션 시작 프롬프트

아래 내용을 다음 Claude 창에 첫 메시지로 붙여넣으세요.

---

## 📋 복사해서 사용할 프롬프트

```
안녕하세요. KN541 프로젝트 이어서 작업합니다.

## 프로젝트 기본 정보

- 쇼핑몰: kn541/kn541-shop → https://shop.kn541.co.kr (Vercel: prj_79A3AewCKMp1kdLiPIMVp82yv3Ik)
- 어드민: kn541/kn541 → https://admin.kn541.co.kr (Vercel: prj_sZ5L9j9Ng7jrWvZz2FPdo9YRPFE9)
- 백엔드: https://kn541-production.up.railway.app (Railway, repo: kn541/kn541)
- Supabase: qxmcbdqmmiyrrhenufaj, team: team_drI09A5dIh6QJAO2GuDvPBRv
- 기술 스택: Next.js 15 + FastAPI(Python) + Supabase(PostgreSQL) + Railway + Vercel

## 2026-04-21 오후 세션 완료 작업

### 1. 배송비 표시 버그 수정 (쇼핑몰)
- `page.tsx`: adapters.ts가 `delivery.shipping_fee`로 저장하는데 최상위 구조분해 → undefined 버그 수정
- `sc_type` 로직 수정: KN541 DB 기준 1=무료, 2=조건부, 3=유료건당, 4=유료수량별
- calcItemShipping / shippingText 모두 sc_type=1 명시 처리

### 2. 장바구니 배송비 하드코딩 제거
- `cart-context.tsx`: CartItem에 shippingFee/freeShippingOver/scType 추가, calcItemShipping(), totalShipping
- `ProductActions.tsx`: 배송비 props 추가
- `page.tsx`: ProductActions에 delivery 정보 전달
- `cart/page.tsx`: 하드코딩 제거 → 상품별 배송비 표시

### 3. KMC 매핑 점검
- tax_type, product_type, soldout/discontinued 정상 확인
- sc_type 신규 등록 버그 발견 → kmc_sync.py에 map_kmc_sc_type() 적용
- `kmc_option_sync.py`: map_kmc_sc_type(), _attach_calculated_supply_prices() 추가

### 4. GET /kmc/products — calculated_supply_price 추가
- KMC 상품 목록에 우리 DB 마진 적용 공급가 붙이기
- `_attach_calculated_supply_prices(db, items)`: product_id 기준 배치 조회 (in-place)
- kmc_sync.py에서 `_attach_calculated_supply_prices(db, items)` 호출 (VS Code 직접 수정)

## 현재 남은 이슈

- sc_type=2(조건부무료)인데 sc_minimum=0인 상품 1,555개 (KMC 원본 데이터 문제)
- kmc_sync.py `_attach_fix.py` 삭제 완료 ✅

## KN541 sc_type 정의 (중요!)
| 값 | 의미 |
|---|---|
| 1 | 무료배송 |
| 2 | 조건부무료 (sc_minimum 이상 무료) |
| 3 | 유료 건당 |
| 4 | 유료 수량별 |

## 개발 규칙

- alert() 금지 → toast 사용
- 전역변수: system_codes 테이블
- 코드값 하드코딩 절대 금지
- 한국어 주석 필수
- 상품 handle = product_id (UUID)
- API 응답: `{status: "success", data: {items, total}}`

## 레포지토리 파일 구조

- 백엔드: backend/routers/ (FastAPI)
- 어드민: admin/starter-kit/src/ (Next.js + MUI)
- 쇼핑몰: ciseco-nextjs/src/ (Next.js + Tailwind)

## 주요 파일 경로

| 목적 | 파일 경로 |
|---|---|
| 쇼핑몰 상품 상세 | `ciseco-nextjs/src/app/[locale]/(shop)/(other-pages)/products/[handle]/page.tsx` |
| 쇼핑몰 장바구니 | `ciseco-nextjs/src/app/[locale]/(shop)/(other-pages)/cart/page.tsx` |
| 장바구니 Context | `ciseco-nextjs/src/lib/cart-context.tsx` |
| 상품 액션 | `ciseco-nextjs/src/app/.../products/[handle]/ProductActions.tsx` |
| API 어댑터 | `ciseco-nextjs/src/lib/adapters.ts` |
| KMC 연동 | `backend/routers/kmc_sync.py` |
| KMC 옵션/매핑 | `backend/routers/kmc_option_sync.py` |
```

---

*최종 업데이트: 2026-04-21 오후*
