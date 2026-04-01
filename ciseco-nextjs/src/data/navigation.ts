/**
 * KN541 쇼핑몰 네비게이션 데이터
 * - 헤더 카테고리 드롭다운: API에서 동적 로드 (실패 시 더미 폴백)
 * - API 클라이언트: src/lib/api/categories.ts
 */

import { getRootCategories } from '@/lib/api/categories'

// 더미 카테고리 (폴백용)
const DUMMY_CATEGORIES = [
  { name: 'Jackets', handle: 'jackets', description: 'New items in 2025', icon: `<svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 16C15.866 16 19 12.866 19 9C19 5.13401 15.866 2 12 2C8.13401 2 5 5.13401 5 9C5 12.866 8.13401 16 12 16Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 16V22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 19H9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
  { name: 'T-Shirts', handle: 't-shirts', description: 'Perfect for gentlemen', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="size-8" width="24" height="24" color="currentColor" fill="none"><path d="M6 9V16.6841C6 18.4952 6 19.4008 6.58579 19.9635C7.89989 21.2257 15.8558 21.4604 17.4142 19.9635C18 19.4008 18 18.4952 18 16.6841V9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg>` },
  { name: 'Shoes', handle: 'shoes', description: 'The needs of sports', icon: `<svg xmlns="http://www.w3.org/2000/svg" class="size-8" viewBox="0 0 24 24" width="24" height="24" color="currentColor" fill="none"><path d="M19.1012 18H7.96299C5.02913 18 3.56221 18 2.66807 16.8828C0.97093 14.7623 2.9047 9.1238 4.07611 7C4.47324 9.4 8.56152 9.33333 10.0507 9C9.05852 7.00119 10.3831 6.33413 11.0453 6.00059L11.0465 6C14 9.5 20.3149 11.404 21.8624 15.2188C22.5309 16.8667 20.6262 18 19.1012 18Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>` },
  { name: 'Bags', handle: 'bags', description: 'Luxury and nobility', icon: `<svg xmlns="http://www.w3.org/2000/svg" class="size-8" viewBox="0 0 24 24" width="24" height="24" color="currentColor" fill="none"><path d="M19.1737 12.9256V12.12C19.1737 10.6492 19.1737 9.91383 18.7234 9.45691C18.2732 9 17.5485 9 16.0992 9H7.90077C6.45147 9 5.72682 9 5.27658 9.45691C4.82634 9.91383 4.82634 10.6492 4.82634 12.12V12.9256C4.82634 13.3018 4.82634 13.4899 4.79345 13.6739C4.76056 13.858 4.69549 14.0341 4.56534 14.3863L4.34812 14.9742C3.16867 18.166 2.57895 19.7619 3.34312 20.8809C4.1073 22 5.78684 22 9.14591 22H14.8541C18.2132 22 19.8927 22 20.6569 20.8809C21.4211 19.7619 20.8313 18.166 19.6519 14.9742L19.4347 14.3863C19.3045 14.0341 19.2394 13.858 19.2065 13.6739C19.1737 13.4899 19.1737 13.3018 19.1737 12.9256Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg>` },
  { name: 'Accessories', handle: 'accessories', description: 'Diamond always popular', icon: `<svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.7998 3.40005L7.19982 7.70005C7.09982 7.90005 6.99982 8.20005 6.89982 8.40005L5.19982 17C5.09982 17.6 5.39982 18.3 5.89982 18.6L11.1998 21.6C11.5998 21.8 12.2998 21.8 12.6998 21.6L17.9998 18.6C18.4998 18.3 18.7998 17.6 18.6998 17L16.9998 8.40005C16.9998 8.20005 16.7998 7.90005 16.6998 7.70005L13.0998 3.40005C12.4998 2.60005 11.4998 2.60005 10.7998 3.40005Z" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
]

const DEFAULT_ICON = `<svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`

export async function getNavigation(): Promise<TNavigationItem[]> {
  return [
    { id: '1', href: '/', name: 'Home' },
    { id: '2', href: '/collections/all', name: 'Shop' },
    { id: '3', href: '/collections/page-style-2/all', name: 'New Arrivals' },
    { id: '4', href: '/collections/all', name: 'Sale' },
    {
      id: '5', href: '/collections/all', name: 'Categories', type: 'mega-menu',
      children: [
        { id: '1', href: '/', name: 'Home Page', type: 'dropdown', children: [{ id: '1-1', href: '/', name: 'Home 1' }, { id: '1-2', href: '/home-2', name: 'Home 2' }, { id: '1-3', href: '/coming-soon', name: 'Coming Soon' }] },
        { id: '2', href: '/#', name: 'Shop Pages', type: 'dropdown', children: [{ id: '2-1', href: '/collections/all', name: 'Collection 1' }, { id: '2-2', href: '/collections/page-style-2/all', name: 'Collection 2' }, { id: '2-3', href: '/products/leather-tote-bag', name: 'Product 1' }, { id: '2-5', href: '/cart', name: 'Cart' }, { id: '2-6', href: '/checkout', name: 'Checkout' }, { id: '2-7', href: '/orders', name: 'Orders history' }] },
        { id: '3', href: '/#', name: 'Other Pages', type: 'dropdown', children: [{ id: '3-2', href: '/search', name: 'Search' }, { id: '3-4', href: '/account', name: 'Account' }, { id: '3-3', href: '/order-successful', name: 'Order Successful' }, { id: '3-5', href: '/orders', name: 'Orders history' }, { id: '3-6', href: '/orders/4657', name: 'Order detail' }] },
        { id: '4', href: '/#', name: 'Info Pages', type: 'dropdown', children: [{ id: '4-1', href: '/blog', name: 'Blog' }, { id: '4-3', href: '/about', name: 'About' }, { id: '4-4', href: '/contact', name: 'Contact' }, { id: '4-5', href: '/login', name: 'Login' }, { id: '4-6', href: '/signup', name: 'Signup' }] },
      ],
    },
    {
      id: '6', href: '/collections/all', name: 'Explore', type: 'dropdown',
      children: [
        { id: '3', href: '/collections/all', name: 'Collection pages', type: 'dropdown', children: [{ id: '3-1', href: '/collections/all', name: 'Collection 1' }, { id: '3-2', href: '/collections/page-style-2/all', name: 'Collection 2' }] },
        { id: '4', href: '/products/leather-tote-bag', name: 'Product Pages', type: 'dropdown', children: [{ id: '4-1', href: '/products/leather-tote-bag', name: 'Product 1' }, { id: '4-2', href: '/products/page-style-2/leather-tote-bag', name: 'Product 2' }] },
        { id: '5', href: '/cart', name: 'Cart Page' },
        { id: '6', href: '/checkout', name: 'Checkout' },
        { id: '7', href: '/orders', name: 'Orders' },
        { id: '8', href: '/search', name: 'Search Page' },
        { id: '9', href: '/account', name: 'Account Page' },
        { id: '10', href: '/blog', name: 'Blog Page', type: 'dropdown', children: [{ id: '10-1', href: '/blog', name: 'Blog Page' }, { id: '10-2', href: '/blog/graduation-dresses-style-guide', name: 'Blog Single' }] },
      ],
    },
  ]
}

export async function getNavMegaMenu(): Promise<TNavigationItem> {
  const navigation = await getNavigation()
  return navigation[4]
}

/**
 * 헤더 카테고리 드롭다운
 * API 성공 → 실제 KN541 카테고리 / 실패 → 더미 폴백
 */
export const getHeaderDropdownCategories = async () => {
  try {
    const categories = await getRootCategories()
    if (categories.length > 0) {
      return categories.slice(0, 8).map((cat) => ({
        name: cat.category_name,
        handle: cat.category_code,
        description: `${cat.category_name} 카테고리`,
        icon: DUMMY_CATEGORIES.find(
          (d) => d.name.toLowerCase() === cat.category_name.toLowerCase()
        )?.icon ?? DEFAULT_ICON,
      }))
    }
  } catch {
    // 폴백
  }
  return DUMMY_CATEGORIES
}

// ─── 타입 ────────────────────────────────────────────────────────
export type TNavigationItem = Partial<{
  id: string
  href: string
  name: string
  type?: 'dropdown' | 'mega-menu'
  isNew?: boolean
  children?: TNavigationItem[]
}>

export const getLanguages = async () => [
  { id: 'Korean', name: '한국어', description: 'Korea', href: '#', active: true },
  { id: 'English', name: 'English', description: 'United State', href: '#' },
]

export const getCurrencies = async () => [
  {
    id: 'KRW', name: 'KRW', href: '#', active: true,
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="#000000" fill="none"><path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#000000" strokeWidth="1.5"></path><path d="M9 8L12 16L15 8M8 11H16" stroke="#000000" strokeWidth="1.5" strokeLinecap="round"></path></svg>`,
  },
  {
    id: 'USD', name: 'USD', href: '#',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="#000000" fill="none"><path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#000000" strokeWidth="1.5"></path><path d="M14.7102 10.0611C14.6111 9.29844 13.7354 8.06622 12.1608 8.06619C10.3312 8.06616 9.56136 9.07946 9.40515 9.58611C9.16145 10.2638 9.21019 11.6571 11.3547 11.809C14.0354 11.999 15.1093 12.3154 14.9727 13.956C14.836 15.5965 13.3417 15.951 12.1608 15.9129C10.9798 15.875 9.04764 15.3325 8.97266 13.8733M11.9734 6.99805V8.06982M11.9734 15.9031V16.998" stroke="#000000" strokeWidth="1.5" strokeLinecap="round"></path></svg>`,
  },
]
