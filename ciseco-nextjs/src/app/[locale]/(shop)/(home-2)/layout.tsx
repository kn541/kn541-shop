// KN541 쇼핑몰 홈 변형 (home-2) 레이아웃
// 헤더 통일: 기본 ApplicationLayout(<Header />) 사용
// 이전: Header2 별도 주입 → 다른 디자인으로 이탈
// Header2.tsx 는 보존(롤백 대비)

import { ApplicationLayout } from '../application-layout'

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ApplicationLayout>{children}</ApplicationLayout>
}
