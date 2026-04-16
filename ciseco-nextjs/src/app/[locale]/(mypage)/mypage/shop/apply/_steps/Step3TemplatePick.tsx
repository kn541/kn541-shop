import BigButton from '@/components/mypage/BigButton'
import { MOCK_TEMPLATES } from '@/lib/mypage/mocks'
import type { ShopApplyFormState, ShopTemplateCode } from '@/lib/mypage/types'

interface Props {
  form: ShopApplyFormState
  onChange: (f: ShopApplyFormState) => void
  onPrev: () => void
  onSubmit: () => void
}

export default function Step3TemplatePick({ form, onChange, onPrev, onSubmit }: Props) {
  return (
    <div>
      <div style={{ textAlign: 'center', padding: '24px 0 32px' }}>
        <div style={{ fontSize: 14, color: 'var(--mp-color-text-muted)', marginBottom: 8 }}>3 / 3</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>주제를 골라주세요</h2>
        <p style={{ fontSize: 16, color: 'var(--mp-color-text-muted)', marginTop: 8 }}>나중에 언제든지 바꿀 수 있어요.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
        {MOCK_TEMPLATES.map(t => {
          const selected = form.template_code === t.template_code
          return (
            <button
              key={t.template_code}
              onClick={() => onChange({ ...form, template_code: t.template_code as ShopTemplateCode })}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: 16,
                background: '#fff',
                border: `2px solid ${selected ? t.primary_color : 'var(--mp-color-border)'}`,
                borderRadius: 'var(--mp-radius-lg)',
                cursor: 'pointer', textAlign: 'left', width: '100%',
              }}
            >
              <div style={{
                width: 72, height: 72, flexShrink: 0, borderRadius: 8,
                background: t.primary_color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24,
              }}>
                🏪
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{t.template_name}</div>
                <div style={{ fontSize: 14, color: 'var(--mp-color-text-muted)' }}>{t.description}</div>
              </div>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: selected ? t.primary_color : '#E9E9E9',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: 16,
              }}>
                {selected ? '✓' : ''}
              </div>
            </button>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        {/* BigButton은 style prop 미지원 → div 래퍼로 너비 제어 */}
        <div style={{ flex: '0 0 80px' }}>
          <BigButton variant='secondary' onClick={onPrev}>
            ◄ 이전
          </BigButton>
        </div>
        <div style={{ flex: 1 }}>
          <BigButton fullWidth onClick={onSubmit}>
            신청 완료 ✨
          </BigButton>
        </div>
      </div>
    </div>
  )
}
