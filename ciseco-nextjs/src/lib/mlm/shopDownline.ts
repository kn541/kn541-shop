/**
 * 쇼핑몰 마이페이지 추천(하선) 트리 — 어드민과 동일 GET /members/{id}/downline RPC 활용
 */
import { mypageFetch } from '@/lib/mypage/api'

const USER_TYPE_PAID = '006'
const USER_TYPE_MEMBER = '002'

type UserTypeDetail = { user_type?: string; type_name?: string }

export interface ShopMlmNode {
  user_id: string
  member_no: string
  name_masked: string
  user_type: string
  user_type_label: string
  joined_at: string
  depth: number
  downline_count: number
  children: ShopMlmNode[]
  /** 직계 하위 로드 완료 */
  loaded: boolean
}

export function labelForUserType(ut: string): string {
  if (ut === USER_TYPE_PAID) return '유료(창업)'
  if (ut === USER_TYPE_MEMBER) return '일반'
  return ut ? `코드 ${ut}` : '-'
}

/** 예: 홍길동 → 홍*동 */
export function maskKoreanName(name: string): string {
  const s = (name || '').trim()
  if (!s) return '(이름 없음)'
  if (s.length <= 1) return '*'
  if (s.length === 2) return `${s[0]}*`
  return `${s[0]}*${s.slice(-1)}`
}

export function mapRowToShopNode(raw: Record<string, unknown>, depth: number): ShopMlmNode {
  const details = (raw.user_type_details ?? []) as UserTypeDetail[]
  const ut = String(raw.user_type ?? '')
  const detail = details.find(d => d.user_type === ut) ?? (details.length > 0 ? details[0] : null)
  const nameVal =
    (typeof raw.name === 'string' && raw.name) ||
    (typeof raw.full_name === 'string' && raw.full_name) ||
    ''
  const joined = raw.created_at ?? raw.joined_at ?? raw.registered_at ?? ''
  const joinedStr = typeof joined === 'string' ? joined : joined != null ? String(joined) : ''
  return {
    user_id: String(raw.user_id ?? raw.id ?? ''),
    member_no: String(raw.member_no ?? ''),
    name_masked: maskKoreanName(nameVal),
    user_type: ut,
    user_type_label: String(raw.user_type_name ?? detail?.type_name ?? labelForUserType(ut)),
    joined_at: joinedStr,
    depth,
    downline_count: 0,
    children: [],
    loaded: false,
  }
}

export async function fetchDownlineRows(userId: string): Promise<Record<string, unknown>[]> {
  const data = await mypageFetch<{ items?: unknown[]; total?: number }>(
    `/members/${encodeURIComponent(userId)}/downline`
  )
  const items = data?.items
  if (!Array.isArray(items)) return []
  return items.filter((x): x is Record<string, unknown> => x != null && typeof x === 'object') as Record<
    string,
    unknown
  >[]
}

/** GET /mypage/referral-tree 응답 항목 */
export interface ReferralTreeItem {
  user_id: string
  member_no?: string | null
  username?: string | null
  name?: string | null
  user_type?: string | null
  depth: number
  parent_user_id?: string | null
  joined_at?: string | null
}

export interface ReferralTreeResponse {
  items?: ReferralTreeItem[]
  by_depth?: Record<string, ReferralTreeItem[]>
  total?: number
  max_depth?: number
  direct_count?: number
}

/** 마이페이지 전용 추천 트리 API — 단일 호출 */
export async function fetchReferralTree(maxDepth: number): Promise<ReferralTreeResponse> {
  const depth = Math.min(5, Math.max(1, Math.floor(maxDepth)))
  return mypageFetch<ReferralTreeResponse>(`/mypage/referral-tree?max_depth=${depth}`)
}

export function mapReferralItemToNode(raw: ReferralTreeItem | Record<string, unknown>): ShopMlmNode {
  const depth = Number(raw.depth ?? 1)
  const nameVal = String(raw.name ?? '')
  const ut = String(raw.user_type ?? '')
  const joined = raw.joined_at ?? ''
  return {
    user_id: String(raw.user_id ?? ''),
    member_no: String(raw.member_no ?? ''),
    name_masked: maskKoreanName(nameVal),
    user_type: ut,
    user_type_label: labelForUserType(ut),
    joined_at: typeof joined === 'string' ? joined : joined != null ? String(joined) : '',
    depth,
    downline_count: 0,
    children: [],
    loaded: true,
  }
}

