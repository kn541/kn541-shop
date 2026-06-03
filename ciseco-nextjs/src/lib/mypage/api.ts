/**
 * KN541 마이페이지 API 공통 클라이언트
 * Step 5-H: GET /mypage/home 실 API 연동
 */
import type { MypageHomeResponse } from './types'
import { clearHeaderUserCache } from '@/lib/auth/headerUser'

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'https://kn541-production.up.railway.app'

// ─── 에러 클래스 ─────────────────────────────────────────────────
export class MypageApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string | null,
    message: string,
    public readonly actionUrl: string | null = null
  ) {
    super(message)
    this.name = 'MypageApiError'
  }
}

// ─── API 엔벨로프 타입 ──────────────────────────────────────────────
interface ApiEnvelope<T> {
  status: 'success' | 'error'
  data: T
}

// ─── 실제 API 응답 구조 (flat) ─────────────────────────────────────
interface RawMypageHomeData {
  user_id: string
  username: string
  email: string
  member_level: 'L1' | 'L2' | 'L3'
  member_level_label: string
  paid_at: string | null
  paid_expires_at: string | null
  is_paid_active: boolean
  shop_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | null
  shop_status_label: string | null
  shop_name: string | null
  point_balance: number
  coupon_count: number
}

// ─── API 응답 어댓터: flat → MypageHomeResponse(nested) ─────────────
// 타입 수정 금지 지시에 따라 MypageHomeResponse 변경 없이 매핑
export function adaptMypageHome(raw: RawMypageHomeData): MypageHomeResponse {
  return {
    user: {
      name:         raw.username,
      member_level: raw.member_level,
      email:        raw.email,
    },
    summary: {
      points:         raw.point_balance,
      coupons:        raw.coupon_count,
      orders_pending: 0,   // 백엔드 미제공 → 0 기본값
    },
    shop: {
      status:    raw.shop_status ?? 'NONE',
      shop_name: raw.shop_name ?? undefined,
    },
    paid: {
      is_active:  raw.is_paid_active,
      expires_at: raw.paid_expires_at,
    },
  }
}

// ─── 토큰 재발급: refresh_token → 새 access_token ──────────────────
// 성공 시 새 access_token 반환 / 실패(refresh 없음·서버 거부) 시 null
export async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null
  const rt = localStorage.getItem('refresh_token')
  if (!rt) return null
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: rt }),
    })
    if (!res.ok) return null
    const body = await res.json().catch(() => null)
    const newAt = body?.data?.access_token as string | undefined
    const newRt = body?.data?.refresh_token as string | undefined
    if (!newAt) return null
    localStorage.setItem('access_token', newAt)
    if (newRt) localStorage.setItem('refresh_token', newRt)
    return newAt
  } catch {
    return null
  }
}

// ─── 토큰 전부 제거 + 로그인 리다이렉트 ────────────────────────────
// 만료·재발급 실패 시 호출 — "로그인된 듯 보이나 유효 토큰 없음" 상태 제거
export function clearAuthAndRedirect(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user_type')
  clearHeaderUserCache()
  const locale = window.location.pathname.split('/')[1] || 'ko'
  window.location.href = `/${locale}/login`
}

// ─── 공통 fetch (인증 토큰 + envelope unwrap) ───────────────────────────
export async function mypageFetch<T>(path: string, init?: RequestInit): Promise<T> {
  // 기존 shop API와 동일한 localStorage 토큰 방식
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('access_token') : null

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  // 401: refresh 시도 → 새 토큰으로 1회 재시도 / 실패 시 전부 제거 + 로그인 리다이렉트
  if (res.status === 401) {
    const newToken = await refreshAccessToken()
    if (!newToken) {
      clearAuthAndRedirect()
      throw new MypageApiError(401, 'UNAUTHORIZED', '로그인이 필요합니다')
    }
    const retryRes = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
        Authorization: `Bearer ${newToken}`,
      },
    })
    if (retryRes.status === 401) {
      clearAuthAndRedirect()
      throw new MypageApiError(401, 'UNAUTHORIZED', '로그인이 필요합니다')
    }
    // 재시도 응답 파싱 (원본 로직과 동일)
    const rb = await retryRes.json().catch(() => ({}))
    if (!retryRes.ok) {
      const rd = rb?.detail
      if (rd && typeof rd === 'object')
        throw new MypageApiError(retryRes.status, (rd as Record<string, string>).code ?? null,
          (rd as Record<string, string>).message ?? '요청에 실패했습니다',
          (rd as Record<string, string>).action_url ?? null)
      throw new MypageApiError(retryRes.status, null,
        typeof rd === 'string' ? rd : '요청에 실패했습니다')
    }
    const rm = (init?.method ?? 'GET').toUpperCase()
    if ((rm === 'DELETE' || retryRes.status === 204) && rb &&
        typeof rb === 'object' && Object.keys(rb as object).length === 0)
      return undefined as T
    const re = rb as ApiEnvelope<T>
    if (re.status === 'success') return re.data
    throw new MypageApiError(500, null, '응답 형식이 올바르지 않습니다')
  }

  const body = await res.json().catch(() => ({}))

  if (!res.ok) {
    const detail = body?.detail
    if (detail && typeof detail === 'object') {
      throw new MypageApiError(
        res.status,
        (detail as Record<string, string>).code ?? null,
        (detail as Record<string, string>).message ?? '요청에 실패했습니다',
        (detail as Record<string, string>).action_url ?? null
      )
    }
    throw new MypageApiError(
      res.status,
      null,
      typeof detail === 'string' ? detail : '요청에 실패했습니다'
    )
  }

  const method = (init?.method ?? 'GET').toUpperCase()
  if (
    (method === 'DELETE' || res.status === 204) &&
    body &&
    typeof body === 'object' &&
    Object.keys(body as object).length === 0
  ) {
    return undefined as T
  }

  // { status: "success", data: T } envelope unwrap
  const envelope = body as ApiEnvelope<T>
  if (envelope.status === 'success') return envelope.data
  throw new MypageApiError(500, null, '응답 형식이 올바르지 않습니다')
}
