'use client'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useProfile } from '@/lib/mypage/useProfile'
import { getAuthHeader } from '@/lib/mypage/auth'
import BackHeader from '@/components/mypage/BackHeader'
import BigTabs from '@/components/mypage/BigTabs'
import BigButton from '@/components/mypage/BigButton'
import { MypageAddressInput } from '@/components/common/KakaoAddressSearch'

const BASE = process.env.NEXT_PUBLIC_API_URL

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{label}</label>
      <div style={{
        height: 56, padding: '0 16px', display: 'flex', alignItems: 'center',
        background: '#F5F5F5', borderRadius: 'var(--mp-radius)',
        border: '1px solid var(--mp-color-border)',
        fontSize: 18, color: 'var(--mp-color-text-muted)',
      }}>
        {value || '-'}
      </div>
      <div style={{ fontSize: 12, color: 'var(--mp-color-text-muted)', marginTop: 4 }}>
        ℹ️ 이 항목은 담당자에게 문의하세요.
      </div>
    </div>
  )
}

function EditableField({
  label, value, type = 'text', onChange,
}: { label: string; value: string; type?: string; onChange: (v: string) => void }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', boxSizing: 'border-box',
          height: 56, padding: '0 16px',
          border: '1px solid var(--mp-color-border)',
          borderRadius: 'var(--mp-radius)',
          fontSize: 18, outline: 'none', background: '#fff',
        }}
      />
    </div>
  )
}

function BasicTab({ data, userId }: { data: Record<string, string | null>; userId: string }) {
  const [email, setEmail] = useState(data.email ?? '')
  const [saving, setSaving] = useState(false)
  const changed = email !== (data.email ?? '')

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch(`${BASE}/members/${userId}`, {
        method: 'PATCH',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error('failed')
      toast.success('저장됐습니다.')
    } catch {
      toast.error('저장에 실패했습니다. 다시 시도해 주세요.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <ReadOnlyField label='아이디' value={data.username ?? ''} />
      <ReadOnlyField label='이름' value={data.name ?? ''} />
      <ReadOnlyField label='생년월일' value={data.birth_date ?? ''} />
      <ReadOnlyField label='성별' value={data.gender === 'M' ? '남' : data.gender === 'F' ? '여' : ''} />
      <EditableField label='이메일' value={email} type='email' onChange={setEmail} />
      <BigButton fullWidth onClick={save} disabled={!changed || saving}>
        {saving ? '저장 중…' : '저장하기'}
      </BigButton>
    </div>
  )
}

function PasswordTab({ userId }: { userId: string }) {
  const [cur, setCur] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const mismatch = next.length > 0 && confirm.length > 0 && next !== confirm
  const isValid = cur.length >= 4 && next.length >= 8 && !mismatch

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch(`${BASE}/members/${userId}`, {
        method: 'PATCH',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password: cur, new_password: next }),
      })
      if (!res.ok) throw new Error('failed')
      toast.success('비밀번호가 변경됐습니다.')
      setCur(''); setNext(''); setConfirm('')
    } catch {
      toast.error('실패했습니다. 현재 비밀번호를 확인해 주세요.')
    } finally {
      setSaving(false)
    }
  }

  const pwStyle = (borderColor?: string) => ({
    width: '100%', boxSizing: 'border-box' as const,
    height: 56, padding: '0 16px',
    border: `1px solid ${borderColor ?? 'var(--mp-color-border)'}`,
    borderRadius: 'var(--mp-radius)',
    fontSize: 18, outline: 'none', background: '#fff',
  })

  return (
    <div style={{ padding: 16 }}>
      <div style={{
        background: '#F8F7FA', borderRadius: 8, padding: 14,
        fontSize: 15, lineHeight: 1.8, color: 'var(--mp-color-text-muted)', marginBottom: 20,
      }}>
        🔒 비밀번호 규칙<br />
        • 8자 이상<br />
        • 영문(a~z) + 숫자 포함<br />
        • 특수문자(!@#$%) 권장
      </div>
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 15, fontWeight: 600, marginBottom: 8 }}>현재 비밀번호</label>
        <input type='password' value={cur} onChange={e => setCur(e.target.value)} style={pwStyle()} />
      </div>
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 15, fontWeight: 600, marginBottom: 8 }}>새 비밀번호</label>
        <input type='password' value={next} onChange={e => setNext(e.target.value)} style={pwStyle()} />
      </div>
      <div style={{ marginBottom: 8 }}>
        <label style={{ display: 'block', fontSize: 15, fontWeight: 600, marginBottom: 8 }}>새 비밀번호 확인</label>
        <input
          type='password' value={confirm} onChange={e => setConfirm(e.target.value)}
          style={pwStyle(mismatch ? 'var(--mp-color-danger)' : undefined)}
        />
        {mismatch && (
          <div style={{ fontSize: 16, color: 'var(--mp-color-danger)', fontWeight: 700, marginTop: 8 }}>
            ⚠️ 비밀번호가 일치하지 않습니다.
          </div>
        )}
      </div>
      <div style={{ marginTop: 24 }}>
        <BigButton fullWidth onClick={save} disabled={!isValid || saving}>
          {saving ? '변경 중…' : '비밀번호 변경'}
        </BigButton>
      </div>
    </div>
  )
}

