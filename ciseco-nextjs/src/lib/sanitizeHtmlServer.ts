// KN541 W1A 서버측 HTML 새니타이저 (sanitize-html · jsdom 비의존)
// 확정 allowlist 적용 — BE core/sanitize · 클라이언트 sanitizeHtml.ts(DOMPurify)와 동일 정책.
// 서버 컴포넌트(async Page) 전용. 클라이언트 싱크(ReviewItem 등)는 sanitizeHtml.ts(DOMPurify) 사용.
import sanitizeHtmlLib from 'sanitize-html'

// 허용 태그 (확정본)
const ALLOWED_TAGS = [
  'p', 'br', 'h1', 'h2', 'h3', 'h4', 'strong', 'b', 'em', 'i', 'u', 's',
  'span', 'blockquote', 'code', 'pre', 'ul', 'ol', 'li', 'a', 'img', 'hr',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
]

const options: sanitizeHtmlLib.IOptions = {
  allowedTags: ALLOWED_TAGS,
  // 속성: a/img 외 태그는 미지정 → 속성 전부 제거(style·class·id 포함)
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height'],
  },
  // URL 스킴: a@href = http·https·mailto / img@src = http·https
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: { a: ['http', 'https', 'mailto'], img: ['http', 'https'] },
  allowedSchemesAppliedToAttributes: ['href', 'src'],
  allowProtocolRelative: false, // // 프로토콜상대 차단
  disallowedTagsMode: 'discard',
  // 내부 텍스트까지 제거(DOMPurify와 동일 거동)
  nonTextTags: ['script', 'style', 'textarea', 'noscript', 'iframe', 'object', 'embed', 'svg', 'math', 'form'],
  transformTags: {
    // a[target=_blank] → rel="noopener noreferrer" 자동 부여
    a: (tagName, attribs) => {
      if (attribs.target === '_blank') {
        attribs.rel = 'noopener noreferrer'
      }
      return { tagName, attribs }
    },
  },
}

// 저장된 HTML을 서버에서 렌더 직전 정화. 항상 호출(분기 없이).
export function sanitizeHtmlServer(html: string): string {
  if (!html) return ''
  return sanitizeHtmlLib(html, options)
}

export default sanitizeHtmlServer
