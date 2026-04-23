'use client'
// KN541 결제 실패 페이지
// 토스 failUrl 리다이렉트 도착 → errorCode 한국어 변환 → 재시도/장바구니 버튼

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

// 토스페이먼츠 v2 에러코드 → 한국어 메시지 매핑
// 전체 코드: https://docs.tosspayments.com/sdk/v2/error-codes
const ERROR_MESSAGES: Record<string, string> = {
  PAY_PROCESS_CANCELED:                              '결제를 취소했습니다.',
  PAY_PROCESS_ABORTED:                               '결제가 중단됐습니다. 다시 시도해 주세요.',
  REJECT_CARD_COMPANY:                               '카드사에서 결제를 거절했습니다.',
  INVALID_CARD_NUMBER:                               '카드번호가 올바르지 않습니다.',
  NOT_SUPPORTED_INSTALLMENT_PLAN_CARD_OR_MERCHANT:   '이 카드는 할부 결제를 지원하지 않습니다.',
  NOT_ENOUGH_BALANCE:                                '잔액이 부족합니다.',
  BELOW_MINIMUM_AMOUNT:                              '최소 결제 금액보다 작습니다.',
  EXCEED_MAX_AUTH_COUNT:                             '최대 인증 횟수를 초과했습니다. 잠시 후 다시 시도해 주세요.',
  EXCEED_MAX_PAYMENT_AMOUNT_PER_DAY:                 '1일 최대 결제 한도를 초과했습니다.',
  INVALID_STOPPED_CARD:                              '정지된 카드입니다.',
  EXCEED_MAX_ONE_DAY_AMOUNT:                         '하루 결제 한도를 초과했습니다.',
  CARD_PROCESSING_ERROR:                             '카드사 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
  BANK_PROCESSING_ERROR:                             '은행 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
  INVALID_PASSWORD:                                  '비밀번호가 올바르지 않습니다.',
  USER_CANCEL:                                       '결제를 취소했습니다.',
}

const CANCEL_CODES = new Set(['PAY_PROCESS_CANCELED', 'USER_CANCEL'])

function FailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const errorCode    = searchParams.get('errorCode') ?? ''
  const errorMessage = searchParams.get('errorMessage') ?? '결제에 실패했습니다.'

  const isCanceled     = CANCEL_CODES.has(errorCode)
  const displayMessage = ERROR_MESSAGES[errorCode] ?? decodeURIComponent(errorMessage)

  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 py-20 text-center">
      <ExclamationTriangleIcon className="h-16 w-16 text-yellow-500" />

      <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
        {isCanceled ? '결제가 취소됐습니다' : '결제에 실패했습니다'}
      </h2>

      <p className="max-w-sm text-sm text-neutral-600 dark:text-neutral-400">
        {displayMessage}
      </p>

      {errorCode && !isCanceled && (
        <p className="text-xs text-neutral-400">오류 코드: {errorCode}</p>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => router.push('/ko/checkout')}
          className="rounded-xl bg-primary-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-primary-700"
        >
          다시 시도하기
        </button>
        <button
          onClick={() => router.push('/ko/cart')}
          className="rounded-xl border border-neutral-200 px-6 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          장바구니로 돌아가기
        </button>
      </div>
    </div>
  )
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <FailContent />
    </Suspense>
  )
}
