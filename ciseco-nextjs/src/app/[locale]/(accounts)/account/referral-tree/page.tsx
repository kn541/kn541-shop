'use client'

import React, { useEffect, useState } from 'react'

interface TreeMember {
  user_id: string
  member_no: string | null
  username: string | null
  name: string | null
  user_type: string | null
  depth: number
  parent_user_id: string
  joined_at: string | null
}

interface TreeData {
  items: TreeMember[]
  by_depth: Record<string, TreeMember[]>
  total: number
  direct_count: number
}

const USER_TYPE_LABEL: Record<string, string> = {
  '001': '관리자',
  '002': '일반회원',
  '003': '오프관리자',
  '004': '공급사',
  '005': '강사',
  '006': '유료회원',
}

function MemberCard({ member }: { member: TreeMember }) {
  const joinDate = member.joined_at
    ? new Date(member.joined_at).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    : '-'

  return (
    <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700 dark:bg-primary-900 dark:text-primary-300">
        {(member.name || member.username || '?').charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {member.name || member.username || '이름 없음'}
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          회원번호: {member.member_no || '-'} · 가입일: {joinDate}
        </p>
      </div>
      <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">
        {USER_TYPE_LABEL[member.user_type || ''] || member.user_type || '-'}
      </span>
    </div>
  )
}

export default function ReferralTreePage() {
  const [data, setData] = useState<TreeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeDepth, setActiveDepth] = useState<number>(1)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setError('로그인이 필요합니다.')
      setLoading(false)
      return
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/mypage/referral-tree?max_depth=3`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then(async res => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err?.detail || '데이터를 불러올 수 없습니다.')
        }
        return res.json()
      })
      .then(json => {
        setData(json.data)
        setLoading(false)
      })
      .catch(e => {
        setError(e.message || '오류가 발생했습니다.')
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-6 text-center dark:bg-red-900/20">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        <button
          type="button"
          className="mt-3 text-xs text-red-500 underline"
          onClick={() => window.location.reload()}
        >
          다시 시도
        </button>
      </div>
    )
  }

  const totalCount = data?.total ?? 0
  const directCount = data?.direct_count ?? 0
  const byDepth = data?.by_depth ?? {}
  const depthKeys = Object.keys(byDepth)
    .map(Number)
    .sort((a, b) => a - b)
  const currentMembers = byDepth[String(activeDepth)] ?? []

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-primary-50 p-4 text-center dark:bg-primary-900/30">
          <p className="text-2xl font-bold text-primary-700 dark:text-primary-300">{totalCount}</p>
          <p className="mt-1 text-xs text-neutral-500">전체 하위 회원</p>
        </div>
        <div className="rounded-xl bg-green-50 p-4 text-center dark:bg-green-900/30">
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">{directCount}</p>
          <p className="mt-1 text-xs text-neutral-500">직접 추천 (1단)</p>
        </div>
        <div className="rounded-xl bg-neutral-100 p-4 text-center dark:bg-neutral-800">
          <p className="text-2xl font-bold text-neutral-700 dark:text-neutral-300">{depthKeys.length}</p>
          <p className="mt-1 text-xs text-neutral-500">활성 단계</p>
        </div>
      </div>

      {depthKeys.length > 0 ? (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {depthKeys.map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setActiveDepth(d)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeDepth === d
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
                }`}
              >
                {d}단 ({byDepth[String(d)]?.length ?? 0}명)
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {currentMembers.length > 0 ? (
              currentMembers.map(m => <MemberCard key={m.user_id} member={m} />)
            ) : (
              <p className="py-8 text-center text-sm text-neutral-400">해당 단계 회원이 없습니다.</p>
            )}
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-neutral-300 py-16 text-center dark:border-neutral-700">
          <p className="text-neutral-400">추천한 회원이 없습니다.</p>
          <p className="mt-1 text-sm text-neutral-400">추천인 코드를 공유하여 회원을 초대해보세요.</p>
        </div>
      )}
    </div>
  )
}
