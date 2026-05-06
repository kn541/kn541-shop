/**
 * Phase 5 — 디자인 public/img → 동적(WebP 임시) + 정적(public/images/main-v1)
 * 실행: node scripts/optimize-main-v1-images.mjs '/path/to/public/img'
 * 리포트는 stdout(JSON). 진행 로그는 stderr.
 */
import { copyFile, mkdir, readdir } from 'fs/promises'
import { join, dirname, parse, relative } from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT_DYNAMIC = join(ROOT, '_temp_dynamic')
const OUT_STATIC = join(ROOT, 'public/images/main-v1')

/** 선행 매칭 (위에서부터 첫 일치) */
const RULES = [
  { match: /^banner-box\.png$/i, type: 'dynamic', subdir: 'banners', maxWidth: 1920, quality: 80 },
  { match: /^banner-clock\.png$/i, type: 'dynamic', subdir: 'banners', quality: 90 },
  { match: /^(banner-gift|mobile-banner-gift)\.png$/i, type: 'dynamic', subdir: 'banners', quality: 90 },
  { match: /^hero(-mo)?-\d+\.png$/i, type: 'dynamic', subdir: 'heroes', quality: 85 },
  { match: /^best-\d+\.png$/i, type: 'dynamic', subdir: 'featured', quality: 85 },
  { match: /^figma-card-.+\.png$/i, type: 'dynamic', subdir: 'featured', maxWidth: 1200, quality: 85 },
  { match: /^cate-.+\.png$/i, type: 'dynamic', subdir: 'categories', quality: 90 },
  { match: /^product-\d+\.png$/i, type: 'dynamic', subdir: 'products', maxWidth: 1200, quality: 85 },
  { match: /^value-panel\.png$/i, type: 'dynamic', subdir: 'decorations', quality: 90 },
  { match: /^icon-.+\.svg$/i, type: 'static', subdir: 'icons', copyOnly: true },
  { match: /^icon-.+\.png$/i, type: 'static', subdir: 'icons', quality: 90 },
  { match: /^logo\.svg$/i, type: 'static', subdir: '', copyOnly: true },
  { match: /^logo-footer\.svg$/i, type: 'static', subdir: '', copyOnly: true },
  { match: /^logo\.png$/i, type: 'static', subdir: '', quality: 90 },
  { match: /^logo-footer\.png$/i, type: 'static', subdir: '', quality: 90 },
  { match: /^flag-.+\.png$/i, type: 'static', subdir: 'flags', copyOnly: true },
]

function baseFor(type) {
  return type === 'dynamic' ? OUT_DYNAMIC : OUT_STATIC
}

const INPUT = process.argv[2]
if (!INPUT) {
  console.error('Usage: node scripts/optimize-main-v1-images.mjs <input-img-dir>')
  process.exit(1)
}

const files = await readdir(INPUT)
const report = []
let skipped = []

for (const file of files) {
  const rule = RULES.find((r) => r.match.test(file))
  if (!rule) {
    skipped.push(file)
    continue
  }

  const { name } = parse(file)
  const inputPath = join(INPUT, file)
  const outDir = join(baseFor(rule.type), rule.subdir)
  await mkdir(outDir, { recursive: true })

  if (rule.copyOnly) {
    const outPath = join(outDir, file)
    await copyFile(inputPath, outPath)
    report.push({
      in: file,
      out: relative(ROOT, outPath),
      type: rule.type,
      action: 'copy',
    })
    continue
  }

  const outPath = join(outDir, `${name}.webp`)
  let pipeline = sharp(inputPath)
  if (rule.maxWidth) {
    pipeline = pipeline.resize(rule.maxWidth, null, { withoutEnlargement: true })
  }
  await pipeline.webp({ quality: rule.quality }).toFile(outPath)
  report.push({
    in: file,
    out: relative(ROOT, outPath),
    type: rule.type,
    action: 'webp',
    quality: rule.quality,
  })
}

if (skipped.length) {
  console.error('SKIP (no rule):', skipped.join(', '))
}

process.stdout.write(
  JSON.stringify(
    {
      inputDir: INPUT,
      processed: report.length,
      skipped,
      items: report,
      bytesIn: null,
      note: 'bytesIn: run du -sh on input dir separately if needed',
    },
    null,
    2,
  ),
)
