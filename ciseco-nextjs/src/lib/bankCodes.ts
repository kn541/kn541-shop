// KN541 — 은행 목록 (system_codes bank_code 동적 로드, 하드코딩 금지)
import { apiUrl } from '@/lib/api/base'

export interface BankCodeItem {
  code: string
  code_value?: string | null
  name: string
}

/** 공개 API — 회원가입 등 비로그인 화면용 */
export async function fetchBankCodeList(): Promise<BankCodeItem[]> {
  try {
    const res = await fetch(apiUrl('/system-codes?category=bank_code'), { cache: 'no-store' })
    if (!res.ok) return []
    const json = (await res.json()) as {
      data?: { items?: Array<{ code?: string; code_name?: string; code_value?: string }> }
    }
    return (json.data?.items ?? [])
      .map(row => ({
        code: String(row.code ?? ''),
        code_value: row.code_value ?? null,
        name: String(row.code_name ?? ''),
      }))
      .filter(b => b.code && b.name)
  } catch {
    return []
  }
}

/** GET /mypage/bank-account 응답 bank_list → 공통 형식 */
export function mapMypageBankList(
  rows: Array<{ code?: string; code_value?: string; name?: string }> | undefined
): BankCodeItem[] {
  return (rows ?? [])
    .map(r => ({
      code: String(r.code ?? ''),
      code_value: r.code_value ?? null,
      name: String(r.name ?? ''),
    }))
    .filter(b => b.code && b.name)
}
