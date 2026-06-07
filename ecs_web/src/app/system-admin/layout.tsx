import { redirect } from "next/navigation"
import { Sidebar, type NavSection } from "@/components/layout/Sidebar"
import DashboardHeader from "@/components/layout/DashboardHeader"
import { authService } from "@/services/auth.service"
import { cookies } from "next/headers"

export default async function SystemAdminLayout({ children }: { children: React.ReactNode }) {
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

  if (role !== "SYSTEM_ADMIN") {
    const roleMapping: Record<string, string> = {
      CLINIC_ADMIN: "/clinic-admin/dashboard",
      DOCTOR: "/doctor/dashboard",
      RECEPTIONIST: "/receptionist/dashboard",
      PATIENT: "/patient/dashboard",
    }
    redirect(roleMapping[role] || "/login")
  }

  const sections: NavSection[] = [
    {
      title: "Tổng quan",
      items: [
        { label: "Dashboard", href: "/system-admin/dashboard", icon: "LayoutDashboard" },
      ],
    },
    {
      title: "Phòng khám",
      items: [
        { label: "Đơn đăng ký", href: "/system-admin/applications", icon: "FileText" },
        { label: "Danh sách phòng khám", href: "/system-admin/clinics", icon: "Building2" },
      ],
    },
    {
      title: "Tài khoản",
      items: [
        { label: "Danh sách tài khoản", href: "/system-admin/accounts", icon: "Users" },
      ],
    },
    {
      title: "Hệ thống",
      items: [
        { label: "Nhật ký hoạt động", href: "/system-admin/audit-logs", icon: "Activity" },
        { label: "Bảo mật", href: "/system-admin/security", icon: "Shield" },
      ],
    },
  ]

  const userName = decodedToken.FullName || decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || "Admin"
  const userEmail = decodedToken.email || decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || ""

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar sections={sections} logo="Eye Clinic Support System" role="Quản trị hệ thống" />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader
          title="Quản trị hệ thống"
          user={{
            name: userName,
            email: userEmail,
            role: "Quản trị hệ thống",
            avatar: null,
          }}
        />
        <main className="flex-1 p-gutter overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
