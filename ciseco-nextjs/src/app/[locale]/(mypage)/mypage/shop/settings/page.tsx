'use client'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import BackHeader from '@/components/mypage/BackHeader'
import BigButton from '@/components/mypage/BigButton'
import { MypageApiError } from '@/lib/mypage/api'
import { patchMyShop, useMyShop } from '@/lib/mypage/useMyShop'

export default function ShopSettingsPage() {
  const { shop, loading, error, refetch } = useMyShop(true)
  const [shopName, setShopName] = useState('')
  const [shopDescription, setShopDescription] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (error) toast.error(error.message)
  }, [error])

  useEffect(() => {
    if (!shop) return
    setShopName(shop.shop_name ?? '')
    setShopDescription(String(shop.shop_description ?? ''))
  }, [shop])

  const handleSave = async () => {
    if (!shopName.trim()) {
      toast.error('쇼핑몰 이름을 입력해주세요.')
      return
    }
    setSaving(true)
    try {
      await patchMyShop({
        shop_name: shopName.trim(),
        shop_description: shopDescription.trim() || null,
      })
      toast.success('저장했어요.')
      await refetch()
    } catch (e) {
      toast.error(e instanceof MypageApiError ? e.message : '저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !shop) {
    return (
      <>
        <BackHeader title='쇼핑몰 설정' />
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--mp-color-text-muted)' }}>불러오는 중…</div>
      </>
    )
  }

  return (
    <>
      <BackHeader title='쇼핑몰 설정' />

      <div style={{ padding: 16 }}>
        <p style={{ fontSize: 14, color: 'var(--mp-color-text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
          PATCH /myshop 으로 이름·소개를 수정합니다. URL 코드 변경은 별도 검증이 필요해 이 화면에서는 다루지 않습니다.
        </p>

        <label style={{ display: 'block', fontSize: 15, fontWeight: 600, marginBottom: 8 }}>쇼핑몰 이름</label>
        <input
          value={shopName}
          onChange={e => setShopName(e.target.value)}
          style={{
            width: '100%', boxSizing: 'border-box', height: 52, padding: '0 14px',
            border: '1px solid var(--mp-color-border)', borderRadius: 'var(--mp-radius)',
            fontSize: 17, marginBottom: 20, background: '#fff',
          }}
        />

        <label style={{ display: 'block', fontSize: 15, fontWeight: 600, marginBottom: 8 }}>소개 (선택)</label>
        <textarea
          value={shopDescription}
          onChange={e => setShopDescription(e.target.value)}
          rows={5}
          placeholder='쇼핑몰 소개를 적어주세요.'
          style={{
            width: '100%', boxSizing: 'border-box', padding: 14,
            border: '1px solid var(--mp-color-border)', borderRadius: 'var(--mp-radius)',
            fontSize: 16, marginBottom: 24, resize: 'vertical', background: '#fff',
          }}
        />

        <BigButton fullWidth onClick={() => void handleSave()} disabled={saving}>
          {saving ? '저장 중…' : '저장하기'}
        </BigButton>

        <div style={{ marginTop: 24, padding: 14, background: 'var(--mp-color-bg)', borderRadius: 'var(--mp-radius)', fontSize: 13, color: 'var(--mp-color-text-muted)' }}>
          <div>URL 코드: <strong style={{ color: 'var(--mp-color-text)' }}>{shop.shop_url_code}</strong></div>
          <div style={{ marginTop: 6 }}>공개 주소: {shop.shop_url ?? '-'}</div>
        </div>
      </div>
    </>
  )
}
