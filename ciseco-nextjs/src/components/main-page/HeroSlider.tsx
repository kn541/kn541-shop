'use client'

import { MAIN_PAGE_ASSETS } from '@/data/main-page-assets'
import Image from 'next/image'
import { useEffect, useState } from 'react'

const SLIDE_COUNT = MAIN_PAGE_ASSETS.heroes.pc.length
const ACCENT = '#05C368'

export function HeroSlider() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const t = setInterval(() => setIndex((i) => (i + 1) % SLIDE_COUNT), 5000)
    return () => clearInterval(t)
  }, [paused])

  return (
    <section className="relative w-full bg-neutral-50 dark:bg-neutral-950" aria-label="메인 배너">
      <div className="relative aspect-[360/432] w-full overflow-hidden sm:aspect-[1920/720]">
        {MAIN_PAGE_ASSETS.heroes.pc.map((pcSrc, i) => (
          <div
            key={pcSrc}
            className={`absolute inset-0 transition-opacity duration-500 ${
              i === index ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <picture className="block h-full w-full">
              <source media="(max-width: 639px)" srcSet={MAIN_PAGE_ASSETS.heroes.mobile[i]} />
              <Image
                src={pcSrc}
                alt=""
                fill
                className="object-cover"
                sizes="100vw"
                priority={i === 0}
              />
            </picture>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 to-transparent sm:from-black/30" />
            <div className="absolute bottom-16 left-4 right-4 text-white sm:bottom-24 sm:left-10 sm:right-auto sm:max-w-xl">
              <p className="text-xs font-medium uppercase tracking-wider text-white/90 sm:text-sm">KN541 SHOP</p>
              <h1 className="mt-2 text-2xl font-bold leading-tight sm:text-4xl">
                Main Banner Title
                <br />
                Main Banner Title
              </h1>
              <p className="mt-2 text-sm text-white/85 sm:text-base">
                Sub Title Sub Title Sub Title Sub Title Sub Title
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4 sm:bottom-6">
        <button
          type="button"
          aria-label={paused ? '배너 재생' : '배너 일시정지'}
          aria-pressed={paused}
          className="h-8 w-8 rounded-full border border-white/50 bg-black/25 text-white backdrop-blur-sm"
          style={{ borderColor: `${ACCENT}80` }}
          onClick={() => setPaused((p) => !p)}
        >
          {paused ? '▶' : '❚❚'}
        </button>
        <p className="flex items-center gap-2 text-sm font-medium tabular-nums text-white">
          <span>{String(index + 1).padStart(2, '0')}</span>
          <span className="text-white/50">/</span>
          <strong>{String(SLIDE_COUNT).padStart(2, '0')}</strong>
        </p>
      </div>
    </section>
  )
}
