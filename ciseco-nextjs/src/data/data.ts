/**
 * KN541 쇼핑몰 데이터 레이어
 * - NEXT_PUBLIC_API_URL 설정 시 실제 KN541 API 호출
 * - 미설정 또는 API 오류 시 더미데이터로 자동 폴백
 * - API 클라이언트: src/lib/api/ (products.ts, categories.ts)
 * - 어댑터: src/lib/adapters.ts
 */

import collectionImage1 from '@/images/collections/1.png'
import collectionImage2 from '@/images/collections/2.png'
import collectionImage3 from '@/images/collections/3.png'
import collectionImage4 from '@/images/collections/4.png'
import collectionImage5 from '@/images/collections/5.png'
import collectionImage6 from '@/images/collections/6.png'
import collectionImage7 from '@/images/collections/7.png'
import boothImage1 from '@/images/collections/booth1.png'
import boothImage2 from '@/images/collections/booth2.png'
import boothImage3 from '@/images/collections/booth3.png'
import boothImage4 from '@/images/collections/booth4.png'
import productImage1_1 from '@/images/products/p1-1.jpg'
import productImage1_2 from '@/images/products/p1-2.jpg'
import productImage1_3 from '@/images/products/p1-3.jpg'
import productImage1 from '@/images/products/p1.jpg'
import productImage2_1 from '@/images/products/p2-1.jpg'
import productImage2_2 from '@/images/products/p2-2.jpg'
import productImage2_3 from '@/images/products/p2-3.jpg'
import productImage2 from '@/images/products/p2.jpg'
import productImage3_1 from '@/images/products/p3-1.jpg'
import productImage3_2 from '@/images/products/p3-2.jpg'
import productImage3_3 from '@/images/products/p3-3.jpg'
import productImage3 from '@/images/products/p3.jpg'
import productImage4_1 from '@/images/products/p4-1.jpg'
import productImage4_2 from '@/images/products/p4-2.jpg'
import productImage4_3 from '@/images/products/p4-3.jpg'
import productImage4 from '@/images/products/p4.jpg'
import productImage5_1 from '@/images/products/p5-1.jpg'
import productImage5_2 from '@/images/products/p5-2.jpg'
import productImage5_3 from '@/images/products/p5-3.jpg'
import productImage5 from '@/images/products/p5.jpg'
import productImage6_1 from '@/images/products/p6-1.jpg'
import productImage6_2 from '@/images/products/p6-2.jpg'
import productImage6_3 from '@/images/products/p6-3.jpg'
import productImage6 from '@/images/products/p6.jpg'
import productImage7_1 from '@/images/products/p7-1.jpg'
import productImage7_2 from '@/images/products/p7-2.jpg'
import productImage7_3 from '@/images/products/p7-3.jpg'
import productImage7 from '@/images/products/p7.jpg'
import productImage8_1 from '@/images/products/p8-1.jpg'
import productImage8_2 from '@/images/products/p8-2.jpg'
import productImage8_3 from '@/images/products/p8-3.jpg'
import productImage8 from '@/images/products/p8.jpg'
import avatarImage1 from '@/images/users/avatar1.jpg'
import avatarImage2 from '@/images/users/avatar2.jpg'
import avatarImage3 from '@/images/users/avatar3.jpg'
import avatarImage4 from '@/images/users/avatar4.jpg'
import { shuffleArray } from '@/utils/shuffleArray'
import { adaptCategories, adaptCategory, adaptProduct, adaptProducts } from '@/lib/adapters'
import {
  getCategories,
  getCategoryById,
  getRootCategories,
} from '@/lib/api/categories'
import {
  getBestProducts,
  getNewProducts,
  getProductById,
  getProducts as apiGetProducts,
  getProductsByCategory,
} from '@/lib/api/products'

