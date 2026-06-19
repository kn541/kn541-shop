'use client'
// KN541 쇼핑몰 — 마이페이지 > 내 쇼핑몰 (분양몰)
// API: GET/POST/PATCH /my/shop, /my/shop/products, /my/shop/dashboard, /my/shop/share-link

import { useState, useEffect } from 'react'

const BASE = process.env.NEXT_PUBLIC_API_URL

interface Shop {
  shop_id: number
  shop_name: string
  shop_url_code: string
  shop_description: string
  logo_url: string
  is_active: boolean
}

interface ShopProduct {
  product_id: number
  product_name: string
  original_price: number
  custom_price: number | null
  is_active: boolean
  thumbnail_url: string
}

type SubTab = 'info' | 'products' | 'dashboard' | 'share'

export default function MyShopPage() {
  const [shop, setShop] = useState<Shop | null>(null)
  const [loading, setLoading] = useState(true)
  const [subTab, setSubTab] = useState<SubTab>('info')
  const [creating, setCreating] = useState(false)

  // 쇼핑몰 개설 폼
  const [newShopName, setNewShopName] = useState('')
  const [newUrlCode, setNewUrlCode] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [urlMsg, setUrlMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [urlChecking, setUrlChecking] = useState(false)

  // 상품 목록
  const [products, setProducts] = useState<ShopProduct[]>([])

  // 대시보드
  const [dashboard, setDashboard] = useState<Record<string, number>>({})

  // 공유 링크
  const [shareUrl, setShareUrl] = useState('')

  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const headers = () => ({
    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    'Content-Type': 'application/json',
  })

  // 쇼핑몰 정보 조회
  useEffect(() => {
    fetch(`${BASE}/my/shop`, { headers: headers() })
      .then(r => r.json())
      .then(res => {
        if (res.status === 'success' && res.data) setShop(res.data)
      })
      .finally(() => setLoading(false))
  }, [])

  // 탭 전환 시 데이터 로드
  useEffect(() => {
    if (!shop) return
    if (subTab === 'products') {
      fetch(`${BASE}/my/shop/products`, { headers: headers() })
        .then(r => r.json())
        .then(res => { if (res.status === 'success') setProducts(res.data.items ?? []) })
    }
    if (subTab === 'dashboard') {
      fetch(`${BASE}/my/shop/dashboard`, { headers: headers() })
        .then(r => r.json())
        .then(res => { if (res.status === 'success') setDashboard(res.data ?? {}) })
    }
    if (subTab === 'share') {
      fetch(`${BASE}/my/shop/share-link`, { headers: headers() })
        .then(r => r.json())
        .then(res => { if (res.status === 'success') setShareUrl(res.data?.share_url ?? '') })
    }
  }, [subTab, shop])

  // URL 중복 확인 (디바운싱)
  useEffect(() => {
    if (!newUrlCode) { setUrlMsg(null); return }
    const timer = setTimeout(async () => {
      setUrlChecking(true)
      try {
        const res = await fetch(`${BASE}/my/shop/check-url/${newUrlCode}`, { headers: headers() })
        const json = await res.json()
        setUrlMsg(json.available
          ? { type: 'ok', text: '사용 가능한 주소입니다.' }
          : { type: 'err', text: '이미 사용 중인 주소입니다.' })
      } catch { setUrlMsg({ type: 'err', text: '확인 중 오류가 발생했습니다.' }) }
      finally { setUrlChecking(false) }
    }, 500)
    return () => clearTimeout(timer)
  }, [newUrlCode])

  // 쇼핑몰 개설
  const handleCreate = async () => {
    if (!newShopName || !newUrlCode) return
    setCreating(true)
    try {
      const res = await fetch(`${BASE}/my/shop`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ shop_name: newShopName, shop_url_code: newUrlCode, shop_description: newDesc }),
      })
      const json = await res.json()
      if (res.ok && json.status === 'success') {
        setShop(json.data)
        setMsg({ type: 'success', text: '쇼핑몰이 개설됐습니다!' })
      } else {
        setMsg({ type: 'error', text: json.detail ?? '개설 중 오류가 발생했습니다.' })
      }
    } catch { setMsg({ type: 'error', text: '서버 연결에 실패했습니다.' }) }
    finally { setCreating(false) }
  }

  // 상품 ON/OFF 토글
  const toggleProduct = async (productId: number, isActive: boolean) => {
    await fetch(`${BASE}/my/shop/products/${productId}`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ is_active: !isActive }),
    })
    setProducts(prev => prev.map(p => p.product_id === productId ? { ...p, is_active: !isActive } : p))
  }

  if (loading) return <div className="py-16 text-center text-neutral-400">불러오는 중...</div>

  // 쇼핑몰 미개설 시
  if (!shop) {
    return (
      <div>
        <h2 className="mb-6 text-lg font-semibold text-neutral-800 dark:text-neutral-200">내 쇼핑몰 개설</h2>
        <div className="max-w-md space-y-5 rounded-2xl border border-neutral-200 p-6 dark:border-neutral-700">
          <p className="text-sm text-neutral-500">아직 개설된 쇼핑몰이 없습니다. 지금 개설해 보세요!</p>
          <div>
            <label className={labelClass}>쇼핑몰 이름 *</label>
            <input type="text" value={newShopName} onChange={e => setNewShopName(e.target.value)} className={inputClass} placeholder="내 쇼핑몰" />
          </div>
          <div>
            <label className={labelClass}>쇼핑몰 주소 *</label>
            <input type="text" value={newUrlCode} onChange={e => setNewUrlCode(e.target.value.toLowerCase())} className={inputClass} placeholder="영문·숫자·하이픈 5~50자" />
            {urlChecking && <p className="mt-1 text-xs text-neutral-400">확인 중...</p>}
            {urlMsg && <p className={`mt-1 text-xs ${urlMsg.type === 'ok' ? 'text-green-600' : 'text-red-500'}`}>{urlMsg.text}</p>}
            {newUrlCode && <p className="mt-1 text-xs text-neutral-400">shop.kn541.co.kr/s/{newUrlCode}</p>}
          </div>
          <div>
            <label className={labelClass}>쇼핑몰 소개 (선택)</label>
            <textarea rows={3} value={newDesc} onChange={e => setNewDesc(e.target.value)} className={inputClass + ' resize-none'} placeholder="쇼핑몰 소개를 입력하세요." />
          </div>
          {msg && <div className={`rounded-xl px-4 py-3 text-sm ${msg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{msg.text}</div>}
          <button onClick={handleCreate} disabled={creating || urlMsg?.type === 'err'} className="w-full rounded-xl bg-neutral-900 py-3 text-sm font-semibold text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900">
            {creating ? '개설 중...' : '쇼핑몰 개설하기'}
          </button>
        </div>
      </div>
    )
  }

  // 쇼핑몰 관리 화면
  const SUB_TABS: { key: SubTab; label: string }[] = [
    { key: 'info', label: '쇼핑몰 정보' },
    { key: 'products', label: '상품 관리' },
    { key: 'dashboard', label: '대시보드' },
    { key: 'share', label: '공유 링크' },
  ]

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-neutral-800 dark:text-neutral-200">{shop.shop_name}</h2>
      <p className="mb-5 text-sm text-neutral-400">shop.kn541.co.kr/s/{shop.shop_url_code}</p>

      {/* sub-탭 */}
      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-neutral-200 dark:border-neutral-700">
        {SUB_TABS.map(t => (
          <button key={t.key} onClick={() => setSubTab(t.key)}
            className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium transition border-b-2 ${subTab === t.key ? 'border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-neutral-100' : 'border-transparent text-neutral-400 hover:text-neutral-600'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* 쇼핑몰 정보 */}
      {subTab === 'info' && (
        <div className="max-w-md space-y-4">
          <div><label className={labelClass}>쇼핑몰 이름</label><p className={readClass}>{shop.shop_name}</p></div>
          <div><label className={labelClass}>쇼핑몰 주소</label><p className={readClass}>shop.kn541.co.kr/s/{shop.shop_url_code}</p></div>
          <div><label className={labelClass}>소개</label><p className={readClass}>{shop.shop_description || '-'}</p></div>
          <div><label className={labelClass}>상태</label>
            <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${shop.is_active ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>
              {shop.is_active ? '운영중' : '비활성'}
            </span>
          </div>
        </div>
      )}

      {/* 상품 관리 */}
      {subTab === 'products' && (
        <div>
          {products.length === 0
            ? <div className="rounded-2xl border border-neutral-200 py-12 text-center text-neutral-400 dark:border-neutral-700">담긴 상품이 없습니다.</div>
            : <div className="space-y-3">
                {products.map(p => (
                  <div key={p.product_id} className="flex items-center gap-4 rounded-2xl border border-neutral-200 p-4 dark:border-neutral-700">
                    {p.thumbnail_url && <img src={p.thumbnail_url} alt={p.product_name} className="h-14 w-14 rounded-xl object-cover" />}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{p.product_name}</p>
                      <p className="text-xs text-neutral-400">원가 {(p.original_price ?? 0).toLocaleString()}원
                        {p.custom_price ? ` / 판매가 ${p.custom_price.toLocaleString()}원` : ' / 원가 판매'}
                      </p>
                    </div>
                    <button onClick={() => toggleProduct(p.product_id, p.is_active)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>
                      {p.is_active ? 'ON' : 'OFF'}
                    </button>
                  </div>
                ))}
              </div>
          }
        </div>
      )}

      {/* 대시보드 */}
      {subTab === 'dashboard' && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[
            { label: '총 방문수', value: dashboard.total_visits ?? 0 },
            { label: '총 판매수', value: dashboard.total_sales ?? 0 },
            { label: '총 매출', value: `${(dashboard.total_revenue ?? 0).toLocaleString()}원` },
          ].map(item => (
            <div key={item.label} className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-700">
              <p className="mb-1 text-xs text-neutral-400">{item.label}</p>
              <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* 공유 링크 */}
      {subTab === 'share' && (
        <div className="max-w-md">
          <p className="mb-3 text-sm text-neutral-500">내 쇼핑몰 링크를 공유해 보세요!</p>
          <div className="flex items-center gap-2 rounded-2xl border border-neutral-200 p-4 dark:border-neutral-700">
            <p className="flex-1 truncate text-sm text-neutral-700 dark:text-neutral-300">{shareUrl || `shop.kn541.co.kr/s/${shop.shop_url_code}`}</p>
            <button onClick={() => { navigator.clipboard.writeText(shareUrl || `https://shop.kn541.co.kr/s/${shop.shop_url_code}`); setMsg({ type: 'success', text: '링크가 복사됐습니다.' }) }}
              className="rounded-xl bg-neutral-900 px-4 py-2 text-xs font-medium text-white dark:bg-neutral-100 dark:text-neutral-900">
              복사
            </button>
          </div>
          {msg && <p className="mt-3 text-sm text-green-600">{msg.text}</p>}
        </div>
      )}
    </div>
  )
}

const labelClass = 'mb-1.5 block text-sm font-medium text-neutral-600 dark:text-neutral-400'
const inputClass = 'w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100'
const readClass = 'rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-400'
