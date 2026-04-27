import I404Png from '@/images/404.png'
import NcImage from '@/shared/NcImage/NcImage'
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '페이지를 찾을 수 없습니다 | KN541',
  description: '요청하신 페이지를 찾을 수 없습니다.',
}

/** 루트 404는 [locale] 밖에서 렌더되므로 next-intl·Aside 의존 컴포넌트를 쓰지 않습니다. */
const Page404 = () => (
  <div className="nc-Page404">
    <div className="relative container pt-5 pb-16 lg:pt-5 lg:pb-20">
      <header className="mx-auto max-w-2xl space-y-2 text-center">
        <NcImage src={I404Png} alt="페이지를 찾을 수 없습니다" />
        <span className="block text-sm font-medium tracking-wider text-neutral-800 sm:text-base dark:text-neutral-200">
          요청하신 페이지를 찾을 수 없습니다.
        </span>
        <div className="pt-8">
          <Link
            href="/ko"
            className="relative isolate inline-flex items-center justify-center rounded-full border border-transparent bg-zinc-900 px-6 py-3 text-base/6 font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </header>
    </div>
  </div>
)

export default Page404
