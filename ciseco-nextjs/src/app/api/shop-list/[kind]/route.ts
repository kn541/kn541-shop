// Shop 5 페이지 공개 목록 프록시
// 클라이언트 → Next.js API Route (same-origin) → Railway API (server-to-server)
// CORS 우회 목적

import { NextRequest, NextResponse } from 'next/server'

const UPSTREAM = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '')
const VALID_KINDS = new Set(['best', 'new', 'recommend', 'preorder', 'value-up'])

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ kind: string }> },
) {
  const { kind } = await params

  if (!VALID_KINDS.has(kind)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  if (!UPSTREAM) {
    return NextResponse.json(
      { status: 'success', data: { items: [], total: 0, page: 1, size: 20 } },
      { status: 200 },
    )
  }

  const q = req.nextUrl.searchParams.toString()
  const url = `${UPSTREAM}/public/products/${kind}${q ? `?${q}` : ''}`

  let res: Response
  try {
    res = await fetch(url, { cache: 'no-store' })
  } catch (err) {
    console.error(`[shop-list] fetch 실패 ${kind}:`, err)
    return NextResponse.json({ error: 'upstream unreachable' }, { status: 502 })
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    console.error(`[shop-list] Railway ${res.status} ${kind}:`, text.slice(0, 300))
    return NextResponse.json({ error: `upstream ${res.status}` }, { status: res.status })
  }

  try {
    const json = await res.json()
    return NextResponse.json(json, { status: 200 })
  } catch (err) {
    console.error(`[shop-list] JSON 파싱 실패 ${kind}:`, err)
    return NextResponse.json({ error: 'invalid json from upstream' }, { status: 502 })
  }
}
