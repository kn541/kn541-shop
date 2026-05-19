'use client'
// KN541 Shop — 옵션 2단 조합 API (Admin useOptionGroups와 동일)

const BASE = process.env.NEXT_PUBLIC_API_URL || ''

function authHeaders(): Record<string, string> {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('access_token') || localStorage.getItem('accessToken') || ''
      : ''
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
}

export interface OptionValue {
  id: string
  group_id: string
  value_name: string
  sort_order: number
  is_active: boolean
}

export interface OptionGroup {
  id: string
  product_id: string
  group_name: string
  sort_order: number
  values: OptionValue[]
}

export interface OptionCombination {
  id: string
  product_id: string
  option_name: string
  option_group: string
  value1_id: string | null
  value2_id: string | null
  add_price: string
  stock_qty: number
  is_active: boolean
  sort_order: number
}

export interface OptionGroupsData {
  groups: OptionGroup[]
  combinations: OptionCombination[]
  total_groups: number
  total_combinations: number
}

export async function fetchOptionGroups(productId: string): Promise<OptionGroupsData | null> {
  try {
    const res = await fetch(`${BASE}/products/${productId}/option-groups`, {
      headers: authHeaders(),
      cache: 'no-store',
    })
    if (!res.ok) return null
    const json = await res.json()
    return json.data ?? null
  } catch {
    return null
  }
}
