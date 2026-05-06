import { MainProductCard } from '@/components/main-page/MainProductCard'
import { MAIN_PAGE_ASSETS } from '@/data/main-page-assets'
import { getMainDisplayProducts } from '@/lib/api/products'
import { getTranslations } from 'next-intl/server'

function Chevron() {
  return (
    <svg width="6" height="10" viewBox="0 0 6 10" fill="none" aria-hidden className="inline ms-3">
      <path
        d="M0.168095 9.84353C0.0694818 9.74321 0.0140914 9.60722 0.0140914 9.46543C0.0140914 9.32365 0.0694817 9.18766 0.168095 9.08734L4.18422 5.00678L0.168093 0.926215C0.0987771 0.860817 0.048104 0.777634 0.0214135 0.68543C-0.00527695 0.593226 -0.00699691 0.495414 0.0164353 0.4023C0.0398671 0.309186 0.0875827 0.224218 0.154556 0.156347C0.221529 0.0884747 0.305279 0.040214 0.396984 0.0166478C0.488527 -0.00711398 0.584676 -0.00541072 0.67535 0.0215744C0.766024 0.0485606 0.847881 0.0998358 0.912339 0.170025L5.30059 4.62868C5.3992 4.729 5.45459 4.86499 5.45459 5.00678C5.45459 5.14856 5.3992 5.28455 5.30059 5.38487L0.912341 9.84353C0.813605 9.94372 0.679764 10 0.540217 10C0.400671 10 0.26683 9.94372 0.168095 9.84353Z"
        fill="#05C368"
      />
    </svg>
  )
}

export async function BestProducts() {
  const t = await getTranslations('MainPage')
  const images = MAIN_PAGE_ASSETS.featured.best
  const items = await getMainDisplayProducts('BEST')

  if (!items.length) {
    return null
  }

  return (
    <section
      className="best-section mt-7 py-16 pb-[84px]"
      style={{
        background: 'linear-gradient(180deg, var(--color-kn541-best-gradient-start, #c9e9aa) 0%, #fff 30%)',
      }}
    >
      <div className="best-inner container mx-auto px-4">
        <div className="best-heading mb-10 flex flex-col gap-6 md:mb-[52px] md:flex-row md:items-center md:justify-between md:gap-6">
          <div className="best-heading-text md:hidden">
            <p className="best-sub-title text-[55px] font-medium leading-none text-kn541-black">{t('bestEyebrow')}</p>
            <h2 className="best-title mt-2 text-[28px] font-semibold tracking-[-0.56px] text-kn541-black">
              {t('bestTitle')}
            </h2>
            <p className="best-description mt-2 text-[16px] font-normal tracking-[-0.32px] text-kn541-black">
              {t('bestDescription')}
            </p>
            <p className="mt-2 text-xs text-neutral-500">{t('bestPlaceholderNote')}</p>
          </div>
          <div className="section-heading hidden md:flex md:items-start md:justify-between md:gap-8">
            <div>
              <p className="eyebrow mb-[7px] text-[28px] font-bold leading-none text-kn541-black">{t('bestTitle')}</p>
              <p className="text-[16px] font-normal text-[#999]">{t('bestDescription')}</p>
              <p className="mt-2 text-xs text-neutral-500">{t('bestPlaceholderNote')}</p>
            </div>
            <a
              href="#"
              data-todo="route-tbd"
              className="flex items-center text-[20px] font-normal text-kn541-green"
            >
              {t('viewAll')}
              <Chevron />
            </a>
          </div>
          <div className="best-heading-image relative shrink-0 md:ml-auto md:min-h-[284px] md:w-[498px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[0]}
              alt=""
              className="aspect-[249/142] max-h-[284px] w-full max-w-[498px] object-contain md:mr-[106px]"
            />
          </div>
        </div>
        <div className="best-grid grid grid-cols-2 justify-center gap-x-[55px] gap-y-10 md:grid-cols-4">
          {items.slice(0, 10).map((p) => (
            <MainProductCard key={p.product_id} mode="api" product={p} compact />
          ))}
        </div>
        <button
          type="button"
          className="more-button mx-auto mt-12 flex h-[50px] w-full max-w-[500px] cursor-not-allowed items-center justify-center gap-2 rounded-[5px] border border-[#b5b5b5] text-[16px] font-normal text-kn541-black opacity-70"
          disabled
        >
          {t('bestLoadMore')}
        </button>
      </div>
    </section>
  )
}
