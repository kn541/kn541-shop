'use client'

// 디자인 원본 .hero — PC 370px / 모바일 380px, 전환 450ms, 자동 5초 (작업지시 v1 §5)
// 데이터: GET /public/hero-banners (v_active_hero_banners)
// 2026-05-15: 좌우 화살표 네비게이션 추가 (#27)
// 2026-06-10: 슬라이드 카운터(현재|전체) 정렬 수정 — 숫자가 붙어 "0212"로 읽히던 문제

import type { HeroBanner } from '@/lib/api/designPublic'
import Image from 'next/image'
import clsx from 'clsx'
import { useCallback, useEffect, useState } from 'react'
import './kn541-main.css'

const INTERVAL_MS = 5000

function HeroDivider() {
  return (
    <span className="hero-divider-line inline-flex items-center px-2" aria-hidden>
      <svg width="1" height="11" viewBox="0 0 1 11" fill="none">
        <line x1="0.5" y1="0" x2="0.5" y2="11" stroke="#BBBBBB" />
      </svg>
    </span>
  )
}

/* ← 화살표 SVG */
function ChevronLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 15L7.5 10L12.5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* → 화살표 SVG */
function ChevronRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.5 15L12.5 10L7.5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

type HeroSliderProps = {
  slides: HeroBanner[]
}

export function HeroSlider({ slides }: HeroSliderProps) {
  const SLIDE_COUNT = slides.length
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const goPrev = useCallback(() => {
    setIndex((i) => (i - 1 + SLIDE_COUNT) % SLIDE_COUNT)
  }, [SLIDE_COUNT])

  const goNext = useCallback(() => {
    setIndex((i) => (i + 1) % SLIDE_COUNT)
  }, [SLIDE_COUNT])

  useEffect(() => {
    if (paused || SLIDE_COUNT <= 1) return
    const t = setInterval(() => setIndex((i) => (i + 1) % SLIDE_COUNT), INTERVAL_MS)
    return () => clearInterval(t)
  }, [paused, SLIDE_COUNT])

  return (
    <section className="hero relative h-[380px] overflow-hidden bg-kn541-gray-200 md:h-[370px]" aria-label="메인 배너">
      <div className="hero-viewport relative h-full w-full">
        {slides.map((slide, i) => {
          const mobileSrc = slide.mobile_image_url?.trim() || slide.image_url
          const pcSrc = slide.image_url
          const displaySubtitle = (slide.subtitle || '').trim()
          const target = slide.link_target === '_blank' ? '_blank' : '_self'
          const hasLink = Boolean(slide.link_url?.trim())

          return (
            <article
              key={slide.id}
              className={clsx(
                'hero-slide absolute inset-0 transition-[opacity,visibility] duration-[450ms]',
                i === index ? 'visible opacity-100' : 'invisible opacity-0'
              )}
            >
              {hasLink ? (
                <a
                  href={slide.link_url!}
                  target={target}
                  rel={target === '_blank' ? 'noopener noreferrer' : undefined}
                  className="absolute inset-0 z-[1]"
                  aria-label={slide.alt_text || slide.title}
                >
                  <span className="sr-only">{slide.title}</span>
                </a>
              ) : null}
              <picture className={clsx('block h-full w-full', hasLink && 'pointer-events-none relative z-0')}>
                {slide.mobile_image_url?.trim() ? (
                  <source media="(max-width: 767px)" srcSet={mobileSrc} />
                ) : null}
                <Image
                  src={pcSrc}
                  alt={slide.alt_text || slide.title || ''}
                  fill
                  className="object-cover object-center"
                  sizes="100vw"
                  priority={i === 0}
                />
              </picture>
              <div
                className={clsx(
                  'hero-copy absolute',
                  'left-[29px] top-[30px] w-[290px]',
                  'md:left-[max(calc((100vw-1280px)/2),20px)] md:top-[103px] md:ml-[90px] md:w-[430px]',
                  hasLink && 'pointer-events-none z-[2]'
                )}
              >
                <h1 className="whitespace-pre-line text-[26px] font-medium leading-[1.16] tracking-[-0.52px] text-kn541-black md:text-[34px] md:leading-normal md:tracking-[-0.68px]">
                  {slide.title.trim() || '\u00A0'}
                </h1>
                {displaySubtitle ? (
                  <p className="mt-6 text-[14px] font-normal tracking-[-0.28px] text-kn541-black md:mt-[31px] md:text-[18px] md:tracking-[-0.36px]">
                    {displaySubtitle}
                  </p>
                ) : null}
              </div>
            </article>
          )
        })}
      </div>

      {/* ← → 좌우 화살표 네비게이션 (#27) */}
      {SLIDE_COUNT > 1 && (
        <>
          <button
            type="button"
            className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 transition-colors hover:bg-black/50 md:left-5 md:h-12 md:w-12"
            aria-label="이전 배너"
            onClick={goPrev}
          >
            <ChevronLeft />
          </button>
          <button
            type="button"
            className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 transition-colors hover:bg-black/50 md:right-5 md:h-12 md:w-12"
            aria-label="다음 배너"
            onClick={goNext}
          >
            <ChevronRight />
          </button>
        </>
      )}

      <div
        className={clsx(
          'absolute bottom-[21px] z-10 flex items-center gap-1.5',
          'right-[20px] md:right-[max(calc((100vw-1280px)/2),20px)]'
        )}
      >
        <button
          type="button"
          className="hero-pause"
          aria-label={paused ? '배너 재생' : '배너 일시정지'}
          aria-pressed={paused}
          onClick={() => setPaused((p) => !p)}
        />
        <p className="hero-controls-text tabular-nums inline-flex items-center leading-none">
          <span className="hero-current">{String(index + 1).padStart(2, '0')}</span>
          <HeroDivider />
          <strong className="font-inherit">{String(SLIDE_COUNT).padStart(2, '0')}</strong>
        </p>
      </div>
    </section>
  )
}
