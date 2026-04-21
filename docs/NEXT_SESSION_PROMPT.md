# KN541 다음 세션 시작 프롬프트

아래 내용을 다음 Claude 창에 첫 메시지로 붙여넣으세요.

---

## 📋 복사해서 사용할 프롬프트

```
안녕하세요. KN541 프로젝트 이어서 작업합니다.

## 프로젝트 기본 정보

- 쇼핑몰: kn541/kn541-shop → https://shop.kn541.co.kr (Vercel: prj_79A3AewCKMp1kdLiPIMVp82yv3Ik)
- 어드민: kn541/kn541 → https://admin.kn541.co.kr (Vercel: prj_sZ5L9j9Ng7jrWvZz2FPdo9YRPFE9)
- SCM: kn541/kn541-scm → https://scm.kn541.co.kr
- 백엔드: https://kn541-production.up.railway.app (Railway)
- Supabase: qxmcbdqmmiyrrhenufaj, team: team_drI09A5dIh6QJAO2GuDvPBRv
- 기술 스택: Next.js 15 + FastAPI(Python) + Supabase(PostgreSQL) + Railway + Vercel

## 이전 세션에서 완료된 작업

1. fly.dev → Railway 전환 완료
2. 이미지 업로드 RLS 에러 수정 (SUPABASE_SERVICE_ROLE_KEY 적용)
3. SSG 타임아웃 근본 해결 (force-dynamic 전역 적용)
4. 어드민 상품 이미지 클릭 → 쇼핑몰 상세페이지 연결 수정 (UUID 기반 URL)
5. 쇼핑몰 상품 상세페이지 전면 개선:
   - 카테고리 브레드크럼 (홈 > 대분류 > 중분류 > 소분류)
   - 썸네일 이미지 정상 표시 (외부 도메인 허용)
   - 상품 전체 정보 표시 (원산지, 과세유형, 재고, 공급사 등)
6. 백엔드 카테고리 필터 OR 조건 수정 (대/중/소분류 모두 매칭)

## 🔴 현재 최우선 해결 과제

### 쇼핑몰 상품 목록 페이지 상품 0개 표시 문제

- URL: https://shop.kn541.co.kr/ko/products
- 증상: 전체 상품 및 카테고리 선택 시 모두 「상품이 없습니다.」 표시
- API 직접 호출은 정상 (https://kn541-production.up.railway.app/products?size=5 → 5개 반환)
- Vercel 런타임 로그: 200 OK (에러 없음)
- page.tsx 코드: product_status: 'ACTIVE' 필터 이미 제거됨
- 최신 배포: dpl_EFLFt513r96EpqAtk3paXQDL9QhC READY

**디버깅 방법 제안**:
1. Vercel 환경변수 확인 (NEXT_PUBLIC_API_URL)
2. page.tsx에 console.log 추가 후 Vercel 런타임 로그 확인
3. 또는 page.tsx를 Client Component로 변경해서 브라우저에서 직접 API 호출

## 개발 규칙

- 전역변수: system_codes 테이블 사용
- 코드값 하드코딩 절대 금지
- 모든 조회는 뷰(VIEW) 통해서만
- 샘플/예시 데이터 INSERT 금지
- 한국어 주석 필수
- alert() 금지 → toast 사용
- 백엔드: VS Code + 터미널 / 프론트: Cursor 전담
- API 응답: {status: "success", data: {items, total}}
- 상품 목록에서 handle = product_id (UUID) 기반
- 쇼핑몰 상품 상세: UUID로 직접 조회 (getProductById)

## 레포지토리 파일 구조

- 백엔드: backend/routers/ (FastAPI)
- 어드민: admin/starter-kit/src/ (Next.js + MUI)
- 쇼핑몰: ciseco-nextjs/src/ (Next.js + Tailwind)
- SCM: kn541-scm/src/ (Next.js)

## 다음 예정 작업 (우선순위 순)

1. 🔴 [최우선] 쇼핑몰 상품 목록 0개 문제 해결
2. 쇼핑몰 상품 목록 페이지 페이지네이션 구현 (현재 하드코딩)
3. 상품 목록에서 썸네일 이미지 표시
4. 장바구니 / 결제 기능 연동
5. 회원가입/로그인 연동
6. Railway 25개 API /docs 전체 테스트 통과 확인

먼저 쇼핑몰 상품 목록 페이지 문제를 해결해주세요.
```

---

## 참고: 주요 파일 경로

| 목적 | 파일 경로 |
|------|-----------|
| 쇼핑몰 상품 목록 페이지 | `ciseco-nextjs/src/app/[locale]/(shop)/(other-pages)/products/page.tsx` |
| 쇼핑몰 상품 목록 클라이언트 | `ciseco-nextjs/src/app/[locale]/(shop)/(other-pages)/products/ProductsPageClient.tsx` |
| 쇼핑몰 상품 상세 페이지 | `ciseco-nextjs/src/app/[locale]/(shop)/(other-pages)/products/[handle]/page.tsx` |
| 쇼핑몰 상품 갤러리 | `ciseco-nextjs/src/app/[locale]/(shop)/(other-pages)/products/KoreanProductGallery.tsx` |
| 쇼핑몰 API 어댑터 | `ciseco-nextjs/src/lib/adapters.ts` |
| 쇼핑몰 상품 API | `ciseco-nextjs/src/lib/api/products.ts` |
| 쇼핑몰 데이터 레이어 | `ciseco-nextjs/src/data/data.ts` |
| Next.js 설정 | `ciseco-nextjs/next.config.mjs` |
| 백엔드 상품 API | `backend/routers/products.py` |
| 어드민 상품 목록 | `admin/starter-kit/src/views/products/ProductListTable.tsx` |

---

*최종 업데이트: 2026-04-21*
