"use client"

import { ShellProvider } from "@/components/layout/ShellProvider"

export function Providers({ children }: { children: React.ReactNode }) {
  return <ShellProvider>{children}</ShellProvider>
}
