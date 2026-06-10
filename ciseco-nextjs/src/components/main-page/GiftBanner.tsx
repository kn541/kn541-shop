import { MAIN_PAGE_ASSETS } from '@/data/main-page-assets'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'

// 메인 프로모 배너(PC) — Supabase Storage 호스팅 이미지(1350×180, 7.5:1)
const PC_PROMO_BANNER_URL =
  'https://ghtkropmnrelkxivzpim.supabase.co/storage/v1/object/public/site-design/main_promo_banner.png'

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
      {/* PC — promo-strip-pc (Supabase 배너, 가로 꽉 채움(object-cover). 양끝 그라데이션이라 잘려도 자연스러움) */}
      <section className="promo-strip-pc relative hidden w-full md:block">
        <div
          className="relative mx-auto h-[170px] w-full overflow-hidden"
          style={{ backgroundColor: '#7ef06a' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={PC_PROMO_BANNER_URL}
            alt="가치 소비의 지름길, 월 사전예약 상품 OPEN!"
            className="h-full w-full object-cover object-center"
            loading="lazy"
          />
        </div>
      </section>
    </>
  )
}
