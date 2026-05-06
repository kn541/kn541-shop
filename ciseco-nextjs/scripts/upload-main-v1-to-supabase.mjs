/**
 * Phase 5 일회성 — _temp_dynamic → Supabase Storage app/shop-main/
 * 사용: ciseco-nextjs 루트에서 실행 (node scripts/upload-main-v1-to-supabase.mjs)
 * 인증: .env.local 의 NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (커밋 금지)
 */
import { createClient } from '@supabase/supabase-js'
import { readdir } from 'fs/promises'
import { readFile } from 'fs/promises'
import { existsSync, readFileSync } from 'fs'
import { join, relative } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

function loadEnvLocal() {
  const p = join(ROOT, '.env.local')
  if (!existsSync(p)) return
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
}

loadEnvLocal()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (set in .env.local, not committed).',
  )
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const LOCAL_ROOT = join(ROOT, '_temp_dynamic')
const BUCKET = 'app'
const PREFIX = 'shop-main'

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(path)
    else yield path
  }
}

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
      : 'application/octet-stream'

  const { error } = await supabase.storage.from(BUCKET).upload(remotePath, buf, {
    contentType,
    upsert: true,
  })

  if (error) {
    console.error('FAIL:', remotePath, error.message)
    report.push({ remotePath, status: 'fail', error: error.message })
    fail++
  } else {
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${remotePath}`
    report.push({ remotePath, status: 'ok', url: publicUrl })
    ok++
  }
}

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
