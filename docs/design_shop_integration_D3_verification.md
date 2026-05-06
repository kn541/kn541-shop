# 디자인설정 shop 연동 v1 — D3 빌드·회귀 검증 보고

작성: Cursor | 2026-05-06 | 레포: `kn541-shop`

## 로컬 빌드

- 경로: `ciseco-nextjs`
- 명령: `npm run build`
- 결과: **성공** (Next.js 16 / Turbopack)

## 구현 요약 (D1–D2)

| 항목 | 데이터 소스 | 캐시 |
|------|-------------|------|
| 히어로 | `GET /public/hero-banners` | `revalidate: 60` (페이지 + fetch) |
| 추천 | `FEATURED` → `/public/main-products` + `/products/{id}` | 60 |
| 베스트 | `BEST` | 60 |
| 신상 | `NEW` | 60 |

- 히어로·진열 API가 비어 있으면 해당 블록은 렌더하지 않음 (빈 카드 없음).

## 메인 페이지 회귀 시나리오 (수동 점검 권장)

다음은 **이번 diff에서 파일을 건드리지 않은 영역**과 **데이터 전환만 적용한 영역**을 구분한 체크리스트이다.

1. **헤더 / 레이아웃** — `MainHeader`, `(home)/layout`, 글로벌 컨테이너: 변경 없음 → 기존과 동일하게 동작해야 함.
2. **히어로** — 배너가 있을 때만 표시. 높이·전환·컨트롤 마크업 유지. `link_url` 없으면 링크 레이어 없음; 있으면 전체 슬라이드 클릭 가능(`picture`는 `pointer-events-none`).
3. **웰컴 / 사전예약 / 선물배너 / 벨류 패널** — `MainPageBody`에서 기존 순서 유지, 해당 컴포넌트 미수정.
4. **상품 카드** — `MainProductCard` `mode="api"` 재사용; 마크업 변경 없음.
5. **진열 섹션** — FEATURED/NEW/BEST 미등록 시 해당 `<section>` 전체 미출력; 베스트 블록은 이전처럼 상단 데코 이미지(`MAIN_PAGE_ASSETS`)만 유지.

## Vercel Production

- GitHub `main` 푸시 후 **kn541-shop** 프로젝트 최신 Production 배포가 **READY**인지 대시보드 또는 MCP `list_deployments`로 확인한다.
- 본 작업 반영 후 배포 ID는 푸시 직후 생성되는 항목을 보면 된다.

## 참고

- `HeroSlider` 빌드 호환: `??`와 `||` 혼합 시 괄호 필요 (Turbopack 파서).
