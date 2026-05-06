# [Cursor 작업지시] 쇼핑몰 메인 교체 — Phase 2: 푸터 교체

작성일: 2026-05-06 | 기획 창 → 프론트엔드 창
대상 레포: `github.com/kn541/kn541-shop` (Public, 이 레포)
작업 폴더: `ciseco-nextjs/`
**의존성: Phase 1 완료 (Tailwind 토큰 + formatPrice 88,888원)**
환경: macOS

---

## 0. 배경

새 디자인의 푸터는 **회사 정보 중심** 구조로, 기존 푸터(4개 메뉴 그룹 + SNS + 입점문의)와 정보 구조가 다릅니다.

### 통합 방침 (확정)
새 디자인 베이스 + 기존 SNS 유지 + 기존 입점문의 유지 = **통합 푸터**

기존 자산을 버리지 않고 새 디자인에 흡수합니다.

---

## 1. 새 디자인 푸터 구조 (참조)

디자인 자료 위치 (Phase 1 보고에서 확인됨):
- `/Users/kn541/Desktop/kn541/디자인/외주/public/index.html` 740~820행
- `/Users/kn541/Desktop/kn541/디자인/외주/public/css/style.css` 의 `.site-footer`, `.footer-inner`, `.support`, `.company` 등

### PC 푸터 영역
- 상단 가로 메뉴 (`.footer-menu`): **이용약관 / 개인정보처리방침 / 이용안내 / 입점신청**
- 중앙 좌측 (`.support`): 고객센터 070-4436-0928 + 운영시간 + 푸터 로고
- 중앙 우측 (`.company`): 회사 정보 (상호/대표/주소/사업자번호/통신판매업/FAX/메일/개인정보관리자)

### Mobile 푸터 영역
- `.support-inquiry` 박스 2개: "카카오톡 문의" / "이메일 문의" (모바일 전용)
- 같은 회사 정보
- 푸터 메뉴 4개 (모바일에서는 회사정보 영역에 포함)

### 회사 정보 (정확한 텍스트)
- 상호명: **케이엔541샵** / 회사명: **주식회사 케이엔541**
- 대표이사: **김진순**
- 주소: **서울특별시 구로구 디지털로30길 28 (마리오타워) 506호**
- 사업자등록번호: **756-87-02795** + [사업자정보 확인] 버튼
- 통신판매업신고: **제 2024-서울강남-05319호**
- FAX: **02-3436-0542**
- 메일: **kn541club@naver.com**
- 개인정보관리자: **최문수**

### 고객센터
- 전화: **070-4436-0928**
- 운영시간: **월~금요일 오전 10시 ~ 오후 6시 / 토, 일요일, 공휴일 휴무**

---

## 2. 작업 항목

### 2-1. 회사 정보 상수 파일 생성

**대상 파일**: `ciseco-nextjs/src/data/company-info.ts` (신규)

```typescript
// KN541 회사 정보 — 푸터 표시용 상수
// TODO: 향후 변경 가능성 있으면 system_codes(전역변수) API로 이전
export const COMPANY_INFO = {
  bizName: '케이엔541샵',
  corpName: '주식회사 케이엔541',
  ceo: '김진순',
  address: '서울특별시 구로구 디지털로30길 28 (마리오타워) 506호',
  bizNo: '756-87-02795',
  bizCheckUrl: 'https://www.ftc.go.kr/bizCommPop.do?wrkr_no=7568702795', // 공정거래위원회 사업자정보
  mailOrderNo: '제 2024-서울강남-05319호',
  fax: '02-3436-0542',
  email: 'kn541club@naver.com',
  privacyOfficer: '최문수',
  cs: {
    phone: '070-4436-0928',
    hours: '월~금요일 오전 10시 ~ 오후 6시 / 토, 일요일, 공휴일 휴무',
    kakao: '카카오톡 문의', // 향후 카카오 채널 URL 연결
    emailLabel: '이메일 문의',
  },
} as const
```

### 2-2. Footer.tsx 재작성

**대상 파일**: `ciseco-nextjs/src/components/Footer.tsx`

**기존 코드 폐기**, 새 디자인 마크업으로 재작성. 통합 시 다음 요소 모두 포함:
1. 새 디자인 베이스 마크업 (`public/index.html` 푸터 부분)
2. 기존 SNS (`SocialsList1` 컴포넌트 — 네이버블로그/인스타/페북/유튜브)
3. 기존 입점문의 배너 (또는 푸터 메뉴 "입점신청" 링크로 흡수)
4. CSS 변환: `public/css/style.css`의 푸터 클래스들 → Tailwind 유틸 + Phase 1에서 등록한 `kn541-*` 토큰 사용

### 2-3. 마크업 변환 가이드

원본 CSS 클래스 → Tailwind 매핑 예시:

| 원본 CSS 클래스 | Tailwind 변환 가이드 |
|---|---|
| `.site-footer` | `bg-white border-t border-kn541-gray-200` |
| `.footer-inner.container` | `mx-auto max-w-[1280px] px-4 py-12 lg:py-16` |
| `.footer-menu` (PC) | `hidden lg:flex gap-6 text-sm text-kn541-gray-700 mb-8` |
| `.support` | `mb-8 text-kn541-black` |
| `.company` | `text-xs text-kn541-gray-700 leading-relaxed space-y-1` |
| `.company-btn` (사업자확인) | `ml-2 inline-block px-2 py-0.5 border border-kn541-gray-300 rounded text-xs hover:bg-kn541-gray-100` |
| `.support-inquiry` (모바일) | `lg:hidden flex gap-3 ...` |

**원칙**: 원본 디자인의 시각적 결과를 정확히 재현. 색상/간격은 디자인 기준. 헷갈리는 부분은 보고 시 명시.

