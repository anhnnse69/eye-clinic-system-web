"use client"

import { Menu, Bell, LogOut } from "lucide-react"
import { useShell } from "./ShellProvider"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { authService } from "@/services/auth.service"

export interface DashboardHeaderProps {
  title: string
  user: {
    name: string
    email: string
    role: string
    avatar?: string | null
  }
}

export default function DashboardHeader({ title, user }: DashboardHeaderProps) {
  const { setSidebarOpen } = useShell()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    if (isLoggingOut) return
    
    setIsLoggingOut(true)
    try {
      // Clear server-side cookie
      await fetch("/api/auth/logout", { method: "POST" })
      
      // Clear client-side storage
      authService.clearAuth()
      
      // Redirect to login page
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
      // Still clear local storage even if API fails
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
          <div className="flex items-center gap-sm">
            <div className="h-9 w-9 rounded-full bg-primary text-primary-contrast flex items-center justify-center font-medium text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-on-surface">{user.name}</p>
              <p className="text-xs text-on-surface-variant">{user.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="h-10 w-10 rounded-lg hover:bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-error transition-colors"
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
