'use client'

// 디자인 원본 .hero — PC 370px / 모바일 380px, 전환 450ms, 자동 5초 (작업지시 v1 §5)
// 데이터: GET /public/hero-banners (v_active_hero_banners)

import type { HeroBanner } from '@/lib/api/designPublic'
import Image from 'next/image'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import './kn541-main.css'

const INTERVAL_MS = 5000

function HeroDivider() {
  return (
    <span className="hero-divider-line inline-flex items-center px-0.5" aria-hidden>
      <svg width="1" height="8" viewBox="0 0 1 8" fill="none">
        <line x1="0.5" y1="0" x2="0.5" y2="8" stroke="#DDDDDD" />
      </svg>
    </span>
  )
}

type HeroSliderProps = {
  slides: HeroBanner[]
}

export function HeroSlider({ slides }: HeroSliderProps) {
  const SLIDE_COUNT = slides.length
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

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
        <p className="hero-controls-text tabular-nums">
          <span className="hero-current">{String(index + 1).padStart(2, '0')}</span>
          <HeroDivider />
          <strong className="font-inherit">{String(SLIDE_COUNT).padStart(2, '0')}</strong>
        </p>
      </div>
    </section>
  )
}
