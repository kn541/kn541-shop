'use client'
/**
 * KN541 카카오 주소 검색 공통 모듈
 * 사용처: checkout/page.tsx / addresses/page.tsx / profile/page.tsx (ContactTab)
 *
 * 2026-06-22: .open() 팝업 → .embed() 인라인 오버레이로 전환
 *   - 모바일에서 팝업 새 창 전환 시 JS 콜백 유실 → 주소 자동입력 안되는 버그 수정
 *   - 페이지 내부 오버레이로 렌더링하여 콜백 안전하게 유지
 *
 * 사용법:
 * ```tsx
 * import KakaoAddressInput, { AddressValue } from '@/components/common/KakaoAddressSearch'
 *
 * const [addr, setAddr] = useState<AddressValue>({ zipcode: '', address1: '', address2: '' })
 * <KakaoAddressInput value={addr} onChange={setAddr} />
 * ```
 */

import { useEffect, useRef, useState, useCallback } from 'react'

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
        onresize?: (size: { width: number; height: number }) => void
        width?: string | number
        height?: string | number
        animation?: boolean
        zIndex?: number
      }) => { open: () => void; embed: (element: HTMLElement, options?: { q?: string; autoClose?: boolean }) => void }
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

// ─── 레거시 호환: openKakaoAddress (팝업 모드) ────────────────────
// 기존 코드에서 직접 import하는 곳이 있을 수 있으므로 유지
// 새 코드는 아래 KakaoAddressInput 컴포넌트의 embed 모드를 사용

