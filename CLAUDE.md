# KN541 쇼핑몰 프론트 — CLAUDE.md
> 세션 시작 시 **반드시 이 파일부터 읽는다.**
> 레포: kn541/kn541-shop (Public)
> 최종 업데이트: 2026-04-02

---

## ⚠️ 가장 중요한 규칙 (절대 위반 금지)

### 1. 최종 컨펌은 창님이 직접 한다
- 작업 완료 → 창님에게 직접 보고

### 2. 작업 전 반드시 기존 작업물부터 파악한다
- 지시 받으면 바로 실행 ❌
- **기존 코드 확인 → 문제 검토 → 계획 → 실행** 순서 필수

### 3. 모든 프론트는 반드시 API로만 데이터를 가져온다
- **Supabase 직접 연결 절대 금지**
- 모든 데이터는 FastAPI(Railway) 경유

### 4. 한 번 금지된 것은 절대 반복하지 않는다
- 위반 즉시 롤백 후 보고

---

## 프로젝트 인프라

| 서비스 | URL / ID | 용도 |
|--------|----------|------|
| 쇼핑몰 프론트 | https://shop.kn541.co.kr | 이 레포 (ciseco-nextjs) |
| 어드민 프론트 | https://admin.kn541.co.kr | 별도 레포 (kn541/kn541) |
| FastAPI 백엔드 | https://kn541-production.up.railway.app | 모든 API 여기서 |
| Swagger 문서 | https://kn541-production.up.railway.app/docs | API 명세 확인 |
| Vercel 쇼핑몰 | prj_79A3AewCKMp1kdLiPIMVp82yv3Ik | team: team_drI09A5dIh6QJAO2GuDvPBRv |
| Vercel 어드민 | prj_sZ5L9j9Ng7jrWvZz2FPdo9YRPFE9 | team: team_drI09A5dIh6QJAO2GuDvPBRv |
| GitHub 쇼핑몰 | github.com/kn541/kn541-shop | 이 레포 |
| GitHub 어드민 | github.com/kn541/kn541 (Private) | 어드민 레포 |

---

## 환경변수

```
# ciseco-nextjs/.env.local (로컬)
NEXT_PUBLIC_API_URL=https://kn541-production.up.railway.app
```

---

## 가격 표기 규정 (2026-05-06 갱신)

- **한국어(`/ko`) 상점 UI**: 원화는 **`88,888원` 형식**(천 단위 콤마 + `원` 접미사, 숫자와 `원` 사이 공백 없음)을 표준으로 한다. 공통 헬퍼: `ciseco-nextjs/src/lib/formatPrice.ts`의 `formatPriceKo`.
- **컴포넌트**: 목록·카드·퀵뷰 등에서 재사용 가능한 가격 표시는 `components/Prices.tsx`를 우선한다(`ko`에서 `formatPriceKo` 사용).
- **영문·중문 등**: `formatPrice.ts`의 **en/zh 전용 분기는 별도 지시 없이 변경하지 않는다**. 로케일별로 직접 `toLocaleString` 등을 쓰는 기존 화면은 해당 로케일 요구사항에 맞게 유지·정리한다.
- **직접 포맷**: 새 코드에서 `toLocaleString(...) + '원'` 등을 반복하지 말고, `ko` 표준은 가능하면 `formatPriceKo`로 통일한다(배송비 문구 등 문맥상 예외는 허용).

---

## 기술 스택

- **프레임워크**: Next.js 16 (App Router) + TypeScript + Tailwind CSS
- **템플릿**: Ciseco (ciseco-nextjs/)
- **배포**: Vercel
- **패키지 매니저**: npm

---

## 폴더 구조 핵심

