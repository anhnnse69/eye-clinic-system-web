"use client"

import { Menu } from "lucide-react"
import { useShell } from "./ShellProvider"

export interface TopBarProps {
  title: string
  onMenuClick?: () => void
}

export function TopBar({ title, onMenuClick }: TopBarProps) {
  const { setSidebarOpen } = useShell()
  return (
    <header className="bg-surface-container-lowest border-b border-outline-variant sticky top-0 z-40">
      <div className="px-gutter py-md flex items-center justify-between gap-md">
        <div className="flex items-center gap-sm">
          <button
            onClick={() => {
              setSidebarOpen(false)
              onMenuClick?.()
            }}
            className="md:hidden h-10 w-10 rounded-lg hover:bg-surface-container flex items-center justify-center"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 text-on-surface-variant" />
          </button>
          <h1 className="text-headline-md font-headline-md text-on-surface">{title}</h1>
        </div>
      </div>
    </header>
  )
}
