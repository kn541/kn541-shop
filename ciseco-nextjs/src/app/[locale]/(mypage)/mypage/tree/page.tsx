'use client'
import { useState } from 'react'
import BackHeader from '@/components/mypage/BackHeader'
import L3Guard from '@/components/mypage/L3Guard'
import { MOCK_DOWNLINE } from '@/lib/mypage/mocks'
import type { DownlineMember } from '@/lib/mypage/types'

// 구루별 무지개 색상
const DEPTH_COLORS = ['#7C3AED', '#1D4ED8', '#C2410C', '#047857', '#B45309']

function MemberCard({ m }: { m: DownlineMember }) {
  const c = DEPTH_COLORS[(m.depth - 1) % DEPTH_COLORS.length]
  return (
    <div style={{
      background: '#fff', borderRadius: 'var(--mp-radius-lg)',
      border: `1px solid var(--mp-color-border)`,
      borderLeft: `4px solid ${c}`,
      padding: '12px 14px', marginBottom: 8,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: 16, fontWeight: 700 }}>👤 {m.username_masked}</span>
          <span style={{ fontSize: 13, color: 'var(--mp-color-text-muted)', marginLeft: 8 }}>({m.member_no_masked})</span>
        </div>
        <span style={{ fontSize: 12, background: `${c}22`, color: c, borderRadius: 20, padding: '3px 10px', fontWeight: 700 }}>
          {m.depth}단계
        </span>
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: 13, color: 'var(--mp-color-text-muted)' }}>
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
    <div style={{ paddingLeft: indent * 20, marginBottom: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15 }}>
        <span style={{ color: 'var(--mp-color-text-muted)' }}>
          {indent > 0 ? '└─' : '─'}
        </span>
        <span style={{ color: c, fontWeight: 600 }}>👤 {m.username_masked}</span>
        <span style={{ fontSize: 12, color: 'var(--mp-color-text-muted)' }}>({m.member_no_masked})</span>
      </div>
    </div>
  )
}

function TreeContent() {
  const [view, setView] = useState<'list' | 'tree'>('list')
  const data = MOCK_DOWNLINE

  const byDepth: Record<number, DownlineMember[]> = {}
  data.members.forEach(m => {
    byDepth[m.depth] = byDepth[m.depth] ?? []
    byDepth[m.depth].push(m)
  })
  const depths = Object.keys(byDepth).map(Number).sort((a, b) => a - b)

  return (
    <>
      <BackHeader
        title='내 조직도'
        rightAction={
          <div style={{ display: 'flex', gap: 4 }}>
            {(['list', 'tree'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: '6px 12px', fontSize: 13, fontWeight: view === v ? 700 : 400,
                border: '1px solid var(--mp-color-border)',
                borderRadius: 20, cursor: 'pointer',
                background: view === v ? 'var(--mp-color-primary)' : '#fff',
                color: view === v ? '#fff' : 'var(--mp-color-text)',
              }}>
                {v === 'list' ? '📋 리스트' : '🌳 트리'}
              </button>
            ))}
          </div>
        }
      />

      {/* 요약 */}
      <div style={{
        background: '#fff', padding: '14px 16px',
        borderBottom: '1px solid var(--mp-color-border)',
        fontSize: 14, color: 'var(--mp-color-text-muted)',
        display: 'flex', gap: 16,
      }}>
        <span>전체 하선 <strong style={{ color: 'var(--mp-color-text)' }}>{data.total_count}명</strong></span>
        <span>요대 깊이 <strong style={{ color: 'var(--mp-color-text)' }}>{data.max_depth}단계</strong></span>
        {depths.map(d => (
          <span key={d}>{d}단계: <strong style={{ color: 'var(--mp-color-text)' }}>{data.by_depth[d]}명</strong></span>
        ))}
      </div>

      {/* 개인정보 보호 안내 */}
      <div style={{
        margin: 16, padding: '10px 14px',
        background: '#FFF9E6', borderRadius: 8, fontSize: 13,
        color: '#92400E', border: '1px solid #FDE68A',
      }}>
        🔒 개인정보 보호를 위해 이름 마스킹 처리되어 표시되며, 연락정보 및 주소는 제공되지 않습니다.
      </div>

      <div style={{ padding: '0 16px 32px' }}>
        {data.total_count === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🌱</div>
            <div style={{ fontSize: 18, color: 'var(--mp-color-text-muted)' }}>아직 하선 회원이 없어요.</div>
          </div>
        ) : view === 'list' ? (
          /* 리스트뷰 */
          depths.map(d => (
            <div key={d}>
              <div style={{
                fontSize: 15, fontWeight: 700, color: DEPTH_COLORS[(d - 1) % DEPTH_COLORS.length],
                margin: '16px 0 8px', display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: DEPTH_COLORS[(d - 1) % DEPTH_COLORS.length],
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 13,
                }}>{d}</span>
                {d}단계 ({byDepth[d].length}명)
              </div>
              {byDepth[d].map(m => <MemberCard key={m.user_id} m={m} />)}
            </div>
          ))
        ) : (
          /* 트리뷰 */
          <div style={{
            background: '#fff', borderRadius: 'var(--mp-radius-lg)',
            border: '1px solid var(--mp-color-border)', padding: 16,
          }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: 'var(--mp-color-primary)' }}>
              나 (1단계 상선)
            </div>
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
    <L3Guard title='내 조직도' lockBenefits={['조직도 조회', '하선 단계별 통계', '하선 활동 기록']}>
      <TreeContent />
    </L3Guard>
  )
}
