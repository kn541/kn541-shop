import { MainProductCard } from '@/components/main-page/MainProductCard'
import { MAIN_PAGE_ASSETS } from '@/data/main-page-assets'
import { Link } from '@/shared/link'
import { getTranslations } from 'next-intl/server'

function ChevronMobile() {
  return (
    <svg width="9" height="15" viewBox="0 0 9 15" fill="none" className="inline md:hidden" aria-hidden>
      <path
        d="M0.25214 14.7653C0.10422 14.6148 0.0211353 14.4108 0.0211352 14.1981C0.0211352 13.9855 0.10422 13.7815 0.25214 13.631L6.27632 7.51016L0.252138 1.38932C0.148164 1.29123 0.0721541 1.16645 0.0321188 1.02814C-0.00791737 0.889838 -0.0104971 0.743121 0.0246506 0.603451C0.0597982 0.463779 0.131372 0.336325 0.231832 0.234519C0.332292 0.132712 0.457917 0.0603196 0.595473 0.0249707C0.732788 -0.0106719 0.877013 -0.00811705 1.01302 0.0323616C1.14903 0.0728403 1.27182 0.149752 1.36851 0.255037L7.95088 6.94302C8.0988 7.0935 8.18188 7.29748 8.18188 7.51016C8.18188 7.72284 8.0988 7.92682 7.95088 8.0773L1.36851 14.7653C1.22041 14.9156 1.01964 15 0.810325 15C0.601005 15 0.400244 14.9156 0.25214 14.7653Z"
        fill="#05C368"
      />
    </svg>
  )
}

function ChevronPc() {
  return (
    <svg width="6" height="10" viewBox="0 0 6 10" fill="none" className="hidden md:inline" aria-hidden>
      <path
        d="M0.168095 9.84353C0.0694816 9.74321 0.0140914 9.60722 0.0140914 9.46543C0.0140914 9.32365 0.0694815 9.18766 0.168095 9.08734L4.18422 5.00678L0.168093 0.926216C0.0987769 0.860818 0.048104 0.777635 0.0214135 0.685431C-0.00527694 0.593227 -0.00699663 0.495415 0.0164353 0.402302C0.0398673 0.309188 0.0875828 0.224219 0.154556 0.156348C0.221529 0.0884767 0.30528 0.040215 0.396984 0.016649C0.488527 -0.00711251 0.584677 -0.00541022 0.67535 0.0215756C0.766024 0.0485615 0.847881 0.0998365 0.912339 0.170026L5.30059 4.62868C5.3992 4.729 5.45459 4.86499 5.45459 5.00678C5.45459 5.14856 5.3992 5.28455 5.30059 5.38487L0.912341 9.84353C0.813605 9.94372 0.679764 10 0.540217 10C0.400671 10 0.26683 9.94372 0.168095 9.84353Z"
        fill="#05C368"
      />
    </svg>
  )
}

export async function NewProductsSection() {
  const t = await getTranslations('MainPage')

  return (
    <section className="product-section new-product-section container mx-auto px-4 py-8 md:py-[34px] md:pb-[78px]">
      <div className="section-heading mb-5 flex items-start justify-between">
        <div>
          <p className="eyebrow mb-[7px] text-[28px] font-bold leading-none tracking-[-0.02em] text-kn541-black">
            {t('newEyebrow')}
          </p>
          <h2 className="m-0 text-[16px] font-normal leading-tight text-[#999]">{t('newTitle')}</h2>
        </div>
        <Link href="/products" className="flex items-center gap-3 text-[20px] font-normal text-kn541-green">
          {t('viewAll')}
          <ChevronMobile />
          <ChevronPc />
        </Link>
      </div>
      <div className="slider-shell relative">
        <div
          className="product-rail flex gap-[53px] overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          data-rail
        >
          {[...MAIN_PAGE_ASSETS.products, ...MAIN_PAGE_ASSETS.featured.best.slice(0, 5)].map((src) => (
            <MainProductCard key={src} mode="placeholder" imageUrl={src} />
          ))}
        </div>
      </div>
    </section>
  )
}
