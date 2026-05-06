/**
 * 메인페이지 이미지 자산 URL 매핑
 * - 동적: Supabase Storage `main` 버킷의 `main/` 폴더 (플랫 구조)
 * - 정적: `public/images/main-v1/`
 *
 * 런타임 쇼핑몰 데이터는 FastAPI 경유 — 여기서는 정적 자산 경로만 제공.
 * TODO: 어드민 교체 이미지는 추후 system_codes 등으로 이전 가능.
 */

const STORAGE_BASE_FALLBACK =
  'https://ghtkropmnrelkxivzpim.supabase.co/storage/v1/object/public/main/main'

function storageBase(): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
  if (base) return `${base}/storage/v1/object/public/main/main`
  return STORAGE_BASE_FALLBACK
}

const S = storageBase()

export const MAIN_PAGE_ASSETS = {
  banners: {
    box: `${S}/banner-box.png`,
    clock: `${S}/banner-clock.png`,
    gift: `${S}/banner-gift.png`,
    mobileGift: `${S}/mobile-banner-gift.png`,
  },
  heroes: {
    pc: [1, 2, 3, 4].map((i) => `${S}/hero-${i}.png`),
    mobile: [1, 2, 3, 4].map((i) => `${S}/hero-mo-${i}.png`),
  },
  featured: {
    best: Array.from({ length: 10 }, (_, i) => `${S}/best-${i + 1}.png`),
    figma: {
      rice: `${S}/figma-card-rice.png`,
      shampoo: `${S}/figma-card-shampoo.png`,
      blueBooks: `${S}/figma-card-blue-books.png`,
      orangeBooks: `${S}/figma-card-orange-books.png`,
      tumbler: `${S}/figma-card-tumbler.png`,
    },
  },
  categories: {
    best: `${S}/cate-best.png`,
    kn541: `${S}/cate-kn541.png`,
    mall: `${S}/cate-mall.png`,
    new: `${S}/cate-new.png`,
    office: `${S}/cate-office.png`,
    reserve: `${S}/cate-reserve.png`,
    value: `${S}/cate-value.png`,
  },
  products: [1, 2, 3, 4].map((i) => `${S}/product-${i}.png`),
  decorations: {
    valuePanel: `${S}/value-panel.png`,
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
