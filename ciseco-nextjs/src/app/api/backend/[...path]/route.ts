// Railway API 범용 프록시 — 클라이언트 CORS 우회 (kn541.com 등 신규 도메인)
// 클라이언트 → /api/backend/* (same-origin) → Railway API (server-to-server)

import { NextRequest, NextResponse } from 'next/server'
import { getUpstreamBase } from '@/lib/api/base'

const UPSTREAM = getUpstreamBase()

const FORWARD_HEADERS = ['authorization', 'content-type', 'accept'] as const

async function proxyRequest(req: NextRequest, pathSegments: string[]) {
  const path = pathSegments.map(encodeURIComponent).join('/')
  const q = req.nextUrl.searchParams.toString()
  const url = `${UPSTREAM}/${path}${q ? `?${q}` : ''}`

  const headers: Record<string, string> = {}
  for (const name of FORWARD_HEADERS) {
    const value = req.headers.get(name)
    if (value) headers[name] = value
  }

  const init: RequestInit = {
    method: req.method,
    headers,
    cache: 'no-store',
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = await req.text()
  }

  let res: Response
  try {
    res = await fetch(url, init)
  } catch (err) {
    console.error(`[api/backend] upstream fetch 실패 /${path}:`, err)
    return NextResponse.json({ error: 'upstream unreachable' }, { status: 502 })
  }

  const body = await res.text()
  const contentType = res.headers.get('content-type') || 'application/json'

  return new NextResponse(body, {
    status: res.status,
    headers: { 'Content-Type': contentType },
  })
}

type RouteCtx = { params: Promise<{ path: string[] }> }

async function handler(req: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params
  if (!path?.length) {
    return NextResponse.json({ error: 'path required' }, { status: 400 })
  }
  return proxyRequest(req, path)
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
