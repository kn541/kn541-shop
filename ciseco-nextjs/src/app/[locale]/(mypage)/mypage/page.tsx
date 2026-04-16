'use client'
/**
 * KN541 마이페이지 홈 화면
 * 라우트: /[locale]/mypage
 *
 * Phase 4: Mock 데이터 기반 구현
 * Phase 5: GET /mypage/home API 연동으로 교체 예정
 *
 * 시나리오 4종:
 *   L1         - 일반회원 (마이샵 X, 유료 X)
 *   L2-pending - 마이샵 신청 후 승인 대기 중
 *   L2         - 마이샵 승인 (내몰 운영 가능)
 *   L3         - 유료회원 (수당·조직도·출금 전체)
 */
import { useState } from 'react'
import { useLocale } from 'next-intl'
import BackHeader from '@/components/mypage/BackHeader'
import BigCard from '@/components/mypage/BigCard'
import LockedCard from '@/components/mypage/LockedCard'
import SectionHeader from '@/components/mypage/SectionHeader'
import UserGreeting from '@/components/mypage/UserGreeting'
import {
  MOCK_SCENARIOS,
  SCENARIO_LABELS,
  DEFAULT_SCENARIO,
  type ScenarioKey,
} from '@/lib/mypage/mocks'

export default function MypageHomePage() {
  const locale = useLocale()
  const [scenario, setScenario] = useState<ScenarioKey>(DEFAULT_SCENARIO)
  const data = MOCK_SCENARIOS[scenario]
  const { user, shop, paid } = data

  const href = (path: string) => `/${locale}${path}`

  const isL2 = user.member_level === 'L2' || user.member_level === 'L3'
  const isL3 = user.member_level === 'L3'
  const shopPending = shop.status === 'PENDING'

  const shopSubtitle = shopPending
    ? '⭐ 마이샵 승인 검토 중입니다. 영업일 기준 2~3일 소요됩니다.'
    : isL2
    ? (shop.shop_name ?? '내 쇼핑몰')
    : '신청하면 나만의 쇼핑몰을 운영할 수 있어요'

  const l3Subtitle = isL3
    ? `유효 기간: ${paid.expires_at ? new Date(paid.expires_at).toLocaleDateString('ko-KR') : '-'}까지`
    : '유료회원은 541 배당, 조직도, 출금 서비스를 이용할 수 있어요.'

  return (
    <>
      {/* 공통 헤더 */}
      <BackHeader
        title='마이페이지'
        rightAction={
          <button
            onClick={() => { /* Phase 5에서 로그아웃 연동 */ }}
            style={{
              border: 'none', background: 'transparent',
              fontSize: 14, color: 'var(--mp-color-text-muted)',
              cursor: 'pointer', padding: '8px 4px',
            }}
          >
            로그아웃
          </button>
        }
      />

      {/* 사용자 인사 */}
      <UserGreeting data={data} />

      {/* ──── L1 섹션: 항상 열림 ──── */}
      <SectionHeader title='내 쇼핑' />
      <div style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <BigCard
          icon='🛒' label='주문 내역'
          href={href('/mypage/orders')}
          badge={data.summary.orders_pending > 0 ? data.summary.orders_pending : undefined}
        />
        <BigCard icon='📦' label='배송 조회' href={href('/mypage/orders')} />
        <BigCard icon='🔄' label='반품·교환' href={href('/mypage/orders')} />
        <BigCard icon='❌' label='취소 요청' href={href('/mypage/orders')} />
      </div>

      <div style={{ height: 12 }} />
      <SectionHeader title='내 혜택' />
      <div style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <BigCard
          icon='💰' label='적립금'
          href={href('/mypage/points')}
          badge={data.summary.points > 0 ? `${data.summary.points.toLocaleString('ko-KR')}원` : undefined}
        />
        <BigCard
          icon='🏷️' label='쿠폰함'
          href={href('/mypage/coupons')}
          badge={data.summary.coupons > 0 ? data.summary.coupons : undefined}
        />
      </div>

      <div style={{ height: 12 }} />
      <SectionHeader title='내 정보 · 고객지원' />
      <div style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <BigCard icon='👤' label='내 정보'    href={href('/mypage/profile')} />
        <BigCard icon='📬' label='1:1 문의'  href={href('/mypage/inquiries')} />
        <BigCard icon='📣' label='공지사항'  href={href('/mypage/notices')} />
        <BigCard icon='❓' label='FAQ'       href={href('/mypage/faq')} />
      </div>

      {/* ──── L2 섹션: 내 쇼핑몰 ──── */}
      <div style={{ height: 24 }} />
      <SectionHeader title='내 쇼핑몰' subtitle={shopSubtitle} />
      <div style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {!isL2 && !shopPending && (
          <BigCard icon='🏪' label='마이샵 신청하기' href={href('/mypage/shop/apply')} />
        )}
        {shopPending && (
          <div style={{
            background: '#FFF9E6',
            border: '1px solid #FF9F43',
            borderRadius: 'var(--mp-radius-lg)',
            padding: 16, minHeight: 120,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <div style={{ fontSize: 32 }}>⏳</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#FF9F43', textAlign: 'center' }}>승인 검토중</div>
            <div style={{ fontSize: 13, color: '#666', textAlign: 'center' }}>2~3일 내 통보 드립니다</div>
          </div>
        )}
        {isL2 ? (
          <>
            <BigCard icon='📅' label='판매 실적'    href={href('/mypage/shop/sales')} />
            <BigCard icon='📦' label='내 상품'      href={href('/mypage/shop/products')} />
            <BigCard icon='🎨' label='쇼핑몰 꾸미기' href={href('/mypage/shop/design')} />
            <BigCard icon='⚙️' label='쇼핑몰 설정'  href={href('/mypage/shop/settings')} />
          </>
        ) : (
          <>
            <LockedCard
              icon='📅' label='판매 실적'
              reason='마이샵 승인 후 판매 실적을 확인할 수 있어요.'
              benefitList={['내 판매액 확인', '소개인 판매 현황', '지도 통계']}
              actionLabel='마이샵 신청하기'
              actionHref={href('/mypage/shop/apply')}
            />
            <LockedCard
              icon='🎨' label='쇼핑몰 꾸미기'
              reason='마이샵 승인 후 나만의 쇼핑몰을 꾸밀 수 있어요.'
              benefitList={['템플릿 5개 선택', '로고 커스터마이징', '컨셉 색상 변경']}
              actionLabel='신청하기'
              actionHref={href('/mypage/shop/apply')}
            />
          </>
        )}
      </div>

      {/* ──── L3 섹션: 내 사업 (유료회원) ──── */}
      <div style={{ height: 24 }} />
      <SectionHeader title='내 사업 (유료회원)' subtitle={l3Subtitle} />
      <div style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {isL3 ? (
          <>
            <BigCard icon='💸' label='수당 현황'   href={href('/mypage/dividends')} />
            <BigCard icon='📄' label='배당 내역'   href={href('/mypage/dividends/history')} />
            <BigCard icon='📄' label='지급 내역'   href={href('/mypage/dividends/payouts')} />
            <BigCard icon='🌳' label='조직도'      href={href('/mypage/tree')} />
            <BigCard icon='📊' label='내 구매 내역' href={href('/mypage/purchases')} />
            <BigCard icon='💳' label='출금 신청'   href={href('/mypage/withdraw')} />
            <BigCard icon='📈' label='조직 통계'   href={href('/mypage/stats')} />
          </>
        ) : (
          <>
            <LockedCard
              icon='💸' label='수당 현황'
              reason='유료회원이 되시면 541 배당, 동사가치, 아지트 수당을 확인하실 수 있어요.'
              benefitList={['541 배당 확인', '동사가치 수당', '아지트 수당']}
              actionLabel='유료회원 알아보기'
              actionHref={href('/mypage/upgrade-paid')}
            />
            <LockedCard
              icon='🌳' label='조직도'
              reason='유료회원이 되시면 내 조직과 소개인 현황을 도표로 확인할 수 있어요.'
              benefitList={['리스트뷰 조직도', '트리뷰 조직도', '박스뷰 조직도']}
              actionLabel='유료회원 알아보기'
              actionHref={href('/mypage/upgrade-paid')}
            />
            <LockedCard
              icon='💳' label='출금 신청'
              reason='유료회원이 되시면 동사가치를 출금하실 수 있어요.'
              benefitList={['동사가치 출금 신청', '출금 내역 확인', '수수료 확인']}
              actionLabel='유료회원 알아보기'
              actionHref={href('/mypage/upgrade-paid')}
            />
            <LockedCard
              icon='📈' label='조직 통계'
              reason='유료회원이 되시면 내 조직의 가입·접속 통계를 확인할 수 있어요.'
              benefitList={['소개인 통계', '접속 통계', '실적 분석']}
              actionLabel='유료회원 알아보기'
              actionHref={href('/mypage/upgrade-paid')}
            />
          </>
        )}
      </div>

      {/* L1/L2 전용 CTA 배너 */}
      {!isL3 && (
        <div style={{
          margin: '24px 16px 16px',
          background: 'linear-gradient(135deg, #7367F0 0%, #9E95F5 100%)',
          borderRadius: 'var(--mp-radius-lg)',
          padding: '20px',
          color: '#fff',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>유료회원 전환하고</div>
            <div style={{ fontSize: 15, opacity: 0.9 }}>내 사업 시작하기 →</div>
          </div>
          <a
            href={href('/mypage/upgrade-paid')}
            style={{
              background: '#fff', color: '#7367F0',
              borderRadius: 'var(--mp-radius)', padding: '12px 18px',
              fontWeight: 700, fontSize: 15,
              textDecoration: 'none', whiteSpace: 'nowrap',
              display: 'block',
            }}
          >
            알아보기
          </a>
        </div>
      )}

      {/* ──── Step 4-3: 시나리오 스위치 (개발용) ──── */}
      <ScenarioSwitcher current={scenario} onChange={setScenario} />

      <div style={{ height: 32 }} />
    </>
  )
}

// ── 시나리오 스위치 (개발 툴) ─────────────────────────────────────
function ScenarioSwitcher({
  current,
  onChange,
}: {
  current: ScenarioKey
  onChange: (s: ScenarioKey) => void
}) {
  const keys: ScenarioKey[] = ['L1', 'L2-pending', 'L2', 'L3']
  return (
    <div style={{
      margin: '16px',
      padding: 16,
      background: '#1E1E2F',
      borderRadius: 'var(--mp-radius-lg)',
      color: '#fff',
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, opacity: 0.7 }}>
        🔧 DEV 시나리오 스위치 (Phase 5 API 연동 후 제거)
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {keys.map((k) => (
          <button
            key={k}
            onClick={() => onChange(k)}
            style={{
              padding: '8px 14px', borderRadius: 20, border: 'none',
              cursor: 'pointer', fontSize: 13, fontWeight: 700,
              background: current === k ? '#7367F0' : '#2D2D3F',
              color:      current === k ? '#fff'    : '#A6A4B0',
              transition: 'all 0.15s',
            }}
          >
            {SCENARIO_LABELS[k]}
          </button>
        ))}
      </div>
      <div style={{ marginTop: 10, fontSize: 12, opacity: 0.5 }}>
        현재: {SCENARIO_LABELS[current]}
      </div>
    </div>
  )
}
