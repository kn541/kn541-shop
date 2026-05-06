import { CategoryTiles } from '@/components/main-page/CategoryTiles'
import { getTranslations } from 'next-intl/server'

export async function WelcomeBanner() {
  const t = await getTranslations('MainPage')

  return (
    <section className="container mx-auto px-4 py-8">
      <div
        className="hidden items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium sm:flex"
        style={{ color: '#05C368', backgroundColor: 'rgba(5,195,104,0.08)' }}
      >
        <span>{t('welcomePromoLine')}</span>
      </div>
      <p className="mt-6 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500 sm:hidden">
        {t('welcomeEyebrow')}
      </p>
      <h2 className="mx-auto mt-2 max-w-xl text-center text-lg font-semibold text-neutral-900 sm:mt-8 sm:text-xl dark:text-neutral-100">
        {t('welcomeTitle')}
      </h2>
      <CategoryTiles />
    </section>
  )
}
