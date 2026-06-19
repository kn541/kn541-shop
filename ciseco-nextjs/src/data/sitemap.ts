// KN541 쇼핑몰 — 사이트맵(바로가기) 데이터
// 상단 메뉴바 "바로가기" 메가메뉴(데스크톱) + 모바일 햄버거 사이드바에서 공통 사용.
// 라우트는 실제 존재하는 페이지 기준. locale prefix는 Link 컴포넌트가 자동 처리하므로 href에 미포함.
// 회원등급 노출 규칙은 (accounts)/PageTab.tsx 와 동일하게 맞춤(유료/일반 전용 항목).

export type SitemapVisibility = 'always' | 'paidOnly' | 'generalOnly'

export interface SitemapItem {
  label: string
  href: string
  /** 기본 always. paidOnly=유료회원만, generalOnly=일반회원만 노출 */
  visibility?: SitemapVisibility
}

export interface SitemapGroup {
  heading: string
  /** true면 로그인 후에만 의미있는 그룹(마이페이지). 비로그인 시 로그인 안내로 대체 */
  authOnly?: boolean
  items: SitemapItem[]
}

export interface SitemapContent {
  shortcut: string
  title: string
  loginPrompt: string
  loginCta: string
  groups: SitemapGroup[]
}

type Locale = 'ko' | 'en' | 'zh'

