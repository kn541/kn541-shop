'use client'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import BackHeader from '@/components/mypage/BackHeader'
import BigTabs from '@/components/mypage/BigTabs'
import BigButton from '@/components/mypage/BigButton'
import {
  MOCK_SHOP_PRODUCTS,
  MOCK_AVAILABLE_PRODUCTS,
} from '@/lib/mypage/mocks'
import type { ShopProduct, AvailableProduct } from '@/lib/mypage/types'

// ─── 탭 1: 담은 상품 ─────────────────────────────────────────────────────
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
      {/* 썸네일 */}
      <div style={{
        width: 64, height: 64, background: '#F5F5F5',
        borderRadius: 8, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
      }}>
        {item.product_thumbnail
          ? <img src={item.product_thumbnail} alt='' style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
          : '📦'}
      </div>

      {/* 정보 */}
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

      {/* 순서 + 제거 버튼 (드래그 앤 드롭 대신 위/아래 버튼) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
        <button
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

// ─── 탭 2: 상품 담기 ─────────────────────────────────────────────────────
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

// ─── 메인 페이지 ───────────────────────────────────────────────────────────
export default function ShopProductsPage() {
  const [tab, setTab] = useState<'MY' | 'ADD'>('MY')
  const [myProducts, setMyProducts] = useState<ShopProduct[]>(MOCK_SHOP_PRODUCTS)
  const [available, setAvailable] = useState<AvailableProduct[]>(MOCK_AVAILABLE_PRODUCTS)
  const [keyword, setKeyword] = useState('')

  // 위/아래 이동 (드래그 앤 드롭 대신)
  const moveUp = (idx: number) => {
    if (idx === 0) return
    const next = [...myProducts]
    ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
    setMyProducts(next)
  }
  const moveDown = (idx: number) => {
    if (idx === myProducts.length - 1) return
    const next = [...myProducts]
    ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
    setMyProducts(next)
  }
  const removeFromMyShop = (shopProductId: string, productId: string) => {
    setMyProducts(p => p.filter(x => x.shop_product_id !== shopProductId))
    setAvailable(p => p.map(x => x.product_id === productId ? { ...x, is_added: false } : x))
    toast.success('상품을 제거했어요')
  }

  const addToMyShop = (productId: string) => {
    const product = available.find(p => p.product_id === productId)
    if (!product) return
    const newItem: ShopProduct = {
      shop_product_id: `sp-new-${Date.now()}`,
      product_id: productId,
      product_name: product.product_name,
      product_price: product.price,
      product_thumbnail: product.thumbnail,
      sort_order: (myProducts.length + 1) * 10,
      added_at: new Date().toISOString(),
    }
    setMyProducts(p => [...p, newItem])
    setAvailable(p => p.map(x => x.product_id === productId ? { ...x, is_added: true } : x))
    toast.success('상품을 담았어요')
  }

  const filteredAvailable = available.filter(p =>
    !keyword || p.product_name.toLowerCase().includes(keyword.toLowerCase())
  )

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
        {/* ── 탭 1: 담은 상품 ── */}
        {tab === 'MY' && (
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
                    key={item.shop_product_id}
                    item={item}
                    isFirst={idx === 0}
                    isLast={idx === myProducts.length - 1}
                    onMoveUp={() => moveUp(idx)}
                    onMoveDown={() => moveDown(idx)}
                    onRemove={() => removeFromMyShop(item.shop_product_id, item.product_id)}
                  />
                ))}
              </>
            )}
          </>
        )}

        {/* ── 탭 2: 상품 담기 ── */}
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

            {filteredAvailable.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                <div style={{ fontSize: 18, color: 'var(--mp-color-text-muted)' }}>검색 결과가 없어요.</div>
              </div>
            ) : (
              filteredAvailable.map(item => (
                <AvailableProductCard
                  key={item.product_id}
                  item={item}
                  onAdd={() => addToMyShop(item.product_id)}
                  onRemove={() => {
                    const mine = myProducts.find(p => p.product_id === item.product_id)
                    if (mine) removeFromMyShop(mine.shop_product_id, item.product_id)
                  }}
                />
              ))
            )}
          </>
        )}
      </div>
    </>
  )
}
