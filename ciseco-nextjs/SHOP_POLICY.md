# KN541 쇼핑몰 개발 정책

> 작성일: 2026-04-01 | 기획 창
> 쇼핑몰: https://kn541-shop.vercel.app

---

## 핵심 정책 — 프론트엔드는 API로만 데이터를 가져온다

### 절대 금지
- `src/data/data.ts` 하드코딩 데이터를 실제 화면에 사용 금지
- 프론트에서 Supabase 직접 연결 금지
- 컴포넌트 안에 데이터 하드코딩 금지

### 반드시 지켜야 할 규칙
- **모든 데이터는 FastAPI 백엔드 API 호출로만 가져온다**
- API Base URL: `process.env.NEXT_PUBLIC_API_URL`
- 인증이 필요한 API: `Authorization: Bearer {access_token}` 헤더 포함
- 인증 불필요 API (상품/카테고리 공개 조회 등): 헤더 없이 호출 가능

---

## API 호출 레이어 구조

```
쇼핑몰 컴포넌트
    ↓
src/lib/api/ (API 호출 함수 모음)
    ↓
FastAPI 백엔드 (kn541-production.up.railway.app)
    ↓
Supabase DB
```

---

## API 호출 파일 구조

```
ciseco-nextjs/src/lib/
  api/
    categories.ts    ← 카테고리 API
    products.ts      ← 상품 API
    cart.ts          ← 장바구니 API
    orders.ts        ← 주문 API
    auth.ts          ← 인증 API
    user.ts          ← 회원 API
  types/
    category.ts      ← 카테고리 타입
    product.ts       ← 상품 타입
    order.ts         ← 주문 타입
```

---

## API 호출 표준 코드

### 공개 API (인증 불필요)
```typescript
const BASE = process.env.NEXT_PUBLIC_API_URL

export async function getCategories() {
  const res = await fetch(`${BASE}/categories`)
  if (!res.ok) throw new Error('카테고리 조회 실패')
  const data = await res.json()
  return data.data.items
}
```

### 인증 필요 API
```typescript
export async function getMyOrders(token: string) {
  const res = await fetch(`${BASE}/orders/my`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('주문 조회 실패')
  const data = await res.json()
  return data.data.items
}
```

### Server Component에서 호출
```typescript
// app/(shop)/products/page.tsx
export default async function ProductsPage() {
  const products = await getProducts()  // src/lib/api/products.ts 호출
  return <ProductList products={products} />
}
```

### Client Component에서 호출
```typescript
'use client'
import { useEffect, useState } from 'react'

export default function CartComponent() {
  const [items, setItems] = useState([])
  useEffect(() => {
    getCartItems(token).then(setItems)
  }, [])
}
```

---

## data.ts 역할 변경

기존 `src/data/data.ts` 는:
- **타입 정의만** 유지 (TProductItem, TCollection 등)
- 실제 데이터 함수는 `src/lib/api/` 로 이전
- 더미 데이터는 **개발/테스트 fallback 용도**로만 유지

---

## 환경변수

```env
# ciseco-nextjs/.env.local (로컬)
NEXT_PUBLIC_API_URL=https://kn541-production.up.railway.app

# Vercel 환경변수 (배포)
NEXT_PUBLIC_API_URL=https://kn541-production.up.railway.app
```

---

## API 연동 개발 순서

1. 백엔드 API 완성 확인 (API_SPEC.md)
2. `src/lib/api/{기능}.ts` 작성
3. `src/lib/types/{기능}.ts` 타입 정의
4. 컴포넌트에서 호출
5. 로딩/에러 상태 처리
6. 배포 확인

---

*KN541 쇼핑몰 개발 정책 | 2026-04-01 | taiwang 승인*
