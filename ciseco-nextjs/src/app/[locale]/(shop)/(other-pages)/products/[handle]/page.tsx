// KN541 상품 상세 페이지
// fix: 탭 앵커 링크 전환 (클릭 시 해당 섹션으로 스크롤)
// fix: 연관 상품에서 현재 상품 제외
// fix: isSoldout prop 전달 (ProductActions Props 반영)

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
  } catch {}
  return { title: '상품 상세 | KN541', description: '상품 상세 페이지' }
}

export default async function Page({
  params,
}: {
  params: Promise<{ handle: string; locale: string }>
}) {
  const { handle, locale } = await params

  if (!UUID_RE.test(handle)) return notFound()

  let rawProduct
  try {
    rawProduct = await getProductById(handle)
  } catch {
    return notFound()
  }

  if (!rawProduct?.product_id) return notFound()

  const p = adaptProduct(rawProduct) as any

  // ★ 연관 상품 — 현재 상품 제외
  const allRelated = await getProducts({ size: 9 })
  const relatedProducts = allRelated.filter((r: any) => r.id !== p.id && r.handle !== handle).slice(0, 8)

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

  const deliveryInfo = p.delivery || {}
  const shippingFee = Number(deliveryInfo.shipping_fee ?? 0)
  const freeShippingOver = Number(deliveryInfo.free_over ?? 0)
  const scType = Number(deliveryInfo.sc_type ?? 1)
  const returnFee = Number(deliveryInfo.return_fee ?? 0)
  const deliveryDays = Number(deliveryInfo.delivery_days ?? 3)
  const deliveryCompany = deliveryInfo.delivery_company ?? null

  const allImages: string[] = [featuredImage, ...(images || [])]
    .map((i: any) => i?.src)
    .filter(Boolean)
    .filter((src: string, idx: number, arr: string[]) => arr.indexOf(src) === idx)

  const thumbImage = allImages[0] || ''

  const isHtmlDesc = /<[a-z][\s\S]*>/i.test(description || '')

  const shippingText = (() => {
    if (scType === 1 || shippingFee === 0) return '무료배송'
    const feeStr = shippingFee.toLocaleString('ko-KR')
    if (freeShippingOver > 0) return `${feeStr}원 (${freeShippingOver.toLocaleString('ko-KR')}원 이상 무료배송)`
    return `${feeStr}원`
  })()

  const returnText = returnFee > 0 ? `반품 ${returnFee.toLocaleString('ko-KR')}원` : '반품 무료'

  const breadcrumbs: { name: string; href?: string }[] = [
    { name: '홈', href: `/${locale}` },
    { name: '전체 상품', href: `/${locale}/products` },
  ]
  if (p.categoryName1) breadcrumbs.push({ name: p.categoryName1 })
  if (p.categoryName2) breadcrumbs.push({ name: p.categoryName2 })
  if (p.categoryName) breadcrumbs.push({ name: p.categoryName })

  const consumerPrice = Number(p.consumerPrice ?? p.consumer_price ?? 0)
  const salePrice = Number(price || 0)
  const discountRate = consumerPrice > 0 && consumerPrice > salePrice
    ? Math.round((consumerPrice - salePrice) / consumerPrice * 100)
    : 0

  const productStatus = String(p.productStatus ?? '')
  const stock = Number(p.stockQty ?? 0)
  const isSoldout = Boolean(p.isSoldout || p.is_soldout)
  const isDiscontinued = Boolean(p.isDiscontinued || p.is_discontinued)
  const isSoldoutOrUnavailable = isSoldout || isDiscontinued || stock <= 0 ||
    ['SOLDOUT', 'SOLD_OUT', 'DISCONTINUED', 'INACTIVE'].includes(productStatus.toUpperCase()) ||
    status === '품절' || status === 'Sold Out' || status === '판매종료'

  const rawOpts = ((p as { options?: unknown[] }).options ?? []) as Array<{
    name?: string
    optionValues?: unknown[]
  }>
  const hasColorOption = rawOpts.some(o => o?.name === 'Color' && Array.isArray(o?.optionValues) && o.optionValues.length > 0)
  const hasSizeOption  = rawOpts.some(o => o?.name === 'Size'  && Array.isArray(o?.optionValues) && o.optionValues.length > 0)

  // ★ 탭 목록 — id 기반 앵커 링크
  const TABS = [
    { label: '상품상세', href: '#product-detail' },
    { label: '리뷰',     href: '#reviews' },
    { label: '배송/교환/반품', href: '#delivery-info' },
  ]

  return (
    <main className="container mt-5 lg:mt-8">
      {/* 브레드크럼 */}
      <nav className="flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400 mb-5 flex-wrap">
        {breadcrumbs.map((bc, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <span className="text-neutral-300">/</span>}
            {bc.href ? (
              <Link href={bc.href} className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
                {bc.name}
              </Link>
            ) : (
              <span className="text-neutral-900 dark:text-neutral-100 font-medium">{bc.name}</span>
            )}
          </span>
        ))}
      </nav>

      {/* 2단 레이아웃 */}
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
        <div className="w-full lg:w-[55%]">
          <KoreanProductGallery images={allImages} />
        </div>

        <div className="w-full lg:w-[45%]">
          <div className="sticky top-8 flex flex-col gap-4">
            {(p.vendor || p.supplierName) && (
              <div className="flex items-center gap-2 flex-wrap">
                {p.vendor && (
                  <span className="text-sm font-semibold uppercase tracking-widest text-primary-600">{p.vendor}</span>
                )}
                {p.supplierName && p.supplierName !== p.vendor && (
                  <span className="text-xs text-neutral-400 border border-neutral-200 rounded px-2 py-0.5">{p.supplierName}</span>
                )}
              </div>
            )}

            <h1 className="text-2xl font-bold leading-snug sm:text-3xl">{title}</h1>

            <div className="flex items-center gap-3 flex-wrap">
              {reviewNumber > 0 && (
                <>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon key={i} className={`h-4 w-4 ${i < Math.round(rating || 0) ? 'text-yellow-400' : 'text-neutral-200'}`} />
                    ))}
                  </div>
                  <a href="#reviews" className="text-sm text-neutral-500 underline">{reviewNumber}개 리뷰</a>
                </>
              )}
              {isSoldoutOrUnavailable ? (
                <span className="text-xs bg-red-50 text-red-600 border border-red-200 rounded px-2 py-0.5 font-medium">
                  {isDiscontinued ? '판매종료' : '품절'}
                </span>
              ) : (
                <>
                  <ProductStatus status={status} />
                  {stock > 0 && stock <= 10 && (
                    <span className="text-xs bg-orange-50 text-orange-600 border border-orange-200 rounded px-2 py-0.5">
                      재고 {stock}개
                    </span>
                  )}
                </>
              )}
            </div>

            <div className="flex items-end gap-3">
              {discountRate > 0 && (
                <span className="text-2xl font-bold text-red-500">{discountRate}%</span>
              )}
              <Prices contentClass="text-3xl font-bold" price={salePrice} />
              {consumerPrice > 0 && consumerPrice > salePrice && (
                <span className="text-base text-neutral-400 line-through mb-0.5">
                  {consumerPrice.toLocaleString('ko-KR')}원
                </span>
              )}
            </div>

            <Divider />

            <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {p.vendor && (
                    <tr className="border-b border-neutral-100 dark:border-neutral-700">
                      <td className="px-4 py-2.5 w-28 font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800">브랜드</td>
                      <td className="px-4 py-2.5 text-neutral-800 dark:text-neutral-200">{p.vendor}</td>
                    </tr>
                  )}
                  {p.origin && (
                    <tr className="border-b border-neutral-100 dark:border-neutral-700">
                      <td className="px-4 py-2.5 w-28 font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800">원산지</td>
                      <td className="px-4 py-2.5 text-neutral-800 dark:text-neutral-200">{p.origin}</td>
                    </tr>
                  )}
                  {(p.minOrderQty > 1 || p.maxOrderQty) && (
                    <tr className="border-b border-neutral-100 dark:border-neutral-700">
                      <td className="px-4 py-2.5 w-28 font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800">최소주문</td>
                      <td className="px-4 py-2.5 text-neutral-800 dark:text-neutral-200">
                        {p.minOrderQty || 1}개{p.maxOrderQty ? ` / 최대 ${p.maxOrderQty}개` : ''}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ★ isSoldout prop 정상 전달 */}
            <ProductActions
              productId={String(productId || handle)}
              options={p.options}
              price={salePrice}
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
              isSoldout={isSoldoutOrUnavailable}
            />

            <Divider />

            <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-neutral-100 dark:border-neutral-700">
                    <td className="px-4 py-2.5 w-28 font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800">배송방법</td>
                    <td className="px-4 py-2.5 text-neutral-800 dark:text-neutral-200">
                      일반배송 ({deliveryDays}일 이내){deliveryCompany ? ` · ${deliveryCompany}` : ''}
                    </td>
                  </tr>
                  <tr className="border-b border-neutral-100 dark:border-neutral-700">
                    <td className="px-4 py-2.5 w-28 font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800">배송비</td>
                    <td className="px-4 py-2.5 text-neutral-800 dark:text-neutral-200">{shippingText}</td>
                  </tr>
                  <tr className="border-b border-neutral-100 dark:border-neutral-700">
                    <td className="px-4 py-2.5 w-28 font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800">반품/교환</td>
                    <td className="px-4 py-2.5 text-neutral-800 dark:text-neutral-200">{returnText} · 수령 후 30일 이내</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ★ 탭 — 앵커 링크 방식 (클릭 시 해당 섹션으로 스크롤) */}
      <div className="mt-16 flex flex-col gap-0 sm:mt-20">
        <nav className="flex gap-8 border-b border-neutral-200 dark:border-neutral-700 mb-10">
          {TABS.map((tab) => (
            <a
              key={tab.label}
              href={tab.href}
              className="pb-3 text-sm font-semibold text-neutral-400 hover:text-neutral-700 hover:border-b-2 hover:border-neutral-400 transition-colors dark:hover:text-neutral-300"
            >
              {tab.label}
            </a>
          ))}
        </nav>

        {/* 상품상세 섹션 */}
        <div id="product-detail">
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

          {allImages.length > 1 && (
            <div className="mt-8 flex flex-col items-center gap-0">
              {allImages.slice(1).map((src, idx) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={idx} src={src} alt={`상세 이미지 ${idx + 1}`}
                  className="w-full max-w-3xl object-cover" loading="lazy" />
              ))}
            </div>
          )}
        </div>

        <Divider className="mt-12 mb-12" />

        {/* 배송/교환/반품 섹션 */}
        <div id="delivery-info" className="mx-auto w-full max-w-3xl rounded-2xl bg-neutral-50 dark:bg-neutral-800 p-6 mb-12">
          <h3 className="mb-4 text-base font-bold">배송 / 교환 / 반품 안내</h3>
          <div className="flex flex-col gap-3 text-sm text-neutral-600 dark:text-neutral-400">
            <div className="flex gap-4">
              <span className="w-28 shrink-0 font-medium text-neutral-800 dark:text-neutral-200">배송방법</span>
              <span>일반택배 ({deliveryDays}일 이내 출발){deliveryCompany ? ` · ${deliveryCompany}` : ''}</span>
            </div>
            <div className="flex gap-4">
              <span className="w-28 shrink-0 font-medium text-neutral-800 dark:text-neutral-200">배송비</span>
              <span>{shippingText}</span>
            </div>
            <div className="flex gap-4">
              <span className="w-28 shrink-0 font-medium text-neutral-800 dark:text-neutral-200">반품비용</span>
              <span>{returnText}</span>
            </div>
            <Divider />
            <div className="flex gap-4">
              <span className="w-28 shrink-0 font-medium text-neutral-800 dark:text-neutral-200">반품기한</span>
              <span>수령 후 30일 이내 (단순변심 포함)</span>
            </div>
            <div className="flex gap-4">
              <span className="w-28 shrink-0 font-medium text-neutral-800 dark:text-neutral-200">반품불가</span>
              <span>사용/개봉, 파손·훼손, 주문 제작 상품</span>
            </div>
          </div>
        </div>

        {/* 리뷰 섹션 */}
        <div id="reviews" className="mb-12">
          <ProductReviews reviewNumber={reviewNumber || 0} rating={rating || 0} reviews={reviews} />
        </div>

        <Divider />

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
