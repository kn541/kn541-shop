'use client'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  disabled?: boolean
  fullWidth?: boolean
  type?: 'button' | 'submit' | 'reset'
}

export default function BigButton({
  children,
  onClick,
  variant = 'primary',
  disabled,
  fullWidth,
  type = 'button',
}: Props) {
  const styles = {
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
        background: disabled ? '#E9E9E9' : styles.bg,
        color: disabled ? 'var(--mp-color-text-muted)' : styles.color,
        border: styles.border,
        borderRadius: 'var(--mp-radius)',
        fontSize: 16,
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {children}
    </button>
  )
}
