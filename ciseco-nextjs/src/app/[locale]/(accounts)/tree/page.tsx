'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import L3Guard from '@/components/mypage/L3Guard'
import {
  buildShopDownlineTree,
  flattenDownline,
  formatJoined,
  statsFromFlat,
  type ShopMlmNode,
} from '@/lib/mlm/shopDownline'
import { mypageFetch, MypageApiError } from '@/lib/mypage/api'
import { useTranslations } from 'next-intl'

const DEPTH_COLORS = ['#7C3AED', '#1D4ED8', '#C2410C', '#047857', '#B45309']

const MAX_WAVE_DEPTH = 14
const MAX_NODES = 2000
const MIN_DISPLAY_DEPTH = 1
const MAX_DISPLAY_DEPTH = 14

function clampDisplayDepth(n: number): number {
  if (!Number.isFinite(n)) return MIN_DISPLAY_DEPTH
  return Math.min(MAX_DISPLAY_DEPTH, Math.max(MIN_DISPLAY_DEPTH, Math.floor(n)))
}

function initialExpandedIds(root: ShopMlmNode): Set<string> {
  const s = new Set<string>()
  const visit = (n: ShopMlmNode) => {
    if (n.user_id && n.depth < 2) s.add(n.user_id)
    for (const c of n.children) visit(c)
  }
  visit(root)
  return s
}

function MemberRow({ m }: { m: ShopMlmNode }) {
  const c = DEPTH_COLORS[(m.depth - 1) % DEPTH_COLORS.length]
  return (
    <div
      className="mb-2 rounded-2xl border border-neutral-200 bg-white py-3 pl-3.5 pr-3.5 dark:border-neutral-700 dark:bg-neutral-900"
      style={{ borderLeftWidth: 4, borderLeftColor: c }}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-bold">👤 {m.name_masked}</span>
            <span className="font-mono text-sm text-neutral-600 dark:text-neutral-300">{m.member_no}</span>
            <span
              className="rounded-full px-2 py-0.5 text-xs font-semibold text-white"
              style={{ background: c }}
            >
              {m.user_type_label}
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-3 text-sm text-neutral-500 dark:text-neutral-400">
            <span>가입 {formatJoined(m.joined_at)}</span>
            {m.downline_count > 0 && <span>직접 하선 {m.downline_count}명</span>}
          </div>
        </div>
        <span
          className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold"
          style={{ background: `${c}22`, color: c }}
        >
          {m.depth}단계
        </span>
      </div>
    </div>
  )
}

