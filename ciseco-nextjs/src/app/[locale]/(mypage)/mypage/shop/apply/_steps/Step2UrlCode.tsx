'use client'
import { useEffect, useRef, useState } from 'react'
import BigButton from '@/components/mypage/BigButton'
import { checkShopUrlCode } from '@/lib/mypage/useMyShop'
import { MypageApiError } from '@/lib/mypage/api'
import type { ShopApplyFormState } from '@/lib/mypage/types'

/** 백엔드 /myshop/check-url 과 동일: 영문+숫자 6~20자 */
const URL_REGEX = /^[a-zA-Z0-9]{6,20}$/

const SHOP_URL_PREVIEW_BASE =
  process.env.NEXT_PUBLIC_SHOP_DISPLAY_BASE || 'https://kn541shop.com/shop'

type CheckStatus = 'idle' | 'checking' | 'ok' | 'error'

interface Props {
  form: ShopApplyFormState
  onChange: (f: ShopApplyFormState) => void
  onPrev: () => void
  onNext: () => void
}

export default function Step2UrlCode({ form, onChange, onPrev, onNext }: Props) {
  const [status, setStatus] = useState<CheckStatus>('idle')
  const [errMsg, setErrMsg] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = (raw: string) => {
    const cleaned = raw.replace(/[^a-zA-Z0-9]/g, '')
    onChange({ ...form, shop_url_code: cleaned })

    if (!cleaned) { setStatus('idle'); setErrMsg(''); return }
    if (cleaned.length < 6) {
      setStatus('error')
      setErrMsg('6자 이상 입력해주세요.')
      return
    }
    if (cleaned.length > 20) {
      setStatus('error')
      setErrMsg('20자 이하로 입력해주세요.')
      return
    }
    if (!URL_REGEX.test(cleaned)) {
      setStatus('error')
      setErrMsg('영문(a~z, A~Z)과 숫자만 사용할 수 있어요.')
      return
    }

    setStatus('checking')
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      void (async () => {
        try {
          const result = await checkShopUrlCode(cleaned)
          if (result.available) {
            setStatus('ok'); setErrMsg('')
          } else {
            setStatus('error')
            setErrMsg(result.reason || '이미 사용 중인 주소예요.')
          }
        } catch (e) {
          setStatus('error')
          setErrMsg(
            e instanceof MypageApiError ? e.message : '주소 확인에 실패했습니다.'
          )
        }
      })()
    }, 400)
  }

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  const borderColor =
    status === 'ok'    ? 'var(--mp-color-success)' :
    status === 'error' ? 'var(--mp-color-danger)'  :
    'var(--mp-color-border)'

  return (
    <div>
      <div style={{ textAlign: 'center', padding: '24px 0 32px' }}>
        <div style={{ fontSize: 14, color: 'var(--mp-color-text-muted)', marginBottom: 8 }}>2 / 3</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>URL 주소를 정해주세요</h2>
        <p style={{ fontSize: 16, color: 'var(--mp-color-text-muted)', marginTop: 8 }}>
          이 주소로 내 가게를 공유할 수 있어요.
        </p>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
          URL 코드 <span style={{ color: 'var(--mp-color-danger)' }}>*</span>
        </label>
        <input
          type='text'
          value={form.shop_url_code}
          onChange={e => handleChange(e.target.value)}
          maxLength={20}
          placeholder='hongshop12'
          style={{
            width: '100%', boxSizing: 'border-box',
            height: 64, padding: '0 16px',
            border: `2px solid ${borderColor}`,
            borderRadius: 'var(--mp-radius)',
            fontSize: 22, outline: 'none', background: '#fff',
          }}
        />
      </div>

      <div style={{ marginBottom: 8, fontSize: 15, minHeight: 24 }}>
        {status === 'checking' && <span style={{ color: 'var(--mp-color-text-muted)' }}>확인 중…</span>}
        {status === 'ok'       && <span style={{ color: 'var(--mp-color-success)' }}>✅ 사용할 수 있어요!</span>}
        {status === 'error'    && <span style={{ color: 'var(--mp-color-danger)' }}>❌ {errMsg}</span>}
        {status === 'idle'     && (
          <span style={{ fontSize: 13, color: 'var(--mp-color-text-muted)' }}>
            ⚠️ 영문·숫자만, 6~20자 (백엔드 정책과 동일)
          </span>
        )}
      </div>

      {form.shop_url_code && (
        <div style={{
          background: 'var(--mp-color-bg)',
          border: '1px solid var(--mp-color-border)',
          borderRadius: 'var(--mp-radius)', padding: '12px 16px',
          fontSize: 15, marginBottom: 32, wordBreak: 'break-all',
        }}>
          <span style={{ color: 'var(--mp-color-text-muted)' }}>{SHOP_URL_PREVIEW_BASE}/</span>
          <strong style={{ color: 'var(--mp-color-primary)' }}>{form.shop_url_code}</strong>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: '0 0 80px' }}>
          <BigButton variant='secondary' onClick={onPrev}>
            ◄ 이전
          </BigButton>
        </div>
        <div style={{ flex: 1 }}>
          <BigButton fullWidth onClick={onNext} disabled={status !== 'ok'}>
            다음 ▶
          </BigButton>
        </div>
      </div>
    </div>
  )
}
