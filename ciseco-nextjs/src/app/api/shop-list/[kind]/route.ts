// Shop 5 페이지 공개 목록 프록시
// 클라이언트 → Next.js API Route (same-origin) → Railway API (server-to-server)
// CORS 우회 목적

import { NextRequest, NextResponse } from 'next/server'

const UPSTREAM = process.env.NEXT_PUBLIC_API_URL || ''
const VALID_KINDS = new Set(['best', 'new', 'recommend', 'preorder', 'value-up'])

export async function GET(
  req: NextRequest,
  { params }: { params: { kind: string } },
) {
  const { kind } = params

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

  try {
    const res = await fetch(url, { cache: 'no-store' })
    const json = await res.json()
    return NextResponse.json(json, { status: res.status })
  } catch (err) {
    console.error(`[shop-list proxy] ${kind} upstream error:`, err)
    return NextResponse.json({ error: 'upstream error' }, { status: 502 })
  }
}
