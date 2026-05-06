/**
 * Phase 5 일회성 — _temp_dynamic → Supabase Storage app/shop-main/
 *
 * 환경변수 자동 주입 우선순위:
 *   1. 이미 process.env에 있음 (인라인 export 등)
 *   2. ciseco-nextjs/.env.local 파일
 *   3. Railway CLI (railway run으로 자동 재실행)
 *
 * 사용 (한 줄):
 *   cd ciseco-nextjs && node scripts/upload-main-v1-to-supabase.mjs > upload-report.json
 *
 * 받는 변수명 (URL):  NEXT_PUBLIC_SUPABASE_URL  또는  SUPABASE_URL
 * 받는 변수명 (KEY):  SUPABASE_SERVICE_ROLE_KEY  또는  SUPABASE_SERVICE_KEY  또는  SUPABASE_KEY
 *   ⚠️  anon key (SUPABASE_ANON_KEY)로는 Storage 업로드가 RLS에 의해 차단될 수 있음.
 *
 * Railway CLI 사전 준비 (1회만):
 *   brew install railway && railway login && railway link  (kn541 backend 프로젝트 선택)
 */
import { createClient } from '@supabase/supabase-js'
import { readdir, readFile } from 'fs/promises'
import { existsSync, readFileSync } from 'fs'
import { join, relative, dirname } from 'path'
import { fileURLToPath } from 'url'
import { spawnSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// === 1. .env.local 로드 ===
function loadEnvLocal() {
  const p = join(ROOT, '.env.local')
  if (!existsSync(p)) return false
  const text = readFileSync(p, 'utf8')
  for (const line of text.split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i === -1) continue
    const k = t.slice(0, i).trim()
    let v = t.slice(i + 1).trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
      v = v.slice(1, -1)
    if (process.env[k] === undefined) process.env[k] = v
  }
  return true
}

// === 2. 환경변수 폴리필 (Railway / Vercel / .env.local 어디 들어있든) ===
function getEnvVars() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_KEY
  return { url, key }
}

// === 3. Railway CLI로 자동 재실행 ===
function relaunchViaRailway() {
  console.error('🚂 환경변수 누락 — Railway CLI로 자동 주입 시도 중...')
  const scriptPath = fileURLToPath(import.meta.url)
  const result = spawnSync('railway', ['run', '--', 'node', scriptPath], {
    stdio: 'inherit',
    env: { ...process.env, _RAILWAY_RELAUNCHED: '1' },
  })
  if (result.error) {
    console.error('\n❌ Railway CLI 실행 실패:', result.error.message)
    console.error('\n해결 방법 중 하나:')
    console.error('  A. Railway CLI 설치 + 연결 (1회만)')
    console.error('     brew install railway')
    console.error('     railway login')
    console.error('     railway link    # kn541 backend 프로젝트 선택')
    console.error('     그 다음 다시: node scripts/upload-main-v1-to-supabase.mjs')
    console.error('')
    console.error('  B. 환경변수 직접 지정 (1회용)')
    console.error('     NEXT_PUBLIC_SUPABASE_URL="https://...supabase.co" \\')
    console.error('     SUPABASE_SERVICE_ROLE_KEY="<service_role 키>" \\')
    console.error('       node scripts/upload-main-v1-to-supabase.mjs')
    console.error('')
    console.error('  C. .env.local 파일 작성')
    console.error('     ciseco-nextjs/.env.local 에 위 두 변수 추가')
    process.exit(1)
  }
  process.exit(result.status ?? 1)
}

// === 진입 ===
loadEnvLocal()

let env = getEnvVars()

// .env.local 후에도 누락 + 아직 Railway 재실행 안 한 경우 → 재실행
if ((!env.url || !env.key) && !process.env._RAILWAY_RELAUNCHED) {
  relaunchViaRailway()
}

// Railway 재실행 후에도 누락 → 명확한 에러
if (!env.url || !env.key) {
  console.error('❌ 환경변수 누락 (Railway에도 없음):')
  console.error(`   URL  (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_URL): ${env.url ? '✅' : '❌'}`)
  console.error(`   KEY  (SUPABASE_SERVICE_ROLE_KEY / SERVICE_KEY / KEY): ${env.key ? '✅' : '❌'}`)
  console.error('\nRailway 변수 확인: railway variables')
  console.error('Supabase service_role 키 발급:')
  console.error('  https://supabase.com/dashboard/project/vwlahtguyggrhvslabax/settings/api')
  process.exit(1)
}

// 사용 키 종류 안내
const keyName = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? 'SUPABASE_SERVICE_ROLE_KEY ✅ service_role'
  : process.env.SUPABASE_SERVICE_KEY
    ? 'SUPABASE_SERVICE_KEY'
    : 'SUPABASE_KEY ⚠️  이 값이 anon key라면 Storage 업로드가 RLS로 차단될 수 있음'

console.error(`🔑 키: ${keyName}`)
console.error(`🔗 URL: ${env.url}`)

// === 업로드 로직 ===
const supabase = createClient(env.url, env.key, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const LOCAL_ROOT = join(ROOT, '_temp_dynamic')
const BUCKET = 'app'
const PREFIX = 'shop-main'

if (!existsSync(LOCAL_ROOT)) {
  console.error(`❌ 입력 폴더 없음: ${LOCAL_ROOT}`)
  console.error('변환 스크립트를 먼저 실행하세요:')
  console.error(
    "  node scripts/optimize-main-v1-images.mjs '/Users/kn541/Desktop/kn541/디자인/외주/public/img'",
  )
  process.exit(1)
}

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(path)
    else yield path
  }
}

console.error(`📦 업로드 시작 — bucket: ${BUCKET}, prefix: ${PREFIX}/`)

const report = []
let ok = 0
let fail = 0

for await (const localPath of walk(LOCAL_ROOT)) {
  const relPath = relative(LOCAL_ROOT, localPath).split('\\').join('/')
  const remotePath = `${PREFIX}/${relPath}`
  const buf = await readFile(localPath)
  const ext = localPath.toLowerCase()
  const contentType = ext.endsWith('.webp')
    ? 'image/webp'
    : ext.endsWith('.png')
      ? 'image/png'
      : ext.endsWith('.svg')
        ? 'image/svg+xml'
        : 'application/octet-stream'

  const { error } = await supabase.storage.from(BUCKET).upload(remotePath, buf, {
    contentType,
    upsert: true,
  })

  if (error) {
    console.error(`❌ ${remotePath}: ${error.message}`)
    report.push({ remotePath, status: 'fail', error: error.message })
    fail++
  } else {
    const publicUrl = `${env.url}/storage/v1/object/public/${BUCKET}/${remotePath}`
    report.push({ remotePath, status: 'ok', url: publicUrl })
    ok++
    if (ok % 10 === 0) console.error(`  ${ok}건 업로드 완료...`)
  }
}

console.error('')
console.error(`✅ 성공 ${ok}건 / ❌ 실패 ${fail}건`)
if (fail === 0 && ok > 0) {
  console.error('🎉 모든 업로드 성공')
  console.error('샘플 URL 5건:')
  report.slice(0, 5).forEach((r) => console.error(`  ${r.url}`))
}

// stdout으로 JSON 보고서 (> upload-report.json 리디렉션용)
process.stdout.write(
  JSON.stringify(
    {
      bucket: BUCKET,
      prefix: PREFIX,
      ok,
      fail,
      items: report,
    },
    null,
    2,
  ),
)
