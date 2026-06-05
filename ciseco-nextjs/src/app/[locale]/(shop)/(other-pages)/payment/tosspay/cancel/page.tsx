'use client'
// KN541 토스페이 결제 취소 페이지 (retCancelUrl)
// 사용자가 토스페이 결제창에서 취소 버튼을 누르면 이 페이지로 이동한다.

import { Suspense } from 'react'
import { useRouter } from '@/i18n/navigation'
import { XCircleIcon } from '@heroicons/react/24/outline'

function TossPayCancelContent() {
  const router = useRouter()

  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-6 py-20 text-center">
      <XCircleIcon className="h-16 w-16 text-neutral-400" />
      <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
        결제가 취소됐습니다
      </h2>
      <p className="text-sm text-neutral-500">
        결제를 원하시면 다시 시도해 주세요.
      </p>
      <button
        onClick={() => router.back()}
        className="rounded-xl bg-primary-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-primary-700"
      >
        돌아가기
      </button>
    </div>
  )
}

export default function TossPayCancelPage() {
  return (
    <Suspense fallback={null}>
      <TossPayCancelContent />
    </Suspense>
  )
}
