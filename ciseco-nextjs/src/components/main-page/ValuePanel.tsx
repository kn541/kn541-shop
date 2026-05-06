import { MainProductCard } from '@/components/main-page/MainProductCard'
import { MAIN_PAGE_ASSETS } from '@/data/main-page-assets'
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

const valueSamples = [...MAIN_PAGE_ASSETS.products, ...MAIN_PAGE_ASSETS.featured.best.slice(8, 10)]

export async function ValuePanel() {
  const t = await getTranslations('MainPage')

  return (
    <section className="product-section container mx-auto px-4 py-8 md:py-[34px] md:pb-[78px]">
      <div className="section-heading value-heading-mobile mb-5 flex items-start justify-between">
        <div>
          <p className="eyebrow mb-[7px] text-[28px] font-bold leading-none text-kn541-black">{t('valueEyebrow')}</p>
          <h2 className="m-0 text-[16px] font-normal leading-tight text-[#999]">{t('valueTitle')}</h2>
        </div>
        <a href="#" data-todo="route-tbd" className="flex items-center text-[20px] font-normal text-kn541-green">
          {t('viewAll')}
          <Chevron />
        </a>
        {/* TODO: 벨류업 페이지 신설 후 */}
      </div>
      <div className="two-column-products grid grid-cols-1 gap-[50px] lg:grid-cols-[280px_1fr]">
        <article
          className="value-panel relative min-h-[420px] overflow-hidden rounded-xl bg-kn541-green-light md:min-h-[600px] lg:min-h-[1047px]"
          style={{
            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.03)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={MAIN_PAGE_ASSETS.decorations.valuePanel}
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, rgba(11,24,0,0.4), rgba(120,120,120,0.2))',
            }}
          />
          <div className="absolute top-[120px] left-8 z-10 text-white md:top-[192px] md:left-8 [text-shadow:2px_2px_2px_rgba(0,0,0,0.25)]">
            <h2 className="text-[32px] font-semibold md:text-[38px]">{t('valuePanelHeading')}</h2>
            <p className="mt-5 whitespace-pre-line text-[18px] font-normal tracking-[-0.4px] md:mt-[22px] md:text-[20px]">
              {t('valuePanelCopy')}
            </p>
          </div>
        </article>
        <div className="best-grid small grid grid-cols-2 justify-center gap-x-[55px] gap-y-10 md:grid-cols-3">
          {valueSamples.slice(0, 6).map((src) => (
            <MainProductCard key={src} mode="placeholder" imageUrl={src} compact />
          ))}
        </div>
      </div>
    </section>
  )
}
