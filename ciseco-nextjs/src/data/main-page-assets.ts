/**
 * 메인페이지 이미지 자산 URL 매핑
 * - 동적: Supabase Storage `app` 버킷 `shop-main/` (업로드 스크립트와 동기)
 * - 정적: `public/images/main-v1/`
 *
 * 런타임 쇼핑몰 데이터는 FastAPI 경유 — 여기서는 정적 자산 경로만 제공.
 * TODO: 어드민 교체 이미지는 추후 system_codes 등으로 이전 가능.
 */

const STORAGE_BASE_FALLBACK =
  'https://vwlahtguyggrhvslabax.supabase.co/storage/v1/object/public/app/shop-main'

function storageBase(): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
  if (base) return `${base}/storage/v1/object/public/app/shop-main`
  return STORAGE_BASE_FALLBACK
}

const S = storageBase()

export const MAIN_PAGE_ASSETS = {
  banners: {
    box: `${S}/banners/banner-box.webp`,
    clock: `${S}/banners/banner-clock.webp`,
    gift: `${S}/banners/banner-gift.webp`,
    mobileGift: `${S}/banners/mobile-banner-gift.webp`,
  },
  heroes: {
    pc: [1, 2, 3, 4].map((i) => `${S}/heroes/hero-${i}.webp`),
    mobile: [1, 2, 3, 4].map((i) => `${S}/heroes/hero-mo-${i}.webp`),
  },
  featured: {
    best: Array.from({ length: 10 }, (_, i) => `${S}/featured/best-${i + 1}.webp`),
    figma: {
      rice: `${S}/featured/figma-card-rice.webp`,
      shampoo: `${S}/featured/figma-card-shampoo.webp`,
      blueBooks: `${S}/featured/figma-card-blue-books.webp`,
      orangeBooks: `${S}/featured/figma-card-orange-books.webp`,
      tumbler: `${S}/featured/figma-card-tumbler.webp`,
    },
  },
  categories: {
    best: `${S}/categories/cate-best.webp`,
    kn541: `${S}/categories/cate-kn541.webp`,
    mall: `${S}/categories/cate-mall.webp`,
    new: `${S}/categories/cate-new.webp`,
    office: `${S}/categories/cate-office.webp`,
    reserve: `${S}/categories/cate-reserve.webp`,
    value: `${S}/categories/cate-value.webp`,
  },
  products: [1, 2, 3, 4].map((i) => `${S}/products/product-${i}.webp`),
  decorations: {
    valuePanel: `${S}/decorations/value-panel.webp`,
  },

  icons: {
    base: '/images/main-v1/icons',
  },
  logos: {
    main: '/images/main-v1/logo.svg',
    mainRaster: '/images/main-v1/logo.webp',
    footer: '/images/main-v1/logo-footer.svg',
    footerRaster: '/images/main-v1/logo-footer.webp',
  },
  flags: {
    ko: '/images/main-v1/flags/flag-ko.png',
    en: '/images/main-v1/flags/flag-en.png',
    cn: '/images/main-v1/flags/flag-cn.png',
  },
} as const
