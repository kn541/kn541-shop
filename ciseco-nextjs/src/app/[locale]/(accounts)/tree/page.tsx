'use client'

import { useState } from 'react'
import L3Guard from '@/components/mypage/L3Guard'
import { MOCK_DOWNLINE } from '@/lib/mypage/mocks'
import type { DownlineMember } from '@/lib/mypage/types'
import { useTranslations } from 'next-intl'

const DEPTH_COLORS = ['#7C3AED', '#1D4ED8', '#C2410C', '#047857', '#B45309']

function MemberCard({ m }: { m: DownlineMember }) {
  const c = DEPTH_COLORS[(m.depth - 1) % DEPTH_COLORS.length]
  return (
    <div
      className="mb-2 rounded-2xl border border-neutral-200 bg-white py-3 pl-3.5 pr-3.5 dark:border-neutral-700 dark:bg-neutral-900"
      style={{ borderLeftWidth: 4, borderLeftColor: c }}
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="text-base font-bold">👤 {m.username_masked}</span>
          <span className="ml-2 text-sm text-neutral-500 dark:text-neutral-400">({m.member_no_masked})</span>
        </div>
        <span
          className="rounded-full px-2.5 py-0.5 text-xs font-bold"
          style={{ background: `${c}22`, color: c }}
        >
          {m.depth}단계
        </span>
      </div>
      <div className="mt-1.5 flex gap-4 text-sm text-neutral-500 dark:text-neutral-400">
        <span>가입 {new Date(m.joined_at).toLocaleDateString('ko-KR')}</span>
        {m.downline_count > 0 && <span>하선 {m.downline_count}명</span>}
        {m.parent_username_masked && <span>↑ {m.parent_username_masked}</span>}
      </div>
    </div>
  )
}

function TreeRow({ m, indent }: { m: DownlineMember; indent: number }) {
  const c = DEPTH_COLORS[(m.depth - 1) % DEPTH_COLORS.length]
  return (
    <div className="mb-1.5" style={{ paddingLeft: indent * 20 }}>
      <div className="flex items-center gap-2 text-[15px]">
        <span className="text-neutral-500">{indent > 0 ? '└─' : '─'}</span>
        <span className="font-semibold" style={{ color: c }}>
          👤 {m.username_masked}
        </span>
        <span className="text-xs text-neutral-500 dark:text-neutral-400">({m.member_no_masked})</span>
      </div>
    </div>
  )
}

function TreeContent() {
  const t = useTranslations('Account')
  const [view, setView] = useState<'list' | 'tree'>('list')
  const data = MOCK_DOWNLINE

  const byDepth: Record<number, DownlineMember[]> = {}
  data.members.forEach(m => {
    byDepth[m.depth] = byDepth[m.depth] ?? []
    byDepth[m.depth].push(m)
  })
  const depths = Object.keys(byDepth)
    .map(Number)
    .sort((a, b) => a - b)

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="text-2xl font-semibold sm:text-3xl">{t('referralTree')}</h1>
        <div className="flex gap-1">
          {(['list', 'tree'] as const).map(v => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                view === v
                  ? 'border-primary-500 bg-primary-500 font-bold text-white'
                  : 'border-neutral-200 bg-white dark:border-neutral-600 dark:bg-neutral-900'
              }`}
            >
              {v === 'list' ? '📋 리스트' : '🌳 트리'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 border-b border-neutral-200 bg-white py-3.5 text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
        <span>
          전체 하선 <strong className="text-neutral-900 dark:text-neutral-100">{data.total_count}명</strong>
        </span>
        <span>
          요대 깊이 <strong className="text-neutral-900 dark:text-neutral-100">{data.max_depth}단계</strong>
        </span>
        {depths.map(d => (
          <span key={d}>
            {d}단계:{' '}
            <strong className="text-neutral-900 dark:text-neutral-100">{data.by_depth[d]}명</strong>
          </span>
        ))}
      </div>

      <div
        className="my-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
      >
        🔒 개인정보 보호를 위해 이름 마스킹 처리되어 표시되며, 연락정보 및 주소는 제공되지 않습니다.
      </div>

      <div className="pb-8">
        {data.total_count === 0 ? (
          <div className="py-12 text-center">
            <div className="mb-3 text-5xl">🌱</div>
            <div className="text-lg text-neutral-500 dark:text-neutral-400">아직 하선 회원이 없어요.</div>
          </div>
        ) : view === 'list' ? (
          depths.map(d => (
            <div key={d}>
              <div
                className="mb-2 mt-4 flex items-center gap-2 text-[15px] font-bold"
                style={{ color: DEPTH_COLORS[(d - 1) % DEPTH_COLORS.length] }}
              >
                <span
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full text-xs text-white"
                  style={{ background: DEPTH_COLORS[(d - 1) % DEPTH_COLORS.length] }}
                >
                  {d}
                </span>
                {d}단계 ({byDepth[d].length}명)
              </div>
              {byDepth[d].map(m => (
                <MemberCard key={m.user_id} m={m} />
              ))}
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
            <div className="mb-3 text-[15px] font-bold text-primary-600">나 (1단계 상선)</div>
            {data.members.map(m => (
              <TreeRow key={m.user_id} m={m} indent={m.depth - 1} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default function TreePage() {
  return (
    <L3Guard
      embedded
      title="내 조직도"
      lockBenefits={['조직도 조회', '하선 단계별 통계', '하선 활동 기록']}
    >
      <TreeContent />
    </L3Guard>
  )
}
