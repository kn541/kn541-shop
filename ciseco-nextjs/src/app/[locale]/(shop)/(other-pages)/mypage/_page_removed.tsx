<<<<<<< HEAD
import { redirect } from 'next/navigation'

// /mypage 접속 시 /mypage/profile 로 redirect
export default function MypagePage() {
  redirect('/mypage/profile')
}
=======
// 이 파일은 (mypage) 라우트 그룹으로 이동됨
// 충돌 방지를 위해 page.tsx → _page_removed.tsx 로 이름 변경
// Phase 3+ 마이페이지는 src/app/[locale]/(mypage)/mypage/ 에 있음
export {}
>>>>>>> 40dcdd48e8553faffe82a8c352ba709fff1db211
