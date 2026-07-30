"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Home,
  User,
  Pill,
  Calendar,
  MessageSquare,
  KeyRound,
  ShieldCheck,
  Sparkles,
  CalendarDays,
  Globe,
  PlusCircle,
  FileText
} from "lucide-react"
import { authService } from "@/services/auth.service"
import HomeUserMenu from "@/components/home/HomeUserMenu"

const LOGO_IMG = "https://lh3.googleusercontent.com/aida-public/AB6AXuCwR5I14Ti14lR3BYE4S0RtQO-d8r8udA0haqFhxTaWQ9yQ-jmxbSRgYSkcBkNwuYRPxAbe8JXfK0F1YyrjzCFly6Lq3OZKEvx1ur-E7AyiXkpaXAzTA7fU0BJWAs3bleQjIy9M4iQHcccCFbjJuDPzFrUn_bu0p0mQxPoyXF7BOJMQYc0C1GCWXA0JfldNcZ4O0CzfxkpvbMhmEFf6B_IaHns3GgbAB4_djZJGV8mIcaRS8VLHh7-bKrri-dHqeG15ux8Eq6zGs31k"

interface PatientPortalLayoutClientProps {
  children: React.ReactNode
  locale: string
  userName: string
  email: string
}

export default function PatientPortalLayoutClient({
  children,
  locale,
  userName,
  email
}: PatientPortalLayoutClientProps) {
  const pathname = usePathname()
  const router = useRouter()

  const navTabs = [
    {
      id: "account-info",
      label: "Thông tin tài khoản",
      href: `/${locale}/patient/account-info`,
      icon: User,
    },
    {
      id: "profiles",
      label: "Đơn thuốc & Bệnh án",
      href: `/${locale}/patient/profiles`,
      icon: Pill,
    },
    {
      id: "appointment-history",
      label: "Lịch hẹn khám",
      href: `/${locale}/patient/appointment-history`,
      icon: CalendarDays,
    },
    {
      id: "feedback-history",
      label: "Phản hồi & Đánh giá",
      href: `/${locale}/patient/feedback-history`,
      icon: MessageSquare,
    },
    {
      id: "change-password",
      label: "Đổi mật khẩu",
      href: `/${locale}/patient/change-password`,
      icon: KeyRound,
    },
  ]

  const toggleLang = () => {
    if (locale === "en") {
      localStorage.setItem("locale", "vi")
      router.replace(pathname.replace("/en/", "/vi/"))
    } else {
      localStorage.setItem("locale", "en")
      router.replace(pathname.replace("/vi/", "/en/"))
    }
  }

  // Get user initials for avatar
  const getInitials = (name: string) => {
    if (!name) return "BN"
    const parts = name.trim().split(" ")
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER ĐỒNG BỘ CHÍNH XÁC VỚI TRANG CHỦ (/vi/home)
          ───────────────────────────────────────────────────────────── */}
      <header className="bg-surface-container-lowest border-b border-outline-variant sticky top-0 z-50 shadow-sm w-full">
        <nav className="flex items-center justify-between w-full px-4 md:px-8 max-w-7xl mx-auto h-20 gap-4">
          
          {/* Logo & Tên thương hiệu lấy chuẩn từ trang chủ */}
          <Link href={`/${locale}/home`} className="flex items-center gap-3 shrink-0 group">
            <img
              alt="Eye Clinic Support System Logo"
              className="h-10 w-10 object-contain group-hover:scale-105 transition-transform"
              src={LOGO_IMG}
            />
            <div className="flex flex-col">
              <span className="text-base md:text-lg font-bold text-primary tracking-tight leading-none group-hover:text-blue-700 transition-colors">
                Eye Clinic Support System
              </span>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-1">
                Hệ thống Chăm sóc Mắt Chuyên khoa
              </span>
            </div>
          </Link>

          {/* Menu Điều hướng Khách hàng */}
          <div className="hidden lg:flex items-center gap-6">
            <Link
              href={`/${locale}/home`}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-primary transition-colors"
            >
              <Home className="w-4 h-4 text-primary" />
              <span>Trang chủ</span>
            </Link>
          </div>

          {/* Khối bên phải: Đổi ngôn ngữ + Avatar Dropdown từ Trang chủ */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleLang}
              className="px-2.5 py-1 text-xs font-bold border border-outline-variant rounded-lg hover:bg-slate-100 transition-all text-slate-600 flex items-center gap-1"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{locale === "en" ? "EN" : "VI"}</span>
            </button>

            <HomeUserMenu accountInfoHref={`/${locale}/patient/account-info`} />
          </div>
        </nav>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. BANNER CÁ NHÂN ĐỒNG BỘ THEO PALETTE MÀU TRANG CHỦ
          ───────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-slate-900 via-primary to-indigo-900 text-white relative overflow-hidden border-b border-blue-900/50 shadow-md">
        {/* Ambient Lights */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Thẻ Bệnh nhân */}
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md text-white font-black text-xl sm:text-2xl flex items-center justify-center shadow-lg border-2 border-white/20 shrink-0">
                {getInitials(userName)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    {userName || "Bệnh nhân"}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/15 text-cyan-200 border border-white/20 backdrop-blur-md">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-300" /> Tài khoản Bệnh nhân
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-slate-200">
                  {email || "Chưa cập nhật email"}
                </p>
                <p className="text-[11px] text-blue-100/80 font-medium">
                  Cổng quản lý thông tin & đơn thuốc cá nhân tại Eye Clinic Support System
                </p>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              3. THANH TAB CHUYỂN TRANG CỔNG BỆNH NHÂN (Horizontal Tabs)
              ───────────────────────────────────────────────────────────── */}
          <div className="mt-8 pt-4 border-t border-white/15 overflow-x-auto no-scrollbar">
            <nav className="flex items-center gap-2 min-w-max pb-1">
              {navTabs.map((tab) => {
                const Icon = tab.icon
                const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`)
                return (
                  <Link
                    key={tab.id}
                    href={tab.href}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                      isActive
                        ? "bg-white text-primary shadow-md scale-102 font-black"
                        : "text-slate-200 hover:text-white hover:bg-white/10 font-bold"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-slate-300"}`} />
                    <span>{tab.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. KHU VỰC NỘI DUNG CHÍNH (White Card Container)
          ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-8 min-h-[500px]">
          {children}
        </div>
      </main>

      {/* ─────────────────────────────────────────────────────────────
          5. FOOTER ĐỒNG BỘ VỚI TRANG CHỦ
          ───────────────────────────────────────────────────────────── */}
      <footer className="bg-surface-container-lowest border-t border-outline-variant py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <img alt="Logo" className="w-5 h-5 object-contain" src={LOGO_IMG} />
            <span className="font-bold text-slate-700">Eye Clinic Support System</span>
            <span>— Chăm sóc sức khỏe đôi mắt của bạn</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href={`/${locale}/home`} className="hover:text-primary transition-colors">
              Trang chủ
            </Link>
            <Link href={`/${locale}/patient/account-info`} className="hover:text-primary transition-colors">
              Tài khoản
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
