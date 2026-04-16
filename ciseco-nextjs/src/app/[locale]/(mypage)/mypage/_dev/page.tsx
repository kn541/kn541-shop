'use client'
import { useState } from 'react'
import BackHeader from '@/components/mypage/BackHeader'
import BigCard from '@/components/mypage/BigCard'
import BigButton from '@/components/mypage/BigButton'
import BigTabs from '@/components/mypage/BigTabs'
import LockedCard from '@/components/mypage/LockedCard'
import SectionHeader from '@/components/mypage/SectionHeader'

export default function MypageDevPage() {
  const [tab, setTab] = useState('all')

  return (
    <>
      <BackHeader title='공통 컴포넌트 데모' />
      <div style={{ padding: 16 }}>

        <SectionHeader title='BigCard 예시' subtitle='일반 메뉴 카드' />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <BigCard icon='🛒' label='내 주문' href='/mypage/orders' />
          <BigCard icon='💰' label='적립금' href='/mypage/points' badge='3' />
          <BigCard icon='🏷️' label='쿠폰함' href='/mypage/coupons' badge='NEW' />
          <BigCard icon='📨' label='1:1 문의' href='/mypage/inquiries' />
        </div>

        <SectionHeader title='LockedCard 예시' subtitle='잠김 메뉴 카드' />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <LockedCard
            icon='💸'
            label='수당 현황'
            reason='유료회원이 되시면 수당을 확인하실 수 있어요.'
            benefitList={['541 배당 확인', '조직도 보기', '출금 신청']}
            actionLabel='자세히 알아보기'
            actionHref='/mypage/upgrade'
          />
          <LockedCard
            icon='🏪'
            label='내 쇼핑몰'
            reason='마이샵 신청 후 이용 가능합니다.'
            benefitList={['나만의 쇼핑몰 운영', '상품 큐레이션']}
            actionLabel='신청하기'
            actionHref='/mypage/shop/apply'
          />
        </div>

        <SectionHeader title='BigTabs 예시' />
        <BigTabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'all',       label: '전체',      badge: 12 },
            { value: 'shipping',  label: '배송중',    badge: 2  },
            { value: 'delivered', label: '배송완료'          },
            { value: 'cancel',    label: '취소·반품'  },
          ]}
        />
        <div style={{ marginTop: 12, padding: '8px 0', fontSize: 14, color: '#999' }}>
          현재 선택된 탭: <strong>{tab}</strong>
        </div>

        <SectionHeader title='BigButton 예시' />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <BigButton variant='primary'>Primary 버튼</BigButton>
          <BigButton variant='secondary'>취소</BigButton>
          <BigButton variant='outline'>Outline</BigButton>
          <BigButton disabled>비활성</BigButton>
        </div>
        <div style={{ marginTop: 12 }}>
          <BigButton fullWidth>가록찼 확인하기</BigButton>
        </div>

      </div>
    </>
  )
}
