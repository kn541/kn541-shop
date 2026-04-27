import { redirect } from 'next/navigation'

/**
 * ⚠️ 이 파일은 (mypage)/mypage/[[...path]]/page.tsx 와 URL 충돌 방지용 서버 리다이렉트입니다.
 * 실제 마이페이지 홈은 (mypage) 라우트그룹의 catch-all 에서 처리합니다.
 * → /ko/account 로 리다이렉트
 */
export default async function MypageShopRedirect({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  redirect(`/${locale}/account`)
}
