'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import toast from 'react-hot-toast'
import { HugeiconsIcon } from '@hugeicons/react'
import { Share08Icon } from '@hugeicons/core-free-icons'

declare global {
  interface Window {
    Kakao?: any
  }
}

const KAKAO_SDK_URL = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js'

let kakaoLoadingPromise: Promise<void> | null = null

async function ensureKakaoSdkLoaded() {
  if (typeof window === 'undefined') return
  if (window.Kakao) return
  if (!kakaoLoadingPromise) {
    kakaoLoadingPromise = new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(`script[src="${KAKAO_SDK_URL}"]`)
      if (existing) {
        existing.addEventListener('load', () => resolve())
        existing.addEventListener('error', () => reject(new Error('Kakao SDK load error')))
        return
      }
      const script = document.createElement('script')
      script.src = KAKAO_SDK_URL
      script.async = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Kakao SDK load error'))
      document.head.appendChild(script)
    })
  }
  await kakaoLoadingPromise
}

interface Props {
  title: string
  price: number
  imageUrl: string
}

export function ProductDetailShareButton({ title, price, imageUrl }: Props) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const currentUrl = useMemo(() => {
    if (typeof window !== 'undefined' && window.location?.href) {
      return window.location.href
    }
    const origin =
      typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : process.env.NEXT_PUBLIC_SITE_URL || ''
    return `${origin || ''}${pathname || ''}`
  }, [pathname])

  const plainTitle = title || '상품 상세'

  const description = useMemo(() => {
    // 페이지 메타 description을 그대로 쓰는 대신 간단 안내 문구로 대체
    return plainTitle
  }, [plainTitle])

  useEffect(() => {
    if (!open) return
    void ensureKakaoSdkLoaded().catch(() => {
      // 조용히 무시 (카카오만 실패해도 나머지 기능은 동작)
    })
  }, [open])

  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleKakaoShare = async () => {
    try {
      const appKey = process.env.NEXT_PUBLIC_KAKAO_APP_KEY
      if (!appKey) {
        toast.error('카카오톡 공유 키가 설정되지 않았습니다.')
        return
      }
      await ensureKakaoSdkLoaded()
      const Kakao = window.Kakao
      if (!Kakao) {
        toast.error('카카오톡 공유를 초기화할 수 없습니다.')
        return
      }
      if (!Kakao.isInitialized()) {
        Kakao.init(appKey)
      }
      Kakao.Share.sendDefault({
        objectType: 'commerce',
        content: {
          title: plainTitle,
          description,
          imageUrl,
          link: {
            mobileWebUrl: currentUrl,
            webUrl: currentUrl,
          },
        },
        commerce: {
          regularPrice: Math.max(0, Math.round(price || 0)),
        },
      })
    } catch (e) {
      console.error(e)
      toast.error('카카오톡 공유 중 오류가 발생했습니다.')
    }
  }

  const handleCopyUrl = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(currentUrl)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = currentUrl
        textarea.style.position = 'fixed'
        textarea.style.left = '-9999px'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      toast.success('URL이 복사되었습니다.')
    } catch {
      toast.error('URL 복사에 실패했습니다.')
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="상품 공유하기"
        className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-700 shadow-sm transition hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
      >
        <HugeiconsIcon icon={Share08Icon} size={22} color="currentColor" strokeWidth={1.5} />
      </button>

      {open && (
        <div className="absolute right-0 top-[60px] z-20 w-72 rounded-2xl border border-neutral-200 bg-white p-4 text-sm shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">공유하기</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            >
              ✕
            </button>
          </div>

          <div className="mb-4 flex items-center justify-around gap-4">
            <button
              type="button"
              onClick={handleFacebookShare}
              className="flex flex-col items-center gap-1 text-xs text-neutral-700 dark:text-neutral-100"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1877F2] text-white">
                f
              </span>
              <span>페이스북</span>
            </button>

            <button
              type="button"
              onClick={() => void handleKakaoShare()}
              className="flex flex-col items-center gap-1 text-xs text-neutral-700 dark:text-neutral-100"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FEE500] text-black">
                K
              </span>
              <span>카카오톡</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 overflow-hidden rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-[11px] text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
              <span className="block truncate">{currentUrl}</span>
            </div>
            <button
              type="button"
              onClick={() => void handleCopyUrl()}
              className="shrink-0 rounded-full bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              복사
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
