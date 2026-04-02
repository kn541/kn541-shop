// KN541 쇼핑몰 — 카테고리 네비 서버 컴포넌트
// 서버에서 백엔드 API를 직접 호출 → CORS 없음
// 인터랙션은 CategoryNavClient(클라이언트)가 담당

import CategoryNavClient from './CategoryNavClient'

interface Category {
  id: string
  category_code: string
  category_name: string
  depth: number
  sort_order: number
  is_active: boolean
  children?: Category[]
}

async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/categories`,
      { next: { revalidate: 300 } } // 5분 캐시
    )
    if (!res.ok) return []
    const json = await res.json()
    return json?.data?.items ?? []
  } catch {
    return []
  }
}

export default async function CategoryNav() {
  const all = await fetchCategories()

  // depth=1만 추출 (API가 children을 이미 포함해서 반환)
  const categories = all
    .filter(c => c.depth === 1 && c.is_active)
    .sort((a, b) => a.sort_order - b.sort_order)

  if (categories.length === 0) return null

  return <CategoryNavClient categories={categories} />
}
