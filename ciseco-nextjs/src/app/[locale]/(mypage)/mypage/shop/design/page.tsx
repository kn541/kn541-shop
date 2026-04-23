'use client'
import type { ChangeEvent, CSSProperties, ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import BackHeader from '@/components/mypage/BackHeader'
import BigButton from '@/components/mypage/BigButton'
import { MOCK_TEMPLATES } from '@/lib/mypage/mocks'
import type { ShopTemplateCode } from '@/lib/mypage/types'
import {
  apiTemplateToUi,
  deleteMyShopLogo,
  patchMyShopDesign,
  postMyShopLogoInfo,
  uploadMemberImage,
  uiTemplateToApi,
  useMyShop,
} from '@/lib/mypage/useMyShop'
import { MypageApiError } from '@/lib/mypage/api'

export default function ShopDesignPage() {
  const { shop, loading, error, refetch } = useMyShop(true)
  const [selected, setSelected] = useState<ShopTemplateCode>('CLASSIC')
  const [savingTpl, setSavingTpl] = useState(false)
  const [savingLogo, setSavingLogo] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (error) toast.error(error.message)
  }, [error])

  useEffect(() => {
    if (shop?.template_code) {
      setSelected(apiTemplateToUi(String(shop.template_code)))
    }
  }, [shop?.template_code])

  const handleSaveTemplate = async () => {
    setSavingTpl(true)
    try {
      const res = await patchMyShopDesign(uiTemplateToApi(selected))
      toast.success(res.message ?? '템플릿을 저장했어요.')
      await refetch()
    } catch (e) {
      toast.error(e instanceof MypageApiError ? e.message : '저장에 실패했습니다.')
    } finally {
      setSavingTpl(false)
    }
  }

  const handleLogoInfo = async () => {
    try {
      const res = await postMyShopLogoInfo()
      toast(res.message ?? '안내를 확인해주세요.', { icon: 'ℹ️' })
    } catch (e) {
      toast.error(e instanceof MypageApiError ? e.message : '요청에 실패했습니다.')
    }
  }

  const handleLogoFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setSavingLogo(true)
    try {
      const url = await uploadMemberImage(file)
      toast.success(`업로드 완료. URL이 클립보드에 복사됩니다.`)
      await navigator.clipboard.writeText(url)
      await handleLogoInfo()
    } catch (err) {
      toast.error(err instanceof MypageApiError ? err.message : '업로드에 실패했습니다.')
    } finally {
      setSavingLogo(false)
    }
  }

  const handleDeleteLogo = async () => {
    if (!window.confirm('로고를 삭제할까요?')) return
    try {
      await deleteMyShopLogo()
      toast.success('로고를 삭제했어요.')
      await refetch()
    } catch (e) {
      toast.error(e instanceof MypageApiError ? e.message : '삭제에 실패했습니다.')
    }
  }

  if (loading || !shop) {
    return (
      <>
        <BackHeader title='쇼핑몰 꾸미기' />
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--mp-color-text-muted)' }}>불러오는 중…</div>
      </>
    )
  }

  return (
    <>
      <BackHeader title='쇼핑몰 꾸미기' />

      <div style={{ padding: 16 }}>
        <SectionTitle>템플릿</SectionTitle>
        <p style={{ fontSize: 14, color: 'var(--mp-color-text-muted)', marginBottom: 12 }}>
          선택 후 저장하면 PATCH /myshop/design 로 반영됩니다.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          {MOCK_TEMPLATES.map(t => {
            const isSel = selected === t.template_code
            return (
              <button
                key={t.template_code}
                type='button'
                onClick={() => setSelected(t.template_code)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: 16, background: '#fff',
                  border: `2px solid ${isSel ? t.primary_color : 'var(--mp-color-border)'}`,
                  borderRadius: 'var(--mp-radius-lg)',
                  cursor: 'pointer', textAlign: 'left', width: '100%',
                }}
              >
                <div style={{
                  width: 56, height: 56, flexShrink: 0, borderRadius: 8,
                  background: t.primary_color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22,
                }}>🏪</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 17, fontWeight: 700 }}>{t.template_name}</div>
                  <div style={{ fontSize: 13, color: 'var(--mp-color-text-muted)' }}>{t.description}</div>
                  <div style={{ fontSize: 12, color: 'var(--mp-color-text-muted)', marginTop: 4 }}>
                    코드: {uiTemplateToApi(t.template_code)}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
        <BigButton fullWidth onClick={() => void handleSaveTemplate()} disabled={savingTpl}>
          {savingTpl ? '저장 중…' : '템플릿 저장'}
        </BigButton>

        <SectionTitle style={{ marginTop: 32 }}>로고</SectionTitle>
        <p style={{ fontSize: 14, color: 'var(--mp-color-text-muted)', marginBottom: 12, lineHeight: 1.6 }}>
          POST /myshop/logo 로 업로드 정책을 확인한 뒤, 이미지는 POST /upload/file (bucket=members) 로 올릴 수 있어요.
          저장된 공개 URL은 복사되어 안내 토스트로 확인할 수 있습니다.
        </p>
        {shop.logo_url && (
          <div style={{ marginBottom: 12, textAlign: 'center' }}>
            <img
              src={String(shop.logo_url)}
              alt='현재 로고'
              style={{ maxWidth: 160, maxHeight: 160, borderRadius: 12, border: '1px solid var(--mp-color-border)' }}
            />
          </div>
        )}
        <input ref={fileRef} type='file' accept='image/*' style={{ display: 'none' }} onChange={e => void handleLogoFile(e)} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <BigButton
            variant='secondary'
            fullWidth
            onClick={() => void handleLogoInfo()}
          >
            로고 업로드 안내 (POST /myshop/logo)
          </BigButton>
          <BigButton
            fullWidth
            onClick={() => fileRef.current?.click()}
            disabled={savingLogo}
          >
            {savingLogo ? '업로드 중…' : '이미지 파일 업로드 (/upload/file)'}
          </BigButton>
          <BigButton variant='secondary' fullWidth onClick={() => void handleDeleteLogo()}>
            로고 삭제 (DELETE /myshop/logo)
          </BigButton>
        </div>
      </div>
    </>
  )
}

function SectionTitle({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 8px', ...style }}>{children}</h2>
  )
}
