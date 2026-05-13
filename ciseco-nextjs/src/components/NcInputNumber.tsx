'use client'

import { MinusIcon, PlusIcon } from '@heroicons/react/24/solid'
import { FC, useCallback, useEffect, useState } from 'react'

interface Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'defaultValue'> {
  defaultValue?: number
  min?: number
  max?: number
  onChange?: (value: number) => void
  label?: string
  description?: string
  className?: string
}

function clamp(n: number, min: number, max: number | undefined): number {
  let x = Math.trunc(n)
  if (!Number.isFinite(x)) x = min
  x = Math.max(min, x)
  if (max != null && Number.isFinite(max)) x = Math.min(max, x)
  return x
}

const NcInputNumber: FC<Props> = ({
  className = '',
  defaultValue = 1,
  min = 1,
  max: maxProp,
  onChange,
  label,
  description,
  name,
  id,
  'aria-label': ariaLabel,
  disabled,
  ...rest
}) => {
  /** 미지정 시 기존과 동일하게 99 상한 (데모 상품 폼 등) */
  const max = maxProp ?? 99
  const maxCap = max >= min ? max : undefined

  const [value, setValue] = useState(() => clamp(defaultValue, min, maxCap))
  /** 포커스 중 빈 칸·중간 입력 허용 */
  const [draft, setDraft] = useState<string | null>(null)

  useEffect(() => {
    setValue(clamp(defaultValue, min, maxCap))
  }, [defaultValue, min, maxCap])

  const commit = useCallback(
    (raw: number) => {
      const c = clamp(raw, min, maxCap)
      setValue(c)
      onChange?.(c)
      return c
    },
    [min, maxCap, onChange]
  )

  const dec = () => {
    if (disabled) return
    commit(value - 1)
  }

  const inc = () => {
    if (disabled) return
    commit(value + 1)
  }

  const display = draft !== null ? draft : String(value)

  return (
    <div className={`flex items-center justify-between gap-x-5 ${className}`}>
      {label && (
        <div className="flex flex-col">
          <span className="font-medium text-neutral-800 dark:text-neutral-200">{label}</span>
          {description && (
            <span className="text-xs font-normal text-neutral-500 dark:text-neutral-400">{description}</span>
          )}
        </div>
      )}
      <div className="flex min-w-[9rem] items-center justify-between gap-1 sm:min-w-[10rem]">
        <button
          className="flex size-8 shrink-0 items-center justify-center rounded-full border border-neutral-400 bg-white hover:border-neutral-700 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-neutral-400 dark:border-neutral-500 dark:bg-neutral-900 dark:hover:border-neutral-400 dark:disabled:hover:border-neutral-500"
          type="button"
          onClick={dec}
          disabled={disabled || value <= min}
          aria-label="수량 감소"
        >
          <MinusIcon className="size-4" />
        </button>

        <input
          {...rest}
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          disabled={disabled}
          aria-label={ariaLabel ?? '수량'}
          className="min-w-0 w-10 flex-1 border-0 bg-transparent text-center text-sm font-medium text-neutral-900 tabular-nums outline-none focus:ring-0 disabled:opacity-50 dark:text-white"
          value={display}
          onFocus={() => setDraft(String(value))}
          onBlur={(e) => {
            setDraft(null)
            const raw = e.target.value.replace(/[^\d]/g, '')
            if (raw === '') {
              commit(min)
              return
            }
            const n = parseInt(raw, 10)
            commit(Number.isNaN(n) ? min : n)
          }}
          onChange={(e) => {
            if (disabled) return
            const s = e.target.value.replace(/[^\d]/g, '')
            setDraft(s)
            if (s === '') return
            const n = parseInt(s, 10)
            if (Number.isNaN(n)) return
            const c = clamp(n, min, maxCap)
            setValue(c)
            onChange?.(c)
          }}
        />

        {name ? <input type="hidden" name={name} value={value} readOnly /> : null}

        <button
          className="flex size-8 shrink-0 items-center justify-center rounded-full border border-neutral-400 bg-white hover:border-neutral-700 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-neutral-400 dark:border-neutral-500 dark:bg-neutral-900 dark:hover:border-neutral-400 dark:disabled:hover:border-neutral-500"
          type="button"
          onClick={inc}
          disabled={disabled || (maxCap != null && value >= maxCap)}
          aria-label="수량 증가"
        >
          <PlusIcon className="size-4" />
        </button>
      </div>
    </div>
  )
}

export default NcInputNumber
