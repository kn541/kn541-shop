'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { toast } from 'react-hot-toast'
import BackHeader from '@/components/mypage/BackHeader'
import BigCard from '@/components/mypage/BigCard'
import SectionHeader from '@/components/mypage/SectionHeader'
import { useMypageHome } from '@/lib/mypage/useMypageHome'
import { useMyShop } from '@/lib/mypage/useMyShop'

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 'var(--mp-radius-lg)',
      border: '1px solid var(--mp-color-border)',
      padding: '16px 12px', textAlign: 'center', flex: 1,
    }}>
      <div style={{ fontSize: 13, color: 'var(--mp-color-text-muted)', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800 }}>{value}</div>
    </div>
  )
}

export default function ShopHomePage() {
  const locale = useLocale()
  const router = useRouter()
  const { data: home, loading: homeLoading } = useMypageHome()
  const shopStatus = home?.shop?.status

  const shopApiEnabled = !homeLoading && (shopStatus === 'APPROVED' || shopStatus === 'SUSPENDED')
  const { shop, dashboard, loading: shopLoading, error: shopError, refetch } = useMyShop(shopApiEnabled)

  useEffect(() => {
    if (shopError) {
      toast.error(shopError.message)
    }
  }, [shopError])

  useEffect(() => {
    if (homeLoading) return
    if (!shopStatus || shopStatus === 'NONE') {
      router.replace(`/${locale}/mypage/shop/apply`)
    } else if (shopStatus === 'PENDING') {
      router.replace(`/${locale}/mypage/shop/status`)
    } else if (shopStatus === 'REJECTED') {
      router.replace(`/${locale}/mypage/shop/apply`)
    }
  }, [homeLoading, shopStatus, locale, router])

  if (homeLoading || !shopStatus || shopStatus !== 'APPROVED' && shopStatus !== 'SUSPENDED') {
    return <div style={{ padding: 48, textAlign: 'center', color: 'var(--mp-color-text-muted)' }}>불러오는 중…</div>
  }

  if (shopStatus === 'SUSPENDED') {
    return (
      <>
        <BackHeader title='내 쇼핑몰' />
        <div style={{ padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🚫</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>쇼핑몰이 정지됐습니다</h2>
          <p style={{ fontSize: 17, color: 'var(--mp-color-text-muted)', lineHeight: 1.7 }}>
            자세한 내용은 1:1 문의를 이용해 주세요.
          </p>
        </div>
      </>
    )
  }

  // APPROVED: 운영 홈 (GET /myshop + GET /myshop/dashboard)
  if (shopLoading || !shop) {
    return <div style={{ padding: 48, textAlign: 'center', color: 'var(--mp-color-text-muted)' }}>쇼핑몰 정보를 불러오는 중…</div>
  }

  const fullUrl = shop.shop_url || dashboard?.shop_url || ''
  const shopName = shop.shop_name
  const productCount = shop.product_count ?? dashboard?.product_count ?? 0
  const todayVisits = dashboard?.today_visits ?? 0
  const shareTotal = shop.share_count ?? 0
  const monthOrders = dashboard?.month_orders ?? 0

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: shopName, url: fullUrl })
      } catch { /* user cancel */ }
    } else {
      await navigator.clipboard.writeText(fullUrl)
      toast.success('링크를 복사했어요')
    }
  }

  const href = (path: string) => `/${locale}${path}`

  return (
    <>
      <BackHeader title='내 쇼핑몰' />

      <div style={{ background: '#fff', padding: '20px 16px', borderBottom: '1px solid var(--mp-color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 12,
            background: 'var(--mp-color-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, flexShrink: 0,
            overflow: 'hidden',
          }}>
            {shop.logo_url
              ? <img src={shop.logo_url as string} alt='' style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : '🏪'}
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{shopName}</div>
            <div style={{ fontSize: 13, color: 'var(--mp-color-text-muted)', marginTop: 2 }}>
              상품 {productCount}개 운영 중
            </div>
          </div>
        </div>

        <div style={{
          background: 'var(--mp-color-bg)', borderRadius: 'var(--mp-radius)',
          border: '1px solid var(--mp-color-border)',
          padding: '10px 14px', fontSize: 13,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--mp-color-text-muted)' }}>
            {fullUrl}
          </span>
          <button type='button' onClick={handleShare} style={{
            padding: '6px 14px', background: 'var(--mp-color-primary)', color: '#fff',
            border: 'none', borderRadius: 20, fontSize: 13, fontWeight: 700, cursor: 'pointer', flexShrink: 0,
          }}>공유</button>
          <button
            type='button'
            onClick={async () => {
              await navigator.clipboard.writeText(fullUrl)
              toast.success('복사됐어요')
            }}
            style={{
              padding: '6px 14px', background: '#F5F5F5',
              border: 'none', borderRadius: 20, fontSize: 13, cursor: 'pointer', flexShrink: 0,
            }}
          >복사</button>
        </div>
      </div>

      <SectionHeader title='이번 달 · 오늘' />
      <div style={{ padding: '0 16px', display: 'flex', gap: 10 }}>
        <StatCard label='오늘 방문' value={`${todayVisits.toLocaleString('ko-KR')}명`} />
        <StatCard label='누적 공유' value={`${shareTotal.toLocaleString('ko-KR')}회`} />
        <StatCard label='이번 달 주문' value={`${monthOrders}건`} />
      </div>

      <SectionHeader title='관리 메뉴' />
      <div style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <BigCard icon='📦' label='상품 담기' href={href('/mypage/shop/products')} />
        <BigCard icon='🎨' label='꾸미기' href={href('/mypage/shop/design')} />
        <BigCard icon='📊' label='판매 실적' href={href('/mypage/shop/sales')} />
        <BigCard icon='⚙️' label='설정' href={href('/mypage/shop/settings')} />
        <BigCard icon='🔗' label='공유하기' href={fullUrl} />
      </div>

      <div style={{ padding: '12px 16px 0', fontSize: 13, color: 'var(--mp-color-text-muted)', textAlign: 'center' }}>
        <button
          type='button'
          onClick={() => void refetch()}
          style={{ background: 'none', border: 'none', color: 'var(--mp-color-primary)', textDecoration: 'underline', cursor: 'pointer', fontSize: 13 }}
        >
          새로고침
        </button>
      </div>

      <div style={{ height: 24 }} />
    </>
  )
}
