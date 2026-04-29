# KN541 Shop 결제 페이지 수정 — Cursor 작업지시서

> **작업일:** 2026-04-29
> **레포:** `kn541/kn541-shop`
> **이슈 2건:** 장바구니 삭제상품 처리, 주소록 선택 UX

---

## TASK 1: 장바구니 → 결제 시 삭제/단종 상품 자동 제외

### 현상
장바구니에 DELETED/DISCONTINUED 상품이 포함된 채로 결제 진행 시
백엔드 `POST /orders`에서 "상품을 찾을 수 없습니다" 에러.

### 원인
장바구니는 localStorage에 영구 보관되므로, 담은 이후 상품이 삭제/단종되면
오래된 장바구니에 잔존. 결제 시점에 유효성 체크가 없음.

### 수정 — 2곳

**1) 장바구니 페이지 (`cart/page.tsx` 또는 CartPage)**
- 페이지 진입 시 장바구니 상품 productId 목록을 백엔드에 보내 유효성 체크
- `POST /products/validate-cart` 또는 기존 상품 조회 API 활용
- DELETED/DISCONTINUED/is_display=false 상품은 "판매 종료" 표시 + 선택 해제 + 결제 불가

**2) 결제 페이지 (`checkout/page.tsx`)**
- `orderableItems` 필터에 추가 조건: 결제 진입 시 한번 더 검증
- 유효하지 않은 상품이 있으면 장바구니로 돌려보내기

**간단한 해결 (우선):**
프론트에서 결제 전 `GET /products/{id}` 호출로 각 상품 유효성 체크하면 API 호출이 많음.
→ 대안: 백엔드 `POST /orders`에서 삭제/단종 상품만 제외하고 나머지만 주문 생성.
또는 장바구니 페이지에서 상품 목록 로드 시 API로 유효성 일괄 체크.

**가장 현실적인 방법:**
```typescript
// checkout/page.tsx — 결제 진입 시 유효성 체크
useEffect(() => {
  if (!mounted || orderableItems.length === 0) return
  const token = getToken()
  if (!token) return
  
  // 장바구니 상품 일괄 검증
  fetch(`${BASE}/cart/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ product_ids: orderableItems.map(i => i.productId) }),
  })
    .then(r => r.json())
    .then(data => {
      const invalidIds = data?.data?.invalid_ids ?? []
      if (invalidIds.length > 0) {
        toast.error(`판매 종료된 상품 ${invalidIds.length}건이 제외됩니다.`)
        // 장바구니에서 제거 또는 선택 해제
      }
    })
    .catch(() => {})
}, [mounted, orderableItems.length])
```

**백엔드 필요:** `POST /cart/validate` 또는 `POST /products/check-availability`
```python
@router.post("/cart/validate")
async def validate_cart(body: dict, db = Depends(get_db)):
    product_ids = body.get("product_ids", [])
    # products 테이블에서 유효한 상품만 조회
    valid = db.table("products").select("id").in_("id", product_ids)\
        .eq("product_status", "ACTIVE").eq("is_display", True).execute()
    valid_ids = {r["id"] for r in _rows(valid)}
    invalid_ids = [pid for pid in product_ids if pid not in valid_ids]
    return {"status": "success", "data": {"valid_ids": list(valid_ids), "invalid_ids": invalid_ids}}
```

### 완료 기준
- [ ] 장바구니에 삭제/단종 상품 포함 시 "판매 종료" 표시
- [ ] 결제 진행 시 유효 상품만 주문 생성
- [ ] "상품을 찾을 수 없습니다" 에러 해소

---

## TASK 2: 주소록 선택 기능 — 저장된 배송지 목록

### 현상
처음 주문하는 회원은 저장된 주소가 없어서 주소 목록이 안 보임.
기능 자체는 코드에 있으나 (savedAddresses.length > 0일 때 표시),
최초 주문 시에도 "주소록에서 선택" 옵션이 필요.

### 수정

**마이페이지 배송지 관리 (`/addresses`)에서 먼저 등록하도록 안내:**
결제 폼 상단에 "배송지 관리에서 미리 등록하면 다음 주문부터 선택할 수 있습니다" 안내 텍스트 추가.

**또는 (더 좋은 UX):**
결제 페이지 "배송 정보" 섹션 상단에 2개 탭/라디오 표시:
1. "새 배송지 입력" (기본)
2. "저장된 배송지" → 클릭 시 `/my/addresses` 조회 → 없으면 "저장된 배송지가 없습니다" 표시

### 수정 위치
**파일:** `checkout/page.tsx`

현재 코드:
```tsx
{savedAddresses.length > 0 && (
  <div className="mb-4 space-y-2">
    {savedAddresses.map(addr => ...)}
  </div>
)}
```

변경: savedAddresses가 없어도 "저장된 배송지" 탭을 보여주되, 빈 상태 안내:
```tsx
{/* 배송지 선택 모드 */}
<div className="mb-4 flex gap-2">
  <button onClick={() => setShowNewForm(true)}
    className={`rounded-xl px-4 py-2 text-sm ${showNewForm ? 'bg-primary-600 text-white' : 'border'}`}>
    새 배송지 입력
  </button>
  <button onClick={() => setShowNewForm(false)}
    className={`rounded-xl px-4 py-2 text-sm ${!showNewForm ? 'bg-primary-600 text-white' : 'border'}`}>
    저장된 배송지 ({savedAddresses.length})
  </button>
</div>

{!showNewForm && (
  savedAddresses.length > 0 ? (
    <div className="space-y-2">
      {savedAddresses.map(addr => ...기존 코드...)}
    </div>
  ) : (
    <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-neutral-400">
      저장된 배송지가 없습니다.<br />
      <a href="/addresses" className="text-primary-600 underline">배송지 관리</a>에서 미리 등록할 수 있습니다.
    </div>
  )
)}
```

### 완료 기준
- [ ] 결제 페이지에 "새 배송지 입력" / "저장된 배송지" 탭 표시
- [ ] 저장된 배송지 없으면 안내 메시지 + 배송지 관리 링크
- [ ] 저장된 배송지 있으면 기존처럼 목록 + 선택

---

## 실행 순서

```
1. 백엔드: POST /cart/validate API 추가 (kn541/kn541)
2. 프론트: checkout/page.tsx — 결제 진입 시 유효성 체크 + 주소록 탭 UI
3. git push → Vercel 배포
4. 검증: 삭제 상품 포함 장바구니로 결제 시도 → 에러 없이 유효 상품만 주문
```
