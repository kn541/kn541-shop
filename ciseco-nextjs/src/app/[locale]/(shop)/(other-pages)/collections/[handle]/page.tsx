import { Divider } from '@/components/Divider'
import { FilterSortByMenuListBox } from '@/components/FilterSortByMenu'
import { FiltersMenuTabs } from '@/components/FiltersMenu'
import ProductCard from '@/components/ProductCard'
import { getCollectionByHandle, getProducts } from '@/data/data'
import {
  Pagination,
  PaginationGap,
  PaginationList,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
} from '@/shared/Pagination/Pagination'
import { getPaginationItems } from '@/utils/paginationRange'

const PAGE_SIZE = 20

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { handle } = await params
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp?.page ?? '1', 10) || 1)

  const collection = await getCollectionByHandle(handle)
  const categoryId = collection?.id

  const { products, total, size } = await getProducts({
    page,
    size: PAGE_SIZE,
    categoryId,
  })
  const totalPages = Math.ceil(total / size)
  const pageItems = getPaginationItems(page, totalPages)

  return (
    <main>
      {/* TABS FILTER */}
      <div className="flex flex-wrap items-center gap-2.5">
        <FiltersMenuTabs />
        <FilterSortByMenuListBox className="ml-auto" />
      </div>

      <Divider className="mt-8" />

      {/* LOOP ITEMS */}
      <div className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3 xl:grid-cols-4">
        {products?.map((produc) => <ProductCard data={produc} key={produc.id} />)}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="mt-20 flex justify-center lg:mt-24">
          <Pagination className="mx-auto">
            <PaginationPrevious href={page > 1 ? `?page=${page - 1}` : null} />
            <PaginationList>
              {pageItems.map((item, idx) =>
                item === 'gap' ? (
                  <PaginationGap key={`gap-${idx}`} />
                ) : (
                  <PaginationPage key={item} href={`?page=${item}`} current={item === page}>
                    {item}
                  </PaginationPage>
                )
              )}
            </PaginationList>
            <PaginationNext href={page < totalPages ? `?page=${page + 1}` : null} />
          </Pagination>
        </div>
      )}
    </main>
  )
}
