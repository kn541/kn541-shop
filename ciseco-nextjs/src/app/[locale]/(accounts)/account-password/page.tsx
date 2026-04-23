'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { mypageFetch, MypageApiError } from '@/lib/mypage/api'

export default function AccountPasswordPage() {
  const [current, setCurrent] = useState('')
  const [nextPw, setNextPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const mismatch = nextPw.length > 0 && confirm.length > 0 && nextPw !== confirm
  const canSubmit =
    current.length >= 1 &&
    nextPw.length >= 8 &&
    !mismatch &&
    confirm.length >= 8 &&
    !submitting

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    if (mismatch) {
      toast.error('새 비밀번호와 확인이 일치하지 않습니다.')
      return
    }

    setSubmitting(true)
    try {
      await mypageFetch<unknown>('/mypage/change-password', {
        method: 'POST',
        body: JSON.stringify({
          current_password: current,
          new_password: nextPw,
        }),
      })
      toast.success('비밀번호가 변경되었습니다.')
      setCurrent('')
      setNextPw('')
      setConfirm('')
    } catch (err) {
      const msg =
        err instanceof MypageApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : '비밀번호 변경에 실패했습니다.'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-y-10 sm:gap-y-12">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">비밀번호 변경</h1>
        <p className="mt-4 text-neutral-500 dark:text-neutral-400">
          안전한 계정 보호를 위해 주기적으로 비밀번호를 변경해 주세요.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
        <div>
          <label htmlFor="current-password" className="mb-2 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
            현재 비밀번호
          </label>
          <input
            id="current-password"
            type="password"
            autoComplete="current-password"
            value={current}
            onChange={e => setCurrent(e.target.value)}
            className="h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 text-neutral-900 outline-none focus:border-primary-500 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100"
          />
        </div>
        <div>
          <label htmlFor="new-password" className="mb-2 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
            새 비밀번호
          </label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            value={nextPw}
            onChange={e => setNextPw(e.target.value)}
            className="h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 text-neutral-900 outline-none focus:border-primary-500 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100"
          />
          <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">8자 이상 입력해 주세요.</p>
        </div>
        <div>
          <label htmlFor="confirm-password" className="mb-2 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
            새 비밀번호 확인
          </label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            className={`h-12 w-full rounded-xl border bg-white px-4 text-neutral-900 outline-none focus:border-primary-500 dark:bg-neutral-900 dark:text-neutral-100 ${
              mismatch ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-600'
            }`}
          />
          {mismatch && (
            <p className="mt-1.5 text-sm font-medium text-red-600 dark:text-red-400">비밀번호가 일치하지 않습니다.</p>
          )}
        </div>
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex h-12 items-center justify-center rounded-full bg-neutral-900 px-8 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-neutral-900"
        >
          {submitting ? '처리 중…' : '비밀번호 변경'}
        </button>
      </form>
    </div>
  )
}
