'use client'

import { Button } from '@/shared/Button/Button'
import {
  Dialog,
  DialogActions,
  DialogDescription,
  DialogTitle,
} from '@/shared/dialog'
import { useState } from 'react'

export type ConfirmDeleteDialogProps = {
  open: boolean
  onClose: () => void
  /** 삭제 실행 (실패 시 throw — 다이얼로그 유지) */
  onConfirm: () => void | Promise<void>
  /** 접근성용 제목 (기본: 본문과 동일 문구) */
  title?: string
  message?: string
  cancelLabel?: string
  confirmLabel?: string
}

/**
 * 삭제 전 확인 — 장바구니·찜·배송지 등 공통 사용
 */
export function ConfirmDeleteDialog({
  open,
  onClose,
  onConfirm,
  title = '정말 삭제하시겠습니까?',
  message,
  cancelLabel = '취소',
  confirmLabel = '삭제',
}: ConfirmDeleteDialogProps) {
  const [busy, setBusy] = useState(false)

  const handleConfirm = async () => {
    setBusy(true)
    try {
      await onConfirm()
      onClose()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog
      size="sm"
      open={open}
      onClose={() => {
        if (!busy) onClose()
      }}
    >
      <DialogTitle>{title}</DialogTitle>
      {message ? <DialogDescription>{message}</DialogDescription> : null}
      <DialogActions>
        <Button type="button" size="smaller" plain onClick={onClose} disabled={busy}>
          {cancelLabel}
        </Button>
        <Button type="button" size="smaller" color="red" onClick={() => void handleConfirm()} disabled={busy}>
          {busy ? '처리 중…' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
