// KN541 서버측 "느슨(LOOSE)" HTML 새니타이저 (sanitize-html · jsdom 비의존)
// 정책: docs/KN541_새니타이즈_정책.md §4 — 내부/승인 콘텐츠(공지·상품설명/KMC)용.
// 레이아웃(style/class/table/font 등) 보존 + 스크립트성만 제거. 서버 컴포넌트 전용.
// 외부 소비자 콘텐츠(리뀑 등)는 강함(sanitizeHtmlServer.ts) 사용.
import sanitizeHtmlLib from 'sanitize-html'

const STRICT_TAGS = [
  'p', 'br', 'h1', 'h2', 'h3', 'h4', 'strong', 'b', 'em', 'i', 'u', 's',
  'span', 'blockquote', 'code', 'pre', 'ul', 'ol', 'li', 'a', 'img', 'hr',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
]
const LOOSE_EXTRA = [
  'div', 'small', 'sub', 'sup', 'mark', 'dl', 'dt', 'dd', 'figure', 'figcaption',
  'center', 'font', 'section', 'article', 'header', 'footer', 'h5', 'h6',
]
const ALLOWED_TAGS = Array.from(new Set([...STRICT_TAGS, ...LOOSE_EXTRA]))

const GLOBAL_ATTRS = ['style', 'class', 'id', 'align', 'valign', 'title', 'dir', 'width', 'height']
const TABLE_ATTRS = ['border', 'cellpadding', 'cellspacing', 'colspan', 'rowspan', 'bgcolor', 'valign']

// style 값 위험구문 무력화 (정책 §4): expression( · javascript: · vbscript: · behavior · -moz-binding
function scrubStyle(style: string): string {
  return style
    .split(';')
    .filter((decl) => {
      const v = decl.toLowerCase()
      return !(
        v.includes('expression(') ||
        v.includes('javascript:') ||
        v.includes('vbscript:') ||
        v.includes('behavior') ||
        v.includes('-moz-binding')
      )
    })
    .join(';')
}

const options: sanitizeHtmlLib.IOptions = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: {
    '*': GLOBAL_ATTRS,
    a: ['href', 'title', 'target', 'rel', 'name', ...GLOBAL_ATTRS],
    img: ['src', 'alt', 'width', 'height', 'style', 'class', 'loading'],
    table: [...GLOBAL_ATTRS, ...TABLE_ATTRS],
    thead: [...GLOBAL_ATTRS, ...TABLE_ATTRS],
    tbody: [...GLOBAL_ATTRS, ...TABLE_ATTRS],
    tr: [...GLOBAL_ATTRS, ...TABLE_ATTRS],
    td: [...GLOBAL_ATTRS, ...TABLE_ATTRS],
    th: [...GLOBAL_ATTRS, ...TABLE_ATTRS],
    font: ['color', 'size', 'face', 'style', 'class', 'id'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: { a: ['http', 'https', 'mailto'], img: ['http', 'https'] },
  allowedSchemesAppliedToAttributes: ['href', 'src'],
  allowProtocolRelative: false,
  disallowedTagsMode: 'discard',
  // 스크립트성 태그는 내부 텍스트까지 제거
  nonTextTags: [
    'script', 'style', 'textarea', 'noscript', 'iframe', 'object', 'embed',
    'form', 'input', 'button', 'select', 'svg', 'math', 'link', 'meta', 'base',
  ],
  transformTags: {
    a: (tagName, attribs) => {
      if (attribs.target === '_blank') attribs.rel = 'noopener noreferrer'
      if (attribs.style) attribs.style = scrubStyle(attribs.style)
      return { tagName, attribs }
    },
  },
}

export function sanitizeLooseHtmlServer(html: string): string {
  if (!html) return ''
  let out = sanitizeHtmlLib(html, options)
  // 보조 방어: 남은 style 내 위험구문 정규식 후처리(정책 §4 허용)
  out = out.replace(/style="([^"]*)"/gi, (_m, s) => `style="${scrubStyle(s)}"`)
  return out
}

export default sanitizeLooseHtmlServer
