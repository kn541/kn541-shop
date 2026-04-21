'use client'

import { useState } from 'react'

/**
 * KoreanProductGallery
 * - 외부 도메인 이미지 지원을 위해 <img> 태그 사용 (next/image remotePatterns 우회)
 * - 데스크톱: 좌측 세로 썸네일 + 우측 메인 이미지
 * - 모바일: 메인 이미지 상단 + 하단 가로 썸네일 스크롤
 */
export default function KoreanProductGallery({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0)

  if (!images.length) return null

  return (
    <>
      {/* ── 데스크톱 ── */}
      <div className="hidden sm:flex gap-3">
        {/* 썸네일 세로 목록 */}
        <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: '600px' }}>
          {images.map((src, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                idx === current ? 'border-neutral-900' : 'border-transparent hover:border-neutral-300'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`썸네일 ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        {/* 메인 이미지 */}
        <div className="relative flex-1 overflow-hidden rounded-2xl bg-neutral-100 flex items-center justify-center" style={{ minHeight: '400px', maxHeight: '600px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[current]}
            alt="메인 이미지"
            className="w-full h-full object-contain"
            style={{ maxHeight: '600px' }}
          />
        </div>
      </div>

      {/* ── 모바일 ── */}
      <div className="flex flex-col gap-3 sm:hidden">
        <div className="relative w-full overflow-hidden rounded-2xl bg-neutral-100 flex items-center justify-center" style={{ minHeight: '300px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[current]} alt="메인 이미지" className="w-full object-contain" style={{ maxHeight: '400px' }} />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                idx === current ? 'border-neutral-900' : 'border-transparent hover:border-neutral-300'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`썸네일 ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
