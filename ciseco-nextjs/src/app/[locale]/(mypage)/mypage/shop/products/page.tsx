'use client'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import BackHeader from '@/components/mypage/BackHeader'
import BigTabs from '@/components/mypage/BigTabs'
import BigButton from '@/components/mypage/BigButton'
import type { ShopProduct, AvailableProduct } from '@/lib/mypage/types'
import {
  addMyShopProduct,
  fetchMyShopProducts,
  fetchMyShopProductsFind,
  patchMyShopProduct,
  removeMyShopProduct,
  type MyShopProductApiItem,
  type ProductFindRow,
} from '@/lib/mypage/useMyShop'
import { MypageApiError } from '@/lib/mypage/api'

function mapMyItem(it: MyShopProductApiItem): ShopProduct {
  const price = parseFloat(it.effective_price ?? it.base_sale_price ?? '0')
  return {
    shop_product_id: it.product_id,
    product_id: it.product_id,
    product_name: it.product_name ?? '',
    product_price: Number.isFinite(price) ? price : 0,
    product_thumbnail: it.thumbnail_url ?? null,
    sort_order: it.sort_order ?? 0,
    added_at: it.added_at ?? '',
  }
}

function mapFindRow(row: ProductFindRow): AvailableProduct {
  const pid = String(row.product_id ?? '')
  const price = typeof row.sale_price === 'number' ? row.sale_price : parseFloat(String(row.sale_price ?? 0))
  return {
    product_id: pid,
    product_name: String(row.product_name ?? ''),
    price: Number.isFinite(price) ? price : 0,
    thumbnail: (row.thumbnail_url as string | null) ?? null,
    category_code: row.category_id != null ? String(row.category_id) : null,
    is_added: !!row.is_in_my_shop,
  }
}

function MyProductCard({
  item, onMoveUp, onMoveDown, onRemove, isFirst, isLast,
}: {
  item: ShopProduct
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
  isFirst: boolean
  isLast: boolean
}) {
  return (
    <div style={{
      background: '#fff', borderRadius: 'var(--mp-radius-lg)',
      border: '1px solid var(--mp-color-border)',
      padding: 14, marginBottom: 10,
      display: 'flex', gap: 12, alignItems: 'center',
    }}>
      <div style={{
        width: 64, height: 64, background: '#F5F5F5',
        borderRadius: 8, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
      }}>
        {item.product_thumbnail
          ? <img src={item.product_thumbnail} alt='' style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
          : '📦'}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 15, fontWeight: 600,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          marginBottom: 4,
        }}>
          {item.product_name}
        </div>
        <div style={{ fontSize: 16, fontWeight: 700 }}>
          {item.product_price.toLocaleString('ko-KR')}원
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
        <button
          type='button'
          onClick={onMoveUp}
          disabled={isFirst}
          title='위로'
          style={{
            width: 36, height: 36, border: '1px solid var(--mp-color-border)',
            borderRadius: 6, background: isFirst ? '#F5F5F5' : '#fff',
            cursor: isFirst ? 'not-allowed' : 'pointer', fontSize: 16,
          }}
        >▲</button>
        <button
          type='button'
          onClick={onMoveDown}
          disabled={isLast}
          title='아래로'
          style={{
            width: 36, height: 36, border: '1px solid var(--mp-color-border)',
            borderRadius: 6, background: isLast ? '#F5F5F5' : '#fff',
            cursor: isLast ? 'not-allowed' : 'pointer', fontSize: 16,
          }}
        >▼</button>
        <button
          type='button'
          onClick={onRemove}
          title='제거'
          style={{
            width: 36, height: 36, border: '1px solid var(--mp-color-danger)',
            borderRadius: 6, background: '#fff',
            cursor: 'pointer', fontSize: 14, color: 'var(--mp-color-danger)',
          }}
        >✕</button>
      </div>
    </div>
  )
}

function AvailableProductCard({
  item,
  onAdd,
  onRemove,
}: {
  item: AvailableProduct
  onAdd: () => void
  onRemove: () => void
}) {
  return (
    <div style={{
      background: '#fff', borderRadius: 'var(--mp-radius-lg)',
      border: '1px solid var(--mp-color-border)',
      padding: 14, marginBottom: 10,
      display: 'flex', gap: 12, alignItems: 'center',
    }}>
      <div style={{
        width: 64, height: 64, background: '#F5F5F5',
        borderRadius: 8, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
      }}>
        {item.thumbnail ? <img src={item.thumbnail} alt='' style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} /> : '📦'}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 15, fontWeight: 600,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4,
        }}>
          {item.product_name}
        </div>
        <div style={{ fontSize: 16, fontWeight: 700 }}>
          {item.price.toLocaleString('ko-KR')}원
        </div>
      </div>

      {item.is_added ? (
        <button
          type='button'
          onClick={onRemove}
          style={{
            padding: '8px 14px', background: '#F5F5F5',
            border: '1px solid var(--mp-color-border)',
            borderRadius: 20, fontSize: 14, fontWeight: 600,
            cursor: 'pointer', flexShrink: 0, color: 'var(--mp-color-text-muted)',
          }}
        >담김 ✓</button>
      ) : (
        <button
          type='button'
          onClick={onAdd}
          style={{
            padding: '8px 14px', background: 'var(--mp-color-primary)', color: '#fff',
            border: 'none', borderRadius: 20, fontSize: 14, fontWeight: 600,
            cursor: 'pointer', flexShrink: 0,
          }}
        >담기</button>
      )}
    </div>
  )
}

