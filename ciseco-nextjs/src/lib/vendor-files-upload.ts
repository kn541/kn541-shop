import { createClient } from '@supabase/supabase-js'

const BUCKET = 'vendor-files'
const MAX_BYTES = 10 * 1024 * 1024
const ALLOWED_MIME = new Set(['application/pdf', 'image/jpeg', 'image/png'])

function extensionOk(name: string): boolean {
  const lower = name.toLowerCase()
  return (
    lower.endsWith('.pdf') ||
    lower.endsWith('.jpg') ||
    lower.endsWith('.jpeg') ||
    lower.endsWith('.png')
  )
}

/** @returns 오류 메시지 또는 null (유효) */
export function validateVendorUploadFile(file: File): string | null {
  if (file.size > MAX_BYTES) {
    return '파일 크기는 최대 10MB까지 업로드할 수 있습니다.'
  }
  const mimeOk = file.type ? ALLOWED_MIME.has(file.type) : false
  if (!mimeOk && !extensionOk(file.name)) {
    return 'PDF, JPG, PNG 파일만 업로드할 수 있습니다.'
  }
  return null
}

function safeFileSegment(name: string): string {
  const base = name.replace(/[^a-zA-Z0-9._-가-힣]/g, '_')
  return (base.length ? base : 'file').slice(0, 120)
}

/**
 * Supabase Storage `vendor-files` 버킷에 업로드하고 공개 URL 반환.
 */
export async function uploadVendorFileToStorage(file: File): Promise<string> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl?.trim() || !supabaseAnonKey?.trim()) {
    throw new Error('SUPABASE_ENV_MISSING')
  }

  const localErr = validateVendorUploadFile(file)
  if (localErr) {
    throw new Error(localErr)
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const fileName = `vendor/${Date.now()}_${safeFileSegment(file.name)}`
  const { error } = await supabase.storage.from(BUCKET).upload(fileName, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) {
    throw new Error(error.message || '파일 업로드에 실패했습니다.')
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(fileName)
  return publicUrl
}
