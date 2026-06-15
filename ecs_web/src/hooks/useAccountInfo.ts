"use client"

import { useEffect, useState, useCallback } from "react"
import { authService } from "@/services/auth.service"
import type { ViewAccountInfoResponse } from "@/types"

interface UseAccountInfoOptions {
  /** Skip the fetch and return the empty state (useful when not authenticated). */
  enabled?: boolean
  /** Auto-refresh interval in ms. Set to 0 to disable. */
  refreshInterval?: number
}

interface UseAccountInfoResult {
  account: ViewAccountInfoResponse | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const decodeCodeMessage = (raw: string | undefined): string => {
  if (!raw) return "UNKNOWN_ERROR"
  return raw
}

/**
 * Reads the authenticated user's account info from GET /api/v1/auth/me.
 * Does NOT touch the patient medical record or profile - strictly account-level data.
 *
 * Implementation note: we deliberately call the API with `fetch` and
 * `withCredentials: true` so that the request is NOT routed through the
 * global axios client. The axios response interceptor historically
 * hard-redirected to /login on 401, which would have bounced users out of
 * the page even when the 401 was transient (token near expiry, CORS
 * preflight race, etc). Using fetch keeps the failure isolated to this
 * hook and lets the UI show a recoverable error.
 */
export function useAccountInfo(options: UseAccountInfoOptions = {}): UseAccountInfoResult {
  const { enabled = true, refreshInterval = 0 } = options

  const [account, setAccount] = useState<ViewAccountInfoResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(enabled)
  const [error, setError] = useState<string | null>(null)

  const fetchAccount = useCallback(async () => {
    const token = authService.getToken()
    if (!token) {
      setAccount(null)
      setIsLoading(false)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "https://localhost:7070/api/v1"

      const response = await fetch(`${baseUrl}/auth/me`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        // Don't blow away local auth on a 401 here - the surrounding layout
        // and AccountHeader will redirect on hard logout. We just surface
        // a friendly error so the user can retry.
        if (response.status === 401) {
          setError("UNAUTHENTICATED")
          setAccount(null)
          return
        }

        let codeMessage = "APP_MESSAGE_5000"
        try {
          const errBody = (await response.json()) as { codeMessage?: string }
          codeMessage = errBody.codeMessage || codeMessage
        } catch {
          // ignore body parse errors
        }
        setError(decodeCodeMessage(codeMessage))
        setAccount(null)
        return
      }

      const payload = (await response.json()) as {
        codeMessage?: string
        data?: ViewAccountInfoResponse
      }

      if (payload.data) {
        setAccount(payload.data)
      } else {
        setError(payload.codeMessage || "UNKNOWN_ERROR")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "UNKNOWN_ERROR"
      setError(message)
      // Keep previous account on network errors so the UI doesn't flash empty.
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false)
      return
    }
    fetchAccount()
  }, [enabled, fetchAccount])

  useEffect(() => {
    if (!enabled || refreshInterval <= 0) return
    const interval = setInterval(fetchAccount, refreshInterval)
    return () => clearInterval(interval)
  }, [enabled, refreshInterval, fetchAccount])

  return { account, isLoading, error, refetch: fetchAccount }
}
