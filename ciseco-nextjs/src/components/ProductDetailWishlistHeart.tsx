'use client'

// 상품 상세·퀵뷰 공통 — 찜하기 토글 (GET /mypage/wishlists/check, POST/DELETE /mypage/wishlists)

import { mypageFetch, MypageApiError } from '@/lib/mypage/api'
import { HeartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslations } from 'next-intl'

type WishlistCheckData = { is_wishlisted?: boolean }

export function ProductDetailWishlistHeart({
  productId,
  className = '',
}: {
  productId: string
  className?: string
}) {
  const pathname = usePathname()
  const router = useRouter()
  const locale = pathname.split('/')[1] || 'ko'
  const t = useTranslations('Product')

  const [liked, setLiked] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [busy, setBusy] = useState(false)

  const loadCheck = useCallback(async () => {
    if (!productId) {
      setLoaded(true)
      return
    }
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    if (!token) {
      setLiked(false)
      setLoaded(true)
      return
    }
    try {
      const data = await mypageFetch<WishlistCheckData>(
        `/mypage/wishlists/check?product_id=${encodeURIComponent(productId)}`,
      )
      setLiked(Boolean(data?.is_wishlisted))
    } catch {
      setLiked(false)
    } finally {
      setLoaded(true)
    }
  }, [productId])

  useEffect(() => {
    setLoaded(false)
    void loadCheck()
  }, [loadCheck])

  const onToggle = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    if (!token) {
      toast.error(t('wishlistLoginRequired'))
      router.push(`/${locale}/login?redirect=${encodeURIComponent(pathname)}`)
      return
    }
    if (busy || !loaded) return
    setBusy(true)
    try {
      if (liked) {
        await mypageFetch(`/mypage/wishlists/${encodeURIComponent(productId)}`, { method: 'DELETE' })
        setLiked(false)
        toast.success(t('wishlistRemovedToast'))
      } else {
        try {
          await mypageFetch(`/mypage/wishlists`, {
            method: 'POST',
            body: JSON.stringify({ product_id: productId }),
          })
        } catch (e) {
          if (e instanceof MypageApiError && e.status === 409) {
            setLiked(true)
            toast.success(t('wishlistAddedToast'))
            return
          }
          throw e
        }
        setLiked(true)
        toast.success(t('wishlistAddedToast'))
      }
    } catch (e) {
      const msg = e instanceof MypageApiError ? e.message : t('wishlistToggleError')
      toast.error(msg)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={() => void onToggle()}
      disabled={!loaded || busy || !productId}
      aria-label={liked ? t('wishlistAriaRemove') : t('wishlistAriaAdd')}
      title={liked ? t('wishlistAriaRemove') : t('wishlistAriaAdd')}
      className={[
        'flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border border-neutral-300 bg-white transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-900 dark:hover:bg-neutral-800',
        className,
      ].join(' ')}
    >
      {liked ? (
        <HeartIconSolid className="size-6 text-red-600" aria-hidden />
      ) : (
        <HeartIcon className="size-6 text-neutral-600 dark:text-neutral-300" aria-hidden />
      )}
    </button>
  )
}
