'use client'
// ★ 전체 한국어화

import ReviewItem from '@/components/ReviewItem'
import StarReview from '@/components/StarReview'
import { TReview } from '@/data/data'
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

const ProductReviews = ({
  rating,
  reviewNumber,
  reviews,
  className,
}: {
  reviews: TReview[]
  className?: string
  rating: number
  reviewNumber: number
}) => {
  const [isOpen, setIsOpen] = React.useState(false)

  const handleSubmit = async (formData: FormData) => {
    const review = formData.get('review')?.toString() || ''
    const ratingVal = formData.get('rating') ? parseInt(formData.get('rating')?.toString() || '0', 10) : 0
    if (!review || ratingVal < 1 || ratingVal > 5) {
      console.error('리뷰 내용 또는 별점이 올바르지 않습니다.')
      return
    }
    console.log('리뷰 등록:', { review, rating: ratingVal })
    setIsOpen(false)
  }

  return (
    <div className={clsx(className)}>
      <div>
        {/* 헤딩 — ★ 한국어 */}
        <h2 className="flex scroll-mt-8 items-center text-2xl font-semibold" id="reviews">
          <StarIcon className="mb-0.5 size-7" />
          <span className="ml-1.5">
            {rating > 0 ? `${rating}점` : ''} · {reviewNumber}개 리뷰
          </span>
        </h2>

        {/* 리뷰 목록 */}
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

        {/* 리뷰 작성 버튼 — ★ 한국어 */}
        <Button className="mt-10" onClick={() => setIsOpen(true)}>
          <HugeiconsIcon icon={MessageAdd01Icon} size={20} />
          리뷰 작성
        </Button>

        {/* 리뷰 작성 다이얼로그 — ★ 한국어 */}
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
            <Button size="smaller" plain onClick={() => setIsOpen(false)}>
              취소
            </Button>
            <Button size="smaller" onClick={() => setIsOpen(false)} type="submit" form="review-form">
              등록하기
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  )
}

export default ProductReviews
