"use client"

import { Menu, Bell, LogOut, User as UserIcon, ChevronDown } from "lucide-react"
import { useShell } from "./ShellProvider"
import { useRouter } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { authService } from "@/services/auth.service"

export interface DashboardHeaderProps {
  title: string
  user: {
    name: string
    email: string
    role: string
    avatar?: string | null
  }
  accountInfoHref?: string
}

export default function DashboardHeader({ title, user, accountInfoHref }: DashboardHeaderProps) {
  const { setSidebarOpen } = useShell()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!dropdownOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [dropdownOpen])

  const handleAccountInfo = () => {
    setDropdownOpen(false)
    if (accountInfoHref) {
      router.push(accountInfoHref)
    }
  }

  const handleLogout = async () => {
    if (isLoggingOut) return

    setIsLoggingOut(true)
    try {
      await fetch("/api/auth/logout", { method: "POST" })

      authService.clearAuth()

      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
      authService.clearAuth()
      router.push("/login")
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="bg-surface-container-lowest border-b border-outline-variant sticky top-0 z-40">
      <div className="px-gutter py-md flex items-center justify-between gap-md">
        <div className="flex items-center gap-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden h-10 w-10 rounded-lg hover:bg-surface-container flex items-center justify-center"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 text-on-surface-variant" />
          </button>
          <h1 className="text-headline-md font-headline-md text-on-surface">{title}</h1>
        </div>
        <div className="flex items-center gap-md">
          <button className="relative h-10 w-10 rounded-lg hover:bg-surface-container flex items-center justify-center">
            <Bell className="h-5 w-5 text-on-surface-variant" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-error"></span>
          </button>
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-sm px-2 py-1 rounded-lg hover:bg-surface-container transition-colors"
              aria-haspopup="menu"
              aria-expanded={dropdownOpen}
            >
              <div className="h-9 w-9 rounded-full bg-primary text-primary-contrast flex items-center justify-center font-medium text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-on-surface leading-tight">{user.name}</p>
                <p className="text-xs text-on-surface-variant leading-tight">{user.role}</p>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-on-surface-variant transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {dropdownOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-64 rounded-xl border border-outline-variant bg-surface-container-lowest shadow-lg overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-outline-variant bg-surface-container">
                  <p className="text-sm font-medium text-on-surface truncate">{user.name}</p>
                  <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
                </div>

                {accountInfoHref && (
                  <button
                    role="menuitem"
                    onClick={handleAccountInfo}
                    className="w-full flex items-center gap-sm px-4 py-3 text-sm text-on-surface hover:bg-surface-container transition-colors"
                  >
                    <UserIcon className="h-4 w-4 text-on-surface-variant" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Thông tin tài khoản</span>
                      <span className="text-[11px] text-on-surface-variant">Xem và cập nhật thông tin cá nhân</span>
                    </div>
                  </button>
                )}

                <button
                  role="menuitem"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className={`w-full flex items-center gap-sm px-4 py-3 text-sm text-error hover:bg-error-container transition-colors ${accountInfoHref ? "border-t border-outline-variant" : ""}`}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="font-medium">Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