// ─── 더미 상품 데이터 (폴백용) ───────────────────────────────────
function getDummyProducts() {
  return [
    {
      id: 'gid://1001',
      title: 'Leather Tote Bag',
      handle: 'leather-tote-bag',
      createdAt: '2025-05-06T10:00:00-04:00',
      vendor: 'LuxCouture',
      price: 85,
      featuredImage: { src: productImage1.src, width: productImage1.width, height: productImage1.height, alt: 'Leather Tote Bag' },
      images: [
        { src: productImage1.src, width: productImage1.width, height: productImage1.height, alt: 'Leather Tote Bag' },
        { src: productImage1_1.src, width: productImage1_1.width, height: productImage1_1.height, alt: 'Leather Tote Bag' },
        { src: productImage1_2.src, width: productImage1_2.width, height: productImage1_2.height, alt: 'Leather Tote Bag' },
        { src: productImage1_3.src, width: productImage1_3.width, height: productImage1_3.height, alt: 'Leather Tote Bag' },
      ],
      reviewNumber: 87, rating: 4.5, status: 'New in',
      options: [
        { name: 'Color', optionValues: [{ name: 'Black', swatch: { color: '#000000', image: null } }, { name: 'Pink Yarrow', swatch: { color: 'oklch(42.1% 0.095 57.708)', image: null } }, { name: 'indigo', swatch: { color: '#D1C9C1', image: null } }, { name: 'Stone', swatch: { color: '#f7e3d4', image: null } }] },
        { name: 'Size', optionValues: [{ swatch: null, name: 'XXS' }, { swatch: null, name: 'XS' }, { swatch: null, name: 'M' }, { swatch: null, name: 'L' }, { swatch: null, name: 'XL' }] },
      ],
      selectedOptions: [{ name: 'Color', value: 'Pink Yarrow' }, { name: 'Size', value: 'XS' }],
    },
    {
      id: 'gid://1002', title: 'Silk Midi Dress', handle: 'silk-midi-dress', createdAt: '2025-05-07T09:30:00-04:00', vendor: 'ChicElegance', price: 120,
      featuredImage: { src: productImage2.src, width: productImage2.width, height: productImage2.height, alt: 'Silk Midi Dress' },
      images: [{ src: productImage2.src, width: productImage2.width, height: productImage2.height, alt: 'Silk Midi Dress' }, { src: productImage2_1.src, width: productImage2_1.width, height: productImage2_1.height, alt: 'Silk Midi Dress' }, { src: productImage2_2.src, width: productImage2_2.width, height: productImage2_2.height, alt: 'Silk Midi Dress' }, { src: productImage2_3.src, width: productImage2_3.width, height: productImage2_3.height, alt: 'Silk Midi Dress' }],
      reviewNumber: 95, rating: 4.7, status: 'Best Seller',
      options: [{ name: 'Color', optionValues: [{ name: 'Emerald Green', swatch: { color: '#2E8B57', image: null } }, { name: 'Ivory', swatch: { color: 'oklch(84.1% 0.238 128.85)', image: null } }, { name: 'Navy Blue', swatch: { color: '#000080', image: null } }, { name: 'Coral', swatch: { color: '#FF7F50', image: null } }] }, { name: 'Size', optionValues: [{ swatch: null, name: 'XS' }, { swatch: null, name: 'S' }, { swatch: null, name: 'M' }, { swatch: null, name: 'L' }] }],
      selectedOptions: [{ name: 'Color', value: 'Emerald Green' }, { name: 'Size', value: 'S' }],
    },
    {
      id: 'gid://1003', title: 'Denim Jacket', handle: 'denim-jacket', createdAt: '2025-05-08T11:15:00-04:00', vendor: 'UrbanTrend', price: 65,
      featuredImage: { src: productImage3.src, width: productImage3.width, height: productImage3.height, alt: 'Denim Jacket' },
      images: [{ src: productImage3.src, width: productImage3.width, height: productImage3.height, alt: 'Denim Jacket' }, { src: productImage3_1.src, width: productImage3_1.width, height: productImage3_1.height, alt: 'Denim Jacket' }, { src: productImage3_2.src, width: productImage3_2.width, height: productImage3_2.height, alt: 'Denim Jacket' }, { src: productImage3_3.src, width: productImage3_3.width, height: productImage3_3.height, alt: 'Denim Jacket' }],
      reviewNumber: 120, rating: 4.3, status: 'New in',
      options: [{ name: 'Color', optionValues: [{ name: 'Light Blue', swatch: { color: '#ADD8E6', image: null } }, { name: 'Dark Blue', swatch: { color: '#00008B', image: null } }, { name: 'Black', swatch: { color: '#000000', image: null } }] }, { name: 'Size', optionValues: [{ swatch: null, name: 'S' }, { swatch: null, name: 'M' }, { swatch: null, name: 'L' }, { swatch: null, name: 'XL' }] }],
      selectedOptions: [{ name: 'Color', value: 'Light Blue' }, { name: 'Size', value: 'M' }],
    },
    {
      id: 'gid://1004', title: 'Cashmere Sweater', handle: 'cashmere-sweater', createdAt: '2025-05-09T14:20:00-04:00', vendor: 'SoftLux', price: 150,
      featuredImage: { src: productImage4.src, width: productImage4.width, height: productImage4.height, alt: 'Cashmere Sweater' },
      images: [{ src: productImage4.src, width: productImage4.width, height: productImage4.height, alt: 'Cashmere Sweater' }, { src: productImage4_1.src, width: productImage4_1.width, height: productImage4_1.height, alt: 'Cashmere Sweater' }, { src: productImage4_2.src, width: productImage4_2.width, height: productImage4_2.height, alt: 'Cashmere Sweater' }, { src: productImage4_3.src, width: productImage4_3.width, height: productImage4_3.height, alt: 'Cashmere Sweater' }],
      reviewNumber: 75, rating: 4.8, status: 'Limited Edition',
      options: [{ name: 'Color', optionValues: [{ name: 'Charcoal', swatch: { color: '#36454F', image: null } }, { name: 'Cream', swatch: { color: 'oklch(81% 0.117 11.638)', image: null } }, { name: 'Burgundy', swatch: { color: '#800020', image: null } }] }, { name: 'Size', optionValues: [{ swatch: null, name: 'XS' }, { swatch: null, name: 'S' }, { swatch: null, name: 'M' }, { swatch: null, name: 'L' }] }],
      selectedOptions: [{ name: 'Color', value: 'Cream' }, { name: 'Size', value: 'M' }],
    },
    {
      id: 'gid://1005', title: 'Linen Blazer', handle: 'linen-blazer', createdAt: '2025-05-10T08:45:00-04:00', vendor: 'TailoredFit', price: 95,
      featuredImage: { src: productImage5.src, width: productImage5.width, height: productImage5.height, alt: 'Linen Blazer' },
      images: [{ src: productImage5.src, width: productImage5.width, height: productImage5.height, alt: 'Linen Blazer' }, { src: productImage5_1.src, width: productImage5_1.width, height: productImage5_1.height, alt: 'Linen Blazer' }, { src: productImage5_2.src, width: productImage5_2.width, height: productImage5_2.height, alt: 'Linen Blazer' }, { src: productImage5_3.src, width: productImage5_3.width, height: productImage5_3.height, alt: 'Linen Blazer' }],
      reviewNumber: 60, rating: 4.4, status: 'New in',
      options: [{ name: 'Color', optionValues: [{ name: 'Beige', swatch: { color: '#F5F5DC', image: null } }, { name: 'Navy', swatch: { color: '#000080', image: null } }, { name: 'Olive', swatch: { color: '#808000', image: null } }] }, { name: 'Size', optionValues: [{ swatch: null, name: 'M' }, { swatch: null, name: 'L' }, { swatch: null, name: 'XL' }] }],
      selectedOptions: [{ name: 'Color', value: 'Beige' }, { name: 'Size', value: 'L' }],
    },
    {
      id: 'gid://1006', title: 'Velvet Skirt', handle: 'velvet-skirt', createdAt: '2025-05-11T12:10:00-04:00', vendor: 'GlamVibe', price: 55,
      featuredImage: { src: productImage6.src, width: productImage6.width, height: productImage6.height, alt: 'Velvet Skirt' },
      images: [{ src: productImage6.src, width: productImage6.width, height: productImage6.height, alt: 'Velvet Skirt' }, { src: productImage6_1.src, width: productImage6_1.width, height: productImage6_1.height, alt: 'Velvet Skirt' }, { src: productImage6_2.src, width: productImage6_2.width, height: productImage6_2.height, alt: 'Velvet Skirt' }, { src: productImage6_3.src, width: productImage6_3.width, height: productImage6_3.height, alt: 'Velvet Skirt' }],
      reviewNumber: 45, rating: 4.2, status: 'Trending',
      options: [{ name: 'Color', optionValues: [{ name: 'Midnight Blue', swatch: { color: '#191970', image: null } }, { name: 'Wine Red', swatch: { color: '#722F37', image: null } }, { name: 'Emerald', swatch: { color: '#50C878', image: null } }] }, { name: 'Size', optionValues: [{ swatch: null, name: 'XS' }, { swatch: null, name: 'S' }, { swatch: null, name: 'M' }] }],
      selectedOptions: [{ name: 'Color', value: 'Wine Red' }, { name: 'Size', value: 'S' }],
    },
    {
      id: 'gid://1007', title: 'Wool Trench Coat', handle: 'wool-trench-coat', createdAt: '2025-05-12T10:25:00-04:00', vendor: 'ClassicCharm', price: 180,
      featuredImage: { src: productImage7.src, width: productImage7.width, height: productImage7.height, alt: 'Wool Trench Coat' },
      images: [{ src: productImage7.src, width: productImage7.width, height: productImage7.height, alt: 'Wool Trench Coat' }, { src: productImage7_1.src, width: productImage7_1.width, height: productImage7_1.height, alt: 'Wool Trench Coat' }, { src: productImage7_2.src, width: productImage7_2.width, height: productImage7_2.height, alt: 'Wool Trench Coat' }, { src: productImage7_3.src, width: productImage7_3.width, height: productImage7_3.height, alt: 'Wool Trench Coat' }],
      reviewNumber: 80, rating: 4.6, status: 'New in',
      options: [{ name: 'Color', optionValues: [{ name: 'Camel', swatch: { color: '#C19A6B', image: null } }, { name: 'Black', swatch: { color: '#000000', image: null } }, { name: 'Grey', swatch: { color: '#808080', image: null } }] }, { name: 'Size', optionValues: [{ swatch: null, name: 'S' }, { swatch: null, name: 'M' }, { swatch: null, name: 'L' }, { swatch: null, name: 'XL' }] }],
      selectedOptions: [{ name: 'Color', value: 'Camel' }, { name: 'Size', value: 'M' }],
    },
    {
      id: 'gid://1008', title: 'Cotton Shirt', handle: 'cotton-shirt', createdAt: '2025-05-13T09:00:00-04:00', vendor: 'CasualVibe', price: 45,
      featuredImage: { src: productImage8.src, width: productImage8.width, height: productImage8.height, alt: 'Cotton Shirt' },
      images: [{ src: productImage8.src, width: productImage8.width, height: productImage8.height, alt: 'Cotton Shirt' }, { src: productImage8_1.src, width: productImage8_1.width, height: productImage8_1.height, alt: 'Cotton Shirt' }, { src: productImage8_2.src, width: productImage8_2.width, height: productImage8_2.height, alt: 'Cotton Shirt' }, { src: productImage8_3.src, width: productImage8_3.width, height: productImage8_3.height, alt: 'Cotton Shirt' }],
      reviewNumber: 110, rating: 4.1, status: 'Best Seller',
      options: [{ name: 'Color', optionValues: [{ name: 'White', swatch: { color: 'oklch(81% 0.117 11.638)', image: null } }, { name: 'Light Blue', swatch: { color: '#ADD8E6', image: null } }, { name: 'Pink', swatch: { color: '#FFC1CC', image: null } }] }, { name: 'Size', optionValues: [{ swatch: null, name: 'S' }, { swatch: null, name: 'M' }, { swatch: null, name: 'L' }] }],
      selectedOptions: [{ name: 'Color', value: 'White' }, { name: 'Size', value: 'M' }],
    },
  ]
}

