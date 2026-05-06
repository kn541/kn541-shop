'use client'

// 디자인 원본 .hero — PC 370px / 모바일 380px, 전환 450ms, 자동 5초 (작업지시 v1 §5)

import { MAIN_PAGE_ASSETS } from '@/data/main-page-assets'
import Image from 'next/image'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import './kn541-main.css'

const SLIDE_COUNT = MAIN_PAGE_ASSETS.heroes.pc.length
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

export function HeroSlider() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const t = setInterval(() => setIndex((i) => (i + 1) % SLIDE_COUNT), INTERVAL_MS)
    return () => clearInterval(t)
  }, [paused])

  return (
    <section className="hero relative h-[380px] overflow-hidden bg-kn541-gray-200 md:h-[370px]" aria-label="메인 배너">
      <div className="hero-viewport relative h-full w-full">
        {MAIN_PAGE_ASSETS.heroes.pc.map((pcSrc, i) => (
          <article
            key={pcSrc}
            className={clsx(
              'hero-slide absolute inset-0 transition-[opacity,visibility] duration-[450ms]',
              i === index ? 'visible opacity-100' : 'invisible opacity-0'
            )}
          >
            <picture className="block h-full w-full">
              <source media="(max-width: 767px)" srcSet={MAIN_PAGE_ASSETS.heroes.mobile[i]} />
              <Image
                src={pcSrc}
                alt=""
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
                'md:left-[max(calc((100vw-1280px)/2),20px)] md:top-[103px] md:ml-[90px] md:w-[430px]'
              )}
            >
              <h1 className="text-[26px] font-medium leading-[1.16] tracking-[-0.52px] text-kn541-black md:text-[34px] md:leading-normal md:tracking-[-0.68px]">
                Main Banner Title
                <br />
                Main Banner Title
              </h1>
              <p className="mt-6 text-[14px] font-normal tracking-[-0.28px] text-kn541-black md:mt-[31px] md:text-[18px] md:tracking-[-0.36px]">
                Sub Title Sub Title Sub Title Sub Title Sub Title
              </p>
            </div>
          </article>
        ))}
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
