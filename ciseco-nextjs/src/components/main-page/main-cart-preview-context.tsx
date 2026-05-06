'use client'

import type { MainCartPreviewPayload } from '@/components/main-page/main-cart-types'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { CartPopup } from './CartPopup'
import { MobileBottomNav } from './MobileBottomNav'

type MainCartPreviewContextValue = {
  openCartPreview: (p: MainCartPreviewPayload) => void
}

const MainCartPreviewContext = createContext<MainCartPreviewContextValue | null>(null)

export function useMainCartPreviewOptional() {
  return useContext(MainCartPreviewContext)
}

export function MainPageCartProvider({ children }: { children: React.ReactNode }) {
  const [payload, setPayload] = useState<MainCartPreviewPayload | null>(null)

  const openCartPreview = useCallback((p: MainCartPreviewPayload) => setPayload(p), [])
  const close = useCallback(() => setPayload(null), [])

  useEffect(() => {
    if (payload) {
      document.body.classList.add('is-cart-popup-open')
      return () => {
        document.body.classList.remove('is-cart-popup-open')
      }
    }
    document.body.classList.remove('is-cart-popup-open')
    return undefined
  }, [payload])

  const value = useMemo(() => ({ openCartPreview }), [openCartPreview])

  return (
    <MainCartPreviewContext.Provider value={value}>
      {children}
      <CartPopup payload={payload} onClose={close} />
      <MobileBottomNav />
    </MainCartPreviewContext.Provider>
  )
}
