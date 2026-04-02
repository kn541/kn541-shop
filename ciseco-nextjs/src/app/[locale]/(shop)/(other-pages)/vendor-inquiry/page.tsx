'use client'
// KN541 쇼핑몰 — 입점문의 페이지
// API: POST /vendor-inquiry (인증 불필요)

import { useState, type FormEvent, type ReactNode } from 'react'
import Link from 'next/link'

const BASE = process.env.NEXT_PUBLIC_API_URL

interface FormState {
  contact_name: string
  contact_phone: string
  contact_email: string
  company_name: string
  business_number: string
  website_url: string
  company_intro: string
  brand_name: string
  main_category: string
  product_intro: string
  channel_type: string
  sales_type: string
  current_stores: string
  referral_path: string
  privacy_agreed: boolean
}

const emptyForm: FormState = {
  contact_name: '',
  contact_phone: '',
  contact_email: '',
  company_name: '',
  business_number: '',
  website_url: '',
  company_intro: '',
  brand_name: '',
  main_category: '',
  product_intro: '',
  channel_type: '',
  sales_type: '',
  current_stores: '',
  referral_path: '',
  privacy_agreed: false,
}

const CATEGORIES = ['건강식품', '화장품/뷰티', '생활용품', '식품/음료', '의류/패션', '전자기기', '스포츠/레저', '기타']
const CHANNEL_TYPES = ['온라인', '오프라인', '온라인+오프라인']
const SALES_TYPES = ['수입', '제조', '유통', '자체 브랜드', '기타']
const REFERRAL_PATHS = ['지인 소개', '인터넷 검색', 'SNS', '광고', '기타']

