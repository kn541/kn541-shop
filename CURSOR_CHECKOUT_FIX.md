# KN541 결제 버그 수정 — Cursor 작업지시서 (수정본)

> **원인 확정:** `selectedIds`가 localStorage에 저장되지 않음
> → 장바구니→결제 페이지 이동 시 전체 아이템 자동 선택
> → DELETED/DISCONTINUED 상품 포함 → 백엔드 "상품을 찾을 수 없습니다" 거부

---

## TASK 1: cart-context.tsx — selectedIds localStorage 저장

**파일:** `ciseco-nextjs/src/lib/cart-context.tsx`

### 문제
```javascript
// 현재: 로드 시 전체 자동 선택 (항상)
setSelectedIds(new Set(valid.map((i: any) => i.id)))
```

### 수정
selectedIds도 localStorage에 저장하고, 로드 시 복원:

```javascript
const STORAGE_KEY = 'kn541_cart'
const SELECTED_KEY = 'kn541_cart_selected'

// 로드 시
useEffect(() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed: any[] = JSON.parse(raw)
      const valid = parsed.filter(isValidItem)
      setItems(valid)
      
      // selectedIds 복원 — 저장된 게 있으면 복원, 없으면 전체 선택
      const selectedRaw = localStorage.getItem(SELECTED_KEY)
      if (selectedRaw) {
        const savedIds: string[] = JSON.parse(selectedRaw)
        // 유효한 아이템 ID만 필터
        const validIds = valid.map((i: any) => i.id)
        setSelectedIds(new Set(savedIds.filter(id => validIds.includes(id))))
      } else {
        setSelectedIds(new Set(valid.map((i: any) => i.id)))
      }
    }
  } catch {}
  setHydrated(true)
}, [])

// 저장 시 — items + selectedIds 함께
useEffect(() => {
  if (!hydrated) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    localStorage.setItem(SELECTED_KEY, JSON.stringify([...selectedIds]))
  } catch {}
}, [items, selectedIds, hydrated])
```

### 완료 기준
- [ ] 장바구니에서 3개 선택 → 결제 이동 → 3개만 표시
- [ ] 새로고침해도 선택 상태 유지
- [ ] 상품 제거 시 selectedIds에서도 제거

---

## TASK 2: 백엔드 POST /orders — DELETED 상품 건너뛰기

**레포:** `kn541/kn541` (backend)
**파일:** `backend/routers/orders/` (주문 생성 라우터)

### 현재
items에 DELETED/DISCONTINUED 상품이 포함되면 전체 주문 실패.

### 수정
유효하지 않은 상품은 건너뛰고, 유효한 상품만으로 주문 생성.
모든 상품이 무효하면 에러 반환.

```python
# 상품 유효성 체크
valid_items = []
skipped_items = []
for item in request_items:
    product = db.table("products").select("*").eq("id", item.product_id)\
        .in_("product_status", ["ACTIVE", "ON_SALE"])\
        .eq("is_display", True).limit(1).execute()
    rows = _rows(product)
    if rows:
        valid_items.append((item, rows[0]))
    else:
        skipped_items.append(item.product_id)

if not valid_items:
    raise HTTPException(400, detail="주문 가능한 상품이 없습니다")

# valid_items만으로 주문 생성
# 응답에 skipped 정보 포함
return {
    "status": "success",
    "data": {
        "order_id": ...,
        "order_no": ...,
        "total_amount": ...,
        "skipped_products": skipped_items,  # 프론트에서 안내용
    }
}
```

### 완료 기준
- [ ] DELETED 상품 포함 주문 시 → 유효 상품만 주문 + skipped 목록 반환
- [ ] 모든 상품 무효 시 → 400 에러 "주문 가능한 상품이 없습니다"
- [ ] 유효 상품만 주문 시 → 기존과 동일 동작

---

## TASK 3: 주소록 선택 — 저장된 배송지 탭 UI

**파일:** `ciseco-nextjs/src/app/[locale]/(shop)/(other-pages)/checkout/page.tsx`

배송 정보 섹션 상단에 2개 모드 버튼:

```tsx
<div className="mb-4 flex gap-2">
  <button onClick={() => { setShowNewForm(true); setSameAsMember(false) }}
    className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
      showNewForm
        ? 'bg-primary-600 text-white'
        : 'border border-neutral-200 text-neutral-600 hover:border-neutral-300'
    }`}>
    새 배송지 입력
  </button>
  <button onClick={() => { setShowNewForm(false); setSameAsMember(false) }}
    className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
      !showNewForm
        ? 'bg-primary-600 text-white'
        : 'border border-neutral-200 text-neutral-600 hover:border-neutral-300'
    }`}>
    저장된 배송지 ({savedAddresses.length})
  </button>
</div>
```

저장된 배송지 없을 때:
```tsx
{!showNewForm && savedAddresses.length === 0 && (
  <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center">
    <p className="text-sm text-neutral-400 mb-2">저장된 배송지가 없습니다</p>
    <a href={`/${locale}/addresses`}
      className="text-sm text-primary-600 font-medium hover:underline">
      배송지 관리에서 등록하기
    </a>
  </div>
)}
```

### 완료 기준
- [ ] "새 배송지 입력" / "저장된 배송지(N)" 2개 버튼 표시
- [ ] 저장된 배송지 없으면 안내 + 링크
- [ ] 저장된 배송지 있으면 기존 목록 표시

---

## 실행 순서
```
1. TASK 1: cart-context.tsx selectedIds 저장 (프론트)
2. TASK 2: POST /orders DELETED 상품 스킵 (백엔드)
3. TASK 3: 주소록 탭 UI (프론트)
4. git push 양쪽 → 배포 → 검증
```
