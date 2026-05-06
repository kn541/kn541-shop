# Cursor 작업지시 — 탑네비 카테고리 DB 동적화 + 사전예약/밸류업 (v1)

## 배경 / 목표

shop 메인 상단의 **정적 카테고리 17탭(`home-tabs` 또는 `MainHeader` 내부)**을 DB의 `categories` 테이블 대분류로 동적 전환하고, 그 **뒤에 "사전예약", "밸류업"** 두 진입점을 균형 있게 추가한다.

- 디자인설정 모듈(D1~D3, commit 1f7f474) 패턴과 일관되게 ISR 기반 동적화
- 백엔드 endpoint는 **이미 존재하는 `GET /categories`** 그대로 재사용 (인증 불필요)
- 메인 헤더의 마크업/CSS/회귀는 절대 건드리지 않음 — 데이터 소스와 항목 구성만 변경

---

## 데이터 소스 (확정)

### 백엔드: `GET https://api.kn541.co.kr/categories` (인증 없음)

이미 존재. response 형태:
```json
{
  "status": "success",
  "data": {
    "items": [ /* depth=1 root 노드 + children 트리 */ ],
    "total": 527
  }
}
```

응답 항목 컬럼: `id`, `category_code`, `category_name`, `parent_id`, `depth`, `sort_order`, `is_active`, `is_event`, `created_at`, ... 전체 `*`.

### shop 측 필터 (확정)

`data.items` 중에서:
- `depth === 1` (root만)
- `is_active === true`
- `is_event === false`

정렬: `sort_order` ASC.

이 조건으로 현재 DB에 **정확히 11건** (검증 완료):

| sort_order | category_code | category_name |
|---|---|---|
| 10 | 10 | 생활/홈데코 |
| 20 | e0 | 가전/컴퓨터/디지털 |
| 30 | 70 | 주방 |
| 40 | 40 | 뷰티 |
| 50 | 20 | 자동차/스포츠 |
| 60 | 50 | 유아동/주니어 |
| 70 | 30 | 여행 |
| 80 | 80 | 패션/잡화 |
| 90 | 60 | 건강/헬스 |
| 100 | f0 | 캠핑/등산/낚시 |
| 110 | a0 | 식품 |

→ DB 추가/제거 시 ISR 600초(10분) 안에 자동 반영.

---

## 현재 정적 17탭 위치 (Cursor가 grep으로 직접 확인)

작업일지 commit `c587e547`에 "메인 헤더 home-tabs로 카테고리 17탭 가로 스크롤"로 정의. 정확한 파일은 다음 중 하나:
- `ciseco-nextjs/src/components/main-page/` 하위
- `ciseco-nextjs/src/components/Header/` 하위
- `ciseco-nextjs/src/components/MainHeader.*`

빠르게 찾는 명령:
```bash
grep -rn "패션/잡화" ciseco-nextjs/src/components/
grep -rn "home-tabs" ciseco-nextjs/src/
grep -rn "site-header" ciseco-nextjs/src/components/
```

찾으면 그 컴포넌트의 정적 카테고리 배열을 식별 (보통 const 배열로 라벨/href가 하드코딩되어 있음).

---

## "균형 있게" — 디자인 합의

DB 카테고리 11개 + 사전예약 + 밸류업 = 13개 탭. 다음 규칙으로 한 줄 가로 스크롤(기존 동작 그대로) 안에서 시각 균형 확보:

1. **그룹 분리**: 카테고리 그룹과 특수 그룹 사이에 **세로 구분선**(`<span class="mx-3 inline-block h-4 w-px bg-neutral-200">`) 삽입. 모바일에서는 동일한 구분.
2. **특수 그룹 강조**: 사전예약/밸류업 두 탭은 **동일한 강조 톤**으로 통일.
   - 권장: 라벨 옆 점 배지 또는 텍스트 컬러를 `text-primary-600` (또는 기존 디자인 토큰의 강조색)
   - 두 탭의 시각 가중치를 **반드시 동일**하게 (한쪽만 더 강조 X)
3. **순서**: `[카테고리 11] [구분선] [사전예약] [밸류업]`
4. **active 표시**: 카테고리 클릭 시 active 스타일은 기존 정적 탭의 스타일 그대로 재사용.

---

## 작업 단계 (commit 3개로 분리 권장)

### E1: `categoriesPublic.ts` 헬퍼 추가

파일: `ciseco-nextjs/src/lib/categoriesPublic.ts` (신규) 또는 기존 헬퍼 확장.

