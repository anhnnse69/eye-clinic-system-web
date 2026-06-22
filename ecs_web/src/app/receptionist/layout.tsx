import { redirect } from "next/navigation"
import { Sidebar, type NavSection } from "@/components/layout/Sidebar"
import DashboardHeader from "@/components/layout/DashboardHeader"
import { authService } from "@/services/auth.service"
import { cookies } from "next/headers"

export default async function ReceptionistLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value

  if (!token) {
    redirect("/login")
  }

  const decodedToken = authService.decodeToken(token)
  
  if (!decodedToken) {
    redirect("/login")
  }

  const role = decodedToken.role ||
    (decodedToken as unknown as Record<string, string>)["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
    ""

  if (role !== "RECEPTIONIST") {
    redirect("/login")
  }

  const sections: NavSection[] = [
    {
      title: "Tổng quan",
      items: [
        { label: "Lịch hẹn hàng ngày", href: "/receptionist/appointments", icon: "CalendarDays" },
        { label: "Khung giờ trống", href: "/receptionist/available-slots", icon: "Clock" },
      ],
    },
    {
      title: "Quản lý",
      items: [
        { label: "Danh sách bệnh nhân", href: "/receptionist/patients", icon: "Users" },
        { label: "Đăng ký vãng lai", href: "/receptionist/walk-in-registration", icon: "UserPlus" }, // <--- THÊM MỤC MỚI VÀO ĐÂY
      ],
    },
    {
      title: "Cá nhân",
      items: [
        { label: "Hồ sơ cá nhân", href: "/receptionist/profile", icon: "User" },
        { label: "Thông tin tài khoản", href: "/receptionist/account-info", icon: "User" },
      ],
    },
  ]

  const userName = decodedToken.FullName || decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || "Lễ tân"
  const userEmail = decodedToken.email || decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || ""

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar sections={sections} logo="Eye Clinic Support System" role="Lễ tân" />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader
          title="Lễ tân"
          accountInfoHref="/receptionist/account-info"
          user={{
            name: userName,
            email: userEmail,
            role: "Lễ tân",
            avatar: null,
          }}
        />
        <main className="flex-1 p-gutter overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}