export async function openKakaoAddress(
  onComplete: (result: { zipcode: string; address1: string }) => void
) {
  try {
    await loadKakaoScript()
    if (!window.daum?.Postcode) return

    new window.daum.Postcode({
      oncomplete(data: KakaoAddressData) {
        const address = data.roadAddress || data.jibunAddress || data.autoRoadAddress || data.autoJibunAddress || ''
        const suffix = data.buildingName ? ` (${data.buildingName})` : ''
        onComplete({ zipcode: data.zonecode, address1: address + suffix })
      },
      animation: true,
      zIndex: 100_000,
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
  inputClassName?: string
  labelClassName?: string
  label?: string
  detailPlaceholder?: string
  disabled?: boolean
}

// ─── 기본 스타일 ──────────────────────────────────────────────────

const BASE_INPUT =
  'w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm ' +
  'outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 ' +
  'dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100 ' +
  'disabled:cursor-not-allowed disabled:opacity-50'

const BASE_LABEL =
  'mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300'

// ─── 메인 컴포넌트 (embed 모드) ──────────────────────────────────

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
  const embedRef = useRef<HTMLDivElement>(null)
  const [showEmbed, setShowEmbed] = useState(false)
  const inp = inputClassName ?? BASE_INPUT
  const lbl = labelClassName ?? BASE_LABEL

  // embed 모드로 주소 검색 열기
  const handleSearch = useCallback(async () => {
    if (disabled) return
    try {
      await loadKakaoScript()
      if (!window.daum?.Postcode) {
        alert('주소 검색을 불러오지 못했습니다.')
        return
      }
      // 오버레이 표시
      setShowEmbed(true)
    } catch (e) {
      console.error('[KakaoAddress] 스크립트 로드 실패:', e)
      alert('주소 검색을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.')
    }
  }, [disabled])

  // showEmbed가 true가 되면 embed 컨테이너에 다음 우편번호 렌더링
  useEffect(() => {
    if (!showEmbed || !embedRef.current) return
    if (!window.daum?.Postcode) return

    const container = embedRef.current

    new window.daum.Postcode({
      oncomplete(data: KakaoAddressData) {
        const address = data.roadAddress || data.jibunAddress || data.autoRoadAddress || data.autoJibunAddress || ''
        const suffix = data.buildingName ? ` (${data.buildingName})` : ''
        onChange({ ...value, zipcode: data.zonecode, address1: address + suffix, address2: '' })
        setShowEmbed(false)
        // 상세주소 인풋으로 포커스
        setTimeout(() => detailRef.current?.focus(), 200)
      },
      onclose(state: string) {
        // FORCE_CLOSE: 사용자가 X 버튼 클릭
        // COMPLETE_CLOSE: 주소 선택 완료 후 자동 닫힘
        if (state === 'FORCE_CLOSE') {
          setShowEmbed(false)
        }
      },
      width: '100%',
      height: '100%',
    }).embed(container, { autoClose: false })
  }, [showEmbed])

  // ESC 키로 닫기
  useEffect(() => {
    if (!showEmbed) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowEmbed(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showEmbed])

  // 오버레이 열릴 때 body 스크롤 방지
  useEffect(() => {
    if (showEmbed) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [showEmbed])

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

      {/* ★ 인라인 오버레이 — 팝업 대신 페이지 내부에서 렌더링 */}
      {showEmbed && (
        <div
          className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/50"
          onClick={(e) => { if (e.target === e.currentTarget) setShowEmbed(false) }}
        >
          <div className="relative w-full max-w-lg mx-4">
            {/* 헤더 */}
            <div className="flex items-center justify-between rounded-t-2xl bg-white px-4 py-3 dark:bg-neutral-800">
              <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                주소 검색
              </span>
              <button
                type="button"
                onClick={() => setShowEmbed(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400
                           transition-colors hover:bg-neutral-100 hover:text-neutral-600
                           dark:hover:bg-neutral-700 dark:hover:text-neutral-300"
              >
                ✕
              </button>
            </div>
            {/* 다음 우편번호 embed 컨테이너 */}
            <div
              ref={embedRef}
              className="rounded-b-2xl bg-white dark:bg-neutral-800"
              style={{ height: 460, overflow: 'hidden' }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── mypage/profile 전용 — 인라인 스타일 변형 (embed 모드) ────────

export interface MypageAddressInputProps {
  zipcode: string
  address1: string
  address2: string
  onChange: (field: 'zip_code' | 'address1' | 'address2', value: string) => void
  disabled?: boolean
}

export function MypageAddressInput({
  zipcode,
  address1,
  address2,
  onChange,
  disabled = false,
}: MypageAddressInputProps) {
  const detailRef = useRef<HTMLInputElement>(null)
  const embedRef = useRef<HTMLDivElement>(null)
  const [showEmbed, setShowEmbed] = useState(false)

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

  const handleSearch = useCallback(async () => {
    if (disabled) return
    try {
      await loadKakaoScript()
      if (!window.daum?.Postcode) {
        alert('주소 검색을 불러오지 못했습니다.')
        return
      }
      setShowEmbed(true)
    } catch {
      alert('주소 검색을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.')
    }
  }, [disabled])

  useEffect(() => {
    if (!showEmbed || !embedRef.current) return
    if (!window.daum?.Postcode) return

    const container = embedRef.current

    new window.daum.Postcode({
      oncomplete(data: KakaoAddressData) {
        const address = data.roadAddress || data.jibunAddress || data.autoRoadAddress || data.autoJibunAddress || ''
        const suffix = data.buildingName ? ` (${data.buildingName})` : ''
        onChange('zip_code', data.zonecode)
        onChange('address1', address + suffix)
        onChange('address2', '')
        setShowEmbed(false)
        setTimeout(() => detailRef.current?.focus(), 200)
      },
      onclose(state: string) {
        if (state === 'FORCE_CLOSE') setShowEmbed(false)
      },
      width: '100%',
      height: '100%',
    }).embed(container, { autoClose: false })
  }, [showEmbed])

  useEffect(() => {
    if (!showEmbed) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowEmbed(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showEmbed])

  useEffect(() => {
    if (showEmbed) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [showEmbed])

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

      {/* ★ 인라인 오버레이 */}
      {showEmbed && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 100000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowEmbed(false) }}
        >
          <div style={{ position: 'relative', width: '100%', maxWidth: 480, margin: '0 16px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: '#fff', borderRadius: '16px 16px 0 0', padding: '12px 16px',
            }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>주소 검색</span>
              <button type="button" onClick={() => setShowEmbed(false)}
                style={{ width: 32, height: 32, border: 'none', background: 'transparent',
                         fontSize: 18, cursor: 'pointer', color: '#999' }}>
                ✕
              </button>
            </div>
            <div ref={embedRef}
              style={{ height: 460, overflow: 'hidden', background: '#fff',
                       borderRadius: '0 0 16px 16px' }} />
          </div>
        </div>
      )}
    </div>
  )
}
