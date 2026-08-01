"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface ShellContextType {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

const ShellContext = createContext<ShellContextType | undefined>(undefined)

export function ShellProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  return (
    <ShellContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
      {children}
    </ShellContext.Provider>
  )
}

export function useShell() {
  const context = useContext(ShellContext)
  if (!context) {
    throw new Error("useShell must be used within ShellProvider")
  }
  return context
}
