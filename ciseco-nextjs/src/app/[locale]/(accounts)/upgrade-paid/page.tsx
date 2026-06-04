import { redirect } from 'next/navigation'

// /[locale]/upgrade-paid → /[locale]/packages 서버 리다이렉트 (locale 유지)
// 직접 접근·북마크·레거시 /mypage/upgrade-paid 경유 모두 처리
// Phase 5 구현 시 이 파일을 실제 콘텐츠로 교체
export default async function UpgradePaidPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  redirect(`/${locale}/packages`)
}
