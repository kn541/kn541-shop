#!/bin/bash
# middleware.ts 삭제 후 git push
cd /Users/kn541/Desktop/GitHub/kn541-shop/ciseco-nextjs
git pull origin main
rm -f src/middleware.ts
git add -A
git commit -m "fix: middleware.ts 삭제 — Next.js 16에서 proxy.ts와 공존 불가

Next.js 16 빌드 에러: middleware.ts 파일이 존재하면 proxy.ts와 충돌
proxy.ts에 이미 next-intl createMiddleware 설정 완료
middleware.ts를 완전히 삭제하여 빌드 정상화"
git push origin main
