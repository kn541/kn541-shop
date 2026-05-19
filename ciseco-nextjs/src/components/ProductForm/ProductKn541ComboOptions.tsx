'use client'

import clsx from 'clsx'
import type { OptionCombination, OptionGroup } from '@/hooks/useOptionGroups'

interface Props {
  groups: OptionGroup[]
  combinations: OptionCombination[]
  selectedValue1: string
  selectedValue2: string
  onSelectValue1: (id: string) => void
  onSelectValue2: (id: string) => void
  disabled?: boolean
}

export default function ProductKn541ComboOptions({
  groups,
  combinations,
  selectedValue1,
  selectedValue2,
  onSelectValue1,
  onSelectValue2,
  disabled = false,
}: Props) {
  if (groups.length !== 2) return null

  const g1 = groups[0]
  const g2 = groups[1]

  const availableV2 = g2.values.filter(v2 =>
    combinations.some(
      c =>
        c.value1_id === selectedValue1 &&
        c.value2_id === v2.id &&
        c.is_active &&
        c.stock_qty > 0,
    ),
  )

  const selectedCombo =
    selectedValue1 && selectedValue2
      ? combinations.find(
          c => c.value1_id === selectedValue1 && c.value2_id === selectedValue2,
        )
      : undefined

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {g1.group_name}
        </label>
        <select
          className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm dark:border-neutral-600 dark:bg-neutral-900"
          value={selectedValue1}
          disabled={disabled}
          onChange={e => {
            onSelectValue1(e.target.value)
            onSelectValue2('')
          }}
        >
          <option value="">선택</option>
          {g1.values.map(v => (
            <option key={v.id} value={v.id}>
              {v.value_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {g2.group_name}
        </label>
        <select
          className={clsx(
            'w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm dark:border-neutral-600 dark:bg-neutral-900',
            !selectedValue1 && 'cursor-not-allowed opacity-50',
          )}
          value={selectedValue2}
          disabled={disabled || !selectedValue1}
          onChange={e => onSelectValue2(e.target.value)}
        >
          <option value="">선택</option>
          {availableV2.map(v => (
            <option key={v.id} value={v.id}>
              {v.value_name}
            </option>
          ))}
        </select>
      </div>

      {selectedCombo && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          추가금액: +{Number(selectedCombo.add_price).toLocaleString('ko-KR')}원
          {' '}| 재고: {selectedCombo.stock_qty.toLocaleString('ko-KR')}개
        </p>
      )}

      {selectedValue1 && availableV2.length === 0 && (
        <p className="text-sm text-amber-700 dark:text-amber-400">
          선택 가능한 {g2.group_name}이 없습니다.
        </p>
      )}
    </div>
  )
}
