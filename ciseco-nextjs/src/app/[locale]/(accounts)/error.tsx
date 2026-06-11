'use client'

import { useEffect } from 'react'

export default function AccountsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[accounts] layout error:', error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-200">
        페이지를 불러올 수 없습니다
      </h2>
      <p className="max-w-md text-neutral-500 dark:text-neutral-400">
        일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-full bg-primary-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
      >
        다시 시도
      </button>
    </div>
  )
}
