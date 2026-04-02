import { Metadata } from 'next'
import FaqClient from './FaqClient'

export const metadata: Metadata = {
  title: '자주묻는질문 (FAQ)',
  description: 'KN541 상품, 배송, 환불, 회원 등 자주 묻는 질문을 확인하세요.',
}

export const dynamic = 'force-dynamic'

async function fetchFaqs(target: string) {
  const BASE = process.env.NEXT_PUBLIC_API_URL || 'https://kn541-production.up.railway.app'
  try {
    const res = await fetch(`${BASE}/faqs?faq_target=${target}&size=100`, {
      next: { revalidate: 300 }, // 5분 쫨시
    })
    if (!res.ok) return []
    const json = await res.json()
    return json.data?.items || []
  } catch {
    return []
  }
}

export default async function FaqPage() {
  // faq_target: 001=쓼핑맰, 002=회원, 003=SCM
  const [shopFaqs, memberFaqs] = await Promise.all([
    fetchFaqs('001'),
    fetchFaqs('002'),
  ])

  return <FaqClient shopFaqs={shopFaqs} memberFaqs={memberFaqs} />
}
