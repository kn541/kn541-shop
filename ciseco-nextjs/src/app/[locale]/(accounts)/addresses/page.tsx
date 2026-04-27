'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import ButtonSecondary from '@/shared/Button/ButtonSecondary'
import { toast } from 'react-hot-toast'
import KakaoAddressInput, { type AddressValue } from '@/components/common/KakaoAddressSearch'
import { mypageFetch, MypageApiError } from '@/lib/mypage/api'

const MAX_ADDRESSES = 5

interface MyAddress {
  id: string
  recipient_name: string
  recipient_phone: string
  zip_code: string
  address1: string
  address2: string | null
  delivery_memo?: string | null
  is_default: boolean
}

function normalizeRow(raw: Record<string, unknown>): MyAddress | null {
  const id = String(raw.id ?? raw.address_id ?? '')
  if (!id) return null
  return {
    id,
    recipient_name: String(raw.recipient_name ?? ''),
    recipient_phone: String(raw.recipient_phone ?? raw.phone ?? ''),
    zip_code: String(raw.zip_code ?? raw.zipcode ?? ''),
    address1: String(raw.address1 ?? ''),
    address2: raw.address2 != null ? String(raw.address2) : null,
    delivery_memo: raw.delivery_memo != null ? String(raw.delivery_memo) : null,
    is_default: Boolean(raw.is_default),
  }
}

const EMPTY_FORM = { recipient_name: '', recipient_phone: '', delivery_memo: '', is_default: false }
const EMPTY_ADDR: AddressValue = { zipcode: '', address1: '', address2: '' }

