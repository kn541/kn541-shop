'use client'

import { useRouter } from '@/i18n/navigation'
import { useLocale } from 'next-intl'
import { useEffect, useState } from 'react'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { ChatBubbleLeftEllipsisIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { mypageFetch, MypageApiError } from '@/lib/mypage/api'
import { useInquiries } from '@/lib/mypage/useInquiries'
import type { InquiryStatus } from '@/lib/mypage/types'
import BigTabs from '@/components/mypage/BigTabs'

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
  const locale = useLocale()
  const [tab, setTab] = useState<InquiryStatus | 'ALL'>('ALL')
  const { data, loading, refetch } = useInquiries(tab)

  const [step, setStep] = useState<Step>('form')
  const [type, setType] = useState('007')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const t = localStorage.getItem('access_token')
    if (!t) {
      router.replace(`/login?redirect=/${locale}/cs/inquiry`)
    }
  }, [router, locale])

  const handleSubmit = async () => {
    setError('')
    if (!title.trim()) {
      setError('제목을 입력해 주세요.')
      return
    }
    if (!content.trim()) {
      setError('내용을 입력해 주세요.')
      return
    }

    setSubmitLoading(true)
    try {
      await mypageFetch<unknown>('/cs/inquiries', {
        method: 'POST',
        body: JSON.stringify({
          inquiry_type: type,
          title: title.trim(),
          content: content.trim(),
        }),
      })
      setStep('done')
      refetch()
    } catch (e) {
      if (e instanceof MypageApiError) {
        setError(e.message)
      } else {
        setError('문의 접수 중 오류가 발생했습니다.')
      }
    } finally {
      setSubmitLoading(false)
    }
  }

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
            type="button"
            onClick={() => {
              setStep('form')
              setTitle('')
              setContent('')
              setType('007')
            }}
            className="rounded-full border border-neutral-300 px-6 py-2.5 text-sm font-medium hover:bg-neutral-50 dark:border-neutral-600 dark:hover:bg-neutral-800"
          >
            추가 문의 작성
          </button>
          <ButtonPrimary onClick={() => router.push('/')} className="px-6">
            홈으로
          </ButtonPrimary>
        </div>

        <div className="mt-12 rounded-2xl bg-neutral-50 px-6 py-6 text-left text-sm text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
          <p className="font-semibold text-neutral-900 dark:text-neutral-100">고객센터 안내</p>
          <ul className="mt-3 space-y-1">
            <li>• 영업시간: 평일 09:00 ~ 18:00 (토·일, 공휴일 휴무)</li>
            <li>• 긴급 문의: <a href="tel:070-4436-0928" className="text-primary-600 underline">070-4436-0928</a> (KN541)</li>
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-3xl py-12 lg:py-20">
      <div className="mb-10 text-center">
        <div className="mb-4 flex justify-center">
          <ChatBubbleLeftEllipsisIcon className="h-12 w-12 text-primary-600" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">1:1 문의</h1>
        <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
          문의 내용을 작성하시면 영업일 기준 1~2일 내 답변드리겠습니다.
        </p>
      </div>

      <div className="mb-10 flex flex-col gap-6 rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800 sm:p-8">
        <div>
          <label className="mb-2 block text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            문의 유형 <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {INQUIRY_TYPES.map(t => (
              <button
                key={t.code}
                type="button"
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

        <div>
          <label className="mb-2 block text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            제목 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="문의 제목을 입력하세요"
            maxLength={100}
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none placeholder:text-neutral-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            문의 내용 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="문의 내용을 상세히 입력해 주세요. (주문번호, 상품명 등)"
            rows={6}
            maxLength={2000}
            className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none placeholder:text-neutral-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
          />
          <div className="mt-1 text-right text-xs text-neutral-400">{content.length} / 2,000</div>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <ButtonPrimary
          onClick={() => void handleSubmit()}
          disabled={submitLoading || !title.trim() || !content.trim()}
          className="w-full py-3.5 text-base"
        >
          {submitLoading ? '접수 중...' : '문의 접수하기'}
        </ButtonPrimary>
      </div>

      <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">내 문의</h2>
      <BigTabs
        value={tab}
        onChange={v => setTab(v as InquiryStatus | 'ALL')}
        tabs={[
          { value: 'ALL', label: '전체' },
          { value: 'WAITING', label: '답변 대기' },
          { value: 'ANSWERED', label: '답변 완료' },
        ]}
      />

      <div className="mt-4 space-y-3">
        {loading && <p className="py-8 text-center text-sm text-neutral-500">불러오는 중…</p>}
        {!loading && data?.items.length === 0 && (
          <p className="py-8 text-center text-sm text-neutral-500">등록된 문의가 없습니다.</p>
        )}
        {!loading &&
          data?.items.map(item => (
            <div
              key={item.inquiry_id}
              className="rounded-2xl border border-neutral-200 p-4 dark:border-neutral-700"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">{item.subject}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    item.status === 'ANSWERED'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
                  }`}
                >
                  {item.status_label}
                </span>
              </div>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">{item.content}</p>
              <p className="mt-2 text-xs text-neutral-400">
                {new Date(item.created_at).toLocaleString('ko-KR')}
              </p>
              {item.status === 'ANSWERED' && item.answer && (
                <div className="mt-3 rounded-xl bg-neutral-50 p-3 text-sm dark:bg-neutral-900/60">
                  <span className="font-medium text-primary-600">답변</span>
                  <p className="mt-1 whitespace-pre-wrap text-neutral-700 dark:text-neutral-200">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  )
}
