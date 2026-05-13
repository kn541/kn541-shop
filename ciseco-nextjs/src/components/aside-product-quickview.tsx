import ProductQuickView from './ProductQuickView'
import { Aside } from './aside/aside'

interface Props {
  className?: string
}

const AsideProductQuickView = async ({ className }: Props) => {
  return (
    <Aside openFrom="right" showHeading={false} showCloseButton type="product-quick-view" contentMaxWidthClassName="max-w-[var(--container-kn541)]">
      <div className="flex h-full flex-col">
        <div className="hidden-scrollbar flex-1 overflow-x-hidden overflow-y-auto py-8">
          <ProductQuickView />
        </div>
      </div>
    </Aside>
  )
}

export default AsideProductQuickView
