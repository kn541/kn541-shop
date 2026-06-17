'use client'
// KN541 장바구니 전역 Context
// fix: 로그아웃 후 재로그인 시 장바구니 사라지는 버그 수정
//   원인: save useEffect에서 items=[]이면 localStorage 삭제 → hydration 중 race condition으로 삭제됨
//   수정: localStorage 삭제를 clearCart() 에서만 명시적으로 수행
// fix(QA 김용해): removeItem으로 마지막 항목 삭제 시 localStorage 미정리 → 새로고침하면 재등장
//   원인: 빈 장바구니에서 saveCartToStorage가 early-return(삭제 안 함)인데 removeItem엔 empty→clear 처리 없음
//   수정: removeItem도 결과가 빈 배열이면 clearCartFromStorage() 호출 (removeSelected와 동일 패턴)
// feat: 장바구니 보관 만료 15일 추가 — 마지막 수정일 기준 15일 이내만 유지
// localStorage('kn541_cart')에 {items, selectedIds, expiresAt} 형태로 저장

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  image: string
  option?: string
  /** KN541 옵션 UUID (product_options.id) — POST /orders의 option_id 로 전달 */
  optionId?: string
  shippingFee: number
  freeShippingOver: number
  scType: number
  stockQty: number
  shopId?: string
  product_type?: string
}

interface CartContextValue {
  items: CartItem[]
  selectedIds: Set<string>
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  removeSelected: () => void
  updateQty: (id: string, qty: number) => void
  clearCart: () => void
  reloadFromStorage: () => void
  toggleSelect: (id: string) => void
  toggleSelectAll: () => void
  totalCount: number
  totalPrice: number
  totalShipping: number
  selectedPrice: number
  selectedShipping: number
  selectedTotal: number
  isAllSelected: boolean
}

const CartContext = createContext<CartContextValue | null>(null)

export const KN541_CART_STORAGE_KEY          = 'kn541_cart'
export const KN541_CART_SELECTED_STORAGE_KEY = 'kn541_cart_selected'

/** 장바구니 보관 기간: 마지막 수정일 기준 15일 */
const CART_EXPIRY_MS = 15 * 24 * 60 * 60 * 1000  // 15 days

/** 저장 포맷 (v2 — 만료 포함) */
interface StoredCart {
  version: 2
  items: CartItem[]
  selectedIds: string[]
  expiresAt: number  // Unix ms — 이 시각 이후에는 불러오지 않음
}

/** KN541 정식 상품 여부 — productId(UUID)가 있어야 함 */
function isValidItem(item: unknown): item is CartItem {
  const i = item as Record<string, unknown>
  return typeof i.productId === 'string' && i.productId.includes('-')
}

export function calcItemShipping(item: CartItem | Record<string, unknown>): number {
  const price    = Number((item as Record<string, unknown>).price ?? 0)
  const qty      = Number((item as Record<string, unknown>).quantity ?? 1)
  const subtotal = price * qty
  const fee      = Number((item as Record<string, unknown>).shippingFee ?? 0)
  const scType   = Number((item as Record<string, unknown>).scType ?? 1)
  const freeOver = Number((item as Record<string, unknown>).freeShippingOver ?? 0)

  if (scType === 1 || fee === 0) return 0
  if (scType === 2 && freeOver > 0 && subtotal >= freeOver) return 0
  return fee
}

/** localStorage에서 장바구니 데이터 읽기 (포맷 v1/v2 모두 지원, 만료 체크 포함) */
function loadCartFromStorage(): { items: CartItem[]; selectedIds: string[] } | null {
  try {
    const raw = localStorage.getItem(KN541_CART_STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as unknown

    // v2 포맷: {version: 2, items, selectedIds, expiresAt}
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const stored = parsed as Partial<StoredCart>
      if (stored.version === 2) {
        // 만료 체크
        if (stored.expiresAt && Date.now() > stored.expiresAt) {
          localStorage.removeItem(KN541_CART_STORAGE_KEY)
          localStorage.removeItem(KN541_CART_SELECTED_STORAGE_KEY)
          return null
        }
        const items = (stored.items ?? []).filter(isValidItem)
        const selectedIds = (stored.selectedIds ?? []).filter(
          (id): id is string => typeof id === 'string' && items.some(i => i.id === id)
        )
        return { items, selectedIds }
      }
    }

    // v1 포맷 (레거시): 단순 배열 — 만료 없음, 이번 저장 시 v2로 업그레이드됨
    if (Array.isArray(parsed)) {
      const items = parsed.filter(isValidItem)
      const selectedRaw = localStorage.getItem(KN541_CART_SELECTED_STORAGE_KEY)
      let selectedIds: string[] = []
      if (selectedRaw) {
        try {
          const ids: unknown[] = JSON.parse(selectedRaw)
          selectedIds = ids
            .filter((id): id is string => typeof id === 'string')
            .filter(id => items.some(i => i.id === id))
        } catch {
          selectedIds = items.map(i => i.id)
        }
      } else {
        selectedIds = items.map(i => i.id)
      }
      return { items, selectedIds }
    }

    return null
  } catch {
    return null
  }
}

/** localStorage에 장바구니 저장 (v2 포맷, 15일 만료) */
function saveCartToStorage(items: CartItem[], selectedIds: Set<string>): void {
  try {
    if (items.length === 0) {
      // 빈 장바구니는 저장하지 않음 — clearCart/removeItem/removeSelected가 명시적으로 삭제 담당
      return
    }
    const stored: StoredCart = {
      version:     2,
      items,
      selectedIds: [...selectedIds],
      expiresAt:   Date.now() + CART_EXPIRY_MS,
    }
    localStorage.setItem(KN541_CART_STORAGE_KEY, JSON.stringify(stored))
    // v1 구형 키는 제거
    localStorage.removeItem(KN541_CART_SELECTED_STORAGE_KEY)
  } catch {}
}

