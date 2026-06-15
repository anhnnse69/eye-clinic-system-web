"use client"

import { useEffect, useRef, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import {
  ChevronDown,
  Loader2,
  LogOut,
  User as UserIcon,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { authService } from "@/services/auth.service"
import { useAccountInfo } from "@/hooks/useAccountInfo"
import { ROLE_CONFIG } from "@/lib/role-config"

interface HomeUserMenuProps {
  /**
   * Override the default account-info href. Defaults to /{locale}/patient/account-info
   * (patient is the only role that lands on the i18n home page).
   */
  accountInfoHref?: string
}

/**
 * i18n-aware avatar + dropdown used in the public Home header.
 *
 * - Unauthenticated: renders the marketing CTAs (Login + Request Demo)
 *   so the page can be served as the entry point of the marketing site.
 * - Authenticated: renders the avatar with a dropdown that includes the
 *   "Account Info" entry and "Log out". The dropdown is closed on outside
 *   click and on route change.
 *
 * Patient-only by design. The other roles (doctor, clinic-admin, etc.)
 * never reach the i18n home page after login (their layouts redirect them
 * to the role-specific dashboard instead).
 */
export default function HomeUserMenu({ accountInfoHref }: HomeUserMenuProps) {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations("common")
  const tAuth = useTranslations("auth")

  const isAuthenticated = authService.isAuthenticated()
  const userFromStorage = authService.getUser()
  const roleFromStorage = userFromStorage?.role

  // Use the dedicated fetch-based hook so a transient /auth/me failure
  // does NOT trigger a hard redirect to /login (see useAccountInfo notes).
  const { account, isLoading, error } = useAccountInfo({
    enabled: isAuthenticated,
  })

  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  // Close dropdown on route change
  useEffect(() => {
    if (!open) return
    setOpen(false)
  }, [router])

  const handleLogin = () => router.push(`/${locale}/login`)
  const handleSignUp = () => router.push(`/${locale}/register`)

  const handleAccountInfo = () => {
    setOpen(false)
    const href = accountInfoHref ?? `/${locale}/patient/account-info`
    router.push(href)
  }

  const handleLogout = async () => {
    setOpen(false)
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch {
      // Ignore server-side errors - we still clear local state.
    } finally {
      authService.clearAuth()
      router.push(`/${locale}/home`)
      router.refresh()
    }
  }

  // Unauthenticated: marketing CTAs
  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-md">
        <button
          onClick={handleLogin}
          className="hidden md:block px-lg py-sm font-label-md text-label-md text-primary border border-primary rounded-lg hover:bg-primary-fixed transition-colors"
        >
          {t("nav.login")}
        </button>
        <button
          onClick={handleSignUp}
          className="px-lg py-sm font-label-md text-label-md bg-primary text-on-primary rounded-lg shadow-sm hover:opacity-90 active:scale-95 transition-all"
        >
          {t("nav.requestDemo")}
        </button>
      </div>
    )
  }

  // Authenticated: avatar + dropdown
  // Prefer server data (account), fall back to JWT-derived user from storage.
  const effectiveRole = account?.role || roleFromStorage || "PATIENT"
  const roleKey = (effectiveRole as string) === "SYSTEM_ADMIN" ? "ADMIN" : effectiveRole
  const config =
    ROLE_CONFIG[roleKey as keyof typeof ROLE_CONFIG] || ROLE_CONFIG.PATIENT

  const displayName = account?.fullName || userFromStorage?.name || t("userMenu.patient")
  const displayInitial = displayName.charAt(0).toUpperCase()
  const avatarUrl = account?.avatarUrl
  const email = account?.email || userFromStorage?.email || ""

  const roleLabel =
    effectiveRole === "PATIENT"
      ? t("userMenu.patient")
      : effectiveRole === "DOCTOR"
        ? tAuth("doctor")
        : effectiveRole === "CLINIC_ADMIN"
          ? tAuth("clinicAdmin")
          : effectiveRole === "RECEPTIONIST"
            ? tAuth("receptionist")
            : tAuth("systemAdmin")

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-sm px-2 py-1 rounded-full hover:bg-surface-container transition-colors"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {isLoading ? (
          <div className="h-9 w-9 rounded-full bg-surface-container flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-on-surface-variant" />
          </div>
        ) : avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="h-9 w-9 rounded-full object-cover border border-outline-variant"
          />
        ) : (
          <div
            className={cn(
              "h-9 w-9 rounded-full flex items-center justify-center font-medium text-sm",
              config.avatarBgClass
            )}
          >
            {displayInitial}
          </div>
        )}

        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-on-surface leading-tight max-w-[140px] truncate">
            {displayName}
          </p>
          <p className="text-[11px] text-on-surface-variant leading-tight">
            {roleLabel}
          </p>
        </div>

        <ChevronDown
          className={cn(
            "h-4 w-4 text-on-surface-variant transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 rounded-xl border border-outline-variant bg-surface-container-lowest shadow-lg overflow-hidden animate-fade-in"
        >
          <div className="px-4 py-3 border-b border-outline-variant bg-surface-container">
            <p className="text-sm font-medium text-on-surface truncate">
              {displayName}
            </p>
            <p className="text-xs text-on-surface-variant truncate">{email}</p>
            <p className="mt-1 text-[11px] text-on-surface-variant">
              {t("userMenu.signedInAs")}{" "}
              <span className="font-medium text-on-surface">{roleLabel}</span>
            </p>
            {error && (
              <p className="mt-1 flex items-center gap-1 text-[11px] text-error">
                <AlertCircle className="h-3 w-3" />
                {t("userMenu.accountInfoSubtitle")
                  .replace("View", "Could not load")
                  .replace("Xem", "Không tải được")}
              </p>
            )}
          </div>

          <button
            role="menuitem"
            onClick={handleAccountInfo}
            className="w-full flex items-center gap-sm px-4 py-3 text-sm text-on-surface hover:bg-surface-container transition-colors"
          >
            <UserIcon className="h-4 w-4 text-on-surface-variant" />
            <div className="flex flex-col items-start">
              <span className="font-medium">{t("userMenu.accountInfo")}</span>
              <span className="text-[11px] text-on-surface-variant">
                {t("userMenu.accountInfoSubtitle")}
              </span>
            </div>
          </button>

          <button
            role="menuitem"
            onClick={handleLogout}
            className="w-full flex items-center gap-sm px-4 py-3 text-sm text-error hover:bg-error-container transition-colors border-t border-outline-variant"
          >
            <LogOut className="h-4 w-4" />
            <span className="font-medium">{t("userMenu.logout")}</span>
          </button>
        </div>
      )}
    </div>
  )
}
