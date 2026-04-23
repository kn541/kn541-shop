'use client'

import { use } from 'react'
import { useTranslations } from 'next-intl'

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = use(params)
  const t = useTranslations('Account')

  return (
    <div className="flex flex-col gap-y-6">
      <h1 className="text-2xl font-semibold sm:text-3xl">{t('ordersHistory')}</h1>
      <p className="text-neutral-600 dark:text-neutral-400">주문 ID: {orderId}</p>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        주문 상세 API 연동은 추후 확장됩니다.
      </p>
    </div>
  )
}
