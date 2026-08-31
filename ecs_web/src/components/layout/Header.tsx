"use client"

import { useTranslations, useLocale } from "next-intl"
import { useRouter } from "next/navigation"
import HomeUserMenu from "@/components/home/HomeUserMenu"
import { cn } from "@/lib/utils"

const LOGO_IMG = "https://lh3.googleusercontent.com/aida-public/AB6AXuCwR5I14Ti14lR3BYE4S0RtQO-d8r8udA0haqFhxTaWQ9yQ-jmxbSRgYSkcBkNwuYRPxAbe8JXfK0F1YyrjzCFly6Lq3OZKEvx1ur-E7AyiXkpaXAzTA7fU0BJWAs3bleQjIy9M4iQHcccCFbjJuDPzFrUn_bu0p0mQxPoyXF7BOJMQYc0C1GCWXA0JfldNcZ4O0CzfxkpvbMhmEFf6B_IaHns3GgbAB4_djZJGV8mIcaRS8VLHh7-bKrri-dHqeG15ux8Eq6zGs31k"

interface HeaderProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  searchTab: "clinics" | "doctors"
  setSearchTab: (tab: "clinics" | "doctors") => void
  handleSearch: (e: React.FormEvent) => void
}

export default function Header({
  searchQuery,
  setSearchQuery,
  searchTab,
  setSearchTab,
  handleSearch,
}: HeaderProps) {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()

  const toggleLang = () => {
    const next = locale === "vi" ? "en" : "vi"
    localStorage.setItem("locale", next)
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000`

    const currentPath = window.location.pathname
    if (/^\/(vi|en)(\/|$)/.test(currentPath)) {
      const newPath = currentPath.replace(/^\/(vi|en)/, `/${next}`) + window.location.search
      // router.replace alone does NOT re-mount NextIntlClientProvider in the root
      // layout, so client components like <Footer /> keep the stale locale and
      // their useTranslations() lookups never re-run. A full reload forces the
      // root layout to re-render with the new messages so Header, Footer and
      // every other client component reflect the new language immediately.
      window.location.href = newPath
    } else {
      document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000`
      window.location.reload()
    }
  }

  return (
    <>
      {/* Sửa lại selector để KHÔNG đè font của icon Google gây lỗi hiển thị chữ "earc" */}
      <style>{`
        .vn-font-compatibility, .vn-font-compatibility *:not(.material-symbols-outlined) {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        }
      `}</style>

      <header className="vn-font-compatibility bg-surface-container-lowest sticky top-0 z-50 border-b border-outline-variant shadow-sm w-full">
        <nav className="flex items-center w-full px-4 md:px-8 max-w-7xl mx-auto h-20 gap-4">
          
          {/* ── 1. KHỐI TRÁI: Logo & Brand ── */}
          <button
            type="button"
            onClick={() => router.push(`/${locale}/home`)}
            className="flex items-center gap-2 shrink-0 hover:opacity-90 transition-opacity"
          >
            <img alt="Eye Clinic Support System Logo" className="h-10 w-10 object-contain" src={LOGO_IMG} />
            <span className="text-lg font-bold text-primary hidden xl:inline-block whitespace-nowrap">
              {t("common.brand")}
            </span>
          </button>

          {/* ── 2. KHỐI GIỮA: Thanh Search thoải mái co giãn rộng rãi ── */}
          <div className="hidden md:flex flex-1 min-w-[280px] max-w-[520px] mx-4">
            <form 
              onSubmit={handleSearch} 
              className="relative flex items-center w-full gap-2 p-1 bg-white border border-outline-variant rounded-xl shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all h-10"
            >
              {/* Tab chuyển đổi */}
              <div className="flex bg-slate-100 rounded-lg p-0.5 shrink-0 border border-slate-200/40 relative overflow-hidden">
                <div
                  onClick={() => setSearchTab("clinics")}
                  className={cn(
                    "relative z-10 px-3 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer select-none text-center whitespace-nowrap",
                    searchTab === "clinics" ? "bg-primary text-white shadow-sm" : "text-slate-500 hover:text-primary"
                  )}
                >
                  {locale === "vi" ? "Phòng khám" : "Clinic"}
                </div>
                <div
                  onClick={() => setSearchTab("doctors")}
                  className={cn(
                    "relative z-10 px-3 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer select-none text-center whitespace-nowrap",
                    searchTab === "doctors" ? "bg-primary text-white shadow-sm" : "text-slate-500 hover:text-primary"
                  )}
                >
                  {locale === "vi" ? "Bác sĩ" : "Doctor"}
                </div>
              </div>

              <div className="h-4 w-[1px] bg-slate-200 shrink-0" />

              {/* Ô nhập input chữ */}
              <div className="relative flex-1 h-full min-w-0">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={locale === "vi" ? "Tìm kiếm..." : "Search..."}
                  className="w-full px-2 text-xs lg:text-sm bg-transparent outline-none border-none placeholder-slate-400 text-slate-700 h-full"
                />
              </div>

              {/* Nút submit ngầm để gõ Enter vẫn ăn lệnh tìm kiếm */}
              <button type="submit" className="hidden" />

              {/* Dùng thẻ div thay button để triệt tiêu hoàn toàn CSS rác gây lệch viền, hiển thị icon chuẩn xác */}
              <div
                onClick={(e) => {
                  const form = e.currentTarget.closest("form");
                  if (form) form.requestSubmit();
                }}
                className="h-8 w-8 flex items-center justify-center bg-primary text-white rounded-lg hover:opacity-90 active:scale-95 transition-all shrink-0 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] block">search</span>
              </div>
            </form>
          </div>

          {/* ── 3. KHỐI PHẢI: Toàn bộ Menu chữ & User Profile ── */}
          <div className="flex items-center gap-3 lg:gap-5 ml-auto shrink-0">
            
            {/* Menu chữ điều hướng */}
            <div className="hidden lg:flex items-center gap-4 border-r border-outline-variant pr-4">
              <a 
                className="text-on-surface-variant font-medium text-sm hover:text-primary transition-colors whitespace-nowrap" 
                href={`/${locale}/register-clinic-application`}
              >
                {t("common.nav.partners")}
              </a>
            </div>

            {/* Nút Ngôn ngữ */}
            <button
              onClick={toggleLang}
              className="hidden sm:block px-3 py-1.5 text-xs font-bold text-on-surface-variant border border-outline-variant rounded-xl hover:bg-surface-container transition-colors shrink-0"
            >
              {locale === "vi" ? "EN" : "VI"}
            </button>
            
            {/* Khối User Menu */}
            <div className="shrink-0">
              <HomeUserMenu />
            </div>
            
            {/* Nút Menu Mobile */}
            <button className="lg:hidden text-on-surface-variant flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[28px]">menu</span>
            </button>
          </div>

        </nav>
      </header>
    </>
  )
}