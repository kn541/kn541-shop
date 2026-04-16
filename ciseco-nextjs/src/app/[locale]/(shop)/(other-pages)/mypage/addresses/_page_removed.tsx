<<<<<<< HEAD
'use client'
// KN541 쇼핑몰 — 마이페이지 > 배송지 관리
// API: GET/POST/PATCH/DELETE /members/{id}/addresses

import { useState, useEffect } from 'react'

const BASE = process.env.NEXT_PUBLIC_API_URL

interface Address {
  id: number
  recipient_name: string
  phone: string
  zip_code: string
  address1: string
  address2: string
  is_default: boolean
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<Address | null>(null)

  // 폼 상태
  const [form, setForm] = useState({ recipient_name: '', phone: '', zip_code: '', address1: '', address2: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const h = () => ({ Authorization: `Bearer ${localStorage.getItem('access_token')}`, 'Content-Type': 'application/json' })

  useEffect(() => {
    // 내 정보 조회 → userId 확보 → 배송지 목록
    fetch(`${BASE}/auth/me`, { headers: h() })
      .then(r => r.json())
      .then(res => {
        if (res.status === 'success') {
          const id = res.data.user_id
          setUserId(id)
          return fetch(`${BASE}/members/${id}/addresses`, { headers: h() })
        }
      })
      .then(r => r?.json())
      .then(res => { if (res?.status === 'success') setAddresses(res.data.items ?? res.data ?? []) })
      .finally(() => setLoading(false))
  }, [])

  const openAdd = () => { setEditTarget(null); setForm({ recipient_name: '', phone: '', zip_code: '', address1: '', address2: '' }); setMsg(null); setShowForm(true) }
  const openEdit = (addr: Address) => { setEditTarget(addr); setForm({ recipient_name: addr.recipient_name, phone: addr.phone, zip_code: addr.zip_code, address1: addr.address1, address2: addr.address2 ?? '' }); setMsg(null); setShowForm(true) }

  const handleSave = async () => {
    if (!userId) return
    setSaving(true); setMsg(null)
    try {
      const url = editTarget ? `${BASE}/members/${userId}/addresses/${editTarget.id}` : `${BASE}/members/${userId}/addresses`
      const method = editTarget ? 'PATCH' : 'POST'
      const res = await fetch(url, { method, headers: h(), body: JSON.stringify(form) })
      const json = await res.json()
      if (res.ok && json.status === 'success') {
        // 목록 갱신
        const list = await fetch(`${BASE}/members/${userId}/addresses`, { headers: h() }).then(r => r.json())
        if (list.status === 'success') setAddresses(list.data.items ?? list.data ?? [])
        setMsg({ type: 'success', text: editTarget ? '수정됐습니다.' : '추가됐습니다.' })
        setShowForm(false)
      } else {
        setMsg({ type: 'error', text: json.detail ?? '저장 중 오류가 발생했습니다.' })
      }
    } catch { setMsg({ type: 'error', text: '서버 연결에 실패했습니다.' }) }
    finally { setSaving(false) }
  }

  const handleDelete = async (addrId: number) => {
    if (!userId || !confirm('삭제하시겠습니까?')) return
    await fetch(`${BASE}/members/${userId}/addresses/${addrId}`, { method: 'DELETE', headers: h() })
    setAddresses(prev => prev.filter(a => a.id !== addrId))
  }

  const handleSetDefault = async (addrId: number) => {
    if (!userId) return
    await fetch(`${BASE}/members/${userId}/addresses/${addrId}/default`, { method: 'PATCH', headers: h() })
    setAddresses(prev => prev.map(a => ({ ...a, is_default: a.id === addrId })))
  }

  if (loading) return <div className="py-16 text-center text-neutral-400">불러오는 중...</div>

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">배송지 관리</h2>
        <button onClick={openAdd} className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white dark:bg-neutral-100 dark:text-neutral-900">
          + 배송지 추가
        </button>
      </div>

      {/* 배송지 폼 */}
      {showForm && (
        <div className="mb-6 rounded-2xl border border-neutral-200 p-5 dark:border-neutral-700">
          <h3 className="mb-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">{editTarget ? '배송지 수정' : '배송지 추가'}</h3>
          <div className="space-y-3">
            {[
              { key: 'recipient_name', label: '수령인', placeholder: '홍길동' },
              { key: 'phone', label: '연락처', placeholder: '010-0000-0000' },
              { key: 'zip_code', label: '우편번호', placeholder: '12345' },
              { key: 'address1', label: '주소', placeholder: '도로명 주소' },
              { key: 'address2', label: '상세주소', placeholder: '아파트, 동·호수 등' },
            ].map(f => (
              <div key={f.key}>
                <label className="mb-1 block text-xs font-medium text-neutral-500">{f.label}</label>
                <input type="text" value={(form as Record<string, string>)[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} placeholder={f.placeholder} className={inputClass} />
              </div>
            ))}
          </div>
          {msg && <div className={`mt-3 rounded-xl px-3 py-2 text-sm ${msg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{msg.text}</div>}
          <div className="mt-4 flex gap-2">
            <button onClick={handleSave} disabled={saving} className="flex-1 rounded-xl bg-neutral-900 py-2.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900">{saving ? '저장 중...' : '저장'}</button>
            <button onClick={() => setShowForm(false)} className="flex-1 rounded-xl border border-neutral-300 py-2.5 text-sm font-medium text-neutral-600 dark:border-neutral-600 dark:text-neutral-400">취소</button>
          </div>
        </div>
      )}

      {/* 배송지 목록 */}
      {addresses.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 py-16 text-center text-neutral-400 dark:border-neutral-700">등록된 배송지가 없습니다.</div>
      ) : (
        <div className="space-y-3">
          {[...addresses].sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0)).map(addr => (
            <div key={addr.id} className={`rounded-2xl border p-5 ${addr.is_default ? 'border-neutral-900 dark:border-neutral-100' : 'border-neutral-200 dark:border-neutral-700'}`}>
              <div className="mb-2 flex items-center gap-2">
                <p className="font-medium text-neutral-800 dark:text-neutral-200">{addr.recipient_name}</p>
                {addr.is_default && <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-xs text-white dark:bg-neutral-100 dark:text-neutral-900">기본</span>}
              </div>
              <p className="text-sm text-neutral-500">{addr.phone}</p>
              <p className="text-sm text-neutral-500">[{addr.zip_code}] {addr.address1} {addr.address2}</p>
              <div className="mt-3 flex gap-2">
                {!addr.is_default && (
                  <button onClick={() => handleSetDefault(addr.id)} className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-400">기본 설정</button>
                )}
                <button onClick={() => openEdit(addr)} className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-400">수정</button>
                <button onClick={() => handleDelete(addr.id)} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50">삭제</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const inputClass = 'w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100'
=======
export {}
>>>>>>> 40dcdd48e8553faffe82a8c352ba709fff1db211