export default function ShopProductsPage() {
  const [tab, setTab] = useState<'MY' | 'ADD'>('MY')
  const [myProducts, setMyProducts] = useState<ShopProduct[]>([])
  const [available, setAvailable] = useState<AvailableProduct[]>([])
  const [keyword, setKeyword] = useState('')
  const [loadingMy, setLoadingMy] = useState(true)
  const [loadingFind, setLoadingFind] = useState(false)

  const loadMy = useCallback(async () => {
    setLoadingMy(true)
    try {
      const res = await fetchMyShopProducts(1, 200)
      setMyProducts((res.items ?? []).map(mapMyItem))
    } catch (e) {
      toast.error(e instanceof MypageApiError ? e.message : '목록을 불러오지 못했습니다.')
      setMyProducts([])
    } finally {
      setLoadingMy(false)
    }
  }, [])

  const loadFind = useCallback(async (kw: string) => {
    setLoadingFind(true)
    try {
      const res = await fetchMyShopProductsFind({
        keyword: kw || undefined,
        page: 1,
        size: 50,
        is_added: true,
      })
      setAvailable((res.items ?? []).map(mapFindRow))
    } catch (e) {
      toast.error(e instanceof MypageApiError ? e.message : '검색에 실패했습니다.')
      setAvailable([])
    } finally {
      setLoadingFind(false)
    }
  }, [])

  useEffect(() => {
    void loadMy()
  }, [loadMy])

  useEffect(() => {
    if (tab !== 'ADD') return
    const t = setTimeout(() => void loadFind(keyword), 300)
    return () => clearTimeout(t)
  }, [tab, keyword, loadFind])

  const persistSortOrder = async (ordered: ShopProduct[]) => {
    try {
      await Promise.all(
        ordered.map((p, i) =>
          patchMyShopProduct(p.product_id, { sort_order: (i + 1) * 10 })
        )
      )
    } catch (e) {
      toast.error(e instanceof MypageApiError ? e.message : '순서 저장에 실패했습니다.')
      void loadMy()
    }
  }

  const moveUp = (idx: number) => {
    if (idx === 0) return
    const next = [...myProducts]
    ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
    setMyProducts(next)
    void persistSortOrder(next)
  }

  const moveDown = (idx: number) => {
    if (idx === myProducts.length - 1) return
    const next = [...myProducts]
    ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
    setMyProducts(next)
    void persistSortOrder(next)
  }

  const removeFromMyShop = async (productId: string) => {
    try {
      await removeMyShopProduct(productId)
      setMyProducts(p => p.filter(x => x.product_id !== productId))
      setAvailable(p => p.map(x => x.product_id === productId ? { ...x, is_added: false } : x))
      toast.success('상품을 제거했어요')
    } catch (e) {
      toast.error(e instanceof MypageApiError ? e.message : '제거에 실패했습니다.')
    }
  }

  const addToMyShop = async (productId: string) => {
    try {
      const sortOrder = (myProducts.length + 1) * 10
      await addMyShopProduct(productId, sortOrder)
      toast.success('상품을 담았어요')
      await loadMy()
      if (tab === 'ADD') void loadFind(keyword)
    } catch (e) {
      toast.error(e instanceof MypageApiError ? e.message : '담기에 실패했습니다.')
    }
  }

  return (
    <>
      <BackHeader title='상품 관리' />

      <BigTabs
        value={tab}
        onChange={v => setTab(v as 'MY' | 'ADD')}
        tabs={[
          { value: 'MY',  label: '담은 상품', badge: myProducts.length },
          { value: 'ADD', label: '상품 담기' },
        ]}
      />

      <div style={{ padding: 16 }}>
        {tab === 'MY' && loadingMy && (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--mp-color-text-muted)' }}>불러오는 중…</div>
        )}
        {tab === 'MY' && !loadingMy && (
          <>
            {myProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
                <div style={{ fontSize: 18, color: 'var(--mp-color-text-muted)', marginBottom: 20 }}>
                  아직 담은 상품이 없어요.
                </div>
                <BigButton onClick={() => setTab('ADD')}>상품 담으러 가기</BigButton>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 14, color: 'var(--mp-color-text-muted)', marginBottom: 12 }}>
                  ▲ ▼ 버튼으로 순서를 바꿀 수 있어요
                </div>
                {myProducts.map((item, idx) => (
                  <MyProductCard
                    key={item.product_id}
                    item={item}
                    isFirst={idx === 0}
                    isLast={idx === myProducts.length - 1}
                    onMoveUp={() => moveUp(idx)}
                    onMoveDown={() => moveDown(idx)}
                    onRemove={() => void removeFromMyShop(item.product_id)}
                  />
                ))}
              </>
            )}
          </>
        )}

        {tab === 'ADD' && (
          <>
            <div style={{ marginBottom: 16 }}>
              <input
                type='text'
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                placeholder='상품명 검색…'
                style={{
                  width: '100%', boxSizing: 'border-box',
                  height: 52, padding: '0 16px',
                  border: '1px solid var(--mp-color-border)',
                  borderRadius: 'var(--mp-radius)',
                  fontSize: 17, outline: 'none', background: '#fff',
                }}
              />
            </div>

            {loadingFind && (
              <div style={{ textAlign: 'center', padding: 32, color: 'var(--mp-color-text-muted)' }}>검색 중…</div>
            )}
            {!loadingFind && available.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                <div style={{ fontSize: 18, color: 'var(--mp-color-text-muted)' }}>검색 결과가 없어요.</div>
              </div>
            ) : (
              !loadingFind && available.map(item => (
                <AvailableProductCard
                  key={item.product_id}
                  item={item}
                  onAdd={() => void addToMyShop(item.product_id)}
                  onRemove={() => void removeFromMyShop(item.product_id)}
                />
              ))
            )}
          </>
        )}
      </div>
    </>
  )
}
