import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import ForgotUsernameClient from './ForgotUsernameClient'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Auth' })
  return {
    title: t('metaFindUsernameTitle'),
    description: t('metaFindUsernameDescription'),
  }
}

export default function ForgotUsernamePage() {
  return <ForgotUsernameClient />
}
