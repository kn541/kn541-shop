// KN541 프로모션 섹션 1 — 한국어화
import Logo from '@/components/Logo'
import rightLargeImgDark from '@/images/promo1-dark.png'
import rightImgDemo from '@/images/promo1.png'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import ButtonSecondary from '@/shared/Button/ButtonSecondary'
import NcImage from '@/shared/NcImage/NcImage'
import { FC } from 'react'

interface SectionPromo1Props {
  className?: string
}

const SectionPromo1: FC<SectionPromo1Props> = ({ className = '' }) => {
  return (
    <div className={`relative flex flex-col items-center lg:flex-row ${className}`}>
      <div className="relative mb-16 shrink-0 lg:mr-10 lg:mb-0 lg:w-2/5">
        <Logo className="w-28" />
        <h2 className="mt-6 text-3xl leading-[1.2]! font-semibold tracking-tight sm:mt-10 sm:text-4xl xl:text-5xl 2xl:text-6xl">
          KN541과 함께 <br /> 스마트하게 쇼핑하세요.
        </h2>
        <span className="mt-6 block text-neutral-500 dark:text-neutral-400">
          무료배송 혜택과 다양한 할인 혜택을 놓치지 마세요.
        </span>
        <div className="mt-6 flex flex-wrap gap-2 sm:mt-12 sm:gap-x-5">
          <ButtonPrimary href="/products">상품 둘러보기</ButtonPrimary>
          <ButtonSecondary href="/products" className="border border-neutral-100 dark:border-neutral-700">
            전체 상품 보기
          </ButtonSecondary>
        </div>
      </div>
      <div className="relative max-w-xl flex-1 lg:max-w-none">
        <NcImage
          alt="프로모션 이미지"
          containerClassName="block dark:hidden"
          src={rightImgDemo}
          sizes="(max-width: 768px) 100vw, 50vw"
          className=""
        />
        <NcImage
          alt="프로모션 이미지 (다크)"
          containerClassName="hidden dark:block"
          src={rightLargeImgDark}
          sizes="(max-width: 768px) 100vw, 50vw"
          className=""
        />
      </div>
    </div>
  )
}

export default SectionPromo1
