'use client'
/**
 * 계정 설정(/account) — 기본정보·연락처·비밀번호 단일 페이지, 저장 한 번
 */
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useProfile } from '@/lib/mypage/useProfile'
import { getAuthHeader } from '@/lib/mypage/auth'
import { mypageFetch, MypageApiError } from '@/lib/mypage/api'
import BigButton from '@/components/mypage/BigButton'
import {
  checkPasswordPolicy,
  isPasswordValid,
  stripHangulFromPassword,
  passwordContainsHangul,
} from '@/lib/passwordPolicy'

const BASE = process.env.NEXT_PUBLIC_API_URL

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path
          strokeWidth={2}
          strokeLinecap="round"
          d="M3 3l18 18M10.6 10.6a2 2 0 102.8 2.8M9.9 4.2A9 9 0 0112 3c5 0 9 5 9 5a15.4 15.4 0 01-2.7 3.2M6.2 6.2A15 15 0 003 8s4 5 9 5c.8 0 1.6-.1 2.3-.3M12 18c-5 0-9-5-9-5a15.4 15.4 0 012.7-3.2"
        />
      </svg>
    )
  }
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6z"
      />
      <circle cx="12" cy="12" r="3" strokeWidth={2} />
    </svg>
  )
}

function PasswordPolicyHint({ password }: { password: string }) {
  const c = checkPasswordPolicy(password)
  const rows = [
    { ok: c.minLength, label: '8자 이상' },
    { ok: c.hasNumberOrSpecial, label: '숫자 또는 특수문자 포함' },
    { ok: c.notAllSame, label: '동일 문자만 반복 불가' },
    { ok: c.noHangul, label: '한글 사용 불가' },
  ]
  return (
    <ul className="mt-2 space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
      {rows.map(({ ok, label }) => (
        <li key={label} className={ok ? 'font-medium text-emerald-600 dark:text-emerald-400' : ''}>
          {ok ? '✅' : '❌'} {label}
        </li>
      ))}
    </ul>
  )
}

const inputClass =
  'w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white'

const readOnlyBoxClass =
  'flex min-h-14 w-full items-center rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-3 text-sm text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-300'

const cardClass =
  'rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900'

