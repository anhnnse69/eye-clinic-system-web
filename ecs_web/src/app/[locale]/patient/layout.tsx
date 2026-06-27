import { redirect } from "next/navigation"
import { Sidebar, type NavSection } from "@/components/layout/Sidebar"
import { authService } from "@/services/auth.service"
import { cookies } from "next/headers"
import { Bell } from "lucide-react";

export default async function PatientLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value

  if (!token) {
    redirect(`/${locale}/login`)
  }

  const decodedToken = authService.decodeToken(token)

  if (!decodedToken) {
    redirect(`/${locale}/login`)
  }

  const role =
    decodedToken.role ||
    (decodedToken as unknown as Record<string, string>)["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
    ""

  if (role !== "PATIENT") {
    const roleMapping: Record<string, string> = {
      SYSTEM_ADMIN: "/system-admin/dashboard",
      CLINIC_ADMIN: "/clinic-admin/dashboard",
      DOCTOR: "/doctor/dashboard",
      RECEPTIONIST: "/receptionist/appointments",
    }
    redirect(roleMapping[role] || `/${locale}/login`)
  }

  const sections: NavSection[] = [
    {
      title: "Cá nhân",
      items: [
        { label: "Trang chủ", href: `/${locale}/home`, icon: "Home" },
        { label: "Thông Báo", href: `/${locale}/patient/notifications`, icon: "Bell" },
        { label: "Thông tin tài khoản", href: `/${locale}/patient/account-info`, icon: "User" },
        { label: "Đổi mật khẩu", href: `/${locale}/patient/change-password`, icon: "Key" },
        { label: "Hồ sơ bệnh nhân", href: `/${locale}/patient/profiles`, icon: "User" },
      ],
    },
    {
      title: "Lịch sử",
      items: [
        { label: "Lịch hẹn", href: "/patient/appointment-history", icon: "Calendar" },
        { label: "Phản hồi", href: "/patient/feedback-history", icon: "MessageSquare" },
      ],
    }
  ]

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar sections={sections} logo="Eye Clinic Support System" role="Bệnh nhân" />
      <main className="flex-1 p-gutter overflow-y-auto">{children}</main>
    </div>
  )
}
