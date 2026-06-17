'use client'

import ReviewItem from '@/components/ReviewItem'
import StarReview from '@/components/StarReview'
import { TReview } from '@/data/data'
import { apiUrl } from '@/lib/api/base'
import { Button } from '@/shared/Button/Button'
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/shared/dialog'
import { Field, Fieldset, Label } from '@/shared/fieldset'
import { Textarea } from '@/shared/textarea'
import { StarIcon } from '@heroicons/react/24/solid'
import { MessageAdd01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import clsx from 'clsx'
import Form from 'next/form'
import React from 'react'
import toast from 'react-hot-toast'

type ApiReviewItem = {
  review_id: string
  author?: string
  rating?: number
  content?: string
  created_at?: string
}

function mapApiReview(row: ApiReviewItem): TReview {
  const created = row.created_at ? new Date(row.created_at) : null
  const dateLabel =
    created && !Number.isNaN(created.getTime())
      ? created.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
      : ''
  return {
    id: row.review_id,
    rating: Number(row.rating) || 0,
    content: row.content ? `<p>${row.content.replace(/</g, '&lt;')}</p>` : '',
    author: row.author || '익명',
    date: dateLabel,
    datetime: row.created_at || '',
  }
}

const ProductReviews = ({
  productId,
  rating: initialRating,
  reviewNumber: initialReviewNumber,
  reviews: initialReviews,
  className,
}: {
  productId: string
  reviews?: TReview[]
  className?: string
  rating: number
  reviewNumber: number
}) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [reviews, setReviews] = React.useState<TReview[]>(initialReviews ?? [])
  const [rating, setRating] = React.useState(initialRating)
  const [reviewNumber, setReviewNumber] = React.useState(initialReviewNumber)

  React.useEffect(() => {
    if (!productId) return
    let cancelled = false
    fetch(apiUrl(`/reviews/product/${encodeURIComponent(productId)}?page=1&size=20`))
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (cancelled || !json?.data) return
        const items = (json.data.items ?? []) as ApiReviewItem[]
        setReviews(items.map(mapApiReview))
        setReviewNumber(Number(json.data.total) || items.length)
        setRating(Number(json.data.rating_avg) || initialRating)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [productId, initialRating])

  const handleSubmit = async (formData: FormData) => {
    const content = formData.get('review')?.toString().trim() || ''
    const ratingVal = formData.get('rating') ? parseInt(formData.get('rating')?.toString() || '0', 10) : 0
    if (!content || ratingVal < 1 || ratingVal > 5) {
      toast.error('리뷰 내용과 별점(1~5)을 입력해 주세요.')
      return
    }
    if (content.length < 5) {
      toast.error('리뷰는 5자 이상 입력해 주세요.')
      return
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    if (!token) {
      toast.error('로그인 후 리뷰를 작성할 수 있습니다.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(apiUrl('/reviews'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          rating: ratingVal,
          content,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(typeof json?.detail === 'string' ? json.detail : '리뷰 등록에 실패했습니다.')
        return
      }
      toast.success('리뷰가 등록되었습니다.')
      setIsOpen(false)

      const listRes = await fetch(apiUrl(`/reviews/product/${encodeURIComponent(productId)}?page=1&size=20`))
      if (listRes.ok) {
        const listJson = await listRes.json()
        const items = (listJson.data?.items ?? []) as ApiReviewItem[]
        setReviews(items.map(mapApiReview))
        setReviewNumber(Number(listJson.data?.total) || items.length)
        setRating(Number(listJson.data?.rating_avg) || ratingVal)
      }
    } catch {
      toast.error('서버 연결에 실패했습니다.')
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
            {rating > 0 ? `${rating}점` : ''} · {reviewNumber}개 리뷰
          </span>
        </h2>

        {reviews.length > 0 ? (
          <div className="mt-10">
            <div className="grid grid-cols-1 gap-x-14 gap-y-11 md:grid-cols-2 lg:gap-x-28">
              {reviews.map((review) => (
                <ReviewItem key={review.id} data={review} />
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
            <Form action={handleSubmit} id="review-form">
              <Fieldset>
                <StarReview />
                <Field className="mt-5">
                  <Label>리뷰 내용 *</Label>
                  <Textarea name="review" placeholder="상품에 대한 솔직한 후기를 작성해 주세요." rows={6} />
                </Field>
              </Fieldset>
            </Form>
          </DialogBody>
          <DialogActions>
            <Button size="smaller" plain onClick={() => setIsOpen(false)} disabled={submitting}>
              취소
            </Button>
            <Button size="smaller" type="submit" form="review-form" disabled={submitting}>
              {submitting ? '등록 중…' : '등록하기'}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  )
}

export default ProductReviews
