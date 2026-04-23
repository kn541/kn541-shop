'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { Link } from '@/components/Link'
import WishlistItemCard, { type WishlistProduct } from '@/components/mypage/WishlistItemCard'
import { mypageFetch, MypageApiError } from '@/lib/mypage/api'

function extractWishlistArray(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload
  if (payload && typeof payload === 'object') {
    const o = payload as Record<string, unknown>
    if (Array.isArray(o.items)) return o.items
    if (Array.isArray(o.wishlists)) return o.wishlists
    if (Array.isArray(o.products)) return o.products
    if (Array.isArray(o.data)) return o.data
  }
  return []
}

function normalizeWishItem(raw: unknown): WishlistProduct | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const product_id = String(r.product_id ?? r.id ?? r.productId ?? '')
  if (!product_id) return null
  const name = String(
    r.name ?? r.title ?? r.product_name ?? r.productName ?? '상품'
  )
  const price = Number(r.price ?? r.sale_price ?? r.amount ?? 0)
  const thumbnail_url =
    (r.thumbnail_url ?? r.thumbnail ?? r.image_url ?? r.image ?? null) as string | null
  return {
    product_id,
    name,
    price: Number.isFinite(price) ? price : 0,
    thumbnail_url: thumbnail_url && String(thumbnail_url).trim() ? String(thumbnail_url) : null,
  }
}

export default function AccountWishlistsPage() {
  const [items, setItems] = useState<WishlistProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [removingId, setRemovingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await mypageFetch<unknown>('/mypage/wishlists')
      const rows = extractWishlistArray(data)
      const next: WishlistProduct[] = []
      for (const row of rows) {
        const n = normalizeWishItem(row)
        if (n) next.push(n)
      }
      setItems(next)
    } catch (e) {
      const msg =
        e instanceof MypageApiError ? e.message : '위시리스트를 불러오지 못했습니다.'
      toast.error(msg)
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const handleRemove = async (productId: string) => {
    setRemovingId(productId)
    try {
      await mypageFetch<unknown>(`/mypage/wishlists/${encodeURIComponent(productId)}`, {
        method: 'DELETE',
      })
      setItems(prev => prev.filter(p => p.product_id !== productId))
      toast.success('위시리스트에서 삭제했습니다.')
    } catch (e) {
      const msg =
        e instanceof MypageApiError ? e.message : '삭제에 실패했습니다.'
      toast.error(msg)
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-y-10 sm:gap-y-12">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">위시리스트</h1>
        <p className="mt-4 text-neutral-500 dark:text-neutral-400">
          관심 상품을 모아 보세요. 목록에서 바로 삭제할 수 있습니다.
        </p>
      </div>

      {loading ? (
        <p className="text-center text-neutral-500 dark:text-neutral-400">불러오는 중…</p>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-dashed border-neutral-300 py-16 text-center dark:border-neutral-600">
          <p className="text-lg text-neutral-600 dark:text-neutral-400">위시리스트가 비어있습니다.</p>
          <Link
            href="/products"
            className="inline-flex h-12 items-center justify-center rounded-full bg-neutral-900 px-8 text-sm font-semibold text-white hover:opacity-90 dark:bg-white dark:text-neutral-900"
          >
            쇼핑하기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:gap-x-8 lg:grid-cols-3">
          {items.map(item => (
            <WishlistItemCard
              key={item.product_id}
              item={item}
              onRemove={() => void handleRemove(item.product_id)}
              removing={removingId === item.product_id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