```ts
// shape
export interface TopCategory {
  id: string;
  category_code: string;
  category_name: string;
  sort_order: number;
}

export async function fetchTopCategories(): Promise<TopCategory[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/categories`, {
    next: { revalidate: 600 }, // 10분
  });
  if (!res.ok) return [];
  const json = await res.json();
  const items = json?.data?.items ?? [];
  return items
    .filter((c: any) => c.depth === 1 && c.is_active && !c.is_event)
    .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((c: any) => ({
      id:            String(c.id),
      category_code: c.category_code,
      category_name: c.category_name,
      sort_order:    c.sort_order ?? 0,
    }));
}
```

API base URL 환경변수 이름은 기존 `designPublic.ts`(commit `db49e9c`)와 동일하게 맞출 것.

### E2: 정적 17탭 → 동적 + 사전예약/밸류업

위에서 grep으로 찾은 home-tabs 컴포넌트의 정적 배열을 제거하고 다음 형태로 교체:

```tsx
// pseudo-code, 실제 컴포넌트 구조에 맞춰 적용
const categories = await fetchTopCategories();

const items: TabItem[] = [
  ...categories.map(c => ({
    kind: 'category' as const,
    label: c.category_name,
    href: `/collection/${c.category_code}`, // 기존 정적 탭 href 패턴 유지
  })),
  { kind: 'divider' as const },
  { kind: 'special' as const, label: '사전예약', href: '/#pre-order' },
  { kind: 'special' as const, label: '밸류업',  href: '/#value-up' },
];
```

**href 패턴 주의**: 기존 정적 17탭이 `/collection/{slug}`인지 `/c/{code}`인지 다른 형태인지 확인하고 그대로 따라간다. 무엇이든 정적 탭의 기존 동작과 동일해야 한다.

렌더러는 `kind`로 분기:
- `category` / `special`: 기존 탭 스타일
- `special`: 추가로 강조 클래스 (위 디자인 합의 참고)
- `divider`: 세로 구분선만 출력 (탭 아님)

서버 컴포넌트로 SSR + ISR(`revalidate=600`).

### E3: 메인 섹션 anchor ID + 검증

메인 페이지의 두 섹션 h2 부모(또는 section 태그)에 ID 부여:
- 사전예약 섹션 (h2 "이 달의 특별한 사전 예약 상품을 만나보세요.") → `id="pre-order"`
- 밸류업 섹션 (h2 "벨류업 상품" 또는 "소비의 가치를 높여주는 특별한 상품을 만나보세요.") → `id="value-up"`

스크롤 동작 확인:
- 데스크톱/모바일에서 클릭 시 부드럽게 이동
- 헤더 sticky라면 scroll-margin-top으로 헤더 높이 보정 (`scroll-mt-20` 정도)

검증 문서 추가: `docs/topnav_category_dynamic_E3_verification.md`
- 코드 변화 범위 (변경 파일/미변경 파일)
- 회귀 체크리스트
- 11개 카테고리 + 사전예약/밸류업 마크업 확인 결과

---

## 회귀 방지 — 절대 건드리지 않을 것

- MainHeader 외곽 마크업, 1280 컨테이너(`container-kn541`), 가로 스크롤 컨테이너, 모바일 underline 스타일
- 헤더 로고, 검색바, 장바구니, 계정 메뉴
- 메인 페이지의 다른 섹션(웰컴, 히어로 슬라이더, 메인 진열, 푸터 등)
- 정적 17탭에 "홈" 같은 비카테고리 탭이 있었다면 그 처리 명시 — 기본 정책: **정적 17탭에서 카테고리만 DB로 교체, 비카테고리(예: 홈, 공지) 탭이 있다면 위치 그대로 유지**. 모호하면 사용자 확인.

---

## Vercel 배포 확인

푸시 후 `kn541-shop` Vercel project(`prj_79A3AewCKMp1kdLiPIMVp82yv3Ik`) 자동 배포 → READY 확인.

검증:
- shop.kn541.co.kr fetch
- HTML에 11개 카테고리 라벨 모두 등장 (`패션/잡화`, `생활/홈데코`, ...)
- `사전예약`, `밸류업` 라벨 등장
- HTTP 200 + 회귀 없음

---

## Commit 메시지 컨벤션

E1: `feat(shop): top-nav 카테고리 동적 헬퍼 categoriesPublic.ts (E1)`
E2: `feat(shop): top-nav 정적 17탭 → DB 카테고리 + 사전예약/밸류업 (E2)`
E3: `feat(shop): 메인 사전예약/밸류업 섹션 anchor ID + 검증 (E3)`

각 commit에 `Co-authored-by: Cursor <cursoragent@cursor.com>` 추가.

---

## 작업 후 보고 양식

```
커밋 (3, kn541-shop main 푸시 완료)
- E1 <hash>: ...
- E2 <hash>: ...
- E3 <hash>: ...

Vercel: dpl_<id> READY (commit <E3 hash>)
build: npm run build 통과
회귀: MainHeader/1280 컨테이너/스크롤 동작 미변경, 기존 헤더 요소 미변경

발견 사항:
- 정적 17탭 중 비카테고리 탭(있었다면): ...
- href 패턴: /collection/{category_code} (또는 다른 패턴)
```
