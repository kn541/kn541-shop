import { Divider } from '@/components/Divider'
import Prices from '@/components/Prices'
import SectionSliderProductCard from '@/components/SectionSliderProductCard'
import { getProductDetailByHandle, getProductReviews, getProducts } from '@/data/data'
import { StarIcon } from '@heroicons/react/24/solid'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ProductReviews from '../ProductReviews'
import ProductStatus from '../ProductStatus'
import KoreanProductGallery from '../KoreanProductGallery'
import ProductActions from './ProductActions'

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params
  const product = await getProductDetailByHandle(handle) as any
  const title = product?.title || '상품 상세'
  // description이 HTML인 경우 태그 제거
  const rawDesc = product?.description || ''
  const plainDesc = rawDesc.replace(/<[^>]*>/g, '').slice(0, 160)
  return { title, description: plainDesc || '상품 상세 페이지' }
}

export default async function Page({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const product = await getProductDetailByHandle(handle)

  if (!product?.id) return notFound()

  const relatedProducts = (await getProducts()).slice(0, 8)
  const reviews = await getProductReviews(handle)

  const {
    title,
    status,
    featuredImage,
    rating,
    reviewNumber,
    options,
    price,
    images,
    breadcrumbs,
    description,
    shippingFee,
    freeShippingOver,
    returnFee,
    deliveryDays,
  } = product as any

  const allImages = [featuredImage, ...(images || [])]
    .map((i: any) => i?.src)
    .filter(Boolean)
    .filter((src: string, idx: number, arr: string[]) => arr.indexOf(src) === idx) as string[]

  const thumbImage = allImages[0] || ''

  // description이 HTML인지 판별
  const isHtmlDesc = /<[a-z][\s\S]*>/i.test(description || '')

  // 배송비 텍스트
  const shippingText = (() => {
    if (!shippingFee || shippingFee === 0) return '무료배송'
    const fee = Number(shippingFee).toLocaleString('ko-KR')
    if (freeShippingOver && freeShippingOver > 0) {
      const over = Number(freeShippingOver).toLocaleString('ko-KR')
      return `${fee}원 (${over}원 이상 무료배송)`
    }
    return `${fee}원`
  })()

  const returnText = returnFee && Number(returnFee) > 0
    ? `반품 ${Number(returnFee).toLocaleString('ko-KR')}원`
    : '반품 무료'

  return (
    <main className="container mt-5 lg:mt-8">
      {/* 상단 2단 레이아웃 */}
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">

        {/* 좌: 이미지 갤러리 */}
        <div className="w-full lg:w-[55%]">
          <KoreanProductGallery images={allImages} />
        </div>

        {/* 우: sticky 상품 정보 */}
        <div className="w-full lg:w-[45%]">
          <div className="sticky top-8 flex flex-col gap-5">

            {/* 브랜드 / 카테고리 */}
            {(product as any).vendor && (
              <p className="text-sm font-semibold uppercase tracking-widest text-primary-600">
                {(product as any).vendor}
              </p>
            )}

            {/* 상품명 */}
            <h1 className="text-2xl font-bold leading-snug sm:text-3xl">{title}</h1>

            {/* 별점 */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-4 w-4 ${i < Math.round(rating || 0) ? 'text-yellow-400' : 'text-neutral-200'}`}
                  />
                ))}
              </div>
              {reviewNumber > 0 && (
                <a href="#reviews" className="text-sm text-neutral-500 underline">
                  {reviewNumber}개 리뷰
                </a>
              )}
              <ProductStatus status={status} />
            </div>

            {/* 가격 */}
            <Prices contentClass="text-3xl font-bold" price={price || 0} />

            <Divider />

            {/* 옵션 + 수량 + 장바구니/바로구매 */}
            <ProductActions
              options={options}
              colorSelected=""
              sizeSelected=""
              price={price || 0}
              productName={title || ''}
              productImage={thumbImage}
            />

            <Divider />

            {/* 배송 안내 */}
            <div className="flex flex-col gap-2.5 text-sm text-neutral-600 dark:text-neutral-400">
              <div className="flex gap-3">
                <span className="w-24 shrink-0 font-medium text-neutral-800 dark:text-neutral-200">배송방법</span>
                <span>일반배송 ({deliveryDays || 3}일 이내)</span>
              </div>
              <div className="flex gap-3">
                <span className="w-24 shrink-0 font-medium text-neutral-800 dark:text-neutral-200">배송비</span>
                <span>{shippingText}</span>
              </div>
              {returnFee !== undefined && (
                <div className="flex gap-3">
                  <span className="w-24 shrink-0 font-medium text-neutral-800 dark:text-neutral-200">반품/교환</span>
                  <span>{returnText} · 수령 후 30일 이내</span>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* 하단: 상품상세 + 리뷰 */}
      <div className="mt-16 flex flex-col gap-0 sm:mt-20">

        {/* 탭 헤더 */}
        <div className="flex gap-8 border-b border-neutral-200 dark:border-neutral-700 mb-10">
          {['상품상세', '리뷰', '배송/교환/반품'].map((tab, idx) => (
            <button
              key={tab}
              className={`pb-3 text-sm font-semibold transition-colors ${
                idx === 0
                  ? 'border-b-2 border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-neutral-100'
                  : 'text-neutral-400 hover:text-neutral-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 상품 상세 — HTML or 이미지 */}
        {isHtmlDesc ? (
          /* HTML description 렌더링 */
          <div
            className="prose prose-sm sm:prose max-w-none dark:prose-invert mx-auto w-full"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        ) : description ? (
          /* 텍스트 description */
          <div className="mx-auto w-full max-w-3xl">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              {description}
            </p>
          </div>
        ) : null}

        {/* 상품 이미지 세로 나열 (description 없거나 이미지 추가 표시) */}
        {allImages.length > 0 && (
          <div className="mt-8 flex flex-col items-center gap-0">
            {allImages.map((src, idx) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={idx}
                src={src}
                alt={`${title} 상세 이미지 ${idx + 1}`}
                className="w-full max-w-3xl object-cover"
                loading={idx === 0 ? 'eager' : 'lazy'}
              />
            ))}
          </div>
        )}

        <Divider className="mt-12 mb-12" />

        {/* 배송/교환/반품 안내 */}
        <div className="mx-auto w-full max-w-3xl rounded-2xl bg-neutral-50 dark:bg-neutral-800 p-6 mb-12">
          <h3 className="mb-4 text-base font-bold">배송 / 교환 / 반품 안내</h3>
          <div className="flex flex-col gap-3 text-sm text-neutral-600 dark:text-neutral-400">
            <div className="flex gap-4">
              <span className="w-24 shrink-0 font-medium text-neutral-800 dark:text-neutral-200">배송방법</span>
              <span>일반택배 ({deliveryDays || 3}일 이내 출발)</span>
            </div>
            <div className="flex gap-4">
              <span className="w-24 shrink-0 font-medium text-neutral-800 dark:text-neutral-200">배송비</span>
              <span>{shippingText}</span>
            </div>
            <div className="flex gap-4">
              <span className="w-24 shrink-0 font-medium text-neutral-800 dark:text-neutral-200">반품비용</span>
              <span>{returnText}</span>
            </div>
            <Divider />
            <div className="flex gap-4">
              <span className="w-24 shrink-0 font-medium text-neutral-800 dark:text-neutral-200">반품기한</span>
              <span>수령 후 30일 이내 (단순변심 포함)</span>
            </div>
            <div className="flex gap-4">
              <span className="w-24 shrink-0 font-medium text-neutral-800 dark:text-neutral-200">반품불가</span>
              <span>사용/개봉, 파손·훼손, 주문 제작 상품</span>
            </div>
          </div>
        </div>

        {/* 리뷰 */}
        <div id="reviews" className="mb-12">
          <ProductReviews reviewNumber={reviewNumber || 0} rating={rating || 0} reviews={reviews} />
        </div>

        <Divider />

        {/* 연관 상품 */}
        {relatedProducts.length > 0 && (
          <SectionSliderProductCard
            data={relatedProducts}
            heading="함께 보면 좋은 상품"
            subHeading=""
            headingFontClassName="text-2xl font-semibold"
            headingClassName="mb-10 mt-10"
          />
        )}

        <div className="pb-20" />
      </div>
    </main>
  )
}
