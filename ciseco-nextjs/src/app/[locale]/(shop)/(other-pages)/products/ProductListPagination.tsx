'use client'

import {
  Pagination,
  PaginationGap,
  PaginationList,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
} from '@/shared/Pagination/Pagination'
import { getPaginationItems } from '@/utils/paginationRange'

type Props = {
  page: number
  pageSize: number
  total: number
  hasNext: boolean
  pathname: string
  searchParamsString: string
}

function hrefForPage(pathname: string, sp: string, page: number): string {
  const p = new URLSearchParams(sp)
  if (page <= 1) p.delete('page')
  else p.set('page', String(page))
  const qs = p.toString()
  return qs ? `${pathname}?${qs}` : pathname
}

/**
 * total>0 이면 정확한 totalPages.
 * total===0(카운트 생략)이면 has_next 기반으로 최소 totalPages 추정.
 */
function resolveTotalPages(page: number, pageSize: number, total: number, hasNext: boolean): number {
  if (total > 0) return Math.max(1, Math.ceil(total / pageSize))
  if (hasNext) return Math.max(page + 1, page)
  return Math.max(1, page)
}

export default function ProductListPagination({
  page,
  pageSize,
  total,
  hasNext,
  pathname,
  searchParamsString,
}: Props) {
  const totalPages = resolveTotalPages(page, pageSize, total, hasNext)
  if (totalPages <= 1 && page <= 1 && !hasNext) return null

  const pageItems = getPaginationItems(page, totalPages)

  return (
    <div className="mt-12 flex justify-center lg:mt-16">
      <Pagination className="mx-auto">
        <PaginationPrevious href={page > 1 ? hrefForPage(pathname, searchParamsString, page - 1) : null} />
        <PaginationList>
          {pageItems.map((item, idx) =>
            item === 'gap' ? (
              <PaginationGap key={`gap-${idx}`} />
            ) : (
              <PaginationPage
                key={item}
                href={hrefForPage(pathname, searchParamsString, item)}
                current={item === page}
              >
                {item}
              </PaginationPage>
            ),
          )}
        </PaginationList>
        <PaginationNext
          href={(() => {
            const canNext = total > 0 ? page < totalPages : hasNext
            return canNext ? hrefForPage(pathname, searchParamsString, page + 1) : null
          })()}
        />
      </Pagination>
    </div>
  )
}
