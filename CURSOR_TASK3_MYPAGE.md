# KN541 Cursor 작업지시서 — TASK 3: 마이페이지 기능 보강

**긴급도: 🟡 중요**
**작업 도구: Cursor (kn541-shop 레포)**
**작성일: 2026-04-27**
**선행조건: TASK 1 완료 후 진행**

---

## 개요

쇼핑몰 마이페이지(accounts)에 위시리스트, SNS 공유, 상품 Q&A 기능을 추가합니다.

## TASK 3-1: 위시리스트 (찜 기능)

**DB:** wishlists 테이블 이미 존재

**백엔드 API (이미 배포 완료):**
| Method | 경로 | 기능 |
|--------|------|------|
| GET | /mypage/wishlists | 내 위시리스트 목록 |
| POST | /mypage/wishlists | 위시리스트 추가 |
| DELETE | /mypage/wishlists/{product_id} | 위시리스트 삭제 |

**프론트엔드 작업:**
1. 상품 상세 페이지에 하트(♥) 버튼 추가
   - 클릭 시 POST /mypage/wishlists → 토글 방식
   - 이미 찜한 상품은 빨간 하트 표시
2. 마이페이지 > 위시리스트 탭
   - GET /mypage/wishlists 목록 표시
   - 상품 카드 그리드 + 삭제 버튼

## TASK 3-2: SNS 공유 버튼

**프론트엔드만 작업 (백엔드 불필요):**
1. 상품 상세 페이지에 공유 버튼 추가
2. 클릭 시 공유 옵션: 카카오톡 / URL 복사 / 네이버 블로그
3. Web Share API 지원 시 네이티브 공유 시트 표시
4. 공유 URL: `shop.kn541.co.kr/ko/products/{slug}`

```typescript
// Web Share API
if (navigator.share) {
  await navigator.share({ title: product.name, url: window.location.href })
} else {
  // fallback: URL 복사
  navigator.clipboard.writeText(window.location.href)
  toast.success('링크가 복사되었습니다')
}
```

## TASK 3-3: 상품 Q&A

**백엔드 API (이미 배포 완료):**
| Method | 경로 | 기능 |
|--------|------|------|
| GET | /products/{id}/qna | 상품 Q&A 목록 |
| POST | /products/{id}/qna | Q&A 작성 |

**프론트엔드 작업:**
1. 상품 상세 페이지 하단에 Q&A 탭 추가
2. 질문 목록 표시 (아코디언 형태)
3. 질문 작성 폼 (로그인 필수)
4. 답변은 어드민에서 작성 (소비자에게는 읽기 전용)

## 주의사항
- 모든 API 호출 시 401 → /login 리다이렉트 처리
- toast 메시지 사용 (alert 금지)
- 반응형 디자인 (PC/태블릿/모바일)