export default function VendorInquiryPage() {
  const [form, setForm] = useState<FormState>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const set = (key: keyof FormState, value: string | boolean) =>
    setForm(f => ({ ...f, [key]: value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.privacy_agreed) {
      setError('개인정보 수집 및 이용에 동의해 주세요.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch(`${BASE}/vendor-inquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (json.status === 'success') {
        setSubmitted(true)
      } else {
        setError(json.detail ?? '제출 중 오류가 발생했습니다.')
      }
    } catch {
      setError('서버 연결에 실패했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="container py-24 lg:py-32">
        <div className="mx-auto max-w-lg text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="mb-3 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            입점문의가 접수되었습니다!
          </h2>
          <p className="mb-2 text-neutral-600 dark:text-neutral-400">
            담당 MD가 검토 후 입력하신 이메일 또는 전화번호로 연락드리겠습니다.
          </p>
          <p className="mb-8 text-sm text-neutral-500">처리 기간: 영업일 기준 5~7일 이내</p>
          <Link
            href="/"
            className="inline-flex items-center rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
          >
            쇼핑몰 홈으로
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-16 lg:py-24">
      <div className="mx-auto max-w-2xl text-center mb-12">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 sm:text-4xl">
          입점문의
        </h1>
        <p className="mt-4 text-neutral-600 dark:text-neutral-400">
          KN541과 함께 성장할 파트너를 찾고 있습니다.<br />
          아래 양식을 작성해 주시면 담당 MD가 검토 후 연락드리겠습니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-8">
        <section className="rounded-2xl border border-neutral-200 p-6 dark:border-neutral-700">
          <h2 className="mb-5 text-lg font-semibold text-neutral-800 dark:text-neutral-200">
            담당자 정보
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="담당자 이름 *" required>
              <input
                type="text" required
                value={form.contact_name}
                onChange={e => set('contact_name', e.target.value)}
                placeholder="홍길동"
                className={inputClass}
              />
            </Field>
            <Field label="연락처 *" required>
              <input
                type="tel" required
                value={form.contact_phone}
                onChange={e => set('contact_phone', e.target.value)}
                placeholder="010-0000-0000"
                className={inputClass}
              />
            </Field>
            <Field label="이메일 *" required className="sm:col-span-2">
              <input
                type="email" required
                value={form.contact_email}
                onChange={e => set('contact_email', e.target.value)}
                placeholder="example@company.com"
                className={inputClass}
              />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-200 p-6 dark:border-neutral-700">
          <h2 className="mb-5 text-lg font-semibold text-neutral-800 dark:text-neutral-200">
            회사 / 브랜드 정보
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="회사명 *" required>
              <input
                type="text" required
                value={form.company_name}
                onChange={e => set('company_name', e.target.value)}
                placeholder="(주)케이엔오비"
                className={inputClass}
              />
            </Field>
            <Field label="사업자등록번호 *" required>
              <input
                type="text" required
                value={form.business_number}
                onChange={e => set('business_number', e.target.value)}
                placeholder="000-00-00000"
                className={inputClass}
              />
            </Field>
            <Field label="브랜드명 *" required>
              <input
                type="text" required
                value={form.brand_name}
                onChange={e => set('brand_name', e.target.value)}
                placeholder="브랜드명"
                className={inputClass}
              />
            </Field>
            <Field label="홈페이지/SNS">
              <input
                type="url"
                value={form.website_url}
                onChange={e => set('website_url', e.target.value)}
                placeholder="https://"
                className={inputClass}
              />
            </Field>
            <Field label="회사 소개 *" required className="sm:col-span-2">
              <textarea
                required rows={3}
                value={form.company_intro}
                onChange={e => set('company_intro', e.target.value)}
                placeholder="회사 및 브랜드를 간략하게 소개해 주세요."
                className={textareaClass}
              />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-200 p-6 dark:border-neutral-700">
          <h2 className="mb-5 text-lg font-semibold text-neutral-800 dark:text-neutral-200">
            상품 정보
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="주요 카테고리 *" required>
              <select
                required
                value={form.main_category}
                onChange={e => set('main_category', e.target.value)}
                className={inputClass}
              >
                <option value="">선택해 주세요</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="판매 유형 *" required>
              <select
                required
                value={form.sales_type}
                onChange={e => set('sales_type', e.target.value)}
                className={inputClass}
              >
                <option value="">선택해 주세요</option>
                {SALES_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="판매 채널 *" required>
              <select
                required
                value={form.channel_type}
                onChange={e => set('channel_type', e.target.value)}
                className={inputClass}
              >
                <option value="">선택해 주세요</option>
                {CHANNEL_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="현재 판매 채널">
              <input
                type="text"
                value={form.current_stores}
                onChange={e => set('current_stores', e.target.value)}
                placeholder="예: 스마트스토어, 쿠팡, 자사몰"
                className={inputClass}
              />
            </Field>
            <Field label="취급 상품 소개 *" required className="sm:col-span-2">
              <textarea
                required rows={4}
                value={form.product_intro}
                onChange={e => set('product_intro', e.target.value)}
                placeholder="입점 희망 상품의 특징, 타겟 고객, 가격대 등을 소개해 주세요."
                className={textareaClass}
              />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-200 p-6 dark:border-neutral-700">
          <h2 className="mb-5 text-lg font-semibold text-neutral-800 dark:text-neutral-200">
            기타
          </h2>
          <Field label="KN541을 알게 된 경로">
            <select
              value={form.referral_path}
              onChange={e => set('referral_path', e.target.value)}
              className={inputClass}
            >
              <option value="">선택해 주세요</option>
              {REFERRAL_PATHS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
        </section>

        <div className="rounded-2xl border border-neutral-200 p-6 dark:border-neutral-700">
          <h2 className="mb-3 text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            개인정보 수집 및 이용 동의
          </h2>
          <p className="mb-4 text-xs text-neutral-500 leading-relaxed">
            수집 항목: 담당자 이름, 연락처, 이메일, 회사 정보<br />
            수집 목적: 입점 심사 및 담당 MD 연락<br />
            보유 기간: 심사 완료 후 1년
          </p>
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={form.privacy_agreed}
              onChange={e => set('privacy_agreed', e.target.checked)}
              className="h-4 w-4 cursor-pointer rounded border-neutral-300"
            />
            <span className="text-sm text-neutral-700 dark:text-neutral-300">
              개인정보 수집 및 이용에 동의합니다. <span className="text-red-500">*</span>
            </span>
          </label>
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-neutral-900 py-4 text-base font-semibold text-white transition hover:bg-neutral-700 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
        >
          {submitting ? '제출 중...' : '입점문의 제출하기'}
        </button>
      </form>
    </div>
  )
}

const inputClass =
  'w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500'

const textareaClass =
  'w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500 resize-none'

function Field({
  label,
  required: _required,
  children,
  className = '',
}: {
  label: string
  required?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {label}
      </label>
      {children}
    </div>
  )
}