```
ciseco-nextjs/
  src/
    app/
      [locale]/(shop)/   ← 쇼핑몰 페이지 (헤더/푸터 포함)
        (other-pages)/   ← 일반 페이지들
      api/               ← Next.js Route Handler (필요 시)
    components/
      Header/
        Header.tsx           ← 헤더 (서버 컴포넌트, 2행 구조)
        CategoryNav.tsx      ← 카테고리 네비 (서버 컴포넌트 — API fetch)
        CategoryNavClient.tsx ← hover 인터랙션 (클라이언트 컴포넌트)
        Logo.tsx             ← 로고 (Next.js Image, /kn541-logo.png)
      Footer.tsx         ← 한국어 푸터 (입점문의 링크 포함)
    lib/
      api/
        categories.ts    ← 카테고리 API
        products.ts      ← 상품 API
        index.ts         ← 통합 export
  public/
    kn541-logo.png       ← KN541 로고 (Cursor에서 실제 PNG 교체 필요)
```

---

## 완료된 주요 작업 (2026-04-02 기준)

| 작업 | 파일 | 상태 |
|------|------|------|
| 헤더 2행 구조 | Header/Header.tsx | ✅ 배포완료 |
| 카테고리 네비 (서버 컴포넌트) | Header/CategoryNav.tsx | ✅ 배포완료 |
| 카테고리 hover 드롭다운 | Header/CategoryNavClient.tsx | ✅ 배포완료 |
| 로고 이미지 교체 | components/Logo.tsx | ✅ (PNG 파일은 Cursor에서 교체 필요) |
| 한국어 푸터 | components/Footer.tsx | ✅ 배포완료 |
| 입점문의 페이지 | app/.../vendor-inquiry/page.tsx | ✅ 배포완료 |

---

## 헤더 구조 (현재)

```
[헤더 1행] 로고 | (공간) | LangSwitcher + 검색 + 장바구니
[헤더 2행] KN마트 | 가전/디지털 | 주방용품 | ... (18개 카테고리, 마우스오버 2단 드롭다운)
```

카테고리 데이터: 백엔드 `/categories` API → `data.items[]` (children 포함)

---

## API 연동 원칙

```typescript
// ✅ 올바른 방식 — 서버 컴포넌트에서 fetch
async function fetchSomething() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/endpoint`, {
    next: { revalidate: 300 }
  })
  return res.json()
}

// ✅ 올바른 방식 — 클라이언트 컴포넌트에서 fetch
const BASE = process.env.NEXT_PUBLIC_API_URL
const res = await fetch(`${BASE}/endpoint`)

// ❌ 절대 금지 — Supabase 직접 연결
import { createClient } from '@supabase/supabase-js'  // 금지!
```

### CORS 주의
- 브라우저(클라이언트)에서 Railway API 직접 호출 시 CORS 오류 발생 가능
- **해결책**: 서버 컴포넌트(`async function`)에서 fetch → CORS 없음

---

## API 응답 표준

```json
{
  "status": "success",
  "data": {
    "items": [...],
    "total": 100
  }
}
```

---

## 주요 API 엔드포인트

| 엔드포인트 | 용도 |
|-----------|------|
| GET /categories | 전체 카테고리 (children 포함) |
| GET /products | 상품 목록 |
| GET /products/{id} | 상품 상세 |
| POST /vendor-inquiry | 입점문의 등록 |
| POST /auth/login | 로그인 |
| GET /members/me | 내 정보 |

---

## ❌ 절대 금지 규칙

- **Supabase 직접 연결** → 모든 데이터는 FastAPI 경유
- **코드값 하드코딩** → `/system-codes` API 동적 로드
- **환경변수 하드코딩** → `.env.local` 사용
- **`alert()` 사용** → toast로 대체
- **클라이언트에서 Railway 직접 fetch** → CORS 위험, 서버 컴포넌트 사용
- **창님 승인 없이 비즈니스 로직 변경**

---

## 미완료 / 다음 작업

- [ ] `/public/kn541-logo.png` 실제 PNG 파일로 교체 (Cursor에서 직접 push)
- [ ] 회원관리 페이지 (어드민)
- [ ] 쇼핑몰 상품 목록 페이지 API 연동
- [ ] 로그인/회원가입 페이지

---

## 세션 시작 체크리스트

```
1. 이 파일(CLAUDE.md) 읽기
2. git pull origin main
3. 현재 배포 상태 확인: https://shop.kn541.co.kr
4. 작업할 내용 파악 후 창님께 계획 보고
5. 창님 승인 후 실행
```

---

*최종 업데이트: 2026-04-02 | 레포: kn541/kn541-shop*
