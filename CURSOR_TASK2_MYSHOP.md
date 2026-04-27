# KN541 Cursor 작업지시서 — TASK 2: 분양몰(MyShop) 프론트엔드 개발

**긴급도: 🟡 중요**
**작업 도구: Cursor (kn541-shop 레포)**
**작성일: 2026-04-27**
**선행조건: TASK 1 (빌드 에러 수정) 완료 후 진행**

---

## 개요

회원이 자신만의 분양몰(개인 쇼핑몰)을 만들어 공유할 수 있는 기능입니다.
백엔드 API는 이미 완성되어 있습니다. 프론트엔드 화면만 개발하면 됩니다.

## 백엔드 API 목록 (Railway에 배포 완료)

| Method | 경로 | 기능 |
|--------|------|------|
| GET | /myshop/me | 내 분양몰 정보 조회 |
| POST | /myshop/create | 분양몰 생성 |
| PATCH | /myshop/me | 분양몰 수정 (이름/설명/템플릿) |
| GET | /myshop/templates | 템플릿 목록 조회 (5개) |
| POST | /myshop/me/logo | 로고 업로드 |
| GET | /myshop/me/products | 내 분양몰 상품 목록 |
| PATCH | /myshop/me/products | 상품 진열/비진열 설정 |
| GET | /myshop/me/dashboard | 분양몰 대시보드 (방문수/공유수) |
| GET | /myshop/{shop_url_code} | 분양몰 공개 페이지 조회 (비회원 접근 가능) |
| POST | /myshop/{shop_url_code}/visit | 방문 카운트 증가 |

인증: Bearer JWT 토큰 (me 경로), 공개 경로는 토큰 불필요

## 개발할 페이지 (2개)

### 페이지 1: 마이페이지 > 나의 분양몰 관리

**경로:** `/[locale]/account/myshop` (마이페이지 내부 탭 또는 별도 페이지)

**화면 구성:**
1. 분양몰 미생성 시: "나만의 분양몰 만들기" 버튼
2. 분양몰 생성 시:
   - 분양몰 URL 표시 + 복사 버튼 (shop.kn541.co.kr/s/{code})
   - 분양몰 이름/설명 수정
   - 템플릿 선택 (5개 중 택1, 카드형 UI)
   - 로고 업로드 (이미지 미리보기)
   - 분양몰 통계 (방문수/공유수)
   - 상품 진열 관리 (전체 상품 목록에서 체크박스로 진열/비진열)

**API 연동:**
```typescript
const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://kn541-production.up.railway.app'
const token = localStorage.getItem('access_token')
const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

// 내 분양몰 조회
const res = await fetch(`${BASE}/myshop/me`, { headers })

// 분양몰 생성
await fetch(`${BASE}/myshop/create`, {
  method: 'POST', headers,
  body: JSON.stringify({ shop_name: '...', shop_url_code: '...', template_code: 'CLASSIC' })
})

// 템플릿 목록
const templates = await fetch(`${BASE}/myshop/templates`, { headers })
```

### 페이지 2: 분양몰 공개 페이지 (소비자 접속)

**경로:** `/[locale]/s/[shop_url_code]`

**화면 구성:**
- 분양몰 로고 + 이름 + 설명
- 분양몰 주인 정보 (이름)
- 진열된 상품 목록 (그리드)
- 상품 클릭 → 일반 상품 상세 페이지로 이동 (추천인 코드 포함)
- 템플릿 primary_color 적용

**API 연동:**
```typescript
// 분양몰 정보 + 상품 목록 (토큰 불필요)
const shop = await fetch(`${BASE}/myshop/${shopUrlCode}`)

// 방문 카운트
await fetch(`${BASE}/myshop/${shopUrlCode}/visit`, { method: 'POST' })
```

## 템플릿 데이터 (DB에 등록 완료)

| code | 이름 | primary_color |
|------|------|---------------|
| CLASSIC | 클래식 | #7367F0 |
| MODERN | 모던 | #28C76F |
| WARM | 따뜻함 | #FF9F43 |
| COOL | 시원함 | #00CFE8 |
| ELEGANT | 우아함 | #1E1E2F |

## 주의사항
- 분양몰 URL 코드(shop_url_code)는 영문+숫자, 고유값
- 비로그인 사용자도 분양몰 공개 페이지는 접근 가능
- 분양몰 관리 페이지는 로그인 필수
- 상품 클릭 시 추천인 자동 연결은 별도 TASK에서 처리
