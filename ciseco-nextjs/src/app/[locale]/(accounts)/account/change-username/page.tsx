'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? ''

export default function ChangeUsernamePage() {
  const router = useRouter()
  const [form, setForm] = useState({ current_password: '', new_username: '' })
  const [duplicateChecked, setDuplicateChecked] = useState<boolean | null>(null)
  const [checkLoading, setCheckLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleCheckDuplicate = async () => {
    const val = form.new_username.trim()
    if (!val || val.length < 4 || val.length > 20 || !/^[a-zA-Z0-9]+$/.test(val)) {
      setError('아이디는 4~20자 영문·숫자만 사용 가능합니다.')
      return
    }
    setError('')
    setCheckLoading(true)
    try {
      const res = await fetch(`${BASE}/auth/check-duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: 'username', value: val }),
      })
      const data = await res.json()
      if (data?.data?.is_duplicate) {
        setDuplicateChecked(false)
        setError('이미 사용 중인 아이디입니다.')
      } else {
        setDuplicateChecked(true)
        setError('')
      }
    } catch {
      setError('중복 확인에 실패했습니다.')
    } finally {
      setCheckLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!duplicateChecked) {
      setError('아이디 중복 확인을 먼저 해주세요.')
      return
    }
    setLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      const res = await fetch(`${BASE}/mypage/change-username`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          current_password: form.current_password,
          new_username: form.new_username.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.detail || '아이디 변경에 실패했습니다.')
        return
      }
      setSuccess('아이디가 변경됐습니다. 다시 로그인해주세요.')
      setTimeout(() => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        router.push('/login')
      }, 2000)
    } catch {
      setError('서버 연결에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="mb-6 text-xl font-bold">아이디 변경</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            새 아이디
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              required
              placeholder="4~20자, 영문·숫자"
              maxLength={20}
              value={form.new_username}
              onChange={e => {
                setForm({ ...form, new_username: e.target.value })
                setDuplicateChecked(null)
                setError('')
              }}
              className="flex-1 rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
            />
            <button
              type="button"
              onClick={handleCheckDuplicate}
              disabled={checkLoading}
              className="shrink-0 rounded-lg border border-primary-500 px-3 py-2.5 text-sm font-medium text-primary-600 hover:bg-primary-50 disabled:opacity-50 dark:border-primary-400 dark:text-primary-400"
            >
              {checkLoading ? '확인 중...' : '중복 확인'}
            </button>
          </div>
          {duplicateChecked === true ? (
            <p className="mt-1 text-xs text-green-600 dark:text-green-400">✓ 사용 가능한 아이디입니다.</p>
          ) : null}
          <p className="mt-1 text-xs text-neutral-500">4~20자, 영문·숫자만 사용 가능</p>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            현재 비밀번호 (본인 확인)
          </label>
          <input
            type="password"
            required
            placeholder="현재 비밀번호 입력"
            value={form.current_password}
            onChange={e => setForm({ ...form, current_password: e.target.value })}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </div>
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
            disabled={loading || !duplicateChecked}
            className="flex-1 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? '변경 중...' : '아이디 변경'}
          </button>
        </div>
      </form>
    </div>
  )
}
