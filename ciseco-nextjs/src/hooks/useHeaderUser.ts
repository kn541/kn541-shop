'use client'

import {
  clearHeaderUserCache,
  greetingFromMePayload,
  readCachedHeaderGreeting,
} from '@/lib/auth/headerUser'
import { useCallback, useEffect, useState } from 'react'

const BASE = process.env.NEXT_PUBLIC_API_URL

export function useHeaderUser() {
  const [isMounted, setIsMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [greeting, setGreeting] = useState<string | null>(null)

  const clearUser = useCallback(() => {
    clearHeaderUserCache()
    setIsLoggedIn(false)
    setGreeting(null)
  }, [])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const token = localStorage.getItem('access_token')
    if (!token) {
      clearUser()
      setLoading(false)
      return
    }

    setIsLoggedIn(true)
    const cached = readCachedHeaderGreeting()
    if (cached) setGreeting(cached)

    if (!BASE) {
      setLoading(false)
      return
    }

    let cancelled = false
    fetch(`${BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (cancelled) return
        if (json?.data) {
          setGreeting(greetingFromMePayload(json.data as Record<string, unknown>))
          setIsLoggedIn(true)
        } else {
          clearUser()
        }
      })
      .catch(() => {
        if (!cancelled && !cached) clearUser()
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [isMounted, clearUser])

  return { isMounted, loading, isLoggedIn, greeting, clearUser }
}
