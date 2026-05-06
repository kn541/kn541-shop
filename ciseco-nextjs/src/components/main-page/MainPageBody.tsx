import { BestProducts } from '@/components/main-page/BestProducts'
import { FigmaCards } from '@/components/main-page/FigmaCards'
import { GiftBanner } from '@/components/main-page/GiftBanner'
import { HeroSlider } from '@/components/main-page/HeroSlider'
import { NewProductsSection } from '@/components/main-page/NewProductsSection'
import { RecommendedProducts } from '@/components/main-page/RecommendedProducts'
import { ReserveSection } from '@/components/main-page/ReserveSection'
import { ValuePanel } from '@/components/main-page/ValuePanel'
import { WelcomeBanner } from '@/components/main-page/WelcomeBanner'

/** Phase 4 메인 바디 — 히어로·타일·배너·구획 순서는 퍼블 디자인(index) 기준 */
export default async function MainPageBody() {
  return (
    <main className="kn-main-page pb-16">
      <HeroSlider />
      <WelcomeBanner />
      <FigmaCards />
      <ReserveSection />
      <BestProducts />
      <GiftBanner />
      <NewProductsSection />
      <ValuePanel />
      <RecommendedProducts />
    </main>
  )
}
