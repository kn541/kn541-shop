// KN541 상품 상세 페이지
// fix: getProductById(UUID) 직접 호출 — getProductByCode 우회 경로 제거
// fix: adaptProduct로 전체 필드 매핑 (배송비, 카테고리, 옵션 등)

import { Divider } from '@/components/Divider'
import Prices from '@/components/Prices'
import SectionSliderProductCard from '@/components/SectionSliderProductCard'
import { getProducts } from '@/data/data'
import { getProductById } from '@/lib/api/products'
import { adaptProduct } from '@/lib/adapters'
import { StarIcon } from '@heroicons/react/24/solid'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ProductReviews from '../ProductReviews'
import ProductStatus from '../ProductStatus'
import KoreanProductGallery from '../KoreanProductGallery'
import ProductActions from './ProductActions'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

// ── UUID v4 패턴 검증
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string; locale: string }>
}): Promise<Metadata> {
  const { handle } = await params
  try {
    if (UUID_RE.test(handle)) {
      const raw = await getProductById(handle)
      const product = adaptProduct(raw)
      const title = product?.title || '상품 상세'
      const rawDesc = ((product as any)?.description || '').replace(/<[^>]*>/g, '').slice(0, 160)
      return { title, description: rawDesc || '상품 상세 페이지' }
    }
  } catch {
    // 메타데이터 조회 실패 시 기본값
  }
  return { title: '상품 상세 | KN541', description: '상품 상세 페이지' }
}

