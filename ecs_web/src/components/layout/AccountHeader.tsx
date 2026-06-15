"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import {
  User as UserIcon,
  ChevronDown,
  LogOut,
  Globe,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAccountInfo } from "@/hooks/useAccountInfo"
import { authService } from "@/services/auth.service"
import { ROLE_CONFIG, getRoleLabel, getRoleSegment } from "@/lib/role-config"

const BRAND_LOGO =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCwR5I14Ti14lR3BYE4S0RtQO-d8r8udA0haqFhxTaWQ9yQ-jmxbSRgYSkcBkNwuYRPxAbe8JXfK0F1YyrjzCFly6Lq3OZKEvx1ur-E7AyiXkpaXAzTA7fU0BJWAs3bleQjIy9M4iQHcccCFbjJuDPzFrUn_bu0p0mQxPoyXF7BOJMQYc0C1GCWXA0JfldNcZ4O0CzfxkpvbMhmEFf6B_IaHns3GgbAB4_djZJGV8mIcaRS8VLHh7-bKrri-dHqeG15ux8Eq6zGs31k"

interface AccountHeaderProps {
  className?: string
}

/**
 * Unified account header used across role-specific layouts (patient, doctor,
 * clinic-admin, system-admin, receptionist).
 *
 *  - Not authenticated: render marketing header (Login / Sign up).
 *  - Authenticated: render avatar + dropdown with Account Info + Logout,
 *    routing the user to that role's account-info page.
 */
export default function AccountHeader({ className }: AccountHeaderProps) {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations()

  const isAuthenticated = authService.isAuthenticated()
  const userFromStorage = authService.getUser()
  const roleFromStorage = userFromStorage?.role

  const { account, isLoading, error } = useAccountInfo({ enabled: isAuthenticated })

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

  const handleLogin = () => router.push(`/${locale}/login`)
  const handleSignUp = () => router.push(`/${locale}/register`)

  const handleToggleLang = () => {
    const next = locale === "vi" ? "en" : "vi"
    localStorage.setItem("locale", next)
    const pathname = window.location.pathname.replace(/^\/(vi|en)/, `/${next}`)
    router.replace(pathname || `/${next}/home`)
  }

  const handleAccountInfo = () => {
    setOpen(false)
    const segment = getRoleSegment(roleFromStorage)
    router.push(`/${locale}/${segment}/account-info`)
  }

  const handleLogout = async () => {
    setOpen(false)
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch {
      // Ignore server-side errors
    } finally {
      authService.clearAuth()
      router.push(`/${locale}/home`)
      router.refresh()
    }
  }

  // Unauthenticated: marketing header
  if (!isAuthenticated) {
    return (
      <header
        className={cn(
          "bg-surface-container-lowest sticky top-0 z-50 border-b border-outline-variant",
          className
        )}
      >
        <nav className="flex justify-between items-center w-full px-gutter max-w-7xl mx-auto h-16">
          <div className="flex items-center gap-sm">
            <img alt="Logo" className="h-12 w-12 object-contain" src={BRAND_LOGO} />
            <span className="text-headline-md font-headline-md font-bold text-primary">
              {t("common.brand")}
            </span>
          </div>

          <div className="flex items-center gap-md">
            <button
              onClick={handleToggleLang}
              className="hidden md:block px-lg py-sm text-label-md font-label-md text-on-surface-variant border border-outline-variant rounded hover:bg-surface-container transition-colors"
              title={locale === "vi" ? "Switch to English" : "Chuyển sang Tiếng Việt"}
            >
              {locale === "vi" ? "EN" : "VI"}
            </button>
            <button
              onClick={handleLogin}
              className="hidden md:block px-lg py-sm font-label-md text-label-md text-primary border border-primary rounded-lg hover:bg-primary-fixed transition-colors"
            >
              {t("common.nav.login")}
            </button>
            <button
              onClick={handleSignUp}
              className="px-lg py-sm font-label-md text-label-md bg-primary text-on-primary rounded-lg shadow-sm hover:opacity-90 active:scale-95 transition-all"
            >
              {t("common.nav.requestDemo")}
            </button>
          </div>
        </nav>
      </header>
    )
  }

  // Authenticated: avatar + dropdown
  // Prefer server data (account), fall back to JWT-derived user from storage
  const effectiveRole = account?.role || roleFromStorage || "PATIENT"
  const roleKey = (effectiveRole as string) === "SYSTEM_ADMIN" ? "ADMIN" : effectiveRole
  const config = ROLE_CONFIG[roleKey as keyof typeof ROLE_CONFIG] || ROLE_CONFIG.PATIENT

  const displayName = account?.fullName || userFromStorage?.name || "User"
  const displayInitial = displayName.charAt(0).toUpperCase()
  const avatarUrl = account?.avatarUrl
  const roleLabel = getRoleLabel(effectiveRole, locale)

  return (
    <header
      className={cn(
        "bg-surface-container-lowest sticky top-0 z-50 border-b border-outline-variant",
        className
      )}
    >
      <nav className="flex justify-between items-center w-full px-gutter max-w-7xl mx-auto h-16">
        <div className="flex items-center gap-sm">
          <img alt="Logo" className="h-12 w-12 object-contain" src={BRAND_LOGO} />
          <span className="text-headline-md font-headline-md font-bold text-primary">
            {t("common.brand")}
          </span>
        </div>

        <div className="flex items-center gap-md">
          <button
            onClick={handleToggleLang}
            className="hidden md:flex items-center gap-1 px-lg py-sm text-label-md font-label-md text-on-surface-variant border border-outline-variant rounded hover:bg-surface-container transition-colors"
            title={locale === "vi" ? "Switch to English" : "Chuyển sang Tiếng Việt"}
          >
            <Globe className="h-4 w-4" />
            {locale === "vi" ? "EN" : "VI"}
          </button>

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
                <p className="text-sm font-medium text-on-surface leading-tight max-w-[120px] truncate">
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
                  <p className="text-xs text-on-surface-variant truncate">
                    {account?.email || userFromStorage?.email}
                  </p>
                  {error && (
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-error">
                      <AlertCircle className="h-3 w-3" />
                      {locale === "vi"
                        ? "Không tải được thông tin tài khoản"
                        : "Failed to load account info"}
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
                    <span className="font-medium">
                      {locale === "vi" ? "Thông tin tài khoản" : "Account Info"}
                    </span>
                    <span className="text-[11px] text-on-surface-variant">
                      {locale === "vi"
                        ? "Xem và cập nhật thông tin cá nhân"
                        : "View and update your details"}
                    </span>
                  </div>
                </button>

                <button
                  role="menuitem"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-sm px-4 py-3 text-sm text-error hover:bg-error-container transition-colors border-t border-outline-variant"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="font-medium">
                    {locale === "vi" ? "Đăng xuất" : "Log out"}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}