// ─── 더미 컬렉션 데이터 (폴백용) ─────────────────────────────────
function getDummyCollections() {
  return [
    { id: 'gid://1', title: 'Jackets', handle: 'jackets', description: 'Explore our collection of trendy jackets.', sortDescription: 'Newest arrivals', color: 'bg-indigo-50', count: 77, image: { src: collectionImage1.src, width: collectionImage1.width, height: collectionImage1.height, alt: 'Explore new arrivals' } },
    { id: 'gid://2', title: 'T-Shirts', handle: 't-shirts', sortDescription: 'Best sellers', description: 'Casual t-shirts for everyday wear.', image: { src: collectionImage2.src, width: collectionImage2.width, height: collectionImage2.height, alt: 'Explore new arrivals' }, color: 'bg-indigo-50', count: 155 },
    { id: 'gid://3', title: 'Jeans', handle: 'jeans', sortDescription: 'Best sellers', description: 'Trendy jeans for a casual yet stylish look.', image: { src: collectionImage3.src, width: collectionImage3.width, height: collectionImage3.height, alt: 'Explore new arrivals' }, color: 'bg-indigo-50', count: 35 },
    { id: 'gid://4', title: 'Coats', handle: 'coats', sortDescription: 'Best seasonal', description: 'Elegant coats for every season.', image: { src: collectionImage4.src, width: collectionImage4.width, height: collectionImage4.height, alt: 'Explore new arrivals' }, color: 'bg-indigo-50', count: 87 },
    { id: 'gid://5', title: 'Shoes', handle: 'shoes', sortDescription: 'Top rated', description: 'Trendy shoes for every occasion.', image: { src: collectionImage5.src, width: collectionImage5.width, height: collectionImage5.height, alt: 'Explore new arrivals' }, color: 'bg-indigo-50', count: 114 },
    { id: 'gid://6', title: 'Accessories', handle: 'accessories', sortDescription: 'Top transparent', description: 'Stylish accessories to complete your look.', image: { src: collectionImage6.src, width: collectionImage6.width, height: collectionImage6.height, alt: 'Explore new arrivals' }, color: 'bg-indigo-50', count: 55 },
    { id: 'gid://7', title: 'Bags', handle: 'bags', sortDescription: 'Best trends', description: 'Stylish bags for every occasion.', image: { src: collectionImage7.src, width: collectionImage7.width, height: collectionImage7.height, alt: 'Explore new arrivals' }, color: 'bg-indigo-50', count: 55 },
    { id: 'gid://8', title: 'Explore new arrivals', handle: 'explore-new-arrivals', sortDescription: 'Shop the latest <br /> from top brands', description: 'Explore our collection.', color: 'bg-orange-50', count: 77, image: { src: collectionImage5.src, width: collectionImage5.width, height: collectionImage5.height, alt: 'Explore new arrivals' } },
    { id: 'gid://9', title: 'Sale collection', handle: 'sale-collection', sortDescription: 'Up to <br /> 80% off retail', description: 'Explore our collection.', color: 'bg-green-50', count: 85, image: { src: collectionImage4.src, width: collectionImage4.width, height: collectionImage4.height, alt: 'Explore new arrivals' } },
    { id: 'gid://10', title: 'Sale collection', handle: 'sale-collection-2', sortDescription: 'Up to <br /> 90% off retail', description: 'Explore our collection.', color: 'bg-blue-50', count: 77, image: { src: collectionImage3.src, width: collectionImage3.width, height: collectionImage3.height, alt: 'Explore new arrivals' } },
    { id: 'gid://11', title: 'Digital gift cards', handle: 'digital-gift-cards', sortDescription: 'Give the gift <br /> of choice', description: 'Explore our collection.', color: 'bg-red-50', count: 112, image: { src: collectionImage2.src, width: collectionImage2.width, height: collectionImage2.height, alt: 'Explore new arrivals' } },
    { id: 'gid://12', title: 'Sport Kits', handle: 'sport-kits', sortDescription: '20+ categories', description: 'Explore our collection.', color: 'bg-neutral-100', count: 77, image: { src: boothImage1.src, width: boothImage1.width, height: boothImage1.height, alt: 'Explore new arrivals' } },
    { id: 'gid://13', title: 'Beauty Products', handle: 'beauty-products', color: 'bg-neutral-100', sortDescription: '20+ categories', description: 'Explore our collection.', count: 77, image: { src: boothImage2.src, width: boothImage2.width, height: boothImage2.height, alt: 'Explore new arrivals' } },
    { id: 'gid://14', title: 'Travel Kits', handle: 'travel-kits', sortDescription: '20+ categories', description: 'Explore our collection.', color: 'bg-neutral-100', count: 77, image: { src: boothImage3.src, width: boothImage3.width, height: boothImage3.height, alt: 'Explore new arrivals' } },
    { id: 'gid://15', title: 'Pets Food', handle: 'pets-food', sortDescription: '44+ categories', description: 'Explore our collection.', color: 'bg-neutral-100', count: 99, image: { src: boothImage4.src, width: boothImage4.width, height: boothImage4.height, alt: 'Explore new arrivals' } },
  ]
}

