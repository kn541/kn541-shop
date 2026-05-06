# Cursor 작업지시 — 탑네비 카테고리 DB 동적화 + 사전예약/밸류업 (v1)

## 구현 현황 (코드 기준, 2026-05)

- **탭 구성**: `HOME_TABS` **6건**(홈·베스트·신상·추천·**사전예약**·**벨류업**) 순서 유지 + **DB 루트 카테고리 11건** = **17탭 한 줄**. 비카테고리 탭은 건드리지 않음.
- **데이터**: `getRootCategories()` → `buildMainCategoryTabs()` (`ciseco-nextjs/src/data/home-tabs.ts`). 필터: `depth === 1`, `is_active`, **`!is_event`**.
- **href**: 정적 탭은 기존과 동일(`/`·`/products`·`#` 등). 카테고리만 **`/collections/{category_code}`** (`app/.../collections/[handle]`와 동일).
- **폴백**: API 실패·빈 목록 시 `FALLBACK_CATEGORY_TABS`(기존 정적 11 라벨·`#`).
- **연동**: `(home)/layout.tsx` 서버에서 조회 후 `<MainHeader categoryTabs={...} />`. 활성 탭은 `pathname`과 동기화.
- **원안과의 차이**: 아래 "균형 있게"의 **구분선·카테고리 뒤 사전예약/밸류업 13탭 재배치**·섹션 `id` 앵커는 **미적용**(이미 `HOME_TABS`에 동일 진입이 있음). 필요 시 후속 PR.

---

## 배경 / 목표

shop 메인 상단의 **정적 카테고리 탭(`home-tabs` + `MainHeader`)**을 DB의 `categories` 테이블 대분류로 동적 전환하고, (원안) 그 **뒤에 "사전예약", "밸류업"** 두 진입점을 균형 있게 추가한다.

- 백엔드 endpoint는 **이미 존재하는 `GET /categories`** 재사용 (인증 불필요)
- 정책: **카테고리 슬롯만 DB로 교체**, 비카테고리 탭(홈 등)은 위치·동작 유지

---

## 데이터 소스 (확정)

### 백엔드: `GET /categories` (인증 없음)

response 형태:

```json
{
  "status": "success",
  "data": {
    "items": [ /* depth=1 root 노드 + children 트리 */ ],
    "total": 527
  }
}
```

### shop 측 필터 (확정)

`data.items` 중에서:

- `depth === 1` (root만)
- `is_active === true`
- `is_event === false`

정렬: `sort_order` ASC.

DB 기준 대분류 예시(11건):

| sort_order | category_code | category_name |
|---:|---|---|
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

---

## 정적 라벨 위치 (grep)

`패션/잡화` 등은 **`ciseco-nextjs/src/components/`** 가 아니라 **`ciseco-nextjs/src/data/home-tabs.ts`** 의 `FALLBACK_CATEGORY_TABS` 에 정의됨.

```bash
grep -rn "패션/잡화" ciseco-nextjs/src/components/
grep -rn "패션/잡화" ciseco-nextjs/src/data/
```

---

## "균형 있게" — 디자인 합의 (원안, 미전부 구현)

DB 카테고리 11개 + 사전예약 + 밸류업 = 13탭 배치 등은 원안이다. 현재 코드는 **6+11=17** 구조를 유지한다.

1. 카테고리 그룹과 특수 그룹 사이 **세로 구분선**
2. 사전예약/밸류업 **동일 강조 톤**
3. 순서: `[카테고리 11] [구분선] [사전예약] [밸류업]`

---

## 회귀 검증 체크리스트

| 항목 | 기대 |
|------|------|
| 홈 탭 | `/`, 모바일 언더라인 0번 |
| `#` / `dataTodo` | 라우팅 없음 |
| 신상·사전예약 | `/products`, `/products?product_type=002` |
| 카테고리 | `/collections/{루트 category_code}` |
| API 장애 | `FALLBACK_CATEGORY_TABS`로 11슬롯 유지 |
| i18n | `useRouter().push` 로케일 동작 |

---

## Vercel

- 프로젝트: **kn541-shop** (`prj_79A3AewCKMp1kdLiPIMVp82yv3Ik`)
- 푸시 후 최신 배포 **READY** 확인

---

## Commit 분리 (본 작업)

- **C1**: `home-tabs` — `buildMainCategoryTabs`, `FALLBACK_CATEGORY_TABS`
- **C2**: `(home)/layout` + `MainHeader` 연동
- **C3**: 본 문서 정리·병합 + `is_event` 필터 정합
