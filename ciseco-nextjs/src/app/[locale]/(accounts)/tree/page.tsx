'use client'

// KN541 마이페이지 조직도 — club2000 스타일 (어드민과 동일)
// 자신의 하위만 조회 (API 권한 제한)

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import L3Guard from '@/components/mypage/L3Guard'
import { mypageFetch, MypageApiError } from '@/lib/mypage/api'
import dynamic from 'next/dynamic'
import type { CustomNodeElementProps, RawNodeDatum } from 'react-d3-tree'

// SSR에서 d3/DOM 접근으로 크래시 → 클라이언트 전용 로드
const Tree = dynamic(() => import('react-d3-tree'), { ssr: false })

// ── 타입 & 상수 ──────────────────────────────────────────────────────────
type TreeNode = {
  user_id: string; member_no: string; name: string; username: string
  created_at: string; agit_name: string; level_code: string | null
  level_name: string | null; position_name: string | null
  recommender_name: string; recommender_member_no: string
  gwcp_balance: number; depth: number; has_children: boolean
  children_count: number; children: TreeNode[]
}

const LEVEL_COLORS: Record<string, { bg: string; border: string; headerBg: string }> = {
  '001': { bg: '#e8f5e9', border: '#66bb6a', headerBg: '#43a047' },
  '002': { bg: '#e3f2fd', border: '#42a5f5', headerBg: '#1e88e5' },
  '003': { bg: '#f3e5f5', border: '#ab47bc', headerBg: '#8e24aa' },
  '004': { bg: '#f5f5f5', border: '#bdbdbd', headerBg: '#757575' },
  '007': { bg: '#ede7f6', border: '#7e57c2', headerBg: '#5e35b1' },
}
const DEFAULT_COLOR = { bg: '#fafafa', border: '#e0e0e0', headerBg: '#9e9e9e' }
const DEPTH_OPTIONS = [2, 3, 4, 5, 10, 50] as const
const DEFAULT_DEPTH = 3
const NODE_W = 200
const NODE_H = 160

// ── 유틸 ──────────────────────────────────────────────────────────────────
function fmtDate(s: string | null | undefined) { return s ? s.slice(0, 10) : '' }
function fmtNum(n: number) { return n ? n.toLocaleString('ko-KR') : '0' }
function getLevelColor(code: string | null) {
  if (!code) return DEFAULT_COLOR
  return LEVEL_COLORS[code.trim()] ?? DEFAULT_COLOR
}

function mapApiNode(raw: Record<string, unknown>): TreeNode {
  const children = Array.isArray(raw.children)
    ? (raw.children as Record<string, unknown>[]).map(mapApiNode) : []
  return {
    user_id: String(raw.user_id ?? ''), member_no: String(raw.member_no ?? ''),
    name: String(raw.name ?? '') || '(이름 없음)', username: String(raw.username ?? ''),
    created_at: String(raw.created_at ?? ''), agit_name: String(raw.agit_name ?? ''),
    level_code: (String(raw.level_code ?? '') || '').trim() || null,
    level_name: String(raw.level_name ?? '') || null,
    position_name: String(raw.position_name ?? '') || null,
    recommender_name: String(raw.recommender_name ?? ''),
    recommender_member_no: String(raw.recommender_member_no ?? ''),
    gwcp_balance: Number(raw.gwcp_balance ?? 0), depth: Number(raw.depth ?? 0),
    has_children: Boolean(raw.has_children), children_count: Number(raw.children_count ?? 0),
    children,
  }
}

function toTreeDatum(node: TreeNode, maxDepth: number, cur = 0): RawNodeDatum {
  const children = cur < maxDepth ? node.children.map(c => toTreeDatum(c, maxDepth, cur + 1)) : []
  return {
    name: node.name,
    attributes: {
      userId: node.user_id, memberNo: node.member_no, username: node.username,
      createdAt: node.created_at, agitName: node.agit_name,
      levelCode: node.level_code ?? '', levelName: node.level_name ?? '',
      positionName: node.position_name ?? '', recName: node.recommender_name,
      recNo: node.recommender_member_no, gwcp: String(node.gwcp_balance ?? 0),
      hasChildren: node.has_children ? 'Y' : 'N', childrenCount: String(node.children_count ?? 0),
    },
    ...(children.length > 0 ? { children } : {}),
  }
}

