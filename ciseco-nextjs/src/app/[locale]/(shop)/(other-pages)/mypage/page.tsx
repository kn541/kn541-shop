import { redirect } from 'next/navigation'

// /mypage 접속 시 /mypage/profile 로 redirect
export default function MypagePage() {
  redirect('/mypage/profile')
}
