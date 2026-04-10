'use client'

import { useEffect, useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import ButtonSecondary from '@/shared/Button/ButtonSecondary'
import { toast } from 'react-hot-toast'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'https://kn541-production.up.railway.app'

function getHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

interface Shop {
  id: string
  shop_name: string
  shop_url_code: string
  shop_description: string | null
  shop_url: string
  visit_count: number
  share_count: number
  product_count: number
  is_active: boolean
}

interface Dashboard {
  today_visits: number
  month_orders: number
  month_sales: string
  pending_commission: string
  product_count: number
  active_product_count: number
  shop_url: string
  share_links: { kakao: string; sms: string; link: string }
}

interface ShopProduct {
  product_id: string
  product_name: string
  thumbnail_url: string | null
  category_name: string | null
  base_sale_price: string
  custom_price: string | null
  effective_price: string
  supply_price: string
  is_soldout: boolean
  is_discontinued: boolean
  is_active: boolean
  sort_order: number
}

type TabType = 'info' | 'products' | 'dashboard' | 'share'

export default function MyShopPage() {
  const router = useRouter()
  const [tab, setTab] = useState<TabType>('info')
  const [shop, setShop] = useState<Shop | null>(null)
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [products, setProducts] = useState<ShopProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)

  // 신규 생성 폼
  const [newShopName, setNewShopName] = useState('')
  const [newUrlCode, setNewUrlCode] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [urlAvailable, setUrlAvailable] = useState<boolean | null>(null)

  useEffect(() => {
    fetchShop()
  }, [])

  useEffect(() => {
    if (shop && tab === 'dashboard') fetchDashboard()
    if (shop && tab === 'products') fetchProducts()
  }, [tab, shop])

  async function fetchShop() {
    try {
      const r = await fetch(`${BASE}/myshop`, { headers: getHeaders() })
      if (r.status === 401) { router.push('/login'); return }
      const data = await r.json()
      setShop(data.data)
    } catch {
      toast.error('쇼핑몰 정보를 불러오지 못했습니다')
    } finally {
      setLoading(false)
    }
  }

  async function fetchDashboard() {
    try {
      const r = await fetch(`${BASE}/myshop/dashboard`, { headers: getHeaders() })
      const data = await r.json()
      setDashboard(data.data)
    } catch {}
  }

  async function fetchProducts() {
    try {
      const r = await fetch(`${BASE}/myshop/products`, { headers: getHeaders() })
      const data = await r.json()
      setProducts(data.data?.items || [])
    } catch {}
  }

  async function checkUrl(code: string) {
    if (code.length < 6) { setUrlAvailable(null); return }
    try {
      const r = await fetch(`${BASE}/myshop/check-url?code=${code}`, { headers: getHeaders() })
      const data = await r.json()
      setUrlAvailable(data.data?.available ?? false)
    } catch {}
  }

  async function createShop() {
    if (!newShopName.trim()) { toast.error('쇼핑몰 이름을 입력해주세요'); return }
    if (urlAvailable === false) { toast.error('사용 불가능한 URL 코드입니다'); return }
    try {
      const r = await fetch(`${BASE}/myshop`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          shop_name: newShopName,
          shop_url_code: newUrlCode || undefined,
          shop_description: newDesc || null,
          template_code: '001',
        }),
      })
      if (r.ok) {
        toast.success('쇼핑몰이 개설됐습니다!')
        setIsCreating(false)
        fetchShop()
      } else {
        const err = await r.json()
        toast.error(err.detail || '개설에 실패했습니다')
      }
    } catch {
      toast.error('오류가 발생했습니다')
    }
  }

  async function toggleProduct(productId: string, isActive: boolean) {
    try {
      await fetch(`${BASE}/myshop/products/${productId}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ is_active: !isActive }),
      })
      toast.success(isActive ? '상품을 숨겼습니다' : '상품을 노출했습니다')
      fetchProducts()
    } catch {
      toast.error('오류가 발생했습니다')
    }
  }

  async function removeProduct(productId: string) {
    if (!confirm('이 상품을 내 쇼핑몰에서 제거할까요?')) return
    try {
      await fetch(`${BASE}/myshop/products/${productId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
      toast.success('상품을 제거했습니다')
      fetchProducts()
    } catch {
      toast.error('오류가 발생했습니다')
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    toast.success('링크가 복사됐습니다!')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  // 쇼핑몰 미개설 상태
  if (!shop) {
    if (isCreating) {
      return (
        <div className="flex flex-col gap-y-8">
          <h1 className="text-2xl font-semibold sm:text-3xl">내 쇼핑몰 개설</h1>
          <div className="max-w-lg space-y-5 rounded-2xl border border-neutral-200 p-6 dark:border-neutral-700">
            <div>
              <label className="mb-2 block text-sm font-medium">쇼핑몰 이름 *</label>
              <input
                type="text"
                value={newShopName}
                onChange={e => setNewShopName(e.target.value)}
                placeholder="예: 홍길동의 건강샵"
                className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">URL 코드 (선택)</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-500">shop.kn541.co.kr/s/</span>
                <input
                  type="text"
                  value={newUrlCode}
                  onChange={e => { setNewUrlCode(e.target.value); checkUrl(e.target.value) }}
                  placeholder="영문+숫자 6~20자"
                  className="flex-1 rounded-xl border border-neutral-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900"
                />
              </div>
              {urlAvailable === true && <p className="mt-1 text-xs text-green-500">✓ 사용 가능한 URL입니다</p>}
              {urlAvailable === false && <p className="mt-1 text-xs text-red-500">✗ 이미 사용 중인 URL입니다</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">쇼핑몰 소개 (선택)</label>
              <textarea
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                rows={3}
                placeholder="쇼핑몰 소개를 입력해주세요"
                className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900"
              />
            </div>
            <div className="flex gap-3">
              <ButtonPrimary onClick={createShop}>개설하기</ButtonPrimary>
              <ButtonSecondary onClick={() => setIsCreating(false)}>취소</ButtonSecondary>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="flex flex-col items-center gap-y-6 py-20 text-center">
        <div className="text-6xl">🏪</div>
        <h2 className="text-xl font-semibold">내 쇼핑몰이 없습니다</h2>
        <p className="text-sm text-neutral-500">나만의 쇼핑몰을 개설하고 상품을 판매해보세요!</p>
        <ButtonPrimary onClick={() => setIsCreating(true)}>쇼핑몰 개설하기</ButtonPrimary>
      </div>
    )
  }

  // 탭 메뉴
  const subTabs: { key: TabType; label: string }[] = [
    { key: 'info', label: '쇼핑몰 정보' },
    { key: 'products', label: '상품 관리' },
    { key: 'dashboard', label: '방문/매출' },
    { key: 'share', label: '공유 링크' },
  ]

  return (
    <div className="flex flex-col gap-y-8">
      <h1 className="text-2xl font-semibold sm:text-3xl">내 쇼핑몰</h1>

      {/* 서브 탭 */}
      <div className="flex gap-4 border-b border-neutral-200 dark:border-neutral-700">
        {subTabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`pb-3 text-sm font-medium ${
              tab === t.key
                ? 'border-b-2 border-primary-500 text-primary-600'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 쇼핑몰 정보 탭 */}
      {tab === 'info' && (
        <div className="max-w-lg space-y-5">
          <div className="rounded-2xl border border-neutral-200 p-6 dark:border-neutral-700">
            <div className="space-y-4">
              <div>
                <p className="text-xs text-neutral-500">쇼핑몰 이름</p>
                <p className="font-semibold">{shop.shop_name}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">쇼핑몰 URL</p>
                <a href={shop.shop_url} target="_blank" className="text-sm text-primary-600 hover:underline">
                  {shop.shop_url}
                </a>
              </div>
              {shop.shop_description && (
                <div>
                  <p className="text-xs text-neutral-500">소개</p>
                  <p className="text-sm">{shop.shop_description}</p>
                </div>
              )}
              <div className="flex gap-6 pt-2 text-sm text-neutral-500">
                <span>방문 {shop.visit_count?.toLocaleString()}회</span>
                <span>공유 {shop.share_count?.toLocaleString()}회</span>
                <span>상품 {shop.product_count}개</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <ButtonPrimary onClick={() => setTab('products')}>상품 관리하기</ButtonPrimary>
            <ButtonSecondary onClick={() => copyToClipboard(shop.shop_url)}>URL 복사</ButtonSecondary>
          </div>
        </div>
      )}

      {/* 상품 관리 탭 */}
      {tab === 'products' && (
        <div className="space-y-4">
          {products.length === 0 ? (
            <div className="py-12 text-center text-sm text-neutral-500">
              담은 상품이 없습니다. 상품을 검색해서 담아보세요.
            </div>
          ) : (
            products.map(p => (
              <div key={p.product_id} className={`flex items-center gap-4 rounded-2xl border p-4 dark:border-neutral-700 ${
                !p.is_active ? 'opacity-50' : ''
              }`}>
                {p.thumbnail_url && (
                  <img src={p.thumbnail_url} alt={p.product_name} className="h-16 w-16 rounded-xl object-cover" />
                )}
                <div className="flex-1">
                  <p className="font-medium">{p.product_name}</p>
                  <p className="text-sm text-neutral-500">{p.category_name}</p>
                  <p className="text-sm font-semibold text-primary-600">{Number(p.effective_price).toLocaleString()}원</p>
                  {p.is_soldout && <span className="text-xs text-red-500">품절</span>}
                  {p.is_discontinued && <span className="text-xs text-neutral-400">단종</span>}
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => toggleProduct(p.product_id, p.is_active)}
                    className={`rounded-lg px-3 py-1 text-xs font-medium ${
                      p.is_active
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30'
                        : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800'
                    }`}
                  >
                    {p.is_active ? '노출 중' : '숨김'}
                  </button>
                  <button
                    onClick={() => removeProduct(p.product_id)}
                    className="rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-600 dark:bg-red-900/30"
                  >
                    제거
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 대시보드 탭 */}
      {tab === 'dashboard' && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[
            { label: '오늘 방문', value: `${dashboard?.today_visits || 0}명` },
            { label: '이번 달 주문', value: `${dashboard?.month_orders || 0}건` },
            { label: '이번 달 매출', value: `${Number(dashboard?.month_sales || 0).toLocaleString()}원` },
            { label: '미지급 수당', value: `${Number(dashboard?.pending_commission || 0).toLocaleString()}원` },
            { label: '진열 상품', value: `${dashboard?.active_product_count || 0}개` },
            { label: '전체 상품', value: `${dashboard?.product_count || 0}개` },
          ].map(item => (
            <div key={item.label} className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-700">
              <p className="text-xs text-neutral-500">{item.label}</p>
              <p className="mt-1 text-xl font-bold">{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* 공유 링크 탭 */}
      {tab === 'share' && (
        <div className="max-w-lg space-y-4">
          {[
            { label: '쇼핑몰 링크', url: dashboard?.share_links?.link || shop.shop_url, icon: '🔗' },
            { label: '카카오 공유 링크', url: dashboard?.share_links?.kakao || `${shop.shop_url}?ref=kakao`, icon: '💬' },
            { label: 'SMS 공유 링크', url: dashboard?.share_links?.sms || `${shop.shop_url}?ref=sms`, icon: '📱' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-neutral-200 p-4 dark:border-neutral-700">
              <span className="text-2xl">{item.icon}</span>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs text-neutral-500">{item.label}</p>
                <p className="truncate text-sm">{item.url}</p>
              </div>
              <button
                onClick={() => copyToClipboard(item.url)}
                className="shrink-0 rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-100 dark:bg-primary-900/30"
              >
                복사
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
