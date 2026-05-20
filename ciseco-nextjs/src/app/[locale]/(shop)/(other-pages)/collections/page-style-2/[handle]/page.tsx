import { Divider } from '@/components/Divider'
import { FilterSortByMenuListBox } from '@/components/FilterSortByMenu'
import { FiltersMenuSidebar } from '@/components/FiltersMenu'
import ProductCard from '@/components/ProductCard'
import { getCollectionByHandle, getProducts } from '@/data/data'
import { PRODUCT_LIST_PAGE_SIZE } from '@/lib/product-list-constants'
import { normalizeProductSortParam } from '@/lib/product-list-sort'
import {
  Pagination,
  PaginationGap,
  PaginationList,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
} from '@/shared/Pagination/Pagination'
import { getPaginationItems } from '@/utils/paginationRange'

const PAGE_SIZE = PRODUCT_LIST_PAGE_SIZE

function collectionListQuery(page: number, sortRaw?: string) {
  const sort = normalizeProductSortParam(sortRaw)
  const q = new URLSearchParams()
  if (page > 1) q.set('page', String(page))
  q.set('sort', sort)
  return `?${q.toString()}`
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>
  searchParams: Promise<{ page?: string; sort?: string }>
}) {
  const { handle } = await params
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp?.page ?? '1', 10) || 1)

  const collection = await getCollectionByHandle(handle)
  const categoryId = collection?.id

  const { products, total, size, hasNext } = await getProducts({
    page,
    size: PAGE_SIZE,
    categoryId,
    sort: sp?.sort,
  })
  const totalPages =
    total > 0
      ? Math.max(1, Math.ceil(total / size))
      : hasNext
        ? Math.max(page + 1, page)
        : Math.max(1, page)
  const pageItems = getPaginationItems(page, totalPages)
  const showPagination =
    products.length > 0 && (page > 1 || hasNext || (total > 0 && total > size))

  return (
    <main>
      {/* LOOP ITEMS */}
      <div className="flex flex-col lg:flex-row">
        <div className="pr-4 lg:w-1/3 xl:w-1/4">
          <FiltersMenuSidebar />
        </div>

        <div className="mb-10 shrink-0 lg:mx-8 lg:mb-0"></div>

        <div className="flex-1">
          <div className="mb-8 flex flex-wrap items-center gap-2.5">
            <FilterSortByMenuListBox className="ml-auto" />
          </div>
          <Divider className="mb-8" />
          <div className="grid flex-1 grid-cols-2 gap-x-3 gap-y-10 sm:grid-cols-2 md:grid-cols-3 md:gap-x-5 xl:grid-cols-5 xl:gap-x-8 [&>*]:min-w-0">
            {products.map((item) => (
              <ProductCard data={item} key={item.id} />
            ))}
          </div>

          {showPagination && (
            <div className="mt-20 flex justify-start lg:mt-24">
              <Pagination className="">
                <PaginationPrevious href={page > 1 ? collectionListQuery(page - 1, sp?.sort) : null} />
                <PaginationList>
                  {pageItems.map((item, idx) =>
                    item === 'gap' ? (
                      <PaginationGap key={`gap-${idx}`} />
                    ) : (
                      <PaginationPage
                        key={item}
                        href={collectionListQuery(item as number, sp?.sort)}
                        current={item === page}
                      >
                        {item}
                      </PaginationPage>
                    )
                  )}
                </PaginationList>
                <PaginationNext
                  href={
                    page < totalPages || (total === 0 && hasNext)
                      ? collectionListQuery(page + 1, sp?.sort)
                      : null
                  }
                />
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
