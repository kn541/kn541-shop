'use client'

import { useState, useTransition, type CSSProperties } from 'react'
import { useRouter } from '@/i18n/navigation'
import { toast } from 'react-hot-toast'
import BigButton from '@/components/mypage/BigButton'
import L3Guard from '@/components/mypage/L3Guard'
import { MOCK_DIVIDEND_SUMMARY } from '@/lib/mypage/mocks'

const BANKS = [
  '국민은행', '신한은행', '우리은행', '하나은행', '농협은행',
  '기업은행', 'SC제일은행', '씨티은행', '카카오뱅크', '토스뱅크',
  '케이뱅크', '우체국', '수협은행', '대구은행', '부산은행',
]

const QUICK_AMOUNTS = [100_000, 500_000, 1_000_000]

interface FormState {
  amount: string
  bank: string
  account: string
  holder: string
}

function Step1Form({
  form,
  onChange,
  onNext,
  balance,
}: {
  form: FormState
  onChange: (f: FormState) => void
  onNext: () => void
  balance: number
}) {
  const amountNum = Number(form.amount.replace(/,/g, ''))
  const overBalance = amountNum > balance
  const underMin = amountNum > 0 && amountNum < 10_000
  const canNext =
    !overBalance && !underMin && amountNum > 0 && form.bank && form.account.trim() && form.holder.trim()

  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box' as const,
    height: 56,
    padding: '0 16px',
    border: '1px solid var(--mp-color-border)',
    borderRadius: 'var(--mp-radius)',
    fontSize: 18,
    outline: 'none',
    background: '#fff',
  }

  const setAmount = (v: number) => onChange({ ...form, amount: String(v) })

  return (
    <div style={{ padding: 16 }}>
      <div
        style={{
          background: 'var(--mp-color-bg)',
          borderRadius: 'var(--mp-radius)',
          padding: '12px 16px',
          marginBottom: 24,
          fontSize: 15,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ color: 'var(--mp-color-text-muted)' }}>출금 가능 잔액</span>
        <strong style={{ color: '#7C3AED' }}>{balance.toLocaleString('ko-KR')}원</strong>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
          출금 금액 <span style={{ color: 'var(--mp-color-danger)' }}>*</span>
        </label>
        <input
          type="number"
          value={form.amount}
          onChange={e => onChange({ ...form, amount: e.target.value })}
          placeholder="금액 입력 (최소 10,000원)"
          style={{
            ...inputStyle,
            borderColor: overBalance ? 'var(--mp-color-danger)' : 'var(--mp-color-border)',
          }}
        />
        {overBalance && (
          <div style={{ fontSize: 15, color: 'var(--mp-color-danger)', fontWeight: 700, marginTop: 6 }}>
            ⚠️ 출금 가능 잔액을 초과했습니다.
          </div>
        )}
        {underMin && (
          <div style={{ fontSize: 15, color: 'var(--mp-color-danger)', fontWeight: 700, marginTop: 6 }}>
            ⚠️ 최소 출금 금액은 10,000원입니다.
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setAmount(balance)}
            style={{
              padding: '6px 14px',
              border: '1px solid var(--mp-color-primary)',
              borderRadius: 20,
              fontSize: 14,
              background: '#fff',
              color: 'var(--mp-color-primary)',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            전액
          </button>
          {QUICK_AMOUNTS.map(a => (
            <button
              key={a}
              type="button"
              onClick={() => setAmount(a)}
              disabled={a > balance}
              style={{
                padding: '6px 14px',
                border: '1px solid var(--mp-color-border)',
                borderRadius: 20,
                fontSize: 14,
                background: a > balance ? '#F5F5F5' : '#fff',
                color: a > balance ? 'var(--mp-color-text-muted)' : 'var(--mp-color-text)',
                cursor: a > balance ? 'not-allowed' : 'pointer',
              }}
            >
              {(a / 10_000).toLocaleString()}만원
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
          은행 <span style={{ color: 'var(--mp-color-danger)' }}>*</span>
        </label>
        <select
          value={form.bank}
          onChange={e => onChange({ ...form, bank: e.target.value })}
          style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
        >
          <option value="">은행 선택</option>
          {BANKS.map(b => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
          계좌번호 <span style={{ color: 'var(--mp-color-danger)' }}>*</span>
        </label>
        <input
          type="text"
          value={form.account}
          onChange={e => onChange({ ...form, account: e.target.value })}
          placeholder="숫자만 입력 (예: 123456789012)"
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: 32 }}>
        <label style={{ display: 'block', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
          예금주 <span style={{ color: 'var(--mp-color-danger)' }}>*</span>
        </label>
        <input
          type="text"
          value={form.holder}
          onChange={e => onChange({ ...form, holder: e.target.value })}
          placeholder="예금주 이름"
          style={inputStyle}
        />
      </div>

      <BigButton fullWidth onClick={onNext} disabled={!canNext}>
        다음 ▶ 내용 확인
      </BigButton>
    </div>
  )
}

function Step2Confirm({
  form,
  onPrev,
  onSubmit,
  submitting,
}: {
  form: FormState
  onPrev: () => void
  onSubmit: () => void
  submitting: boolean
}) {
  const [checked, setChecked] = useState(false)
  const amount = Number(form.amount)

  return (
    <div style={{ padding: 16 }}>
      <div
        style={{
          background: '#FFF9E6',
          border: '1px solid #FDE68A',
          borderRadius: 'var(--mp-radius)',
          padding: '14px 16px',
          fontSize: 15,
          color: '#92400E',
          lineHeight: 1.7,
          marginBottom: 20,
        }}
      >
        ⚠️ 아래 내용으로 출금 신청합니다.
        <br />
        <strong>제출 후 취소가 어려우니 꼭 확인해 주세요.</strong>
      </div>

      <div
        style={{
          background: '#fff',
          borderRadius: 'var(--mp-radius-lg)',
          border: '2px solid var(--mp-color-primary)',
          padding: 20,
          marginBottom: 24,
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 14, color: 'var(--mp-color-text-muted)', marginBottom: 4 }}>출금 금액</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: '#7C3AED' }}>{amount.toLocaleString('ko-KR')}원</div>
        </div>
        <div style={{ borderTop: '1px solid var(--mp-color-border)', paddingTop: 16 }}>
          <div style={{ fontSize: 14, color: 'var(--mp-color-text-muted)', marginBottom: 8 }}>받을 계좌</div>
          <div style={{ fontSize: 17, fontWeight: 600 }}>
            {form.bank} {form.account}
          </div>
          <div style={{ fontSize: 15, color: 'var(--mp-color-text-muted)', marginTop: 4 }}>예금주: {form.holder}</div>
        </div>
      </div>

      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 32,
          cursor: 'pointer',
          padding: '14px 16px',
          background: checked ? '#F3EFFF' : '#F8F7FA',
          borderRadius: 'var(--mp-radius)',
          border: `1px solid ${checked ? '#7C3AED' : 'var(--mp-color-border)'}`,
        }}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={e => setChecked(e.target.checked)}
          style={{ width: 22, height: 22, accentColor: '#7C3AED', cursor: 'pointer' }}
        />
        <span style={{ fontSize: 16, fontWeight: checked ? 700 : 400 }}>위 정보가 정확합니다</span>
      </label>

      <div style={{ display: 'flex', gap: 12 }}>
        <BigButton variant="secondary" onClick={onPrev} style={{ flex: '0 0 96px' } as CSSProperties}>
          ◀ 수정
        </BigButton>
        <BigButton fullWidth onClick={onSubmit} disabled={!checked || submitting}>
          {submitting ? '신청 중…' : '✅ 출금 신청'}
        </BigButton>
      </div>
    </div>
  )
}

function NewWithdrawContent() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [form, setForm] = useState<FormState>({ amount: '', bank: '', account: '', holder: '' })
  const [submitting, startTransition] = useTransition()

  const balance = MOCK_DIVIDEND_SUMMARY.withdrawable_balance

  const handleSubmit = () => {
    startTransition(async () => {
      await new Promise(r => setTimeout(r, 1_000))
      toast.success('출금 신청이 완료됐습니다. 영업일 기준 2~3일 내 처리됩니다.')
      router.replace('/withdraw')
    })
  }

  return (
    <>
      <h1 className="text-2xl font-semibold sm:text-3xl">
        {step === 1 ? '새 출금 신청' : '출금 내용 확인'}
      </h1>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0,
          padding: '14px 0',
          background: '#fff',
          borderBottom: '1px solid var(--mp-color-border)',
        }}
      >
        {[1, 2].map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
            {i > 0 && (
              <div
                style={{
                  width: 48,
                  height: 3,
                  background: step >= s ? '#7C3AED' : 'var(--mp-color-border)',
                }}
              />
            )}
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 700,
                background: step >= s ? '#7C3AED' : 'var(--mp-color-border)',
                color: step >= s ? '#fff' : 'var(--mp-color-text-muted)',
              }}
            >
              {step > s ? '✓' : s}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          padding: '6px 0',
          background: '#fff',
          borderBottom: '1px solid var(--mp-color-border)',
        }}
      >
        {['신청 정보', '최종 확인'].map((label, i) => (
          <div
            key={label}
            style={{
              fontSize: 13,
              fontWeight: step === i + 1 ? 700 : 400,
              color: step === i + 1 ? '#7C3AED' : 'var(--mp-color-text-muted)',
              flex: 1,
              textAlign: 'center',
            }}
          >
            {label}
          </div>
        ))}
      </div>

      {step === 1 && (
        <Step1Form form={form} onChange={setForm} onNext={() => setStep(2)} balance={balance} />
      )}
      {step === 2 && (
        <Step2Confirm form={form} onPrev={() => setStep(1)} onSubmit={handleSubmit} submitting={submitting} />
      )}
    </>
  )
}

export default function NewWithdrawPage() {
  return (
    <L3Guard embedded title="새 출금 신청">
      <NewWithdrawContent />
    </L3Guard>
  )
}
