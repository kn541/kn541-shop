import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import ForgotPasswordClient from './ForgotPasswordClient'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Auth' })
  return {
    title: t('metaForgotTitle'),
    description: t('metaForgotDescription'),
  }
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />
}
