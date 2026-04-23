import { redirect } from 'next/navigation'

/** 레거시 /mypage/* → (accounts) Ciseco 경로 */
const SEGMENT_MAP: Record<string, string> = {
  orders: 'orders',
  points: 'points',
  coupons: 'coupons',
  profile: 'account',
  dividends: 'dividends',
  tree: 'tree',
  withdraw: 'withdraw',
  'upgrade-paid': 'upgrade-paid',
}

export default async function LegacyMypageRedirectPage({
  params,
}: {
  params: Promise<{ locale: string; path?: string[] }>
}) {
  const { locale, path } = await params
  const segments = path ?? []

  if (segments.length === 0) {
    redirect(`/${locale}/account`)
  }

  const [head, ...rest] = segments

  if (head === 'shop') {
    redirect(`/${locale}/myshop`)
  }

  const mapped = head ? SEGMENT_MAP[head] : undefined
  if (mapped) {
    const tail = rest.length ? `/${rest.join('/')}` : ''
    redirect(`/${locale}/${mapped}${tail}`)
  }

  redirect(`/${locale}/account`)
}
