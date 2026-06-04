import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Sidebar, type NavSection } from "@/components/layout/Sidebar"
import DashboardHeader from "@/components/layout/DashboardHeader"
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  Shield,
  Activity,
} from "lucide-react"

export default async function SystemAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const sections: NavSection[] = [
    {
      title: "Tổng quan",
      items: [
        { label: "Dashboard", href: "/system-admin/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      title: "Phòng khám",
      items: [
        { label: "Đơn đăng ký", href: "/system-admin/applications", icon: FileText },
        { label: "Danh sách phòng khám", href: "/system-admin/clinics", icon: Building2 },
      ],
    },
    {
      title: "Tài khoản",
      items: [
        { label: "Danh sách tài khoản", href: "/system-admin/accounts", icon: Users },
      ],
    },
    {
      title: "Hệ thống",
      items: [
        { label: "Nhật ký hoạt động", href: "/system-admin/audit-logs", icon: Activity },
        { label: "Bảo mật", href: "/system-admin/security", icon: Shield },
      ],
    },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar sections={sections} logo="OcularLink" role="Quản trị hệ thống" />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader
          title="Quản trị hệ thống"
          user={{
            name: session.user.name || "Admin",
            email: session.user.email || "",
            role: "Quản trị hệ thống",
            avatar: session.user.avatar,
          }}
        />
        <main className="flex-1 p-gutter overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
