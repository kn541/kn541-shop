/**
 * KN541 shop — 디자인설정 공개 API (인증 불필요)
 * 백엔드: GET /public/hero-banners, /public/main-products (v_active_* 뷰)
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? ''

export type HeroBanner = {
  id: string
  title: string
  /** 배너 하단 보조 카피 (선택). alt_text(접근성)와 별개 */
  subtitle?: string | null
  image_url: string
  mobile_image_url?: string | null
  link_url?: string | null
  link_target?: string | null
  alt_text?: string | null
  sort_order: number
}

type HeroBannersResponse = {
  status?: string
  data?: { items?: HeroBanner[] }
}

export async function fetchHeroBanners(): Promise<HeroBanner[]> {
  if (!BASE) return []
  try {
    const res = await fetch(`${BASE}/public/hero-banners`, { next: { revalidate: 60 } })
    if (!res.ok) return []
    const json = (await res.json()) as HeroBannersResponse
    if (json.status != null && json.status !== 'success') return []
    const items = json.data?.items
    if (!items?.length) return []
    return [...items].sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0))
  } catch {
    return []
  }
}
