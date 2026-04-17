'use client'
/**
 * KN541 카카오 주소 검색 공통 모듈
 * 사용처: checkout/page.tsx / addresses/page.tsx / profile/page.tsx (ContactTab) / checkout/Information.tsx
 *
 * 사용법:
 * ```tsx
 * import KakaoAddressInput, { AddressValue } from '@/components/common/KakaoAddressSearch'
 *
 * const [addr, setAddr] = useState<AddressValue>({ zipcode: '', address1: '', address2: '' })
 * <KakaoAddressInput value={addr} onChange={setAddr} />
 * ```
 */

import { useEffect, useRef } from 'react'

// ─── 타입 정의 ────────────────────────────────────────────────────

export interface AddressValue {
  zipcode: string    // 우편번호
  address1: string  // 기본주소 (도로명)
  address2: string  // 상세주소 (사용자 직접 입력)
}

// 카카오 Postcode SDK 타입
declare global {
  interface Window {
    daum?: {
      Postcode: new (options: {
        oncomplete: (data: KakaoAddressData) => void
        onclose?: (state: string) => void
        width?: string | number
        height?: string | number
        animation?: boolean
      }) => { open: () => void }
    }
  }
}

interface KakaoAddressData {
  zonecode: string       // 우편번호 (5자리)
  roadAddress: string    // 도로명주소
  jibunAddress: string   // 지번주소
  buildingName: string   // 건물명
  apartment: string      // 아파트 여부 ('Y'/'N')
  autoJibunAddress?: string
  autoRoadAddress?: string
}

// ─── 카카오 스크립트 로더 ─────────────────────────────────────────

const KAKAO_POSTCODE_URL = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
let scriptLoaded = false
let loadingPromise: Promise<void> | null = null

function loadKakaoScript(): Promise<void> {
  if (scriptLoaded) return Promise.resolve()
  if (loadingPromise) return loadingPromise

  loadingPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${KAKAO_POSTCODE_URL}"]`)
    if (existing) {
      scriptLoaded = true
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = KAKAO_POSTCODE_URL
    script.async = true
    script.onload = () => { scriptLoaded = true; resolve() }
    script.onerror = reject
    document.head.appendChild(script)
  })

  return loadingPromise
}

// ─── 카카오 주소 팝업 열기 ────────────────────────────────────────

export async function openKakaoAddress(
  onComplete: (result: { zipcode: string; address1: string }) => void
) {
  try {
    await loadKakaoScript()
    if (!window.daum?.Postcode) return

    new window.daum.Postcode({
      oncomplete(data: KakaoAddressData) {
        // 도로명 주소 우선, 없으면 지번 주소
        const address = data.roadAddress || data.jibunAddress || data.autoRoadAddress || data.autoJibunAddress || ''
        // 건물명이 있으면 괄호로 추가
        const suffix = data.buildingName ? ` (${data.buildingName})` : ''
        onComplete({ zipcode: data.zonecode, address1: address + suffix })
      },
      animation: true,
    }).open()
  } catch (e) {
    console.error('[KakaoAddress] 스크립트 로드 실패:', e)
    alert('주소 검색을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.')
  }
}

// ─── 공통 Props ───────────────────────────────────────────────────

export interface KakaoAddressInputProps {
  value: AddressValue
  onChange: (v: AddressValue) => void
  /** 인풋 className 오버라이드 (기본 스타일 사용 시 생략) */
  inputClassName?: string
  /** 레이블 className 오버라이드 */
  labelClassName?: string
  /** "주소 *" 레이블 문구 */
  label?: string
  /** 상세주소 placeholder */
  detailPlaceholder?: string
  /** 비활성화 */
  disabled?: boolean
}

// ─── 기본 input 스타일 ────────────────────────────────────────────

const BASE_INPUT =
  'w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm ' +
  'outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 ' +
  'dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100 ' +
  'disabled:cursor-not-allowed disabled:opacity-50'

const BASE_LABEL =
  'mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300'

// ─── 메인 컴포넌트 ────────────────────────────────────────────────

