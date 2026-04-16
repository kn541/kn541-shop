// KN541 쇼핑몰 인증 헬퍼
// 로그인 페이지: localStorage에 access_token 저장 확인

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('access_token')
}

export function getAuthHeader(): Record<string, string> {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export function isLoggedIn(): boolean {
  return !!getAuthToken()
}
