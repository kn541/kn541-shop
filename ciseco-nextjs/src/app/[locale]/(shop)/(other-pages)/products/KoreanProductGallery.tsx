'use client'

import { useState } from 'react'

/**
 * KoreanProductGallery
 * - 이미지 1장  → 사이드바 없이 전체폭 단독 표시
 * - 이미지 2장+ → 좌측 세로 썸네일 사이드바 + 우측 메인 이미지 (클릭 전환)
 * - 모바일      → 메인 이미지 상단 + 하단 가로 스크롤 썸네일
 * - 외부 도메인(dbimg.co.kr 등) 지원: next/image 대신 <img> 사용
 */
export default function KoreanProductGallery({ images }: { images: string[] }) {
  // ★ Hook은 항상 최상단에서 호출 (조건부 return 이전)
  const [current, setCurrent] = useState(0)

  if (!images.length) return null

  // ── 이미지 1장: 전체폭 단독 표시 ─────────────────────────────────
  if (images.length === 1) {
    return (
      <div
        className="w-full overflow-hidden rounded-2xl bg-neutral-100 flex items-center justify-center"
        style={{ minHeight: '300px', maxHeight: '600px' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[0]}
          alt="상품 이미지"
          className="w-full object-contain"
          style={{ maxHeight: '600px', display: 'block' }}
        />
      </div>
    )
  }

  // ── 이미지 2장+: 썸네일 사이드바 + 메인 이미지 ───────────────────
  return (
    <>
      {/* 데스크톱 */}
      <div className="hidden sm:flex gap-3">
        {/* 좌측: 썸네일 세로 목록 */}
        <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: '600px' }}>
          {images.map((src, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrent(idx)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                idx === current
                  ? 'border-neutral-900 dark:border-neutral-100'
                  : 'border-transparent hover:border-neutral-300 dark:hover:border-neutral-600'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`썸네일 ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>

        {/* 우측: 선택된 메인 이미지 */}
        <div
          className="relative flex-1 overflow-hidden rounded-2xl bg-neutral-100 flex items-center justify-center"
          style={{ minHeight: '400px', maxHeight: '600px' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={current}
            src={images[current]}
            alt={`상품 이미지 ${current + 1}`}
            className="w-full h-full object-contain"
            style={{ maxHeight: '600px' }}
          />
        </div>
      </div>

      {/* 모바일 */}
      <div className="flex flex-col gap-3 sm:hidden">
        {/* 메인 이미지 */}
        <div
          className="relative w-full overflow-hidden rounded-2xl bg-neutral-100 flex items-center justify-center"
          style={{ minHeight: '300px' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={current}
            src={images[current]}
            alt={`상품 이미지 ${current + 1}`}
            className="w-full object-contain"
            style={{ maxHeight: '400px' }}
          />
        </div>

        {/* 하단 가로 스크롤 썸네일 */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrent(idx)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                idx === current
                  ? 'border-neutral-900 dark:border-neutral-100'
                  : 'border-transparent hover:border-neutral-300 dark:hover:border-neutral-600'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`썸네일 ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
