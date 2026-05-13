'use client'

import Logo from '@/components/Logo'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { Cancel01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import clsx from 'clsx'
import { createContext, useContext, useState, type ReactNode } from 'react'

/**
 * Drawer component that opens on user click.
 * @param heading - string. Shown at the top of the drawer.
 * @param open - boolean state. if true opens the drawer.
 * @param onClose - function should set the open state.
 * @param openFrom - right, left
 * @param children - react children node.
 */
export function Aside({
  heading,
  logoOnHeading = false,
  openFrom = 'right',
  children,
  type,
  contentMaxWidthClassName = 'max-w-lg',
  showHeading = true,
  /** 제목 없이도 닫기 버튼만 표시 (예: 상품 퀵뷰) */
  showCloseButton,
}: {
  heading?: string
  logoOnHeading?: boolean
  openFrom: 'right' | 'left'
  children: React.ReactNode
  type: AsideType
  contentMaxWidthClassName?: string
  showHeading?: boolean
  showCloseButton?: boolean
}) {
  const { type: activeType, close } = useAside()
  const open = type === activeType

  const onClose = close

  const hasHeading = !!heading || logoOnHeading

  const closeButtonEl = (
    <button
      type="button"
      className="group flex size-10 min-h-8 min-w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-700 dark:focus-visible:ring-white"
      onClick={onClose}
      aria-label="닫기"
    >
      <HugeiconsIcon
        className="transition-transform duration-200 group-hover:rotate-90"
        icon={Cancel01Icon}
        size={24}
        strokeWidth={1}
      />
    </button>
  )

  return (
    <Dialog as="div" className="relative z-[200]" onClose={onClose} open={open}>
      <DialogBackdrop
        transition
        className="fixed inset-0 z-[200] bg-neutral-900/50 duration-300 ease-out data-closed:opacity-0"
      />

      <div className="fixed inset-0 z-[200]">
        <div className="absolute inset-0 overflow-hidden">
          <div className={clsx('fixed inset-y-0 flex max-w-full', openFrom === 'right' && 'right-0')}>
            <DialogPanel
              transition
              className={clsx(
                contentMaxWidthClassName,
                'pointer-events-auto h-screen w-screen translate-x-0 overflow-hidden bg-white text-start align-middle shadow-xl transition duration-200 ease-in-out dark:bg-neutral-800',
                openFrom === 'left' && 'data-closed:-translate-x-20 data-closed:opacity-0',
                openFrom === 'right' && 'data-closed:translate-x-20 data-closed:opacity-0'
              )}
            >
              <div className="flex h-full flex-col px-4 md:px-8">
                {showHeading ? (
                  <header
                    className={`sticky top-0 z-[210] flex flex-shrink-0 items-center border-b border-neutral-900/10 bg-white dark:bg-neutral-800 ${
                      hasHeading ? 'h-16 justify-between md:h-20' : 'h-14 justify-end md:h-16'
                    }`}
                  >
                    {hasHeading && (
                      <>
                        {!!heading && !logoOnHeading && (
                          <DialogTitle>
                            <span className="text-2xl font-medium">{heading}</span>
                          </DialogTitle>
                        )}
                        {logoOnHeading && <Logo />}
                      </>
                    )}

                    {closeButtonEl}
                  </header>
                ) : showCloseButton ? (
                  <header className="sticky top-0 z-[210] flex h-14 flex-shrink-0 items-center justify-end border-b border-neutral-900/10 bg-white pt-2 pb-1 dark:bg-neutral-800 md:h-16 md:pt-2">
                    <DialogTitle className="sr-only">상품 빠른보기</DialogTitle>
                    {closeButtonEl}
                  </header>
                ) : null}
                <div className="flex-1 overflow-hidden">{children}</div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  )
}

/* Use for associating arialabelledby with the title*/
Aside.Title = DialogTitle

export function useDrawer(openDefault = false) {
  const [isOpen, setIsOpen] = useState(openDefault)

  function openDrawer() {
    setIsOpen(true)
  }

  function closeDrawer() {
    setIsOpen(false)
  }

  return {
    isOpen,
    openDrawer,
    closeDrawer,
  }
}

type AsideType = 'search' | 'cart' | 'closed' | 'sidebar-navigation' | 'category-filters' | 'product-quick-view'
type AsideContextValue = {
  type: AsideType
  open: (mode: AsideType) => void
  close: () => void
  productQuickViewHandle?: string
  setProductQuickViewHandle: (handle: string) => void
}
//
const AsideContext = createContext<AsideContextValue | null>(null)

export function AsideProvider({ children }: { children: ReactNode }) {
  const [type, setType] = useState<AsideType>('closed')
  const [productQuickViewHandle, setProductQuickViewHandle] = useState<string>()

  return (
    <AsideContext.Provider
      value={{
        type,
        open: setType,
        close: () => setType('closed'),
        productQuickViewHandle,
        setProductQuickViewHandle,
      }}
    >
      {children}
    </AsideContext.Provider>
  )
}

export function useAside() {
  const aside = useContext(AsideContext)
  if (!aside) {
    throw new Error('useAside must be used within an AsideProvider')
  }
  return aside
}