export default async function Page({
  params,
}: {
  params: Promise<{ handle: string; locale: string }>
}) {
  const { handle, locale } = await params

  // ★ UUID 아니면 404 — 구형 숫자 URL은 404 처리
  if (!UUID_RE.test(handle)) {
    return notFound()
  }

  let rawProduct
  try {
    rawProduct = await getProductById(handle)
  } catch {
    return notFound()
  }

  if (!rawProduct?.product_id) return notFound()

  // ★ adaptProduct로 Ciseco 컴포넌트 포맷으로 변환
  const p = adaptProduct(rawProduct) as any

  const relatedProducts = (await getProducts({ size: 8 })).slice(0, 8)

  // 리뷰는 현재 더미 (실제 리뷰 API 연동 전까지)
  const reviews: any[] = []

  const {
    id: productId,
    title,
    status,
    featuredImage,
    rating,
    reviewNumber,
    price,
    images,
    description,
  } = p

  // ── 배송비 정보
  const deliveryInfo = p.delivery || {}
  const shippingFee = Number(deliveryInfo.shipping_fee ?? 0)
  const freeShippingOver = Number(deliveryInfo.free_over ?? 0)
  const scType = Number(deliveryInfo.sc_type ?? 1)
  const returnFee = Number(deliveryInfo.return_fee ?? 0)
  const deliveryDays = Number(deliveryInfo.delivery_days ?? 3)
  const deliveryCompany = deliveryInfo.delivery_company ?? null

  // 이미지 배열 — 갤러리용 (중복 제거)
  const allImages: string[] = [featuredImage, ...(images || [])]
    .map((i: any) => i?.src)
    .filter(Boolean)
    .filter((src: string, idx: number, arr: string[]) => arr.indexOf(src) === idx)

  const thumbImage = allImages[0] || ''

  // description이 HTML인지 판별
  const isHtmlDesc = /<[a-z][\s\S]*>/i.test(description || '')

  // 배송비 텍스트
  // sc_type: 1=무료, 2=조건부무료, 3=유료건당, 4=유료수량별
  const shippingText = (() => {
    if (scType === 1 || shippingFee === 0) return '무료배송'
    const feeStr = shippingFee.toLocaleString('ko-KR')
    if (freeShippingOver > 0) {
      const over = freeShippingOver.toLocaleString('ko-KR')
      return `${feeStr}원 (${over}원 이상 무료배송)`
    }
    return `${feeStr}원`
  })()

  const returnText =
    returnFee > 0 ? `반품 ${returnFee.toLocaleString('ko-KR')}원` : '반품 무료'

  // 카테고리 브레드크럼
  const breadcrumbs: { name: string; href?: string }[] = [
    { name: '홈', href: `/${locale}` },
    { name: '전체 상품', href: `/${locale}/products` },
  ]
  if (p.categoryName1) breadcrumbs.push({ name: p.categoryName1 })
  if (p.categoryName2) breadcrumbs.push({ name: p.categoryName2 })
  if (p.categoryName) breadcrumbs.push({ name: p.categoryName })

  // 원가
  const originalPrice = p.originalSupplyPrice || 0

  const productStatus = String(p.productStatus ?? '')
  const stock = Number(p.stockQty ?? 0)
  const rawOpts = ((p as { options?: unknown[] }).options ?? []) as Array<{
    name?: string
    optionValues?: unknown[]
  }>
  const hasColorOption = rawOpts.some(
    (o) => o?.name === 'Color' && Array.isArray(o?.optionValues) && o.optionValues.length > 0,
  )
  const hasSizeOption = rawOpts.some(
    (o) => o?.name === 'Size' && Array.isArray(o?.optionValues) && o.optionValues.length > 0,
  )

  return (
    <main className="container mt-5 lg:mt-8">
      {/* ── 카테고리 브레드크럼 ── */}
      <nav className="flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400 mb-5 flex-wrap">
        {breadcrumbs.map((bc, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <span className="text-neutral-300">/</span>}
            {bc.href ? (
              <Link
                href={bc.href}
                className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              >
                {bc.name}
              </Link>
            ) : (
              <span className="text-neutral-900 dark:text-neutral-100 font-medium">
                {bc.name}
              </span>
            )}
          </span>
        ))}
      </nav>

      {/* ── 상단 2단 레이아웃 ── */}
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
        {/* 좌: 이미지 갤러리 */}
        <div className="w-full lg:w-[55%]">
          <KoreanProductGallery images={allImages} />
        </div>

        {/* 우: 상품 정보 */}
        <div className="w-full lg:w-[45%]">
          <div className="sticky top-8 flex flex-col gap-4">
            {/* 브랜드 / 공급사 */}
            {(p.vendor || p.supplierName) && (
              <div className="flex items-center gap-2 flex-wrap">
                {p.vendor && (
                  <span className="text-sm font-semibold uppercase tracking-widest text-primary-600">
                    {p.vendor}
                  </span>
                )}
                {p.supplierName && p.supplierName !== p.vendor && (
                  <span className="text-xs text-neutral-400 border border-neutral-200 rounded px-2 py-0.5">
                    {p.supplierName}
                  </span>
                )}
              </div>
            )}

            {/* 상품명 */}
            <h1 className="text-2xl font-bold leading-snug sm:text-3xl">{title}</h1>

            {/* 별점 + 재고상태 */}
            <div className="flex items-center gap-3 flex-wrap">
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
              {p.stockQty === 0 && (
                <span className="text-xs bg-red-50 text-red-600 border border-red-200 rounded px-2 py-0.5">
                  품절
                </span>
              )}
              {p.stockQty > 0 && p.stockQty <= 10 && (
                <span className="text-xs bg-orange-50 text-orange-600 border border-orange-200 rounded px-2 py-0.5">
                  재고 {p.stockQty}개
                </span>
              )}
            </div>

            {/* 가격 */}
            <div className="flex items-end gap-3">
              <Prices contentClass="text-3xl font-bold" price={price || 0} />
              {originalPrice > 0 && originalPrice !== price && (
                <span className="text-base text-neutral-400 line-through mb-0.5">
                  {Number(originalPrice * 1.5).toLocaleString('ko-KR')}원
                </span>
              )}
            </div>

            <Divider />

            {/* 상품 기본 정보 표 */}
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {p.productCode && (
                    <tr className="border-b border-neutral-100 dark:border-neutral-700">
                      <td className="px-4 py-2.5 w-28 font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800">
                        상품코드
                      </td>
                      <td className="px-4 py-2.5 text-neutral-800 dark:text-neutral-200">
                        {p.productCode}
                      </td>
                    </tr>
                  )}
                  {p.vendor && (
                    <tr className="border-b border-neutral-100 dark:border-neutral-700">
                      <td className="px-4 py-2.5 w-28 font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800">
                        브랜드
                      </td>
                      <td className="px-4 py-2.5 text-neutral-800 dark:text-neutral-200">
                        {p.vendor}
                      </td>
                    </tr>
                  )}
                  {p.origin && (
                    <tr className="border-b border-neutral-100 dark:border-neutral-700">
                      <td className="px-4 py-2.5 w-28 font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800">
                        원산지
                      </td>
                      <td className="px-4 py-2.5 text-neutral-800 dark:text-neutral-200">
                        {p.origin}
                      </td>
                    </tr>
                  )}
                  <tr className="border-b border-neutral-100 dark:border-neutral-700">
                    <td className="px-4 py-2.5 w-28 font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800">
                      과세유형
                    </td>
                    <td className="px-4 py-2.5 text-neutral-800 dark:text-neutral-200">
                      {p.taxLabel || '과세 (10%)'}
                    </td>
                  </tr>
                  <tr className="border-b border-neutral-100 dark:border-neutral-700">
                    <td className="px-4 py-2.5 w-28 font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800">
                      최소주문
                    </td>
                    <td className="px-4 py-2.5 text-neutral-800 dark:text-neutral-200">
                      {p.minOrderQty || 1}개
                      {p.maxOrderQty ? ` / 최대 ${p.maxOrderQty}개` : ''}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ★ 옵션 + 수량 + 장바구니/바로구매 — productId + 배송비 정보 전달 */}
            <ProductActions
              productId={String(productId || handle)}
              options={p.options}
              price={price || 0}
              productName={title || ''}
              productImage={thumbImage}
              shippingFee={shippingFee}
              freeShippingOver={freeShippingOver}
              scType={scType}
              productStatus={productStatus}
              stock={stock}
              hasColorOption={hasColorOption}
              hasSizeOption={hasSizeOption}
              listingStatus={status}
            />

            <Divider />

            {/* 배송 안내 */}
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-neutral-100 dark:border-neutral-700">
                    <td className="px-4 py-2.5 w-28 font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800">
                      배송방법
                    </td>
                    <td className="px-4 py-2.5 text-neutral-800 dark:text-neutral-200">
                      일반배송 ({deliveryDays}일 이내)
                      {deliveryCompany ? ` · ${deliveryCompany}` : ''}
                    </td>
                  </tr>
                  <tr className="border-b border-neutral-100 dark:border-neutral-700">
                    <td className="px-4 py-2.5 w-28 font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800">
                      배송비
                    </td>
                    <td className="px-4 py-2.5 text-neutral-800 dark:text-neutral-200">
                      {shippingText}
                    </td>
                  </tr>
                  <tr className="border-b border-neutral-100 dark:border-neutral-700">
                    <td className="px-4 py-2.5 w-28 font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800">
                      반품/교환
                    </td>
                    <td className="px-4 py-2.5 text-neutral-800 dark:text-neutral-200">
                      {returnText} · 수령 후 30일 이내
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ── 하단: 탭 + 상세설명 + 리뷰 ── */}
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

        {/* 상세설명 */}
        {isHtmlDesc ? (
          <div
            className="prose prose-sm sm:prose max-w-none dark:prose-invert mx-auto w-full"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        ) : description ? (
          <div className="mx-auto w-full max-w-3xl">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              {description}
            </p>
          </div>
        ) : null}

        {/* 상세 이미지 (썸네일 제외 나머지) */}
        {allImages.length > 1 && (
          <div className="mt-8 flex flex-col items-center gap-0">
            {allImages.slice(1).map((src, idx) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={idx}
                src={src}
                alt={`상세 이미지 ${idx + 1}`}
                className="w-full max-w-3xl object-cover"
                loading="lazy"
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
              <span className="w-28 shrink-0 font-medium text-neutral-800 dark:text-neutral-200">
                배송방법
              </span>
              <span>
                일반택배 ({deliveryDays}일 이내 출발)
                {deliveryCompany ? ` · ${deliveryCompany}` : ''}
              </span>
            </div>
            <div className="flex gap-4">
              <span className="w-28 shrink-0 font-medium text-neutral-800 dark:text-neutral-200">
                배송비
              </span>
              <span>{shippingText}</span>
            </div>
            <div className="flex gap-4">
              <span className="w-28 shrink-0 font-medium text-neutral-800 dark:text-neutral-200">
                반품비용
              </span>
              <span>{returnText}</span>
            </div>
            <Divider />
            <div className="flex gap-4">
              <span className="w-28 shrink-0 font-medium text-neutral-800 dark:text-neutral-200">
                반품기한
              </span>
              <span>수령 후 30일 이내 (단순변심 포함)</span>
            </div>
            <div className="flex gap-4">
              <span className="w-28 shrink-0 font-medium text-neutral-800 dark:text-neutral-200">
                반품불가
              </span>
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
