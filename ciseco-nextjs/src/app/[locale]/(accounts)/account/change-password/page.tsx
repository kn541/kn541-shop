'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? ''

export default function ChangePasswordPage() {
  const router = useRouter()
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (form.new_password !== form.confirm_password) {
      setError('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.')
      return
    }
    setLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      const res = await fetch(`${BASE}/mypage/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          current_password: form.current_password,
          new_password: form.new_password,
          confirm_password: form.confirm_password,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.detail || '비밀번호 변경에 실패했습니다.')
        return
      }
      setSuccess('비밀번호가 변경됐습니다.')
      setForm({ current_password: '', new_password: '', confirm_password: '' })
      setTimeout(() => router.push('/account'), 1500)
    } catch {
      setError('서버 연결에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="mb-6 text-xl font-bold">비밀번호 변경</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {(
          [
            ['현재 비밀번호', 'current_password', '현재 비밀번호 입력'],
            ['새 비밀번호', 'new_password', '8자 이상, 숫자 또는 특수문자 포함'],
            ['새 비밀번호 확인', 'confirm_password', '새 비밀번호 다시 입력'],
          ] as const
        ).map(([label, key, placeholder]) => (
          <div key={key}>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {label}
            </label>
            <input
              type="password"
              required
              placeholder={placeholder}
              value={form[key]}
              onChange={e => setForm({ ...form, [key]: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
            />
          </div>
        ))}
        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-600 dark:bg-green-900/20 dark:text-green-400">
            {success}
          </p>
        ) : null}
        <p className="text-xs text-neutral-500">
          8자 이상, 숫자 또는 특수문자 1개 이상, 동일 문자 3자리 이상 반복 불가
        </p>
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-300"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? '변경 중...' : '비밀번호 변경'}
          </button>
        </div>
      </form>
    </div>
  )
}
