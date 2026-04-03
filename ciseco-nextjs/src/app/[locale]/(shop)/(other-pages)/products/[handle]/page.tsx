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
  const product = await getProductDetailByHandle(handle)
  const title = product?.title || 'product detail'
  const description = product?.description || 'product detail page'
  return { title, description }
}

export default async function Page({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const product = await getProductDetailByHandle(handle)
  const relatedProducts = (await getProducts()).slice(2, 8)
  const reviews = await getProductReviews(handle)

  if (!product.id) return notFound()

  const { title, status, featuredImage, rating, reviewNumber, options, price, selectedOptions, images, breadcrumbs } = product
  const sizeSelected = selectedOptions?.find((o: any) => o.name === 'Size')?.value || ''
  const colorSelected = selectedOptions?.find((o: any) => o.name === 'Color')?.value || ''
  const allImages = [featuredImage, ...(images || [])].map((i: any) => i?.src).filter(Boolean) as string[]
  const brand = breadcrumbs?.[0]?.name || 'KN541'
  const thumbImage = allImages[0] || ''

  return (
    <main className="container mt-5 lg:mt-8">
      {/* ── 상단 2단 레이아웃 */}
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">

        {/* 좌: 썸네일 + 메인이미지 */}
        <div className="w-full lg:w-[55%]">
          <KoreanProductGallery images={allImages} />
        </div>

        {/* 우: sticky 상품 정보 */}
        <div className="w-full lg:w-[45%]">
          <div className="sticky top-8 flex flex-col gap-6">

            {/* 브랜드 */}
            <p className="text-sm font-semibold uppercase tracking-widest text-primary-600">{brand}</p>

            {/* 상품명 */}
            <h1 className="text-2xl font-bold leading-snug sm:text-3xl">{title}</h1>

            {/* 별점 */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(rating || 0) ? 'text-yellow-400' : 'text-neutral-200'
                    }`}
                  />
                ))}
              </div>
              <a href="#reviews" className="text-sm text-neutral-500 underline">
                {reviewNumber} reviews
              </a>
              <ProductStatus status={status} />
            </div>

            {/* 가격 */}
            <Prices contentClass="text-2xl font-bold" price={price || 0} />

            <Divider />

            {/* ✅ 클라이언트 컴포넌트: 옵션 + 수량 + 장바구니/바로구매 */}
            <ProductActions
              options={options}
              colorSelected={colorSelected}
              sizeSelected={sizeSelected}
              price={price || 0}
              productName={title || ''}
              productImage={thumbImage}
            />

            <Divider />

            {/* 배송 안내 */}
            <div className="flex flex-col gap-2 text-sm text-neutral-600 dark:text-neutral-400">
              <div className="flex gap-3">
                <span className="w-20 shrink-0 font-medium">배송방법</span>
                <span>일반배송</span>
              </div>
              <div className="flex gap-3">
                <span className="w-20 shrink-0 font-medium">배송비</span>
                <span>3,000원 (30,000원 이상 무료배송)</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── 하단: 상품상세 + 리뷰 */}
      <div className="mt-16 flex flex-col gap-12 sm:mt-20">

        {/* 탭 */}
        <div className="flex gap-8 border-b border-neutral-200">
          {['상품상세', '리뷰', '배송/교환/반품'].map((tab) => (
            <button
              key={tab}
              className="pb-3 text-sm font-semibold first:border-b-2 first:border-neutral-900 first:text-neutral-900 text-neutral-400"
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 상품 상세 이미지 세로 나열 */}
        <div className="flex flex-col items-center gap-0">
          {allImages.map((src, idx) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={idx}
              src={src}
              alt={`상품 상세 이미지 ${idx + 1}`}
              className="w-full max-w-3xl object-cover"
              loading="lazy"
            />
          ))}
        </div>

        <Divider />

        {/* 리뷰 */}
        <div id="reviews">
          <ProductReviews reviewNumber={reviewNumber || 0} rating={rating || 1} reviews={reviews} />
        </div>

        <Divider />

        {/* 연관 상품 */}
        <SectionSliderProductCard
          data={relatedProducts}
          heading="함께 보면 좋은 상품"
          subHeading=""
          headingFontClassName="text-2xl font-semibold"
          headingClassName="mb-10"
        />

        <div className="pb-20" />
      </div>
    </main>
  )
}
