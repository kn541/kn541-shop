'use client'
// M6-FE: 유료회원 전환 CTA 배너
// 노출 조건: user_type=002(일반회원)만. 006(유료)·그 외 유형에는 렌더링 없음.
// 목적지: /packages (locale-aware Link — /ko 하드코딩 없음)
import { Link } from '@/components/Link'
import { useEffectiveUserType } from '@/hooks/useEffectiveUserType'

/**
 * PaidUpgradeBanner
 * - 일반회원(002)에게만 보이는 유료전환 유도 배너.
 * - 로딩 중 / 일반회원이 아닌 경우 null 반환(flash 없음).
 * - 클릭 시 /packages 이동. 결제·전환은 기존 패키지 구매→Toss 흐름 그대로.
 */
export default function PaidUpgradeBanner() {
  const { loading, isGeneralMember } = useEffectiveUserType()

  // 로딩 중 또는 002가 아니면 렌더링 없음
  if (loading || !isGeneralMember) return null

  return (
    <div className="rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50 p-5 dark:border-violet-800 dark:from-violet-950/40 dark:to-purple-950/40">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-violet-700 dark:text-violet-300">
            ✨ 유료회원 전용 혜택
          </p>
          <p className="mt-1 text-sm leading-relaxed text-violet-600 dark:text-violet-400">
            배당 수익 · 조직도 · 마이샵 등 유료 기능을 이용하려면 유료회원으로 전환하세요.
          </p>
        </div>
        <Link
          href="/packages"
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 active:bg-violet-800"
        >
          유료회원 전환하기 →
        </Link>
      </div>
    </div>
  )
}
