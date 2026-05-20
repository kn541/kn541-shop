# KN541 Shop 모바일 반응형 긴급 수정 — Cursor 프롬프트

## 작업 환경
- 소스 루트: `ciseco-nextjs/src/`
- 프레임워크: Next.js + Tailwind CSS (Ciseco 템플릿)
- 모바일 뷰포트: 375px 기준

---

## 1. [심각] 상품 카드 오른쪽 잘림 수정

### 문제
홈페이지의 사전예약/추천/신상품 섹션에서 2열 그리드의 오른쪽 카드가 overflow로 잘림.
상품명, 가격, 이미지, "담기" 버튼 모두 잘려서 소비자가 내용을 알 수 없음.

### 수정 방향
프로젝트 전체에서 상품 카드를 렌더링하는 그리드/슬라이더 컴포넌트를 찾아서:
1. 그리드 컨테이너에 `overflow-hidden` 제거하거나 `overflow-x-auto`로 변경
2. 카드 컨테이너에 `min-width: 0` 추가 (CSS Grid의 min-content overflow 방지)
3. 상품명에 `line-clamp-2` 또는 `truncate` 적용 (말줄임 처리)
4. 가격 텍스트에 `whitespace-nowrap truncate` 적용

### 관련 파일 (확인 필요)
- `ciseco-nextjs/src/components/` 아래 ProductCard, ProductKn541Card 등
- 홈페이지: `ciseco-nextjs/src/app/[locale]/(shop)/page.tsx` 또는 홈 컴포넌트
- 섹션 컴포넌트: SectionPreOrder, SectionRecommend, SectionNewProducts 등

### Cursor 프롬프트
```
@ciseco-nextjs/src

모바일(375px)에서 상품 카드 그리드의 오른쪽 카드가 잘리는 문제를 수정해줘.

현상:
- 홈페이지의 사전예약, 추천상품, 신상품 섹션에서 2열 그리드 사용
- 오른쪽 카드의 상품명, 가격, 이미지가 overflow로 잘림
- "담기" 버튼도 오른쪽 카드에서는 아이콘만 보이고 텍스트 잘림

수정:
1. 상품 카드 그리드 컨테이너에 min-width: 0 적용 (grid item overflow 방지)
2. 상품명에 line-clamp-2 적용 (2줄 말줄임)
3. 카드 내부 모든 텍스트에 overflow 방지 처리
4. "담기" 버튼: 모바일에서는 아이콘만 표시하거나, 양쪽 모두 동일하게 표시
5. 가격 영역에 flex-wrap 또는 truncate 적용

모든 상품 카드 그리드/슬라이더를 일괄 수정해줘.
```

---

## 2. [심각] 상품 상세 CTA 버튼 sticky 처리

### 문제
상품 상세 페이지에서 "장바구니 담기" / "바로구매" 버튼이 화면 하단에 걸쳐져 반만 보임.
소비자가 구매 버튼을 찾기 위해 스크롤해야 함 → 전환율 하락.

### 수정 방향
CTA 버튼 영역을 모바일에서 하단 고정(sticky/fixed)으로 변경.

### Cursor 프롬프트
```
@ciseco-nextjs/src/app/[locale]/(shop)/products

상품 상세 페이지에서 "장바구니 담기"와 "바로구매" 버튼을 모바일에서 하단 고정으로 수정해줘.

현상:
- 스크롤 위치에 따라 CTA 버튼이 화면 밖에 있거나 반만 보임
- 소비자가 구매 버튼을 찾으려면 스크롤해야 함

수정:
- 모바일(md 미만)에서 CTA 버튼 영역을 fixed bottom으로 변경
- 배경색 white, shadow-top 추가, safe-area-inset-bottom 패딩
- 본문 콘텐츠 하단에 CTA 높이만큼 padding-bottom 추가 (가림 방지)
- 데스크톱에서는 기존 레이아웃 유지

예시:
<div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:static md:shadow-none md:p-0 z-50">
  <div className="flex gap-2">
    <button>장바구니 담기</button>
    <button>바로구매</button>
    <button>♡</button>
  </div>
</div>
```

---

## 3. [필수] 소셜 로그인 전체 삭제

### 문제
카카오/구글 소셜 로그인 버튼이 로그인/회원가입 페이지에 표시되지만,
운영 방침에 따라 소셜 로그인을 완전히 제거해야 함.

### Cursor 프롬프트
```
@ciseco-nextjs/src/app/[locale]/(auth)
@ciseco-nextjs/src/components

로그인과 회원가입 페이지에서 소셜 로그인 관련 코드를 전부 삭제해줘.

삭제 대상:
1. 카카오톡 로그인 버튼
2. 구글 로그인 버튼
3. "SNS로 간편 로그인" 또는 "소셜 로그인" 텍스트/구분선
4. 소셜 로그인 관련 API 호출 함수
5. "또는" 구분선 (OR divider)

삭제 범위:
- 로그인 페이지 (login)
- 회원가입 페이지 (signup/register)
- 관련 컴포넌트 (SocialLoginButtons 등)

아이디/비밀번호 로그인만 남기고, 소셜 관련 import/컴포넌트/함수를 모두 제거해줘.
빌드 에러가 나지 않도록 사용되지 않는 import도 정리해줘.
```

---

## 4. [보통] 하단 네비게이션 녹색 버튼 개선

### Cursor 프롬프트
```
@ciseco-nextjs/src/components

하단 네비게이션(BottomNav/TabBar)의 중앙 녹색 원형 버튼에 라벨을 추가해줘.

현상:
- 전체메뉴 / 사전예약 / 🟢 / 내 정보 / 찜
- 중앙 녹색 버튼에 아이콘도 라벨도 없어서 용도를 알 수 없음

수정:
- 버튼에 "홈" 또는 적절한 라벨과 아이콘 추가
- 다른 탭과 동일한 스타일로 통일 (아이콘 + 라벨)
- 또는 녹색 버튼을 제거하고 일반 "홈" 탭으로 교체
```

---

## 5. [보통] 헤더 모바일 최적화

### Cursor 프롬프트
```
@ciseco-nextjs/src/components

모바일 헤더에서 장바구니/로그인/회원가입/국기/햄버거 메뉴가 빽빽한 문제를 수정해줘.

수정:
- 모바일(375px 이하)에서 "로그인"/"회원가입" 텍스트를 아이콘으로 변경
  (사람 아이콘 등, 클릭 시 로그인 페이지로 이동)
- "장바구니" 텍스트도 장바구니 아이콘으로 변경
- 국기(언어 선택)는 햄버거 메뉴 안으로 이동
- 터치 타겟 최소 44x44px 확보
```

---

## 작업 순서
1. 소셜 로그인 삭제 (가장 간단, 바로 완료 가능)
2. 상품 카드 잘림 수정 (전 섹션 영향)
3. 상품 상세 CTA 고정 (구매 전환율 직접 영향)
4. 하단 네비게이션 개선
5. 헤더 모바일 최적화
