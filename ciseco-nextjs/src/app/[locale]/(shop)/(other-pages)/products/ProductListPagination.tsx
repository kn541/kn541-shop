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

// 지원 locale (i18n/routing.ts와 동일). 페이지네이션 href는 next-intl Link로 렌더되어
// 현재 locale이 자동 prefix 되므로, 부모가 넘긴 pathname(next/navigation 기준,
// 예: /ko/products)에서 맨 앞 locale 세그먼트를 제거해 locale 미포함 경로(/products)로
// 만들어야 한다. 제거하지 않으면 /ko/ko/products 처럼 이중 prefix되어 2페이지 이후 404.
const LOCALES = ['ko', 'en', 'zh']

function stripLocale(pathname: string): string {
  const segs = pathname.split('/')
  // segs[0]은 빈 문자열(맨 앞 '/'), segs[1]이 첫 경로 세그먼트
  if (segs.length > 1 && LOCALES.includes(segs[1])) {
    const rest = '/' + segs.slice(2).join('/')
    return rest === '/' ? '/' : rest.replace(/\/$/, '')
  }
  return pathname
}

function hrefForPage(pathname: string, sp: string, page: number): string {
  const base = stripLocale(pathname)
  const p = new URLSearchParams(sp)
  if (page <= 1) p.delete('page')
  else p.set('page', String(page))
  const qs = p.toString()
  return qs ? `${base}?${qs}` : base
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
