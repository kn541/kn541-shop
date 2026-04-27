'use client'
// KN541 쇼핑몰 — 회원가입 페이지
// fix: 로고·로그인 링크 href locale 수정 (/ → /ko, /login → /ko/login)

import { useState, useTransition, useCallback, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from '@/i18n/navigation'

const BASE = process.env.NEXT_PUBLIC_API_URL
const LOGO_URL = 'https://ghtkropmnrelkxivzpim.supabase.co/storage/v1/object/public/brands/white_logo.png'

type MemberType = 'normal' | 'startup'
type DupState = 'idle' | 'checking' | 'ok' | 'dup' | 'error'

const AGIT_LIST = [
  { value: '001', label: '본사' },
  { value: '002', label: '알레카서울' },
  { value: '003', label: '아산청아' },
  { value: '004', label: '울산태화강' },
  { value: '005', label: '부산대박' },
  { value: '006', label: '서초그린케어' },
  { value: '007', label: '인천주안' },
  { value: '008', label: '창원미라클' },
  { value: '009', label: '대구' },
  { value: '010', label: '서울진엔정' },
  { value: '011', label: '광주이레' },
  { value: '012', label: '부산아이비' },
  { value: '013', label: '통영초이스' },
]

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}
function XIcon() {
  return (
    <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

const inputCls = "w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-4 py-3 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
const labelCls = "block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5 uppercase tracking-wide"

export default function SignupPage() {
  const router = useRouter()
  const [memberType, setMemberType] = useState<MemberType>('normal')
  const [isPending, startTransition] = useTransition()
  const [globalError, setGlobalError] = useState('')

  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [recommenderCode, setRecommenderCode] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [agreePrivacy, setAgreePrivacy] = useState(false)

  const [agitCode, setAgitCode] = useState('')
  const [bankCode, setBankCode] = useState('')
  const [bankName, setBankName] = useState('')
  const [accountNo, setAccountNo] = useState('')
  const [accountHolder, setAccountHolder] = useState('')

  const [usernameDup, setUsernameDup] = useState<DupState>('idle')
  const [emailDup, setEmailDup] = useState<DupState>('idle')
  const [phoneDup, setPhoneDup] = useState<DupState>('idle')
  const dupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const checkDuplicate = useCallback(async (field: string, value: string, setter: (s: DupState) => void) => {
    if (!value.trim()) { setter('idle'); return }
    setter('checking')
    if (dupTimerRef.current) clearTimeout(dupTimerRef.current)
    dupTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${BASE}/auth/check-duplicate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ field, value }),
        })
        const json = await res.json()
        setter(json?.data?.is_duplicate ? 'dup' : 'ok')
      } catch {
        setter('error')
      }
    }, 500)
  }, [])

  const passwordMatch = password && passwordConfirm && password === passwordConfirm

  const validate = () => {
    if (!name.trim()) return '이름을 입력해주세요.'
    if (!username.trim() && !email.trim() && !phone.trim()) return '아이디, 이메일, 휴대폰 중 하나는 필수입니다.'
    if (!password) return '비밀번호를 입력해주세요.'
    if (password.length < 8) return '비밀번호는 8자 이상이어야 합니다.'
    if (password !== passwordConfirm) return '비밀번호가 일치하지 않습니다.'
    if (usernameDup === 'dup') return '이미 사용 중인 아이디입니다.'
    if (emailDup === 'dup') return '이미 사용 중인 이메일입니다.'
    if (phoneDup === 'dup') return '이미 사용 중인 휴대폰 번호입니다.'
    if (memberType === 'startup' && !agitCode) return '소속 아지트를 선택해주세요.'
    if (!agreeTerms || !agreePrivacy) return '필수 약관에 동의해주세요.'
    return ''
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const err = validate()
    if (err) { setGlobalError(err); return }
    setGlobalError('')

    startTransition(async () => {
      try {
        const body: Record<string, unknown> = {
          name,
          password,
          user_type: memberType === 'startup' ? '006' : '002',
        }
        if (username.trim()) body.username = username.trim()
        if (email.trim()) body.email = email.trim()
        if (phone.trim()) body.phone = phone.trim().replace(/-/g, '')
        if (recommenderCode.trim()) body.recommender_code = recommenderCode.trim()
        if (memberType === 'startup') {
          body.agit_code = agitCode
          if (bankCode && accountNo && accountHolder) {
            body.bank_account = { bank_code: bankCode, bank_name: bankName, account_no: accountNo, account_holder: accountHolder }
          }
        }

        const res = await fetch(`${BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        const json = await res.json()

        if (!res.ok) {
          setGlobalError(json?.detail ?? '회원가입에 실패했습니다.')
          return
        }

        const { access_token, refresh_token } = json?.data ?? {}
        if (access_token) {
          localStorage.setItem('access_token', access_token)
          if (refresh_token) localStorage.setItem('refresh_token', refresh_token)
          router.push('/ko')
        } else {
          setGlobalError('가입 처리 중 오류가 발생했습니다.')
        }
      } catch {
        setGlobalError('서버 연결에 실패했습니다.')
      }
    })
  }

  const DupIcon = ({ state }: { state: DupState }) => {
    if (state === 'ok') return <CheckIcon />
    if (state === 'dup') return <XIcon />
    if (state === 'checking') return <span className="text-xs text-neutral-400">확인 중...</span>
    return null
  }

  const DupMsg = ({ state, okMsg, dupMsg }: { state: DupState; okMsg: string; dupMsg: string }) => {
    if (state === 'ok') return <p className="text-xs text-green-500 mt-1">{okMsg}</p>
    if (state === 'dup') return <p className="text-xs text-red-500 mt-1">{dupMsg}</p>
    return null
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-start justify-center px-4 py-12">
      <div className="w-full max-w-[420px]">

        {/* ★ 로고 링크 /ko로 수정 */}
        <div className="flex justify-center mb-8">
          <a href="/ko" className="block">
            <Image
              src={LOGO_URL}
              alt="KN541"
              width={400}
              height={133}
              style={{ width: '240px', height: 'auto' }}
              className="object-contain"
              priority
            />
          </a>
        </div>

        {/* 회원유형 탭 */}
        <div className="flex rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 p-1 mb-6 gap-1">
          <button type="button" onClick={() => setMemberType('normal')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              memberType === 'normal'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}>
            🛒 일반 회원
          </button>
          <button type="button" onClick={() => setMemberType('startup')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              memberType === 'startup'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}>
            ⭐ 창업 회원
          </button>
        </div>

        {memberType === 'startup' && (
          <div className="mb-5 rounded-2xl border border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">⭐</span>
              <h2 className="text-base font-bold text-amber-800 dark:text-amber-300">KN541 창업회원 혜택</h2>
            </div>
            <ul className="space-y-2 text-sm text-amber-900 dark:text-amber-200">
              <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5 shrink-0">✓</span><span><strong>구매 이익금 캐시백</strong> — 모든 구매 상품 마진을 배당으로 돌려드립니다</span></li>
              <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5 shrink-0">✓</span><span><strong>다단계 수당</strong> — 추천 네트워크를 통한 추가 수익 기회</span></li>
              <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5 shrink-0">✓</span><span><strong>전용 상품 혜택</strong> — 창업회원 전용 특가 및 우선 구매권</span></li>
              <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5 shrink-0">✓</span><span><strong>아지트몰 입점</strong> — 나만의 쇼핑몰 운영 지원</span></li>
            </ul>
          </div>
        )}

        {memberType === 'normal' && (
          <div className="mb-5 rounded-2xl border border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 px-5 py-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>구매 목적</strong>으로 이용하실 분은 일반회원으로 가입하세요. 언제든지 창업회원으로 전환 가능합니다.
            </p>
          </div>
        )}

        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800 px-8 py-8">
          <h1 className="text-[20px] font-bold text-neutral-900 dark:text-white mb-6 text-center">
            {memberType === 'startup' ? '창업 회원 가입' : '일반 회원 가입'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelCls}>이름 <span className="text-red-400">*</span></label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="실명을 입력해주세요" className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>아이디</label>
              <div className="flex items-center gap-2">
                <input type="text" value={username}
                  onChange={e => { setUsername(e.target.value); checkDuplicate('username', e.target.value, setUsernameDup) }}
                  placeholder="영문, 숫자 조합 (4~20자)" className={inputCls} />
                <DupIcon state={usernameDup} />
              </div>
              <DupMsg state={usernameDup} okMsg="사용 가능한 아이디입니다." dupMsg="이미 사용 중인 아이디입니다." />
            </div>

            <div>
              <label className={labelCls}>비밀번호 <span className="text-red-400">*</span></label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="8자 이상 입력해주세요" className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>비밀번호 확인 <span className="text-red-400">*</span></label>
              <div className="flex items-center gap-2">
                <input type="password" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} placeholder="비밀번호를 다시 입력해주세요" className={inputCls} />
                {passwordConfirm && (passwordMatch ? <CheckIcon /> : <XIcon />)}
              </div>
              {passwordConfirm && !passwordMatch && <p className="text-xs text-red-500 mt-1">비밀번호가 일치하지 않습니다.</p>}
            </div>

            <div>
              <label className={labelCls}>이메일</label>
              <div className="flex items-center gap-2">
                <input type="email" value={email}
                  onChange={e => { setEmail(e.target.value); checkDuplicate('email', e.target.value, setEmailDup) }}
                  placeholder="example@email.com" className={inputCls} />
                <DupIcon state={emailDup} />
              </div>
              <DupMsg state={emailDup} okMsg="사용 가능한 이메일입니다." dupMsg="이미 등록된 이메일입니다." />
            </div>

            <div>
              <label className={labelCls}>휴대폰</label>
              <div className="flex items-center gap-2">
                <input type="tel" value={phone}
                  onChange={e => { setPhone(e.target.value); checkDuplicate('phone', e.target.value.replace(/-/g, ''), setPhoneDup) }}
                  placeholder="010-0000-0000" className={inputCls} />
                <DupIcon state={phoneDup} />
              </div>
              <DupMsg state={phoneDup} okMsg="사용 가능한 번호입니다." dupMsg="이미 등록된 번호입니다." />
            </div>

            <div>
              <label className={labelCls}>추천인 코드 <span className="text-neutral-400 font-normal">(선택)</span></label>
              <input type="text" value={recommenderCode} onChange={e => setRecommenderCode(e.target.value)} placeholder="추천인 아이디 또는 회원번호" className={inputCls} />
            </div>

            {memberType === 'startup' && (
              <>
                <div className="border-t border-amber-100 dark:border-amber-900/40 pt-4">
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-3 uppercase tracking-wide">⭐ 창업회원 추가 정보</p>
                  <div>
                    <label className={labelCls}>소속 아지트 <span className="text-red-400">*</span></label>
                    <select value={agitCode} onChange={e => setAgitCode(e.target.value)}
                      className={`${inputCls} ${!agitCode ? 'text-neutral-400' : ''}`}>
                      <option value="">아지트를 선택해주세요</option>
                      {AGIT_LIST.map(agit => (
                        <option key={agit.value} value={agit.value}>{agit.label}</option>
                      ))}
                    </select>
                    {!agitCode && <p className="text-xs text-amber-500 dark:text-amber-400 mt-1.5">📍 창업회원은 소속 아지트 선택이 필수입니다.</p>}
                    {agitCode && <p className="text-xs text-green-500 mt-1.5">✓ {AGIT_LIST.find(a => a.value === agitCode)?.label} 아지트를 선택했습니다.</p>}
                  </div>
                </div>

                <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4">
                  <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400 mb-3 uppercase tracking-wide">정산 계좌 정보 <span className="text-neutral-400 font-normal normal-case">(선택)</span></p>
                  <div className="space-y-3">
                    <div>
                      <label className={labelCls}>은행명</label>
                      <select value={bankCode} onChange={e => { setBankCode(e.target.value); setBankName(e.target.options[e.target.selectedIndex].text) }} className={inputCls}>
                        <option value="">은행 선택</option>
                        <option value="004">국민은행</option><option value="088">신한은행</option>
                        <option value="020">우리은행</option><option value="081">하나은행</option>
                        <option value="003">기업은행</option><option value="011">농협은행</option>
                        <option value="023">SC제일은행</option><option value="090">카카오뱅크</option>
                        <option value="089">케이뱅크</option><option value="092">토스뱅크</option>
                        <option value="032">부산은행</option><option value="034">광주은행</option>
                        <option value="031">대구은행</option><option value="039">경남은행</option>
                        <option value="037">전북은행</option><option value="035">제주은행</option>
                        <option value="007">수협은행</option><option value="071">우체국</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>계좌번호</label>
                      <input type="text" value={accountNo} onChange={e => setAccountNo(e.target.value)} placeholder="- 없이 숫자만 입력" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>예금주명</label>
                      <input type="text" value={accountHolder} onChange={e => setAccountHolder(e.target.value)} placeholder="예금주 실명" className={inputCls} />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 space-y-2.5">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={agreeTerms} onChange={e => setAgreeTerms(e.target.checked)} className="mt-0.5 accent-neutral-900" />
                <span className="text-sm text-neutral-700 dark:text-neutral-300"><strong>(필수)</strong> 이용약관에 동의합니다. <a href="/ko/terms" className="text-primary-600 underline text-xs">약관 보기</a></span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={agreePrivacy} onChange={e => setAgreePrivacy(e.target.checked)} className="mt-0.5 accent-neutral-900" />
                <span className="text-sm text-neutral-700 dark:text-neutral-300"><strong>(필수)</strong> 개인정보 수집·이용에 동의합니다. <a href="/ko/privacy" className="text-primary-600 underline text-xs">약관 보기</a></span>
              </label>
            </div>

            {globalError && (
              <p className="text-xs text-red-500 text-center bg-red-50 dark:bg-red-950/30 rounded-xl py-2.5 px-3">{globalError}</p>
            )}

            <button type="submit" disabled={isPending}
              className={`w-full rounded-xl font-semibold py-3 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1 ${
                memberType === 'startup'
                  ? 'bg-amber-500 hover:bg-amber-400 text-white'
                  : 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-700 dark:hover:bg-neutral-100'
              }`}>
              {isPending ? '처리 중...' : memberType === 'startup' ? '⭐ 창업회원 가입' : '🛒 일반회원 가입'}
            </button>
          </form>
        </div>

        {/* ★ 로그인 링크 /ko/login으로 수정 */}
        <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-6">
          이미 계정이 있으신가요?{' '}
          <a href="/ko/login" className="font-semibold text-neutral-900 dark:text-white hover:underline">로그인</a>
        </p>
      </div>
    </div>
  )
}
