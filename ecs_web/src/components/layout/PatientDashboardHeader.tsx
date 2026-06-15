"use client"

import { useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { useRouter } from "next/navigation"
import { Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAccountInfo } from "@/hooks/useAccountInfo"
import { authService } from "@/services/auth.service"
import { ROLE_CONFIG } from "@/lib/role-config"

interface PatientDashboardHeaderProps {
  className?: string
}

export default function PatientDashboardHeader({ className }: PatientDashboardHeaderProps) {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations("common")

  const [menuOpen, setMenuOpen] = useState(false)

  const isAuthenticated = authService.isAuthenticated()
  const userFromStorage = authService.getUser()
  const { account, isLoading, error } = useAccountInfo({ enabled: isAuthenticated })

  const effectiveRole = account?.role || userFromStorage?.role || "PATIENT"
  const roleKey = (effectiveRole as string) === "SYSTEM_ADMIN" ? "ADMIN" : effectiveRole
  const config = ROLE_CONFIG[roleKey as keyof typeof ROLE_CONFIG] || ROLE_CONFIG.PATIENT

  const displayName = account?.fullName || userFromStorage?.name || t("userMenu.patient")
  const displayInitial = displayName.charAt(0).toUpperCase()
  const avatarUrl = account?.avatarUrl

  const toggleLang = () => {
    const next = locale === "vi" ? "en" : "vi"
    const pathname = window.location.pathname.replace(/^\/(vi|en)/, `/${next}`)
    router.replace(pathname || `/${next}/home`)
  }

  return (
    <header className={cn("bg-surface-container-lowest border-b border-outline-variant", className)}>
      <div className="px-gutter py-md flex items-center justify-between gap-md">
        <div className="flex items-center gap-sm">
          <img
            alt="Eye Clinic Support System Logo"
            className="h-8 w-8 object-contain"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwR5I14Ti14lR3BYE4S0RtQO-d8r8udA0haqFhxTaWQ9yQ-jmxbSRgYSkcBkNwuYRPxAbe8JXfK0F1YyrjzCFly6Lq3OZKEvx1ur-E7AyiXkpaXAzTA7fU0BJWAs3bleQjIy9M4iQHcccCFbjJuDPzFrUn_bu0p0mQxPoyXF7BOJMQYc0C1GCWXA0JfldNcZ4O0CzfxkpvbMhmEFf6B_IaHns3GgbAB4_djZJGV8mIcaRS8VLHh7-bKrri-dHqeG15ux8Eq6zGs31k"
          />
          <span className="text-headline-sm font-headline-sm font-bold text-primary">
            {t("brand")}
          </span>
        </div>

        <div className="flex items-center gap-md">
          <button
            onClick={toggleLang}
            className="hidden md:flex items-center gap-1 px-lg py-sm text-label-md font-label-md text-on-surface-variant border border-outline-variant rounded hover:bg-surface-container transition-colors"
            title={locale === "vi" ? "Switch to English" : "Chuyển sang Tiếng Việt"}
          >
            <Globe className="h-4 w-4" />
            {locale === "vi" ? "EN" : "VI"}
          </button>

          {isAuthenticated && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex items-center gap-sm px-2 py-1 rounded-full hover:bg-surface-container transition-colors"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                {isLoading ? (
                  <div className="h-8 w-8 rounded-full bg-surface-container flex items-center justify-center">
                    <span className="text-[11px] text-on-surface-variant">...</span>
                  </div>
                ) : avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="h-8 w-8 rounded-full object-cover border border-outline-variant"
                  />
                ) : (
                  <div
                    className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center font-medium text-xs",
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
                    {config.label}
                  </p>
                </div>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-outline-variant bg-surface-container-lowest shadow-lg py-2">
                  <div className="px-4 py-2 border-b border-outline-variant">
                    <p className="text-sm font-medium text-on-surface truncate">{displayName}</p>
                    <p className="text-xs text-on-surface-variant truncate">
                      {account?.email || userFromStorage?.email || ""}
                    </p>
                  </div>
                  <a
                    href={`/${locale}/patient/account-info`}
                    className="flex items-center gap-sm px-4 py-2 text-sm text-on-surface hover:bg-surface-container transition-colors"
                  >
                    <span>{t("userMenu.accountInfo")}</span>
                  </a>
                  <button
                    onClick={() => {
                      authService.clearAuth()
                      router.push(`/${locale}/home`)
                      router.refresh()
                    }}
                    className="w-full flex items-center gap-sm px-4 py-2 text-sm text-error hover:bg-error-container transition-colors"
                  >
                    <span>{t("userMenu.logout")}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