export default function KakaoAddressInput({
  value,
  onChange,
  inputClassName,
  labelClassName,
  label = '주소',
  detailPlaceholder = '상세주소 (동/호수 등)',
  disabled = false,
}: KakaoAddressInputProps) {
  const detailRef = useRef<HTMLInputElement>(null)
  const inp = inputClassName ?? BASE_INPUT
  const lbl = labelClassName ?? BASE_LABEL

  // 주소 검색 완료 시 → 상세주소 인풋으로 포커스
  const handleSearch = async () => {
    if (disabled) return
    await openKakaoAddress(({ zipcode, address1 }) => {
      onChange({ ...value, zipcode, address1, address2: '' })
      // 약간의 지연 후 상세주소 인풋 포커스
      setTimeout(() => detailRef.current?.focus(), 300)
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <label className={lbl}>{label}</label>

      {/* 우편번호 행 */}
      <div className="flex gap-2">
        <input
          type="text"
          readOnly
          value={value.zipcode}
          placeholder="우편번호"
          className={`${inp} w-32 cursor-pointer`}
          onClick={handleSearch}
          disabled={disabled}
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={disabled}
          className="shrink-0 rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium
                     text-neutral-700 transition-colors hover:bg-neutral-50 active:bg-neutral-100
                     dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700
                     disabled:cursor-not-allowed disabled:opacity-50"
        >
          주소 검색
        </button>
      </div>

      {/* 기본 주소 (읽기 전용, 클릭 시 검색 재오픈) */}
      <input
        type="text"
        readOnly
        value={value.address1}
        placeholder="기본주소 (주소 검색 버튼을 클릭하세요)"
        className={`${inp} cursor-pointer`}
        onClick={handleSearch}
        disabled={disabled}
      />

      {/* 상세 주소 (직접 입력) */}
      <input
        ref={detailRef}
        type="text"
        value={value.address2}
        onChange={(e) => onChange({ ...value, address2: e.target.value })}
        placeholder={detailPlaceholder}
        className={inp}
        disabled={disabled}
      />
    </div>
  )
}

// ─── mypage/profile 전용 — 인라인 스타일 변형 ────────────────────

export interface MypageAddressInputProps {
  zipcode: string
  address1: string
  address2: string
  onChange: (field: 'zip_code' | 'address1' | 'address2', value: string) => void
  disabled?: boolean
}

/**
 * mypage/profile/page.tsx 의 ContactTab 전용 래퍼
 * — 기존 inline style 기반 UI에 맞춘 변형
 */
export function MypageAddressInput({
  zipcode,
  address1,
  address2,
  onChange,
  disabled = false,
}: MypageAddressInputProps) {
  const detailRef = useRef<HTMLInputElement>(null)

  const inputStyle: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    height: 56,
    padding: '0 16px',
    border: '1px solid var(--mp-color-border)',
    borderRadius: 'var(--mp-radius)',
    fontSize: 18,
    outline: 'none',
    background: '#fff',
  }

  const handleSearch = async () => {
    if (disabled) return
    await openKakaoAddress(({ zipcode: z, address1: a }) => {
      onChange('zip_code', z)
      onChange('address1', a)
      onChange('address2', '')
      setTimeout(() => detailRef.current?.focus(), 300)
    })
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontSize: 15, fontWeight: 600, marginBottom: 8 }}>
        주소
      </label>

      {/* 우편번호 + 검색 버튼 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <input
          type="text"
          readOnly
          value={zipcode}
          placeholder="우편번호"
          onClick={handleSearch}
          style={{ ...inputStyle, flex: 1, width: 'auto', cursor: 'pointer' }}
        />
        <button
          type="button"
          onClick={handleSearch}
          style={{
            height: 56,
            padding: '0 16px',
            whiteSpace: 'nowrap',
            background: '#F5F5F5',
            border: '1px solid var(--mp-color-border)',
            borderRadius: 'var(--mp-radius)',
            fontSize: 16,
            cursor: 'pointer',
          }}
        >
          주소 검색
        </button>
      </div>

      {/* 기본주소 */}
      <input
        type="text"
        readOnly
        value={address1}
        placeholder="도로명 주소 (주소 검색 버튼 클릭)"
        onClick={handleSearch}
        style={{ ...inputStyle, marginBottom: 8, cursor: 'pointer' }}
      />

      {/* 상세주소 */}
      <input
        ref={detailRef}
        type="text"
        value={address2}
        onChange={(e) => onChange('address2', e.target.value)}
        placeholder="상세주소 (동/호 등)"
        style={inputStyle}
      />
    </div>
  )
}
