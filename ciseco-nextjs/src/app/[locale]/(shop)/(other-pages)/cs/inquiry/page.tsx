// KN541 1:1 문의 페이지
// - 로그인 사용자만 이용 가능 (미로그인 시 로그인 페이지로 이동)
// - 제출 시 백엔드 API(/cs/inquiries)로 전송 → 어드민 1:1문의로 연동

import InquiryPageClient from './InquiryPageClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '1:1 문의 | KN541',
  description: '1:1 문의를 남겨주시면 빠르게 답변드리겠습니다.',
}

export default function InquiryPage() {
  return <InquiryPageClient />
}