function TreeBranch({
  node,
  expandedIds,
  onToggle,
  maxDisplayDepth,
}: {
  node: ShopMlmNode
  expandedIds: Set<string>
  onToggle: (userId: string) => void
  maxDisplayDepth: number
}) {
  const c = DEPTH_COLORS[(node.depth - 1 + DEPTH_COLORS.length) % DEPTH_COLORS.length]
  const hasChildren = node.children.length > 0 && node.depth < maxDisplayDepth
  const open = expandedIds.has(node.user_id)

  return (
    <div className="select-none">
      <div className="flex items-start gap-1.5 py-0.5 text-[15px]">
        {hasChildren ? (
          <button
            type="button"
            aria-expanded={open}
            onClick={() => onToggle(node.user_id)}
            className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50 text-xs text-neutral-600 hover:bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-800 dark:hover:bg-neutral-700"
          >
            {open ? '▼' : '▶'}
          </button>
        ) : (
          <span className="inline-block w-6 shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold" style={{ color: c }}>
              👤 {node.name_masked}
            </span>
            <span className="font-mono text-xs text-neutral-500 dark:text-neutral-400">{node.member_no}</span>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
              style={{ background: c }}
            >
              {node.user_type_label}
            </span>
            <span className="text-xs text-neutral-400">{formatJoined(node.joined_at)}</span>
            <span className="text-xs font-bold text-neutral-500">{node.depth}단계</span>
          </div>
        </div>
      </div>
      {open && hasChildren && (
        <div className="ml-3 border-l border-neutral-200 pl-3 dark:border-neutral-700">
          {node.children.map(ch => (
            <TreeBranch
              key={ch.user_id}
              node={ch}
              expandedIds={expandedIds}
              onToggle={onToggle}
              maxDisplayDepth={maxDisplayDepth}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function TreeContent() {
  const router = useRouter()
  const t = useTranslations('Account')
  const [view, setView] = useState<'list' | 'tree'>('list')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [truncated, setTruncated] = useState(false)
  const [root, setRoot] = useState<ShopMlmNode | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set())
  /** 표시 단계 (1 = 직접 추천만 … 14) */
  const [displayMaxDepth, setDisplayMaxDepth] = useState(MIN_DISPLAY_DEPTH)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    setTruncated(false)
    try {
      const me = await mypageFetch<Record<string, unknown>>('/auth/me')
      const uid = String(me.user_id ?? me.id ?? '')
      if (!uid) {
        setError('회원 정보를 확인할 수 없습니다.')
        setRoot(null)
        return
      }
      const { root: tree, truncated: t2 } = await buildShopDownlineTree(me, {
        maxDepth: MAX_WAVE_DEPTH,
        maxNodes: MAX_NODES,
      })
      setRoot(tree)
      setTruncated(t2)
      setExpandedIds(initialExpandedIds(tree))
    } catch (e) {
      if (e instanceof MypageApiError && e.status === 401) {
        router.replace('/login')
        return
      }
      setError(e instanceof MypageApiError ? e.message : '조직도를 불러오지 못했습니다.')
      setRoot(null)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    void load()
  }, [load])

  const flat = useMemo(() => (root ? flattenDownline(root) : []), [root])
  const flatFiltered = useMemo(
    () => flat.filter(m => m.depth <= displayMaxDepth),
    [flat, displayMaxDepth]
  )
  const stats = useMemo(() => statsFromFlat(flatFiltered), [flatFiltered])

  const byDepth = useMemo(() => {
    const m: Record<number, ShopMlmNode[]> = {}
    for (const x of flatFiltered) {
      m[x.depth] = m[x.depth] ?? []
      m[x.depth].push(x)
    }
    return m
  }, [flatFiltered])

  const depthKeys = useMemo(
    () =>
      Object.keys(byDepth)
        .map(Number)
        .sort((a, b) => a - b),
    [byDepth]
  )

  const toggleExpand = useCallback((userId: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(userId)) next.delete(userId)
      else next.add(userId)
      return next
    })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
        {error}
        <button type="button" className="mt-3 block w-full text-primary-600 underline" onClick={() => void load()}>
          다시 시도
        </button>
      </div>
    )
  }

  if (!root) {
    return null
  }

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

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-700 dark:bg-neutral-900">
        <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">단계:</span>
        <button
          type="button"
          aria-label="단계 감소"
          disabled={displayMaxDepth <= MIN_DISPLAY_DEPTH}
          onClick={() => setDisplayMaxDepth(d => clampDisplayDepth(d - 1))}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 text-lg font-bold text-neutral-700 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
        >
          −
        </button>
        <input
          type="number"
          min={MIN_DISPLAY_DEPTH}
          max={MAX_DISPLAY_DEPTH}
          value={displayMaxDepth}
          onChange={e => setDisplayMaxDepth(clampDisplayDepth(Number(e.target.value)))}
          className="h-9 w-16 rounded-lg border border-neutral-200 bg-white px-2 text-center text-sm font-semibold tabular-nums focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 dark:border-neutral-600 dark:bg-neutral-950 dark:text-white"
        />
        <button
          type="button"
          aria-label="단계 증가"
          disabled={displayMaxDepth >= MAX_DISPLAY_DEPTH}
          onClick={() => setDisplayMaxDepth(d => clampDisplayDepth(d + 1))}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 text-lg font-bold text-neutral-700 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
        >
          +
        </button>
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          {MIN_DISPLAY_DEPTH}~{MAX_DISPLAY_DEPTH}단계까지 표시 · 기본 {MIN_DISPLAY_DEPTH}단계(직접 추천)
        </span>
      </div>

      <div className="flex flex-wrap gap-4 border-b border-neutral-200 bg-white py-3.5 text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
        <span>
          전체 하선 <strong className="text-neutral-900 dark:text-neutral-100">{stats.total_count}명</strong>
        </span>
        <span>
          최대 깊이 <strong className="text-neutral-900 dark:text-neutral-100">{stats.max_depth}단계</strong>
        </span>
        {depthKeys.map(d => (
          <span key={d}>
            {d}단계:{' '}
            <strong className="text-neutral-900 dark:text-neutral-100">{byDepth[d]?.length ?? 0}명</strong>
          </span>
        ))}
      </div>

      {truncated && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          표시 한도({MAX_NODES.toLocaleString()}명)에 도달하여 일부 하선만 불러왔습니다. 어드민에서 전체를 확인할 수 있습니다.
        </div>
      )}

      <div
        className="my-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
      >
        🔒 성명은 마스킹 처리되며, 회원번호는 로그인·식별용으로 표시됩니다. 연락처·주소 등은 제공되지 않습니다.
      </div>

      <div className="pb-8">
        {flat.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mb-3 text-5xl">🌱</div>
            <div className="text-lg text-neutral-500 dark:text-neutral-400">아직 하선 회원이 없어요.</div>
          </div>
        ) : stats.total_count === 0 ? (
          <div className="py-12 text-center text-sm text-neutral-500 dark:text-neutral-400">
            선택한 단계({displayMaxDepth}단계)에 해당하는 하선이 없습니다. 단계를 늘려 보세요.
          </div>
        ) : view === 'list' ? (
          depthKeys.map(d => (
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
                {d}단계 ({byDepth[d]?.length ?? 0}명)
              </div>
              {(byDepth[d] ?? []).map(m => (
                <MemberRow key={m.user_id} m={m} />
              ))}
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
            <div className="mb-3 rounded-xl border border-primary-200 bg-primary-50/40 px-3 py-2 text-[15px] font-bold text-primary-800 dark:border-primary-900 dark:bg-primary-950/30 dark:text-primary-200">
              나 —{' '}
              <span className="font-mono font-semibold">{root.member_no}</span>
              <span className="ml-2 font-normal text-neutral-600 dark:text-neutral-300">
                {root.name_masked} · {root.user_type_label}
              </span>
            </div>
            {root.children.length === 0 ? (
              <p className="text-sm text-neutral-500">직접 추천한 하선이 없습니다.</p>
            ) : (
              root.children.map(ch => (
                <TreeBranch
                  key={ch.user_id}
                  node={ch}
                  expandedIds={expandedIds}
                  onToggle={toggleExpand}
                  maxDisplayDepth={displayMaxDepth}
                />
              ))
            )}
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
