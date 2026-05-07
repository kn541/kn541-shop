'use client'

import { PasswordChangePanel } from '@/components/auth/PasswordChangePanel'

export default function AccountPasswordPage() {
  return (
    <div className="flex flex-col gap-y-10 sm:gap-y-12">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">비밀번호 변경</h1>
        <p className="mt-4 text-neutral-500 dark:text-neutral-400">
          안전한 계정 보호를 위해 주기적으로 비밀번호를 변경해 주세요.
        </p>
      </div>

      <div className="max-w-xl rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <PasswordChangePanel variant="voluntary" />
      </div>
    </div>
  )
}
