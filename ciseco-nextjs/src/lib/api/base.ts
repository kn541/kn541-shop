/**
 * KN541 API URL 헬퍼
 * - 브라우저: same-origin 프록시(/api/backend) → CORS 우회 (kn541.com 등 신규 도메인 대응)
 * - 서버: Railway API 직접 호출
 */

const UPSTREAM_FALLBACK = 'https://kn541-production.up.railway.app'

export function getUpstreamBase(): string {
  return (process.env.NEXT_PUBLIC_API_URL || UPSTREAM_FALLBACK).replace(/\/$/, '')
}

/** 브라우저: /api/backend, 서버: Railway URL */
export function getApiBase(): string {
  if (typeof window !== 'undefined') return '/api/backend'
  return getUpstreamBase()
}

/** API 경로(+쿼리) → 전체 URL */
export function apiUrl(pathAndQuery: string): string {
  const p = pathAndQuery.startsWith('/') ? pathAndQuery : `/${pathAndQuery}`
  return `${getApiBase()}${p}`
}
