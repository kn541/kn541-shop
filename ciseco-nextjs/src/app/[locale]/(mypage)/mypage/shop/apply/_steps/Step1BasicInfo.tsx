import BigButton from '@/components/mypage/BigButton'
import type { ShopApplyFormState } from '@/lib/mypage/types'

interface Props {
  form: ShopApplyFormState
  onChange: (f: ShopApplyFormState) => void
  onNext: () => void
}

export default function Step1BasicInfo({ form, onChange, onNext }: Props) {
  const nameLen = form.shop_name.trim().length
  const canNext = nameLen >= 2

  return (
    <div>
      <div style={{ textAlign: 'center', padding: '24px 0 32px' }}>
        <div style={{ fontSize: 14, color: 'var(--mp-color-text-muted)', marginBottom: 8 }}>1 / 3</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
          쇼핑몰 이름을 정해주세요
        </h2>
        <p style={{ fontSize: 16, color: 'var(--mp-color-text-muted)', marginTop: 8 }}>
          나중에 바꿀 수 있어요.
        </p>
      </div>

      {/* 이름 */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
          쇼핑몰 이름 <span style={{ color: 'var(--mp-color-danger)' }}>*</span>
        </label>
        <input
          type='text'
          value={form.shop_name}
          onChange={e => onChange({ ...form, shop_name: e.target.value })}
          maxLength={50}
          placeholder='예: 영희네 건강샵'
          style={{
            width: '100%', boxSizing: 'border-box',
            height: 64, padding: '0 16px',
            border: '2px solid var(--mp-color-border)',
            borderRadius: 'var(--mp-radius)',
            fontSize: 22, outline: 'none', background: '#fff',
          }}
        />
        <div style={{ fontSize: 13, color: 'var(--mp-color-text-muted)', marginTop: 6, textAlign: 'right' }}>
          {nameLen} / 50
        </div>
        {nameLen > 0 && nameLen < 2 && (
          <div style={{ fontSize: 14, color: 'var(--mp-color-danger)', marginTop: 4 }}>
            2자 이상 입력해주세요.
          </div>
        )}
      </div>

      {/* 소개 */}
      <div style={{ marginBottom: 32 }}>
        <label style={{ display: 'block', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
          간단한 소개 <span style={{ fontSize: 13, color: 'var(--mp-color-text-muted)' }}>(선택)</span>
        </label>
        <textarea
          value={form.shop_description}
          onChange={e => onChange({ ...form, shop_description: e.target.value })}
          maxLength={500}
          placeholder='상품 소개부에 표시됩니다.'
          rows={4}
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '12px 16px',
            border: '2px solid var(--mp-color-border)',
            borderRadius: 'var(--mp-radius)',
            fontSize: 18, lineHeight: 1.6,
            resize: 'vertical', outline: 'none', background: '#fff',
          }}
        />
        <div style={{ fontSize: 13, color: 'var(--mp-color-text-muted)', marginTop: 4, textAlign: 'right' }}>
          {form.shop_description.length} / 500
        </div>
      </div>

      <BigButton fullWidth onClick={onNext} disabled={!canNext}>
        다음 ▶
      </BigButton>
    </div>
  )
}
