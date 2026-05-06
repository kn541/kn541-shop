import { MainProductCard } from '@/components/main-page/MainProductCard'
import { MAIN_PAGE_ASSETS } from '@/data/main-page-assets'
import { Link } from '@/shared/link'
import { getTranslations } from 'next-intl/server'

function Chevron() {
  return (
    <svg width="6" height="10" viewBox="0 0 6 10" fill="none" aria-hidden className="inline ms-1">
      <path
        d="M0.168095 9.84353C0.0694818 9.74321 0.0140914 9.60722 0.0140914 9.46543C0.0140914 9.32365 0.0694817 9.18766 0.168095 9.08734L4.18422 5.00678L0.168093 0.926215C0.0987771 0.860817 0.048104 0.777634 0.0214135 0.68543C-0.00527695 0.593226 -0.00699691 0.495414 0.0164353 0.4023C0.0398671 0.309186 0.0875827 0.224218 0.154556 0.156347C0.221529 0.0884747 0.305279 0.040214 0.396984 0.0166478C0.488527 -0.00711398 0.584676 -0.00541072 0.67535 0.0215744C0.766024 0.0485606 0.847881 0.0998358 0.912339 0.170025L5.30059 4.62868C5.3992 4.729 5.45459 4.86499 5.45459 5.00678C5.45459 5.14856 5.3992 5.28455 5.30059 5.38487L0.912341 9.84353C0.813605 9.94372 0.679764 10 0.540217 10C0.400671 10 0.26683 9.94372 0.168095 9.84353Z"
        fill="#05C368"
      />
    </svg>
  )
}

export async function ReserveSection() {
  const t = await getTranslations('MainPage')

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#05C368' }}>
            {t('reserveEyebrow')}
          </p>
          <h2 className="mt-1 text-lg font-semibold text-neutral-900 sm:text-xl dark:text-neutral-100">
            {t('reserveTitle')}
          </h2>
        </div>
        <Link
          href="/products?product_type=002"
          className="hidden items-center text-sm font-medium sm:inline-flex"
          style={{ color: '#05C368' }}
        >
          {t('viewAll')}
          <Chevron />
        </Link>
      </div>
      <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">{t('reserveCountdownHint')}</p>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        {MAIN_PAGE_ASSETS.products.map((src) => (
          <MainProductCard key={src} mode="placeholder" imageUrl={src} />
        ))}
      </div>
      <Link
        href="/products?product_type=002"
        className="mt-4 flex items-center justify-center text-sm font-medium sm:hidden"
        style={{ color: '#05C368' }}
      >
        {t('viewAll')}
        <Chevron />
      </Link>
    </section>
  )
}
