import L3Guard from '@/components/mypage/L3Guard'
import ProxyOrderWizard from '@/components/myshop/ProxyOrderWizard'

export default function ProxyOrderPage() {
  return (
    <L3Guard embedded title="수동주문" lockBenefits={['직접 추천 회원 대리 주문', '무통장입금 주문 접수']}>
      <ProxyOrderWizard />
    </L3Guard>
  )
}
