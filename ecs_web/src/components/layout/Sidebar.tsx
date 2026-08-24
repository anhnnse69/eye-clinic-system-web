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
  Home,
  MessageSquare,
  ArrowLeft,
  ChevronLeft,
  Building2,
  DoorOpen,
  Briefcase,
  Star,
  UserPlus,
  FileCheck,
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
  Home,
  MessageSquare,
  ArrowLeft,
  ChevronLeft,
  Building2,
  DoorOpen,
  Briefcase,
  Star,
  UserPlus,
  FileCheck,
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

const LOGO_IMG = "https://lh3.googleusercontent.com/aida-public/AB6AXuCwR5I14Ti14lR3BYE4S0RtQO-d8r8udA0haqFhxTaWQ9yQ-jmxbSRgYSkcBkNwuYRPxAbe8JXfK0F1YyrjzCFly6Lq3OZKEvx1ur-E7AyiXkpaXAzTA7fU0BJWAs3bleQjIy9M4iQHcccCFbjJuDPzFrUn_bu0p0mQxPoyXF7BOJMQYc0C1GCWXA0JfldNcZ4O0CzfxkpvbMhmEFf6B_IaHns3GgbAB4_djZJGV8mIcaRS8VLHh7-bKrri-dHqeG15ux8Eq6zGs31k"

export function Sidebar({
  sections,
  logo,
  role,
  copyrightText,
  homeHref,
  homeLabel,
}: {
  sections: NavSection[]
  logo: string
  role: string
  copyrightText: string
  homeHref?: string
  homeLabel?: string
}) {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-surface-container-lowest border-r border-outline-variant flex flex-col h-screen sticky top-0">
      <div className="px-4 py-4 border-b border-outline-variant">
        {homeHref ? (
          <Link href={homeHref} className="flex items-center gap-3 group">
            <img
              src={LOGO_IMG}
              alt="Eye Clinic Support System Logo"
              className="h-10 w-10 object-contain shrink-0 group-hover:scale-105 transition-transform"
            />
            <div>
              <p className="font-extrabold text-sm text-on-surface leading-tight group-hover:text-primary transition-colors">
                {logo}
              </p>
              <p className="text-xs font-bold text-primary mt-0.5">{role}</p>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <img
              src={LOGO_IMG}
              alt="Eye Clinic Support System Logo"
              className="h-10 w-10 object-contain shrink-0"
            />
            <div>
              <p className="font-extrabold text-sm text-on-surface leading-tight">
                {logo}
              </p>
              <p className="text-xs font-bold text-primary mt-0.5">{role}</p>
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-md px-sm">
        {homeHref && (
          <div className="mb-md px-xs">
            <Link
              href={homeHref}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200/80 shadow-xs transition-all active:scale-95"
            >
              <Home className="w-4 h-4 text-blue-600" />
              <span>{homeLabel || "Về trang chủ"}</span>
            </Link>
          </div>
        )}
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
