'use client'

// KN541 동사가치배당 — 현금 출금 신청 팝업
// 명세:
//  - 출금가능잔액 = 동사가치배당금 잔액 (summary.withdrawable_balance)
//  - 현금비율(%) 입력 (최대 50% 이하)
//  - 회원정보에 은행계좌·은행명·예금주가 있으면 입력란 비노출, 없으면 입력
//  - (현금비율 + 은행 3종) 모두 입력해야 신청 (계좌 기보유 시 현금비율만)
//  - 기입 % 외 나머지는 포인트(GWCP)로 전환, 신청 시 출금가능잔액 0원
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { mapMypageBankList, type BankCodeItem } from '@/lib/bankCodes'
import { MypageApiError, mypageFetch } from '@/lib/mypage/api'
import { applyWithdraw } from '@/lib/mypage/useWithdrawals'
import type { WithdrawSummaryData } from '@/lib/mypage/useWithdrawSummary'
import { calcWithdrawSplit, clampCashRatio, formatWon, MAX_CASH_RATIO } from '@/lib/mypage/withdrawUtils'

interface Props {
  open: boolean
  summary: WithdrawSummaryData
  onClose: () => void
  /** 신청 성공 후 호출 — summary/내역 새로고침용 */
  onApplied?: () => void
}