### 2-4. 푸터 링크 라우팅

| 라벨 | 라우트 | 비고 |
|---|---|---|
| 이용약관 | `/terms/service` | 기존 사용 중 |
| 개인정보처리방침 | `/terms/privacy` | 기존 사용 중 |
| 이용안내 | `#` | **라우트 미정 — 일단 placeholder. 후속 결정** |
| 입점신청 | `/vendor-inquiry` | 기존 사용 중 |
| 사업자정보 확인 | `COMPANY_INFO.bizCheckUrl` | 외부 링크, `target="_blank"` `rel="noopener noreferrer"` |

### 2-5. 다국어 처리 (next-intl)

**원칙**:
- 회사 정보(주소/사업자번호/대표이사 등) — 한국 사업 정보이므로 **한국어 그대로 유지**, 모든 locale에서 동일 텍스트
- 메뉴 라벨(이용약관/개인정보처리방침/이용안내/입점신청)만 번역
- 고객센터 운영시간 텍스트 — 메시지 키로 번역 가능하게

**변경할 메시지 파일**: `ciseco-nextjs/messages/ko.json`, `en.json`, `zh.json`

`Footer` 네임스페이스 추가 (이미 있으면 키 추가):
```json
{
  "Footer": {
    "terms": "이용약관",
    "privacy": "개인정보처리방침",
    "guide": "이용안내",
    "vendor": "입점신청",
    "csTitle": "고객센터",
    "csHours": "월~금요일 오전 10시 ~ 오후 6시 / 토, 일요일, 공휴일 휴무",
    "kakaoInquiry": "카카오톡 문의",
    "emailInquiry": "이메일 문의",
    "checkBizInfo": "사업자정보 확인"
  }
}
```

en/zh도 동일 키, 영어/중국어 번역. **회사정보 항목(상호/대표/주소 등)은 메시지 키로 분리 X — 상수 파일 그대로 사용**.

### 2-6. application-layout.tsx 변경 없음

`ciseco-nextjs/src/app/[locale]/(shop)/application-layout.tsx`에서 `Footer` import는 그대로. Footer.tsx 내부만 교체되므로 layout 파일 수정 불필요.

---

## 3. 변경 파일 요약

| 파일 | 변경 |
|------|------|
| `ciseco-nextjs/src/data/company-info.ts` | 신규 생성 |
| `ciseco-nextjs/src/components/Footer.tsx` | 전면 재작성 |
| `ciseco-nextjs/messages/ko.json` | Footer 네임스페이스 키 추가/갱신 |
| `ciseco-nextjs/messages/en.json` | Footer 네임스페이스 키 추가/갱신 |
| `ciseco-nextjs/messages/zh.json` | Footer 네임스페이스 키 추가/갱신 |

---

## 4. 검증

### 빌드
- `npm run build` → 에러 없음
- `npm run dev` → 정상

### 페이지별 시각 검증
- `/ko` 메인페이지 (현재 Ciseco 기본 홈) 푸터 — 새 디자인 표시
- `/en`, `/zh` — 메뉴 라벨만 번역, 회사정보 한국어 유지
- 마이페이지, 장바구니, 결제 등 다른 페이지 푸터도 동일하게 적용 확인 (application-layout 공통)

### 인터랙션
- "사업자정보 확인" 버튼 클릭 → 새 탭으로 ftc.go.kr 열림
- "카카오톡 문의" / "이메일 문의" 버튼 (모바일) — 일단 작동 확인 (실제 링크는 후속 작업)
- 메일 텍스트 클릭 시 mailto: 동작 (선택)

### 반응형
- 모바일(<768px): 카카오톡/이메일 문의 박스 표시, 푸터 메뉴는 회사정보 영역에 포함
- 태블릿(768~1024px): 디자인의 mobile/PC 분기 따라 처리
- PC(≥1024px): 상단 가로 메뉴 4개 표시

---

## 5. 완료 보고 (창님께 직접)

```
[Phase 2 완료 보고]

✅ 2-1 회사 정보 상수: src/data/company-info.ts 생성
✅ 2-2 Footer.tsx 재작성: 새 디자인 + SNS(SocialsList1) + 입점문의 통합
✅ 2-3 마크업 변환: Tailwind + kn541-* 토큰 적용
✅ 2-4 라우팅: 이용약관/개인정보/입점신청 = 기존 / 이용안내 = # placeholder
✅ 2-5 다국어: ko/en/zh Footer 네임스페이스 추가

빌드: ✅ npm run build 정상
배포: [Vercel preview URL]
커밋: [SHA]

확인 필요:
- "이용안내" 라우트 어떻게 처리할지 (현재 #)
- 카카오톡/이메일 문의 실제 링크 (현재 # 또는 mailto:)

다음: Phase 3 (헤더) 대기
```

---

## 6. 주의사항

- **Supabase 직접 연결 금지** (CLAUDE.md)
- **alert() 금지** → toast
- **기존 SocialsList1 컴포넌트 활용** — 새로 만들지 말 것 (Phase 4/30 푸시된 SNS 추가 작업 결과물 보존)
- 회사 정보 변경 시 향후 system_codes 이전 가능성 — 코드 코멘트로 표기
- 모바일 카카오톡/이메일 문의는 디자인에만 있고 실제 링크 미정 — placeholder로 두고 보고 시 명시
- 기존 Footer.tsx의 widgetMenus 4그룹(고객센터/쇼핑안내/회원/입점) 구조는 **폐기**. 새 디자인은 단순 4개 가로 링크.

---

*작성: 기획 창 | 2026-05-06 | github.com/kn541/kn541-shop*
