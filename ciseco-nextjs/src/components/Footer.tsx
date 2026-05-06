'use client'

import Logo from '@/components/Logo'
import { COMPANY_INFO } from '@/data/company-info'
import { Link } from '@/shared/link'
import SocialsList1 from '@/shared/SocialsList1/SocialsList1'
import clsx from 'clsx'
import { useTranslations } from 'next-intl'

function FooterNavLinks({
  className,
  withVendorAccent,
}: {
  className?: string
  withVendorAccent?: boolean
}) {
  const t = useTranslations('Footer')
  return (
    <nav className={className} aria-label={t('menuAria')}>
      <Link href="/terms/service" className="transition-colors hover:text-kn541-black dark:hover:text-white">
        {t('terms')}
      </Link>
      <Link href="/terms/privacy" className="transition-colors hover:text-kn541-black dark:hover:text-white">
        {t('privacy')}
      </Link>
      <a href="#" className="transition-colors hover:text-kn541-black dark:hover:text-neutral-200">
        {t('guide')}
      </a>
      <Link
        href="/vendor-inquiry"
        className={clsx(
          'transition-colors',
          withVendorAccent && 'text-kn541-green hover:text-kn541-green/90 dark:text-kn541-green',
        )}
      >
        {t('vendor')}
      </Link>
    </nav>
  )
}

const inquiryBtnCls =
  'inline-flex h-10 w-[140px] shrink-0 items-center justify-center rounded-[5px] border border-kn541-gray-300 bg-white text-sm font-medium text-kn541-black hover:bg-kn541-gray-100 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700'

export default function Footer() {
  const t = useTranslations('Footer')
  const telHref = `tel:${COMPANY_INFO.cs.phone.replace(/\D/g, '')}`

  return (
    <footer className="mt-16 border-t border-kn541-gray-300 bg-kn541-gray-100 dark:border-neutral-600 dark:bg-neutral-900/40">
      <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-5 lg:py-12 lg:pb-16">
        <FooterNavLinks
          className="mb-8 hidden gap-6 text-sm font-medium text-kn541-gray-700 dark:text-neutral-400 lg:flex"
          withVendorAccent
        />

        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between lg:gap-20">
          <div className="max-w-xl text-kn541-black dark:text-neutral-100">
            <h2 className="mb-1.5 text-xs font-semibold lg:mb-6 lg:text-[26px] lg:font-bold">{t('csTitle')}</h2>
            <div className="mb-6 flex flex-col gap-[15px] lg:mb-8 lg:flex-row lg:items-center lg:gap-5">
              <a
                href={telHref}
                className="text-xl font-semibold text-kn541-green lg:text-[32px] lg:font-bold lg:text-kn541-black dark:lg:text-neutral-100"
              >
                {COMPANY_INFO.cs.phone}
              </a>
              <p className="max-w-md text-[13px] font-medium leading-snug text-kn541-black lg:text-base dark:text-neutral-300">
                {t('csHours')}
              </p>
            </div>

            <div className="space-y-4 lg:hidden">
              <div className="flex items-center gap-3">
                <a href={COMPANY_INFO.cs.kakaoUrl} className={inquiryBtnCls}>
                  {t('kakaoInquiry')}
                </a>
                <p className="whitespace-pre-line text-xs leading-[1.3] text-kn541-gray-700 dark:text-neutral-400">
                  {t('kakaoBlurb')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <a href={`mailto:${COMPANY_INFO.email}`} className={inquiryBtnCls}>
                  {t('emailInquiry')}
                </a>
                <p className="whitespace-pre-line text-xs leading-[1.3] text-kn541-gray-700 dark:text-neutral-400">
                  {t('emailBlurb')}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-6 lg:mt-8">
              <SocialsList1 className="!flex-row flex-wrap gap-x-4 gap-y-3" />
              <Link
                href="/vendor-inquiry"
                className="inline-flex w-fit items-center gap-2 rounded-xl border-2 border-kn541-gray-700 px-4 py-2 text-sm font-semibold text-kn541-gray-900 transition-colors hover:bg-kn541-gray-900 hover:text-white dark:border-neutral-300 dark:text-neutral-100 dark:hover:bg-neutral-100 dark:hover:text-neutral-900"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                {t('vendorBanner')}
              </Link>
            </div>

            <div className="mt-10 hidden lg:block">
              <Logo />
            </div>
          </div>

          <div className="min-w-0 flex-1 lg:max-w-[min(100%,480px)]">
            <FooterNavLinks
              className="mb-4 flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-semibold text-kn541-gray-700 dark:text-neutral-400 lg:hidden"
              withVendorAccent
            />
            <div className="space-y-1 text-xs leading-relaxed text-kn541-black dark:text-neutral-300 lg:text-sm">
              <p>
                상호명 : {COMPANY_INFO.bizName} / 회사명 : {COMPANY_INFO.corpName}
              </p>
              <p>대표이사 : {COMPANY_INFO.ceo}</p>
              <p>주소 : {COMPANY_INFO.address}</p>
              <p>
                사업자등록번호 : {COMPANY_INFO.bizNo}
                <a
                  href={COMPANY_INFO.bizCheckUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 inline-block rounded border border-kn541-gray-300 px-2 py-0.5 text-xs font-medium text-kn541-green hover:bg-kn541-gray-100 dark:border-neutral-600 dark:hover:bg-neutral-800"
                >
                  {t('checkBizInfo')}
                </a>
              </p>
              <p>통신판매업신고 : {COMPANY_INFO.mailOrderNo}</p>
              <p className="mt-6 lg:mt-6">FAX : {COMPANY_INFO.fax}</p>
              <p>
                메일 :{' '}
                <a
                  className="text-kn541-green underline-offset-2 hover:underline"
                  href={`mailto:${COMPANY_INFO.email}`}
                >
                  {COMPANY_INFO.email}
                </a>
              </p>
              <p>개인정보관리자 : {COMPANY_INFO.privacyOfficer}</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
