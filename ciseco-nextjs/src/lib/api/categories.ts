/**
 * KN541 카테고리 API
 * 정책: 프론트는 API로만 데이터를 가져온다
 * 인증 불필요 (공개 API)
 */

const BASE = process.env.NEXT_PUBLIC_API_URL

export interface Category {
  id: string
  category_code: string
  category_name: string
  parent_id: string | null
  depth: number
  sort_order: number
  is_active: boolean
  is_event: boolean
  supply_price_ratio: number | null
  children?: Category[]
  created_at: string
}

// 카테고리 트리 전체 조회
export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${BASE}/categories`, {
    next: { revalidate: 300 }, // 5분 캐시
  })
  if (!res.ok) throw new Error('카테고리 조회 실패')
  const data = await res.json()
  return data.data.items
}

// 카테고리 단건 + 하위 포함 조회
export async function getCategoryById(id: string): Promise<Category> {
  const res = await fetch(`${BASE}/categories/${id}`, {
    next: { revalidate: 300 },
  })
  if (!res.ok) throw new Error('카테고리 조회 실패')
  const data = await res.json()
  return data.data
}

// 1단 카테고리만 (depth=1, 네비게이션용)
export async function getRootCategories(): Promise<Category[]> {
  const all = await getCategories()
  return all.filter((c) => c.depth === 1 && c.is_active)
}
