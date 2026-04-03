'use client'

import Image from 'next/image'
import { useState } from 'react'

/**
 * KoreanProductGallery
 * 10x10 스타일: 좌측 세로 썸네일 + 우측 메인 이미지 큰 화면
 * 모바일: 메인 이미지 상단 + 하단 가로 썸네일 스크롤
 */
export default function KoreanProductGallery({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0)

  if (!images.length) return null

  return (
    <>
      {/* ── 데스크톱: 좌측 썸네일 + 우측 메인 ── */}
      <div className="hidden sm:flex gap-3">

        {/* 썸네일 세로 목록 */}
        <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: '600px' }}>
          {images.map((src, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                idx === current
                  ? 'border-neutral-900'
                  : 'border-transparent hover:border-neutral-300'
              }`}
            >
              <Image
                src={src}
                alt={`썸네일 ${idx + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>

        {/* 메인 이미지 */}
        <div className="relative flex-1 overflow-hidden rounded-2xl bg-neutral-100" style={{ aspectRatio: '1/1' }}>
          <Image
            src={images[current]}
            alt="메인 이미지"
            fill
            sizes="(max-width: 1200px) 50vw, 600px"
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* ── 모바일: 메인 + 하단 가로 썸네일 ── */}
      <div className="flex flex-col gap-3 sm:hidden">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-neutral-100">
          <Image
            src={images[current]}
            alt="메인 이미지"
            fill
            sizes="100vw"
            className="object-contain"
            priority
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                idx === current
                  ? 'border-neutral-900'
                  : 'border-transparent hover:border-neutral-300'
              }`}
            >
              <Image
                src={src}
                alt={`썸네일 ${idx + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
