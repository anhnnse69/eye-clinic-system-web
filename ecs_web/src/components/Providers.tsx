"use client"

import { SessionProvider } from "next-auth/react"
import { ShellProvider } from "@/components/layout/ShellProvider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ShellProvider>{children}</ShellProvider>
    </SessionProvider>
  )
}
