// KN541 동사가치배당 출금 — 분할 계산 유틸
// 백엔드 _split_withdraw_amounts / rpc_apply_equity_withdraw 와 동일 규칙
//   cash  = ROUND_HALF_UP(total * ratio / 100)
//   point = total - cash
// 서버가 최종 확정값을 계산하므로, 여기서는 팝업 미리보기 표시용으로만 사용.

/** 0.5 올림(ROUND_HALF_UP) — JS Math.round는 음수에서 다르게 동작하나 금액은 양수라 동일 */
function roundHalfUp(n: number): number {
  return Math.floor(n + 0.5)
}

export interface WithdrawSplit {
  total: number
  cashRatio: number
  cashAmount: number
  pointAmount: number
}

/**
 * 출금 분할 계산 (미리보기용)
 * @param total 출금가능잔액(동사가치배당 PENDING 합)
 * @param cashRatio 현금 비율(%) 0~50
 */
export function calcWithdrawSplit(total: number, cashRatio: number): WithdrawSplit {
  const t = Math.max(0, Math.floor(total || 0))
  const ratio = clampCashRatio(cashRatio)
  const cash = roundHalfUp((t * ratio) / 100)
  const point = t - cash
  return { total: t, cashRatio: ratio, cashAmount: cash, pointAmount: point }
}

/** 현금 비율 0~50 범위로 보정 */
export function clampCashRatio(ratio: number): number {
  if (!Number.isFinite(ratio) || ratio < 0) return 0
  if (ratio > 50) return 50
  return ratio
}

export const MAX_CASH_RATIO = 50

export function formatWon(n: number): string {
  return `${Math.floor(n || 0).toLocaleString('ko-KR')}원`
}