export default function WithdrawModal({ open, summary, onClose, onApplied }: Props) {
  const total = Math.max(0, Math.floor(summary.withdrawable_balance || 0))
  const hasBank = !!summary.has_bank_account

  const [cashRatioStr, setCashRatioStr] = useState('')
  const [bankCode, setBankCode] = useState('')
  const [bankName, setBankName] = useState('')
  const [bankList, setBankList] = useState<BankCodeItem[]>([])
  const [bankAccount, setBankAccount] = useState('')
  const [accountHolder, setAccountHolder] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open || hasBank) return
    let cancelled = false
    mypageFetch<{ bank_list?: Array<{ code?: string; code_value?: string; name?: string }> }>(
      '/mypage/bank-account'
    )
      .then(data => {
        if (!cancelled) setBankList(mapMypageBankList(data.bank_list))
      })
      .catch(() => {
        if (!cancelled) setBankList([])
      })
    return () => {
      cancelled = true
    }
  }, [open, hasBank])

  const cashRatio = useMemo(() => {
    const n = parseFloat(cashRatioStr)
    return Number.isFinite(n) ? n : NaN
  }, [cashRatioStr])

  const split = useMemo(
    () => calcWithdrawSplit(total, Number.isFinite(cashRatio) ? cashRatio : 0),
    [total, cashRatio]
  )

  if (!open) return null

  const ratioValid = Number.isFinite(cashRatio) && cashRatio >= 0 && cashRatio <= MAX_CASH_RATIO
  const ratioOver = Number.isFinite(cashRatio) && cashRatio > MAX_CASH_RATIO
  const bankValid = hasBank || (bankCode && bankName.trim() && bankAccount.trim() && accountHolder.trim())
  const canSubmit = total > 0 && ratioValid && !!bankValid && !submitting

  const handleSubmit = async () => {
    if (!ratioValid) {
      toast.error(ratioOver ? '현금 출금 비율은 50% 이하만 가능합니다.' : '현금 비율을 입력해 주세요.')
      return
    }
    if (!bankValid) {
      toast.error('은행명, 계좌번호, 예금주를 모두 입력해 주세요.')
      return
    }

    // 계좌: 보유 시 회원정보 평문값, 미보유 시 입력값
    const payloadBankName = hasBank ? (summary.bank_name ?? '') : bankName.trim()
    const payloadBankAccount = hasBank ? (summary.bank_account ?? '') : bankAccount.trim()
    const payloadHolder = hasBank ? (summary.account_holder ?? '') : accountHolder.trim()

    setSubmitting(true)
    try {
      await applyWithdraw({
        cash_ratio: clampCashRatio(cashRatio),
        bank_name: payloadBankName,
        bank_account: payloadBankAccount,
        account_holder: payloadHolder,
      })
      toast.success('출금 신청이 접수됐습니다.')
      onApplied?.()
      onClose()
    } catch (e) {
      if (e instanceof MypageApiError) {
        // 백엔드 detail.message (WITHDRAW_IN_PROGRESS / INSUFFICIENT_BALANCE / INVALID_CASH_RATIO 등)
        toast.error(e.message || '출금 신청에 실패했습니다.')
      } else {
        toast.error('출금 신청 중 오류가 발생했습니다.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl bg-white p-6 dark:bg-neutral-900 sm:rounded-3xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">동사가치배당 출금 신청</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        {/* 출금 가능 잔액 */}
        <div className="mb-5 rounded-2xl bg-violet-50 p-4 text-center dark:bg-violet-900/20">
          <div className="mb-1 text-xs text-neutral-500 dark:text-neutral-400">출금 가능 잔액</div>
          <div className="text-2xl font-black text-violet-600">{formatWon(total)}</div>
        </div>

        {total <= 0 ? (
          <p className="py-6 text-center text-sm text-neutral-500">출금 가능한 잔액이 없습니다.</p>
        ) : (
          <>
            {/* 현금 비율 */}
            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-semibold">
                현금 출금 비율 (%) <span className="text-red-500">*</span>
                <span className="ml-1 text-xs font-normal text-neutral-400">최대 {MAX_CASH_RATIO}%</span>
              </label>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                max={MAX_CASH_RATIO}
                step={1}
                value={cashRatioStr}
                onChange={e => setCashRatioStr(e.target.value)}
                placeholder="0 ~ 50"
                className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 dark:bg-neutral-800 ${
                  ratioOver
                    ? 'border-red-400 focus:ring-red-200'
                    : 'border-neutral-200 focus:ring-violet-200 dark:border-neutral-700'
                }`}
              />
              {ratioOver && (
                <p className="mt-1 text-xs text-red-500">현금 출금 비율은 50% 이하만 가능합니다.</p>
              )}
            </div>

            {/* 분할 미리보기 */}
            <div className="mb-4 space-y-1.5 rounded-xl border border-neutral-200 p-3 text-sm dark:border-neutral-700">
              <div className="flex justify-between">
                <span className="text-neutral-500">현금 출금</span>
                <span className="font-bold text-violet-600">{formatWon(split.cashAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">포인트 전환</span>
                <span className="font-semibold">{formatWon(split.pointAmount)}</span>
              </div>
              <div className="mt-1 border-t border-neutral-100 pt-1.5 text-xs text-neutral-400 dark:border-neutral-700">
                ※ 신청 시 출금가능잔액 전액이 처리되며 잔액은 0원이 됩니다. 현금 외 나머지는 포인트로 전환됩니다.
              </div>
            </div>

            {/* 은행 정보 — 회원정보에 계좌 있으면 비노출 */}
            {hasBank ? (
              <div className="mb-4 rounded-xl bg-neutral-50 p-3 text-sm dark:bg-neutral-800">
                <div className="mb-1 text-xs font-semibold text-neutral-500">출금 계좌</div>
                <div className="font-medium">
                  {summary.bank_name} {summary.bank_account_masked}
                </div>
                <div className="text-xs text-neutral-500">예금주 {summary.account_holder}</div>
              </div>
            ) : (
              <div className="mb-4 space-y-2.5">
                <div>
                  <label className="mb-1 block text-sm font-semibold">
                    은행 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={bankCode}
                    onChange={e => {
                      const selected = bankList.find(b => b.code === e.target.value)
                      setBankCode(e.target.value)
                      setBankName(selected?.name || '')
                    }}
                    className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-200 dark:border-neutral-700 dark:bg-neutral-800"
                  >
                    <option value="">은행 선택</option>
                    {bankList.map(b => (
                      <option key={b.code} value={b.code}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold">
                    계좌번호 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={bankAccount}
                    onChange={e => setBankAccount(e.target.value)}
                    placeholder="- 없이 숫자만"
                    className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-200 dark:border-neutral-700 dark:bg-neutral-800"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold">
                    예금주 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={accountHolder}
                    onChange={e => setAccountHolder(e.target.value)}
                    placeholder="예금주명"
                    className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-200 dark:border-neutral-700 dark:bg-neutral-800"
                  />
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full rounded-full bg-violet-600 py-3.5 text-sm font-bold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? '신청 중...' : '출금 신청'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
