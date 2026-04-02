import { Metadata } from 'next'
import InquiryClient from './InquiryClient'

export const metadata: Metadata = {
  title: '1:1 문의',
  description: 'KN541 고객센터 1:1 문의',
}

export default function InquiryPage() {
  return <InquiryClient />
}