/** localStorage에서 장바구니 완전 삭제 */
function clearCartFromStorage(): void {
  try {
    localStorage.removeItem(KN541_CART_STORAGE_KEY)
    localStorage.removeItem(KN541_CART_SELECTED_STORAGE_KEY)
  } catch {}
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems]             = useState<CartItem[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [hydrated, setHydrated]       = useState(false)

  // 첫 번째 저장 사이클 여부 — hydration 직후 불필요한 save 방지
  const firstSaveRef = useRef(true)

  // ── hydration: localStorage → state 복원 ──────────────────────────
  useEffect(() => {
    const stored = loadCartFromStorage()
    if (stored) {
      setItems(stored.items)
      setSelectedIds(new Set(stored.selectedIds))
    }
    setHydrated(true)
  }, [])

  // ── save: state → localStorage 동기화 ────────────────────────────
  // ★ fix: items=[]인 상태에서 localStorage를 삭제하지 않음
  //   localStorage 삭제는 clearCart()/removeItem/removeSelected에서만 명시적으로 수행
  //   → hydration race condition 원천 차단
  useEffect(() => {
    if (!hydrated) return

    // hydration 직후 첫 사이클에서는 save 스킵 (이미 맞는 데이터가 storage에 있음)
    if (firstSaveRef.current) {
      firstSaveRef.current = false
      return
    }

    saveCartToStorage(items, selectedIds)
  }, [items, selectedIds, hydrated])

  const addItem = useCallback((newItem: Omit<CartItem, 'id'>) => {
    const id = `${newItem.productId}__${newItem.optionId ?? newItem.option ?? ''}`
    setItems(prev => {
      const existing = prev.find(i => i.id === id)
      if (existing) {
        const maxStock = newItem.stockQty > 0 ? newItem.stockQty : 99
        const newQty   = Math.min(existing.quantity + newItem.quantity, maxStock)
        return prev.map(i =>
          i.id === id
            ? { ...i, quantity: newQty, stockQty: newItem.stockQty, product_type: newItem.product_type ?? i.product_type }
            : i
        )
      }
      return [...prev, { ...newItem, id }]
    })
    setSelectedIds(prev => new Set([...prev, id]))
  }, [])

  // ★ fix(QA 김용해): 마지막 항목을 개별 삭제하면 items=[]이 되는데
  //   save useEffect는 빈 배열일 때 localStorage를 지우지 않아(early-return) 옛 항목이 잔존,
  //   새로고침 hydration 시 재등장하던 버그. removeSelected와 동일하게 empty→clear 처리.
  const removeItem = useCallback((id: string) => {
    setItems(prev => {
      const next = prev.filter(i => i.id !== id)
      if (next.length === 0) clearCartFromStorage()
      return next
    })
    setSelectedIds(prev => { const s = new Set(prev); s.delete(id); return s })
  }, [])

  const removeSelected = useCallback(() => {
    setItems(prev => {
      const next = prev.filter(i => !selectedIds.has(i.id))
      // 모두 삭제된 경우 storage도 제거
      if (next.length === 0) clearCartFromStorage()
      return next
    })
    setSelectedIds(new Set())
  }, [selectedIds])

  const updateQty = useCallback((id: string, qty: number) => {
    setItems(prev => prev.map(i => {
      if (i.id !== id) return i
      const maxStock = i.stockQty > 0 ? i.stockQty : 99
      return { ...i, quantity: Math.min(Math.max(1, qty), maxStock) }
    }))
  }, [])

  // ★ fix: clearCart가 localStorage 명시적 삭제 담당
  //   결제 완료 후 또는 의도적 전체 비우기 시에만 호출
  const clearCart = useCallback(() => {
    setItems([])
    setSelectedIds(new Set())
    clearCartFromStorage()
  }, [])

  // 로그인 후 localStorage 장바구니 복원 (로그아웃 시 storage 유지)
  const reloadFromStorage = useCallback(() => {
    const stored = loadCartFromStorage()
    if (stored) {
      setItems(stored.items)
      setSelectedIds(new Set(stored.selectedIds))
    }
  }, [])

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const s = new Set(prev)
      s.has(id) ? s.delete(id) : s.add(id)
      return s
    })
  }, [])

  const isAllSelected = items.length > 0 && items.every(i => selectedIds.has(i.id))

  const toggleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(items.map(i => i.id)))
    }
  }, [isAllSelected, items])

  const totalCount    = items.reduce((s, i) => s + (Number(i.quantity) || 0), 0)
  const totalPrice    = items.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.quantity) || 0), 0)
  const totalShipping = items.reduce((s, i) => s + calcItemShipping(i), 0)

  const selectedItems    = items.filter(i => selectedIds.has(i.id))
  const selectedPrice    = selectedItems.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.quantity) || 0), 0)
  const selectedShipping = selectedItems.reduce((s, i) => s + calcItemShipping(i), 0)
  const selectedTotal    = selectedPrice + selectedShipping

  return (
    <CartContext.Provider value={{
      items, selectedIds,
      addItem, removeItem, removeSelected, updateQty, clearCart, reloadFromStorage,
      toggleSelect, toggleSelectAll,
      totalCount, totalPrice, totalShipping,
      selectedPrice, selectedShipping, selectedTotal,
      isAllSelected,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart는 CartProvider 내부에서만 사용 가능합니다')
  return ctx
}
