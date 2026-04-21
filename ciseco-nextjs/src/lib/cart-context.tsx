'use client'
// KN541 장바구니 전역 Context
// localStorage('kn541_cart')에 저장 → 새로고침 후에도 유지
// CartProvider를 [locale]/layout.tsx에 감싸서 전역 사용

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
  option?: string   // 선택 옵션 (색상·사이즈 등)
}

interface CartContextValue {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  updateQty: (id: string, qty: number) => void
  clearCart: () => void
  totalCount: number  // 총 수량 (배지용)
  totalPrice: number  // 총 금액
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = 'kn541_cart'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  // 클라이언트 마운트 시 localStorage에서 복원 (SSR 하이드레이션 불일치 방지)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch {}
    setHydrated(true)
  }, [])

  // items 변경 시 localStorage 동기화
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {}
  }, [items, hydrated])

  // 장바구니 담기 — 동일 상품+옵션이면 수량만 증가
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

  // 아이템 삭제
  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  // 수량 변경
  const updateQty = useCallback((id: string, qty: number) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, qty) } : i))
    )
  }, [])

  // 장바구니 비우기
  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQty, clearCart, totalCount, totalPrice }}
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
