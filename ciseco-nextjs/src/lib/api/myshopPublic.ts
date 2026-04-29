/**
 * 분양몰 공개 API — 인증 불필요
 */

import type { Product } from '@/lib/api/products'

const BASE = process.env.NEXT_PUBLIC_API_URL

export interface PublicMyShopData {
  shop_id: string
  shop_name: string | null
  shop_description: string | null
  logo_url: string | null
  template_code: string | null
  shop_url_code: string | null
  shop_url: string | null
  products: Product[]
}

function parseErrorDetail(body: unknown): string {
  if (!body || typeof body !== 'object') return '요청을 처리할 수 없습니다.'
  const d = (body as { detail?: unknown }).detail
  if (typeof d === 'string') return d
  if (Array.isArray(d) && d[0] && typeof d[0] === 'object' && 'msg' in d[0]) {
    return String((d[0] as { msg?: string }).msg || '오류')
  }
  return '요청을 처리할 수 없습니다.'
}

export async function fetchPublicMyShop(
  shopUrlCode: string,
): Promise<
  { ok: true; data: PublicMyShopData } | { ok: false; status: number; message: string }
> {
  if (!BASE) {
    return { ok: false, status: 500, message: 'API URL이 설정되지 않았습니다.' }
  }
  const url = `${BASE.replace(/\/$/, '')}/myshop/public/${encodeURIComponent(shopUrlCode)}`
  let res: Response
  try {
    res = await fetch(url, { cache: 'no-store' })
  } catch {
    return { ok: false, status: 0, message: '네트워크 오류가 발생했습니다.' }
  }
  let body: unknown = null
  try {
    body = await res.json()
  } catch {
    body = null
  }
  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      message: parseErrorDetail(body),
    }
  }
  const payload = body as { status?: string; data?: PublicMyShopData }
  if (!payload?.data) {
    return { ok: false, status: 502, message: '응답 형식이 올바르지 않습니다.' }
  }
  return { ok: true, data: payload.data }
}

export async function recordMyShopVisit(shopUrlCode: string, refChannel: string): Promise<void> {
  if (!BASE) return
  const url = `${BASE.replace(/\/$/, '')}/myshop/visit`
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shop_url_code: shopUrlCode,
        ref_channel: refChannel || 'direct',
      }),
    })
  } catch {
    /* 방문 기록 실패는 페이지 표시에 영향 없음 */
  }
}
