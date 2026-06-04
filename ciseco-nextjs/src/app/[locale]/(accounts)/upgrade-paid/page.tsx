import { redirect } from 'next/navigation'

// /upgrade-paid → /packages 서버 리다이렉트
// 직접 접근·북마크·레거시 /mypage/upgrade-paid 경유 모두 처리
// Phase 5 구현 시 이 파일을 실제 콘텐츠로 교체
export default function UpgradePaidPage() {
  redirect('/packages')
}
