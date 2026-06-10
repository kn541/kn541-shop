'use client'

/**
 * 상품 리스트 공용 페이지네이션 모듈
 *
 * 사용법:
 *   <ProductListPagination
 *     currentPage={currentPage}
 *     totalPages={totalPages}
 *     total={total}
 *   />
 *
 * - 현재 URL의 searchParams를 유지하면서 page만 변경
 * - Pagination 프리미티브 + getPaginationItems 활용
 * - totalPages <= 1 이면 자동 숨김
 * - 하단에 "N개 중 X–Y 표시" 텍스트 포함
 *
 * 주의: 페이지 이동 href는 next-intl Link(@/shared/link 기반 Pagination)로 렌더되어
 *   현재 locale이 자동 prefix 된다. 따라서 pathname은 next/navigation(=/ko/products,
 *   locale 포함)이 아니라 @/i18n/navigation의 usePathname(=/products, locale 미포함)을
 *   사용해야 한다. next/navigation을 쓰면 /ko/ko/products 처럼 locale이 이중 prefix되어
 *   2페이지 이후 404가 발생한다.
 */

import { useSearchParams } from 'next/navigation'
import { usePathname } from '@/i18n/navigation'
import {
  Pagination,
  PaginationGap,
  PaginationList,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
} from '@/shared/Pagination/Pagination'
import { getPaginationItems } from '@/utils/paginationRange'

interface Props {
  currentPage: number
  totalPages: number
  total: number
  pageSize?: number
  className?: string
}

export default function ProductListPagination({
  currentPage,
  totalPages,
  total,
  pageSize = 20,
  className = '',
}: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  const buildHref = (page: number): string => {
    const params = new URLSearchParams(searchParams.toString())
    if (page > 1) {
      params.set('page', String(page))
    } else {
      params.delete('page')
    }
    const qs = params.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }

  const pageItems = getPaginationItems(currentPage, totalPages)
  const from = (currentPage - 1) * pageSize + 1
  const to = Math.min(currentPage * pageSize, total)

  return (
    <div className={`mt-14 flex flex-col items-center gap-4 ${className}`}>
      <Pagination className="mx-auto">
        <PaginationPrevious
          href={currentPage > 1 ? buildHref(currentPage - 1) : null}
        />
        <PaginationList>
          {pageItems.map((item, idx) =>
            item === 'gap' ? (
              <PaginationGap key={`gap-${idx}`} />
            ) : (
              <PaginationPage
                key={item}
                href={buildHref(item as number)}
                current={item === currentPage}
              >
                {item}
              </PaginationPage>
            ),
          )}
        </PaginationList>
        <PaginationNext
          href={currentPage < totalPages ? buildHref(currentPage + 1) : null}
        />
      </Pagination>

      {total > 0 && (
        <p className="text-xs text-neutral-400">
          {total.toLocaleString('ko-KR')}개 중 {from.toLocaleString('ko-KR')}–
          {to.toLocaleString('ko-KR')} 표시
        </p>
      )}
    </div>
  )
}