export default function AccountProfileClient() {
  const { data, loading, reload } = useProfile()

  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [gender, setGender] = useState<'M' | 'F' | ''>('')

  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [zip, setZip] = useState('')
  const [addr1, setAddr1] = useState('')
  const [addr2, setAddr2] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCur, setShowCur] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showCf, setShowCf] = useState(false)
  const [newPwHangulMsg, setNewPwHangulMsg] = useState('')
  const [cfPwHangulMsg, setCfPwHangulMsg] = useState('')

  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!data) return
    setName(data.name ?? '')
    setBirthDate(data.birth_date ? String(data.birth_date).slice(0, 10) : '')
    setGender(data.gender === 'M' || data.gender === 'F' ? data.gender : '')
    setEmail(data.email ?? '')
    setPhone(data.phone ?? '')
    setZip(data.zip_code ?? '')
    setAddr1(data.address1 ?? '')
    setAddr2(data.address2 ?? '')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setNewPwHangulMsg('')
    setCfPwHangulMsg('')
  }, [data])

  const matchOk =
    newPassword.length > 0 && confirmPassword.length > 0 && newPassword === confirmPassword
  const matchBad = confirmPassword.length > 0 && newPassword !== confirmPassword

  const validatePasswordSection = useCallback((): string | null => {
    const cur = currentPassword.trim()
    const nw = newPassword.trim()
    const cf = confirmPassword.trim()
    if (!cur && !nw && !cf) return null
    if (!cur) return '비밀번호를 변경하려면 현재 비밀번호를 입력해 주세요.'
    if (!nw) return '새 비밀번호를 입력해 주세요.'
    if (newPwHangulMsg || cfPwHangulMsg) return '비밀번호에 한글을 사용할 수 없습니다.'
    if (!isPasswordValid(nw)) return '새 비밀번호가 정책을 만족하지 않습니다.'
    if (nw !== cf) return '새 비밀번호 확인이 일치하지 않습니다.'
    return null
  }, [
    currentPassword,
    newPassword,
    confirmPassword,
    newPwHangulMsg,
    cfPwHangulMsg,
  ])

  const saveAll = async () => {
    if (!BASE || !data) {
      toast.error('설정을 불러올 수 없습니다.')
      return
    }

    const pwErr = validatePasswordSection()
    if (pwErr) {
      toast.error(pwErr)
      return
    }

    const wantsPasswordChange =
      currentPassword.trim().length > 0 ||
      newPassword.trim().length > 0 ||
      confirmPassword.trim().length > 0

    setSaving(true)
    try {
      const patchRes = await fetch(`${BASE}/members/${data.user_id}`, {
        method: 'PATCH',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || null,
          email: email.trim() || null,
          birth_date: birthDate.trim() === '' ? null : birthDate.trim().slice(0, 10),
          gender: gender === '' ? null : gender,
          phone: phone.trim() || null,
          zip_code: zip.trim() || null,
          address1: addr1.trim() || null,
          address2: addr2.trim() || null,
        }),
      })
      if (!patchRes.ok) throw new Error('profile_patch_failed')

      if (wantsPasswordChange) {
        await mypageFetch<unknown>('/auth/change-password', {
          method: 'POST',
          body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword,
          }),
        })
      }

      toast.success(
        wantsPasswordChange ? '저장되었습니다. 비밀번호가 변경되었습니다.' : '저장되었습니다.'
      )
      reload()
    } catch (e) {
      if (e instanceof MypageApiError) {
        toast.error(e.message)
      } else {
        toast.error('저장에 실패했습니다. 다시 시도해 주세요.')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <p className="py-12 text-center text-neutral-500 dark:text-neutral-400">불러오는 중…</p>
    )
  }

  if (!data) return null

  return (
    <div className="flex flex-col gap-8">
      <section className={cardClass}>
        <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          <span aria-hidden>👤</span> 기본 정보
        </h2>
        <div className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
              이름
            </label>
            <input
              className={inputClass}
              value={name}
              onChange={e => setName(e.target.value)}
              autoComplete="name"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
              아이디
            </label>
            <div className={readOnlyBoxClass}>{data.username || '-'}</div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
              회원번호
            </label>
            <div className={readOnlyBoxClass}>{data.user_id || '-'}</div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
              생년월일
            </label>
            <input
              type="date"
              className={inputClass}
              value={birthDate}
              onChange={e => setBirthDate(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
              성별
            </label>
            <select
              className={inputClass}
              value={gender}
              onChange={e =>
                setGender(e.target.value === 'M' ? 'M' : e.target.value === 'F' ? 'F' : '')
              }
            >
              <option value="">선택안함</option>
              <option value="M">남성</option>
              <option value="F">여성</option>
            </select>
          </div>
        </div>
      </section>

      <section className={cardClass}>
        <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          <span aria-hidden>📱</span> 연락처
        </h2>
        <div className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
              이메일
            </label>
            <input
              type="email"
              className={inputClass}
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
              휴대폰
            </label>
            <input
              type="tel"
              className={inputClass}
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="010-0000-0000"
              autoComplete="tel"
            />
          </div>
        </div>
      </section>

      <section className={cardClass}>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          <span aria-hidden>🔒</span> 비밀번호 변경
        </h2>
        <p className="mb-6 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm leading-relaxed text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-300">
          정책: 8자 이상, 숫자 또는 특수문자 포함, 동일 문자만 반복은 사용할 수 없으며 한글은 사용할 수
          없습니다. 비밀번호를 바꾸지 않으려면 아래 칸을 비워 두세요.
        </p>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300">
              현재 비밀번호
            </label>
            <div className="relative">
              <input
                type={showCur ? 'text' : 'password'}
                autoComplete="current-password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className={`${inputClass} pr-11`}
              />
              <button
                type="button"
                aria-label={showCur ? '비밀번호 숨기기' : '비밀번호 보기'}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-neutral-500 hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60"
                onClick={() => setShowCur(v => !v)}
              >
                <EyeIcon open={showCur} />
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300">
              새 비밀번호
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                autoComplete="new-password"
                value={newPassword}
                onInput={e => {
                  const raw = e.currentTarget.value
                  if (passwordContainsHangul(raw)) {
                    setNewPwHangulMsg('비밀번호에 한글을 사용할 수 없습니다')
                  } else {
                    setNewPwHangulMsg('')
                  }
                  setNewPassword(stripHangulFromPassword(raw))
                }}
                className={`${inputClass} pr-11 ${newPwHangulMsg ? 'border-red-500 ring-1 ring-red-500/30' : ''}`}
              />
              <button
                type="button"
                aria-label={showNew ? '비밀번호 숨기기' : '비밀번호 보기'}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-neutral-500 hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60"
                onClick={() => setShowNew(v => !v)}
              >
                <EyeIcon open={showNew} />
              </button>
            </div>
            {newPwHangulMsg ? (
              <p className="mt-1 text-xs font-medium text-red-500">{newPwHangulMsg}</p>
            ) : null}
            {newPassword.length > 0 ? <PasswordPolicyHint password={newPassword} /> : null}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300">
              새 비밀번호 확인
            </label>
            <div className="relative">
              <input
                type={showCf ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onInput={e => {
                  const raw = e.currentTarget.value
                  if (passwordContainsHangul(raw)) {
                    setCfPwHangulMsg('비밀번호에 한글을 사용할 수 없습니다')
                  } else {
                    setCfPwHangulMsg('')
                  }
                  setConfirmPassword(stripHangulFromPassword(raw))
                }}
                className={`${inputClass} pr-11 ${matchBad || cfPwHangulMsg ? 'border-red-500 ring-1 ring-red-500/30' : ''}`}
              />
              <button
                type="button"
                aria-label={showCf ? '비밀번호 숨기기' : '비밀번호 보기'}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-neutral-500 hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60"
                onClick={() => setShowCf(v => !v)}
              >
                <EyeIcon open={showCf} />
              </button>
            </div>
            {cfPwHangulMsg ? (
              <p className="mt-1 text-xs font-medium text-red-500">{cfPwHangulMsg}</p>
            ) : null}
            {confirmPassword.length > 0 ? (
              <p
                className={`mt-1 text-xs font-medium ${matchOk ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}
              >
                {matchOk ? '✓ 비밀번호가 일치합니다' : '비밀번호가 일치하지 않습니다'}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <BigButton fullWidth onClick={() => void saveAll()} disabled={saving}>
        {saving ? '저장 중…' : '저장하기'}
      </BigButton>
    </div>
  )
}
