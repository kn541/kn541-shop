'use client'
import type { CSSProperties, ReactNode } from 'react'

interface Props {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  disabled?: boolean
  fullWidth?: boolean
  type?: 'button' | 'submit' | 'reset'
  style?: CSSProperties   // 외부 레이아웃 제어용 (flex, width 등)
}

export default function BigButton({
  children,
  onClick,
  variant = 'primary',
  disabled,
  fullWidth,
  type = 'button',
  style,
}: Props) {
  const variantStyles = {
    primary:   { bg: 'var(--mp-color-primary)', color: '#fff',              border: 'none' },
    secondary: { bg: '#F5F5F5',                  color: 'var(--mp-color-text)', border: 'none' },
    outline:   { bg: '#fff',                     color: 'var(--mp-color-primary)', border: '2px solid var(--mp-color-primary)' },
  }[variant]

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        height: 'var(--mp-btn-height)',
        minWidth: 120,
        width: fullWidth ? '100%' : undefined,
        background: disabled ? '#E9E9E9' : variantStyles.bg,
        color: disabled ? 'var(--mp-color-text-muted)' : variantStyles.color,
        border: variantStyles.border,
        borderRadius: 'var(--mp-radius)',
        fontSize: 16,
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style,  // 외부 style 오버레이 (flex 등)
      }}
    >
      {children}
    </button>
  )
}