function ContactTab({ data, userId }: { data: Record<string, string | null>; userId: string }) {
  const [phone, setPhone] = useState(data.phone ?? '')
  const [zip, setZip] = useState(data.zip_code ?? '')
  const [addr1, setAddr1] = useState(data.address1 ?? '')
  const [addr2, setAddr2] = useState(data.address2 ?? '')
  const [saving, setSaving] = useState(false)

  // MypageAddressInput 의 onChange 핸들러
  const handleAddressChange = (field: 'zip_code' | 'address1' | 'address2', value: string) => {
    if (field === 'zip_code') setZip(value)
    else if (field === 'address1') setAddr1(value)
    else setAddr2(value)
  }

  const inputStyle = {
    width: '100%', boxSizing: 'border-box' as const,
    height: 56, padding: '0 16px',
    border: '1px solid var(--mp-color-border)',
    borderRadius: 'var(--mp-radius)',
    fontSize: 18, outline: 'none', background: '#fff',
  }

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch(`${BASE}/members/${userId}`, {
        method: 'PATCH',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, zip_code: zip, address1: addr1, address2: addr2 }),
      })
      if (!res.ok) throw new Error('failed')
      toast.success('저장됐습니다.')
    } catch {
      toast.error('저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ padding: 16 }}>
      {/* 휴대폰 번호 */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 15, fontWeight: 600, marginBottom: 8 }}>휴대폰 번호</label>
        <input type='tel' value={phone} onChange={e => setPhone(e.target.value)}
          placeholder='010-0000-0000' style={inputStyle} />
      </div>

<<<<<<< HEAD
      {/* 카카오 주소 검색 */}
=======
      {/* ★ 카카오 주소 검색 (MypageAddressInput) */}
>>>>>>> 3b4de406cef339e5d0d50eea017ecda2c565451c
      <MypageAddressInput
        zipcode={zip}
        address1={addr1}
        address2={addr2}
        onChange={handleAddressChange}
      />

      <BigButton fullWidth onClick={save} disabled={saving}>
        {saving ? '저장 중…' : '저장하기'}
      </BigButton>
    </div>
  )
}

export default function ProfilePage() {
  const [tab, setTab] = useState('basic')
  const { data, loading } = useProfile()

  if (loading) {
    return (
      <>
        <BackHeader title='내 정보' />
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--mp-color-text-muted)' }}>불러오는 중…</div>
      </>
    )
  }

  if (!data) return null

  const d = {
    username:   data.username   ?? '',
    name:       data.name       ?? '',
    email:      data.email,
    phone:      data.phone,
    birth_date: data.birth_date,
    gender:     data.gender,
    zip_code:   data.zip_code,
    address1:   data.address1,
    address2:   data.address2,
  } as Record<string, string | null>

  return (
    <>
      <BackHeader title='내 정보' />
      <BigTabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'basic',    label: '기본정보' },
          { value: 'password', label: '비밀번호' },
          { value: 'contact',  label: '연락처' },
        ]}
      />
      {tab === 'basic'    && <BasicTab    data={d} userId={data.user_id} />}
      {tab === 'password' && <PasswordTab userId={data.user_id} />}
      {tab === 'contact'  && <ContactTab  data={d} userId={data.user_id} />}
    </>
  )
}
