'use client'
// KN541 쇼핑몰 — 마이페이지 > 내 정보
// API: GET /auth/me, PATCH /members/{id}

import { useState, useEffect } from 'react'

const BASE = process.env.NEXT_PUBLIC_API_URL

interface UserInfo {
  user_id: number
  username: string
  email: string
  phone: string
  name: string
  user_type: string
  member_rank: string
  created_at: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) return
    fetch(`${BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(res => {
        if (res.status === 'success') {
          setUser(res.data)
          setName(res.data.name ?? '')
          setPhone(res.data.phone ?? '')
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    setMsg(null)
    const token = localStorage.getItem('access_token')
    try {
      const res = await fetch(`${BASE}/members/${user.user_id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      })
      const json = await res.json()
      if (res.ok && json.status === 'success') {
        setMsg({ type: 'success', text: '저장됐습니다.' })
        setUser(prev => prev ? { ...prev, name, phone } : prev)
      } else {
        setMsg({ type: 'error', text: json.detail ?? '저장 중 오류가 발생했습니다.' })
      }
    } catch {
      setMsg({ type: 'error', text: '서버 연결에 실패했습니다.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="py-16 text-center text-neutral-400">불러오는 중...</div>
  if (!user) return <div className="py-16 text-center text-neutral-400">정보를 불러올 수 없습니다.</div>

  return (
    <div className="max-w-lg">
      <h2 className="mb-6 text-lg font-semibold text-neutral-800 dark:text-neutral-200">내 정보</h2>

      <div className="space-y-5">
        <Field label="아이디">
          <p className={readClass}>{user.username ?? '-'}</p>
        </Field>
        <Field label="이메일">
          <p className={readClass}>{user.email ?? '-'}</p>
        </Field>
        <Field label="이름">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className={inputClass}
            placeholder="이름 입력"
          />
        </Field>
        <Field label="연락처">
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className={inputClass}
            placeholder="010-0000-0000"
          />
        </Field>
        <Field label="회원 유형">
          <p className={readClass}>{user.user_type ?? '-'}</p>
        </Field>
        <Field label="회원 자격">
          <p className={readClass}>{user.member_rank ?? '-'}</p>
        </Field>
        <Field label="가입일">
          <p className={readClass}>{user.created_at ? user.created_at.slice(0, 10) : '-'}</p>
        </Field>
      </div>

      {msg && (
        <div className={`mt-5 rounded-xl px-4 py-3 text-sm ${msg.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
          {msg.text}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-6 w-full rounded-xl bg-neutral-900 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
      >
        {saving ? '저장 중...' : '저장하기'}
      </button>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-neutral-600 dark:text-neutral-400">{label}</label>
      {children}
    </div>
  )
}

const inputClass = 'w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100'
const readClass = 'rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-400'