// ─── 공개 API 함수 ────────────────────────────────────────────────

export async function getOrder(number: string) {
  const allOrders = await getOrders()
  let order = allOrders.find((o) => o.number.toString() === number)
  if (!order) {
    console.warn(`Order ${number} not found. Returning fallback.`)
    order = allOrders[0]
  }
  return order
}

export async function getOrders() {
  return [
    {
      number: '4657', date: 'March 22, 2025', status: 'Delivered on January 11, 2025', invoiceHref: '#', totalQuantity: 4,
      cost: { subtotal: 199, shipping: 0, tax: 0, total: 199, discount: 0 },
      products: [
        { id: 'gid://2', title: 'Nomad Tumbler', handle: 'nomad-tumbler', description: 'Insulated tumbler.', href: '#', price: 35, status: 'Preparing to ship', step: 1, date: 'March 24, 2021', datetime: '2021-03-24', address: ['Floyd Miles', '7363 Cynthia Pass', 'Toronto, ON N3Y 4H8'], email: 'f•••@example.com', phone: '1•••••••••40', featuredImage: { src: productImage2.src, width: productImage2.width, height: productImage2.height, alt: 'Insulated bottle.' }, quantity: 1, size: 'XS', color: 'Black Brown' },
        { id: 'gid://3', title: 'Minimalist Wristwatch', handle: 'minimalist-wristwatch', description: 'Clean wristwatch.', href: '#', price: 149, status: 'Shipped', step: 0, date: 'March 23, 2021', datetime: '2021-03-23', address: ['Floyd Miles', '7363 Cynthia Pass', 'Toronto, ON N3Y 4H8'], email: 'f•••@example.com', phone: '1•••••••••40', featuredImage: { src: productImage4.src, width: productImage4.width, height: productImage4.height, alt: 'Insulated bottle.' }, quantity: 1, size: 'XL', color: 'White' },
      ],
    },
    {
      number: '4376', status: 'Delivered on January 08, 2028', invoiceHref: '#', date: 'March 22, 2025', totalQuantity: 4,
      cost: { subtotal: 199, shipping: 0, tax: 0, total: 199, discount: 0 },
      products: [
        { id: 'gid://1', title: 'Nomad Tumbler', handle: 'nomad-tumbler', description: 'Insulated tumbler.', href: '#', price: 99, status: 'Preparing to ship', step: 1, date: 'March 24, 2021', datetime: '2021-03-24', address: ['Floyd Miles', '7363 Cynthia Pass', 'Toronto, ON N3Y 4H8'], email: 'f•••@example.com', phone: '1•••••••••40', featuredImage: { src: productImage1.src, width: productImage1.width, height: productImage1.height, alt: 'Insulated bottle.' }, quantity: 1, size: 'M', color: 'Black' },
      ],
    },
  ]
}

