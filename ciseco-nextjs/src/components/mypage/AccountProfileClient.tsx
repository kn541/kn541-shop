'use client'
/**
 * 계정 설정(/account) — (mypage)/profile 실데이터 UI (BackHeader 없음)
 */
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useProfile } from '@/lib/mypage/useProfile'
import { getAuthHeader } from '@/lib/mypage/auth'
import BigTabs from '@/components/mypage/BigTabs'
import BigButton from '@/components/mypage/BigButton'
import { MypageAddressInput } from '@/components/common/KakaoAddressSearch'
import { PasswordChangePanel } from '@/components/auth/PasswordChangePanel'

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

function BasicTab({
  data,
  userId,
  onSaved,
}: {
  data: Record<string, string | null>
  userId: string
  onSaved: () => void
}) {
  const [email, setEmail] = useState(data.email ?? '')
  const [birthDate, setBirthDate] = useState(() => (data.birth_date ? String(data.birth_date).slice(0, 10) : ''))
  const [gender, setGender] = useState<'M' | 'F' | ''>(() =>
    data.gender === 'M' || data.gender === 'F' ? data.gender : ''
  )
  const [saving, setSaving] = useState(false)

  const initialBirth = data.birth_date ? String(data.birth_date).slice(0, 10) : ''
  const initialGender = data.gender === 'M' || data.gender === 'F' ? data.gender : ''
  const changed =
    email !== (data.email ?? '') || birthDate !== initialBirth || gender !== initialGender

  const fieldBoxStyle = {
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

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch(`${BASE}/members/${userId}`, {
        method: 'PATCH',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim() || null,
          birth_date: birthDate.trim() === '' ? null : birthDate.trim().slice(0, 10),
          gender: gender === '' ? null : gender,
        }),
      })
      if (!res.ok) throw new Error('failed')
      toast.success('저장되었습니다')
      onSaved()
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

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 15, fontWeight: 600, marginBottom: 8 }}>생년월일</label>
        <input
          type='date'
          value={birthDate}
          onChange={e => setBirthDate(e.target.value)}
          style={fieldBoxStyle}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 15, fontWeight: 600, marginBottom: 8 }}>성별</label>
        <select
          value={gender}
          onChange={e => setGender(e.target.value === 'M' ? 'M' : e.target.value === 'F' ? 'F' : '')}
          style={fieldBoxStyle}
        >
          <option value=''>선택안함</option>
          <option value='M'>남성</option>
          <option value='F'>여성</option>
        </select>
      </div>

      <EditableField label='이메일' value={email} type='email' onChange={setEmail} />
      <BigButton fullWidth onClick={() => void save()} disabled={!changed || saving}>
        {saving ? '저장 중…' : '저장하기'}
      </BigButton>
    </div>
  )
}

/** 계정 탭: POST /auth/change-password (Bearer) — PasswordChangePanel과 동일 정책 */
function PasswordTab() {
  return (
    <div style={{ padding: 16 }}>
      <div
        style={{
          background: '#F8F7FA',
          borderRadius: 8,
          padding: 14,
          fontSize: 14,
          lineHeight: 1.7,
          color: 'var(--mp-color-text-muted)',
          marginBottom: 20,
        }}
      >
        🔒 8자 이상, 숫자·특수문자 포함, 동일 문자만 반복은 사용할 수 없습니다.
      </div>
      <PasswordChangePanel variant="voluntary" />
    </div>
  )
}

function ContactTab({
  data,
  userId,
  onSaved,
}: {
  data: Record<string, string | null>
  userId: string
  onSaved: () => void
}) {
  const [phone, setPhone] = useState(data.phone ?? '')
  const [zip, setZip] = useState(data.zip_code ?? '')
  const [addr1, setAddr1] = useState(data.address1 ?? '')
  const [addr2, setAddr2] = useState(data.address2 ?? '')
  const [saving, setSaving] = useState(false)

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
      toast.success('저장되었습니다')
      onSaved()
    } catch {
      toast.error('저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 15, fontWeight: 600, marginBottom: 8 }}>휴대폰 번호</label>
        <input type='tel' value={phone} onChange={e => setPhone(e.target.value)}
          placeholder='010-0000-0000' style={inputStyle} />
      </div>

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

export default function AccountProfileClient() {
  const [tab, setTab] = useState('basic')
  const { data, loading, reload } = useProfile()

  const basicKey = data
    ? `${data.user_id}:${data.birth_date ?? ''}:${data.gender ?? ''}:${data.email ?? ''}`
    : 'x'

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 48, color: 'var(--mp-color-text-muted)' }}>불러오는 중…</div>
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
      <BigTabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'basic',    label: '기본정보' },
          { value: 'password', label: '비밀번호' },
          { value: 'contact',  label: '연락처' },
        ]}
      />
      {tab === 'basic' && <BasicTab key={basicKey} data={d} userId={data.user_id} onSaved={reload} />}
      {tab === 'password' && <PasswordTab />}
      {tab === 'contact' && <ContactTab data={d} userId={data.user_id} onSaved={reload} />}
    </>
  )
}
