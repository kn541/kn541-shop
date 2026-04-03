'use client'

import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { MinusIcon, PlusIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

interface FaqItem {
  id: number
  category: string
  question: string
  answer: string
  sort_order: number
}

interface Props {
  shopFaqs: FaqItem[]
  memberFaqs: FaqItem[]
  scmFaqs: FaqItem[]
}

type TabKey = 'all' | 'shop' | 'member' | 'scm'

const TABS: { key: TabKey; label: string; emoji: string }[] = [
  { key: 'all', label: '전체', emoji: '📝' },
  { key: 'shop', label: '쓼핑몰', emoji: '🛍️' },
  { key: 'member', label: '회원', emoji: '👤' },
  { key: 'scm', label: '공급사(SCM)', emoji: '🏭' },
]

export default function FaqClient({ shopFaqs, memberFaqs, scmFaqs }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const [search, setSearch] = useState('')

  // 탭별 데이터 매핑
  const tabData: Record<TabKey, FaqItem[]> = {
    all: [...shopFaqs, ...memberFaqs, ...scmFaqs],
    shop: shopFaqs,
    member: memberFaqs,
    scm: scmFaqs,
  }

  const allFaqs = tabData[activeTab]

  // 카테고리 목록 추출 (순서 유지)
  const categories = Array.from(new Set(allFaqs.map((f) => f.category)))

  // 검색 필터
  const filtered = search.trim()
    ? allFaqs.filter(
        (f) =>
          f.question.includes(search) ||
          f.answer.includes(search) ||
          f.category.includes(search)
      )
    : allFaqs

  // 카테고리별 그룹화
  const grouped = categories.reduce<Record<string, FaqItem[]>>((acc, cat) => {
    acc[cat] = filtered.filter((f) => f.category === cat)
    return acc
  }, {})

  const handleTabChange = (key: TabKey) => {
    setActiveTab(key)
    setSearch('')
  }

  return (
    <div className="pb-16 pt-12 lg:pb-28 lg:pt-16">
      <div className="container mx-auto max-w-4xl">

        {/* ── 헤더 ── */}
        <div className="mb-10 text-center">
          <div className="mb-4 flex justify-center">
            <QuestionMarkCircleIcon className="h-12 w-12 text-primary-600" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            자주 묻는 질문
          </h1>
          <p className="mt-4 text-neutral-500 dark:text-neutral-400">
            궁금한 점을 클릭해서 답변을 확인하세요.
          </p>
        </div>

        {/* ── 검색 ── */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="질문 또는 키워드로 검색하세요..."
              className="w-full rounded-2xl border border-neutral-200 bg-white py-4 pl-5 pr-12 text-sm shadow-sm outline-none placeholder:text-neutral-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* ── 탭 ── */}
        <div className="mb-8 flex flex-wrap gap-1 border-b border-neutral-200 dark:border-neutral-700">
          {TABS.map((tab) => {
            const count = tabData[tab.key].length
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`flex items-center gap-1.5 px-5 py-3 text-sm font-semibold transition-all ${
                  activeTab === tab.key
                    ? 'border-b-2 border-primary-600 text-primary-600'
                    : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
                }`}
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    activeTab === tab.key
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* ── 검색 결과 없음 ── */}
        {search && filtered.length === 0 && (
          <div className="py-16 text-center text-neutral-400">
            <p className="text-lg">‘{search}’ 관련 FAQ를 찾을 수 없습니다.</p>
            <p className="mt-2 text-sm">다른 키워드로 검색해보세요.</p>
          </div>
        )}

        {/* ── 카테고리별 아코디언 ── */}
        <div className="flex flex-col gap-10">
          {categories.map((category) => {
            const items = grouped[category]
            if (!items || items.length === 0) return null

            return (
              <section key={category}>
                {/* 카테고리 제목 */}
                <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-neutral-900 dark:text-neutral-100">
                  <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
                  <span className="shrink-0 rounded-full bg-primary-50 px-4 py-1 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                    {category}
                  </span>
                  <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
                </h2>

                {/* 아코디언 목록 */}
                <div className="space-y-2">
                  {items.map((faq, idx) => (
                    <Disclosure key={faq.id || idx}>
                      {({ open }) => (
                        <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm transition hover:shadow dark:border-neutral-700 dark:bg-neutral-800">
                          <DisclosureButton className="flex w-full items-start gap-4 px-6 py-5 text-left focus:outline-none">
                            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                              Q
                            </span>
                            <span className="flex-1 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                              {faq.question}
                            </span>
                            <span className="mt-0.5 shrink-0 text-neutral-400">
                              {open
                                ? <MinusIcon className="h-4 w-4" />
                                : <PlusIcon className="h-4 w-4" />}
                            </span>
                          </DisclosureButton>

                          <DisclosurePanel>
                            <div className="flex gap-4 border-t border-neutral-100 px-6 py-5 dark:border-neutral-700">
                              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-500 dark:bg-neutral-700 dark:text-neutral-300">
                                A
                              </span>
                              <p className="flex-1 whitespace-pre-line text-sm leading-7 text-neutral-600 dark:text-neutral-400">
                                {faq.answer}
                              </p>
                            </div>
                          </DisclosurePanel>
                        </div>
                      )}
                    </Disclosure>
                  ))}
                </div>
              </section>
            )
          })}
        </div>

        {/* ── 하단 고객센터 유도 ── */}
        <div className="mt-16 rounded-3xl bg-neutral-50 px-8 py-10 text-center dark:bg-neutral-800">
          <p className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
            원하는 답변을 찾지 못하셨나요?
          </p>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            1:1 문의를 남겨주시면 빠르게 답변드리겠습니다.
          </p>
          <a
            href="/ko/contact"
            className="mt-6 inline-flex items-center rounded-full bg-neutral-900 px-8 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            1:1 문의하기
          </a>
        </div>

      </div>
    </div>
  )
}