export async function getCountries() {
  return [
    { name: 'Canada', code: 'CA', flagUrl: '/flags/ca.svg', regions: ['Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon'] },
    { name: 'Mexico', code: 'MX', flagUrl: '/flags/mx.svg', regions: ['Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 'Chihuahua', 'Ciudad de Mexico', 'Coahuila', 'Colima', 'Durango', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Mexico State', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'] },
    { name: 'United States', code: 'US', flagUrl: '/flags/us.svg', regions: ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Washington DC', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'] },
  ]
}

export async function getShopData() {
  return {
    description: 'KN541 쇼핑몰',
    name: 'KN541',
    termsOfService: { url: '#', title: 'Terms of Service', id: 'tos', handle: 'terms-of-service', body: '이용약관 내용입니다.' },
    subscriptionPolicy: { body: '<p>구독 정책</p>', handle: 'refund-policy', id: 'sub', title: 'Refund Policy', url: '#' },
    shippingPolicy: { body: '<p>배송 정책</p>', handle: 'shipping-policy', id: 'ship', title: 'Shipping Policy', url: '#' },
    refundPolicy: { body: '<p>환불 정책</p>', handle: 'refund-policy', id: 'refund', title: 'Refund Policy', url: '#' },
    privacyPolicy: { body: '<p>개인정보처리방침</p>', handle: 'privacy-policy', id: 'privacy', title: 'Privacy Policy', url: '#' },
    primaryDomain: { url: process.env.NEXT_PUBLIC_SITE_URL || 'https://kn541.vercel.app' },
  }
}

export async function getProductReviews(_handle: string) {
  return [
    { id: '1', title: "Can't say enough good things", rating: 5, content: '<p>정말 만족스러운 쇼핑 경험이었습니다.</p>', author: 'S. Walkinshaw', authorAvatar: avatarImage1, date: 'May 16, 2025', datetime: '2025-01-06' },
    { id: '2', title: 'Perfect for going out when you want to stay comfy', rating: 4, content: '<p>품질이 정말 좋습니다.</p>', author: 'Risako M', authorAvatar: avatarImage2, date: 'May 16, 2025', datetime: '2025-01-06' },
    { id: '3', title: 'Very nice feeling sweater!', rating: 4, content: '<p>친구들에게 적극 추천합니다.</p>', author: 'Eden Birch', authorAvatar: avatarImage3, date: 'May 16, 2025', datetime: '2025-01-06' },
    { id: '4', title: 'Very nice feeling sweater!', rating: 5, content: '<p>정말 훌륭한 제품입니다!</p>', author: 'Jonathan Edwards', authorAvatar: avatarImage4, date: 'May 16, 2025', datetime: '2025-01-06' },
  ]
}

export async function getBlogPosts() {
  return [
    { id: '1', title: 'Graduation Dresses: A Style Guide', handle: 'graduation-dresses-style-guide', excerpt: 'Illo sint voluptas. Error voluptates culpa eligendi.', featuredImage: { src: 'https://images.unsplash.com/photo-1535745122259-f1e187953c4c?q=80&w=3873&auto=format&fit=crop', alt: 'Graduation Dresses', width: 3637, height: 2432 }, date: 'Mar 16, 2020', datetime: '2020-03-16', category: { title: 'Marketing', href: '#' }, timeToRead: '2 min read', author: { name: 'Scott Walkinshaw', avatar: { src: avatarImage1.src, alt: 'Scott Walkinshaw', width: avatarImage1.width, height: avatarImage1.height }, description: 'Fashion designer.' } },
    { id: '2', title: 'How to Wear Your Eid Pieces All Year Long', handle: 'how-to-wear-your-eid-pieces-all-year-long', excerpt: 'Illo sint voluptas. Error voluptates culpa eligendi.', featuredImage: { src: 'https://images.unsplash.com/photo-1668585418249-f87c0f926583?q=80&w=3870&auto=format&fit=crop', alt: 'Eid Pieces', width: 3637, height: 2432 }, date: 'Mar 16, 2020', datetime: '2020-03-16', category: { title: 'Marketing', href: '#' }, timeToRead: '3 min read', author: { name: 'Erica Alexander', avatar: { src: avatarImage2.src, alt: 'Erica Alexander', width: avatarImage2.width, height: avatarImage2.height }, description: 'Fashion influencer.' } },
    { id: '3', title: 'The Must-Have Hijabi Friendly Fabrics for 2024', handle: 'the-must-have-hijabi-friendly-fabrics-for-2024', excerpt: 'Illo sint voluptas. Error voluptates culpa eligendi.', featuredImage: { src: 'https://images.unsplash.com/photo-1665047189192-3a49516d496a?q=80&w=3874&auto=format&fit=crop', alt: 'Hijabi Fabrics', width: 3637, height: 2432 }, date: 'Mar 16, 2020', datetime: '2020-03-16', category: { title: 'Marketing', href: '#' }, timeToRead: '3 min read', author: { name: 'Wellie Edwards', avatar: { src: avatarImage3.src, alt: 'Wellie Edwards', width: avatarImage3.width, height: avatarImage3.height }, description: 'Fashion designer.' } },
    { id: '4', title: 'The Hijabi Friendly Fabrics for 2025', handle: 'the-must-have-hijabi-friendly-fabrics-for', excerpt: 'Illo sint voluptas. Error voluptates culpa eligendi.', featuredImage: { src: 'https://images.unsplash.com/photo-1636522302676-79eb484e0b11?q=80&w=3637&auto=format&fit=crop', alt: 'Hijabi Fabrics 2025', width: 3637, height: 2432 }, date: 'Mar 16, 2020', datetime: '2020-03-16', category: { title: 'Marketing', href: '#' }, timeToRead: '3 min read', author: { name: 'Alex Klein', avatar: { src: avatarImage4.src, alt: 'Alex Klein', width: avatarImage4.width, height: avatarImage4.height }, description: 'Fashion designer.' } },
    { id: '5', title: 'Boost your conversion rate', handle: 'boost-your-conversion-rate', excerpt: 'Illo sint voluptas. Error voluptates culpa eligendi.', featuredImage: { src: 'https://images.unsplash.com/photo-1623876355139-cb77f029bd29?q=80&w=3296&auto=format&fit=crop', alt: 'Conversion', width: 3637, height: 2432 }, date: 'Mar 16, 2020', datetime: '2020-03-16', category: { title: 'Marketing', href: '#' }, timeToRead: '3 min read', author: { name: 'Eden Birch', avatar: { src: avatarImage1.src, alt: 'Eden Birch', width: avatarImage1.width, height: avatarImage1.height }, description: 'Fashion designer.' } },
    { id: '6', title: 'Graduation Dresses: A Style Guide', handle: 'graduation-dresses-style-guide-2', excerpt: 'Illo sint voluptas. Error voluptates culpa eligendi.', featuredImage: { src: 'https://images.unsplash.com/photo-1746699484949-869986068267?w=900&auto=format&fit=crop', alt: 'Graduation Dresses 2', width: 3773, height: 600 }, date: 'Mar 16, 2020', datetime: '2020-03-16', category: { title: 'Marketing', href: '#' }, timeToRead: '3 min read', author: { name: 'Scott Edwards', avatar: { src: avatarImage2.src, alt: 'Scott Edwards', width: avatarImage2.width, height: avatarImage2.height }, description: 'Fashion designer.' } },
  ]
}

export async function getBlogPostsByHandle(handle: string) {
  handle = handle.toLowerCase()
  const posts = await getBlogPosts()
  let post = posts.find((p) => p.handle === handle)
  if (!post) {
    console.warn(`Post '${handle}' not found. Returning fallback.`)
    post = posts[0]
  }
  return { ...post, content: 'Lorem ipsum dolor ...', tags: ['fashion', 'style', 'trends'] }
}

export function getCart(_id: string) {
  return {
    id: 'gid://shopify/Cart/1',
    note: '',
    createdAt: '2025-01-06',
    totalQuantity: 3,
    cost: { subtotal: 417, shipping: 0, tax: 0, total: 417, discount: 0 },
    lines: [
      { id: '1', name: 'Basic Tee', handle: 'basic-tee', price: 199, color: 'Sienna', inStock: true, size: 'L', quantity: 1, image: { src: productImage1.src, width: productImage1.width, height: productImage1.height, alt: 'Basic Tee' } },
      { id: '2', name: 'Basic Coahuila', handle: 'basic-coahuila', price: 99, color: 'Black', inStock: false, leadTime: '3–4 weeks', size: 'XL', quantity: 2, image: { src: productImage2.src, width: productImage2.width, height: productImage2.height, alt: 'Basic Coahuila' } },
      { id: '3', name: 'Nomad Tumbler', handle: 'nomad-tumbler', price: 119, color: 'White', inStock: true, size: 'M', quantity: 1, image: { src: productImage3.src, width: productImage3.width, height: productImage3.height, alt: 'Nomad Tumbler' } },
    ],
  }
}

/**
 * 컬렉션(카테고리) 목록 조회
 * API 성공 → 실제 KN541 카테고리 / 실패 → 더미 폴백
 */
export async function getCollections() {
  try {
    const categories = await getRootCategories()
    if (categories.length > 0) {
      const apiCollections = adaptCategories(categories)
      const dummy = getDummyCollections()
      return [...apiCollections, ...dummy.slice(7)]
    }
  } catch {
    // API 미연결 시 조용히 폴백
  }
  return getDummyCollections()
}

export async function getGroupCollections() {
  const allCollections = await getCollections()
  const collections = allCollections.slice(0, 6)
  return [
    { id: '1', title: 'Women', handle: 'women', description: 'lorem ipsum', iconSvg: `<svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 16C15.866 16 19 12.866 19 9C19 5.13401 15.866 2 12 2C8.13401 2 5 5.13401 5 9C5 12.866 8.13401 16 12 16Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 16V22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 19H9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`, collections },
    { id: '2', title: 'Man', handle: 'man', description: 'lorem ipsum', iconSvg: `<svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.25 21.5C14.5302 21.5 18 18.0302 18 13.75C18 9.46979 14.5302 6 10.25 6C5.96979 6 2.5 9.46979 2.5 13.75C2.5 18.0302 5.96979 21.5 10.25 21.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M21.5 2.5L16 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 2.5H21.5V9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`, collections: shuffleArray(collections) },
    { id: '3', title: 'Accessories', handle: 'accessories', description: 'lorem ipsum', iconSvg: `<svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.08 8.58003V15.42C21.08 16.54 20.48 17.58 19.51 18.15L13.57 21.58C12.6 22.14 11.4 22.14 10.42 21.58L4.48003 18.15C3.51003 17.59 2.91003 16.55 2.91003 15.42V8.58003C2.91003 7.46003 3.51003 6.41999 4.48003 5.84999L10.42 2.42C11.39 1.86 12.59 1.86 13.57 2.42L19.51 5.84999C20.48 6.41999 21.08 7.45003 21.08 8.58003Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`, collections: shuffleArray(collections) },
    { id: '4', title: 'Footwear', handle: 'footwear', description: 'lorem ipsum', iconSvg: `<svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.1801 18C19.5801 18 20.1801 16.65 20.1801 15V9C20.1801 7.35 19.5801 6 17.1801 6C14.7801 6 14.1801 7.35 14.1801 9V15C14.1801 16.65 14.7801 18 17.1801 18Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.81995 18C4.41995 18 3.81995 16.65 3.81995 15V9C3.81995 7.35 4.41995 6 6.81995 6C9.21995 6 9.81995 7.35 9.81995 9V15C9.81995 16.65 9.21995 18 6.81995 18Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`, collections: shuffleArray(collections) },
    { id: '5', title: 'Jewelry', handle: 'jewelry', description: 'lorem ipsum', iconSvg: `<svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.7 18.98H7.30002C6.88002 18.98 6.41002 18.65 6.27002 18.25L2.13002 6.66999C1.54002 5.00999 2.23002 4.49999 3.65002 5.51999L7.55002 8.30999C8.20002 8.75999 8.94002 8.52999 9.22002 7.79999L10.98 3.10999C11.54 1.60999 12.47 1.60999 13.03 3.10999L14.79 7.79999C15.07 8.52999 15.81 8.75999 16.45 8.30999L20.11 5.69999C21.67 4.57999 22.42 5.14999 21.78 6.95999L17.74 18.27C17.59 18.65 17.12 18.98 16.7 18.98Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`, collections: shuffleArray(collections) },
    { id: '6', title: 'Beauty', handle: 'beauty', description: 'lorem ipsum', iconSvg: `<svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.7 18.98H7.30002C6.88002 18.98 6.41002 18.65 6.27002 18.25L2.13002 6.66999C1.54002 5.00999 2.23002 4.49999 3.65002 5.51999L7.55002 8.30999C8.20002 8.75999 8.94002 8.52999 9.22002 7.79999L10.98 3.10999C11.54 1.60999 12.47 1.60999 13.03 3.10999L14.79 7.79999C15.07 8.52999 15.81 8.75999 16.45 8.30999L20.11 5.69999C21.67 4.57999 22.42 5.14999 21.78 6.95999L17.74 18.27C17.59 18.65 17.12 18.98 16.7 18.98Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`, collections: shuffleArray(collections) },
  ]
}

export async function getCollectionByHandle(handle: string) {
  handle = handle.toLowerCase()
  if (handle === 'all') {
    return {
      id: 'gid://all', title: 'All products', handle: 'all',
      description: 'Explore our entire collection of products.',
      sortDescription: 'All products', color: 'bg-indigo-50', count: 0,
      image: { src: collectionImage1.src, width: collectionImage1.width, height: collectionImage1.height, alt: 'All products' },
    }
  }
  try {
    const categories = await getCategories()
    const found = categories.find((c) => c.category_code === handle)
    if (found) return adaptCategory(found)
  } catch {
    // 폴백
  }
  const dummy = getDummyCollections()
  return dummy.find((c) => c.handle === handle) ?? dummy[0]
}

/**
 * 상품 목록 조회
 * API 성공 → 실제 KN541 상품 / 실패 → 더미 폴백
 */
export async function getProducts(params?: {
  category?: string
  page?: number
  size?: number
  sort?: string
  q?: string
}) {
  try {
    const result = await apiGetProducts({
      size: params?.size ?? 20,
      page: params?.page,
      keyword: params?.q,
      product_status: 'ACTIVE',
    })
    if (result.items.length > 0) {
      return adaptProducts(result.items)
    }
  } catch {
    // 폴백
  }
  return getDummyProducts()
}

export async function getProductByHandle(handle: string) {
  handle = handle.toLowerCase()
  try {
    const product = await getProductById(handle)
    if (product) return adaptProduct(product)
  } catch {
    // 폴백
  }
  const products = getDummyProducts()
  return products.find((p) => p.handle === handle) ?? products[0]
}

export async function getProductDetailByHandle(handle: string) {
  handle = handle.toLowerCase()
  const product = await getProductByHandle(handle)
  return {
    ...product,
    status: 'In Stock',
    breadcrumbs: [
      { id: 1, name: 'Home', href: '/' },
      { id: 2, name: 'Products', href: '/collections/all' },
    ],
    description: product?.title
      ? `${product.title} 상품입니다.`
      : 'Fashion is a form of self-expression and autonomy at a particular period and place.',
    publishedAt: product?.createdAt ?? '2025-01-01T00:00:00Z',
    selectedOptions: [
      { name: 'Color', value: (product?.options as any)?.[0]?.optionValues?.[0]?.name },
      { name: 'Size', value: (product?.options as any)?.[1]?.optionValues?.[0]?.name },
    ],
    features: [
      'Material: 43% Sorona Yarn + 57% Stretch Polyester',
      'Casual pants waist with elastic elastic inside',
      'The pants are a bit tight so you always feel comfortable',
      'Excool technology application 4-way stretch',
    ],
    careInstruction: 'Machine wash cold with like colors. Do not bleach. Tumble dry low.',
    shippingAndReturn: '50,000원 이상 무료배송. 30일 이내 반품/교환 가능.',
  }
}

// ─── 공통 타입 ──────────────────────────────────────────────────
export type TCollection = Partial<Awaited<ReturnType<typeof getDummyCollections>>[number]>
export type TProductItem = Partial<Awaited<ReturnType<typeof getDummyProducts>>[number]>
export type TProductDetail = Partial<Awaited<ReturnType<typeof getProductDetailByHandle>>>
export type TCardProduct = Partial<Awaited<ReturnType<typeof getCart>['lines'][number]>>
export type TBlogPost = Partial<Awaited<ReturnType<typeof getBlogPosts>>[number]>
export type TReview = Partial<Awaited<ReturnType<typeof getProductReviews>>[number]>
export type TOrder = Partial<Awaited<ReturnType<typeof getOrders>>[number]>
