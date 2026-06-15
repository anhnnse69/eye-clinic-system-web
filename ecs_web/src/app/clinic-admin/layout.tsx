import { redirect } from "next/navigation"
import { Sidebar, type NavSection } from "@/components/layout/Sidebar"
import DashboardHeader from "@/components/layout/DashboardHeader"
import { authService } from "@/services/auth.service"
import { cookies } from "next/headers"

export default async function ClinicAdminLayout({ children }: { children: React.ReactNode }) {
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

  if (role !== "CLINIC_ADMIN") {
    redirect("/login")
  }

  const sections: NavSection[] = [
    {
      title: "Tổng quan",
      items: [
        { label: "Dashboard", href: "/clinic-admin/dashboard", icon: "LayoutDashboard" },
        { label: "Hồ sơ phòng khám", href: "/clinic-admin/profile", icon: "Building2" },
      ],
    },
    {
      title: "Vận hành",
      items: [
        { label: "Lịch hẹn", href: "/clinic-admin/appointment", icon: "Calendar" },
        { label: "Hàng đợi", href: "/clinic-admin/queue", icon: "Stethoscope" },
        { label: "Phòng khám", href: "/clinic-admin/rooms", icon: "DoorOpen" },
      ],
    },
    {
      title: "Quản lý",
      items: [
        { label: "Nhân viên", href: "/clinic-admin/staff", icon: "Users" },
        { label: "Dịch vụ", href: "/clinic-admin/services", icon: "Briefcase" },
        { label: "Danh mục thuốc", href: "/clinic-admin/medicines", icon: "Pill" },
      ],
    },
    {
      title: "Khác",
      items: [
        { label: "Đánh giá", href: "/clinic-admin/feedback", icon: "Star" },
        { label: "Cài đặt", href: "/clinic-admin/settings", icon: "Settings" },
      ],
    },
    {
      title: "Tài khoản",
      items: [
        { label: "Thông tin tài khoản", href: "/clinic-admin/account-info", icon: "User" },
      ],
    },
  ]

  const userName = decodedToken.FullName || decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || "Quản lý"
  const userEmail = decodedToken.email || decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || ""

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar sections={sections} logo="Eye Clinic Support System" role="Quản lý PK" />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader
          title="Quản lý Phòng khám"
          accountInfoHref="/clinic-admin/account-info"
          user={{
            name: userName,
            email: userEmail,
            role: "Quản lý Phòng khám",
            avatar: null,
          }}
        />
        <main className="flex-1 p-gutter overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
