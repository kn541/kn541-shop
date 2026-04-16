import BackHeader from '@/components/mypage/BackHeader'
import BigButton from '@/components/mypage/BigButton'
import Link from 'next/link'

export default function ShopStatusPage() {
  return (
    <>
      <BackHeader title='신청 현황' />
      <div style={{ padding: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>⏳</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>승인 검토 중입니다</h2>
        <p style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--mp-color-text-muted)', marginBottom: 8 }}>
          마이샵 신청이 접수됐습니다.<br />
          영업일 기준 <strong style={{ color: 'var(--mp-color-text)' }}>2~3일 이내</strong>에 승인 또는 반려 통보를 드립니다.
        </p>
        <div style={{
          background: '#FFF9E6', border: '1px solid #FF9F43',
          borderRadius: 'var(--mp-radius-lg)', padding: '16px 20px',
          fontSize: 15, lineHeight: 1.7, marginBottom: 32, textAlign: 'left',
        }}>
          <strong>확인 사항</strong><br />
          • 가입 시 등록한 연락처로 통보 드립니다.<br />
          • 별도 인증 절차가 필요할 수 있습니다.<br />
          • 문의사항은 1:1 문의를 이용해 주세요.
        </div>
        <Link href='../mypage'>
          <BigButton fullWidth variant='secondary'>마이페이지로</BigButton>
        </Link>
      </div>
    </>
  )
}
