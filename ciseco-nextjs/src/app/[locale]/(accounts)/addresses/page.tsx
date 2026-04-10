'use client'

import { useEffect, useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import ButtonSecondary from '@/shared/Button/ButtonSecondary'
import { toast } from 'react-hot-toast'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'https://kn541-production.up.railway.app'

function getHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
}

interface Address {
  id: string
  recipient_name: string
  phone: string
  zipcode: string
  address1: string
  address2: string | null
  is_default: boolean
}

export default function AddressesPage() {
  const router = useRouter()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({
    recipient_name: '', phone: '', zipcode: '', address1: '', address2: '', is_default: false,
  })

  useEffect(() => {
    fetchMe()
  }, [])

  async function fetchMe() {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) { router.push('/login'); return }
      const me = await fetch(`${BASE}/auth/me`, { headers: getHeaders() })
      if (me.status === 401) { router.push('/login'); return }
      const data = await me.json()
      const uid = data.data?.user_id
      setUserId(uid)
      fetchAddresses(uid)
    } catch {}
  }

  async function fetchAddresses(uid: string) {
    try {
      const r = await fetch(`${BASE}/members/${uid}/addresses`, { headers: getHeaders() })
      const data = await r.json()
      setAddresses(data.data?.items || [])
    } catch {
      toast.error('배송지 목록을 불러오지 못했습니다')
    } finally {
      setLoading(false)
    }
  }

  async function saveAddress() {
    if (!form.recipient_name || !form.phone || !form.address1) {
      toast.error('필수 항목을 입력해주세요'); return
    }
    try {
      const url = editId
        ? `${BASE}/members/${userId}/addresses/${editId}`
        : `${BASE}/members/${userId}/addresses`
      const method = editId ? 'PATCH' : 'POST'
      const r = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(form) })
      if (r.ok) {
        toast.success(editId ? '배송지가 수정됐습니다' : '배송지가 추가됐습니다')
        setShowForm(false)
        setEditId(null)
        setForm({ recipient_name: '', phone: '', zipcode: '', address1: '', address2: '', is_default: false })
        fetchAddresses(userId)
      } else {
        toast.error('저장에 실패했습니다')
      }
    } catch {
      toast.error('오류가 발생했습니다')
    }
  }

  async function deleteAddress(id: string) {
    if (!confirm('이 배송지를 삭제할까요?')) return
    try {
      await fetch(`${BASE}/members/${userId}/addresses/${id}`, { method: 'DELETE', headers: getHeaders() })
      toast.success('배송지가 삭제됐습니다')
      fetchAddresses(userId)
    } catch {
      toast.error('오류가 발생했습니다')
    }
  }

  async function setDefault(id: string) {
    try {
      await fetch(`${BASE}/members/${userId}/addresses/${id}/default`, { method: 'PATCH', headers: getHeaders() })
      toast.success('기본 배송지로 설정됐습니다')
      fetchAddresses(userId)
    } catch {
      toast.error('오류가 발생했습니다')
    }
  }

  function startEdit(addr: Address) {
    setEditId(addr.id)
    setForm({
      recipient_name: addr.recipient_name,
      phone: addr.phone,
      zipcode: addr.zipcode,
      address1: addr.address1,
      address2: addr.address2 || '',
      is_default: addr.is_default,
    })
    setShowForm(true)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
    </div>
  )

  return (
    <div className="flex flex-col gap-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold sm:text-3xl">배송지 관리</h1>
        <ButtonPrimary onClick={() => { setShowForm(true); setEditId(null); setForm({ recipient_name: '', phone: '', zipcode: '', address1: '', address2: '', is_default: false }) }}>
          + 배송지 추가
        </ButtonPrimary>
      </div>

      {/* 추가/수정 폼 */}
      {showForm && (
        <div className="space-y-4 rounded-2xl border border-neutral-200 p-6 dark:border-neutral-700">
          <h3 className="font-semibold">{editId ? '배송지 수정' : '새 배송지'}</h3>
          {[{ key: 'recipient_name', label: '받는 분 *', type: 'text', placeholder: '이름' },
            { key: 'phone', label: '연락처 *', type: 'tel', placeholder: '010-0000-0000' },
            { key: 'zipcode', label: '우편번호', type: 'text', placeholder: '우편번호' },
            { key: 'address1', label: '주소 *', type: 'text', placeholder: '기본 주소' },
            { key: 'address2', label: '상세 주소', type: 'text', placeholder: '상세 주소 (선택)' },
          ].map(f => (
            <div key={f.key}>
              <label className="mb-1 block text-sm font-medium">{f.label}</label>
              <input
                type={f.type}
                value={(form as any)[f.key]}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900"
              />
            </div>
          ))}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_default} onChange={e => setForm(prev => ({ ...prev, is_default: e.target.checked }))} />
            기본 배송지로 설정
          </label>
          <div className="flex gap-3">
            <ButtonPrimary onClick={saveAddress}>저장</ButtonPrimary>
            <ButtonSecondary onClick={() => setShowForm(false)}>취소</ButtonSecondary>
          </div>
        </div>
      )}

      {/* 배송지 목록 */}
      {addresses.length === 0 ? (
        <div className="py-12 text-center text-sm text-neutral-500">등록된 배송지가 없습니다</div>
      ) : (
        <div className="space-y-3">
          {addresses.map(addr => (
            <div key={addr.id} className={`rounded-2xl border p-5 dark:border-neutral-700 ${
              addr.is_default ? 'border-primary-300 bg-primary-50/30 dark:border-primary-700' : 'border-neutral-200'
            }`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{addr.recipient_name}</p>
                    {addr.is_default && (
                      <span className="rounded-full bg-primary-500 px-2 py-0.5 text-xs text-white">기본</span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-500">{addr.phone}</p>
                  <p className="text-sm">[{addr.zipcode}] {addr.address1}</p>
                  {addr.address2 && <p className="text-sm text-neutral-500">{addr.address2}</p>}
                </div>
                <div className="flex gap-2">
                  {!addr.is_default && (
                    <button onClick={() => setDefault(addr.id)} className="rounded-lg bg-neutral-100 px-3 py-1.5 text-xs hover:bg-neutral-200 dark:bg-neutral-800">
                      기본 설정
                    </button>
                  )}
                  <button onClick={() => startEdit(addr)} className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30">
                    수정
                  </button>
                  <button onClick={() => deleteAddress(addr.id)} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-600 hover:bg-red-100 dark:bg-red-900/30">
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
