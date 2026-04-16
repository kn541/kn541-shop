'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { toast } from 'react-hot-toast'
import BackHeader from '@/components/mypage/BackHeader'
import BigCard from '@/components/mypage/BigCard'
import SectionHeader from '@/components/mypage/SectionHeader'
import { useMypageHome } from '@/lib/mypage/useMypageHome'
import { MOCK_SHOP_HOME } from '@/lib/mypage/mocks'

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
  const { data: home, loading } = useMypageHome()

  const shopStatus = home?.shop?.status

  useEffect(() => {
    if (loading) return
    if (!shopStatus || shopStatus === 'NONE') {
      router.replace(`/${locale}/mypage/shop/apply`)
    } else if (shopStatus === 'PENDING') {
      router.replace(`/${locale}/mypage/shop/status`)
    } else if (shopStatus === 'REJECTED') {
      router.replace(`/${locale}/mypage/shop/apply`)
    }
  }, [loading, shopStatus, locale, router])

  if (loading || !shopStatus || shopStatus !== 'APPROVED' && shopStatus !== 'SUSPENDED') {
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

  // APPROVED: 운영 홈
  const shop = MOCK_SHOP_HOME

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: shop.shop_name, url: shop.full_url })
      } catch {}
    } else {
      await navigator.clipboard.writeText(shop.full_url)
      toast.success('링크를 복사했어요')
    }
  }

  const href = (path: string) => `/${locale}${path}`

  return (
    <>
      <BackHeader title='내 쇼핑몰' />

      {/* 상단 숍 정보 */}
      <div style={{ background: '#fff', padding: '20px 16px', borderBottom: '1px solid var(--mp-color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 12,
            background: 'var(--mp-color-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, flexShrink: 0,
          }}>🏪</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{shop.shop_name}</div>
            <div style={{ fontSize: 13, color: 'var(--mp-color-text-muted)', marginTop: 2 }}>
              상품 {shop.total_product_count}개 운영 중
            </div>
          </div>
        </div>

        {/* URL + 공유 버튼 */}
        <div style={{
          background: 'var(--mp-color-bg)', borderRadius: 'var(--mp-radius)',
          border: '1px solid var(--mp-color-border)',
          padding: '10px 14px', fontSize: 13,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--mp-color-text-muted)' }}>
            {shop.full_url}
          </span>
          <button onClick={handleShare} style={{
            padding: '6px 14px', background: 'var(--mp-color-primary)', color: '#fff',
            border: 'none', borderRadius: 20, fontSize: 13, fontWeight: 700, cursor: 'pointer', flexShrink: 0,
          }}>공유</button>
          <button
            onClick={async () => {
              await navigator.clipboard.writeText(shop.full_url)
              toast.success('복사됐어요')
            }}
            style={{
              padding: '6px 14px', background: '#F5F5F5',
              border: 'none', borderRadius: 20, fontSize: 13, cursor: 'pointer', flexShrink: 0,
            }}
          >복사</button>
        </div>
      </div>

      {/* 이번 달 통계 */}
      <SectionHeader title='이번 달' />
      <div style={{ padding: '0 16px', display: 'flex', gap: 10 }}>
        <StatCard label='방문'   value={`${shop.this_month_visit_count.toLocaleString('ko-KR')}명`} />
        <StatCard label='공유'   value={`${shop.this_month_share_count}회`} />
        <StatCard label='주문'   value={`${shop.this_month_order_count}건`} />
      </div>

      {/* 관리 메뉴 */}
      <SectionHeader title='관리 메뉴' />
      <div style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <BigCard icon='📦' label='상품 담기'  href={href('/mypage/shop/products')} />
        <BigCard icon='🎨' label='꾸미기'     href={href('/mypage/shop/design')} />
        <BigCard icon='📊' label='판매 실적'  href={href('/mypage/shop/sales')} />
        <BigCard icon='🔗' label='공유하기'   href={shop.full_url} />
      </div>

      <div style={{ height: 24 }} />
    </>
  )
}
