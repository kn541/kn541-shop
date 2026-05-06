import { MAIN_PAGE_ASSETS } from '@/data/main-page-assets'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'

export async function GiftBanner() {
  const t = await getTranslations('MainPage')

  return (
    <>
      <section className="container mx-auto px-4 pb-4 sm:hidden">
        <p className="mb-3 text-center text-sm font-medium" style={{ color: '#05C368' }}>
          {t('welcomePromoLine')}
        </p>
        <div className="relative aspect-[358/130] w-full overflow-hidden rounded-lg">
          <Image src={MAIN_PAGE_ASSETS.banners.gift} alt="" fill className="object-cover" sizes="100vw" />
        </div>
      </section>
      <section className="hidden sm:block">
        <div className="relative aspect-[1920/320] w-full">
          <Image
            src={MAIN_PAGE_ASSETS.banners.mobileGift}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
      </section>
    </>
  )
}
