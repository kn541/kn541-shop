# KN541 Shop — 상품 리스트 페이징 기능 추가

## 문제
상품 리스트 페이지(collections, search)에서 하단 페이지네이션이 동작하지 않음.
- `getProducts()`가 page/size 없이 호출 → 항상 첫 페이지만 표시
- Pagination UI가 1~4 하드코딩 → 클릭해도 실제 동작 안 함
- 백엔드 API는 페이징 지원 (page/size/total 반환)

## 수정 대상 파일

### 1. 데이터 레이어 — `ciseco-nextjs/src/data/data.ts`

`getProducts()` 함수가 total을 반환하지 않음. API 응답에서 total을 함께 반환하도록 수정:

```typescript
// 현재
export async function getProducts(params?) {
  const result = await apiGetProducts({ size: 20, page: params?.page, ... })
  return adaptProducts(result.items) // total 없음!
}

// 수정: total을 포함해서 반환
export async function getProducts(params?) {
  const result = await apiGetProducts({ size: params?.size ?? 20, page: params?.page, keyword: params?.q })
  if (result.items.length > 0) {
    return {
      products: adaptProducts(result.items),
      total: result.total ?? result.items.length,
      page: params?.page ?? 1,
      size: params?.size ?? 20,
    }
  }
  const dummy = getDummyProducts()
  return { products: dummy, total: dummy.length, page: 1, size: 20 }
}
```

**주의:** 이 함수의 반환 타입이 바뀌므로, 기존에 `getProducts()`를 호출하는 모든 곳을 수정해야 함.
기존 호출: `const products = await getProducts()` → `products.map(...)` 
수정 후: `const { products, total } = await getProducts()` → `products.map(...)`

### 2. API 레이어 확인 — `ciseco-nextjs/src/lib/api/products.ts`

`apiGetProducts()`가 `{ items, total, page, size }` 형태로 반환하는지 확인.
백엔드 응답: `GET /products?page=1&size=20` → `{ status, data: { items: [...], total: 1234, page: 1, size: 20 } }`

### 3. 컬렉션 페이지 — `ciseco-nextjs/src/app/[locale]/(shop)/(other-pages)/collections/[handle]/page.tsx`

현재 코드:
```tsx
const products = await getProducts()
// ... 하드코딩 Pagination
```

수정:
```tsx
export default async function Page({ params, searchParams }) {
  const { handle } = await params
  const sp = await searchParams
  const page = parseInt(sp?.page ?? '1', 10)
  const size = 20

  const { products, total } = await getProducts({ page, size, category: handle === 'all' ? undefined : handle })
  const totalPages = Math.ceil(total / size)

  return (
    <main>
      {/* 필터 */}
      {/* 상품 그리드 */}
      <div className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((p) => <ProductCard data={p} key={p.id} />)}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="mt-20 flex justify-center">
          <Pagination className="mx-auto">
            {page > 1 && <PaginationPrevious href={`?page=${page - 1}`} />}
            <PaginationList>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => Math.abs(p - page) <= 2 || p === 1 || p === totalPages)
                .map((p) => (
                  <PaginationPage key={p} href={`?page=${p}`} current={p === page}>
                    {p}
                  </PaginationPage>
                ))}
            </PaginationList>
            {page < totalPages && <PaginationNext href={`?page=${page + 1}`} />}
          </Pagination>
        </div>
      )}
    </main>
  )
}
```

### 4. 검색 페이지 — `ciseco-nextjs/src/app/[locale]/(shop)/(other-pages)/search/page.tsx`

동일한 방식으로 searchParams에서 page를 읽고, `getProducts({ q: keyword, page, size })` 호출.

### 5. 홈 상품 섹션 — `ciseco-nextjs/src/app/[locale]/(shop)/(home)/page.tsx`

홈의 상품 그리드는 페이징 불필요 (베스트/신상 등 제한적 표시). 
하지만 `getProducts()` 반환 형태가 바뀌므로 호출부 수정 필요:
```tsx
// 수정 전
const products = await getProducts()
// 수정 후
const { products } = await getProducts({ size: 12 })
```

### 6. 기존 Pagination 컴포넌트 확인

`ciseco-nextjs/src/shared/Pagination/Pagination.tsx`가 존재하고, href 기반으로 동작.
이 컴포넌트는 그대로 사용 가능 — 동적 페이지 수만 전달하면 됨.

## 페이지네이션 표시 규칙
- 총 페이지 1개 → 페이지네이션 숨김
- 총 5페이지 이하 → 전체 표시 (1 2 3 4 5)
- 6페이지 이상 → 현재 기준 ±2 + 처음/마지막 (1 ... 4 5 [6] 7 8 ... 15)
- 한 페이지당 20개 상품

## 완료 기준
- [ ] getProducts()가 { products, total } 형태로 반환
- [ ] collections/[handle] 페이지에서 ?page= 파라미터 연동
- [ ] 동적 페이지네이션 UI (총 페이지 수 기반)
- [ ] search 페이지에서도 페이징 동작
- [ ] 홈 페이지 등 기존 getProducts() 호출부 수정
- [ ] 빌드 성공 + 로컬 테스트
- [ ] git push
