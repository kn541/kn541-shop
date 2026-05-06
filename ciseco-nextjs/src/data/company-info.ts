// KN541 회사 정보 — 푸터 표시용 상수
// TODO: 향후 변경 가능성 있으면 system_codes(전역변수) API로 이전
export const COMPANY_INFO = {
  bizName: '케이엔541샵',
  corpName: '주식회사 케이엔541',
  ceo: '김진순',
  address: '서울특별시 구로구 디지털로30길 28 (마리오타워) 506호',
  bizNo: '756-87-02795',
  bizCheckUrl: 'https://www.ftc.go.kr/bizCommPop.do?wrkr_no=7568702795',
  mailOrderNo: '제 2024-서울강남-05319호',
  fax: '02-3436-0542',
  email: 'kn541club@naver.com',
  privacyOfficer: '최문수',
  cs: {
    phone: '070-4436-0928',
    /** placeholder — 실제 카카오 채널 URL 연결 시 교체 */
    kakaoUrl: '#' as const,
  },
} as const
