'use client'
// KN541 장바구니 전역 Context
// localStorage('kn541_cart')에 저장 → 새로고침 후에도 유지
// 구형 데모 데이터(productId 없음) 자동 정리

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
  shippingFee: number
  freeShippingOver: number
  scType: number
}

interface CartContextValue {
  items: CartItem[]
  selectedIds: Set<string>
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  removeSelected: () => void
  updateQty: (id: string, qty: number) => void
  clearCart: () => void
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
const STORAGE_KEY = 'kn541_cart'

/** KN541 정식 상품 여부 — productId(UUID)가 있어야 함 */
function isValidItem(item: any): boolean {
  return typeof item.productId === 'string' && item.productId.includes('-')
}

/**
 * 상품 1개의 배송비 계산
 * 구형 아이템(shippingFee/scType 없음)도 0으로 안전하게 반환
 */
export function calcItemShipping(item: any): number {
  const price    = Number(item.price ?? 0)
  const qty      = Number(item.quantity ?? 1)
  const subtotal = price * qty
  const fee      = Number(item.shippingFee ?? 0)
  const scType   = Number(item.scType ?? 1)
  const freeOver = Number(item.freeShippingOver ?? 0)

  if (scType === 1 || fee === 0) return 0
  if (scType === 2 && freeOver > 0 && subtotal >= freeOver) return 0
  return fee
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [hydrated, setHydrated] = useState(false)

  // localStorage 로드 — 구형 데모 데이터 자동 필터링
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed: any[] = JSON.parse(raw)
        const valid = parsed.filter(isValidItem)
        setItems(valid)
        // 전체 선택 상태로 초기화
        setSelectedIds(new Set(valid.map((i: any) => i.id)))
      }
    } catch {}
    setHydrated(true)
  }, [])

  // localStorage 저장
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {}
  }, [items, hydrated])

  const addItem = useCallback((newItem: Omit<CartItem, 'id'>) => {
    const id = `${newItem.productId}__${newItem.option ?? ''}`
    setItems(prev => {
      const existing = prev.find(i => i.id === id)
      if (existing) {
        return prev.map(i => i.id === id ? { ...i, quantity: i.quantity + newItem.quantity } : i)
      }
      return [...prev, { ...newItem, id }]
    })
    // 새로 추가된 아이템은 자동 선택
    setSelectedIds(prev => new Set([...prev, id]))
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
    setSelectedIds(prev => { const s = new Set(prev); s.delete(id); return s })
  }, [])

  const removeSelected = useCallback(() => {
    setItems(prev => prev.filter(i => !selectedIds.has(i.id)))
    setSelectedIds(new Set())
  }, [selectedIds])

  const updateQty = useCallback((id: string, qty: number) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(1, qty) } : i))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    setSelectedIds(new Set())
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

  const selectedItems   = items.filter(i => selectedIds.has(i.id))
  const selectedPrice   = selectedItems.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.quantity) || 0), 0)
  const selectedShipping = selectedItems.reduce((s, i) => s + calcItemShipping(i), 0)
  const selectedTotal   = selectedPrice + selectedShipping

  return (
    <CartContext.Provider value={{
      items, selectedIds,
      addItem, removeItem, removeSelected, updateQty, clearCart,
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
