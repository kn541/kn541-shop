import { Divider } from '@/components/Divider'
import NcInputNumber from '@/components/NcInputNumber'
import Prices from '@/components/Prices'
import ProductColorOptions from '@/components/ProductForm/ProductColorOptions'
import ProductForm from '@/components/ProductForm/ProductForm'
import ProductSizeOptions from '@/components/ProductForm/ProductSizeOptions'
import SectionSliderProductCard from '@/components/SectionSliderProductCard'
import { getProductDetailByHandle, getProductReviews, getProducts } from '@/data/data'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { StarIcon } from '@heroicons/react/24/solid'
import { ShoppingBag03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ProductReviews from '../ProductReviews'
import ProductStatus from '../ProductStatus'
import KoreanProductGallery from '../KoreanProductGallery'

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
  const sizeSelected = selectedOptions?.find((o) => o.name === 'Size')?.value || ''
  const colorSelected = selectedOptions?.find((o) => o.name === 'Color')?.value || ''
  const allImages = [featuredImage, ...(images || [])].map((i) => i?.src).filter(Boolean) as string[]
  const brand = breadcrumbs?.[0]?.name || 'KN541'

  return (
    <main className="container mt-5 lg:mt-8">
      {/* ── 상단 2단 레이아웃 ──────────────────────────────── */}
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">

        {/* ── 좌: 썸네일 + 메인이미지 ── */}
        <div className="w-full lg:w-[55%]">
          <KoreanProductGallery images={allImages} />
        </div>

        {/* ── 우: sticky 상품 정보 ── */}
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

            {/* 옵션 + 수량 + 버튼 */}
            <ProductForm product={product}>
              <fieldset className="flex flex-col gap-6">
                <ProductColorOptions options={options} defaultColor={colorSelected} />
                <ProductSizeOptions options={options} defaultSize={sizeSelected} />

                {/* 수량 */}
                <div className="flex items-center gap-2">
                  <span className="w-20 text-sm font-medium text-neutral-600">수량</span>
                  <div className="flex items-center justify-center rounded-full bg-neutral-100 px-2 py-1.5">
                    <NcInputNumber name="quantity" defaultValue={1} />
                  </div>
                </div>

                {/* 버튼 */}
                <div className="flex gap-3 pt-2">
                  <ButtonPrimary className="flex-1" type="submit">
                    <HugeiconsIcon
                      icon={ShoppingBag03Icon}
                      size={18}
                      color="currentColor"
                      strokeWidth={1.5}
                      className="hidden sm:block"
                    />
                    <span className="sm:ml-2">장바구니</span>
                  </ButtonPrimary>
                  <ButtonPrimary
                    className="flex-1 bg-neutral-900 hover:bg-neutral-800"
                    type="button"
                  >
                    바로구매
                  </ButtonPrimary>
                </div>
              </fieldset>
            </ProductForm>

            <Divider />

            {/* 배송 안내 */}
            <div className="flex flex-col gap-2 text-sm text-neutral-600">
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

      {/* ── 하단: 상품상세 + 리뷰 ────────────────────────── */}
      <div className="mt-16 flex flex-col gap-12 sm:mt-20">

        {/* 탭 네비게이션 */}
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

        {/* 상품 상세 이미지 — 세로로 나열 (10x10 스타일) */}
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
