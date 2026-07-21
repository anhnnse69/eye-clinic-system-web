"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Calendar,
  Clock,
  Users,
  FileText,
  Stethoscope,
  ClipboardList,
  Image as ImageIcon,
  Pill,
  User,
  UserCog,
  CalendarDays,
} from "lucide-react"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  Clock,
  Users,
  FileText,
  Stethoscope,
  ClipboardList,
  ImageIcon,
  Pill,
  User,
  UserCog,
}

export interface NavItem {
  label: string
  href: string
  icon: string
}

export interface NavSection {
  title?: string
  items: NavItem[]
}

export function Sidebar({
  sections,
  logo,
  role,
  copyrightText,
}: {
  sections: NavSection[]
  logo: string
  role: string
  copyrightText: string
}) {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-surface-container-lowest border-r border-outline-variant flex flex-col h-screen sticky top-0">
      <div className="px-gutter py-lg border-b border-outline-variant">
        <div className="flex items-center gap-sm">
          <div className="h-10 w-10 rounded-lg bg-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">visibility</span>
          </div>
          <div>
            <p className="text-headline-sm font-headline-sm text-on-surface leading-none">{logo}</p>
            <p className="text-label-sm font-label-sm text-primary mt-1">{role}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-md px-sm">
        {sections.map((section, idx) => (
          <div key={idx} className="mb-lg">
            {section.title && (
              <h4 className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider px-md mb-sm">
                {section.title}
              </h4>
            )}
            <ul className="space-y-xs">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                const Icon = iconMap[item.icon] || LayoutDashboard
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-sm px-md py-sm rounded-lg transition-colors ${
                        isActive
                          ? "bg-primary-container text-primary font-semibold"
                          : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-body-md font-body-md">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="px-gutter py-md border-t border-outline-variant">
        <p className="text-label-sm font-label-sm text-on-surface-variant">
          {copyrightText}
        </p>
      </div>
    </aside>
  )
}