export default function AddressesPage() {
  const router = useRouter()
  const t = useTranslations('Account')
  const [addresses, setAddresses] = useState<MyAddress[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [address, setAddress] = useState<AddressValue>(EMPTY_ADDR)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await mypageFetch<{ items?: unknown[] } | unknown[]>('/my/addresses')
      const rows = Array.isArray(data) ? data : data?.items ?? []
      const next: MyAddress[] = []
      for (const r of rows) {
        if (r && typeof r === 'object') {
          const n = normalizeRow(r as Record<string, unknown>)
          if (n) next.push(n)
        }
      }
      setAddresses(next)
    } catch (e) {
      if (e instanceof MypageApiError && e.status === 401) {
        router.replace('/login')
        return
      }
      toast.error('배송지 목록을 불러오지 못했습니다.')
      setAddresses([])
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    void load()
  }, [load])

  async function saveAddress() {
    if (addresses.length >= MAX_ADDRESSES && !showForm) {
      toast.error(`배송지는 최대 ${MAX_ADDRESSES}개까지 등록할 수 있습니다.`)
      return
    }
    if (!form.recipient_name || !form.recipient_phone || !address.address1) {
      toast.error('필수 항목을 입력해 주세요.')
      return
    }
    try {
      await mypageFetch<unknown>('/my/addresses', {
        method: 'POST',
        body: JSON.stringify({
          recipient_name: form.recipient_name,
          recipient_phone: form.recipient_phone,
          zip_code: address.zipcode,
          address1: address.address1,
          address2: address.address2 || undefined,
          delivery_memo: form.delivery_memo || undefined,
          is_default: form.is_default,
        }),
      })
      toast.success('배송지가 추가되었습니다.')
      closeForm()
      await load()
    } catch (e) {
      const msg = e instanceof MypageApiError ? e.message : '저장에 실패했습니다.'
      toast.error(msg)
    }
  }

  async function deleteAddress(id: string) {
    if (!confirm('이 배송지를 삭제할까요?')) return
    try {
      await mypageFetch<unknown>(`/my/addresses/${encodeURIComponent(id)}`, { method: 'DELETE' })
      toast.success('배송지가 삭제되었습니다.')
      await load()
    } catch (e) {
      const msg = e instanceof MypageApiError ? e.message : '삭제에 실패했습니다.'
      toast.error(msg)
    }
  }

  async function setDefault(id: string) {
    try {
      await mypageFetch<unknown>(`/my/addresses/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_default: true }),
      })
      toast.success('기본 배송지로 설정되었습니다.')
      await load()
    } catch (e) {
      const msg = e instanceof MypageApiError ? e.message : '설정에 실패했습니다.'
      toast.error(msg)
    }
  }

  function openAddForm() {
    if (addresses.length >= MAX_ADDRESSES) {
      toast.error(`배송지는 최대 ${MAX_ADDRESSES}개까지 등록할 수 있습니다.`)
      return
    }
    setForm(EMPTY_FORM)
    setAddress(EMPTY_ADDR)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setForm(EMPTY_FORM)
    setAddress(EMPTY_ADDR)
  }

  const inp =
    'w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900'
  const lbl = 'mb-1 block text-sm font-medium'

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold sm:text-3xl">{t('addresses')}</h1>
        <ButtonPrimary onClick={openAddForm}>+ 배송지 추가</ButtonPrimary>
      </div>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        배송지는 최대 {MAX_ADDRESSES}개까지 저장할 수 있습니다.
      </p>

      {showForm && (
        <div className="space-y-4 rounded-2xl border border-neutral-200 p-6 dark:border-neutral-700">
          <h3 className="font-semibold">새 배송지</h3>
          <div>
            <label className={lbl}>받는 분 *</label>
            <input
              type="text"
              className={inp}
              placeholder="이름"
              value={form.recipient_name}
              onChange={e => setForm(p => ({ ...p, recipient_name: e.target.value }))}
            />
          </div>
          <div>
            <label className={lbl}>연락처 *</label>
            <input
              type="tel"
              className={inp}
              placeholder="010-0000-0000"
              value={form.recipient_phone}
              onChange={e => setForm(p => ({ ...p, recipient_phone: e.target.value }))}
            />
          </div>
          <KakaoAddressInput
            value={address}
            onChange={setAddress}
            label="주소 *"
            inputClassName={inp}
            labelClassName={lbl}
          />
          <div>
            <label className={lbl}>배송 메모</label>
            <input
              type="text"
              className={inp}
              placeholder="택배 기사님께 전달할 메모"
              value={form.delivery_memo}
              onChange={e => setForm(p => ({ ...p, delivery_memo: e.target.value }))}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_default}
              onChange={e => setForm(p => ({ ...p, is_default: e.target.checked }))}
            />
            기본 배송지로 설정
          </label>
          <div className="flex gap-3">
            <ButtonPrimary onClick={() => void saveAddress()}>저장</ButtonPrimary>
            <ButtonSecondary onClick={closeForm}>취소</ButtonSecondary>
          </div>
        </div>
      )}

      {addresses.length === 0 ? (
        <div className="py-12 text-center text-sm text-neutral-500">등록된 배송지가 없습니다.</div>
      ) : (
        <div className="space-y-3">
          {addresses.map(addr => (
            <div
              key={addr.id}
              className={`rounded-2xl border p-5 dark:border-neutral-700 ${
                addr.is_default
                  ? 'border-primary-300 bg-primary-50/30 dark:border-primary-700'
                  : 'border-neutral-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{addr.recipient_name}</p>
                    {addr.is_default && (
                      <span className="rounded-full bg-primary-500 px-2 py-0.5 text-xs text-white">기본</span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-500">{addr.recipient_phone}</p>
                  <p className="text-sm">
                    [{addr.zip_code}] {addr.address1}
                  </p>
                  {addr.address2 && <p className="text-sm text-neutral-500">{addr.address2}</p>}
                  {addr.delivery_memo && (
                    <p className="mt-1 text-xs text-neutral-400">메모: {addr.delivery_memo}</p>
                  )}
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  {!addr.is_default && (
                    <button
                      type="button"
                      onClick={() => void setDefault(addr.id)}
                      className="rounded-lg bg-neutral-100 px-3 py-1.5 text-xs hover:bg-neutral-200 dark:bg-neutral-800"
                    >
                      기본 설정
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => void deleteAddress(addr.id)}
                    className="rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-600 hover:bg-red-100 dark:bg-red-900/30"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
