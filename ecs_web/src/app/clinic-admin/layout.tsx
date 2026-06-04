import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Sidebar, type NavSection } from "@/components/layout/Sidebar"
import DashboardHeader from "@/components/layout/DashboardHeader"
import {
  LayoutDashboard,
  Building2,
  Users,
  Pill,
  Briefcase,
  DoorOpen,
  Star,
  Settings,
  Calendar,
  Stethoscope,
} from "lucide-react"

export default async function ClinicAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const sections: NavSection[] = [
    {
      title: "Tổng quan",
      items: [
        { label: "Dashboard", href: "/clinic-admin/dashboard", icon: LayoutDashboard },
        { label: "Hồ sơ phòng khám", href: "/clinic-admin/profile", icon: Building2 },
      ],
    },
    {
      title: "Vận hành",
      items: [
        { label: "Lịch hẹn", href: "/clinic-admin/appointments", icon: Calendar },
        { label: "Hàng đợi", href: "/clinic-admin/queue", icon: Stethoscope },
        { label: "Phòng khám", href: "/clinic-admin/rooms", icon: DoorOpen },
      ],
    },
    {
      title: "Quản lý",
      items: [
        { label: "Nhân viên", href: "/clinic-admin/staff", icon: Users },
        { label: "Dịch vụ", href: "/clinic-admin/services", icon: Briefcase },
        { label: "Danh mục thuốc", href: "/clinic-admin/medicines", icon: Pill },
      ],
    },
    {
      title: "Khác",
      items: [
        { label: "Đánh giá", href: "/clinic-admin/feedback", icon: Star },
        { label: "Cài đặt", href: "/clinic-admin/settings", icon: Settings },
      ],
    },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar sections={sections} logo="OcularLink" role="Quản lý PK" />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader
          title="Quản lý Phòng khám"
          user={{
            name: session.user.name || "Quản lý",
            email: session.user.email || "",
            role: "Quản lý Phòng khám",
            avatar: session.user.avatar,
          }}
        />
        <main className="flex-1 p-gutter overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
