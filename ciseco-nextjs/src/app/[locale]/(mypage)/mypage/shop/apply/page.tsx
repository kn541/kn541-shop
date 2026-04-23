'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { toast } from 'react-hot-toast'
import BackHeader from '@/components/mypage/BackHeader'
import { useMypageHome } from '@/lib/mypage/useMypageHome'
import type { ShopApplyFormState } from '@/lib/mypage/types'
import StepProgress from './_steps/StepProgress'
import Step1BasicInfo from './_steps/Step1BasicInfo'
import Step2UrlCode from './_steps/Step2UrlCode'
import Step3TemplatePick from './_steps/Step3TemplatePick'
import { createMyShop, uiTemplateToApi } from '@/lib/mypage/useMyShop'
import { MypageApiError } from '@/lib/mypage/api'

export default function ShopApplyPage() {
  const locale = useLocale()
  const router = useRouter()
  const { data: home, loading } = useMypageHome()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<ShopApplyFormState>({
    shop_name: '',
    shop_description: '',
    shop_url_code: '',
    template_code: 'CLASSIC',
  })

  // 상태 가드 — 로딩 전에는 자리만 표시
  if (loading) return (
    <div style={{ padding: 48, textAlign: 'center', color: 'var(--mp-color-text-muted)' }}>불러오는 중…</div>
  )

  const shopStatus = home?.shop?.status

  // PENDING: 대기 페이지로
  if (shopStatus === 'PENDING') {
    router.replace(`/${locale}/mypage/shop/status`)
    return null
  }
  // APPROVED: 이미 오픈 상태
  if (shopStatus === 'APPROVED') {
    router.replace(`/${locale}/mypage/shop`)
    return null
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    toast.loading('신청 중…', { id: 'apply' })
    try {
      await createMyShop({
        shop_name: form.shop_name.trim(),
        shop_url_code: form.shop_url_code.trim() || undefined,
        template_code: uiTemplateToApi(form.template_code),
        shop_description: form.shop_description.trim() || undefined,
      })
      toast.success('신청이 접수됐습니다. 승인을 기다려주세요.', { id: 'apply' })
      router.replace(`/${locale}/mypage/shop/status`)
    } catch (e) {
      const msg =
        e instanceof MypageApiError ? e.message : '신청 실패. 다시 시도해주세요.'
      toast.error(msg, { id: 'apply' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <BackHeader title='마이샵 신청' />
      <StepProgress current={step} />
      <div style={{ padding: '0 16px 32px' }}>
        {step === 1 && (
          <Step1BasicInfo form={form} onChange={setForm} onNext={() => setStep(2)} />
        )}
        {step === 2 && (
          <Step2UrlCode form={form} onChange={setForm}
            onPrev={() => setStep(1)} onNext={() => setStep(3)} />
        )}
        {step === 3 && (
          <Step3TemplatePick form={form} onChange={setForm}
            onPrev={() => setStep(2)}
            onSubmit={submitting ? () => {} : handleSubmit} />
        )}
      </div>
    </>
  )
}
