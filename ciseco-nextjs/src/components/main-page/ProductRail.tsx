'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * 메인 가로 상품 레일 + 좌우 화살표 캐러셀.
 * 서버 컴포넌트(사전예약/신상품/할인)에서 카드 JSX를 children으로 받아 감싼다.
 * 데이터 페칭은 각 섹션 서버 컴포넌트가 담당하며, 여기서는 스크롤 제어만 한다.
 *
 * 동작:
 *  - 한 번 누르면 보이는 너비의 약 90%만큼 부드럽게 이동
 *  - 왼쪽 끝이면 이전 화살표 숨김, 오른쪽 끝이면 다음 화살표 숨김
 *  - 넘길 내용이 없으면(스크롤 불필요) 화살표 둘 다 숨김
 *  - 마우스 휠/트랙패드/터치 스크롤은 기존대로 동작
 */
export function ProductRail({ children }: { children: React.ReactNode }) {
  const railRef = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const updateArrows = useCallback(() => {
    const el = railRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setCanPrev(el.scrollLeft > 4)
    setCanNext(el.scrollLeft < max - 4)
  }, [])

  useEffect(() => {
    const el = railRef.current
    if (!el) return
    updateArrows()
    el.addEventListener('scroll', updateArrows, { passive: true })
    window.addEventListener('resize', updateArrows)
    return () => {
      el.removeEventListener('scroll', updateArrows)
      window.removeEventListener('resize', updateArrows)
    }
  }, [updateArrows])

  const scrollByDir = (dir: 1 | -1) => {
    const el = railRef.current
    if (!el) return
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.9), behavior: 'smooth' })
  }

  return (
    <div className="slider-shell relative">
      {canPrev && (
        <button
          type="button"
          aria-label="이전 상품"
          onClick={() => scrollByDir(-1)}
          className="absolute left-0 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-md transition hover:bg-neutral-50 md:flex"
        >
          <svg width="9" height="15" viewBox="0 0 6 10" fill="none" aria-hidden className="rotate-180">
            <path
              d="M0.168095 9.84353C0.0694818 9.74321 0.0140914 9.60722 0.0140914 9.46543C0.0140914 9.32365 0.0694817 9.18766 0.168095 9.08734L4.18422 5.00678L0.168093 0.926215C0.0987771 0.860817 0.048104 0.777634 0.0214135 0.68543C-0.00527695 0.593226 -0.00699691 0.495414 0.0164353 0.4023C0.0398671 0.309186 0.0875827 0.224218 0.154556 0.156347C0.221529 0.0884747 0.305279 0.040214 0.396984 0.0166478C0.488527 -0.00711398 0.584676 -0.00541072 0.67535 0.0215744C0.766024 0.0485606 0.847881 0.0998358 0.912339 0.170025L5.30059 4.62868C5.3992 4.729 5.45459 4.86499 5.45459 5.00678C5.45459 5.14856 5.3992 5.28455 5.30059 5.38487L0.912341 9.84353C0.813605 9.94372 0.679764 10 0.540217 10C0.400671 10 0.26683 9.94372 0.168095 9.84353Z"
              fill="#05C368"
            />
          </svg>
        </button>
      )}

      <div
        ref={railRef}
        className="product-rail flex w-full gap-[53px] overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        data-rail
      >
        {children}
      </div>

      {canNext && (
        <button
          type="button"
          aria-label="다음 상품"
          onClick={() => scrollByDir(1)}
          className="absolute right-0 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-md transition hover:bg-neutral-50 md:flex"
        >
          <svg width="9" height="15" viewBox="0 0 6 10" fill="none" aria-hidden>
            <path
              d="M0.168095 9.84353C0.0694818 9.74321 0.0140914 9.60722 0.0140914 9.46543C0.0140914 9.32365 0.0694817 9.18766 0.168095 9.08734L4.18422 5.00678L0.168093 0.926215C0.0987771 0.860817 0.048104 0.777634 0.0214135 0.68543C-0.00527695 0.593226 -0.00699691 0.495414 0.0164353 0.4023C0.0398671 0.309186 0.0875827 0.224218 0.154556 0.156347C0.221529 0.0884747 0.305279 0.040214 0.396984 0.0166478C0.488527 -0.00711398 0.584676 -0.00541072 0.67535 0.0215744C0.766024 0.0485606 0.847881 0.0998358 0.912339 0.170025L5.30059 4.62868C5.3992 4.729 5.45459 4.86499 5.45459 5.00678C5.45459 5.14856 5.3992 5.28455 5.30059 5.38487L0.912341 9.84353C0.813605 9.94372 0.679764 10 0.540217 10C0.400671 10 0.26683 9.94372 0.168095 9.84353Z"
              fill="#05C368"
            />
          </svg>
        </button>
      )}
    </div>
  )
}
