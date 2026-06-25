'use client'

// KN541 동사가치배당 — 현금 출금 신청 팝업
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { mapMypageBankList, type BankCodeItem } from '@/lib/bankCodes'
import { MypageApiError, mypageFetch } from '@/lib/mypage/api'
import { applyWithdraw } from '@/lib/mypage/useWithdrawals'
import type { WithdrawSummaryData } from '@/lib/mypage/useWithdrawSummary'
import { clampCashRatio, formatWon, MAX_CASH_RATIO } from '@/lib/mypage/withdrawUtils'

interface Props {
  open: boolean
  summary: WithdrawSummaryData
  onClose: () => void
  onApplied?: () => void
}

type WithdrawPreview = {
  cash_ratio: number
  total_amount: number
  cash_amount: number
  point_amount: number
  tax_rate: number
  cash_tax: number
  point_tax: number
  cash_net: number
  point_net: number
}

function formatGwcp(n: number): string {
  return `${Math.floor(n || 0).toLocaleString('ko-KR')} GWCP`
}

export default function WithdrawModal({ open, summary, onClose, onApplied }: Props) {
  const total = Math.max(0, Math.floor(summary.withdrawable_balance || 0))
  const hasBank = !!summary.has_bank_account

  const [amountStr, setAmountStr] = useState('')
  const [cashRatioStr, setCashRatioStr] = useState('')
  const [bankCode, setBankCode] = useState('')
  const [bankName, setBankName] = useState('')
  const [bankList, setBankList] = useState<BankCodeItem[]>([])
  const [bankAccount, setBankAccount] = useState('')
  const [accountHolder, setAccountHolder] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [preview, setPreview] = useState<WithdrawPreview | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

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

  // 팝업이 열릴 때 출금 금액을 전액으로 초기화 (기본 동작 = 전액)
  useEffect(() => {
    if (open) setAmountStr(total > 0 ? total.toLocaleString('ko-KR') : '')
  }, [open, total])

  const cashRatio = useMemo(() => {
    const n = parseFloat(cashRatioStr)
    return Number.isFinite(n) ? n : NaN
  }, [cashRatioStr])

  const ratioValid = Number.isFinite(cashRatio) && cashRatio >= 0 && cashRatio <= MAX_CASH_RATIO

  // 출금 금액 (콤마 제거 후 정수 파싱)
  const amount = useMemo(() => {
    const digits = amountStr.replace(/[^0-9]/g, '')
    return digits ? parseInt(digits, 10) : NaN
  }, [amountStr])

  const amountOver = Number.isFinite(amount) && amount > total
  const amountValid = Number.isFinite(amount) && amount > 0 && amount <= total

  const handleAmountChange = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, '')
    setAmountStr(digits ? parseInt(digits, 10).toLocaleString('ko-KR') : '')
  }

  const handleFillAll = () => {
    setAmountStr(total > 0 ? total.toLocaleString('ko-KR') : '')
  }

  useEffect(() => {
    if (!open || !ratioValid || !amountValid || total <= 0) {
      setPreview(null)
      return
    }
    let cancelled = false
    setPreviewLoading(true)
    mypageFetch<{ preview?: WithdrawPreview }>(
      `/mypage/withdraw/summary?cash_ratio=${clampCashRatio(cashRatio)}&amount=${amount}`
    )
      .then(data => {
        if (!cancelled) setPreview(data.preview ?? null)
      })
      .catch(() => {
        if (!cancelled) setPreview(null)
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, cashRatio, ratioValid, amount, amountValid, total])

  if (!open) return null

  const ratioOver = Number.isFinite(cashRatio) && cashRatio > MAX_CASH_RATIO
  const bankValid = hasBank || (bankCode && bankName.trim() && bankAccount.trim() && accountHolder.trim())
  const canSubmit = total > 0 && amountValid && ratioValid && !!bankValid && !submitting

  const handleSubmit = async () => {
    if (!amountValid) {
      toast.error(amountOver ? '출금 금액이 출금 가능 잔액을 초과했습니다.' : '출금 금액을 입력해 주세요.')
      return
    }
    if (!ratioValid) {
      toast.error(ratioOver ? '현금 출금 비율은 50% 이하만 가능합니다.' : '현금 비율을 입력해 주세요.')
      return
    }
    if (!bankValid) {
      toast.error('은행명, 계좌번호, 예금주를 모두 입력해 주세요.')
      return
    }

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
        withdraw_amount: amount,
      })
      toast.success('출금 신청이 접수됐습니다.')
      onApplied?.()
      onClose()
    } catch (e) {
      if (e instanceof MypageApiError) {
        toast.error(e.message || '출금 신청에 실패했습니다.')
      } else {
        toast.error('출금 신청 중 오류가 발생했습니다.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const taxLabel = preview ? `원천세 ${preview.tax_rate}%` : '원천세'

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

        <div className="mb-5 rounded-2xl bg-violet-50 p-4 text-center dark:bg-violet-900/20">
          <div className="mb-1 text-xs text-neutral-500 dark:text-neutral-400">출금 가능 잔액</div>
          <div className="text-2xl font-black text-violet-600">{formatGwcp(total)}</div>
        </div>

        {total <= 0 ? (
          <p className="py-6 text-center text-sm text-neutral-500">출금 가능한 잔액이 없습니다.</p>
        ) : (
          <>
            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-semibold">
                출금 금액 (원) <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  value={amountStr}
                  onChange={e => handleAmountChange(e.target.value)}
                  placeholder="0"
                  className={`min-w-0 flex-1 rounded-xl border px-3 py-2.5 text-right text-sm outline-none focus:ring-2 dark:bg-neutral-800 ${
                    amountOver
                      ? 'border-red-400 focus:ring-red-200'
                      : 'border-neutral-200 focus:ring-violet-200 dark:border-neutral-700'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleFillAll}
                  className="shrink-0 rounded-xl border border-violet-300 px-4 py-2.5 text-sm font-semibold text-violet-600 transition hover:bg-violet-50 dark:border-violet-700 dark:hover:bg-violet-900/20"
                >
                  전액
                </button>
              </div>
              {amountOver ? (
                <p className="mt-1 text-xs text-red-500">
                  출금 가능 잔액({formatWon(total)})을 초과했습니다.
                </p>
              ) : (
                <p className="mt-1 text-xs text-neutral-400">
                  출금 가능 잔액: {formatWon(total)}
                </p>
              )}
            </div>

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

            <div className="mb-4 space-y-3 rounded-xl border border-neutral-200 p-3 text-sm dark:border-neutral-700">
              {previewLoading ? (
                <p className="py-2 text-center text-xs text-neutral-400">세금 계산 중…</p>
              ) : preview ? (
                <>
                  <div className="flex justify-between text-xs text-neutral-500">
                    <span>현금 비율</span>
                    <span>{preview.cash_ratio}%</span>
                  </div>

                  <div className="space-y-1.5 border-t border-neutral-100 pt-2 dark:border-neutral-700">
                    <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">■ 현금 출금</div>
                    <div className="flex justify-between pl-2">
                      <span className="text-neutral-500">배당금</span>
                      <span>{formatWon(preview.cash_amount)}</span>
                    </div>
                    <div className="flex justify-between pl-2 text-red-600">
                      <span>{taxLabel}</span>
                      <span>-{preview.cash_tax.toLocaleString('ko-KR')}원</span>
                    </div>
                    <div className="flex justify-between pl-2 font-bold">
                      <span>실수령</span>
                      <span className="text-violet-600">{formatWon(preview.cash_net)}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 border-t border-neutral-100 pt-2 dark:border-neutral-700">
                    <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">■ GWCP 전환</div>
                    <div className="flex justify-between pl-2">
                      <span className="text-neutral-500">배당금</span>
                      <span>{formatGwcp(preview.point_amount)}</span>
                    </div>
                    <div className="flex justify-between pl-2 text-red-600">
                      <span>{taxLabel}</span>
                      <span>-{formatGwcp(preview.point_tax)}</span>
                    </div>
                    <div className="flex justify-between pl-2 font-bold">
                      <span>실수령</span>
                      <span>{formatGwcp(preview.point_net)}</span>
                    </div>
                  </div>
                </>
              ) : ratioValid && amountValid ? (
                <p className="py-2 text-center text-xs text-neutral-400">미리보기를 불러오지 못했습니다.</p>
              ) : (
                <p className="py-2 text-center text-xs text-neutral-400">출금 금액과 현금 비율을 입력하면 세금 차감 내역이 표시됩니다.</p>
              )}

              <div className="border-t border-neutral-100 pt-2 text-xs text-neutral-400 dark:border-neutral-700">
                ※ 입력한 출금 금액만큼 처리되며, 잔여 금액은 출금 가능 잔액으로 유지됩니다.
              </div>
            </div>

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
