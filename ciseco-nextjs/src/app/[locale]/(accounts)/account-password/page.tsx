import { redirect } from 'next/navigation'

/** 예전 주소 북마크는 개인정보 페이지로 통합 */
export default async function AccountPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  redirect(`/${locale}/account`)
}
