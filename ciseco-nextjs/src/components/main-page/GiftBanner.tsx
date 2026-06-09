import { MAIN_PAGE_ASSETS } from '@/data/main-page-assets'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'

export async function GiftBanner() {
  const t = await getTranslations('MainPage')

  return (
    <>
      {/* 모바일 — promo-strip (디자인 정합성 v1 §8-3) */}
      <section
        className="promo-strip container relative mx-auto mb-[41px] mt-[62px] flex h-[70px] items-center justify-between px-4 md:hidden"
        style={{
          background: 'linear-gradient(90deg, var(--color-kn541-promo-start, #00eb7a) 0%, var(--color-kn541-promo-end, #c0ff91) 100%)',
        }}
      >
        <p className="m-0 max-w-[55%] text-[14px] font-bold leading-tight text-kn541-black sm:text-[20px]">
          {t('welcomePromoLine')}
        </p>
        <div className="promo-images relative flex h-[70px] w-[min(360px,45vw)] shrink-0 items-center">
          <Image
            src={MAIN_PAGE_ASSETS.banners.gift}
            alt=""
            fill
            className="object-contain object-right"
            sizes="200px"
          />
        </div>
      </section>
      {/* PC — promo-strip-pc (디자인 1920×320 → 고정 320px, 초광폭에서 aspect 비율 확대 방지) */}
      <section className="promo-strip-pc relative hidden w-full md:block">
        <div className="relative mx-auto h-[320px] max-h-[320px] w-full max-w-[1920px] overflow-hidden">
          <Image
            src={MAIN_PAGE_ASSETS.banners.mobileGift}
            alt=""
            fill
            className="object-cover object-center"
            sizes="(max-width: 1920px) 100vw, 1920px"
            priority={false}
          />
        </div>
      </section>
    </>
  )
}
