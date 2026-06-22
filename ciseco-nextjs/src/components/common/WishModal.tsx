'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from '@/i18n/navigation'

const BASE = process.env.NEXT_PUBLIC_API_URL

type Props = {
  open: boolean
  onClose: () => void
}

export default function WishModal({ open, onClose }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [needsLogin, setNeedsLogin] = useState(false)

  useEffect(() => {
    if (!open) return
    setTitle('')
    setContent('')
    setError('')
    const token = localStorage.getItem('access_token')
    if (!token) {
      setNeedsLogin(true)
      return
    }
    setNeedsLogin(false)
  }, [open])

  if (!open) return null

  const handleLogin = () => {
    onClose()
    router.push('/login')
  }

  const handleSubmit = async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setNeedsLogin(true)
      return
    }

    const trimmedTitle = title.trim()
    const trimmedContent = content.trim()

    if (trimmedTitle.length < 2 || trimmedTitle.length > 200) {
      setError('제목은 2~200자로 입력해 주세요.')
      return
    }
    if (trimmedContent.length < 5 || trimmedContent.length > 5000) {
      setError('내용은 5~5000자로 입력해 주세요.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(`${BASE}/wishes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: trimmedTitle, content: trimmedContent }),
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.detail ?? json.message ?? '요청 접수에 실패했습니다.')
      }
      toast.success('요청이 접수되었습니다')
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '요청 접수에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl bg-white p-6 dark:bg-neutral-900 sm:rounded-3xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-kn541-black dark:text-neutral-100">KN541에 바란다</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        {needsLogin ? (
          <div className="py-6 text-center">
            <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">로그인이 필요합니다.</p>
            <button
              type="button"
              onClick={handleLogin}
              className="rounded-full bg-kn541-green px-6 py-2.5 text-sm font-semibold text-white hover:bg-kn541-green/90"
            >
              로그인하기
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-semibold text-kn541-black dark:text-neutral-100">
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                maxLength={200}
                placeholder="제목을 입력해 주세요"
                className="w-full rounded-xl border border-kn541-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-kn541-green/30 dark:border-neutral-600 dark:bg-neutral-800"
              />
            </div>

            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-semibold text-kn541-black dark:text-neutral-100">
                내용 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                maxLength={5000}
                rows={6}
                placeholder="건의사항, 개선 요청, 아이디어 등 자유롭게 작성해 주세요"
                className="w-full resize-none rounded-xl border border-kn541-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-kn541-green/30 dark:border-neutral-600 dark:bg-neutral-800"
              />
            </div>

            {error && (
              <p className="mb-3 text-sm text-red-600">{error}</p>
            )}

            <p className="mb-4 text-xs text-kn541-gray-700 dark:text-neutral-400">
              접수만 가능하며, 별도 답변은 제공되지 않습니다.
            </p>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full rounded-full bg-kn541-green py-3.5 text-sm font-bold text-white transition hover:bg-kn541-green/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? '접수 중...' : '접수하기'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
