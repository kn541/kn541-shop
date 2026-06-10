// KN541 쇼핑몰 메인(인덱스) — 서비스 점검(공사중) 안내 화면
// 점검 종료 시 이 파일을 직전 커밋 내용(MainPageBody 렌더)으로 되돌리면 복구됨.
// 인덱스('/')에만 적용. /products, /cart 등 다른 경로는 정상 동작.

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '서비스 점검 안내 | KN541',
  description: 'KN541 쇼핑몰이 현재 시스템 점검 중입니다. 잠시 후 다시 이용해 주세요.',
  robots: { index: false, follow: false },
}

export default function PageHome() {
  return (
    <main className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#eef9da] via-white to-white px-6 text-center">
      {/* 로고 */}
      <div className="mb-10 select-none text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl">
        kn<span className="text-[#7cc62a]">541</span>
      </div>

      {/* 점검 아이콘 (렌치) */}
      <svg
        width="84"
        height="84"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#7cc62a"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mb-8"
        aria-hidden="true"
      >
        <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.3 2.3-2-2 2.3-2.3z" />
      </svg>

      <h1 className="mb-4 text-2xl font-bold text-neutral-900 sm:text-3xl">
        사이트 점검 안내
      </h1>
      <p className="max-w-md text-base leading-relaxed text-neutral-600 sm:text-lg">
        보다 나은 서비스를 제공하기 위해
        <br />
        현재 시스템 점검을 진행하고 있습니다.
      </p>
      <p className="mt-3 text-sm text-neutral-500">
        이용에 불편을 드려 죄송합니다. 잠시 후 다시 찾아주세요.
      </p>
    </main>
  )
}
