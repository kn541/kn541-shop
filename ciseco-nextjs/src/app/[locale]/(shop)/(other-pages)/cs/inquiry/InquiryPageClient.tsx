'use client'
// KN541 1:1 문의 — 클라이언트 컴포넌트
// 로그인 체크 → 미로그인 시 /login 리다이렉트
// 폼 제출 → FastAPI /cs/inquiries POST → 어드민 1:1문의 목록에 노출

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Field, FieldGroup, Fieldset, Label } from '@/shared/fieldset'
import { Input } from '@/shared/input'
import { Textarea } from '@/shared/textarea'

const BASE = process.env.NEXT_PUBLIC_API_URL

const CATEGORIES = [
  { value: 'order', label: '주문/결제 문의' },
  { value: 'delivery', label: '배송 문의' },
  { value: 'return', label: '반품/교환 문의' },
  { value: 'product', label: '상품 문의' },
  { value: 'account', label: '계정/회원 문의' },
  { value: 'point', label: '포인트/쿠폰 문의' },
  { value: 'etc', label: '기타 문의' },
]

export default function InquiryPageClient() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  // 로그인 체크
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/login?redirect=/cs/inquiry')
    } else {
      setIsLoggedIn(true)
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const form = e.currentTarget
    const formData = new FormData(form)
    const token = localStorage.getItem('access_token')

    try {
      const res = await fetch(`${BASE}/cs/inquiries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category: formData.get('category'),
          title: formData.get('title'),
          content: formData.get('content'),
        }),
      })

      if (res.status === 401) {
        router.push('/login?redirect=/cs/inquiry')
        return
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.detail || '문의 등록에 실패했습니다.')
      }

      setSubmitted(true)
      form.reset()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  // 로그인 체크 중
  if (isLoggedIn === null) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
      </div>
    )
  }

  return (
    <div className="pt-12 pb-16 sm:py-16 lg:py-24">
      <div className="container mx-auto max-w-2xl">
        {/* 제목 */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-4xl">
            1:1 문의
          </h1>
          <p className="mt-3 text-neutral-500 dark:text-neutral-400">
            문의 내용을 남겨주시면 빠르게 답변드리겠습니다.<br />
            평균 답변 시간: 영업일 기준 1~2일
          </p>
        </div>

        {/* 완료 메시지 */}
        {submitted ? (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center dark:border-green-800 dark:bg-green-950">
            <div className="mb-3 text-4xl">✅</div>
            <h2 className="mb-2 text-lg font-semibold text-green-800 dark:text-green-300">문의가 접수됐습니다!</h2>
            <p className="text-sm text-green-700 dark:text-green-400">
              영업일 기준 1~2일 내로 답변드리겠습니다.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-6 text-sm font-medium text-green-700 underline underline-offset-2 hover:text-green-900 dark:text-green-400"
            >
              추가 문의 작성하기
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <Fieldset>
              <FieldGroup>
                {/* 문의 유형 */}
                <Field>
                  <Label>문의 유형</Label>
                  <select
                    name="category"
                    required
                    className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-400 focus:ring-0 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                  >
                    <option value="">유형을 선택해주세요</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </Field>

                {/* 제목 */}
                <Field>
                  <Label>제목</Label>
                  <Input
                    name="title"
                    required
                    placeholder="문의 제목을 입력해주세요"
                    maxLength={100}
                  />
                </Field>

                {/* 내용 */}
                <Field>
                  <Label>문의 내용</Label>
                  <Textarea
                    name="content"
                    required
                    rows={8}
                    placeholder="문의 내용을 자세히 작성해주세요.&#10;&#10;예) 주문번호, 상품명, 문의 상세 내용 등"
                  />
                </Field>

                {/* 에러 */}
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
                    {error}
                  </div>
                )}

                {/* 안내 */}
                <div className="rounded-xl bg-neutral-50 px-4 py-3 text-sm text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                  💡 문의 답변은 가입하신 이메일로도 발송됩니다.
                </div>

                <ButtonPrimary type="submit" disabled={submitting} className="w-full">
                  {submitting ? '제출 중...' : '문의 제출하기'}
                </ButtonPrimary>
              </FieldGroup>
            </Fieldset>
          </form>
        )}

        {/* 하단 안내 */}
        <div className="mt-12 border-t border-neutral-200 pt-8 dark:border-neutral-700">
          <h3 className="mb-4 font-semibold text-neutral-700 dark:text-neutral-300">문의 전 확인해주세요</h3>
          <ul className="space-y-2 text-sm text-neutral-500 dark:text-neutral-400">
            <li>• 주문 관련 문의는 주문번호를 함께 기재해 주시면 빠른 처리가 가능합니다.</li>
            <li>• 영업시간: 평일 09:00 ~ 18:00 (공휴일 제외)</li>
            <li>• 자주 묻는 질문은 <a href="/faq" className="underline hover:text-neutral-900 dark:hover:text-neutral-100">FAQ</a>에서 확인하실 수 있습니다.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
