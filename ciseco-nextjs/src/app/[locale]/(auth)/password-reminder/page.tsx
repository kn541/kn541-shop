'use client'
// fix: i18n — 하드코딩 한국어 전체 t() 치환 (PasswordReminder 섹션)

import { PasswordChangePanel } from '@/components/auth/PasswordChangePanel'
import {
  clearPasswordReminderPending,
  getPasswordReminderDays,
  isPasswordReminderPending,
} from '@/lib/auth/passwordSession'
import { mypageFetch } from '@/lib/mypage/api'
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

const LOGO_URL = 'https://ghtkropmnrelkxivzpim.supabase.co/storage/v1/object/public/brands/white_logo.png'

export default function PasswordReminderPage() {
  const router = useRouter()
  const t = useTranslations('PasswordReminder')
  const [days, setDays] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [skipping, setSkipping] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.replace('/login')
      return
    }
    if (!isPasswordReminderPending()) {
      router.replace('/')
      return
    }
    setDays(getPasswordReminderDays())
  }, [router])

  const handleSkip = async () => {
    setSkipping(true)
    try {
      await mypageFetch<{ message?: string }>('/auth/password-change-skip', { method: 'POST' })
      clearPasswordReminderPending()
      toast.success(t('skipSuccessToast'))
      router.replace('/')
    } catch {
      toast.error(t('skipErrorToast'))
    } finally {
      setSkipping(false)
    }
  }

  if (days === 0 && !isPasswordReminderPending()) {
    return null
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px]">
        <div className="mb-8 flex justify-center">
          <Image src={LOGO_URL} alt="KN541" width={200} height={67} className="h-auto w-[200px]" priority />
        </div>
        <div className="rounded-2xl border border-neutral-100 bg-white px-8 py-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          {!showForm ? (
            <>
              <h1 className="text-center text-xl font-bold text-neutral-900 dark:text-white">
                {t('title')}
              </h1>
              <p className="mt-4 text-center text-sm text-neutral-700 dark:text-neutral-300">
                {t('body', { days: days || 90 })}
              </p>
              <p className="mt-2 text-center text-sm text-neutral-500 dark:text-neutral-400">
                {t('hint')}
              </p>
              <div className="mt-8 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="w-full rounded-xl bg-neutral-900 py-3 text-sm font-semibold text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
                >
                  {t('changeBtn')}
                </button>
                <button
                  type="button"
                  disabled={skipping}
                  onClick={() => void handleSkip()}
                  className="w-full rounded-xl border border-neutral-200 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  {skipping ? t('skipping') : t('skipBtn')}
                </button>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-center text-lg font-bold text-neutral-900 dark:text-white">
                {t('formTitle')}
              </h1>
              <div className="mt-6">
                <PasswordChangePanel
                  variant="voluntary"
                  onSuccess={() => {
                    clearPasswordReminderPending()
                    router.replace('/')
                  }}
                />
              </div>
              <button
                type="button"
                className="mt-4 w-full text-center text-xs text-neutral-500 underline"
                onClick={() => setShowForm(false)}
              >
                {t('backBtn')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