function countNodes(n: TreeNode): number {
  let c = 1; for (const ch of n.children) c += countNodes(ch); return c
}

// ── Club2000 노드 ────────────────────────────────────────────────────────
function Club2000Node({ nodeDatum, toggleNode }: CustomNodeElementProps) {
  const attr = nodeDatum.attributes ?? {}
  const colors = getLevelColor(String(attr.levelCode || ''))
  const hasChildren = String(attr.hasChildren) === 'Y'
  const childCount = Number(attr.childrenCount || 0)
  const hasRendered = Boolean(nodeDatum.children?.length)
  const x = -(NODE_W / 2), y = -(NODE_H / 2)

  return (
    <foreignObject width={NODE_W} height={NODE_H + 20} x={x} y={y}>
      <div onClick={() => { if (hasRendered) toggleNode() }}
        style={{
          width: NODE_W, height: NODE_H, background: colors.bg,
          border: `2px solid ${colors.border}`, borderRadius: 6,
          cursor: 'pointer', userSelect: 'none', overflow: 'hidden',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          fontFamily: "'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif",
        }}>
        <div style={{
          background: colors.headerBg, color: '#fff', padding: '3px 8px',
          fontSize: 11, fontWeight: 700, display: 'flex',
          justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span>{String(attr.memberNo || '')}</span>
          <span>{String(attr.levelName || '') || String(attr.positionName || '')}</span>
        </div>
        <div style={{ padding: '4px 8px', fontSize: 11, lineHeight: 1.55, color: '#212121' }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>
            {nodeDatum.name}
            <span style={{ fontWeight: 400, fontSize: 11, color: '#666', marginLeft: 4 }}>
              {String(attr.username || '')}
            </span>
          </div>
          <div style={{ color: '#555' }}>{fmtDate(String(attr.createdAt || ''))}</div>
          {attr.agitName && <div style={{ color: '#1565c0', fontWeight: 600 }}>{String(attr.agitName)}</div>}
          {attr.positionName && String(attr.levelName) && (
            <div style={{ color: '#6a1b9a' }}>{String(attr.positionName)}</div>
          )}
          <div style={{ color: '#777', fontSize: 10 }}>
            {String(attr.recName || '')}{attr.recNo ? ` (${String(attr.recNo)})` : ''}
          </div>
          <div style={{ fontWeight: 700, color: '#e65100', marginTop: 2 }}>
            {fmtNum(Number(attr.gwcp || 0))} PV
          </div>
        </div>
        {(hasChildren || childCount > 0) && (
          <div style={{ textAlign: 'center', fontSize: 10, color: colors.headerBg, fontWeight: 700, padding: '0 0 2px' }}>
            {hasRendered ? `▲ ${childCount}갯` : `▼ ${childCount}명`}
          </div>
        )}
      </div>
    </foreignObject>
  )
}

const zoomBtnStyle: React.CSSProperties = {
  width: 36, height: 36, border: '1px solid #bbb', borderRadius: 6,
  background: '#fff', color: '#333', cursor: 'pointer', fontSize: 20,
  fontWeight: 700, lineHeight: 1, display: 'flex', alignItems: 'center',
  justifyContent: 'center', fontFamily: 'Arial, sans-serif',
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────
function TreeContent() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [root, setRoot] = useState<TreeNode | null>(null)
  const [depth, setDepth] = useState(DEFAULT_DEPTH)
  const [zoom, setZoom] = useState(0.55)
  const [translate, setTranslate] = useState({ x: 0, y: 80 })
  const [referralUrl, setReferralUrl] = useState<string | null>(null)
  const [myMemberNo, setMyMemberNo] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const userIdRef = useRef<string>('')
  const treeContainerRef = useRef<HTMLDivElement>(null)
  // fix: ref 콜백 중복 실행 방지 — 초기 translate 설정 1회만
  const translateInitRef = useRef(false)

  const loadTree = useCallback(async (uid: string, d: number) => {
    setLoading(true); setError(null)
    try {
      const data = await mypageFetch<Record<string, unknown>>(`/members/${uid}/tree?depth=${d}`)
      setRoot(mapApiNode(data))
    } catch (e) {
      if (e instanceof MypageApiError && e.status === 401) { router.replace('/login'); return }
      setError(e instanceof MypageApiError ? e.message : '조직도를 불러오지 못했습니다.')
      setRoot(null)
    } finally { setLoading(false) }
  }, [router])

  // 초기 로드: /auth/me → user_id → /members/{id}/tree
  useEffect(() => {
    ;(async () => {
      try {
        const me = await mypageFetch<Record<string, unknown>>('/auth/me')
        const uid = String(me.user_id ?? me.id ?? '')
        if (!uid) { setError('회원 정보를 확인할 수 없습니다.'); setLoading(false); return }
        userIdRef.current = uid
        try {
          const ref = await mypageFetch<{ referral_url?: string; member_no?: string }>(`/members/${uid}/referral-url`)
          setReferralUrl(ref.referral_url ?? null)
          setMyMemberNo(ref.member_no ?? null)
        } catch { /* ignore */ }
        await loadTree(uid, depth)
      } catch (e) {
        if (e instanceof MypageApiError && e.status === 401) { router.replace('/login'); return }
        setError('회원 정보를 확인할 수 없습니다.'); setLoading(false)
      }
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDepthChange = useCallback((d: number) => {
    setDepth(d)
    // depth 변경 시 translate 재계산 허용
    translateInitRef.current = false
    if (userIdRef.current) void loadTree(userIdRef.current, d)
  }, [loadTree])

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await treeContainerRef.current?.requestFullscreen()
        setIsFullscreen(true)
        try { await (screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> }).lock?.('landscape') } catch { /* ignore */ }
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
        try { (screen.orientation as ScreenOrientation & { unlock?: () => void }).unlock?.() } catch { /* ignore */ }
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    const handler = () => {
      setIsFullscreen(!!document.fullscreenElement)
      // 전체화면 전환 시 translate 재계산 허용
      translateInitRef.current = false
    }
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  const treeData = useMemo(() => root ? toTreeDatum(root, depth + 5) : null, [root, depth])
  const dataKey = useMemo(() => root ? `${root.user_id}-${depth}-${countNodes(root)}` : '', [root, depth])
  const totalCount = root ? countNodes(root) - 1 : 0

  const renderNode = useCallback((props: CustomNodeElementProps) => <Club2000Node {...props} />, [])

  // fix: ref 콜백을 useCallback으로 안정화 — 매 렌더마다 새 함수 생성 방지
  const containerRefCallback = useCallback((el: HTMLDivElement | null) => {
    treeContainerRef.current = el
    if (el && !translateInitRef.current) {
      translateInitRef.current = true
      const { width } = el.getBoundingClientRect()
      setTranslate({ x: Math.round(width / 2), y: 80 })
    }
  }, [])

  return (
    <>
      {/* 추천 URL */}
      {referralUrl && (
        <div className="flex flex-col gap-2 rounded-2xl border border-primary-200 bg-primary-50/50 p-4 dark:border-primary-900 dark:bg-primary-950/30 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-primary-700 dark:text-primary-300">내 추천 URL</p>
            <p className="truncate font-mono text-sm text-neutral-800 dark:text-neutral-100">{referralUrl}</p>
            {myMemberNo && <p className="mt-0.5 text-xs text-neutral-500">회원번호 {myMemberNo}</p>}
          </div>
          <button type="button" onClick={() => void navigator.clipboard.writeText(referralUrl)}
            className="shrink-0 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
            복사
          </button>
        </div>
      )}

      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">내 조직도</h1>
        {totalCount > 0 && (
          <span className="text-sm text-neutral-500">하위 <strong className="text-primary-600">{totalCount}</strong>명</span>
        )}
      </div>

      {/* 상태 표시 */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-700">
          {error}
          <button type="button" className="mt-3 block w-full text-primary-600 underline"
            onClick={() => { if (userIdRef.current) void loadTree(userIdRef.current, depth) }}>
            다시 시도
          </button>
        </div>
      )}

      {/* 트리 영역 */}
      {!loading && !error && treeData && (
        <div ref={containerRefCallback} style={{
          width: '100%',
          height: isFullscreen ? '100vh' : 'calc(100vh - 250px)',
          minHeight: isFullscreen ? '100vh' : 600,
          background: '#f8f9fa', borderRadius: isFullscreen ? 0 : 12,
          overflow: 'hidden', position: 'relative',
          border: isFullscreen ? 'none' : '1px solid #e0e0e0',
        }}>
          {/* 줌 */}
          <div style={{
            position: 'absolute', top: 12, left: 12, zIndex: 10,
            display: 'flex', flexDirection: 'column', gap: 4,
            background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', padding: 4,
          }}>
            <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} style={zoomBtnStyle}>{'\u002B'}</button>
            <div style={{ textAlign: 'center', fontSize: 11, color: '#333', fontWeight: 600 }}>{Math.round(zoom * 100)}%</div>
            <button onClick={() => setZoom(z => Math.max(0.1, z - 0.1))} style={zoomBtnStyle}>{'\u2212'}</button>
            <button onClick={() => setZoom(0.55)} style={{ ...zoomBtnStyle, height: 28, fontSize: 10, fontWeight: 600 }}>리셋</button>
            <button
              onClick={() => void toggleFullscreen()}
              style={{ ...zoomBtnStyle, height: 28, fontSize: 14, fontWeight: 600 }}
              title={isFullscreen ? '전체화면 종료' : '전체화면'}
            >
              {isFullscreen ? '✕' : '⛶'}
            </button>
          </div>

          {/* 범례 + 단계 버튼 */}
          <div style={{
            position: 'absolute', top: 12, right: 12, zIndex: 10,
            background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            padding: '10px 14px', color: '#333',
          }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
              {[
                { code: '001', label: '준회원' }, { code: '002', label: '정회원' },
                { code: '003', label: '디렉터1' }, { code: '007', label: '디렉터2' },
                { code: '004', label: '멤버' },
              ].map(({ code, label }) => {
                const c = LEVEL_COLORS[code] ?? DEFAULT_COLOR
                return (
                  <div key={code} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 16, height: 16, background: c.headerBg, borderRadius: 3 }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#333' }}>{label}</span>
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, borderTop: '1px solid #e0e0e0', paddingTop: 8 }}>
              <span style={{ fontWeight: 700, color: '#333', fontSize: 12 }}>단계:</span>
              {DEPTH_OPTIONS.map(d => (
                <button key={d} onClick={() => handleDepthChange(d)} disabled={loading} style={{
                  minWidth: 42, height: 30,
                  border: depth === d ? '2px solid #1976d2' : '1px solid #bdbdbd',
                  borderRadius: 6, background: depth === d ? '#1976d2' : '#fff',
                  color: depth === d ? '#fff' : '#333',
                  cursor: loading ? 'wait' : 'pointer', fontWeight: 700, fontSize: 13,
                  opacity: loading ? 0.6 : 1,
                }}>{d === 50 ? '전체' : `${d}단`}</button>
              ))}
            </div>
          </div>

          <Tree
            key={dataKey} data={treeData} dataKey={dataKey}
            orientation="vertical" pathFunc="step" initialDepth={depth}
            collapsible separation={{ siblings: 1.2, nonSiblings: 1.6 }}
            nodeSize={{ x: NODE_W + 30, y: NODE_H + 40 }}
            zoom={zoom} zoomable draggable translate={translate}
            renderCustomNodeElement={renderNode}
            pathClassFunc={() => 'club2000-path'}
            enableLegacyTransitions={false} hasInteractiveNodes
            scaleExtent={{ min: 0.1, max: 2 }}
            onUpdate={({ zoom: z, translate: t }) => {
              // fix: zoom + translate 모두 state 반영 — 드래그/줌 위치 유지
              const rounded = Math.round(z * 100) / 100
              setZoom(prev => Math.round(prev * 100) / 100 === rounded ? prev : rounded)
              if (t) setTranslate(prev => prev.x === t.x && prev.y === t.y ? prev : t)
            }}
          />
          <style>{`
            .club2000-path { stroke: #90a4ae !important; stroke-width: 1.5px !important; fill: none !important; }
            .rd3t-leaf-node circle, .rd3t-node circle { display: none !important; }
          `}</style>
        </div>
      )}

      {/* 안내 */}
      {!loading && !error && root && totalCount === 0 && (
        <div className="py-12 text-center">
          <div className="mb-3 text-5xl">🌱</div>
          <div className="text-lg text-neutral-500">아직 하선 회원이 없어요.</div>
        </div>
      )}
    </>
  )
}

export default function TreePage() {
  return (
    <L3Guard embedded title="내 조직도" lockBenefits={['조직도 조회', '하선 단계별 통계', '하선 활동 기록']}>
      <TreeContent />
    </L3Guard>
  )
}
