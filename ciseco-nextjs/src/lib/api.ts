/**
 * KN541 API 클라이언트
 * - KN541 백엔드(Railway FastAPI)와 통신하는 공통 유틸
 * - 응답 형식: { status: "success", data: { items, total } } 또는 { status: "success", data: {...} }
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

// 공통 fetch 래퍼 (서버/클라이언트 모두 사용 가능)
export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T | null> {
  if (!BASE_URL) {
    // 환경변수 미설정 시 null 반환 → 더미데이터 폴백
    return null
  }

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      // Next.js 캐시: 60초 revalidate
      next: { revalidate: 60 },
    })

    if (!res.ok) {
      console.warn(`[KN541 API] ${path} → HTTP ${res.status}`)
      return null
    }

    const json = await res.json()

    if (json?.status !== 'success') {
      console.warn(`[KN541 API] ${path} → 응답 오류:`, json)
      return null
    }

    return json.data as T
  } catch (err) {
    console.error(`[KN541 API] ${path} → 네트워크 오류:`, err)
    return null
  }
}

// 인증 토큰 포함 fetch (클라이언트 전용)
export async function apiFetchAuth<T>(
  path: string,
  token: string,
  options?: RequestInit,
): Promise<T | null> {
  return apiFetch<T>(path, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
    // 인증 필요 데이터는 캐시 안함
    cache: 'no-store',
  })
}
