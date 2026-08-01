"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"

export interface NavItemProps {
  label: string
  href: string
  icon: LucideIcon
  isActive?: boolean
  onClick?: () => void
}

export function NavItem({ label, href, icon: Icon, isActive, onClick }: NavItemProps) {
  return (
    <li>
      <Link
        href={href}
        onClick={onClick}
        className={`flex items-center gap-sm px-md py-sm rounded-lg transition-colors ${
          isActive
            ? "bg-primary-container text-primary font-semibold"
            : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
        }`}
      >
        <Icon className="h-5 w-5" />
        <span className="text-body-md font-body-md">{label}</span>
      </Link>
    </li>
  )
}
