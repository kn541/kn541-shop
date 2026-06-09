'use client'

import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Button } from '@/shared/Button/Button'
import { Field, FieldGroup, Fieldset, Label } from '@/shared/fieldset'
import { Input } from '@/shared/input'
import { Link } from '@/shared/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useRouter } from '@/i18n/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslations } from 'next-intl'

import { apiUrl } from '@/lib/api/base'

type Step = 1 | 2 | 3

function readDetail(json: unknown): string {
  if (!json || typeof json !== 'object') return ''
  const d = (json as { detail?: unknown }).detail
  if (typeof d === 'string') return d
  if (Array.isArray(d) && d[0] && typeof (d[0] as { msg?: string }).msg === 'string')
    return (d[0] as { msg: string }).msg
  return ''
}

export default function ForgotPasswordClient() {
  const t = useTranslations('Auth')
  const router = useRouter()

  const [step, setStep] = useState<Step>(1)
  const [accountUsername, setAccountUsername] = useState('')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [sending, setSending] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deadlineMs, setDeadlineMs] = useState<number | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (deadlineMs == null) return
    const id = window.setInterval(() => setTick((x) => x + 1), 1000)
    return () => window.clearInterval(id)
  }, [deadlineMs])

  const remainingSec = useMemo(() => {
    if (deadlineMs == null) return 0
    return Math.max(0, Math.ceil((deadlineMs - Date.now()) / 1000))
  }, [deadlineMs, tick])

  const mm = Math.floor(remainingSec / 60)
  const ss = remainingSec % 60

  const goBack = useCallback(() => {
    router.back()
  }, [router])

  const sendCode = async () => {
    if (!accountUsername.trim()) {
      toast.error(t('forgotPasswordUsernameInvalid'))
      return
    }
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 10) {
      toast.error(t('forgotPasswordPhoneInvalid'))
      return
    }
    setSending(true)
    try {
      const res = await fetch(apiUrl('/auth/password-reset/request'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: accountUsername.trim(), phone: digits }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(readDetail(json) || t('forgotPasswordSendError'))
        return
      }
      if (json?.status === 'success') {
        toast.success(t('forgotPasswordSmsSentToast'))
        setDeadlineMs(Date.now() + 5 * 60 * 1000)
        setStep(2)
        setCode('')
      } else {
        toast.error(t('forgotPasswordSendError'))
      }
    } catch {
      toast.error(t('forgotPasswordNetworkError'))
    } finally {
      setSending(false)
    }
  }

  const confirmReset = async () => {
    if (deadlineMs != null && Date.now() > deadlineMs) {
      toast.error(t('forgotPasswordCodeExpired'))
      return
    }
    if (code.trim().length !== 6) {
      toast.error(t('forgotPasswordCodeInvalid'))
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error(t('forgotPasswordMismatch'))
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(apiUrl('/auth/password-reset/confirm'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.replace(/\D/g, ''),
          code: code.trim(),
          new_password: newPassword,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(readDetail(json) || t('forgotPasswordResetError'))
        return
      }
      if (json?.status === 'success') {
        toast.success(t('forgotPasswordSuccessToast'))
        router.push('/login')
      } else {
        toast.error(t('forgotPasswordResetError'))
      }
    } catch {
      toast.error(t('forgotPasswordNetworkError'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container mb-24 lg:mb-32">
      <div className="relative mx-auto max-w-md">
        <button
          type="button"
          onClick={goBack}
          className="absolute -top-2 start-0 flex size-10 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
          aria-label={t('forgotPasswordBackAria')}
        >
          <ArrowLeftIcon className="size-6" />
        </button>

        <header className="mx-auto mb-10 max-w-2xl pt-14 text-center sm:mb-12">
          <h1 className="text-2xl font-semibold text-neutral-900 sm:text-3xl md:text-4xl dark:text-neutral-100">
            {t('forgotPasswordTitle')}
          </h1>
          <p className="mt-3 text-sm text-neutral-600 sm:text-base dark:text-neutral-300">
            {t('forgotPasswordHintSms')}
          </p>
        </header>

        <div className="space-y-6">
          {step === 1 && (
            <Fieldset>
              <FieldGroup>
                <Field>
                  <Label>{t('forgotPasswordUsernameLabel')}</Label>
                  <Input
                    type="text"
                    name="username"
                    autoComplete="username"
                    placeholder={t('forgotPasswordUsernamePlaceholder')}
                    value={accountUsername}
                    onChange={(e) => setAccountUsername(e.target.value)}
                  />
                </Field>
                <Field>
                  <Label>{t('forgotPasswordPhoneLabel')}</Label>
                  <Input
                    type="tel"
                    name="phone"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder={t('forgotPasswordPhonePlaceholder')}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </Field>
                <ButtonPrimary className="w-full" type="button" disabled={sending} onClick={() => void sendCode()}>
                  {sending ? t('forgotPasswordSending') : t('forgotPasswordSendCode')}
                </ButtonPrimary>
              </FieldGroup>
            </Fieldset>
          )}

          {step === 2 && (
            <Fieldset>
              <FieldGroup>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {t('forgotPasswordCodeHint', {
                    time: `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`,
                  })}
                </p>
                <Field>
                  <Label>{t('forgotPasswordCodeLabel')}</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    autoComplete="one-time-code"
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  />
                </Field>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    outline
                    className="w-full sm:flex-1"
                    disabled={sending}
                    onClick={() => void sendCode()}
                  >
                    {t('forgotPasswordResend')}
                  </Button>
                  <ButtonPrimary
                    type="button"
                    className="w-full sm:flex-1"
                    disabled={code.length !== 6}
                    onClick={() => setStep(3)}
                  >
                    {t('forgotPasswordNext')}
                  </ButtonPrimary>
                </div>
              </FieldGroup>
            </Fieldset>
          )}

          {step === 3 && (
            <Fieldset>
              <FieldGroup>
                <Field>
                  <Label>{t('password')}</Label>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </Field>
                <Field>
                  <Label>{t('confirmPassword')}</Label>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </Field>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button type="button" outline className="w-full sm:flex-1" onClick={() => setStep(2)}>
                    {t('forgotPasswordPrev')}
                  </Button>
                  <ButtonPrimary
                    type="button"
                    className="w-full sm:flex-1"
                    disabled={submitting || !newPassword}
                    onClick={() => void confirmReset()}
                  >
                    {submitting ? t('forgotPasswordSubmitting') : t('forgotPasswordSubmit')}
                  </ButtonPrimary>
                </div>
              </FieldGroup>
            </Fieldset>
          )}

          <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
            <Link href="/login" className="text-primary-600 underline">
              {t('signIn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
