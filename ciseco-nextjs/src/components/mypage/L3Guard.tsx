'use client'
import { useLocale } from 'next-intl'
import { useMypageHome } from '@/lib/mypage/useMypageHome'
import BackHeader from './BackHeader'
import LockedCard from './LockedCard'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  title: string
  lockBenefits?: string[]
  /** (accounts) Ciseco 레이아웃 안에서 사용 시 BackHeader 생략 */
  embedded?: boolean
}

const DEFAULT_BENEFITS = [
  '541 배당 실시간 확인',
  '동사가치 · 아지트 배당 내역',
  '출금 신청 및 조직도 조회',
]

// L3 유료회원만 접근 가능—교 래퍼
export default function L3Guard({ children, title, lockBenefits, embedded }: Props) {
  const locale = useLocale()
  const { data, loading } = useMypageHome()

  if (loading) {
    return (
      <>
        {!embedded && <BackHeader title={title} />}
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--mp-color-text-muted)' }}>불러오는 중…</div>
      </>
    )
  }

  // L3 유료회원: member_level === 'L3' AND paid.is_active === true
  const isL3 = data?.user?.member_level === 'L3' && data?.paid?.is_active === true

  if (!isL3) {
    return (
      <>
        {!embedded && <BackHeader title={title} />}
        <div style={{ padding: 16 }}>
          <LockedCard
            icon='🔒'
            label={title}
            reason='유료회원 전용 기능입니다. 유료회원이 되시면 이용하실 수 있어요.'
            benefitList={lockBenefits ?? DEFAULT_BENEFITS}
            actionLabel='유료회원 알아보기'
            actionHref={`/${locale}/upgrade-paid`}
          />
        </div>
      </>
    )
  }

  return <>{children}</>
}
