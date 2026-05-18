'use client'
/**
 * KN541 쇼핑몰 — 비밀번호 변경 공용 UI
 * - forced: 로그인 응답 password_change_required 시 전체 화면 오버레이에서 사용
 * - voluntary: 마이페이지 — POST /auth/change-password (Authorization Bearer)
 */

import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { checkPasswordPolicy, isPasswordValid, passwordContainsHangul, stripHangulFromPassword } from '@/lib/passwordPolicy'
import { mypageFetch, MypageApiError } from '@/lib/mypage/api'

const apiBase = process.env.NEXT_PUBLIC_API_URL

/** 표시/숨김 토글용 눈 아이콘 */
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

type ForcedProps = {
  variant: 'forced'
  tempToken: string
  /** 강제 변경 페이지: 현재 비밀번호 입력 필드 표시 */
  requireCurrentPassword?: boolean
  serverMessage?: string
  policyText?: string
  onComplete: (data: {
    access_token: string
    refresh_token?: string
    user_type?: string | null
  }) => void
}

type VoluntaryProps = {
  variant: 'voluntary'
  onSuccess?: () => void
}

export type PasswordChangePanelProps = ForcedProps | VoluntaryProps

function PolicyChecklist({ password }: { password: string }) {
  const c = checkPasswordPolicy(password)
  const rows = [
    { ok: c.minLength, label: '8자 이상' },
    { ok: c.hasNumberOrSpecial, label: '숫자 또는 특수문자 포함' },
    { ok: c.notAllSame, label: '동일 문자만 반복 불가' },
    { ok: c.noHangul, label: '한글 사용 불가' },
  ]
  return (
    <ul className="mt-2 space-y-1 text-xs sm:text-sm">
      {rows.map(({ ok, label }) => (
        <li
          key={label}
          className={
            ok
              ? 'font-medium text-emerald-600 dark:text-emerald-400'
              : 'text-neutral-500 dark:text-neutral-400'
          }
        >
          {ok ? '✅' : '❌'} {label}
        </li>
      ))}
    </ul>
  )
}

export function PasswordChangePanel(props: PasswordChangePanelProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showCur, setShowCur] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showCf, setShowCf] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [serverErr, setServerErr] = useState('')
  const [newPwHangulMsg, setNewPwHangulMsg] = useState('')
  const [cfPwHangulMsg, setCfPwHangulMsg] = useState('')

  const isForced = props.variant === 'forced'
  const matchOk = newPassword.length > 0 && confirm.length > 0 && newPassword === confirm
  const matchBad = confirm.length > 0 && newPassword !== confirm
  const policyOk = isPasswordValid(newPassword)
  const forcedNeedsCurrent = isForced && Boolean(props.requireCurrentPassword)
  const canSubmit =
    policyOk &&
    matchOk &&
    !submitting &&
    !newPwHangulMsg &&
    !cfPwHangulMsg &&
    (isForced
      ? Boolean(props.tempToken?.trim()) && (!forcedNeedsCurrent || currentPassword.length > 0)
      : currentPassword.length > 0)

  const inputClass =
    'w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-4 py-3 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all'

  const submit = async () => {
    if (!apiBase) {
      toast.error('API 서버 주소가 설정되지 않았습니다.')
      return
    }
    if (!canSubmit) return
    setServerErr('')
    setSubmitting(true)
    try {
      if (isForced) {
        const body: Record<string, string> = {
          temp_token: props.tempToken,
          new_password: newPassword,
        }
        if (forcedNeedsCurrent) {
          body.current_password = currentPassword
        }
        const res = await fetch(`${apiBase}/auth/force-change-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) {
          const msg =
            typeof json?.detail === 'string' ? json.detail : '비밀번호 변경에 실패했습니다.'
          setServerErr(msg)
          toast.error(msg)
          return
        }
        if (json.status !== 'success' || !json.data?.access_token) {
          const msg = '응답 형식이 올바르지 않습니다.'
          setServerErr(msg)
          toast.error(msg)
          return
        }
        toast.success(json.data?.message ?? '비밀번호가 변경되었습니다.')
        setNewPwHangulMsg('')
        setCfPwHangulMsg('')
        props.onComplete({
          access_token: json.data.access_token,
          refresh_token: json.data.refresh_token,
          user_type: json.data.user_type ?? null,
        })
        return
      }

      await mypageFetch<unknown>('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      })
      toast.success('비밀번호가 변경되었습니다.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirm('')
      setNewPwHangulMsg('')
      setCfPwHangulMsg('')
      props.onSuccess?.()
    } catch (err) {
      const msg =
        err instanceof MypageApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : '비밀번호 변경에 실패했습니다.'
      setServerErr(msg)
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      {isForced && (
        <div
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100"
        >
          <p className="font-semibold">보안 정책이 변경되었습니다</p>
          {props.serverMessage ? (
            <p className="mt-1 text-xs opacity-90">{props.serverMessage}</p>
          ) : null}
          {props.policyText ? (
            <p className="mt-1 text-xs opacity-80">요구사항: {props.policyText}</p>
          ) : null}
        </div>
      )}

      {(!isForced || forcedNeedsCurrent) && (
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
      )}

      <div>
        <label className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300">
          새 비밀번호
        </label>
        <p className="mb-1.5 text-xs text-neutral-500 dark:text-neutral-400">
          8자 이상, 숫자 또는 특수문자 포함 (한글 사용 불가)
        </p>
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
        {newPassword.length > 0 ? <PolicyChecklist password={newPassword} /> : null}
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300">
          새 비밀번호 확인
        </label>
        <div className="relative">
          <input
            type={showCf ? 'text' : 'password'}
            autoComplete="new-password"
            value={confirm}
            onInput={e => {
              const raw = e.currentTarget.value
              if (passwordContainsHangul(raw)) {
                setCfPwHangulMsg('비밀번호에 한글을 사용할 수 없습니다')
              } else {
                setCfPwHangulMsg('')
              }
              setConfirm(stripHangulFromPassword(raw))
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
        {confirm.length > 0 ? (
          <p
            className={`mt-1 text-xs font-medium ${matchOk ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}
          >
            {matchOk ? '✓ 비밀번호가 일치합니다' : '비밀번호가 일치하지 않습니다'}
          </p>
        ) : null}
      </div>

      {serverErr ? <p className="text-center text-xs text-red-500">{serverErr}</p> : null}

      <button
        type="button"
        disabled={!canSubmit}
        onClick={() => void submit()}
        className="w-full rounded-xl bg-neutral-900 dark:bg-white font-semibold py-3 text-sm text-white dark:text-neutral-900 hover:bg-neutral-700 dark:hover:bg-neutral-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? '처리 중…' : '비밀번호 변경'}
      </button>
    </div>
  )
}