/** parent_user_id 기반 flat → 트리 (재귀 fetch 없음) */
export function buildReferralTreeFromItems(
  me: Record<string, unknown>,
  items: Array<ReferralTreeItem | Record<string, unknown>>
): ShopMlmNode {
  const meId = String(me.user_id ?? me.id ?? '')
  const root = mapRowToShopNode(me, 0)
  root.loaded = true

  const nodesById = new Map<string, ShopMlmNode>()

  for (const raw of items) {
    const node = mapReferralItemToNode(raw)
    if (!node.user_id) continue
    nodesById.set(node.user_id, node)
  }

  for (const raw of items) {
    const node = nodesById.get(String(raw.user_id ?? ''))
    if (!node) continue
    const parentId = String(raw.parent_user_id ?? '')
    if (parentId === meId) {
      root.children.push(node)
    } else {
      const parent = nodesById.get(parentId)
      if (parent) parent.children.push(node)
      else root.children.push(node)
    }
  }

  const sortChildren = (n: ShopMlmNode) => {
    n.children.sort((a, b) => a.member_no.localeCompare(b.member_no))
    n.downline_count = n.children.length
    for (const c of n.children) sortChildren(c)
  }
  sortChildren(root)

  return root
}

/** 마이페이지 조직도 — GET /mypage/referral-tree 단일 호출 */
export async function buildShopReferralTree(
  me: Record<string, unknown>,
  maxDepth: number
): Promise<{ root: ShopMlmNode; total: number; directCount: number }> {
  const data = await fetchReferralTree(maxDepth)
  const items = Array.isArray(data.items) ? data.items : []
  const root = buildReferralTreeFromItems(me, items)
  return {
    root,
    total: data.total ?? items.length,
    directCount: data.direct_count ?? root.children.length,
  }
}

/** 어드민 MLM과 동일: 각 노드의 직접 하선만 조회해 단계별로 트리 구성 */
export async function buildShopDownlineTree(
  me: Record<string, unknown>,
  opts: { maxDepth: number; maxNodes: number }
): Promise<{ root: ShopMlmNode; truncated: boolean; loadedNodes: number }> {
  const root = mapRowToShopNode(me, 0)
  root.loaded = true
  let loadedNodes = 1
  let truncated = false

  let frontier: ShopMlmNode[] = [root]
  for (let wave = 0; wave < opts.maxDepth; wave++) {
    const next: ShopMlmNode[] = []
    for (const node of frontier) {
      if (!node.user_id) continue
      const rows = await fetchDownlineRows(node.user_id)
      node.children = rows.map(r => mapRowToShopNode(r, node.depth + 1))
      node.downline_count = node.children.length
      node.loaded = true
      for (const ch of node.children) {
        loadedNodes += 1
        if (loadedNodes >= opts.maxNodes) {
          truncated = true
          return { root, truncated, loadedNodes }
        }
        next.push(ch)
      }
    }
    frontier = next
    if (frontier.length === 0) break
  }

  return { root, truncated, loadedNodes }
}

export function flattenDownline(root: ShopMlmNode): ShopMlmNode[] {
  const out: ShopMlmNode[] = []
  function walk(n: ShopMlmNode) {
    for (const c of n.children) {
      out.push(c)
      walk(c)
    }
  }
  walk(root)
  return out
}

export function statsFromFlat(members: ShopMlmNode[]): {
  total_count: number
  max_depth: number
  by_depth: Record<number, number>
} {
  const by_depth: Record<number, number> = {}
  let max_depth = 0
  for (const m of members) {
    by_depth[m.depth] = (by_depth[m.depth] ?? 0) + 1
    if (m.depth > max_depth) max_depth = m.depth
  }
  return { total_count: members.length, max_depth, by_depth }
}

export function formatJoined(iso: string): string {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10)
  return d.toLocaleDateString('ko-KR')
}