const SITEMAP: Record<Locale, SitemapContent> = {
  ko: {
    shortcut: '바로가기',
    title: '사이트맵',
    loginPrompt: '로그인 후 이용할 수 있습니다.',
    loginCta: '로그인',
    groups: [
      {
        heading: '쇼핑',
        items: [
          { label: '홈', href: '/' },
          { label: '전체 상품', href: '/products' },
          { label: '베스트', href: '/best' },
          { label: '신상품', href: '/new' },
          { label: '추천 상품', href: '/recommend' },
          { label: '사전예약', href: '/preorder' },
          { label: '벨류업', href: '/value-up' },
          { label: '장바구니', href: '/cart' },
        ],
      },
      {
        heading: '마이페이지',
        authOnly: true,
        items: [
          { label: '내 정보', href: '/account' },
          { label: '주문 내역', href: '/orders' },
          { label: '찜하기', href: '/account-wishlists' },
          { label: '포인트', href: '/points' },
          { label: '배당 현황', href: '/dividends', visibility: 'paidOnly' },
          { label: '쿠폰', href: '/coupons' },
          { label: '패키지상품', href: '/packages' },
          { label: '추천인 트리', href: '/tree', visibility: 'paidOnly' },
          { label: '내 쇼핑몰', href: '/myshop', visibility: 'paidOnly' },
          { label: '수동주문', href: '/myshop/proxy-order', visibility: 'paidOnly' },
          { label: '배송지 관리', href: '/addresses' },
          { label: '비밀번호 변경', href: '/account-password' },
          { label: '출금 신청', href: '/dividends', visibility: 'paidOnly' },
          { label: '유료회원 전환', href: '/packages', visibility: 'generalOnly' },
        ],
      },
      {
        heading: '고객센터·정보',
        items: [
          { label: '고객센터', href: '/cs' },
          { label: '자주 묻는 질문', href: '/faq' },
          { label: '문의하기', href: '/contact' },
          { label: '회사 소개', href: '/about' },
          { label: '입점 문의', href: '/vendor-inquiry' },
          { label: '블로그', href: '/blog' },
          { label: '이용약관', href: '/terms' },
          { label: '개인정보처리방침', href: '/privacy' },
        ],
      },
    ],
  },
  en: {
    shortcut: 'Quick links',
    title: 'Site map',
    loginPrompt: 'Please sign in to continue.',
    loginCta: 'Login',
    groups: [
      {
        heading: 'Shop',
        items: [
          { label: 'Home', href: '/' },
          { label: 'All products', href: '/products' },
          { label: 'Best sellers', href: '/best' },
          { label: 'New arrivals', href: '/new' },
          { label: 'Recommended', href: '/recommend' },
          { label: 'Pre-order', href: '/preorder' },
          { label: 'Value-up', href: '/value-up' },
          { label: 'Cart', href: '/cart' },
        ],
      },
      {
        heading: 'My page',
        authOnly: true,
        items: [
          { label: 'My profile', href: '/account' },
          { label: 'Orders history', href: '/orders' },
          { label: 'Favorites', href: '/account-wishlists' },
          { label: 'Points', href: '/points' },
          { label: 'Dividends', href: '/dividends', visibility: 'paidOnly' },
          { label: 'Coupons', href: '/coupons' },
          { label: 'Package products', href: '/packages' },
          { label: 'Referral tree', href: '/tree', visibility: 'paidOnly' },
          { label: 'My Shop', href: '/myshop', visibility: 'paidOnly' },
          { label: 'Proxy order', href: '/myshop/proxy-order', visibility: 'paidOnly' },
          { label: 'Addresses', href: '/addresses' },
          { label: 'Change password', href: '/account-password' },
          { label: 'Withdraw', href: '/dividends', visibility: 'paidOnly' },
          { label: 'Upgrade to paid member', href: '/packages', visibility: 'generalOnly' },
        ],
      },
      {
        heading: 'Support & info',
        items: [
          { label: 'Customer service', href: '/cs' },
          { label: 'FAQ', href: '/faq' },
          { label: 'Contact', href: '/contact' },
          { label: 'About', href: '/about' },
          { label: 'Vendor application', href: '/vendor-inquiry' },
          { label: 'Blog', href: '/blog' },
          { label: 'Terms of service', href: '/terms' },
          { label: 'Privacy policy', href: '/privacy' },
        ],
      },
    ],
  },
  zh: {
    shortcut: '快捷入口',
    title: '网站地图',
    loginPrompt: '请先登录。',
    loginCta: '登录',
    groups: [
      {
        heading: '购物',
        items: [
          { label: '首页', href: '/' },
          { label: '全部商品', href: '/products' },
          { label: '畅销商品', href: '/best' },
          { label: '新品', href: '/new' },
          { label: '推荐商品', href: '/recommend' },
          { label: '预售', href: '/preorder' },
          { label: '升值精选', href: '/value-up' },
          { label: '购物车', href: '/cart' },
        ],
      },
      {
        heading: '我的账户',
        authOnly: true,
        items: [
          { label: '我的信息', href: '/account' },
          { label: '历史订单', href: '/orders' },
          { label: '收藏夹', href: '/account-wishlists' },
          { label: '积分', href: '/points' },
          { label: '分红', href: '/dividends', visibility: 'paidOnly' },
          { label: '优惠券', href: '/coupons' },
          { label: '套餐商品', href: '/packages' },
          { label: '推荐树', href: '/tree', visibility: 'paidOnly' },
          { label: '我的店铺', href: '/myshop', visibility: 'paidOnly' },
          { label: '手动订单', href: '/myshop/proxy-order', visibility: 'paidOnly' },
          { label: '收货地址', href: '/addresses' },
          { label: '修改密码', href: '/account-password' },
          { label: '提现申请', href: '/dividends', visibility: 'paidOnly' },
          { label: '升级付费会员', href: '/packages', visibility: 'generalOnly' },
        ],
      },
      {
        heading: '客服与信息',
        items: [
          { label: '客服中心', href: '/cs' },
          { label: '常见问题', href: '/faq' },
          { label: '联系我们', href: '/contact' },
          { label: '关于我们', href: '/about' },
          { label: '入驻咨询', href: '/vendor-inquiry' },
          { label: '博客', href: '/blog' },
          { label: '服务条款', href: '/terms' },
          { label: '隐私政策', href: '/privacy' },
        ],
      },
    ],
  },
}

/** locale에 맞는 사이트맵 반환(미지원 locale은 ko 폴백) */
export function getSitemap(locale: string): SitemapContent {
  return SITEMAP[locale as Locale] ?? SITEMAP.ko
}
