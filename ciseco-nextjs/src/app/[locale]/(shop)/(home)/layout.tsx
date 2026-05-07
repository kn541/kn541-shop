// KN541 쇼핑몰 메인(홈) 레이아웃
// 헤더 통일: 기본 ApplicationLayout(<Header />) 사용
// 이전: MainHeader + categoryTabs 별도 주입 → 메뉴/로고/우측액션이 Header.tsx와 달랐음
// MainHeader.tsx, home-tabs.ts 는 보존(롤백 대비)

import { ApplicationLayout } from '../application-layout'

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ApplicationLayout>{children}</ApplicationLayout>
}
