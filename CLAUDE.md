# KN541 쇼핑몰 프론트 - CLAUDE.md
> 이 파일은 세션 시작 시 자동으로 읽힙니다.
> 오너: taiwang | 레포: kn541/kn541-shop

---

## ⚠️ 가장 중요한 규칙 3가지

### 1. 최종 컨펌은 taiwang이 직접 한다
- 작업 완료 후 **taiwang에게 직접 보고**

### 2. 작업 전 반드시 기존 작업물을 먼저 파악한다
- 지시가 오면 바로 실행하지 말 것
- 기존 코드 확인 → 문제 검토 → 계획 수립 → 실행

### 3. 한번 금지된 것은 절대 반복하지 않는다
- 위반 발생 시 즉시 롤백 후 보고

---

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 프로젝트명 | KN541 쇼핑몰 프론트 |
| 오너 | taiwang |
| 템플릿 | Ciseco (Next.js 15 + TypeScript + Tailwind CSS 4) |
| 레포 | github.com/kn541/kn541-shop (Private) |
| 도메인 | kn541shop.com (예정) |
| 배포 | Vercel |

---

## 인프라 정보

| 서비스 | URL | 용도 |
|--------|-----|------|
| Railway (백엔드) | https://kn541-production.up.railway.app | FastAPI API 서버 |
| Vercel (어드민) | https://admin.kn541.co.kr | 어드민 (별도 레포) |
| Vercel (쇼핑몰) | https://kn541shop.com (예정) | 이 레포 배포 |
| Supabase | qxmcbdqmmiyrrhenufaj | DB (직접 연결 금지) |

---

## 환경변수 (.env.local)

```
NEXT_PUBLIC_API_URL=https://kn541-production.up.railway.app
NEXT_PUBLIC_SHOP_DOMAIN=kn541shop.com  # 도메인 확정 후 변경
```

---

## 분양몰 구조

```
유료회원 1계정 1개 쇼핑몰
URL: kn541shop.com/{shop_url_code}

동적 라우팅:
  /[shop_url_code]         → 분양몰 홈
  /[shop_url_code]/products → 분양몰 상품 목록
  /[shop_url_code]/products/[id] → 상품 상세

공개 API (인증 불필요):
  GET /shop/{shop_url_code}         → 몰 정보 + 상품 목록
```

---

## API 연동 표준

```typescript
const BASE = process.env.NEXT_PUBLIC_API_URL
const token = typeof window !== 'undefined'
  ? localStorage.getItem('access_token') : null
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}

// 전역변수 동적 로드 (하드코딩 금지)
const res = await fetch(`${BASE}/system-codes?category=product_type`)
const { data } = await res.json()

// 분양몰 공개 조회 (인증 불필요)
const shop = await fetch(`${BASE}/shop/{shop_url_code}`)
```

---

## 주요 API 목록

> 전체 명세: https://github.com/kn541/kn541/blob/main/API_SPEC.md

| 그룹 | 주요 API |
|------|----------|
| 인증 | POST /auth/login, POST /auth/register |
| 회원 | GET /members, GET /members/{id} |
| 분양몰 | GET /shop/{code}, POST /my/shop, GET /my/shop/products |
| 전역변수 | GET /system-codes?category={category} |

---

## ❌ 절대 금지 규칙

- Supabase 직접 연결 → 모든 데이터는 FastAPI 경유
- 코드값 하드코딩 → `/system-codes` API 동적 로드
- 환경변수 하드코딩 → `.env.local` 사용
- `alert()` 사용 → toast로 대체
- VS Code 사용 → Cursor 전담
- 백엔드 API 인계 없이 연동 시작
- taiwang 승인 없이 비즈니스 로직 임의 변경

---

## 세션 시작 명령어

### Cursor (프론트 창)
```
@CLAUDE.md
Ciseco 쇼핑몰 작업 시작합니다.
기존 파일 구조 파악 후 현재 상태 보고해줘.
```

### Claude Code (터미널)
```bash
cat CLAUDE.md
git pull origin main
```

---

## 완료 보고 형식

```
[프론트 → taiwang 보고]

화면명: {화면명}
완료일: {날짜}

로컬: http://localhost:3000/{경로}
배포: https://kn541shop.com/{경로}

API 연동:
  {API} → 정상

전역변수 동적 로드 확인: ✅
반응형 확인: PC ✅ / 모바일 ✅
```

---

*최종 업데이트: 2026-03-27 | 오너: taiwang*
