'use client'
import { useState, useTransition } from 'react'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import BackHeader from '@/components/mypage/BackHeader'
import BigButton from '@/components/mypage/BigButton'

export default function InquiryNewPage() {
  const locale = useLocale()
  const router = useRouter()
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [isPending, startTransition] = useTransition()

  const isValid = subject.trim().length >= 2 && content.trim().length >= 10

  const handleSubmit = () => {
    if (!isValid) return
    startTransition(async () => {
      // Mock 제출 (Phase 2 API 완성 후 실 포스트로 교체)
      await new Promise(r => setTimeout(r, 600))
      toast.success('문의가 등록됐습니다. 영업일 기준 1~2일 내 답변 드립니다.')
      router.push(`/${locale}/mypage/inquiries`)
    })
  }

  return (
    <>
      <BackHeader title='문의 등록' />

      <div style={{ padding: 16 }}>
        {/* 제목 */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
            제목 <span style={{ color: 'var(--mp-color-danger)' }}>*</span>
          </label>
          <input
            type='text'
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder='문의 제목을 입력해 주세요 (2자 이상)'
            style={{
              width: '100%', boxSizing: 'border-box',
              height: 56, padding: '0 16px',
              border: '1px solid var(--mp-color-border)',
              borderRadius: 'var(--mp-radius)',
              fontSize: 18, outline: 'none',
              background: '#fff',
            }}
          />
        </div>

        {/* 내용 */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
            내용 <span style={{ color: 'var(--mp-color-danger)' }}>*</span>
          </label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder='문의 내용을 자세히 요청드립니다. (10자 이상)'
            rows={8}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '14px 16px',
              border: '1px solid var(--mp-color-border)',
              borderRadius: 'var(--mp-radius)',
              fontSize: 18, lineHeight: 1.7,
              resize: 'vertical', outline: 'none',
              background: '#fff',
            }}
          />
          <div style={{ fontSize: 13, color: 'var(--mp-color-text-muted)', marginTop: 4, textAlign: 'right' }}>
            {content.length}자
          </div>
        </div>

        {/* 안내 */}
        <div style={{
          background: '#F8F7FA', borderRadius: 'var(--mp-radius)',
          padding: 14, marginBottom: 24, fontSize: 14,
          color: 'var(--mp-color-text-muted)', lineHeight: 1.7,
        }}>
          • 영업일 기준 1~2일 내 답변 드립니다.<br />
          • 주문번호를 함께 작성시 빠른 안내가 가능합니다.
        </div>

        <BigButton
          fullWidth
          onClick={handleSubmit}
          disabled={!isValid || isPending}
        >
          {isPending ? '등록 중…' : '문의 등록'}
        </BigButton>
      </div>
    </>
  )
}
