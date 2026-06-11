'use client'
// KN541 리뷰 — POST /reviews API 연동 + GET /reviews/product/{id} 리뷰 목록 로드
// fix: handleSubmit이 console.log만 하던 것 → 실제 API 호출로 변경

import StarReview from '@/components/StarReview'
import { Button } from '@/shared/Button/Button'
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/shared/dialog'
import { Field, Fieldset, Label } from '@/shared/fieldset'
import { Textarea } from '@/shared/textarea'
import { StarIcon } from '@heroicons/react/24/solid'
import { MessageAdd01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import clsx from 'clsx'
import React, { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { apiUrl } from '@/lib/api/base'

interface ReviewItem {
  review_id: string
  author: string
  rating: number
  content: string
  created_at: string
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
  } catch {
    return iso
  }
}

const ProductReviews = ({
  productId,
  className,
}: {
  productId: string
  className?: string
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [ratingAvg, setRatingAvg] = useState(0)
  const [total, setTotal] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const loadReviews = useCallback(async () => {
    try {
      const res = await fetch(apiUrl(`/reviews/product/${productId}?size=50`), { cache: 'no-store' })
      if (!res.ok) return
      const json = await res.json()
      const data = json?.data
      if (data) {
        setReviews(data.items ?? [])
        setRatingAvg(data.rating_avg ?? 0)
        setTotal(data.total ?? 0)
      }
    } catch { /* ignore */ }
  }, [productId])

  useEffect(() => {
    if (productId) void loadReviews()
  }, [productId, loadReviews])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const content = formData.get('review')?.toString()?.trim() || ''
    const rating = parseInt(formData.get('rating')?.toString() || '0', 10)

    if (!content || content.length < 5) {
      toast.error('리뷰 내용을 5자 이상 입력해 주세요.')
      return
    }
    if (rating < 1 || rating > 5) {
      toast.error('별점을 선택해 주세요.')
      return
    }

    setSubmitting(true)
    try {
      const token = localStorage.getItem('access_token') || ''
      const res = await fetch(apiUrl('/reviews'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          product_id: productId,
          rating,
          content,
        }),
      })

      if (res.status === 401) {
        toast.error('로그인 후 리뷰를 작성할 수 있습니다.')
        return
      }

      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg = body?.detail?.message || body?.detail || '리뷰 등록에 실패했습니다.'
        toast.error(typeof msg === 'string' ? msg : '리뷰 등록에 실패했습니다.')
        return
      }

      toast.success('리뷰가 등록됐습니다.')
      setIsOpen(false)
      form.reset()
      void loadReviews()
    } catch {
      toast.error('네트워크 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={clsx(className)}>
      <div>
        <h2 className="flex scroll-mt-8 items-center text-2xl font-semibold" id="reviews">
          <StarIcon className="mb-0.5 size-7" />
          <span className="ml-1.5">
            {ratingAvg > 0 ? `${ratingAvg}점` : ''} · {total}개 리뷰
          </span>
        </h2>

        {reviews.length > 0 ? (
          <div className="mt-10">
            <div className="grid grid-cols-1 gap-x-14 gap-y-8 md:grid-cols-2 lg:gap-x-28">
              {reviews.map((review) => (
                <div key={review.review_id} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[0, 1, 2, 3, 4].map(i => (
                        <StarIcon key={i} className={clsx('size-4', i < review.rating ? 'text-yellow-400' : 'text-gray-200')} />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{review.author}</span>
                    <span className="text-xs text-neutral-400">{formatDate(review.created_at)}</span>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{review.content}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-6 text-sm text-neutral-400">아직 등록된 리뷰가 없습니다.</p>
        )}

        <Button className="mt-10" onClick={() => setIsOpen(true)}>
          <HugeiconsIcon icon={MessageAdd01Icon} size={20} />
          리뷰 작성
        </Button>

        <Dialog size="2xl" open={isOpen} onClose={setIsOpen}>
          <DialogTitle>
            <div className="flex items-center">
              <HugeiconsIcon icon={MessageAdd01Icon} size={20} className="mr-2" />
              리뷰 작성
            </div>
          </DialogTitle>
          <DialogDescription>
            솔직한 리뷰를 남겨주세요. 별점과 내용을 모두 입력해 주세요.
          </DialogDescription>
          <DialogBody>
            {/* ★ fix: next/form 대신 일반 form + onSubmit으로 API 호출 */}
            <form id="review-form" onSubmit={handleSubmit}>
              <Fieldset>
                <StarReview />
                <Field className="mt-5">
                  <Label>리뷰 내용 *</Label>
                  <Textarea name="review" placeholder="상품에 대한 솔직한 후기를 작성해 주세요. (5자 이상)" rows={6} />
                </Field>
              </Fieldset>
            </form>
          </DialogBody>
          <DialogActions>
            <Button size="smaller" plain onClick={() => setIsOpen(false)}>
              취소
            </Button>
            {/* ★ fix: onClick에서 setIsOpen 제거 — submit 성공 시에만 닫힘 */}
            <Button size="smaller" type="submit" form="review-form" disabled={submitting}>
              {submitting ? '등록 중...' : '등록하기'}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  )
}

export default ProductReviews
