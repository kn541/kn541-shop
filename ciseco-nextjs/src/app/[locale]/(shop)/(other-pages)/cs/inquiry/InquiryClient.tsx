'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { ChatBubbleLeftEllipsisIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

// 문의 유형 목록 (system_codes cs_inquiry_type)
const INQUIRY_TYPES = [
  { code: '001', label: '주문/결제' },
  { code: '002', label: '배송' },
  { code: '003', label: '반품/교환' },
  { code: '004', label: '상품' },
  { code: '005', label: '계정' },
  { code: '006', label: '포인트/수당' },
  { code: '007', label: '기타' },
]

type Step = 'form' | 'done'

export default function InquiryClient() {
  const router = useRouter()
  const [step, setStep]       = useState<Step>('form')
  const [token, setToken]     = useState<string | null>(null)
  const [type, setType]       = useState('007')
  const [title, setTitle]     = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [inquiryId, setInquiryId] = useState('')

  // 로그인 체크 — 토큰 없으면 로그인 페이지로
  useEffect(() => {
    const t = localStorage.getItem('access_token')
    if (!t) {
      router.replace('/ko/login?redirect=/ko/cs/inquiry')
    } else {
      setToken(t)
    }
  }, [router])

  const handleSubmit = async () => {
    setError('')
    if (!title.trim()) { setError('제목을 입력해 주세요.'); return }
    if (!content.trim()) { setError('내용을 입력해 주세요.'); return }

    const BASE = process.env.NEXT_PUBLIC_API_URL || ''
    setLoading(true)
    try {
      const res = await fetch(`${BASE}/cs/inquiries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ inquiry_type: type, title: title.trim(), content: content.trim() }),
      })
      const data = await res.json()
      if (res.ok && data.status === 'success') {
        setInquiryId(data.data?.inquiry_id || '')
        setStep('done')
      } else {
        setError(data.detail || '문의 접수 중 오류가 발생했습니다.')
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 완료 화면
  if (step === 'done') {
    return (
      <div className="container mx-auto max-w-2xl py-20 text-center">
        <CheckCircleIcon className="mx-auto mb-6 h-16 w-16 text-green-500" />
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">문의가 접수되었습니다</h1>
        <p className="mt-4 text-neutral-500 dark:text-neutral-400">
          영업일 기준 1~2일 내에 답변드리겠습니다.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <button
            onClick={() => { setStep('form'); setTitle(''); setContent(''); setType('007') }}
            className="rounded-full border border-neutral-300 px-6 py-2.5 text-sm font-medium hover:bg-neutral-50 dark:border-neutral-600 dark:hover:bg-neutral-800"
          >
            추가 문의 작성
          </button>
          <ButtonPrimary onClick={() => router.push('/ko')} className="px-6">
            홈으로
          </ButtonPrimary>
        </div>

        {/* 하단 안내 */}
        <div className="mt-12 rounded-2xl bg-neutral-50 px-6 py-6 text-left text-sm text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
          <p className="font-semibold text-neutral-900 dark:text-neutral-100">고객센터 안내</p>
          <ul className="mt-3 space-y-1">
            <li>• 영업시간: 평일 09:00 ~ 18:00 (토일, 일요일, 공휴일 휴무)</li>
            <li>• 답변은 문의 내용에 따라 지연될 수 있습니다.</li>
            <li>• 긴급 문의: <a href="tel:1588-0000" className="text-primary-600 underline">1588-0000</a></li>
          </ul>
        </div>
      </div>
    )
  }

  // 문의 폼
  return (
    <div className="container mx-auto max-w-2xl py-12 lg:py-20">

      {/* 헤더 */}
      <div className="mb-10 text-center">
        <div className="mb-4 flex justify-center">
          <ChatBubbleLeftEllipsisIcon className="h-12 w-12 text-primary-600" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">1:1 문의</h1>
        <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
          문의 내용을 작성하시면 영업일 기준 1~2일 내 답변드리겠습니다.
        </p>
      </div>

      {/* 폼 */}
      <div className="flex flex-col gap-6 rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800 sm:p-8">

        {/* 문의 유형 */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            문의 유형 <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {INQUIRY_TYPES.map((t) => (
              <button
                key={t.code}
                onClick={() => setType(t.code)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                  type === t.code
                    ? 'border-primary-600 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-900/30 dark:text-primary-300'
                    : 'border-neutral-200 text-neutral-600 hover:border-neutral-400 dark:border-neutral-600 dark:text-neutral-400'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 제목 */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            제목 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="문의 제목을 입력하세요"
            maxLength={100}
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none placeholder:text-neutral-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
          />
        </div>

        {/* 내용 */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            문의 내용 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="문의 내용을 상세히 입력해 주세요.&#10;(주문번호, 상품명 등을 함께 작성하시면 빠른 답변이 가능합니다)"
            rows={8}
            maxLength={2000}
            className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none placeholder:text-neutral-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
          />
          <div className="mt-1 text-right text-xs text-neutral-400">{content.length} / 2,000</div>
        </div>

        {/* 에러 */}
        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {/* 제출 버튼 */}
        <ButtonPrimary
          onClick={handleSubmit}
          disabled={loading || !title.trim() || !content.trim()}
          className="w-full py-3.5 text-base"
        >
          {loading ? '접수 중...' : '문의 접수하기'}
        </ButtonPrimary>
      </div>

      {/* 안내 사항 */}
      <div className="mt-8 rounded-2xl bg-neutral-50 px-6 py-5 text-sm text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
        <p className="font-semibold text-neutral-900 dark:text-neutral-100">유의사항</p>
        <ul className="mt-2 space-y-1">
          <li>• 답변 시간: 영업일 기준 1~2일 (토일·일요일·공휴일 제외)</li>
          <li>• 개인정보 보호를 위해 주문번호, 제품명 등 관련 정보를 함께 작성해 주세요.</li>
          <li>• 반품/교환 문의시 구매 사진 또는 영수증을 먿붙여 주시면 빠른 처리가 가능합니다.</li>
          <li>• FAQ에서 답변을 찾으실 수 있습니다: <a href="/ko/faq" className="text-primary-600 underline">자주묻는질문 보기</a></li>
        </ul>
      </div>
    </div>
  )
}
