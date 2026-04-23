'use client'
// KN541 장바구니 전역 Context
// localStorage('kn541_cart')에 저장 → 새로고침 후에도 유지

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import toast from 'react-hot-toast'

export interface CartItem {
  id: string        // 장바구니 고유 ID (productId + option 조합)
  productId: string // 상품 UUID
  name: string
  price: number
  quantity: number
  image: string
  option?: string   // 선택 옵션
  // 상품별 배송비 (product_shipping 테이블 기준)
  shippingFee: number
  freeShippingOver: number
  scType: number
}

interface CartContextValue {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  updateQty: (id: string, qty: number) => void
  clearCart: () => void
  totalCount: number
  totalPrice: number
  totalShipping: number
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = 'kn541_cart'

/**
 * 상품 1개의 배송비 계산
 * 구형 아이템(shippingFee/scType 없음)도 0 안전하게 반환
 */
export function calcItemShipping(item: any): number {
  const price    = Number(item.price ?? 0)
  const qty      = Number(item.quantity ?? 1)
  const subtotal = price * qty
  const fee      = Number(item.shippingFee ?? 0)
  const scType   = Number(item.scType ?? 1) // 값 없으면 무료(1) 위행
  const freeOver = Number(item.freeShippingOver ?? 0)

  if (scType === 1 || fee === 0) return 0
  if (scType === 2 && freeOver > 0 && subtotal >= freeOver) return 0
  return fee
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch {}
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {}
  }, [items, hydrated])

  const addItem = useCallback((newItem: Omit<CartItem, 'id'>) => {
    const id = `${newItem.productId}__${newItem.option ?? ''}`
    setItems((prev) => {
      const existing = prev.find((i) => i.id === id)
      if (existing) {
        return prev.map((i) =>
          i.id === id ? { ...i, quantity: i.quantity + newItem.quantity } : i
        )
      }
      return [...prev, { ...newItem, id }]
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const updateQty = useCallback((id: string, qty: number) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, qty) } : i))
    )
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const totalCount    = items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0)
  const totalPrice    = items.reduce((sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 0), 0)
  const totalShipping = items.reduce((sum, i) => sum + calcItemShipping(i), 0)

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQty, clearCart, totalCount, totalPrice, totalShipping }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart는 CartProvider 내부에서만 사용 가능합니다')
  return ctx
}
